/**
 * Product catalog for checkout pages.
 * All prices in cents. Training prices are ex BTW, book prices incl BTW.
 */

export interface CheckoutProduct {
  slug: string;
  name: { nl: string; en: string };
  shortName: { nl: string; en: string };
  type: "training" | "book";
  /** Price in cents */
  price: number;
  /** Whether price includes BTW */
  priceInclBtw: boolean;
  /** BTW percentage (21 for NL standard) */
  btwRate: number;
  description: { nl: string; en: string };
  features: { nl: string[]; en: string[] };
  /** Image path for checkout summary */
  image?: string;
  /** Slugs of products to offer as order bumps */
  bumps: string[];
  /** Product type for Convex schema */
  productType: "training" | "book" | "event";
  /** Allow payment in installments */
  installments?: { count: number; amountPerTerm: number };
}

export interface BumpConfig {
  slug: string;
  name: { nl: string; en: string };
  price: number;
  priceInclBtw: boolean;
  description: { nl: string; en: string };
}

export const CHECKOUT_PRODUCTS: Record<string, CheckoutProduct> = {
  "set-online": {
    slug: "set-online",
    name: {
      nl: "Sales Excellence Training — Online",
      en: "Sales Excellence Training — Online",
    },
    shortName: { nl: "SET Online", en: "SET Online" },
    type: "training",
    price: 225000,
    priceInclBtw: false,
    btwRate: 21,
    description: {
      nl: "6 modules online training met digitaal werkboek. Flexibel in eigen tempo.",
      en: "6 modules online training with digital workbook. Flexible at your own pace.",
    },
    features: {
      nl: [
        "6 modules online training",
        "Digitaal werkboek",
        "Certificaat na afronding",
        "Bestseller boek inbegrepen",
        "12 maanden toegang",
      ],
      en: [
        "6 modules online training",
        "Digital workbook",
        "Certificate upon completion",
        "Bestselling book included",
        "12 months access",
      ],
    },
    image: "/images/training/set-cover.jpg",
    bumps: ["boek-ebook", "boek-hardcopy", "boek-luisterboek"],
    productType: "training",
    installments: { count: 3, amountPerTerm: 75000 },
  },
  "set-coaching": {
    slug: "set-coaching",
    name: {
      nl: "Sales Excellence Training — Training + Coaching",
      en: "Sales Excellence Training — Training + Coaching",
    },
    shortName: { nl: "SET + Coaching", en: "SET + Coaching" },
    type: "training",
    price: 375000,
    priceInclBtw: false,
    btwRate: 21,
    description: {
      nl: "Alles van Online plus fysiek werkboek, persoonlijke kick-off en coaching van Klaas.",
      en: "Everything from Online plus physical workbook, personal kick-off and coaching from Klaas.",
    },
    features: {
      nl: [
        "Alles van Online",
        "Fysiek werkboek",
        "Persoonlijke kick-off met Klaas",
        "Presentatie met live feedback",
        "Actieplan op maat",
        "12 maanden toegang",
      ],
      en: [
        "Everything from Online",
        "Physical workbook",
        "Personal kick-off with Klaas",
        "Presentation with live feedback",
        "Custom action plan",
        "12 months access",
      ],
    },
    image: "/images/training/set-cover.jpg",
    bumps: ["boek-ebook", "boek-hardcopy", "boek-luisterboek"],
    productType: "training",
    installments: { count: 3, amountPerTerm: 125000 },
  },
  "cst-online": {
    slug: "cst-online",
    name: {
      nl: "Customer Success Training — Online",
      en: "Customer Success Training — Online",
    },
    shortName: { nl: "CST Online", en: "CST Online" },
    type: "training",
    price: 225000,
    priceInclBtw: false,
    btwRate: 21,
    description: {
      nl: "6 modules online training voor professionals in klantcontact, service en delivery.",
      en: "6 modules online training for professionals in customer contact, service and delivery.",
    },
    features: {
      nl: [
        "6 modules online training",
        "Digitaal werkboek",
        "Certificaat na afronding",
        "Bestseller boek inbegrepen",
        "12 maanden toegang",
      ],
      en: [
        "6 modules online training",
        "Digital workbook",
        "Certificate upon completion",
        "Bestselling book included",
        "12 months access",
      ],
    },
    image: "/images/training/cst-cover.jpg",
    bumps: ["boek-ebook", "boek-hardcopy", "boek-luisterboek"],
    productType: "training",
    installments: { count: 3, amountPerTerm: 75000 },
  },
  "cst-coaching": {
    slug: "cst-coaching",
    name: {
      nl: "Customer Success Training — Training + Coaching",
      en: "Customer Success Training — Training + Coaching",
    },
    shortName: { nl: "CST + Coaching", en: "CST + Coaching" },
    type: "training",
    price: 375000,
    priceInclBtw: false,
    btwRate: 21,
    description: {
      nl: "Alles van Online plus fysiek werkboek, persoonlijke kick-off en coaching van Klaas.",
      en: "Everything from Online plus physical workbook, personal kick-off and coaching from Klaas.",
    },
    features: {
      nl: [
        "Alles van Online",
        "Fysiek werkboek",
        "Persoonlijke kick-off met Klaas",
        "Presentatie met live feedback",
        "Actieplan op maat",
        "12 maanden toegang",
      ],
      en: [
        "Everything from Online",
        "Physical workbook",
        "Personal kick-off with Klaas",
        "Presentation with live feedback",
        "Custom action plan",
        "12 months access",
      ],
    },
    image: "/images/training/cst-cover.jpg",
    bumps: ["boek-ebook", "boek-hardcopy", "boek-luisterboek"],
    productType: "training",
    installments: { count: 3, amountPerTerm: 125000 },
  },
  "boek-ebook": {
    slug: "boek-ebook",
    name: {
      nl: "Sales, Oprecht & Ontspannen — E-book",
      en: "Sales, Honest & Relaxed — E-book",
    },
    shortName: { nl: "E-book", en: "E-book" },
    type: "book",
    price: 2250,
    priceInclBtw: true,
    btwRate: 9,
    description: {
      nl: "Direct toegang tot het e-book. Lees op je telefoon, tablet of computer.",
      en: "Instant access to the e-book. Read on your phone, tablet or computer.",
    },
    features: {
      nl: ["Direct downloaden (PDF)", "Lezen op elk apparaat", "Bestseller — 2.500+ verkocht"],
      en: ["Instant download (PDF)", "Read on any device", "Bestseller — 2,500+ sold"],
    },
    image: "/images/boek/cover-3d.png",
    bumps: ["boek-hardcopy", "boek-luisterboek"],
    productType: "book",
  },
  "boek-hardcopy": {
    slug: "boek-hardcopy",
    name: {
      nl: "Sales, Oprecht & Ontspannen — Hard Copy",
      en: "Sales, Honest & Relaxed — Hard Copy",
    },
    shortName: { nl: "Hard Copy", en: "Hard Copy" },
    type: "book",
    price: 3250,
    priceInclBtw: true,
    btwRate: 9,
    description: {
      nl: "Fysiek boek, gratis verzending binnen Nederland.",
      en: "Physical book, free shipping within the Netherlands.",
    },
    features: {
      nl: ["Gratis verzending (NL)", "Binnen 2 werkdagen bezorgd", "Bestseller — 2.500+ verkocht"],
      en: ["Free shipping (NL)", "Delivered within 2 business days", "Bestseller — 2,500+ sold"],
    },
    image: "/images/boek/cover-3d.png",
    bumps: ["boek-ebook", "boek-luisterboek"],
    productType: "book",
  },
  "boek-luisterboek": {
    slug: "boek-luisterboek",
    name: {
      nl: "Sales, Oprecht & Ontspannen — Luisterboek",
      en: "Sales, Honest & Relaxed — Audiobook",
    },
    shortName: { nl: "Luisterboek", en: "Audiobook" },
    type: "book",
    price: 2250,
    priceInclBtw: true,
    btwRate: 9,
    description: {
      nl: "Ingesproken door Klaas zelf. Luister onderweg of op kantoor.",
      en: "Narrated by Klaas himself. Listen on the go or at the office.",
    },
    features: {
      nl: ["Direct downloaden (MP3)", "Ingesproken door Klaas", "Bestseller — 2.500+ verkocht"],
      en: ["Instant download (MP3)", "Narrated by Klaas", "Bestseller — 2,500+ sold"],
    },
    image: "/images/boek/cover-3d.png",
    bumps: ["boek-hardcopy", "boek-ebook"],
    productType: "book",
  },
};

