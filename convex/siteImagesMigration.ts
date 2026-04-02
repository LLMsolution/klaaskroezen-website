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

/**
 * Migrate ALL known site images from the live site to Convex storage.
 * Run on production: Functions → siteImagesMigration:migrateAllFromSite → Run
 * Args: { "siteUrl": "https://www.klaaskroezen.com" }
 */
export const migrateAllFromSite = action({
  args: { siteUrl: v.string() },
  handler: async (ctx, { siteUrl }): Promise<{ uploaded: number; skipped: number }> => {
    // All known image paths derived from /public/images/
    const ALL_IMAGES: Array<{ key: string; path: string; category: string }> = [
      // Hero
      { key: "hero/sales-excellence-group.jpeg", path: "/images/hero/sales-excellence-group.jpeg", category: "hero" },
      { key: "hero/customer-success-group.jpg", path: "/images/hero/customer-success-group.jpg", category: "hero" },
      { key: "hero/customer-success-hero.jpeg", path: "/images/hero/customer-success-hero.jpeg", category: "hero" },
      { key: "hero/customer-success-hero-2.jpeg", path: "/images/hero/customer-success-hero-2.jpeg", category: "hero" },
      { key: "hero/og-image.jpeg", path: "/images/hero/og-image.jpeg", category: "hero" },
      // About
      { key: "about/klaas-kroezen-portrait.jpeg", path: "/images/about/klaas-kroezen-portrait.jpeg", category: "about" },
      { key: "about/klaas-kroezen-portrait-2.jpeg", path: "/images/about/klaas-kroezen-portrait-2.jpeg", category: "about" },
      { key: "about/klaas-over-mij.jpeg", path: "/images/about/klaas-over-mij.jpeg", category: "about" },
      { key: "about/kantoor-administratie.jpg", path: "/images/about/kantoor-administratie.jpg", category: "about" },
      { key: "about/tim-lind.png", path: "/images/about/tim-lind.png", category: "about" },
      { key: "about/joost-wammes.png", path: "/images/about/joost-wammes.png", category: "about" },
      { key: "about/sanne-bakker.png", path: "/images/about/sanne-bakker.png", category: "about" },
      // Spreker
      { key: "spreker/klaas-flipchart.jpeg", path: "/images/spreker/klaas-flipchart.jpeg", category: "spreker" },
      { key: "spreker/klaas-hero.jpeg", path: "/images/spreker/klaas-hero.jpeg", category: "spreker" },
      { key: "spreker/klaas-spreker-flipchart.jpg", path: "/images/spreker/klaas-spreker-flipchart.jpg", category: "spreker" },
      { key: "spreker/video-thumb-speech.jpg", path: "/images/spreker/video-thumb-speech.jpg", category: "spreker" },
      { key: "spreker/video-thumb-mindset.jpg", path: "/images/spreker/video-thumb-mindset.jpg", category: "spreker" },
      // Book
      { key: "book/sales-oprecht-ontspannen-cover.png", path: "/images/book/sales-oprecht-ontspannen-cover.png", category: "book" },
      { key: "book/boeklancering.jpeg", path: "/images/book/boeklancering.jpeg", category: "book" },
      // Book previews
      ...([5,6,7,8,9,11,14,19,21,24,25,27,28,31,33,35,39,132].map(n => ({
        key: `book/preview/page-${n}.png`, path: `/images/book/preview/page-${n}.png`, category: "book",
      }))),
      // Team
      { key: "team/heigo-group.jpeg", path: "/images/team/heigo-group.jpeg", category: "team" },
      { key: "team/training-group-1.jpeg", path: "/images/team/training-group-1.jpeg", category: "team" },
      { key: "team/training-group-2.jpeg", path: "/images/team/training-group-2.jpeg", category: "team" },
      { key: "team/training-group-3.jpeg", path: "/images/team/training-group-3.jpeg", category: "team" },
      { key: "team/training-group-4.jpeg", path: "/images/team/training-group-4.jpeg", category: "team" },
      { key: "team/joost-wammer-klaas.jpeg", path: "/images/team/joost-wammer-klaas.jpeg", category: "team" },
      { key: "team/visma-certificaat.jpeg", path: "/images/team/visma-certificaat.jpeg", category: "team" },
      { key: "team/whatsapp-group.jpeg", path: "/images/team/whatsapp-group.jpeg", category: "team" },
      { key: "team/ai-sales-training.jpeg", path: "/images/team/ai-sales-training.jpeg", category: "team" },
      // Training
      { key: "training/visma-youserve-session.jpg", path: "/images/training/visma-youserve-session.jpg", category: "training" },
      { key: "training/chris-laarman-thumb.jpg", path: "/images/training/chris-laarman-thumb.jpg", category: "training" },
      // Reviews
      { key: "reviews/simon-kornblum.jpg", path: "/images/reviews/simon-kornblum.jpg", category: "reviews" },
      { key: "reviews/michael-pilarczyk.jpeg", path: "/images/reviews/michael-pilarczyk.jpeg", category: "reviews" },
      { key: "reviews/mark-tigchelaar.jpeg", path: "/images/reviews/mark-tigchelaar.jpeg", category: "reviews" },
      { key: "reviews/tijn-touber.jpg", path: "/images/reviews/tijn-touber.jpg", category: "reviews" },
      // Logos
      ...["bots.png","edison.png","gp-products.png","gradient.png","heigo.png","leadinfo.png","mom-in-balance.png","mt-sprout.png","vasco.png","visma.png","zigt.webp"].map(f => ({
        key: `logos/${f}`, path: `/images/logos/${f}`, category: "logos",
      })),
      // Contact
      { key: "contact/klaas-contact.png", path: "/images/contact/klaas-contact.png", category: "contact" },
      { key: "contact/joost-contact.png", path: "/images/contact/joost-contact.png", category: "contact" },
      { key: "contact/kantoor.jpg", path: "/images/contact/kantoor.jpg", category: "contact" },
      // Blog
      ...["app-is-live.jpg","arches-capital.jpeg","bnr-podcast.jpg","boeklancering-event.jpeg","bots-coaching.jpeg",
        "gp-products-training.jpeg","heigo-training.jpeg","investeren-jonge-ondernemers.jpeg","jaap-klaas.jpeg",
        "joost-resultaat.jpeg","joost-wammes.jpeg","kilimanjaro-wim-hof.jpg","kitesurfen-golden-gate.jpeg",
        "klaas-managementboek-interview.jpg","klaas-tijn-touber.jpeg","mt-sprout-interview.jpeg",
        "nummer1-top100.jpeg","ouders-van-nu.jpeg","salesteam-transformatie.png","thijs-lindhout-podcast.webp",
        "tony-robbins-amsterdam.jpeg","tony-robbins-business-mastery.jpeg","tony-robbins-dwd.jpeg",
        "tony-robbins-upw.jpeg","top5-marketing.jpg","training-connection.jpeg","tweede-druk.jpeg",
        "vasco-consult.jpeg","wua-collage.jpeg","zeeveld.jpeg","zigt-programma.jpeg"].map(f => ({
        key: `blog/${f}`, path: `/images/blog/${f}`, category: "blog",
      })),
      // Icons
      { key: "icons/favicon.png", path: "/images/icons/favicon.png", category: "icons" },
      { key: "icons/step-1.png", path: "/images/icons/step-1.png", category: "icons" },
      { key: "icons/step-2.png", path: "/images/icons/step-2.png", category: "icons" },
      { key: "icons/step-3.png", path: "/images/icons/step-3.png", category: "icons" },
      // Logos (brand)
      { key: "logos/klaas-kroezen-black.png", path: "/images/logos/klaas-kroezen-black.png", category: "logos" },
      { key: "logos/klaas-kroezen-white.png", path: "/images/logos/klaas-kroezen-white.png", category: "logos" },
    ];

    let uploaded = 0;
    let skipped = 0;
    const batch: Array<{ key: string; storageId: string; fileName: string; category: string }> = [];

    for (const img of ALL_IMAGES) {
      const url = `${siteUrl}${img.path}`;
      try {
        const res = await fetch(url);
        if (!res.ok) { skipped++; continue; }

        const blob = await res.blob();
        const contentType = res.headers.get("content-type") || "image/jpeg";

        const uploadUrl = await ctx.storage.generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": contentType },
          body: blob,
        });

        if (!uploadRes.ok) { skipped++; continue; }

        const { storageId } = await uploadRes.json();
        batch.push({ key: img.key, storageId, fileName: img.path.split("/").pop() || img.key, category: img.category });
        uploaded++;

        if (batch.length >= 20) {
          await ctx.runMutation(internal.siteImages.bulkInsert, { images: batch as any });
          batch.length = 0;
        }
      } catch {
        skipped++;
      }
    }

    if (batch.length > 0) {
      await ctx.runMutation(internal.siteImages.bulkInsert, { images: batch as any });
    }

    return { uploaded, skipped };
  },
});
