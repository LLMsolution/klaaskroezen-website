/**
 * JSON schema definitions per section type.
 * Used by the admin content editor to auto-generate forms.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "image-path"
  | "object"
  | "array";

export type FieldSchema = {
  key: string;
  type: FieldType;
  label: string;
  fields?: FieldSchema[]; // for "object" type
  itemFields?: FieldSchema[]; // for "array" type
};

export type SectionSchema = {
  type: string;
  label: string;
  fields: FieldSchema[];
};

// ── Shared field groups ──

const ctaFields: FieldSchema[] = [
  { key: "label", type: "text", label: "Knoptekst" },
  { key: "href", type: "text", label: "Link" },
];

const glassItemFields: FieldSchema[] = [
  { key: "label", type: "text", label: "Label" },
  { key: "text", type: "text", label: "Tekst" },
];

const reviewItemFields: FieldSchema[] = [
  { key: "text", type: "textarea", label: "Review tekst" },
  { key: "name", type: "text", label: "Naam" },
  { key: "role", type: "text", label: "Rol / functie" },
  { key: "avatar", type: "image-path", label: "Avatar (optioneel)" },
  { key: "source", type: "text", label: "Bron (optioneel)" },
];

const faqItemFields: FieldSchema[] = [
  { key: "question", type: "text", label: "Vraag" },
  { key: "answer", type: "textarea", label: "Antwoord" },
];

const moduleItemFields: FieldSchema[] = [
  { key: "number", type: "text", label: "Nummer" },
  { key: "title", type: "text", label: "Titel" },
  { key: "description", type: "textarea", label: "Beschrijving" },
];

const tierItemFields: FieldSchema[] = [
  { key: "label", type: "text", label: "Label" },
  { key: "title", type: "text", label: "Titel" },
  { key: "price", type: "text", label: "Prijs" },
  { key: "priceNote", type: "text", label: "Prijsnotitie" },
  { key: "description", type: "textarea", label: "Beschrijving" },
  { key: "features", type: "array", label: "Features", itemFields: [{ key: "value", type: "text", label: "Feature" }] },
  { key: "cta", type: "text", label: "CTA tekst" },
  { key: "href", type: "text", label: "CTA link" },
  { key: "featured", type: "text", label: "Uitgelicht (true/false)" },
];

// ── Section schemas ──

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    type: "hero",
    label: "Hero",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow tekst" },
      { key: "label", type: "text", label: "Label" },
      { key: "titleLine1", type: "text", label: "Titel regel 1" },
      { key: "titleLine2", type: "text", label: "Titel regel 2" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "description", type: "textarea", label: "Beschrijving" },
      { key: "image", type: "image-path", label: "Afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "imagePosition", type: "text", label: "Afbeelding positie" },
      { key: "cta", type: "object", label: "CTA", fields: ctaFields },
      { key: "glassItems", type: "array", label: "Glass items", itemFields: glassItemFields },
    ],
  },

  "hero-book": {
    type: "hero-book",
    label: "Hero (Boek)",
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "image", type: "image-path", label: "Boek cover afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "titleLine1", type: "text", label: "Titel regel 1" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "paragraphs", type: "array", label: "Paragrafen", itemFields: [{ key: "value", type: "textarea", label: "Paragraaf" }] },
      { key: "boldText", type: "text", label: "Vetgedrukte tekst" },
      { key: "afterBold", type: "text", label: "Tekst na vet" },
      { key: "badges", type: "array", label: "Badges", itemFields: [{ key: "value", type: "text", label: "Badge" }] },
      { key: "cta", type: "text", label: "CTA tekst" },
    ],
  },

  "hero-about": {
    type: "hero-about",
    label: "Hero (Over ons)",
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "image", type: "image-path", label: "Hero afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "bio", type: "array", label: "Bio paragrafen", itemFields: [{ key: "value", type: "textarea", label: "Paragraaf" }] },
      { key: "stats", type: "array", label: "Statistieken", itemFields: [
        { key: "label", type: "text", label: "Label" },
        { key: "value", type: "text", label: "Waarde" },
      ]},
    ],
  },

  "pain-points": {
    type: "pain-points",
    label: "Pijnpunten",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "points", type: "array", label: "Pijnpunten", itemFields: [{ key: "value", type: "text", label: "Punt" }] },
    ],
  },

  transformation: {
    type: "transformation",
    label: "Transformatie",
    fields: [
      { key: "items", type: "array", label: "Items", itemFields: [
        { key: "label", type: "text", label: "Label" },
        { key: "before", type: "text", label: "Voor" },
        { key: "after", type: "text", label: "Na" },
      ]},
    ],
  },

  audiences: {
    type: "audiences",
    label: "Doelgroepen",
    fields: [
      { key: "items", type: "array", label: "Doelgroepen", itemFields: [{ key: "value", type: "text", label: "Doelgroep" }] },
    ],
  },

  program: {
    type: "program",
    label: "Programma",
    fields: [
      { key: "price", type: "text", label: "Prijs" },
      { key: "pricingAnchor", type: "text", label: "Pricing anchor link" },
      { key: "ctaLabel", type: "text", label: "CTA label" },
      { key: "modules", type: "array", label: "Modules", itemFields: moduleItemFields },
    ],
  },

  reviews: {
    type: "reviews",
    label: "Reviews",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "items", type: "array", label: "Reviews", itemFields: reviewItemFields },
    ],
  },

  pricing: {
    type: "pricing",
    label: "Prijzen",
    fields: [
      { key: "guarantee", type: "textarea", label: "Garantie tekst" },
      { key: "individual", type: "object", label: "Individueel", fields: [
        { key: "tiers", type: "array", label: "Tiers", itemFields: tierItemFields },
      ]},
      { key: "team", type: "object", label: "Teams", fields: [
        { key: "tiers", type: "array", label: "Tiers", itemFields: tierItemFields },
      ]},
    ],
  },

  faq: {
    type: "faq",
    label: "FAQ",
    fields: [
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "items", type: "array", label: "Vragen", itemFields: faqItemFields },
    ],
  },

  cta: {
    type: "cta",
    label: "Call to Action",
    fields: [
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "description", type: "textarea", label: "Beschrijving" },
      { key: "href", type: "text", label: "Link" },
      { key: "ctaLabel", type: "text", label: "Knoptekst" },
    ],
  },

  "cross-link": {
    type: "cross-link",
    label: "Cross-link",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "description", type: "textarea", label: "Beschrijving" },
      { key: "image", type: "image-path", label: "Afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "href", type: "text", label: "Link" },
      { key: "ctaLabel", type: "text", label: "Knoptekst" },
      { key: "dark", type: "text", label: "Donker thema (true/false)" },
    ],
  },

  videos: {
    type: "videos",
    label: "Video's",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "description", type: "textarea", label: "Beschrijving" },
      { key: "items", type: "array", label: "Video's", itemFields: [
        { key: "title", type: "text", label: "Titel" },
        { key: "thumbnail", type: "image-path", label: "Thumbnail" },
        { key: "embedUrl", type: "text", label: "Embed URL" },
        { key: "duration", type: "text", label: "Duur" },
      ]},
    ],
  },

  interview: {
    type: "interview",
    label: "Interview",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "image", type: "image-path", label: "Afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "intro", type: "textarea", label: "Intro tekst" },
      { key: "quotes", type: "array", label: "Citaten", itemFields: [
        { key: "question", type: "text", label: "Vraag" },
        { key: "answer", type: "textarea", label: "Antwoord" },
      ]},
      { key: "linkText", type: "text", label: "Link tekst" },
      { key: "linkUrl", type: "text", label: "Link URL" },
    ],
  },

  "content-block": {
    type: "content-block",
    label: "Content blok",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "image", type: "image-path", label: "Afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "paragraphs", type: "array", label: "Paragrafen", itemFields: [{ key: "value", type: "textarea", label: "Paragraaf" }] },
    ],
  },

  "benefits-grid": {
    type: "benefits-grid",
    label: "Voordelen grid",
    fields: [
      { key: "items", type: "array", label: "Voordelen", itemFields: [
        { key: "icon", type: "text", label: "Icoon" },
        { key: "text", type: "text", label: "Tekst" },
      ]},
    ],
  },

  "logo-bar": {
    type: "logo-bar",
    label: "Logo balk",
    fields: [
      { key: "label", type: "text", label: "Label" },
    ],
  },

  coaching: {
    type: "coaching",
    label: "Coaching",
    fields: [
      { key: "sectionEyebrow", type: "text", label: "Eyebrow" },
      { key: "sectionTitle1", type: "text", label: "Titel regel 1" },
      { key: "sectionTitle2", type: "text", label: "Titel regel 2" },
      { key: "individual", type: "object", label: "Individueel", fields: [
        { key: "label", type: "text", label: "Label" },
        { key: "title", type: "text", label: "Titel" },
        { key: "description", type: "textarea", label: "Beschrijving" },
        { key: "features", type: "array", label: "Features", itemFields: [{ key: "value", type: "text", label: "Feature" }] },
        { key: "price", type: "text", label: "Prijs" },
        { key: "cta", type: "text", label: "CTA tekst" },
      ]},
      { key: "team", type: "object", label: "Team", fields: [
        { key: "label", type: "text", label: "Label" },
        { key: "title", type: "text", label: "Titel" },
        { key: "description", type: "textarea", label: "Beschrijving" },
        { key: "features", type: "array", label: "Features", itemFields: [{ key: "value", type: "text", label: "Feature" }] },
        { key: "price", type: "text", label: "Prijs" },
        { key: "cta", type: "text", label: "CTA tekst" },
      ]},
    ],
  },

  journey: {
    type: "journey",
    label: "Tijdlijn",
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "items", type: "array", label: "Periodes", itemFields: [
        { key: "period", type: "text", label: "Periode" },
        { key: "title", type: "text", label: "Titel" },
        { key: "text", type: "textarea", label: "Beschrijving" },
      ]},
    ],
  },

  mission: {
    type: "mission",
    label: "Missie",
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "image", type: "image-path", label: "Afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "paragraphs", type: "array", label: "Paragrafen", itemFields: [{ key: "value", type: "textarea", label: "Paragraaf" }] },
      { key: "ctaSales", type: "text", label: "CTA Sales tekst" },
      { key: "ctaSuccess", type: "text", label: "CTA Success tekst" },
    ],
  },

  team: {
    type: "team",
    label: "Team",
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleAccent", type: "text", label: "Titel accent" },
      { key: "members", type: "array", label: "Teamleden", itemFields: [
        { key: "name", type: "text", label: "Naam" },
        { key: "role", type: "text", label: "Rol" },
        { key: "image", type: "image-path", label: "Foto" },
        { key: "description", type: "textarea", label: "Beschrijving" },
      ]},
    ],
  },

  office: {
    type: "office",
    label: "Kantoor",
    fields: [
      { key: "label", type: "text", label: "Label" },
      { key: "title", type: "text", label: "Titel" },
      { key: "titleLine2", type: "text", label: "Titel regel 2" },
      { key: "image", type: "image-path", label: "Kantoor afbeelding" },
      { key: "imageAlt", type: "text", label: "Alt tekst" },
      { key: "description", type: "textarea", label: "Beschrijving" },
      { key: "address", type: "text", label: "Adres" },
    ],
  },

  "book-preview": {
    type: "book-preview",
    label: "Boek preview pagina's",
    fields: [
      { key: "eyebrow", type: "text", label: "Eyebrow" },
      { key: "title", type: "text", label: "Titel" },
      { key: "pages", type: "array", label: "Preview pagina's", itemFields: [
        { key: "image", type: "image-path", label: "Pagina afbeelding" },
        { key: "pageNumber", type: "text", label: "Paginanummer" },
      ]},
    ],
  },
};

/** Get the schema for a section type */
export function getSectionSchema(type: string): SectionSchema | undefined {
  return SECTION_SCHEMAS[type];
}

/** All available section types */
export const SECTION_TYPES = Object.keys(SECTION_SCHEMAS);
