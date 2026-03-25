import type { Lang } from "@/lib/i18n";
import { boekNl } from "./content-nl";
import { boekEn } from "./content-en";
import { boekDe } from "./content-de";

export function getBoekContent(lang: Lang, images?: Record<string, string>) {
  const text = { nl: boekNl, en: boekEn, de: boekDe }[lang];

  return {
    meta: {
      title: text.metaTitle,
      description: text.metaDescription,
    },

    hero: {
      label: "Bestseller",
      imageAlt: text.heroImageAlt,
      titleLine1: text.heroTitleLine1,
      titleAccent: text.heroTitleAccent,
      paragraphs: text.heroParagraphs,
      boldText: text.heroBoldText,
      afterBold: text.heroAfterBold,
      badges: text.heroBadges,
      cta: text.heroCta,
    },

    program: {
      price: "\u20ac 32,50",
      pricingAnchor: "#bestellen",
      ctaLabel: text.ctaLabel,
      modules: text.modules,
    },

    testimonials: {
      eyebrow: text.testimonialsEyebrow,
      title: text.testimonialsTitle,
      titleAccent: text.testimonialsTitleAccent,
      reviews: text.reviews,
    },

    faq: {
      title: text.faqTitle,
      titleAccent: text.faqTitleAccent,
      items: text.faqItems,
    },

    videos: {
      eyebrow: text.videosEyebrow,
      title: text.videosTitle,
      description: text.videosDescription,
      items: [
        {
          title: text.videoItems[0],
          thumbnail: images?.["spreker/video-thumb-speech.jpg"] ?? "/images/spreker/video-thumb-speech.jpg",
          embedUrl: "https://www.youtube.com/embed/F6io8l_VYww",
          duration: "3:35",
        },
        {
          title: text.videoItems[1],
          thumbnail: images?.["book/boeklancering.jpeg"] ?? "/images/book/boeklancering.jpeg",
          embedUrl: "https://www.youtube.com/embed/o7ajUmwEWpI",
          duration: "1:08",
        },
      ],
    },

    interview: {
      eyebrow: "Managementboek.nl",
      title: text.interviewTitle,
      titleAccent: text.interviewTitleAccent,
      image: images?.["blog/klaas-managementboek-interview.jpg"] ?? "/images/blog/klaas-managementboek-interview.jpg",
      imageAlt: "Klaas Kroezen \u2014 interview Managementboek.nl",
      intro: text.interviewIntro,
      quotes: text.interviewQuotes,
      linkText: text.interviewLinkText,
      linkUrl:
        "https://www.managementboek.nl/magazine/q&a/23083/klaas-kroezen-sales-is-menselijk-contact.-oprechte-interesse",
    },

    crossLink: {
      eyebrow: text.crossEyebrow,
      title: "Sales Excellence Training.",
      titleAccent: text.crossTitleAccent,
      description: text.crossDescription,
      image: images?.["hero/sales-excellence-group.jpeg"] ?? "/images/hero/sales-excellence-group.jpeg",
      imageAlt: text.crossImageAlt,
      href: "/sales-excellence-training",
      ctaLabel: text.crossCtaLabel,
    },

    cta: {
      title: text.ctaTitle,
      titleAccent: text.ctaTitleAccent,
      description: text.ctaDescription,
      href: "#bestellen",
      ctaLabel: text.ctaCtaLabel,
    },
  };
}
