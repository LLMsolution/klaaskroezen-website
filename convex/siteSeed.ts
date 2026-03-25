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

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const existingPages = await ctx.db.query("sitePages").collect();
    for (const page of existingPages) {
      await ctx.db.delete(page._id);
    }
    const existingContent = await ctx.db.query("siteContent").collect();
    for (const content of existingContent) {
      await ctx.db.delete(content._id);
    }

    const now = Date.now();
    const pages: PageSeed[] = [
      seedSetContent(),
      seedCstContent(),
      seedBoekContent(),
      seedSprekerContent(),
      seedOverOnsContent(),
    ];

    for (const page of pages) {
      await ctx.db.insert("sitePages", {
        slug: page.slug,
        title: page.title,
        sections: page.sections,
        createdAt: now,
        updatedAt: now,
      });

      for (const entry of page.content) {
        await ctx.db.insert("siteContent", entry);
      }
    }
  },
});
