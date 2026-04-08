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
  // HOME PAGE — desktop rendering
  // ══════════════════════════════════════
  // Hero slideshow — h-[50vh] mobile, lg:min-h-[calc(100vh-96px)] desktop, ~50vw col
  { imageKey: "hero/sales-excellence-group.jpeg", displayWidth: 1200, displayHeight: 900, aspectRatio: "4:3", context: "Hero slideshow (home)", pageSlug: "home" },
  { imageKey: "hero/customer-success-group.jpg", displayWidth: 1200, displayHeight: 900, aspectRatio: "4:3", context: "Hero slideshow + TrainingCards", pageSlug: "home" },
  // AboutKlaas — min-h-[340px] in 50vw col (~590px wide) → landscape banner
  { imageKey: "about/klaas-kroezen-portrait.jpeg", displayWidth: 1180, displayHeight: 680, aspectRatio: "16:9", context: "AboutKlaas banner", pageSlug: "home" },
  // Team photos — first h-[500px], others h-[249px]; ~590px wide each
  { imageKey: "team/heigo-group.jpeg", displayWidth: 1180, displayHeight: 1000, aspectRatio: "~1.18:1", context: "Team foto groot", pageSlug: "home" },
  { imageKey: "team/training-group-1.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  { imageKey: "team/training-group-2.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  { imageKey: "team/training-group-3.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  { imageKey: "team/training-group-4.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  { imageKey: "team/joost-wammer-klaas.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  { imageKey: "team/visma-certificaat.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  { imageKey: "team/whatsapp-group.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  { imageKey: "team/ai-sales-training.jpeg", displayWidth: 1180, displayHeight: 498, aspectRatio: "~2.37:1", context: "Team foto klein", pageSlug: "home" },
  // BookTeaser — compacte cover (w-[180px] in teaser)
  { imageKey: "book/sales-oprecht-ontspannen-cover.png", displayWidth: 380, displayHeight: 570, aspectRatio: "2:3", context: "Boek cover (teaser + boek pagina)", pageSlug: "home", pageSlugs: ["home", "boek"] },
  // OG image
  { imageKey: "hero/og-image.jpeg", displayWidth: 1200, displayHeight: 630, aspectRatio: "40:21", context: "OpenGraph image", pageSlug: "home" },
  // Logos — h-[26px] displayed, 2x for retina
  ...["bots.png","edison.png","gp-products.png","gradient.png","heigo.png","leadinfo.png","mom-in-balance.png","mt-sprout.png","vasco.png","visma.png","zigt.webp"].map(f => ({
    imageKey: `logos/${f}`, displayWidth: 200, displayHeight: 52, aspectRatio: "auto", context: "Logo (variable width)", pageSlug: "home",
  })),
  // Reviews — 36x36 display, 2x retina = 72x72
  { imageKey: "reviews/simon-kornblum.jpg", displayWidth: 144, displayHeight: 144, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },
  { imageKey: "reviews/michael-pilarczyk.jpeg", displayWidth: 144, displayHeight: 144, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },
  { imageKey: "reviews/mark-tigchelaar.jpeg", displayWidth: 144, displayHeight: 144, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },
  { imageKey: "reviews/tijn-touber.jpg", displayWidth: 144, displayHeight: 144, aspectRatio: "1:1", context: "Review avatar", pageSlug: "home" },

  // ══════════════════════════════════════
  // OVER ONS
  // ══════════════════════════════════════
  // Hero — aspect-[3/4] mobile, desktop fills ~590x900 (min-h-[calc(100vh-96px)]) → ~2:3
  { imageKey: "about/klaas-over-mij.jpeg", displayWidth: 1180, displayHeight: 1770, aspectRatio: "2:3", context: "Hero portrait (full height desktop)", pageSlug: "over-ons" },
  // Mission — aspect-[4/3] mobile, lg:min-h-[560px] in 50vw col → ~590x560 = ~1.05:1 near square
  // Also used on contact — same container type but lg:min-h-[480px] → ~590x480 = ~1.23:1
  { imageKey: "about/klaas-kroezen-portrait-2.jpeg", displayWidth: 1180, displayHeight: 1120, aspectRatio: "~1.05:1", context: "Missie sectie (over-ons) + contact hero", pageSlug: "over-ons", pageSlugs: ["over-ons", "contact"] },
  // Team members — aspect-square in 4-col grid (25vw desktop = ~295px)
  { imageKey: "about/tim-lind.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member portrait", pageSlug: "over-ons" },
  { imageKey: "about/joost-wammes.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member portrait", pageSlug: "over-ons" },
  { imageKey: "about/sanne-bakker.png", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member portrait", pageSlug: "over-ons" },
  { imageKey: "about/yvon-kruger.webp", displayWidth: 590, displayHeight: 590, aspectRatio: "1:1", context: "Team member portrait", pageSlug: "over-ons" },
  // Office — aspect-video mobile, lg:min-h-[480px] in 50vw col → ~590x480 = ~1.23:1
  { imageKey: "about/kantoor-administratie.jpg", displayWidth: 1180, displayHeight: 960, aspectRatio: "~1.23:1", context: "Kantoor foto", pageSlug: "over-ons" },

  // ══════════════════════════════════════
  // SALES EXCELLENCE TRAINING
  // ══════════════════════════════════════
  // TrainingHero — full-screen min-h-[90vh], fill
  { imageKey: "training/visma-youserve-session.jpg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Training hero (full screen)", pageSlug: "sales-excellence-training" },

  // ══════════════════════════════════════
  // CUSTOMER SUCCESS TRAINING
  // ══════════════════════════════════════
  { imageKey: "hero/customer-success-hero.jpeg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Training hero (full screen)", pageSlug: "customer-success-training" },

  // ══════════════════════════════════════
  // SPREKER
  // ══════════════════════════════════════
  // Hero — full-screen min-h-[90vh]
  { imageKey: "spreker/klaas-hero.jpeg", displayWidth: 1920, displayHeight: 1080, aspectRatio: "16:9", context: "Spreker hero (full screen)", pageSlug: "spreker" },
  // ContentBlock — aspect-[4/5] mob, sm:aspect-[3/4], lg:min-h-[480px] in 50vw col → ~590x480 = ~1.23:1
  { imageKey: "spreker/klaas-flipchart.jpeg", displayWidth: 1180, displayHeight: 960, aspectRatio: "~1.23:1", context: "Content blok portrait", pageSlug: "spreker" },
  // Video thumbnails — aspect-video
  { imageKey: "spreker/video-thumb-speech.jpg", displayWidth: 1280, displayHeight: 720, aspectRatio: "16:9", context: "Video thumbnail", pageSlug: "spreker" },
  { imageKey: "spreker/video-thumb-mindset.jpg", displayWidth: 1280, displayHeight: 720, aspectRatio: "16:9", context: "Video thumbnail", pageSlug: "spreker" },
  { imageKey: "spreker/klaas-spreker-flipchart.jpg", displayWidth: 1280, displayHeight: 720, aspectRatio: "16:9", context: "Spreker foto", pageSlug: "spreker" },

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
