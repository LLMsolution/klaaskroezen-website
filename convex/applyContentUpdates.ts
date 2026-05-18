/**
 * One-off helper: apply current production content updates.
 * - Set GTM tracking script in siteSettings
 * - Footer description: remove "21 landen" (NL/EN/DE)
 * - Checkout trust-stats trainedText: "500+ gingen je voor" (NL/EN/DE)
 * - Home training-cards trustItems: replace "10% resultaat" with "Belofte is kickoff" (NL/EN/DE)
 *
 * Idempotent — patches in place, only touches the specific fields.
 * Run: npx convex run --prod applyContentUpdates:run
 */

import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const GTM_SCRIPT = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MH9LDL44');</script>
<!-- End Google Tag Manager -->`;

const FOOTER_DESC: Record<"nl" | "en" | "de", string> = {
  nl: "Sales- en Customer Success trainingen. Oprecht en ontspannen — geen trucjes, geen scripts. 25+ jaar ervaring, 500+ professionals getraind.",
  en: "Sales and Customer Success trainings. Honest and relaxed — no tricks, no scripts. 25+ years of experience, 500+ professionals trained.",
  de: "Sales- und Customer-Success-Trainings. Ehrlich und entspannt — keine Tricks, keine Skripte. 25+ Jahre Erfahrung, 500+ Profis ausgebildet.",
};

const TRAINED_TEXT: Record<"nl" | "en" | "de", string> = {
  nl: "Meer dan 500+ professionals gingen je voor",
  en: "Over 500+ professionals already chose us",
  de: "Über 500+ Profis haben sich bereits entschieden",
};

const TRUST_BADGES: Record<"nl" | "en" | "de", string[]> = {
  nl: ["Direct online toegang", "Belofte is kickoff", "25+ jaar ervaring"],
  en: ["Instant online access", "Kickoff guarantee", "25+ years of experience"],
  de: ["Sofortiger Online-Zugang", "Kickoff-Versprechen", "25+ Jahre Erfahrung"],
};

async function patchSection(
  ctx: MutationCtx,
  pageSlug: string,
  sectionId: string,
  lang: "nl" | "en" | "de",
  patch: Record<string, unknown>,
): Promise<boolean> {
  const entry = await ctx.db
    .query("siteContent")
    .withIndex("by_page_section", (q) =>
      q.eq("pageSlug", pageSlug).eq("sectionId", sectionId).eq("lang", lang),
    )
    .first();
  if (!entry) return false;
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(entry.content);
  } catch {
    /* keep empty */
  }
  const merged = { ...data, ...patch };
  await ctx.db.patch(entry._id, {
    content: JSON.stringify(merged),
    updatedAt: Date.now(),
  });
  return true;
}

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const report: Record<string, unknown> = {};

    // 1. Tracking script in siteSettings (global key)
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    if (settings) {
      await ctx.db.patch(settings._id, { trackingScriptsHead: GTM_SCRIPT });
    } else {
      await ctx.db.insert("siteSettings", { key: "global", trackingScriptsHead: GTM_SCRIPT });
    }
    report.trackingScript = "set";

    const langs = ["nl", "en", "de"] as const;

    // 2. Footer description (site-shared / footer)
    let footerUpdates = 0;
    for (const lang of langs) {
      const ok = await patchSection(ctx, "site-shared", "footer", lang, {
        description: FOOTER_DESC[lang],
      });
      if (ok) footerUpdates++;
    }
    report.footer = footerUpdates;

    // 3. Checkout trust-stats trainedText
    let trustStatsUpdates = 0;
    for (const lang of langs) {
      const ok = await patchSection(ctx, "checkout-shared", "trust-stats", lang, {
        trainedText: TRAINED_TEXT[lang],
      });
      if (ok) trustStatsUpdates++;
    }
    report.trustStats = trustStatsUpdates;

    // 4. Home training-cards trustItems
    let trustBadgesUpdates = 0;
    for (const lang of langs) {
      const ok = await patchSection(ctx, "home", "training-cards", lang, {
        trustItems: [...TRUST_BADGES[lang]],
      });
      if (ok) trustBadgesUpdates++;
    }
    report.trustBadges = trustBadgesUpdates;

    return report;
  },
});
