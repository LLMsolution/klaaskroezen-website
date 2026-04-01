import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// ── Public queries ──

/** Get the display spec for a single image key */
export const getSpecForKey = query({
  args: { imageKey: v.string() },
  handler: async (ctx, { imageKey }) => {
    return await ctx.db
      .query("imageSpecs")
      .withIndex("by_key", (q) => q.eq("imageKey", imageKey))
      .first();
  },
});

/** Get all specs for a page */
export const getSpecsForPage = query({
  args: { pageSlug: v.string() },
  handler: async (ctx, { pageSlug }) => {
    return await ctx.db
      .query("imageSpecs")
      .withIndex("by_page", (q) => q.eq("pageSlug", pageSlug))
      .collect();
  },
});

// ── Admin queries ──

/** List all image specs */
export const listAllSpecs = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const specs = await ctx.db.query("imageSpecs").collect();
    return specs.sort((a, b) => a.imageKey.localeCompare(b.imageKey));
  },
});

// ── Admin mutations ──

/** Create or update a single image spec */
export const upsertSpec = mutation({
  args: {
    imageKey: v.string(),
    displayWidth: v.number(),
    displayHeight: v.number(),
    aspectRatio: v.string(),
    context: v.string(),
    pageSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("imageSpecs")
      .withIndex("by_key", (q) => q.eq("imageKey", args.imageKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayWidth: args.displayWidth,
        displayHeight: args.displayHeight,
        aspectRatio: args.aspectRatio,
        context: args.context,
        pageSlug: args.pageSlug,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("imageSpecs", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

// ── Internal mutations (for seed + layout editor sync) ──

/** Bulk upsert specs — skips existing keys unless force=true */
export const bulkUpsert = internalMutation({
  args: {
    specs: v.array(
      v.object({
        imageKey: v.string(),
        displayWidth: v.number(),
        displayHeight: v.number(),
        aspectRatio: v.string(),
        context: v.string(),
        pageSlug: v.optional(v.string()),
      }),
    ),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, { specs, force }) => {
    let upserted = 0;
    for (const spec of specs) {
      const existing = await ctx.db
        .query("imageSpecs")
        .withIndex("by_key", (q) => q.eq("imageKey", spec.imageKey))
        .first();

      if (existing) {
        if (force) {
          await ctx.db.patch(existing._id, {
            ...spec,
            updatedAt: Date.now(),
          });
          upserted++;
        }
        continue;
      }

      await ctx.db.insert("imageSpecs", {
        ...spec,
        updatedAt: Date.now(),
      });
      upserted++;
    }
    return upserted;
  },
});
