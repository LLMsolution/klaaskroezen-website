import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { rateLimiter } from "./rateLimits";
import { langValidator } from "./schema";

/** Lightweight draft save — creates CRM contact on first save with email. */
export const saveDraft = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    product: v.string(),
    country: v.string(),
    lang: langValidator,
    isBusiness: v.boolean(),
    company: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    street: v.optional(v.string()),
    houseNumber: v.optional(v.string()),
    houseNumberSuffix: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    quantity: v.optional(v.number()),
    bumps: v.array(v.string()),
    discountCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    installments: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pendingOrders")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) =>
        q.and(
          q.eq(q.field("product"), args.product),
          q.eq(q.field("convertedAt"), undefined),
        ),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        country: args.country,
        lang: args.lang,
        isBusiness: args.isBusiness,
        company: args.company,
        companyWebsite: args.companyWebsite,
        vatNumber: args.vatNumber,
        street: args.street,
        houseNumber: args.houseNumber,
        houseNumberSuffix: args.houseNumberSuffix,
        postalCode: args.postalCode,
        city: args.city,
        quantity: args.quantity,
        bumps: args.bumps,
        discountCode: args.discountCode,
        discountAmount: args.discountAmount,
        installments: args.installments,
      });

      // CRM: create contact on first draft save (once per order)
      if (!existing.crmNotified && args.email.includes("@")) {
        await ctx.db.patch(existing._id, { crmNotified: true });
        await ctx.scheduler.runAfter(0, internal.crmHooks.checkoutDraftSaved, {
          email: args.email,
          firstName: args.firstName,
          lastName: args.lastName,
          phone: args.phone,
          company: args.company,
          product: args.product,
          lang: args.lang,
        });
      }

      return existing._id;
    }

    const orderId = await ctx.db.insert("pendingOrders", {
      ...args,
      mailingOptIn: false,
      crmNotified: !!args.email.includes("@"),
      remindersSent: 0,
      createdAt: Date.now(),
    });

    // CRM: create contact for new draft
    if (args.email.includes("@")) {
      await ctx.scheduler.runAfter(0, internal.crmHooks.checkoutDraftSaved, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        company: args.company,
        product: args.product,
        lang: args.lang,
      });
    }

    return orderId;
  },
});

export const createPendingOrder = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    product: v.string(),
    country: v.string(),
    lang: langValidator,
    isBusiness: v.boolean(),
    company: v.optional(v.string()),
    companyWebsite: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    street: v.optional(v.string()),
    houseNumber: v.optional(v.string()),
    houseNumberSuffix: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    city: v.optional(v.string()),
    quantity: v.optional(v.number()),
    mailingOptIn: v.optional(v.boolean()),
    bumps: v.array(v.string()),
    discountCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    installments: v.boolean(),
    bookLang: v.optional(langValidator),
    experimentSlug: v.optional(v.string()),
    experimentVariant: v.optional(v.string()),
    agreedDigitalWaiver: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Rate limit by email
    const { ok } = await rateLimiter.limit(ctx, "contactForm", {
      key: args.email,
    });
    if (!ok) {
      throw new Error("Te veel aanvragen. Probeer het later opnieuw.");
    }

    // Check for existing pending order with same email + product
    const existing = await ctx.db
      .query("pendingOrders")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) =>
        q.and(
          q.eq(q.field("product"), args.product),
          q.eq(q.field("convertedAt"), undefined),
        ),
      )
      .first();

    if (existing) {
      // Update existing pending order
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        country: args.country,
        lang: args.lang,
        isBusiness: args.isBusiness,
        company: args.company,
        vatNumber: args.vatNumber,
        street: args.street,
        houseNumber: args.houseNumber,
        houseNumberSuffix: args.houseNumberSuffix,
        postalCode: args.postalCode,
        city: args.city,
        quantity: args.quantity,
        mailingOptIn: args.mailingOptIn,
        bumps: args.bumps,
        discountCode: args.discountCode,
        discountAmount: args.discountAmount,
        installments: args.installments,
        bookLang: args.bookLang,
        experimentSlug: args.experimentSlug,
        experimentVariant: args.experimentVariant,
        agreedDigitalWaiver: args.agreedDigitalWaiver,
      });
      return existing._id;
    }

    // Create new pending order
    const id = await ctx.db.insert("pendingOrders", {
      ...args,
      userId: undefined,
      molliePaymentId: undefined,
      remindersSent: 0,
      convertedAt: undefined,
      abandonedAt: undefined,
      createdAt: Date.now(),
    });

    // Track A/B test impression
    if (args.experimentSlug && args.experimentVariant) {
      await ctx.scheduler.runAfter(0, internal.abtest.recordImpression, {
        slug: args.experimentSlug,
        variant: args.experimentVariant,
      });
    }

    // Schedule abandoned cart reminder (timing from admin settings)
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    const firstDelayMs = (settings?.abandonedCartDelayMinutes ?? 30) * 60 * 1000;
    await ctx.scheduler.runAfter(
      firstDelayMs,
      internal.checkout.checkAbandoned,
      { orderId: id },
    );

    // CRM: create/update contact + log checkout started + score
    await ctx.scheduler.runAfter(0, internal.crmHooks.checkoutStarted, {
      orderId: id,
    });

    return id;
  },
});

