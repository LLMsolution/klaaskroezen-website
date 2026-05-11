import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Internal query to get pending order details for payment creation.
 */
export const getPendingOrder = internalQuery({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

/**
 * Link Mollie payment ID to pending order.
 */
export const linkMolliePayment = internalMutation({
  args: {
    orderId: v.id("pendingOrders"),
    molliePaymentId: v.string(),
  },
  handler: async (ctx, { orderId, molliePaymentId }) => {
    await ctx.db.patch(orderId, { molliePaymentId });
  },
});

/**
 * Process a successful payment (called from Mollie webhook handler).
 * Creates the purchase record, generates invoice, triggers confirmation email,
 * and grants access rights.
 */
export const processSuccessfulPayment = internalMutation({
  args: {
    molliePaymentId: v.string(),
    amountCents: v.number(),
    pendingOrderId: v.id("pendingOrders"),
  },
  handler: async (ctx, { molliePaymentId, amountCents, pendingOrderId }) => {
    const order = await ctx.db.get(pendingOrderId);
    if (!order) throw new Error("Pending order not found");
    if (order.convertedAt) return; // Already processed

    // Look up product type from DB
    const productData = await ctx.db
      .query("checkoutProducts")
      .withIndex("by_slug", (q) => q.eq("slug", order.product))
      .first();
    const productType = productData?.productType ?? getProductTypeFallback(order.product);

    const now = Date.now();

    // 1. Create or find user by email for access rights
    let userId = order.userId;
    if (!userId) {
      // Find existing user by email via authAccounts
      const accounts = await ctx.db.query("authAccounts").collect();
      const match = accounts.find(
        (a: any) => a.providerAccountId?.toLowerCase() === order.email.toLowerCase(),
      );
      if (match) userId = match.userId;
    }

    // 2. Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      userId,
      buyerEmail: order.email,
      product: order.product,
      productType,
      amount: amountCents,
      currency: "EUR",
      molliePaymentId,
      status: "paid",
      createdAt: now,
      paidAt: now,
    });

    // 2. Mark pending order as converted
    await ctx.db.patch(pendingOrderId, {
      convertedAt: now,
      molliePaymentId,
    });

    // 3. Build invoice line items (from DB)
    const lineItems = await buildLineItems(ctx, order);

    // 4. Calculate totals
    const subtotalCents = lineItems.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    const totalBtwCents = lineItems.reduce((sum, item) => sum + item.btwCents, 0);
    const totalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0);

    // Determine BTW status
    const btwReversed = order.isBusiness && !!order.vatNumber && isEuNotNl(order.country);
    const noBtw = !isEuCountry(order.country);

    // 5. Create invoice (this also schedules the confirmation email)
    await ctx.scheduler.runAfter(0, internal.invoices.createInvoice, {
      purchaseId,
      pendingOrderId,
      molliePaymentId,
      paidAt: now,
      buyerEmail: order.email,
      buyerName: `${order.firstName} ${order.lastName}`,
      buyerCountry: order.country,
      buyerIsBusiness: order.isBusiness,
      buyerCompany: order.company,
      buyerVatNumber: order.vatNumber,
      lineItems,
      subtotalCents,
      totalBtwCents,
      totalCents,
      btwReversed,
      noBtw,
      lang: order.lang,
    });

    // 6. Grant access rights for digital products.
    // When the buyer has no account yet (first-time purchase), we store
    // a pending grant keyed on email. A separate scheduled job retries
    // once the magic-link login creates the user record.
    if (userId) {
      const expiresAt = productData?.accessDurationDays
        ? now + productData.accessDurationDays * 24 * 60 * 60 * 1000
        : undefined;

      await ctx.db.insert("accessRights", {
        userId,
        purchaseId,
        resource: order.product,
        grantedAt: now,
        expiresAt,
      });

      for (const bump of order.bumps) {
        await ctx.db.insert("accessRights", {
          userId,
          purchaseId,
          resource: bump,
          grantedAt: now,
          expiresAt,
        });
      }
    } else {
      // No account yet — schedule a retry in 2 minutes (after magic-link login).
      await ctx.scheduler.runAfter(2 * 60 * 1000, internal.payments.grantPendingAccessByEmail, {
        email: order.email,
        purchaseId,
        product: order.product,
        bumps: order.bumps,
        accessDurationDays: productData?.accessDurationDays,
        grantedAt: now,
      });
    }

    // 7. Start automated email sequence (always — uses email, not userId)
    await ctx.scheduler.runAfter(0, internal.emails.startSequence, {
      purchaseId,
      userId: userId as any,
      email: order.email,
      product: order.product,
      productType,
      lang: order.lang,
    });

    // 8. Increment discount code usage if applicable
    if (order.discountCode) {
      const discount = await ctx.db.query("discountCodes")
        .withIndex("by_code", (q) => q.eq("code", order.discountCode!))
        .first();
      if (discount) {
        await ctx.db.patch(discount._id, { currentUses: discount.currentUses + 1 });
      }
    }

    // 9. Handle mailing opt-in — make sure consent is recorded even if the CRM
    //    contact does not exist yet (e.g. a brand-new buyer whose CRM hook
    //    hasn't run). Create a contact synchronously here so the opt-in tag
    //    cannot be lost.
    if (order.mailingOptIn) {
      const email = order.email.toLowerCase();
      const contact = await ctx.db.query("contacts")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (contact) {
        const tags = contact.tags || [];
        if (!tags.includes("mailing-optin")) {
          await ctx.db.patch(contact._id, { tags: [...tags, "mailing-optin"], unsubscribed: false });
        } else if (contact.unsubscribed) {
          await ctx.db.patch(contact._id, { unsubscribed: false });
        }
      } else {
        await ctx.db.insert("contacts", {
          email,
          firstName: order.firstName,
          lastName: order.lastName,
          phone: order.phone,
          company: order.company,
          engagementScore: 0,
          intentScore: 0,
          lastActivityAt: now,
          source: "purchase",
          sourceDetail: order.product,
          tags: ["mailing-optin"],
          unsubscribed: false,
          lang: order.lang,
          userId: userId ?? undefined,
          createdAt: now,
        });
      }
    }

    // 10. Track A/B test conversion
    if (order.experimentSlug && order.experimentVariant) {
      await ctx.scheduler.runAfter(0, internal.abtest.recordConversion, {
        slug: order.experimentSlug,
        variant: order.experimentVariant,
        revenueCents: amountCents,
      });
    }

    // 11. CRM: update contact score + log purchase + mark lead as won
    await ctx.scheduler.runAfter(0, internal.crmHooks.purchaseCompleted, {
      pendingOrderId,
      purchaseId,
      amountCents,
    });

    return { purchaseId };
  },
});

