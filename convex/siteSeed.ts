import { internalMutation } from "./_generated/server";
import { SECTION_SCHEMAS } from "./siteSchemas";
import { seedSetContent } from "./siteSeedSet";
import { seedCstContent } from "./siteSeedCst";
import { seedBoekContent } from "./siteSeedBoek";
import { seedSprekerContent } from "./siteSeedSpreker";
import { seedOverOnsContent } from "./siteSeedOverOns";

type SectionDef = {
  id: string;
  type: string;
  active: boolean;
  sortOrder: number;
};

type ContentEntry = {
  pageSlug: string;
  sectionId: string;
  lang: "nl" | "en";
  schema: string;
  content: string;
  updatedAt: number;
};

export type PageSeed = {
  slug: string;
  title: { nl: string; en: string };
  sections: SectionDef[];
  content: ContentEntry[];
};

/** Helper: build a content entry for a section */
export function makeContent(
  pageSlug: string,
  sectionId: string,
  type: string,
  lang: "nl" | "en",
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

/** DESTRUCTIVE seed — clears all existing content and re-seeds. Use only for initial setup. */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingPages = await ctx.db.query("sitePages").collect();
    for (const page of existingPages) await ctx.db.delete(page._id);
    const existingContent = await ctx.db.query("siteContent").collect();
    for (const content of existingContent) await ctx.db.delete(content._id);

    const now = Date.now();
    const pages: PageSeed[] = [
      seedSetContent(), seedCstContent(), seedBoekContent(),
      seedSprekerContent(), seedOverOnsContent(),
    ];

    for (const page of pages) {
      await ctx.db.insert("sitePages", {
        slug: page.slug, title: page.title, sections: page.sections,
        createdAt: now, updatedAt: now,
      });
      for (const entry of page.content) await ctx.db.insert("siteContent", entry);
    }
  },
});

/** SAFE sync — adds new pages/sections without overwriting existing admin edits. */
export const syncNewContent = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pages: PageSeed[] = [
      seedSetContent(), seedCstContent(), seedBoekContent(),
      seedSprekerContent(), seedOverOnsContent(),
    ];

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
