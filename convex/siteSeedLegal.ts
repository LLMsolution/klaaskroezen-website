import { makeContent, type PageSeed } from "./siteSeed";

type PageDef = {
  slug: string;
  title: { nl: string; en: string; de?: string };
  metaTitle: { nl: string; en: string; de: string };
  metaDescription: { nl: string; en: string; de: string };
  label: { nl: string; en: string; de: string };
  pageTitle: { nl: string; en: string; de: string };
};

const PAGES: PageDef[] = [
  {
    slug: "algemene-voorwaarden",
    title: { nl: "Algemene Voorwaarden", en: "Terms and Conditions", de: "Allgemeine Geschäftsbedingungen" },
    metaTitle: { nl: "Algemene Voorwaarden", en: "Terms and Conditions", de: "AGB" },
    metaDescription: {
      nl: "Algemene voorwaarden van Klaas Kroezen — trainingen, coaching, boek (digitaal en fysiek) en keynotes.",
      en: "Terms and conditions for Klaas Kroezen — trainings, coaching, book and keynotes.",
      de: "Allgemeine Geschäftsbedingungen von Klaas Kroezen.",
    },
    label: { nl: "Juridisch", en: "Legal", de: "Rechtliches" },
    pageTitle: { nl: "Algemene Voorwaarden", en: "Terms and Conditions", de: "Allgemeine Geschäftsbedingungen" },
  },
  {
    slug: "privacy",
    title: { nl: "Privacyverklaring", en: "Privacy Policy", de: "Datenschutzerklärung" },
    metaTitle: { nl: "Privacyverklaring", en: "Privacy Policy", de: "Datenschutz" },
    metaDescription: {
      nl: "Privacyverklaring Klaas Kroezen — hoe wij omgaan met je gegevens.",
      en: "Privacy policy Klaas Kroezen — how we handle your data.",
      de: "Datenschutzerklärung Klaas Kroezen.",
    },
    label: { nl: "Juridisch", en: "Legal", de: "Rechtliches" },
    pageTitle: { nl: "Privacyverklaring", en: "Privacy Policy", de: "Datenschutzerklärung" },
  },
  {
    slug: "herroepingsformulier",
    title: { nl: "Herroepingsformulier", en: "Withdrawal Form", de: "Widerrufsformular" },
    metaTitle: { nl: "Herroepingsformulier", en: "Withdrawal Form", de: "Widerrufsformular" },
    metaDescription: {
      nl: "Modelformulier voor herroeping — Klaas Kroezen.",
      en: "Model withdrawal form — Klaas Kroezen.",
      de: "Muster-Widerrufsformular — Klaas Kroezen.",
    },
    label: { nl: "Juridisch", en: "Legal", de: "Rechtliches" },
    pageTitle: { nl: "Herroepingsformulier", en: "Withdrawal Form", de: "Widerrufsformular" },
  },
];

export function seedLegalPages(): PageSeed[] {
  return PAGES.map((p) => ({
    slug: p.slug,
    title: p.title,
    sections: [
      { id: "page-meta", type: "page-meta", active: true, sortOrder: -1 },
      { id: "body", type: "legal-page", active: true, sortOrder: 0 },
    ],
    content: [
      // page-meta
      makeContent(p.slug, "page-meta", "page-meta", "nl", { title: p.metaTitle.nl, description: p.metaDescription.nl }),
      makeContent(p.slug, "page-meta", "page-meta", "en", { title: p.metaTitle.en, description: p.metaDescription.en }),
      makeContent(p.slug, "page-meta", "page-meta", "de", { title: p.metaTitle.de, description: p.metaDescription.de }),
      // body (placeholder — admin vult via Tiptap)
      makeContent(p.slug, "body", "legal-page", "nl", {
        label: p.label.nl,
        title: p.pageTitle.nl,
        version: "",
        noticeBadge: "",
        body: "",
      }),
      makeContent(p.slug, "body", "legal-page", "en", {
        label: p.label.en,
        title: p.pageTitle.en,
        version: "",
        noticeBadge: "",
        body: "",
      }),
      makeContent(p.slug, "body", "legal-page", "de", {
        label: p.label.de,
        title: p.pageTitle.de,
        version: "",
        noticeBadge: "",
        body: "",
      }),
    ],
  }));
}