/* ─── Helpers ─── */

function getProductTypeFallback(slug: string): "training" | "book" | "event" {
  if (slug.startsWith("boek-")) return "book";
  return "training";
}

const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
];

function isEuCountry(code: string): boolean {
  return EU_COUNTRIES.includes(code);
}

function isEuNotNl(code: string): boolean {
  return isEuCountry(code) && code !== "NL";
}

interface PendingOrder {
  product: string;
  bumps: string[];
  isBusiness: boolean;
  vatNumber?: string;
  country: string;
  lang: "nl" | "en" | "de";
  quantity?: number;
  installments: boolean;
  discountCode?: string;
  discountAmount?: number;
}

async function buildLineItems(ctx: { db: any }, order: PendingOrder) {
  const items: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    btwRate: number;
    btwCents: number;
    totalCents: number;
  }> = [];

  const applyBtw = shouldApplyBtw(order);

  // Main product from DB
  const mainProduct = await ctx.db
    .query("checkoutProducts")
    .withIndex("by_slug", (q: any) => q.eq("slug", order.product))
    .first();

  if (mainProduct) {
    // Determine effective price per unit and quantity
    let effectiveUnitPrice = mainProduct.priceCents;
    let qty = order.quantity ?? 1;

    // Apply quantity tier pricing
    if (qty > 1 && mainProduct.quantityTiers) {
      const tier = mainProduct.quantityTiers.find(
        (t: { quantity: number }) => t.quantity === qty,
      );
      if (tier) effectiveUnitPrice = tier.unitPriceCents;
    }

    // Apply installment pricing (invoice shows per-term amount, qty 1)
    if (order.installments && mainProduct.installments) {
      effectiveUnitPrice = mainProduct.installments.amountPerTermCents;
      qty = 1;
    }

    const calculated = calcBtw(
      effectiveUnitPrice,
      applyBtw ? mainProduct.btwRate : 0,
      mainProduct.priceInclBtw,
    );
    items.push({
      description: mainProduct.name[order.lang],
      quantity: qty,
      unitPriceCents: calculated.net,
      btwRate: applyBtw ? mainProduct.btwRate : 0,
      btwCents: calculated.btw * qty,
      totalCents: calculated.gross * qty,
    });

    // Bump products (with price overrides from DB)
    const overridesMap = new Map(
      (mainProduct.bumpPriceOverrides ?? []).map(
        (o: { bumpSlug: string; priceCents: number }) => [o.bumpSlug, o.priceCents],
      ),
    );

    for (const bumpSlug of order.bumps) {
      const bumpProduct = await ctx.db
        .query("checkoutProducts")
        .withIndex("by_slug", (q: any) => q.eq("slug", bumpSlug))
        .first();
      if (bumpProduct) {
        const bumpPrice = overridesMap.get(bumpSlug) ?? bumpProduct.priceCents;
        const calculated = calcBtw(
          bumpPrice,
          applyBtw ? bumpProduct.btwRate : 0,
          bumpProduct.priceInclBtw,
        );
        items.push({
          description: bumpProduct.name[order.lang],
          quantity: 1,
          unitPriceCents: calculated.net,
          btwRate: applyBtw ? bumpProduct.btwRate : 0,
          btwCents: calculated.btw,
          totalCents: calculated.gross,
        });
      }
    }

    // Add discount line item (negative amount, with proportional BTW)
    if (order.discountCode && order.discountAmount && order.discountAmount > 0) {
      const discountBtwRate = applyBtw ? mainProduct.btwRate : 0;
      const discountCalc = calcBtw(
        order.discountAmount,
        discountBtwRate,
        mainProduct.priceInclBtw,
      );
      items.push({
        description: `Korting: ${order.discountCode}`,
        quantity: 1,
        unitPriceCents: -discountCalc.net,
        btwRate: discountBtwRate,
        btwCents: -discountCalc.btw,
        totalCents: -discountCalc.gross,
      });
    }
  }

  return items;
}

