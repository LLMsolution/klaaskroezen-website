import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { langValidator } from "./schema";

// ── Public queries (no auth — images are public) ──

/** Get a single image by key, with optional lang fallback */
export const getByKey = query({
  args: { key: v.string(), lang: v.optional(langValidator) },
  handler: async (ctx, { key, lang }) => {
    // Try language-specific first
    if (lang) {
      const langImg = await ctx.db
        .query("siteImages")
        .withIndex("by_key_lang", (q) => q.eq("key", key).eq("lang", lang))
        .first();
      if (langImg) {
        const url = await ctx.storage.getUrl(langImg.storageId);
        return { url, alt: langImg.alt, width: langImg.width, height: langImg.height, key: langImg.key, lang: langImg.lang };
      }
    }
    // Fallback to universal (no lang)
    const img = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (!img || img.lang) {
      // If the only match has a lang set, it's not universal — try finding one without lang
      const all = await ctx.db
        .query("siteImages")
        .withIndex("by_key", (q) => q.eq("key", key))
        .collect();
      const universal = all.find((i) => !i.lang);
      if (universal) {
        const url = await ctx.storage.getUrl(universal.storageId);
        return { url, alt: universal.alt, width: universal.width, height: universal.height, key: universal.key, lang: universal.lang };
      }
      // Last resort: return any match
      if (img) {
        const url = await ctx.storage.getUrl(img.storageId);
        return { url, alt: img.alt, width: img.width, height: img.height, key: img.key, lang: img.lang };
      }
      return null;
    }
    const url = await ctx.storage.getUrl(img.storageId);
    return { url, alt: img.alt, width: img.width, height: img.height, key: img.key, lang: img.lang };
  },
});

/** Batch get images by keys — with optional lang fallback */
export const getByKeys = query({
  args: { keys: v.array(v.string()), lang: v.optional(langValidator) },
  handler: async (ctx, { keys, lang }) => {
    const results: Record<string, { url: string; alt?: string; width?: number; height?: number }> = {};
    for (const key of keys) {
      let img = null;

      // Try language-specific first
      if (lang) {
        img = await ctx.db
          .query("siteImages")
          .withIndex("by_key_lang", (q) => q.eq("key", key).eq("lang", lang))
          .first();
      }

      // Fallback to universal
      if (!img) {
        const all = await ctx.db
          .query("siteImages")
          .withIndex("by_key", (q) => q.eq("key", key))
          .collect();
        img = all.find((i) => !i.lang) ?? all[0] ?? null;
      }

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
          lang: img.lang ?? null,
        })),
    );
  },
});

/** Debug: check image URL resolution for first 5 images */
export const debugImageUrls = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const images = await ctx.db.query("siteImages").take(5);
    return Promise.all(
      images.map(async (img) => ({
        key: img.key,
        storageId: img.storageId,
        url: await ctx.storage.getUrl(img.storageId),
        hasUrl: !!(await ctx.storage.getUrl(img.storageId)),
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

/** Upload/replace an image (optionally language-specific) */
export const saveImage = mutation({
  args: {
    key: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    category: v.string(),
    alt: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    lang: v.optional(langValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Find existing: match on key + lang
    const all = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
    const existing = all.find((i) =>
      args.lang ? i.lang === args.lang : !i.lang,
    );

    if (existing) {
      // Delete old file — ignore if already missing from storage
      try { await ctx.storage.delete(existing.storageId); } catch { /* old file already gone */ }
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        fileName: args.fileName,
        alt: args.alt,
        width: args.width,
        height: args.height,
        lang: args.lang,
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
