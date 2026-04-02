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

/**
 * Clean up duplicate siteImages entries created by registerContentImages.
 * Removes entries with auto-generated keys (page/section/field format)
 * when a proper named entry already exists with the same storageId.
 * Also renames Yvon to a proper key.
 *
 * Run: Dashboard → Functions → siteImagesMigrateContent:cleanupDuplicates
 */
export const cleanupDuplicates = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ deleted: number; renamed: number }> => {
    const allImages = await ctx.db.query("siteImages").collect();

    // Build storageId → entries map
    const byStorageId = new Map<string, typeof allImages>();
    for (const img of allImages) {
      const existing = byStorageId.get(img.storageId) || [];
      existing.push(img);
      byStorageId.set(img.storageId, existing);
    }

    let deleted = 0;
    let renamed = 0;

    for (const [, entries] of byStorageId) {
      if (entries.length <= 1) continue;

      // Find the "proper" entry (one with a filename-style key like about/tim-lind.png)
      const proper = entries.find((e) => e.key.includes("."));
      const autoGenerated = entries.filter((e) => !e.key.includes("."));

      if (proper && autoGenerated.length > 0) {
        // Delete auto-generated duplicates
        for (const dup of autoGenerated) {
          await ctx.db.delete(dup._id);
          deleted++;
        }
      }
    }

    // Find orphaned auto-generated entries (no proper key counterpart)
    // These are entries like over-ons/team/members-3/image for Yvon
    const remaining = await ctx.db.query("siteImages").collect();
    for (const img of remaining) {
      // Skip entries that already have a proper filename key
      if (img.key.includes(".")) continue;

      // Try to derive a proper key from the content
      // Pattern: "over-ons/team/members-3/image" → check siteContent for the name
      const contentEntries = await ctx.db
        .query("siteContent")
        .withIndex("by_page", (q) => q.eq("pageSlug", img.category))
        .collect();

      for (const entry of contentEntries) {
        if (!entry.content.includes(img.storageId)) continue;

        try {
          const parsed = JSON.parse(entry.content);
          // Look for the member name in arrays
          for (const [, fieldValue] of Object.entries(parsed)) {
            if (!Array.isArray(fieldValue)) continue;
            for (const item of fieldValue) {
              if (typeof item !== "object" || item === null) continue;
              const obj = item as Record<string, unknown>;
              // Check if this item references our storageId
              const hasRef = Object.values(obj).some(
                (v) => typeof v === "string" && v.includes(img.storageId),
              );
              if (!hasRef) continue;

              // Found the item — use the name to create a proper key
              const name = (obj.name as string) || "";
              if (name) {
                const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                const newKey = `${img.category}/${slug}.webp`;
                await ctx.db.patch(img._id, { key: newKey, category: img.category });
                renamed++;
              }
            }
          }
        } catch { /* skip parse errors */ }
      }
    }

    return { deleted, renamed };
  },
});

/** Fix category and key for images that were registered with wrong category */
export const fixCategories = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ fixed: number }> => {
    const allImages = await ctx.db.query("siteImages").collect();
    let fixed = 0;

    for (const img of allImages) {
      // Derive correct category from key prefix
      const keyCategory = img.key.split("/")[0];
      if (keyCategory && keyCategory !== img.category) {
        await ctx.db.patch(img._id, { category: keyCategory });
        fixed++;
      }
    }

    return { fixed };
  },
});

/** Rename an image key and update all siteContent references */
export const renameImageKey = internalMutation({
  args: { oldKey: v.string(), newKey: v.string(), newCategory: v.string() },
  handler: async (ctx, { oldKey, newKey, newCategory }) => {
    const img = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", oldKey))
      .first();
    if (!img) throw new Error(`Image ${oldKey} niet gevonden`);

    // Update siteImages record
    await ctx.db.patch(img._id, { key: newKey, category: newCategory });

    // Update siteContent references: convex:<storageId> stays the same,
    // but if any content has the old key as a string value, update it
    const entries = await ctx.db.query("siteContent").collect();
    let updated = 0;
    for (const entry of entries) {
      if (entry.content.includes(oldKey)) {
        await ctx.db.patch(entry._id, {
          content: entry.content.split(oldKey).join(newKey),
          updatedAt: Date.now(),
        });
        updated++;
      }
    }

    return { renamed: true, contentUpdated: updated };
  },
});
