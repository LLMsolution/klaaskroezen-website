import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// ── Public queries ──

/**
 * Given a content image key, resolve which imageSpecs key to look up.
 * Handles indexed array item keys (e.g. "home/team-photos-items-1/image") by
 * returning item-specific specs where needed, or stripping the index and
 * falling back to the non-indexed mapping.
 */
function resolveContentKeyToSpec(imageKey: string): string | undefined {
  // Exact match first
  const direct = CONTENT_KEY_TO_SPEC[imageKey];
  if (direct) return direct;

  // Match indexed pattern: ".../<section>-items-<N>/<field>"
  const indexed = imageKey.match(/^(.+)-(\d+)\/([^/]+)$/);
  if (!indexed) return undefined;
  const [, base, idxStr, field] = indexed;
  const idx = Number(idxStr);

  // Team photos: first (index 0) is the featured row-span-2 slot (5:4),
  // all other items render as the wider small slot (5:2)
  if (base === "home/team-photos-items" && field === "image") {
    return idx === 0 ? "home/team-photo-large" : "home/team-photo-small";
  }

  // Generic fallback: drop the index and try the non-indexed content key
  return CONTENT_KEY_TO_SPEC[`${base}/${field}`];
}

/** Map of content section keys to their matching imageSpecs key */
const CONTENT_KEY_TO_SPEC: Record<string, string> = {
  // Over-ons
  "over-ons/hero/image": "about/klaas-over-mij.jpeg",
  "over-ons/mission/image": "about/klaas-kroezen-portrait-2.jpeg",
  "over-ons/office/image": "about/kantoor-administratie.jpg",
  // Spreker
  "spreker/content-block/image": "spreker/klaas-flipchart.jpeg",
  "spreker/hero/image": "spreker/klaas-hero.jpeg",
  // Boek
  "boek/hero/image": "book/sales-oprecht-ontspannen-cover.png",
  "boek/interview/image": "blog/klaas-managementboek-interview.jpg",
  // Contact
  "contact/hero/image": "contact/hero-portrait-2",
  // Training pages
  "sales-excellence-training/hero/image": "training/visma-youserve-session.jpg",
  "sales-excellence-training/cross-link/image": "cross-link/customer-success",
  "customer-success-training/hero/image": "hero/customer-success-hero.jpeg",
  "customer-success-training/cross-link/image": "cross-link/sales-excellence",
  "boek/cross-link/image": "cross-link/boek",
  // Home sections
  "home/about-klaas/image": "home/about-klaas-banner",
  "home/book-teaser/image": "home/book-teaser-cover",
  // Array item specs — nested arrays use sectionId-fieldKey pattern
  "home/slideshow-slides/image": "home/slideshow-slide",
  "home/training-cards-items/image": "home/training-card",
  "home/team-photos-items/image": "home/team-photo-large",
  "home/reviews-items/avatar": "reviews/simon-kornblum.jpg",
  "home/logos-items/image": "home/logo-item",
};

/** Get the display spec for a single image key */
export const getSpecForKey = query({
  args: { imageKey: v.string() },
  handler: async (ctx, { imageKey }) => {
    // Direct lookup
    const direct = await ctx.db
      .query("imageSpecs")
      .withIndex("by_key", (q) => q.eq("imageKey", imageKey))
      .first();
    if (direct) return direct;

    // Content key mapping: look up the real spec via the mapping (incl. indexed items)
    const mappedKey = resolveContentKeyToSpec(imageKey);
    if (mappedKey) {
      const mapped = await ctx.db
        .query("imageSpecs")
        .withIndex("by_key", (q) => q.eq("imageKey", mappedKey))
        .first();
      if (mapped) return mapped;
    }

    // Fallback: derive from siteImages width/height
    const siteImg = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", imageKey))
      .first();
    if (siteImg && siteImg.width && siteImg.height) {
      const allSpecs = await ctx.db.query("imageSpecs").collect();
      const match = allSpecs.find(
        (s) => s.displayWidth === siteImg.width && s.displayHeight === siteImg.height,
      );
      if (match) return match;
    }

    return null;
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
    pageSlugs: v.optional(v.array(v.string())),
    objectPosition: v.optional(v.string()),
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
        pageSlugs: args.pageSlugs,
        objectPosition: args.objectPosition,
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
        pageSlugs: v.optional(v.array(v.string())),
        objectPosition: v.optional(v.string()),
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
