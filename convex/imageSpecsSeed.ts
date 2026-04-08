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
  pageSlugs?: string[];
};

/**
 * All known image specs — mapped to the PAGE where they are used.
 * pageSlug matches the actual route slug for per-page filtering in admin.
 */
const SPECS: SpecEntry[] = [
  // ══════════════════════════════════════
  // HOME PAGE
  // ══════════════════════════════════════
  // Hero slideshow — h-[50vh] sm:h-[55vh], 50vw desktop
  { imageKey: "hero/sales-excellence-group.jpeg", displayWidth: 960, displayHeight: 600, aspectRatio: "16:10", context: "Hero slideshow", pageSlug: "home" },
  { imageKey: "hero/customer-success-group.jpg", displayWidth: 960, displayHeight: 600, aspectRatio: "16:10", context: "Hero slideshow", pageSlug: "home" },
  // AboutKlaas — min-h-[300px] sm:min-h-[340px] in 50vw col, landscape crop with object-cover
  { imageKey: "about/klaas-kroezen-portrait.jpeg", displayWidth: 590, displayHeight: 340, aspectRatio: "16:9", context: "About Klaas banner", pageSlug: "home" },
  // Team photos — h-[280px] sm:h-[500px] first, h-[220px] sm:h-[249px] others
  { imageKey: "team/heigo-group.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/training-group-1.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/training-group-2.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/training-group-3.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/training-group-4.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/joost-wammer-klaas.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/visma-certificaat.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/whatsapp-group.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  { imageKey: "team/ai-sales-training.jpeg", displayWidth: 960, displayHeight: 500, aspectRatio: "2:1", context: "Team foto carousel", pageSlug: "home" },
  // BookTeaser — 340x480 in constrained container
  { imageKey: "book/sales-oprecht-ontspannen-cover.png", displayWidth: 380, displayHeight: 570, aspectRatio: "2:3", context: "Boek teaser cover", pageSlug: "home" },
  // OG image
  { imageKey: "hero/og-image.jpeg", displayWidth: 1200, displayHeight: 630, aspectRatio: "1200:630", context: "OpenGraph image", pageSlug: "home" },
  // Logos
  ...["bots.png","edison.png","gp-products.png","gradient.png","heigo.png","leadinfo.png","mom-in-balance.png","mt-sprout.png","vasco.png","visma.png","zigt.webp"].map(f => ({
    imageKey: `logos/${f}`, displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo", pageSlug: "home",
  })),
  // Reviews (used on multiple pages)
  { imageKey: "reviews/simon-kornblum.jpg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },
  { imageKey: "reviews/michael-pilarczyk.jpeg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },
  { imageKey: "reviews/mark-tigchelaar.jpeg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },
  { imageKey: "reviews/tijn-touber.jpg", displayWidth: 72, displayHeight: 72, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },

  // ══════════════════════════════════════
  // OVER ONS
  // ══════════════════════════════════════
  // Hero — aspect-[3/4] mobile, full-height 50vw desktop
  { imageKey: "about/klaas-over-mij.jpeg", displayWidth: 590, displayHeight: 900, aspectRatio: "2:3", context: "Hero portrait (full height)", pageSlug: "over-ons" },
  // Mission — aspect-[4/3] mobile, lg:min-h-[560px] in 50vw col — also used on /contact
  { imageKey: "about/klaas-kroezen-portrait-2.jpeg", displayWidth: 590, displayHeight: 560, aspectRatio: "~1:1", context: "Missie sectie portrait + contact hero", pageSlug: "over-ons", pageSlugs: ["over-ons", "contact"] },
  // Team members — aspect-square in 4-col grid
  { imageKey: "about/tim-lind.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member", pageSlug: "over-ons" },
  { imageKey: "about/joost-wammes.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member", pageSlug: "over-ons" },
  { imageKey: "about/sanne-bakker.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member", pageSlug: "over-ons" },
  { imageKey: "about/yvon-kruger.webp", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member", pageSlug: "over-ons" },
  // Office — aspect-video mobile, lg:min-h-[480px]
  { imageKey: "about/kantoor-administratie.jpg", displayWidth: 1180, displayHeight: 664, aspectRatio: "16:9", context: "Kantoor foto", pageSlug: "over-ons" },

  // ══════════════════════════════════════
  // SALES EXCELLENCE TRAINING
  // ══════════════════════════════════════
  // TrainingHero — full-screen min-h-[90vh]
  { imageKey: "training/visma-youserve-session.jpg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Hero achtergrond (full screen)", pageSlug: "sales-excellence-training" },

  // ══════════════════════════════════════
  // CUSTOMER SUCCESS TRAINING
  // ══════════════════════════════════════
  { imageKey: "hero/customer-success-hero.jpeg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Hero achtergrond (full screen)", pageSlug: "customer-success-training" },

  // ══════════════════════════════════════
  // SPREKER
  // ══════════════════════════════════════
  // Hero — full-screen min-h-[90vh], object-cover "center 25%"
  { imageKey: "spreker/klaas-hero.jpeg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Hero achtergrond (full screen)", pageSlug: "spreker" },
  // ContentBlock — aspect-[4/5] mobile, sm:aspect-[3/4], lg:min-h-[480px] in 50vw col
  { imageKey: "spreker/klaas-flipchart.jpeg", displayWidth: 590, displayHeight: 480, aspectRatio: "5:4", context: "Content sectie portrait", pageSlug: "spreker" },
  // Video thumbnails — aspect-video
  { imageKey: "spreker/video-thumb-speech.jpg", displayWidth: 960, displayHeight: 540, aspectRatio: "16:9", context: "Video thumbnail", pageSlug: "spreker" },
  { imageKey: "spreker/video-thumb-mindset.jpg", displayWidth: 960, displayHeight: 540, aspectRatio: "16:9", context: "Video thumbnail", pageSlug: "spreker" },
  { imageKey: "spreker/klaas-spreker-flipchart.jpg", displayWidth: 960, displayHeight: 540, aspectRatio: "16:9", context: "Spreker foto", pageSlug: "spreker" },

  // ══════════════════════════════════════
  // BOEK
  // ══════════════════════════════════════
  { imageKey: "book/boeklancering.jpeg", displayWidth: 960, displayHeight: 540, aspectRatio: "16:9", context: "Video thumbnail", pageSlug: "boek" },
  // Interview — aspect-square mobile, ~40vw auto-height desktop
  { imageKey: "blog/klaas-managementboek-interview.jpg", displayWidth: 600, displayHeight: 600, aspectRatio: "1:1", context: "Interview sectie foto", pageSlug: "boek" },
  // Book preview pages
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

  // NOTE: Contact page shares about/klaas-kroezen-portrait-2.jpeg with over-ons (see pageSlugs)
  // NOTE: Blog/nieuws images are managed via the Blog tab (blogPosts table), not siteImages
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
