import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { langValidator } from "./schema";
import { SECTION_SCHEMAS } from "./siteSchemas";

// ── Helpers ──

/** Recursively resolve "convex:<storageId>" values to signed URLs */
async function resolveConvexUrls(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  obj: unknown,
): Promise<unknown> {
  if (typeof obj === "string" && obj.startsWith("convex:")) {
    const storageId = obj.slice(7);
    const url = await ctx.storage.getUrl(storageId);
    return url ?? obj;
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((item) => resolveConvexUrls(ctx, item)));
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = await resolveConvexUrls(ctx, value);
    }
    return result;
  }
  return obj;
}

// ── Public queries ──

/** Get a page definition with its section list */
export const getPage = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("sitePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

/** Get all content for a page (both languages) */
export const getPageContent = query({
  args: {
    slug: v.string(),
    lang: v.optional(langValidator),
  },
  handler: async (ctx, { slug, lang }) => {
    const entries = await ctx.db
      .query("siteContent")
      .withIndex("by_page", (q) => q.eq("pageSlug", slug))
      .collect();

    const filtered = lang
      ? entries.filter((e) => e.lang === lang)
      : entries;

    // Build NL image lookup for fallback (non-NL languages inherit NL images)
    const nlImages: Record<string, Record<string, unknown>> = {};
    if (lang && lang !== "nl") {
      const nlEntries = entries.filter((e) => e.lang === "nl");
      for (const entry of nlEntries) {
        try {
          const parsed = JSON.parse(entry.content);
          nlImages[entry.sectionId] = extractImageFields(parsed);
        } catch { /* skip */ }
      }
    }

    const result: Record<string, Record<string, unknown>> = {};
    for (const entry of filtered) {
      const key = lang ? entry.sectionId : `${entry.sectionId}_${entry.lang}`;
      try {
        const parsed = JSON.parse(entry.content);
        // Merge NL images as fallback for empty image fields
        const nlFallback = nlImages[entry.sectionId];
        const merged = nlFallback ? mergeImageFallbacks(parsed, nlFallback) : parsed;
        result[key] = await resolveConvexUrls(ctx, merged) as Record<string, unknown>;
      } catch {
        result[key] = {};
      }
    }
    return result;
  },
});

/** Extract fields that look like image refs (convex: or /images/) */
function extractImageFields(obj: Record<string, unknown>): Record<string, unknown> {
  const images: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string" && (val.startsWith("convex:") || val.startsWith("/images/"))) {
      images[key] = val;
    }
  }
  return images;
}

/** Fill empty/missing image fields with NL fallback values */
function mergeImageFallbacks(
  target: Record<string, unknown>,
  nlImages: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const [key, val] of Object.entries(nlImages)) {
    if (!result[key] || result[key] === "") {
      result[key] = val;
    }
  }
  return result;
}

/** Get a single section's content */
export const getSection = query({
  args: {
    pageSlug: v.string(),
    sectionId: v.string(),
    lang: langValidator,
  },
  handler: async (ctx, { pageSlug, sectionId, lang }) => {
    const entry = await ctx.db
      .query("siteContent")
      .withIndex("by_page_section", (q) =>
        q.eq("pageSlug", pageSlug).eq("sectionId", sectionId).eq("lang", lang),
      )
      .first();

    if (!entry) return null;
    try {
      return {
        ...entry,
        parsedContent: JSON.parse(entry.content),
        parsedSchema: JSON.parse(entry.schema),
      };
    } catch {
      return { ...entry, parsedContent: {}, parsedSchema: {} };
    }
  },
});

// ── Admin queries ──

/** List all pages for admin page selector */
export const listPages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("sitePages").collect();
  },
});

/** Get all content entries for a page (admin, both langs) */
export const getPageContentAdmin = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    await requireAdmin(ctx);
    const entries = await ctx.db
      .query("siteContent")
      .withIndex("by_page", (q) => q.eq("pageSlug", slug))
      .collect();

    // Look up the page to find section types
    const page = await ctx.db
      .query("sitePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    const sectionTypeById = new Map<string, string>();
    if (page) {
      for (const s of page.sections) sectionTypeById.set(s.id, s.type);
    }

    const resolved = [];
    for (const entry of entries) {
      try {
        const raw = JSON.parse(entry.content);
        const display = await resolveConvexUrls(ctx, raw);
        // Use LIVE schema from SECTION_SCHEMAS instead of stale stored schema
        const sectionType = sectionTypeById.get(entry.sectionId);
        const liveSchema = sectionType ? SECTION_SCHEMAS[sectionType] : undefined;
        resolved.push({
          ...entry,
          parsedContent: raw,       // Raw data with convex: refs (for saving)
          displayContent: display,  // Resolved URLs (for admin previews)
          parsedSchema: liveSchema ?? JSON.parse(entry.schema),
        });
      } catch {
        resolved.push({ ...entry, parsedContent: {}, displayContent: {}, parsedSchema: {} });
      }
    }
    return resolved;
  },
});

