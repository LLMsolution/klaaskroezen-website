import type { Lang } from "@/lib/i18n";
import { setNl } from "./content-nl";
import { setEn } from "./content-en";
import { setDe } from "./content-de";

export function getSetContent(lang: Lang) {
  const text = { nl: setNl, en: setEn, de: setDe }[lang];

  return {
    meta: {
      title: "Sales Excellence Training",
      description: text.metaDescription,
    },

    jsonLd: {
      name: "Sales Excellence Training",
      description: text.jsonLdDescription,
      url: "https://www.klaaskroezen.com/sales-excellence-training",
      price: "2250",
    },

    hero: {
      eyebrow: "Sales Excellence Training",
      titleLine1: text.heroTitleLine1,
      titleLine2: text.heroTitleLine2,
      description: text.heroDescription,
      image: "/images/training/visma-youserve-session.jpg",
      imageAlt: text.heroImageAlt,
      imagePosition: "center 25%",
      glassItems: text.glassItems,
    },

    painPoints: {
      title: text.painTitle,
      titleAccent: text.painTitleAccent,
      points: text.painPoints,
    },

    transformation: text.transformation,

    audiences: text.audiences,

    program: {
      price: "\u20ac 2.250",
      modules: text.modules,
    },

    reviews: text.reviews,

    pricing: {
      guarantee: text.guarantee,
      individual: { tiers: text.individualTiers },
      team: { tiers: text.teamTiers },
    },

    crossLink: {
      eyebrow: text.crossEyebrow,
      title: "Customer Success Training.",
      titleAccent: text.crossTitleAccent,
      description: text.crossDescription,
      image: "/images/hero/customer-success-group.jpg",
      imageAlt: text.crossImageAlt,
      href: "/customer-success-training",
      ctaLabel: text.crossCtaLabel,
    },

    faq: {
      title: text.faqTitle,
      titleAccent: text.faqTitleAccent,
      items: text.faqItems,
    },

    cta: {
      title: text.ctaTitle,
      titleAccent: text.ctaTitleAccent,
      description: text.ctaDescription,
      href: "#pricing",
    },
  };
}