/** Process a free order (total = 0 after discount) — skip Mollie entirely */
export const processFreeOrder = mutation({
  args: { pendingOrderId: v.id("pendingOrders") },
  handler: async (ctx, { pendingOrderId }) => {
    const order = await ctx.db.get(pendingOrderId);
    if (!order) throw new Error("Bestelling niet gevonden");
    if (order.convertedAt) throw new Error("Al verwerkt");
    await ctx.scheduler.runAfter(0, internal.payments.processSuccessfulPayment, {
      molliePaymentId: `FREE-${pendingOrderId}`,
      amountCents: 0,
      pendingOrderId,
    });
    return { success: true, email: order.email, product: order.product, lang: order.lang };
  },
});

/** Mark pending order as converted after successful payment */
export const markConverted = internalMutation({
  args: {
    orderId: v.id("pendingOrders"),
    molliePaymentId: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { orderId, molliePaymentId, userId }) => {
    await ctx.db.patch(orderId, {
      convertedAt: Date.now(),
      molliePaymentId,
      userId,
    });
  },
});

/** Check if a pending order was abandoned and send escalating reminder */
export const checkAbandoned = internalMutation({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order || order.convertedAt) return;

    const step = order.remindersSent;

    // Escalation steps: 0=30min, 1=24h, 2=72h, 3=7d
    if (step >= 4) {
      await ctx.db.patch(orderId, { abandonedAt: Date.now() });
      return;
    }

    // Step 3: auto-generate 10% discount code for final push
    let autoDiscountCode: string | undefined;
    if (step === 3) {
      const code = `COMEBACK-${orderId.slice(-6).toUpperCase()}`;
      const existing = await ctx.db
        .query("discountCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!existing) {
        await ctx.db.insert("discountCodes", {
          code,
          type: "percentage",
          value: 10,
          validUntil: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
          maxUses: 1,
          currentUses: 0,
          products: [order.product],
        });
      }
      autoDiscountCode = code;
    }

    // Actually send email via Resend (fixes the bug where emails were only queued)
    await ctx.scheduler.runAfter(0, internal.emails.sendAbandonedCartReminder, {
      orderId,
      step,
      discountCode: autoDiscountCode,
    });

    // CRM: log abandoned cart activity (only on first reminder)
    if (step === 0) {
      await ctx.scheduler.runAfter(0, internal.crmHooks.checkoutAbandoned, { orderId });
    }

    await ctx.db.patch(orderId, { remindersSent: step + 1 });
    // Schedule next escalation
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    const escalationHours = settings?.escalationDelayHours ?? [24, 48, 96];
    const nextDelay = step < escalationHours.length
      ? escalationHours[step] * 60 * 60 * 1000
      : undefined;
    if (nextDelay) {
      await ctx.scheduler.runAfter(nextDelay, internal.checkout.checkAbandoned, { orderId });
    }
  },
});

/** Get pending order by ID for magic link recovery */
export const getPendingOrderForRecovery = query({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    try {
      const order = await ctx.db.get(orderId as Id<"pendingOrders">);
      if (!order || order.convertedAt) return null;
      return {
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        phone: order.phone,
        product: order.product,
        country: order.country,
        isBusiness: order.isBusiness,
        company: order.company,
        vatNumber: order.vatNumber,
        street: order.street,
        houseNumber: order.houseNumber,
        postalCode: order.postalCode,
        city: order.city,
        bumps: order.bumps,
        quantity: order.quantity,
        discountCode: order.discountCode,
        installments: order.installments,
        lang: order.lang,
      };
    } catch {
      return null;
    }
  },
});

/** Look up latest pending order by email for returning visitor recognition */
export const getPendingOrderByEmail = query({
  args: { email: v.string(), product: v.optional(v.string()) },
  handler: async (ctx, { email, product }) => {
    const orders = await ctx.db
      .query("pendingOrders")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const unconverted = orders
      .filter((o) => !o.convertedAt && (!product || o.product === product))
      .sort((a, b) => b.createdAt - a.createdAt);

    if (unconverted.length === 0) return null;
    const order = unconverted[0];

    return {
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      product: order.product,
      country: order.country,
      isBusiness: order.isBusiness,
      company: order.company,
      vatNumber: order.vatNumber,
      street: order.street,
      houseNumber: order.houseNumber,
      postalCode: order.postalCode,
      city: order.city,
      bumps: order.bumps,
      quantity: order.quantity,
      discountCode: order.discountCode,
      installments: order.installments,
      lang: order.lang,
    };
  },
});

