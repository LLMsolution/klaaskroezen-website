import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "checkout-shared";

/**
 * Shared copy for ALL checkout pages — admin-editable. Currently:
 * - exit-intent popup (title/body/cta/dismiss)
 *
 * Future sections (trust-stats, trust-badges, social-proof-toasts) will be
 * added here as separate sections under the same page.
 */
export function seedCheckoutSharedContent(): PageSeed {
  const sections = [
    { id: "exit-intent", type: "exit-intent", active: true, sortOrder: 0 },
  ];

  const content = [
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
  ];

  return {
    slug: SLUG,
    title: { nl: "Checkout copy", en: "Checkout copy", de: "Checkout-Texte" },
    sections,
    content,
  };
}
