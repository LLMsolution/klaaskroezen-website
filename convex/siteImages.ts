import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// ── Public queries (no auth — images are public) ──

/** Get a single image by key */
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const img = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (!img) return null;
    const url = await ctx.storage.getUrl(img.storageId);
    return { url, alt: img.alt, width: img.width, height: img.height, key: img.key };
  },
});

/** Batch get images by keys — efficient for pages with many images */
export const getByKeys = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const results: Record<string, { url: string; alt?: string; width?: number; height?: number }> = {};
    for (const key of keys) {
      const img = await ctx.db
        .query("siteImages")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (img) {
        const url = await ctx.storage.getUrl(img.storageId);
        if (url) results[key] = { url, alt: img.alt, width: img.width, height: img.height };
      }
    }
    return results;
  },
});

// ── Admin queries ──

/** List all images, optionally by category */
export const listAll = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    await requireAdmin(ctx);
    const images = category
      ? await ctx.db.query("siteImages").withIndex("by_category", (q) => q.eq("category", category)).collect()
      : await ctx.db.query("siteImages").collect();

    return Promise.all(
      images
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(async (img) => ({
          ...img,
          url: await ctx.storage.getUrl(img.storageId),
        })),
    );
  },
});

/** List unique categories */
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("siteImages").collect();
    return [...new Set(all.map((i) => i.category))].sort();
  },
});

// ── Admin mutations ──

/** Upload/replace an image */
export const saveImage = mutation({
  args: {
    key: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    category: v.string(),
    alt: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      // Delete old file from storage
      await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        fileName: args.fileName,
        alt: args.alt,
        width: args.width,
        height: args.height,
      });
      return existing._id;
    }

    return await ctx.db.insert("siteImages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/** Update alt text only */
export const updateAlt = mutation({
  args: { key: v.string(), alt: v.string() },
  handler: async (ctx, { key, alt }) => {
    await requireAdmin(ctx);
    const img = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (!img) throw new Error("Afbeelding niet gevonden.");
    await ctx.db.patch(img._id, { alt });
  },
});

/** Delete an image */
export const deleteImage = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await requireAdmin(ctx);
    const img = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (!img) return;
    await ctx.storage.delete(img.storageId);
    await ctx.db.delete(img._id);
  },
});

/** Generate upload URL (reuse trainings pattern) */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// ── Migration helper (internal, no auth) ──

export const bulkInsert = internalMutation({
  args: {
    images: v.array(
      v.object({
        key: v.string(),
        storageId: v.id("_storage"),
        fileName: v.string(),
        category: v.string(),
      }),
    ),
  },
  handler: async (ctx, { images }) => {
    let inserted = 0;
    for (const img of images) {
      const existing = await ctx.db
        .query("siteImages")
        .withIndex("by_key", (q) => q.eq("key", img.key))
        .first();
      if (existing) continue;
      await ctx.db.insert("siteImages", { ...img, createdAt: Date.now() });
      inserted++;
    }
    return inserted;
  },
});