/** Validate a discount code */
export const validateDiscount = query({
  args: {
    code: v.string(),
    product: v.string(),
  },
  handler: async (ctx, { code, product }) => {
    const discount = await ctx.db
      .query("discountCodes")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!discount) return { valid: false, reason: "invalid" } as const;

    if (discount.validUntil && discount.validUntil < Date.now()) {
      return { valid: false, reason: "expired" } as const;
    }

    if (
      discount.maxUses !== undefined &&
      discount.currentUses >= discount.maxUses
    ) {
      return { valid: false, reason: "maxed" } as const;
    }

    if (discount.products && !discount.products.includes(product)) {
      return { valid: false, reason: "wrong_product" } as const;
    }

    return {
      valid: true,
      type: discount.type,
      value: discount.value,
    } as const;
  },
});

/** Get active cohort for a training (if any) */
export const getActiveCohort = query({
  args: { training: v.string() },
  handler: async (ctx, { training }) => {
    const cohort = await ctx.db
      .query("cohorts")
      .withIndex("by_training", (q) => q.eq("training", training))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!cohort) return null;

    return {
      name: cohort.name,
      startDate: cohort.startDate,
      enrollmentDeadline: cohort.enrollmentDeadline,
      spotsLeft: cohort.maxParticipants - cohort.currentParticipants,
      maxParticipants: cohort.maxParticipants,
    };
  },
});

/** Get recent purchases for social proof (last 48 hours, anonymized) */
export const getRecentPurchases = query({
  args: { product: v.optional(v.string()) },
  handler: async (ctx, { product }) => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;

    const q = ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"));

    const purchases = await q.collect();

    return purchases
      .filter((p) => p.paidAt && p.paidAt > cutoff)
      .filter((p) => !product || p.product === product)
      .slice(0, 5)
      .map((p) => ({
        product: p.product,
        paidAt: p.paidAt!,
      }));
  },
});

/**
 * Return every product slug (main product + bumps) the email already paid for.
 * Used by the bedankt-page upsell so we never re-offer something the buyer
 * already owns.
 */
export const getPurchasedSlugsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const orders = await ctx.db
      .query("pendingOrders")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const slugs = new Set<string>();
    for (const order of orders) {
      if (!order.convertedAt) continue;
      slugs.add(order.product);
      for (const bump of order.bumps) slugs.add(bump);
    }
    return Array.from(slugs);
  },
});

/** Get total count of purchases for social proof */
export const getPurchaseCount = query({
  args: { productType: v.optional(v.string()) },
  handler: async (ctx, { productType }) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    if (!productType) return purchases.length;
    return purchases.filter((p) => p.productType === productType).length;
  },
});

/** Create an upsell order using stored customer data from previous purchase */
export const createUpsellOrder = mutation({
  args: {
    email: v.string(),
    product: v.string(),
    lang: langValidator,
  },
  handler: async (ctx, { email, product, lang }) => {
    // Find most recent converted order for this email
    const orders = await ctx.db
      .query("pendingOrders")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const lastOrder = orders
      .filter((o) => o.convertedAt !== undefined)
      .sort((a, b) => (b.convertedAt ?? 0) - (a.convertedAt ?? 0))[0];

    if (!lastOrder) throw new Error("Geen eerdere bestelling gevonden.");

    // Resolve userId so the upsell's purchase + invoice land in the dashboard
    // immediately (otherwise processSuccessfulPayment leaves them unlinked
    // until the post-payment magic-link login fires the auth callback).
    const accounts = await ctx.db.query("authAccounts").collect();
    const match = accounts.find(
      (a) => a.providerAccountId?.toLowerCase() === email.toLowerCase(),
    );
    const userId = match?.userId ?? lastOrder.userId;

    // Create new pending order with same customer data
    const id = await ctx.db.insert("pendingOrders", {
      email: lastOrder.email,
      firstName: lastOrder.firstName,
      lastName: lastOrder.lastName,
      phone: lastOrder.phone,
      product,
      country: lastOrder.country,
      lang,
      isBusiness: lastOrder.isBusiness,
      company: lastOrder.company,
      vatNumber: lastOrder.vatNumber,
      street: lastOrder.street,
      houseNumber: lastOrder.houseNumber,
      houseNumberSuffix: lastOrder.houseNumberSuffix,
      postalCode: lastOrder.postalCode,
      city: lastOrder.city,
      mailingOptIn: lastOrder.mailingOptIn,
      bumps: [],
      installments: false,
      userId,
      remindersSent: 0,
      createdAt: Date.now(),
    });
    return id;
  },
});