function shouldApplyBtw(order: PendingOrder): boolean {
  if (!isEuCountry(order.country)) return false;
  if (order.isBusiness && order.vatNumber && order.country !== "NL") return false;
  return true;
}

function calcBtw(
  priceCents: number,
  btwRate: number,
  priceInclBtw: boolean,
): { net: number; btw: number; gross: number } {
  if (priceInclBtw) {
    const net = Math.round(priceCents / (1 + btwRate / 100));
    const btw = priceCents - net;
    return { net, btw, gross: priceCents };
  }
  const btw = Math.round(priceCents * (btwRate / 100));
  return { net: priceCents, btw, gross: priceCents + btw };
}

/**
 * Scheduled job: grant access rights for a purchase where no user existed yet
 * at payment time. Runs 10 minutes after purchase to give the magic-link login
 * time to create the account. Retries itself once more after 60 minutes if the
 * account still doesn't exist.
 */
export const grantPendingAccessByEmail = internalAction({
  args: {
    email: v.string(),
    purchaseId: v.id("purchases"),
    product: v.string(),
    bumps: v.array(v.string()),
    accessDurationDays: v.optional(v.number()),
    grantedAt: v.number(),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { email, purchaseId, product, bumps, accessDurationDays, grantedAt } = args;
    const retryCount = args.retryCount ?? 0;

    const userId = await ctx.runQuery(internal.payments.findUserByEmail, { email });
    if (!userId) {
      if (retryCount < 2) {
        // Retry: 20 min (attempt 2), then 80 min (attempt 3) after purchase
        const delayMs = retryCount === 0 ? 20 * 60 * 1000 : 60 * 60 * 1000;
        await ctx.scheduler.runAfter(delayMs, internal.payments.grantPendingAccessByEmail, {
          ...args,
          retryCount: retryCount + 1,
        });
      } else {
        console.error(`[grantPendingAccessByEmail] No account found for ${email} after 3 attempts. Purchase: ${purchaseId}`);
      }
      return;
    }

    await ctx.runMutation(internal.payments.insertAccessRights, {
      userId,
      purchaseId,
      product,
      bumps,
      accessDurationDays,
      grantedAt,
    });
  },
});

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    const match = accounts.find(
      (a: any) => a.providerAccountId?.toLowerCase() === email.toLowerCase(),
    );
    return match?.userId ?? null;
  },
});

export const insertAccessRights = internalMutation({
  args: {
    userId: v.id("users"),
    purchaseId: v.id("purchases"),
    product: v.string(),
    bumps: v.array(v.string()),
    accessDurationDays: v.optional(v.number()),
    grantedAt: v.number(),
  },
  handler: async (ctx, { userId, purchaseId, product, bumps, accessDurationDays, grantedAt }) => {
    const expiresAt = accessDurationDays
      ? grantedAt + accessDurationDays * 24 * 60 * 60 * 1000
      : undefined;

    // Check if already granted (idempotent)
    const existing = await ctx.db.query("accessRights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("purchaseId"), purchaseId))
      .first();
    if (existing) return;

    // Link purchase to user so it shows in dashboard (first-time buyers have userId=undefined)
    const purchase = await ctx.db.get(purchaseId);
    if (purchase && !purchase.userId) {
      await ctx.db.patch(purchaseId, { userId });
    }

    await ctx.db.insert("accessRights", {
      userId,
      purchaseId,
      resource: product,
      grantedAt,
      expiresAt,
    });

    for (const bump of bumps) {
      await ctx.db.insert("accessRights", {
        userId,
        purchaseId,
        resource: bump,
        grantedAt,
        expiresAt,
      });
    }
  },
});
