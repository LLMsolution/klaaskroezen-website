import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "over-ons";

export function seedOverOnsContent(): PageSeed {
  const sections = [
    { id: "hero", type: "hero-about", active: true, sortOrder: 0 },
    { id: "journey", type: "journey", active: true, sortOrder: 1 },
    { id: "mission", type: "mission", active: true, sortOrder: 2 },
    { id: "team", type: "team", active: true, sortOrder: 3 },
    { id: "office", type: "office", active: true, sortOrder: 4 },
    { id: "cta", type: "cta", active: true, sortOrder: 5 },
  ];

  const content = [
    // ── Hero ──
    makeContent(SLUG, "hero", "hero-about", "nl", {
      label: "Over Klaas",
      title: "Oprecht en ontspannen",
      titleAccent: "is geen slogan.",
      imageAlt: "Klaas Kroezen",
      bio: [
        "Ik stond 25 jaar aan de frontlinie als ondernemer en CEO. Ik weet hoe het voelt als sales voelt als trekken aan een dood paard. En ik weet hoe het wél werkt.",
        "Niet met trucjes of scripts, maar met een aanpak die past bij mensen. Na de verkoop van mijn bedrijf in 2022 richt ik mij volledig op het begeleiden van teams naar meer omzet met minder stress.",
      ],
      stats: [
        { label: "Ervaring", value: "25+ jaar" },
        { label: "Landen", value: "21" },
        { label: "Beoordeling", value: "9,1" },
        { label: "Boek", value: "#1 Bestseller" },
      ],
    }),
    makeContent(SLUG, "hero", "hero-about", "en", {
      label: "About Klaas",
      title: "Genuine and relaxed",
      titleAccent: "is not a slogan.",
      imageAlt: "Klaas Kroezen",
      bio: [
        "I spent 25 years on the front line as an entrepreneur and CEO. I know what it feels like when sales feels like flogging a dead horse. And I know what actually works.",
        "Not with tricks or scripts, but with an approach that suits people. After selling my company in 2022, I fully focus on guiding teams towards more revenue with less stress.",
      ],
      stats: [
        { label: "Experience", value: "25+ years" },
        { label: "Countries", value: "21" },
        { label: "Rating", value: "9.1" },
        { label: "Book", value: "#1 Bestseller" },
      ],
    }),
    // ── Journey ──
    makeContent(SLUG, "journey", "journey", "nl", {
      label: "Het pad",
      title: "Van ondernemer",
      titleAccent: "naar trainer.",
      items: [
        { period: "1997 – 2022", title: "Ondernemer & CEO", text: "25 jaar internationaal B2B. Tientallen miljoenen euro's omzet gerealiseerd in 21 landen. Verkocht aan Google, Samsung, Microsoft, Bol en ING." },
        { period: "2022", title: "Bedrijf verkocht", text: "Na de verkoop van WUA besloot ik mijn ervaring in te zetten voor anderen. Niet als consultant, maar als trainer." },
        { period: "2025", title: "Bestseller auteur", text: "Sales, Oprecht en Ontspannen werd #1 bij Managementboek. 2.500+ exemplaren verkocht in de eerste maanden." },
        { period: "Nu", title: "Trainer & spreker", text: "Volledig gericht op het begeleiden van directies, teams en professionals. Omdat iedereen die klantcontact heeft, het verschil maakt." },
      ],
    }),
    makeContent(SLUG, "journey", "journey", "en", {
      label: "The path",
      title: "From entrepreneur",
      titleAccent: "to trainer.",
      items: [
        { period: "1997 – 2022", title: "Entrepreneur & CEO", text: "25 years of international B2B. Tens of millions in revenue across 21 countries. Sold to Google, Samsung, Microsoft, Bol and ING." },
        { period: "2022", title: "Company sold", text: "After selling WUA, I decided to use my experience to help others. Not as a consultant, but as a trainer." },
        { period: "2025", title: "Bestselling author", text: "Sales, Genuine and Relaxed became #1 at Managementboek. 2,500+ copies sold in the first months." },
        { period: "Now", title: "Trainer & speaker", text: "Fully focused on guiding executives, teams and professionals. Because everyone with customer contact makes the difference." },
      ],
    }),
    // ── Mission ──
    makeContent(SLUG, "mission", "mission", "nl", {
      label: "De missie",
      title: "Eén taal.",
      titleAccent: "Eén aanpak.",
      imageAlt: "Klaas Kroezen geeft een training",
      paragraphs: [
        "Wanneer sales achterblijft en klanttevredenheid daalt, is versnippering funest. Daarom werk ik met twee trainingen voor iedereen die contact heeft met klanten.",
        "Verkopen hoort niet ongemakkelijk te voelen. Het zou iets moeten zijn dat je met plezier en trots doet. Omdat het helpt. Omdat het klopt.",
      ],
      ctaSales: "Sales Excellence",
      ctaSuccess: "Customer Success",
    }),
    makeContent(SLUG, "mission", "mission", "en", {
      label: "The mission",
      title: "One language.",
      titleAccent: "One approach.",
      imageAlt: "Klaas Kroezen delivering a training",
      paragraphs: [
        "When sales falls behind and customer satisfaction drops, fragmentation is fatal. That is why I work with two trainings for everyone who has contact with customers.",
        "Selling should not feel uncomfortable. It should be something you do with enjoyment and pride. Because it helps. Because it is right.",
      ],
      ctaSales: "Sales Excellence",
      ctaSuccess: "Customer Success",
    }),
    // ── Team ──
    makeContent(SLUG, "team", "team", "nl", {
      label: "Het team",
      title: "Klein team.",
      titleAccent: "Groot bereik.",
      members: [
        { name: "Tim Lind", role: "Rechterhand van Klaas", image: "/images/about/tim-lind.png", description: "Samen bouwen we de app, verbeteren we continu de trainingen, werkboeken, presentaties en video's." },
        { name: "Joost Wammes", role: "Customer Success Manager", image: "/images/about/joost-wammes.png", description: "Zocht zelf een salestraining en was zó enthousiast dat hij nu deel uitmaakt van het team." },
        { name: "Sanne Bakker", role: "Klantenservice & administratie", image: "/images/about/sanne-bakker.png", description: "Al meer dan 20 jaar werkzaam bij Klaas. Verzorgt de klantenservice en administratie." },
        { name: "Yvon", role: "", image: "", description: "" },
      ],
    }),
    makeContent(SLUG, "team", "team", "en", {
      label: "The team",
      title: "Small team.",
      titleAccent: "Big reach.",
      members: [
        { name: "Tim Lind", role: "Klaas's right hand", image: "/images/about/tim-lind.png", description: "Together we build the app and continuously improve the trainings, workbooks, presentations and videos." },
        { name: "Joost Wammes", role: "Customer Success Manager", image: "/images/about/joost-wammes.png", description: "Was looking for a sales training himself and was so enthusiastic that he is now part of the team." },
        { name: "Sanne Bakker", role: "Customer service & administration", image: "/images/about/sanne-bakker.png", description: "Has been working with Klaas for over 20 years. Handles customer service and administration." },
        { name: "Yvon", role: "", image: "", description: "" },
      ],
    }),
    // ── Office ──
    makeContent(SLUG, "office", "office", "nl", {
      label: "Ons kantoor",
      title: "Het Oude",
      titleLine2: "Administratiegebouw.",
      imageAlt: "Het Oude Administratiegebouw in Castricum",
      description: "Een karakteristiek monumentaal pand in Castricum, aan de rand van het Noord-Hollands Duinreservaat. De fijne sfeer en de dynamiek van ondernemers om ons heen maken dit de perfecte plek.",
      address: "Oude Parklaan 111, Castricum · Kamer 0.11",
    }),
    makeContent(SLUG, "office", "office", "en", {
      label: "Our office",
      title: "The Old",
      titleLine2: "Administration Building.",
      imageAlt: "The Old Administration Building in Castricum",
      description: "A characteristic monumental building in Castricum, on the edge of the North Holland Dune Reserve. The pleasant atmosphere and the dynamic of entrepreneurs around us make this the perfect place.",
      address: "Oude Parklaan 111, Castricum · Room 0.11",
    }),
    // ── CTA ──
    makeContent(SLUG, "cta", "cta", "nl", {
      title: "Klaar om het anders te doen?",
      titleAccent: "Neem contact op.",
      description: "Samen brengen we in beeld waar je nu staat, waar kansen liggen, en welke aanpak jou of je team het meeste oplevert.",
      href: "/contact",
      ctaLabel: "Neem contact op",
    }),
    makeContent(SLUG, "cta", "cta", "en", {
      title: "Ready to do things differently?",
      titleAccent: "Get in touch.",
      description: "Together we map out where you stand, where opportunities lie, and which approach delivers the most for you or your team.",
      href: "/contact",
      ctaLabel: "Get in touch",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Over Ons", en: "About Us" },
    sections,
    content,
  };
}
