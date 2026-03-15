import type { Lang } from "@/lib/i18n";

export function getOverOnsContent(lang: Lang) {
  const nl = lang === "nl";

  return {
    meta: {
      title: nl ? "Over Ons" : "About Us",
      description: nl
        ? "Leer Klaas Kroezen en zijn team kennen. 25+ jaar ervaring in sales en customer success, nu volledig gericht op het begeleiden van teams naar meer omzet met minder stress."
        : "Meet Klaas Kroezen and his team. 25+ years of experience in sales and customer success, now fully dedicated to guiding teams towards more revenue with less stress.",
    },

    hero: {
      label: nl ? "Over Klaas" : "About Klaas",
      title: nl ? "Oprecht en ontspannen" : "Genuine and relaxed",
      titleAccent: nl ? "is geen slogan." : "is not a slogan.",
      imageAlt: "Klaas Kroezen",
      bio: [
        nl
          ? "Ik stond 25 jaar aan de frontlinie als ondernemer en CEO. Ik weet hoe het voelt als sales voelt als trekken aan een dood paard. En ik weet hoe het w\u00e9l werkt."
          : "I spent 25 years on the front line as an entrepreneur and CEO. I know what it feels like when sales feels like flogging a dead horse. And I know what actually works.",
        nl
          ? "Niet met trucjes of scripts, maar met een aanpak die past bij mensen. Na de verkoop van mijn bedrijf in 2022 richt ik mij volledig op het begeleiden van teams naar meer omzet met minder stress."
          : "Not with tricks or scripts, but with an approach that suits people. After selling my company in 2022, I fully focus on guiding teams towards more revenue with less stress.",
      ],
      stats: nl
        ? [
            { label: "Ervaring", value: "25+ jaar" },
            { label: "Landen", value: "21" },
            { label: "Beoordeling", value: "9,1" },
            { label: "Boek", value: "#1 Bestseller" },
          ]
        : [
            { label: "Experience", value: "25+ years" },
            { label: "Countries", value: "21" },
            { label: "Rating", value: "9.1" },
            { label: "Book", value: "#1 Bestseller" },
          ],
    },

    journey: {
      label: nl ? "Het pad" : "The path",
      title: nl ? "Van ondernemer" : "From entrepreneur",
      titleAccent: nl ? "naar trainer." : "to trainer.",
      items: nl
        ? [
            {
              period: "1997 \u2013 2022",
              title: "Ondernemer & CEO",
              text: "25 jaar internationaal B2B. Tientallen miljoenen euro\u2019s omzet gerealiseerd in 21 landen. Verkocht aan Google, Samsung, Microsoft, Bol en ING.",
            },
            {
              period: "2022",
              title: "Bedrijf verkocht",
              text: "Na de verkoop van WUA besloot ik mijn ervaring in te zetten voor anderen. Niet als consultant, maar als trainer.",
            },
            {
              period: "2025",
              title: "Bestseller auteur",
              text: "Sales, Oprecht en Ontspannen werd #1 bij Managementboek. 2.500+ exemplaren verkocht in de eerste maanden.",
            },
            {
              period: "Nu",
              title: "Trainer & spreker",
              text: "Volledig gericht op het begeleiden van directies, teams en professionals. Omdat iedereen die klantcontact heeft, het verschil maakt.",
            },
          ]
        : [
            {
              period: "1997 \u2013 2022",
              title: "Entrepreneur & CEO",
              text: "25 years of international B2B. Tens of millions in revenue across 21 countries. Sold to Google, Samsung, Microsoft, Bol and ING.",
            },
            {
              period: "2022",
              title: "Company sold",
              text: "After selling WUA, I decided to use my experience to help others. Not as a consultant, but as a trainer.",
            },
            {
              period: "2025",
              title: "Bestselling author",
              text: "Sales, Genuine and Relaxed became #1 at Managementboek. 2,500+ copies sold in the first months.",
            },
            {
              period: "Now",
              title: "Trainer & speaker",
              text: "Fully focused on guiding executives, teams and professionals. Because everyone with customer contact makes the difference.",
            },
          ],
    },

    mission: {
      label: nl ? "De missie" : "The mission",
      title: nl ? "E\u00e9n taal." : "One language.",
      titleAccent: nl ? "E\u00e9n aanpak." : "One approach.",
      imageAlt: nl
        ? "Klaas Kroezen geeft een training"
        : "Klaas Kroezen delivering a training",
      paragraphs: [
        nl
          ? "Wanneer sales achterblijft en klanttevredenheid daalt, is versnippering funest. Daarom werk ik met twee trainingen voor iedereen die contact heeft met klanten."
          : "When sales falls behind and customer satisfaction drops, fragmentation is fatal. That is why I work with two trainings for everyone who has contact with customers.",
        nl
          ? "Verkopen hoort niet ongemakkelijk te voelen. Het zou iets moeten zijn dat je met plezier en trots doet. Omdat het helpt. Omdat het klopt."
          : "Selling should not feel uncomfortable. It should be something you do with enjoyment and pride. Because it helps. Because it is right.",
      ],
      ctaSales: "Sales Excellence",
      ctaSuccess: "Customer Success",
    },

    team: {
      label: nl ? "Het team" : "The team",
      title: nl ? "Klein team." : "Small team.",
      titleAccent: nl ? "Groot bereik." : "Big reach.",
      members: [
        {
          name: "Tim Lind",
          role: nl ? "Rechterhand van Klaas" : "Klaas's right hand",
          image: "/images/about/tim-lind.png",
          description: nl
            ? "Samen bouwen we de app, verbeteren we continu de trainingen, werkboeken, presentaties en video\u2019s."
            : "Together we build the app and continuously improve the trainings, workbooks, presentations and videos.",
        },
        {
          name: "Joost Wammes",
          role: "Customer Success Manager",
          image: "/images/about/joost-wammes.png",
          description: nl
            ? "Zocht zelf een salestraining en was z\u00f3 enthousiast dat hij nu deel uitmaakt van het team."
            : "Was looking for a sales training himself and was so enthusiastic that he is now part of the team.",
        },
        {
          name: "Sanne Bakker",
          role: nl
            ? "Klantenservice & administratie"
            : "Customer service & administration",
          image: "/images/about/sanne-bakker.png",
          description: nl
            ? "Al meer dan 20 jaar werkzaam bij Klaas. Verzorgt de klantenservice en administratie."
            : "Has been working with Klaas for over 20 years. Handles customer service and administration.",
        },
      ],
    },

    office: {
      label: nl ? "Ons kantoor" : "Our office",
      title: nl ? "Het Oude" : "The Old",
      titleLine2: "Administratiegebouw.",
      imageAlt: nl
        ? "Het Oude Administratiegebouw in Castricum"
        : "The Old Administration Building in Castricum",
      description: nl
        ? "Een karakteristiek monumentaal pand in Castricum, aan de rand van het Noord-Hollands Duinreservaat. De fijne sfeer en de dynamiek van ondernemers om ons heen maken dit de perfecte plek."
        : "A characteristic monumental building in Castricum, on the edge of the North Holland Dune Reserve. The pleasant atmosphere and the dynamic of entrepreneurs around us make this the perfect place.",
      address: "Oude Parklaan 111, Castricum \u00b7 Kamer 0.11",
    },

    cta: {
      title: nl ? "Klaar om het anders te doen?" : "Ready to do things differently?",
      titleAccent: nl ? "Neem contact op." : "Get in touch.",
      description: nl
        ? "Samen brengen we in beeld waar je nu staat, waar kansen liggen, en welke aanpak jou of je team het meeste oplevert."
        : "Together we map out where you stand, where opportunities lie, and which approach delivers the most for you or your team.",
      href: "/contact",
      ctaLabel: nl ? "Neem contact op" : "Get in touch",
    },
  };
}
