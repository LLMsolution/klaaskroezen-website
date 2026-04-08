import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "contact";

export function seedContactContent(): PageSeed {
  const sections = [
    { id: "hero", type: "hero-about", active: true, sortOrder: 0 },
  ];

  const content = [
    // Hero — reuse hero-about schema (label, title, image, bio)
    makeContent(SLUG, "hero", "hero-about", "nl", {
      label: "Contact",
      title: "Laten we",
      titleAccent: "contact maken.",
      image: "/images/about/klaas-kroezen-portrait-2.jpeg",
      imageAlt: "Klaas Kroezen",
      bio: [
        { value: "Vraag meer informatie aan, plan een kennismaking of stel je vraag via het formulier hieronder." },
      ],
      stats: [],
    }),
    makeContent(SLUG, "hero", "hero-about", "en", {
      label: "Contact",
      title: "Let's",
      titleAccent: "get in touch.",
      image: "/images/about/klaas-kroezen-portrait-2.jpeg",
      imageAlt: "Klaas Kroezen",
      bio: [
        { value: "Request more information, schedule an introduction, or ask your question via the form below." },
      ],
      stats: [],
    }),
    makeContent(SLUG, "hero", "hero-about", "de", {
      label: "Kontakt",
      title: "Nehmen wir",
      titleAccent: "Kontakt auf.",
      image: "/images/about/klaas-kroezen-portrait-2.jpeg",
      imageAlt: "Klaas Kroezen",
      bio: [
        { value: "Fordern Sie weitere Informationen an, vereinbaren Sie ein Kennenlerngespräch oder stellen Sie Ihre Frage über das untenstehende Formular." },
      ],
      stats: [],
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Contact", en: "Contact", de: "Kontakt" },
    sections,
    content,
  };
}
