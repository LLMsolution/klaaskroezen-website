import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

type SpecEntry = {
  imageKey: string;
  displayWidth: number;
  displayHeight: number;
  aspectRatio: string;
  context: string;
  pageSlug?: string;
};

/**
 * All known image specs derived from codebase component analysis.
 * Dimensions = recommended upload size (2x for retina where applicable).
 */
const SPECS: SpecEntry[] = [
  // ── Hero slideshow (home page) — h-[50vh] sm:h-[55vh], 50vw desktop ──
  { imageKey: "hero/sales-excellence-group.jpeg", displayWidth: 960, displayHeight: 600, aspectRatio: "16:10", context: "Hero slideshow + TrainingCards", pageSlug: "home" },
  { imageKey: "hero/customer-success-group.jpg", displayWidth: 960, displayHeight: 600, aspectRatio: "16:10", context: "Hero slideshow + TrainingCards", pageSlug: "home" },

  // ── Training hero — full screen, min-h-[90vh] ──
  { imageKey: "training/visma-youserve-session.jpg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Training hero — volledig scherm", pageSlug: "sales-excellence-training" },
  { imageKey: "hero/customer-success-hero.jpeg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Training hero — volledig scherm", pageSlug: "customer-success-training" },

  // ── Team photos — h-[280px] sm:h-[500px] first, h-[220px] sm:h-[249px] others ──
  { imageKey: "team/heigo-group.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto", pageSlug: "home" },
  { imageKey: "team/training-group-1.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },
  { imageKey: "team/training-group-2.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },
  { imageKey: "team/training-group-3.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },
  { imageKey: "team/training-group-4.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },
  { imageKey: "team/joost-wammer-klaas.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },
  { imageKey: "team/visma-certificaat.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },
  { imageKey: "team/whatsapp-group.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },
  { imageKey: "team/ai-sales-training.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto" },

  // ── Spreker page — hero + content images ──
  { imageKey: "spreker/klaas-flipchart.jpeg", displayWidth: 960, displayHeight: 1280, aspectRatio: "3:4", context: "Spreker hero", pageSlug: "spreker" },
  { imageKey: "spreker/klaas-hero.jpeg", displayWidth: 960, displayHeight: 1280, aspectRatio: "3:4", context: "Spreker content", pageSlug: "spreker" },
  { imageKey: "spreker/video-thumb-speech.jpg", displayWidth: 960, displayHeight: 540, aspectRatio: "16:9", context: "Video thumbnail", pageSlug: "spreker" },
  { imageKey: "spreker/video-thumb-mindset.jpg", displayWidth: 960, displayHeight: 540, aspectRatio: "16:9", context: "Video thumbnail", pageSlug: "spreker" },

  // ── About / Over ons — portraits + team members ──
  // klaas-over-mij: over-ons hero — aspect-[3/4] mobile, lg:aspect-auto min-h-[calc(100vh-96px)] desktop
  { imageKey: "about/klaas-over-mij.jpeg", displayWidth: 590, displayHeight: 787, aspectRatio: "3:4", context: "Over ons hero (full height desktop)", pageSlug: "over-ons" },
  // klaas-kroezen-portrait: AboutKlaas section — min-h-[300px] sm:min-h-[340px] in 50vw col, landscape crop
  { imageKey: "about/klaas-kroezen-portrait.jpeg", displayWidth: 590, displayHeight: 340, aspectRatio: "16:9", context: "About Klaas banner (landscape crop)", pageSlug: "home" },
  // klaas-kroezen-portrait-2: over-ons mission — aspect-[4/3] mobile, lg:min-h-[560px] desktop
  { imageKey: "about/klaas-kroezen-portrait-2.jpeg", displayWidth: 590, displayHeight: 560, aspectRatio: "~1:1", context: "Over ons mission + contact portrait", pageSlug: "over-ons" },
  { imageKey: "about/kantoor-administratie.jpg", displayWidth: 1180, displayHeight: 664, aspectRatio: "16:9", context: "Kantoor foto", pageSlug: "over-ons" },
  { imageKey: "about/tim-lind.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member portrait", pageSlug: "over-ons" },
  { imageKey: "about/joost-wammes.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member portrait", pageSlug: "over-ons" },
  { imageKey: "about/sanne-bakker.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member portrait", pageSlug: "over-ons" },

  // ── Book / Boek ──
  { imageKey: "book/sales-oprecht-ontspannen-cover.png", displayWidth: 380, displayHeight: 570, aspectRatio: "2:3", context: "Boek cover", pageSlug: "boek" },
  { imageKey: "book/boeklancering.jpeg", displayWidth: 960, displayHeight: 600, aspectRatio: "16:10", context: "Boek lancering foto", pageSlug: "boek" },
  // Book preview pages (aspect 448:683)
  ...Array.from({ length: 18 }, (_, i) => {
    const pageNum = [5, 6, 7, 8, 9, 11, 14, 19, 21, 24, 25, 27, 28, 31, 33, 35, 39, 132][i];
    return {
      imageKey: `book/preview/page-${pageNum}.png`,
      displayWidth: 896,
      displayHeight: 1366,
      aspectRatio: "448:683",
      context: "Boek preview pagina",
      pageSlug: "boek",
    };
  }),

  // ── Reviews / Avatars — 36x36 display (72x72 2x) ──
  { imageKey: "reviews/simon-kornblum.jpg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar" },
  { imageKey: "reviews/michael-pilarczyk.jpeg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar" },
  { imageKey: "reviews/mark-tigchelaar.jpeg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar" },
  { imageKey: "reviews/tijn-touber.jpg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar" },

  // ── Logos — h-[22px] sm:h-[26px], 2x retina ──
  { imageKey: "logos/bots.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/edison.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/gp-products.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/gradient.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/heigo.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/leadinfo.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/mom-in-balance.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/mt-sprout.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/vasco.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/visma.png", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },
  { imageKey: "logos/zigt.webp", displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo" },

  // ── Contact ──
  { imageKey: "contact/klaas-contact.png", displayWidth: 960, displayHeight: 1280, aspectRatio: "3:4", context: "Contact portret", pageSlug: "contact" },
  { imageKey: "contact/joost-contact.png", displayWidth: 960, displayHeight: 1280, aspectRatio: "3:4", context: "Contact portret", pageSlug: "contact" },
  { imageKey: "contact/kantoor.jpg", displayWidth: 1180, displayHeight: 664, aspectRatio: "16:9", context: "Kantoor foto", pageSlug: "contact" },

  // ── Training thumbnails (TrainingCards — aspect-video, 50vw) ──
  { imageKey: "training/chris-laarman-thumb.jpg", displayWidth: 960, displayHeight: 540, aspectRatio: "16:9", context: "Video thumbnail" },

  // ── OG image ──
  { imageKey: "hero/og-image.jpeg", displayWidth: 1200, displayHeight: 630, aspectRatio: "1200:630", context: "OpenGraph image" },
];

/** Seed all image specs. Use force=true to overwrite existing specs. */
export const seedImageSpecs = internalMutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    await ctx.runMutation(internal.imageSpecs.bulkUpsert, {
      specs: SPECS,
      force: force ?? false,
    });
  },
});
