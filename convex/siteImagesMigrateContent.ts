import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Find all `/images/...` paths in siteContent and replace with `convex:<storageId>`.
 * This connects the content editor to Convex storage so admin image changes propagate.
 *
 * Run: Dashboard → Functions → siteImagesMigrateContent:migrateContentImages
 */

/** List all siteContent entries that contain /images/ paths */
export const findStaticImagePaths = internalQuery({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("siteContent").collect();
    const results: Array<{
      id: string;
      pageSlug: string;
      sectionId: string;
      lang: string;
      staticPaths: string[];
    }> = [];

    for (const entry of entries) {
      const matches = entry.content.match(/\/images\/[^"'\s,}]+/g);
      if (matches && matches.length > 0) {
        results.push({
          id: entry._id,
          pageSlug: entry.pageSlug,
          sectionId: entry.sectionId,
          lang: entry.lang,
          staticPaths: [...new Set(matches)],
        });
      }
    }
    return results;
  },
});

/** Replace all /images/ paths in siteContent with convex: references */
export const migrateContentImages = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, { dryRun }): Promise<{
    updated: number;
    skipped: number;
    notFound: string[];
    replacements: Array<{ page: string; section: string; from: string; to: string }>;
  }> => {
    const entries = await ctx.db.query("siteContent").collect();
    const siteImages = await ctx.db.query("siteImages").collect();

    // Build lookup: key → storageId (only images with valid storage)
    const keyToStorageId = new Map<string, string>();
    for (const img of siteImages) {
      if (!img.lang) {
        keyToStorageId.set(img.key, img.storageId);
      }
    }

    let updated = 0;
    let skipped = 0;
    const notFound: string[] = [];
    const replacements: Array<{ page: string; section: string; from: string; to: string }> = [];

    for (const entry of entries) {
      const matches = entry.content.match(/\/images\/[^"'\s,}]+/g);
      if (!matches || matches.length === 0) {
        skipped++;
        continue;
      }

      let newContent = entry.content;
      let changed = false;

      for (const staticPath of [...new Set(matches)]) {
        // Convert /images/about/tim-lind.png → about/tim-lind.png
        const key = staticPath.replace(/^\/images\//, "");
        const storageId = keyToStorageId.get(key);

        if (!storageId) {
          notFound.push(`${entry.pageSlug}/${entry.sectionId}: ${staticPath}`);
          continue;
        }

        const convexRef = `convex:${storageId}`;
        newContent = newContent.split(staticPath).join(convexRef);
        changed = true;
        replacements.push({
          page: entry.pageSlug,
          section: entry.sectionId,
          from: staticPath,
          to: convexRef,
        });
      }

      if (changed && !dryRun) {
        await ctx.db.patch(entry._id, {
          content: newContent,
          updatedAt: Date.now(),
        });
        updated++;
      } else if (changed) {
        updated++; // Count as "would update" in dry run
      } else {
        skipped++;
      }
    }

    return { updated, skipped, notFound, replacements };
  },
});
