import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "contact";

export function seedContactContent(): PageSeed {
  const sections = [
    { id: "hero", type: "hero-about", active: true, sortOrder: 0 },
    { id: "contact-info", type: "contact-info", active: true, sortOrder: 1 },
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
        "Vraag meer informatie aan, plan een kennismaking of stel je vraag via het formulier hieronder.",
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
        "Request more information, schedule an introduction, or ask your question via the form below.",
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
        "Fordern Sie weitere Informationen an, vereinbaren Sie ein Kennenlerngespräch oder stellen Sie Ihre Frage über das untenstehende Formular.",
      ],
      stats: [],
    }),
    // Contact Info (sidebar)
    makeContent(SLUG, "contact-info", "contact-info", "nl", {
      emailLabel: "E-mail",
      email: "klaas@klaaskroezen.com",
      phoneLabel: "Telefoon",
      phone: "+31 6 1809 8906",
      phoneHref: "+31618098906",
      officeLabel: "Kantoor",
      officeName: "Het Oude Administratiegebouw",
      officeAddress1: "Oude Parklaan 111, Kamer 0.11",
      officeAddress2: "Castricum",
      directContactLabel: "Direct contact",
      planCallLabel: "Plan een videogesprek",
      planCallUrl: "https://calendly.com/klaaskroezen",
      linkedinUrl: "https://www.linkedin.com/in/klaaskroezen/",
    }),
    makeContent(SLUG, "contact-info", "contact-info", "en", {
      emailLabel: "Email",
      email: "klaas@klaaskroezen.com",
      phoneLabel: "Phone",
      phone: "+31 6 1809 8906",
      phoneHref: "+31618098906",
      officeLabel: "Office",
      officeName: "Het Oude Administratiegebouw",
      officeAddress1: "Oude Parklaan 111, Room 0.11",
      officeAddress2: "Castricum",
      directContactLabel: "Direct contact",
      planCallLabel: "Schedule a video call",
      planCallUrl: "https://calendly.com/klaaskroezen",
      linkedinUrl: "https://www.linkedin.com/in/klaaskroezen/",
    }),
    makeContent(SLUG, "contact-info", "contact-info", "de", {
      emailLabel: "E-Mail",
      email: "klaas@klaaskroezen.com",
      phoneLabel: "Telefon",
      phone: "+31 6 1809 8906",
      phoneHref: "+31618098906",
      officeLabel: "Büro",
      officeName: "Het Oude Administratiegebouw",
      officeAddress1: "Oude Parklaan 111, Raum 0.11",
      officeAddress2: "Castricum",
      directContactLabel: "Direkter Kontakt",
      planCallLabel: "Videogespräch planen",
      planCallUrl: "https://calendly.com/klaaskroezen",
      linkedinUrl: "https://www.linkedin.com/in/klaaskroezen/",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Contact", en: "Contact", de: "Kontakt" },
    sections,
    content,
  };
}
