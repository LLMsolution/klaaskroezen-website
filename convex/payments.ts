import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
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

    // 1. Create purchase record
    const purchaseId = await ctx.db.insert("purchases", {
      userId: order.userId!,
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

    // 6. Grant access rights for digital products
    if (order.userId) {
      await ctx.db.insert("accessRights", {
        userId: order.userId,
        purchaseId,
        resource: order.product,
        grantedAt: now,
      });

      // Also grant access for bumps
      for (const bump of order.bumps) {
        await ctx.db.insert("accessRights", {
          userId: order.userId,
          purchaseId,
          resource: bump,
          grantedAt: now,
        });
      }
    }

    // 7. Start automated email sequence
    if (order.userId) {
      await ctx.scheduler.runAfter(0, internal.emails.startSequence, {
        purchaseId,
        userId: order.userId,
        email: order.email,
        product: order.product,
        productType,
        lang: order.lang,
      });
    }

    // 8. Track A/B test conversion
    if (order.experimentSlug && order.experimentVariant) {
      await ctx.scheduler.runAfter(0, internal.abtest.recordConversion, {
        slug: order.experimentSlug,
        variant: order.experimentVariant,
        revenueCents: amountCents,
      });
    }

    // 9. CRM: update contact score + log purchase + mark lead as won
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

