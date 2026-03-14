import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimits";

/** Create a pending order when the user completes step 1 of checkout */
export const createPendingOrder = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    product: v.string(),
    country: v.string(),
    lang: v.union(v.literal("nl"), v.literal("en")),
    isBusiness: v.boolean(),
    company: v.optional(v.string()),
    vatNumber: v.optional(v.string()),
    bumps: v.array(v.string()),
    discountCode: v.optional(v.string()),
    installments: v.boolean(),
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
        country: args.country,
        lang: args.lang,
        isBusiness: args.isBusiness,
        company: args.company,
        vatNumber: args.vatNumber,
        bumps: args.bumps,
        discountCode: args.discountCode,
        installments: args.installments,
      });
      return existing._id;
    }

    // Create new pending order
    const id = await ctx.db.insert("pendingOrders", {
      ...args,
      discountAmount: undefined,
      userId: undefined,
      molliePaymentId: undefined,
      remindersSent: 0,
      convertedAt: undefined,
      abandonedAt: undefined,
      createdAt: Date.now(),
    });

    // Schedule abandoned cart reminder after 30 minutes
    await ctx.scheduler.runAfter(
      30 * 60 * 1000,
      internal.checkout.checkAbandoned,
      { orderId: id },
    );

    return id;
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

/** Check if a pending order was abandoned and send reminder */
export const checkAbandoned = internalMutation({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order || order.convertedAt) return;

    if (order.remindersSent >= 3) {
      // Max reminders reached, mark as abandoned
      await ctx.db.patch(orderId, { abandonedAt: Date.now() });
      return;
    }

    // Schedule email sending
    await ctx.scheduler.runAfter(
      0,
      internal.checkout.sendAbandonedCartEmail,
      { orderId },
    );

    // Update reminder count
    await ctx.db.patch(orderId, {
      remindersSent: order.remindersSent + 1,
    });

    // Schedule next check based on reminder number
    const delays = [
      24 * 60 * 60 * 1000, // 24 hours after first
      48 * 60 * 60 * 1000, // 48 hours after second
    ];
    const nextDelay = delays[order.remindersSent];
    if (nextDelay) {
      await ctx.scheduler.runAfter(nextDelay, internal.checkout.checkAbandoned, {
        orderId,
      });
    }
  },
});

/** Internal: send abandoned cart email (placeholder — needs Resend integration) */
export const sendAbandonedCartEmail = internalMutation({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return;

    // Log the email attempt (actual sending via Resend action)
    await ctx.db.insert("emailLog", {
      to: order.email,
      subject:
        order.lang === "nl"
          ? "Je was bijna klaar — rond je bestelling af"
          : "You were almost done — complete your order",
      template: "abandoned-cart",
      status: "queued",
      createdAt: Date.now(),
    });
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

    let q = ctx.db
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
