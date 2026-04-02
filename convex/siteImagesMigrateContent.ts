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

/**
 * Register all convex: image references from siteContent into siteImages.
 * This makes content-uploaded images visible in the Images tab.
 *
 * Run: Dashboard → Functions → siteImagesMigrateContent:registerContentImages
 */
export const registerContentImages = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ registered: number; skipped: number }> => {
    const entries = await ctx.db.query("siteContent").collect();
    const existingImages = await ctx.db.query("siteImages").collect();
    const existingKeys = new Set(existingImages.map((i) => i.key));

    let registered = 0;
    let skipped = 0;

    for (const entry of entries) {
      // Find all convex: references
      const matches = entry.content.match(/convex:([\w]+)/g);
      if (!matches) continue;

      // Parse the JSON to find field names for the storageIds
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(entry.content); } catch { continue; }

      for (const [fieldName, fieldValue] of Object.entries(parsed)) {
        if (typeof fieldValue === "string" && fieldValue.startsWith("convex:")) {
          const storageId = fieldValue.slice(7);
          const key = `${entry.pageSlug}/${entry.sectionId}/${fieldName}`;

          if (existingKeys.has(key)) { skipped++; continue; }

          await ctx.db.insert("siteImages", {
            key,
            storageId: storageId as any,
            fileName: `${fieldName}.webp`,
            category: entry.pageSlug,
            createdAt: Date.now(),
          });
          existingKeys.add(key);
          registered++;
        }

        // Also handle arrays of objects with image fields
        if (Array.isArray(fieldValue)) {
          for (let i = 0; i < fieldValue.length; i++) {
            const item = fieldValue[i];
            if (typeof item === "object" && item !== null) {
              for (const [subKey, subVal] of Object.entries(item as Record<string, unknown>)) {
                if (typeof subVal === "string" && subVal.startsWith("convex:")) {
                  const storageId = subVal.slice(7);
                  const key = `${entry.pageSlug}/${entry.sectionId}/${fieldName}-${i}/${subKey}`;

                  if (existingKeys.has(key)) { skipped++; continue; }

                  await ctx.db.insert("siteImages", {
                    key,
                    storageId: storageId as any,
                    fileName: `${subKey}.webp`,
                    category: entry.pageSlug,
                    createdAt: Date.now(),
                  });
                  existingKeys.add(key);
                  registered++;
                }
              }
            }
          }
        }
      }
    }

    return { registered, skipped };
  },
});
