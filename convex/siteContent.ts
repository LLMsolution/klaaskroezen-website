import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
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

    // Build NL content lookup for image fallback (non-NL languages inherit NL images)
    const nlContent: Record<string, Record<string, unknown>> = {};
    if (lang && lang !== "nl") {
      const nlEntries = entries.filter((e) => e.lang === "nl");
      for (const entry of nlEntries) {
        try {
          nlContent[entry.sectionId] = JSON.parse(entry.content);
        } catch { /* skip */ }
      }
    }

    const result: Record<string, Record<string, unknown>> = {};
    for (const entry of filtered) {
      const key = lang ? entry.sectionId : `${entry.sectionId}_${entry.lang}`;
      try {
        const parsed = JSON.parse(entry.content);
        // Merge NL images as fallback for empty image fields (recursive over arrays/objects)
        const nlFallback = nlContent[entry.sectionId];
        const merged = nlFallback ? mergeImageFallbacks(parsed, nlFallback) : parsed;
        result[key] = await resolveConvexUrls(ctx, merged) as Record<string, unknown>;
      } catch {
        result[key] = {};
      }
    }
    return result;
  },
});

type Path = (string | number)[];

function isImageRef(val: unknown): val is string {
  return typeof val === "string" && (val.startsWith("convex:") || val.startsWith("/images/"));
}

/** Walk an arbitrary object and collect every image-ref string with its path. */
function collectImagePaths(
  obj: unknown,
  prefix: Path = [],
  out: { path: Path; value: string }[] = [],
): { path: Path; value: string }[] {
  if (isImageRef(obj)) {
    out.push({ path: prefix, value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectImagePaths(item, [...prefix, i], out));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      collectImagePaths(v, [...prefix, k], out);
    }
  }
  return out;
}

function getAtPath(obj: unknown, path: Path): unknown {
  let cur: unknown = obj;
  for (const seg of path) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof seg === "number") {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[seg];
    } else {
      if (typeof cur !== "object") return undefined;
      cur = (cur as Record<string, unknown>)[seg];
    }
  }
  return cur;
}

/** Set value at path only if the containing structure already exists. Returns true if set. */
function setIfPathExists(obj: unknown, path: Path, value: unknown): boolean {
  if (path.length === 0) return false;
  let cur: unknown = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    if (typeof seg === "number") {
      if (!Array.isArray(cur) || cur[seg] === undefined) return false;
      cur = cur[seg];
    } else {
      if (typeof cur !== "object" || cur === null) return false;
      cur = (cur as Record<string, unknown>)[seg];
    }
  }
  const last = path[path.length - 1];
  if (typeof last === "number") {
    if (!Array.isArray(cur)) return false;
    cur[last] = value;
    return true;
  }
  if (typeof cur !== "object" || cur === null) return false;
  (cur as Record<string, unknown>)[last] = value;
  return true;
}

/**
 * Fill image fields in `target` with NL values wherever `target` is empty at that path.
 * Recurses into objects and arrays so nested items[].image works.
 */
function mergeImageFallbacks(
  target: Record<string, unknown>,
  nl: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = JSON.parse(JSON.stringify(target));
  const nlPaths = collectImagePaths(nl);
  for (const { path, value } of nlPaths) {
    const cur = getAtPath(result, path);
    if (cur === undefined || cur === null || cur === "") {
      setIfPathExists(result, path, value);
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

/** Update (or create) content JSON for a section */
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
      // Entry doesn't exist yet for this lang — create it with schema from NL entry
      const nlEntry = await ctx.db
        .query("siteContent")
        .withIndex("by_page_section", (q) =>
          q.eq("pageSlug", pageSlug).eq("sectionId", sectionId).eq("lang", "nl"),
        )
        .first();
      await ctx.db.insert("siteContent", {
        pageSlug,
        sectionId,
        lang,
        content,
        schema: nlEntry?.schema ?? "{}",
        updatedAt: Date.now(),
      });
      return;
    }

    await ctx.db.patch(entry._id, {
      content,
      updatedAt: Date.now(),
    });

    // When saving NL, propagate every image field to EN/DE recursively.
    // NL is leading — any per-language image override is replaced on the next NL save.
    if (lang === "nl") {
      const newNlContent = JSON.parse(content) as Record<string, unknown>;
      const imagePaths = collectImagePaths(newNlContent);

      if (imagePaths.length > 0) {
        for (const otherLang of ["en", "de"] as const) {
          const otherEntry = await ctx.db
            .query("siteContent")
            .withIndex("by_page_section", (q) =>
              q.eq("pageSlug", pageSlug).eq("sectionId", sectionId).eq("lang", otherLang),
            )
            .first();
          if (!otherEntry) continue;
          let otherContent: Record<string, unknown>;
          try { otherContent = JSON.parse(otherEntry.content); } catch { continue; }

          let changed = false;
          for (const { path, value: newVal } of imagePaths) {
            if (getAtPath(otherContent, path) !== newVal && setIfPathExists(otherContent, path, newVal)) {
              changed = true;
            }
          }
          if (changed) {
            await ctx.db.patch(otherEntry._id, {
              content: JSON.stringify(otherContent),
              updatedAt: Date.now(),
            });
          }
        }
      }
    }
  },
});

/** One-shot resync: copy every NL image field into existing EN/DE entries. */
export const resyncImagesFromNL = internalMutation({
  args: {},
  handler: async (ctx) => {
    const nlEntries = await ctx.db
      .query("siteContent")
      .filter((q) => q.eq(q.field("lang"), "nl"))
      .collect();

    let updatedEntries = 0;
    let updatedFields = 0;
    for (const nlEntry of nlEntries) {
      let nlContent: Record<string, unknown>;
      try { nlContent = JSON.parse(nlEntry.content); } catch { continue; }
      const paths = collectImagePaths(nlContent);
      if (paths.length === 0) continue;

      for (const otherLang of ["en", "de"] as const) {
        const other = await ctx.db
          .query("siteContent")
          .withIndex("by_page_section", (q) =>
            q.eq("pageSlug", nlEntry.pageSlug).eq("sectionId", nlEntry.sectionId).eq("lang", otherLang),
          )
          .first();
        if (!other) continue;
        let otherContent: Record<string, unknown>;
        try { otherContent = JSON.parse(other.content); } catch { continue; }

        let changed = false;
        for (const { path, value } of paths) {
          if (getAtPath(otherContent, path) !== value && setIfPathExists(otherContent, path, value)) {
            changed = true;
            updatedFields++;
          }
        }
        if (changed) {
          await ctx.db.patch(other._id, {
            content: JSON.stringify(otherContent),
            updatedAt: Date.now(),
          });
          updatedEntries++;
        }
      }
    }
    return { updatedEntries, updatedFields };
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
