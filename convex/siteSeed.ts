import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { SECTION_SCHEMAS } from "./siteSchemas";
import { seedSetContent } from "./siteSeedSet";
import { seedCstContent } from "./siteSeedCst";
import { seedBoekContent } from "./siteSeedBoek";
import { seedSprekerContent } from "./siteSeedSpreker";
import { seedOverOnsContent } from "./siteSeedOverOns";
import { seedContactContent } from "./siteSeedContact";
import { seedHomeContent } from "./siteSeedHome";
import { seedCheckoutSharedContent } from "./siteSeedCheckout";

type SectionDef = {
  id: string;
  type: string;
  active: boolean;
  sortOrder: number;
};

type ContentEntry = {
  pageSlug: string;
  sectionId: string;
  lang: "nl" | "en" | "de";
  schema: string;
  content: string;
  updatedAt: number;
};

export type PageSeed = {
  slug: string;
  title: { nl: string; en: string; de?: string };
  sections: SectionDef[];
  content: ContentEntry[];
};

/** Helper: build a content entry for a section */
export function makeContent(
  pageSlug: string,
  sectionId: string,
  type: string,
  lang: "nl" | "en" | "de",
  data: Record<string, unknown>,
): ContentEntry {
  const schema = SECTION_SCHEMAS[type];
  return {
    pageSlug,
    sectionId,
    lang,
    schema: JSON.stringify(schema || {}),
    content: JSON.stringify(data),
    updatedAt: Date.now(),
  };
}

/** Central list of all page seeds — AI layout editor adds new imports + entries here */
function getAllSeeds(): PageSeed[] {
  return [
    seedHomeContent(), seedSetContent(), seedCstContent(), seedBoekContent(),
    seedSprekerContent(), seedOverOnsContent(), seedContactContent(),
    seedCheckoutSharedContent(),
  ];
}

/** DESTRUCTIVE seed — clears all existing content and re-seeds. Use only for initial setup. */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingPages = await ctx.db.query("sitePages").collect();
    for (const page of existingPages) await ctx.db.delete(page._id);
    const existingContent = await ctx.db.query("siteContent").collect();
    for (const content of existingContent) await ctx.db.delete(content._id);

    const now = Date.now();
    const pages = getAllSeeds();

    for (const page of pages) {
      await ctx.db.insert("sitePages", {
        slug: page.slug, title: page.title, sections: page.sections,
        createdAt: now, updatedAt: now,
      });
      for (const entry of page.content) await ctx.db.insert("siteContent", entry);
    }
  },
});

/** Sync missing language entries for existing sections (adds DE where only NL/EN exist). */
export const syncMissingLangs = internalMutation({
  args: {},
  handler: async (ctx): Promise<number> => {
    const pages = getAllSeeds();
    let added = 0;

    for (const page of pages) {
      for (const entry of page.content) {
        // Check if this exact (page, section, lang) already exists
        const existing = await ctx.db.query("siteContent")
          .withIndex("by_page_section", (q) =>
            q.eq("pageSlug", entry.pageSlug).eq("sectionId", entry.sectionId).eq("lang", entry.lang as "nl" | "en" | "de"),
          )
          .first();
        if (!existing) {
          await ctx.db.insert("siteContent", entry);
          added++;
        }
      }
    }
    return added;
  },
});

/** SAFE sync — adds new pages/sections without overwriting existing admin edits. */
export const syncNewContent = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pages = getAllSeeds();

    let added = 0;
    for (const page of pages) {
      // Check if page exists
      const existing = await ctx.db.query("sitePages")
        .filter((q) => q.eq(q.field("slug"), page.slug))
        .first();

      if (!existing) {
        // New page — create it with all content
        await ctx.db.insert("sitePages", {
          slug: page.slug, title: page.title, sections: page.sections,
          createdAt: now, updatedAt: now,
        });
        for (const entry of page.content) {
          await ctx.db.insert("siteContent", entry);
        }
        added++;
      } else {
        // Page exists — check for new sections only
        const existingSections = existing.sections.map((s: { id: string }) => s.id);
        const newSections = page.sections.filter((s) => !existingSections.includes(s.id));

        if (newSections.length > 0) {
          // Add new sections to the page
          await ctx.db.patch(existing._id, {
            sections: [...existing.sections, ...newSections],
            updatedAt: now,
          });

          // Add content entries for new sections only
          for (const entry of page.content) {
            if (newSections.some((s) => s.id === entry.sectionId)) {
              const contentExists = await ctx.db.query("siteContent")
                .withIndex("by_page_section", (q) =>
                  q.eq("pageSlug", entry.pageSlug).eq("sectionId", entry.sectionId).eq("lang", entry.lang as "nl" | "en" | "de"),
                )
                .first();
              if (!contentExists) {
                await ctx.db.insert("siteContent", entry);
                added++;
              }
            }
          }
        }
      }
    }
    return added;
  },
});

/** Force-sync content for a specific page — overwrites existing content from seed. */
export const syncPageContentFull = internalMutation({
  args: { pageSlug: v.string() },
  handler: async (ctx, { pageSlug }) => {
    const pages = getAllSeeds();

    const pageSeed = pages.find((p) => p.slug === pageSlug);
    if (!pageSeed) return 0;

    const now = Date.now();
    let updated = 0;

    // Ensure page exists
    const existing = await ctx.db.query("sitePages")
      .filter((q) => q.eq(q.field("slug"), pageSlug))
      .first();

    if (!existing) {
      await ctx.db.insert("sitePages", {
        slug: pageSeed.slug, title: pageSeed.title, sections: pageSeed.sections,
        createdAt: now, updatedAt: now,
      });
    } else {
      // Add any new sections
      const existingSectionIds = existing.sections.map((s: { id: string }) => s.id);
      const newSections = pageSeed.sections.filter((s) => !existingSectionIds.includes(s.id));
      if (newSections.length > 0) {
        await ctx.db.patch(existing._id, {
          sections: [...existing.sections, ...newSections],
          updatedAt: now,
        });
      }
    }

    // Upsert ALL content entries — overwrite existing
    for (const entry of pageSeed.content) {
      const existingContent = await ctx.db.query("siteContent")
        .withIndex("by_page_section", (q) =>
          q.eq("pageSlug", entry.pageSlug).eq("sectionId", entry.sectionId).eq("lang", entry.lang as "nl" | "en" | "de"),
        )
        .first();

      if (existingContent) {
        await ctx.db.patch(existingContent._id, {
          content: entry.content,
          schema: entry.schema,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("siteContent", entry);
      }
      updated++;
    }

    return updated;
  },
});
