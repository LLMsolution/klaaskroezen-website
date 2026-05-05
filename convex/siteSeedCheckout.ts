import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "checkout-shared";

const DEFAULT_TRUST_LOGOS = [
  { image: "/images/logos/visma.png", alt: "Visma", width: 64 },
  { image: "/images/logos/vasco.png", alt: "Vasco", width: 56 },
  { image: "/images/logos/mt-sprout.png", alt: "MT/Sprout", width: 56 },
  { image: "/images/logos/mom-in-balance.png", alt: "Mom in Balance", width: 56 },
];

/**
 * Shared copy for ALL checkout pages — admin-editable. Currently:
 * - exit-intent popup (title/body/cta/dismiss)
 * - trust-stats (rating, gemiddelde beoordeling, training-stat, boek-stat)
 * - trusted-by (logo wall — alleen op training-checkouts)
 *
 * Future sections (trust-badges, social-proof-toasts) komen hier ook bij.
 */
export function seedCheckoutSharedContent(): PageSeed {
  const sections = [
    { id: "exit-intent", type: "exit-intent", active: true, sortOrder: 0 },
    { id: "trust-stats", type: "trust-stats", active: true, sortOrder: 1 },
    { id: "trusted-by", type: "trusted-by", active: true, sortOrder: 2 },
  ];

  const content = [
    // ── Exit-intent ──
    makeContent(SLUG, "exit-intent", "exit-intent", "nl", {
      title: "Wacht, ga je weg?",
      body: "Wist je dat je 30 dagen bedenktijd hebt? Geen risico.",
      cta: "Toch bestellen",
      dismiss: "Nee bedankt",
    }),
    makeContent(SLUG, "exit-intent", "exit-intent", "en", {
      title: "Wait, are you leaving?",
      body: "Did you know you have 30 days to change your mind? No risk.",
      cta: "Order anyway",
      dismiss: "No thanks",
    }),
    makeContent(SLUG, "exit-intent", "exit-intent", "de", {
      title: "Warten, gehen Sie?",
      body: "Wussten Sie, dass Sie 30 Tage Bedenkzeit haben? Kein Risiko.",
      cta: "Trotzdem bestellen",
      dismiss: "Nein danke",
    }),

    // ── Trust-stats ──
    makeContent(SLUG, "trust-stats", "trust-stats", "nl", {
      ratingValue: "9.1",
      ratingLabel: "Gemiddelde beoordeling",
      trainedText: "340+ sales professionals getraind in 21 landen",
      soldText: "2.500+ exemplaren verkocht",
    }),
    makeContent(SLUG, "trust-stats", "trust-stats", "en", {
      ratingValue: "9.1",
      ratingLabel: "Average rating",
      trainedText: "340+ sales professionals trained across 21 countries",
      soldText: "2,500+ copies sold",
    }),
    makeContent(SLUG, "trust-stats", "trust-stats", "de", {
      ratingValue: "9.1",
      ratingLabel: "Durchschnittsbewertung",
      trainedText: "340+ Vertriebsprofis in 21 Ländern geschult",
      soldText: "2.500+ verkaufte Exemplare",
    }),

    // ── Trusted-by (logo wall) ──
    makeContent(SLUG, "trusted-by", "trusted-by", "nl", {
      label: "Vertrouwd door",
      logos: DEFAULT_TRUST_LOGOS,
    }),
    makeContent(SLUG, "trusted-by", "trusted-by", "en", {
      label: "Trusted by",
      logos: DEFAULT_TRUST_LOGOS,
    }),
    makeContent(SLUG, "trusted-by", "trusted-by", "de", {
      label: "Vertraut von",
      logos: DEFAULT_TRUST_LOGOS,
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Checkout copy", en: "Checkout copy", de: "Checkout-Texte" },
    sections,
    content,
  };
}
