import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// ── Public queries ──

export const listForProduct = query({
  args: {
    productType: v.union(v.literal("training"), v.literal("book")),
    productSlug: v.optional(v.string()),
  },
  handler: async (ctx, { productType, productSlug }) => {
    // First try slug-specific reviews
    if (productSlug) {
      const slugReviews = await ctx.db
        .query("checkoutReviews")
        .withIndex("by_product_slug", (q) => q.eq("productSlug", productSlug))
        .collect();
      const activeSlug = slugReviews
        .filter((r) => r.active)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (activeSlug.length > 0) return activeSlug;
    }

    // Fall back to type-level reviews
    const typeReviews = await ctx.db
      .query("checkoutReviews")
      .withIndex("by_product_type", (q) => q.eq("productType", productType))
      .collect();
    return typeReviews
      .filter((r) => r.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// ── Admin queries ──

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db.query("checkoutReviews").collect();
    return reviews.sort((a, b) => {
      if (a.productType !== b.productType) return a.productType < b.productType ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  },
});

// ── Admin mutations ──

const reviewFields = {
  productType: v.union(v.literal("training"), v.literal("book")),
  productSlug: v.optional(v.string()),
  text: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
  name: v.string(),
  role: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
  avatar: v.optional(v.string()),
  rating: v.number(),
  active: v.boolean(),
  sortOrder: v.number(),
};

export const createReview = mutation({
  args: reviewFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("checkoutReviews", args);
  },
});

export const updateReview = mutation({
  args: { id: v.id("checkoutReviews"), ...reviewFields },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    await ctx.db.replace(id, fields);
  },
});

export const deleteReview = mutation({
  args: { id: v.id("checkoutReviews") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const review = await ctx.db.get(id);
    if ((review as any)?.avatarStorageId) await ctx.storage.delete((review as any).avatarStorageId);
    await ctx.db.delete(id);
  },
});

export const saveAvatar = mutation({
  args: { reviewId: v.id("checkoutReviews"), storageId: v.id("_storage") },
  handler: async (ctx, { reviewId, storageId }) => {
    await requireAdmin(ctx);
    const review = await ctx.db.get(reviewId);
    if ((review as any)?.avatarStorageId) await ctx.storage.delete((review as any).avatarStorageId);
    await ctx.db.patch(reviewId, { avatarStorageId: storageId, avatar: undefined });
  },
});

export const removeAvatar = mutation({
  args: { reviewId: v.id("checkoutReviews") },
  handler: async (ctx, { reviewId }) => {
    await requireAdmin(ctx);
    const review = await ctx.db.get(reviewId);
    if ((review as any)?.avatarStorageId) await ctx.storage.delete((review as any).avatarStorageId);
    await ctx.db.patch(reviewId, { avatarStorageId: undefined, avatar: undefined });
  },
});
