import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { langValidator } from "./schema";

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

    const result: Record<string, Record<string, unknown>> = {};
    for (const entry of filtered) {
      const key = lang ? entry.sectionId : `${entry.sectionId}_${entry.lang}`;
      try {
        result[key] = JSON.parse(entry.content);
      } catch {
        result[key] = {};
      }
    }
    return result;
  },
});

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

    return entries.map((entry) => {
      try {
        return {
          ...entry,
          parsedContent: JSON.parse(entry.content),
          parsedSchema: JSON.parse(entry.schema),
        };
      } catch {
        return { ...entry, parsedContent: {}, parsedSchema: {} };
      }
    });
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
