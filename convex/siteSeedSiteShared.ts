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
    { id: "navigation", type: "site-navigation", active: true, sortOrder: 2 },
  ];

  const NAV_NL = {
    trainingen: "Trainingen", spreker: "Spreker", boek: "Boek", overOns: "Over ons", contact: "Contact",
    inloggen: "Inloggen", mijnAccount: "Mijn account", trainingKopen: "Training kopen",
    setLabel: "Voor verkopers", setTitle: "Sales Excellence Training",
    setDesc: "Meer omzet, minder druk. Voor wie actief verkoopt — van acquisitie tot deal sluiten.",
    setCta: "Bekijk training →",
    cstLabel: "Voor klantcontact", cstTitle: "Customer Success Training",
    cstDesc: "Maak van klanten fans. Voor iedereen met klantcontact die de organisatie commercieel sterker maakt.",
    cstCta: "Bekijk training →",
  };
  const NAV_EN = {
    trainingen: "Trainings", spreker: "Speaker", boek: "Book", overOns: "About", contact: "Contact",
    inloggen: "Log in", mijnAccount: "My account", trainingKopen: "Buy training",
    setLabel: "For sellers", setTitle: "Sales Excellence Training",
    setDesc: "More revenue, less pressure. For everyone who sells — from acquisition to closing.",
    setCta: "View training →",
    cstLabel: "For customer contact", cstTitle: "Customer Success Training",
    cstDesc: "Turn customers into fans. For everyone who connects with customers and drives commercial impact.",
    cstCta: "View training →",
  };
  const NAV_DE = {
    trainingen: "Trainings", spreker: "Speaker", boek: "Buch", overOns: "Über uns", contact: "Kontakt",
    inloggen: "Anmelden", mijnAccount: "Mein Konto", trainingKopen: "Training kaufen",
    setLabel: "Für Verkäufer", setTitle: "Sales Excellence Training",
    setDesc: "Mehr Umsatz, weniger Druck. Für alle, die verkaufen — von der Akquise bis zum Abschluss.",
    setCta: "Training ansehen →",
    cstLabel: "Für Kundenkontakt", cstTitle: "Customer Success Training",
    cstDesc: "Aus Kunden Fans machen. Für alle, die Kundenkontakt haben und kommerziellen Erfolg fördern.",
    cstCta: "Training ansehen →",
  };

  const FOOTER_SHARED = {
    email: "klaas@klaaskroezen.nl",
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

    // ── Navigation (NL/EN/DE) ──
    makeContent(SLUG, "navigation", "site-navigation", "nl", NAV_NL),
    makeContent(SLUG, "navigation", "site-navigation", "en", NAV_EN),
    makeContent(SLUG, "navigation", "site-navigation", "de", NAV_DE),
  ];

  return {
    slug: SLUG,
    title: { nl: "Site-brede copy", en: "Site-wide copy", de: "Seitenweite Texte" },
    sections,
    content,
  };
}