// ── Admin mutations ──

/** Update content JSON for a section */
export const updateSection = mutation({
  args: {
    pageSlug: v.string(),
    sectionId: v.string(),
    lang: langValidator,
    content: v.string(), // JSON string
  },
  handler: async (ctx, { pageSlug, sectionId, lang, content }) => {
    await requireAdmin(ctx);

    // Validate JSON
    try {
      JSON.parse(content);
    } catch {
      throw new Error("Ongeldige JSON content.");
    }

    const entry = await ctx.db
      .query("siteContent")
      .withIndex("by_page_section", (q) =>
        q.eq("pageSlug", pageSlug).eq("sectionId", sectionId).eq("lang", lang),
      )
      .first();

    if (!entry) {
      throw new Error(`Sectie ${sectionId} niet gevonden voor ${pageSlug} (${lang}).`);
    }

    await ctx.db.patch(entry._id, {
      content,
      updatedAt: Date.now(),
    });
  },
});

/** Reset section content so it falls back to the code-defined default */
export const resetSection = mutation({
  args: {
    pageSlug: v.string(),
    sectionId: v.string(),
    lang: langValidator,
  },
  handler: async (ctx, { pageSlug, sectionId, lang }) => {
    await requireAdmin(ctx);

    const entry = await ctx.db
      .query("siteContent")
      .withIndex("by_page_section", (q) =>
        q.eq("pageSlug", pageSlug).eq("sectionId", sectionId).eq("lang", lang),
      )
      .first();

    if (!entry) {
      throw new Error(`Sectie ${sectionId} niet gevonden voor ${pageSlug} (${lang}).`);
    }

    await ctx.db.patch(entry._id, {
      content: "{}",
      updatedAt: Date.now(),
    });
  },
});

/** Reorder sections on a page */
export const reorderSections = mutation({
  args: {
    pageSlug: v.string(),
    sectionIds: v.array(v.string()),
  },
  handler: async (ctx, { pageSlug, sectionIds }) => {
    await requireAdmin(ctx);

    const page = await ctx.db
      .query("sitePages")
      .withIndex("by_slug", (q) => q.eq("slug", pageSlug))
      .first();

    if (!page) throw new Error(`Pagina ${pageSlug} niet gevonden.`);

    const reordered = sectionIds.map((id, index) => {
      const existing = page.sections.find((s) => s.id === id);
      if (!existing) throw new Error(`Sectie ${id} niet gevonden.`);
      return { ...existing, sortOrder: index };
    });

    // Keep any sections not in the reorder list at the end
    const remaining = page.sections
      .filter((s) => !sectionIds.includes(s.id))
      .map((s, i) => ({ ...s, sortOrder: reordered.length + i }));

    await ctx.db.patch(page._id, {
      sections: [...reordered, ...remaining],
      updatedAt: Date.now(),
    });
  },
});

/** Toggle section active/inactive */
export const toggleSection = mutation({
  args: {
    pageSlug: v.string(),
    sectionId: v.string(),
  },
  handler: async (ctx, { pageSlug, sectionId }) => {
    await requireAdmin(ctx);

    const page = await ctx.db
      .query("sitePages")
      .withIndex("by_slug", (q) => q.eq("slug", pageSlug))
      .first();

    if (!page) throw new Error(`Pagina ${pageSlug} niet gevonden.`);

    const sections = page.sections.map((s) =>
      s.id === sectionId ? { ...s, active: !s.active } : s,
    );

    await ctx.db.patch(page._id, {
      sections,
      updatedAt: Date.now(),
    });
  },
});

/** Sync a page's content from seed data (admin only) */
export const syncFromSeed = action({
  args: { pageSlug: v.string() },
  handler: async (ctx, { pageSlug }): Promise<number> => {
    await ctx.runMutation(api.layoutEditor.verifyAdmin);
    const result: number = await ctx.runMutation(internal.siteSeed.syncPageContentFull, { pageSlug });
    return result;
  },
});