/** Gift book bump — shown after buying any book format */
export const GIFT_BUMP: BumpConfig = {
  slug: "boek-cadeau",
  name: {
    nl: "Cadeau-exemplaar (25% korting)",
    en: "Gift copy (25% off)",
  },
  price: 2438, // 75% of €32,50
  priceInclBtw: true,
  description: {
    nl: "Bestel een tweede hardcopy als cadeau voor een collega of vriend.",
    en: "Order a second hard copy as a gift for a colleague or friend.",
  },
};

/** Format price from cents to display string */
export function formatPrice(cents: number, locale: "nl" | "en" = "nl"): string {
  const euros = cents / 100;
  if (locale === "en") {
    return `€${euros.toFixed(2).replace(".", ",")}`;
  }
  return `€ ${euros.toFixed(2).replace(".", ",")}`;
}

/** Calculate BTW amount from price in cents */
export function calculateBtw(
  priceCents: number,
  btwRate: number,
  priceInclBtw: boolean,
): { net: number; btw: number; gross: number } {
  if (priceInclBtw) {
    const net = Math.round(priceCents / (1 + btwRate / 100));
    const btw = priceCents - net;
    return { net, btw, gross: priceCents };
  }
  const btw = Math.round(priceCents * (btwRate / 100));
  return { net: priceCents, btw, gross: priceCents + btw };
}

export function getProduct(slug: string): CheckoutProduct | undefined {
  return CHECKOUT_PRODUCTS[slug];
}

/** Get available bumps for a product, excluding the product itself */
export function getBumpsForProduct(slug: string): BumpConfig[] {
  const product = CHECKOUT_PRODUCTS[slug];
  if (!product) return [];

  return product.bumps
    .map((bumpSlug) => {
      const bumpProduct = CHECKOUT_PRODUCTS[bumpSlug];
      if (!bumpProduct) return null;
      return {
        slug: bumpProduct.slug,
        name: bumpProduct.shortName,
        price: bumpProduct.price,
        priceInclBtw: bumpProduct.priceInclBtw,
        description: bumpProduct.description,
      };
    })
    .filter((b): b is BumpConfig => b !== null);
}

/** EU country codes for BTW logic */
export const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export type EuCountry = (typeof EU_COUNTRIES)[number];

export function isEuCountry(code: string): boolean {
  return EU_COUNTRIES.includes(code as EuCountry);
}
