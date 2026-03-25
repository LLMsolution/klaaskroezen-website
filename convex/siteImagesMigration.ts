"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import * as fs from "fs";
import * as path from "path";

/**
 * Migration: upload all images from /public/images/ to Convex storage.
 * Run via: npx convex run siteImagesMigration:migrateAll
 *
 * This reads the local filesystem, so it must run from the developer machine
 * where the repo is checked out.
 */
export const migrateAll = action({
  args: { basePath: v.optional(v.string()) },
  handler: async (ctx, { basePath }): Promise<{ uploaded: number; skipped: number }> => {
    // This action needs to be called differently — Convex actions run on the server
    // and don't have access to the local filesystem.
    // Instead, we'll provide a list of images to upload from the client side.
    throw new Error(
      "Use the migrateFromUrls action instead. " +
      "The local filesystem is not accessible from Convex actions. " +
      "Upload images via the admin UI or use the bulk upload script."
    );
  },
});

/**
 * Migrate images by uploading them via their public URLs.
 * This works from the Convex server since the images are served by Vercel.
 */
export const migrateFromSite = action({
  args: {
    siteUrl: v.string(),
    images: v.array(v.object({
      key: v.string(),
      path: v.string(),
      category: v.string(),
    })),
  },
  handler: async (ctx, { siteUrl, images }): Promise<{ uploaded: number; skipped: number }> => {
    let uploaded = 0;
    let skipped = 0;
    const batch: Array<{ key: string; storageId: string; fileName: string; category: string }> = [];

    for (const img of images) {
      // Fetch image from the live site
      const url = `${siteUrl}${img.path}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`Skip ${img.key}: fetch failed (${res.status})`);
        skipped++;
        continue;
      }

      const blob = await res.blob();
      const contentType = res.headers.get("content-type") || "image/jpeg";

      // Upload to Convex storage
      const uploadUrl = await ctx.storage.generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: blob,
      });

      if (!uploadRes.ok) {
        console.log(`Skip ${img.key}: upload failed`);
        skipped++;
        continue;
      }

      const { storageId } = await uploadRes.json();
      const fileName = img.path.split("/").pop() || img.key;

      batch.push({ key: img.key, storageId, fileName, category: img.category });
      uploaded++;

      // Insert in batches of 20
      if (batch.length >= 20) {
        await ctx.runMutation(internal.siteImages.bulkInsert, { images: batch as any });
        batch.length = 0;
      }
    }

    // Insert remaining
    if (batch.length > 0) {
      await ctx.runMutation(internal.siteImages.bulkInsert, { images: batch as any });
    }

    console.log(`Migration complete: ${uploaded} uploaded, ${skipped} skipped`);
    return { uploaded, skipped };
  },
});
