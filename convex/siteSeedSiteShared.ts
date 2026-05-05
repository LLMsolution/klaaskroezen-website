import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "site-shared";

/**
 * Site-brede copy die op elke pagina zichtbaar is — admin-editbaar.
 * Bevat:
 * - site-footer (KvK, telefoon, email, adres, social-links, copyright)
 * - cookie-banner (titel, body, accept/deny knoppen)
 */
export function seedSiteSharedContent(): PageSeed {
  const sections = [
    { id: "footer", type: "site-footer", active: true, sortOrder: 0 },
    { id: "cookie-banner", type: "cookie-banner", active: true, sortOrder: 1 },
  ];

  const FOOTER_SHARED = {
    email: "klaas@klaaskroezen.com",
    phoneDisplay: "+31 6 1809 8906",
    phoneHref: "+31618098906",
    addressLine1: "Oude Parklaan 111",
    addressLine2: "1901 ZL Castricum",
    kvk: "KvK 30204462",
    instagramUrl: "https://www.instagram.com/klaaskroezen/",
    youtubeUrl: "https://www.youtube.com/@klaaskroezen",
    linkedinUrl: "https://www.linkedin.com/in/klaaskroezen/",
  };

  const content = [
    // ── Footer (NL) ──
    makeContent(SLUG, "footer", "site-footer", "nl", {
      ...FOOTER_SHARED,
      description: "Sales- en Customer Success trainingen. Oprecht en ontspannen — geen trucjes, geen scripts. 25+ jaar ervaring in 21 landen.",
      pagesLabel: "Pagina's",
      contactLabel: "Contact",
      footerNavAriaLabel: "Footer navigatie",
      copyright: "Alle rechten voorbehouden.",
      privacyLabel: "Privacybeleid",
      termsLabel: "Algemene Voorwaarden",
    }),
    makeContent(SLUG, "footer", "site-footer", "en", {
      ...FOOTER_SHARED,
      description: "Sales and Customer Success trainings. Honest and relaxed — no tricks, no scripts. 25+ years of experience across 21 countries.",
      pagesLabel: "Pages",
      contactLabel: "Contact",
      footerNavAriaLabel: "Footer navigation",
      copyright: "All rights reserved.",
      privacyLabel: "Privacy policy",
      termsLabel: "Terms & Conditions",
    }),
    makeContent(SLUG, "footer", "site-footer", "de", {
      ...FOOTER_SHARED,
      description: "Sales- und Customer-Success-Trainings. Ehrlich und entspannt — keine Tricks, keine Skripte. 25+ Jahre Erfahrung in 21 Ländern.",
      pagesLabel: "Seiten",
      contactLabel: "Kontakt",
      footerNavAriaLabel: "Footer-Navigation",
      copyright: "Alle Rechte vorbehalten.",
      privacyLabel: "Datenschutz",
      termsLabel: "AGB",
    }),

    // ── Cookie banner (NL/EN/DE) ──
    makeContent(SLUG, "cookie-banner", "cookie-banner", "nl", {
      title: "Cookies & privacy",
      description: "We gebruiken functionele cookies die nodig zijn voor de werking van deze site. Met jouw toestemming gebruiken we ook analytics om de site te verbeteren.",
      privacyLink: "Lees ons privacystatement",
      accept: "Accepteren",
      deny: "Weigeren",
    }),
    makeContent(SLUG, "cookie-banner", "cookie-banner", "en", {
      title: "Cookies & privacy",
      description: "We use functional cookies required for the site to work. With your consent we also use analytics to improve the site.",
      privacyLink: "Read our privacy statement",
      accept: "Accept",
      deny: "Decline",
    }),
    makeContent(SLUG, "cookie-banner", "cookie-banner", "de", {
      title: "Cookies & Datenschutz",
      description: "Wir verwenden funktionale Cookies, die für den Betrieb dieser Website erforderlich sind. Mit Ihrer Zustimmung verwenden wir auch Analytics zur Verbesserung der Website.",
      privacyLink: "Datenschutzerklärung lesen",
      accept: "Akzeptieren",
      deny: "Ablehnen",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Site-brede copy", en: "Site-wide copy", de: "Seitenweite Texte" },
    sections,
    content,
  };
}
