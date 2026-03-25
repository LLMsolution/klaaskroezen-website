/**
 * Central site configuration.
 *
 * llms.txt, sitemap.xml and structured data all read from this file.
 * When you change a page, price, or service — update it here and
 * everything stays in sync automatically.
 */

export const SITE_URL = "https://www.klaaskroezen.com";

export const SITE = {
  name: "Klaas Kroezen",
  tagline: "Meer omzet, minder stress",
  description:
    "Sales- en Customer Success trainingen, spreker en auteur. Oprecht en ontspannen verkopen. 25+ jaar ervaring in 21 landen.",
  language: "nl",
  founder: "Klaas Kroezen",
  email: "info@klaaskroezen.com",
} as const;

export interface SitePage {
  path: string;
  title: string;
  description: string;
  /** sitemap priority 0–1 */
  priority: number;
  /** sitemap change frequency */
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  /** included in llms.txt */
  llms: boolean;
}

export interface SiteProduct {
  name: string;
  type: "training" | "book" | "service";
  description: string;
  price?: string;
  priceNote?: string;
  path: string;
  /** false = removed/paused, excluded from llms.txt */
  active: boolean;
}

export const PAGES: SitePage[] = [
  {
    path: "/",
    title: "Home",
    description:
      "Sales- en Customer Success trainingen van Klaas Kroezen. Ontdek een bewezen aanpak die werkt — oprecht en ontspannen.",
    priority: 1,
    changeFrequency: "monthly",
    llms: true,
  },
  {
    path: "/sales-excellence-training",
    title: "Sales Excellence Training",
    description:
      "Meer omzet met minder druk. Voor verkopers, accountmanagers en salesteams. 6 modules, werkboek, persoonlijke coaching.",
    priority: 0.9,
    changeFrequency: "monthly",
    llms: true,
  },
  {
    path: "/customer-success-training",
    title: "Customer Success Training",
    description:
      "Maak van klanten fans. Voor customer success managers, servicedesks en consultants. 6 modules, werkboek, persoonlijke coaching.",
    priority: 0.9,
    changeFrequency: "monthly",
    llms: true,
  },
  {
    path: "/spreker",
    title: "Spreker & Keynote",
    description:
      "Boek Klaas Kroezen als spreker. Keynotes en workshops over sales, klantgerichtheid en commerciële groei.",
    priority: 0.7,
    changeFrequency: "monthly",
    llms: true,
  },
  {
    path: "/boek",
    title: "Boek — Sales, Oprecht en Ontspannen",
    description:
      "Bestseller van Klaas Kroezen. Praktische gids voor oprecht en ontspannen verkopen. Hardcopy, e-book en luisterboek.",
    priority: 0.7,
    changeFrequency: "monthly",
    llms: true,
  },
  {
    path: "/over-ons",
    title: "Over ons",
    description:
      "Het team achter Klaas Kroezen: Klaas, Joost, Sanne en Tim. Missie, achtergrond en ervaring.",
    priority: 0.6,
    changeFrequency: "monthly",
    llms: true,
  },
  {
    path: "/nieuws",
    title: "Nieuws & Blog",
    description:
      "Het laatste nieuws, trainingen, boekupdates en inzichten van Klaas Kroezen.",
    priority: 0.6,
    changeFrequency: "weekly",
    llms: true,
  },
  {
    path: "/contact",
    title: "Contact",
    description:
      "Neem contact op met Klaas Kroezen. Vraag een offerte aan voor trainingen, coaching of een keynote.",
    priority: 0.5,
    changeFrequency: "yearly",
    llms: true,
  },
  {
    path: "/privacy",
    title: "Privacybeleid",
    description: "Privacybeleid van Klaas Kroezen.",
    priority: 0.2,
    changeFrequency: "yearly",
    llms: false,
  },
  {
    path: "/algemene-voorwaarden",
    title: "Algemene voorwaarden",
    description: "Algemene voorwaarden van Klaas Kroezen.",
    priority: 0.2,
    changeFrequency: "yearly",
    llms: false,
  },
];

export const PRODUCTS: SiteProduct[] = [
  {
    name: "Sales Excellence Training — Online",
    type: "training",
    description:
      "6 modules online training met digitaal werkboek. Flexibel in eigen tempo. Inclusief bestseller boek en certificaat.",
    price: "€ 2.250",
    priceNote: "Excl. BTW",
    path: "/sales-excellence-training",
    active: true,
  },
  {
    name: "Sales Excellence Training — Training + Coaching",
    type: "training",
    description:
      "Alles van Online plus fysiek werkboek, persoonlijke kick-off, presentatie met feedback van Klaas en actieplan op maat.",
    price: "€ 3.750",
    priceNote: "Excl. BTW",
    path: "/sales-excellence-training",
    active: true,
  },
  {
    name: "Sales Excellence Training — Teams",
    type: "training",
    description:
      "Teamtraining met fysiek werkboek per deelnemer, gezamenlijke kick-off op locatie, groepspresentaties met live feedback van Klaas.",
    price: "€ 2.250 per deelnemer",
    priceNote: "Excl. BTW · Vanaf 3 personen",
    path: "/sales-excellence-training",
    active: true,
  },
  {
    name: "Customer Success Training — Online",
    type: "training",
    description:
      "6 modules online training met digitaal werkboek. Voor professionals in klantcontact, service en delivery.",
    price: "€ 2.250",
    priceNote: "Excl. BTW",
    path: "/customer-success-training",
    active: true,
  },
  {
    name: "Customer Success Training — Training + Coaching",
    type: "training",
    description:
      "Alles van Online plus fysiek werkboek, persoonlijke kick-off, presentatie met feedback van Klaas en actieplan op maat.",
    price: "€ 3.750",
    priceNote: "Excl. BTW",
    path: "/customer-success-training",
    active: true,
  },
  {
    name: "Customer Success Training — Teams",
    type: "training",
    description:
      "Teamtraining met fysiek werkboek per deelnemer, gezamenlijke kick-off op locatie, groepspresentaties met live feedback van Klaas.",
    price: "€ 2.250 per deelnemer",
    priceNote: "Excl. BTW · Vanaf 3 personen",
    path: "/customer-success-training",
    active: true,
  },
  {
    name: "Boek — Sales, Oprecht en Ontspannen",
    type: "book",
    description:
      "Bestseller, 2e druk, 2.500+ verkocht, #1 Managementboek. Beschikbaar als hardcopy, e-book en luisterboek (ingesproken door Klaas zelf).",
    price: "€ 32,50",
    path: "/boek",
    active: true,
  },
  {
    name: "Spreker & Keynote",
    type: "service",
    description:
      "Keynotes van 30-60 minuten en workshops van halve tot hele dag. Over sales, klantgerichtheid en commerciële groei. Nederland, België en internationaal.",
    price: "Op aanvraag",
    path: "/spreker",
    active: true,
  },
  {
    name: "1-op-1 Coaching",
    type: "service",
    description:
      "Persoonlijke begeleiding voor sales professionals en leidinggevenden. Op eigen tempo, afgestemd op individuele uitdagingen.",
    price: "Op aanvraag",
    path: "/spreker",
    active: true,
  },
];
