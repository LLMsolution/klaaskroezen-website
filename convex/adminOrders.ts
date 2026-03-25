import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

/**
 * Dashboard overview stats.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    const pendingOrders = await ctx.db
      .query("pendingOrders")
      .filter((q) => q.eq(q.field("convertedAt"), undefined))
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const recentPurchases = purchases.filter(
      (p) => p.paidAt && p.paidAt > thirtyDaysAgo,
    );
    const weekPurchases = purchases.filter(
      (p) => p.paidAt && p.paidAt > sevenDaysAgo,
    );

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const monthRevenue = recentPurchases.reduce((sum, p) => sum + p.amount, 0);
    const weekRevenue = weekPurchases.reduce((sum, p) => sum + p.amount, 0);

    // Revenue by product type
    const trainingRevenue = purchases
      .filter((p) => p.productType === "training")
      .reduce((sum, p) => sum + p.amount, 0);
    const bookRevenue = purchases
      .filter((p) => p.productType === "book")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalOrders: purchases.length,
      totalRevenue,
      monthRevenue,
      weekRevenue,
      monthOrders: recentPurchases.length,
      weekOrders: weekPurchases.length,
      pendingCarts: pendingOrders.length,
      trainingRevenue,
      bookRevenue,
    };
  },
});

/**
 * List recent orders (paginated).
 */
export const getOrders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    const purchases = await ctx.db
      .query("purchases")
      .order("desc")
      .take(limit ?? 50);

    // Enrich with user info
    const enriched = [];
    for (const purchase of purchases) {
      if (!purchase.userId) {
        enriched.push({
          ...purchase,
          userName: "\u2014",
          userEmail: (purchase as any).buyerEmail ?? "\u2014",
        });
        continue;
      }
      const user = await ctx.db.get(purchase.userId);

      // Get email
      const accounts = await ctx.db
        .query("authAccounts")
        .filter((q) => q.eq(q.field("userId"), purchase.userId))
        .collect();
      const emailAccount = accounts.find(
        (a) => a.providerAccountId?.includes("@"),
      );

      enriched.push({
        ...purchase,
        userName: user?.name ?? "\u2014",
        userEmail: emailAccount?.providerAccountId ?? user?.email ?? "\u2014",
      });
    }

    return enriched;
  },
});

/**
 * List pending (abandoned) carts.
 */
export const getPendingCarts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("pendingOrders")
      .filter((q) => q.eq(q.field("convertedAt"), undefined))
      .order("desc")
      .take(limit ?? 50);
  },
});

/**
 * List all invoices.
 */
export const getInvoices = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("invoices")
      .order("desc")
      .take(limit ?? 50);
  },
});

/**
 * Get discount codes.
 */
export const getDiscountCodes = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("discountCodes")
      .collect();
  },
});

/**
 * Create a discount code.
 */
export const createDiscountCode = mutation({
  args: {
    code: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    products: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("discountCodes", {
      code: args.code.toUpperCase(),
      type: args.type,
      value: args.value,
      validUntil: args.validUntil,
      maxUses: args.maxUses,
      currentUses: 0,
      products: args.products,
    });
  },
});

/**
 * Delete a discount code.
 */
export const deleteDiscountCode = mutation({
  args: { id: v.id("discountCodes") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

/**
 * Get cohorts.
 */
export const getCohorts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("cohorts").order("desc").collect();
  },
});
