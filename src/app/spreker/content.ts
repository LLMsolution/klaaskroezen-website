import type { Lang } from "@/lib/i18n";

export function getSprekerContent(lang: Lang) {
  const nl = lang === "nl";

  return {
    meta: {
      title: nl ? "Spreker — Klaas Kroezen" : "Speaker — Klaas Kroezen",
      description: nl
        ? "Boek Klaas Kroezen als spreker. Inspirerende keynotes en workshops over sales, klantgerichtheid en commerciële groei — oprecht en ontspannen."
        : "Book Klaas Kroezen as a speaker. Inspiring keynotes and workshops on sales, customer focus and commercial growth — genuine and relaxed.",
    },

    hero: {
      eyebrow: nl ? "Spreker & Keynote" : "Speaker & Keynote",
      titleLine1: nl ? "Inspireer" : "Inspire",
      titleLine2: nl ? "je team." : "your team.",
      description: nl
        ? "Een inspiratiesessie waarin ik teams laat ervaren hoe je met minder spanning meer klanten verandert in fans. Geen theorie, maar energie en inzichten die blijven hangen."
        : "An inspiration session where I show teams how to turn more customers into fans with less tension. Not theory, but energy and insights that stick.",
      image: "/images/spreker/klaas-hero.jpeg",
      imageAlt: nl
        ? "Klaas Kroezen als spreker op het podium"
        : "Klaas Kroezen as a speaker on stage",
      imagePosition: "center 25%",
      ctaLabel: nl ? "Neem contact op" : "Get in touch",
      pricingAnchor: "/contact",
      programAnchor: "#videos",
      secondaryLabel: nl ? "Bekijk fragmenten" : "Watch clips",
      glassItems: nl
        ? [
            {
              label: "Keynotes & workshops",
              text: "Van 30 minuten inspiratie tot een volledige dagvullende workshop. Op maat voor jouw event of teamdag.",
            },
            {
              label: "25+ jaar ervaring",
              text: "Internationaal B2B bij Google, Samsung, Microsoft, ING en Vodafone. Eigen bedrijf verkocht in 2022.",
            },
            {
              label: "Bewezen impact",
              text: "Teams gaan naar huis met energie, inzichten en een concrete aanpak die ze direct kunnen toepassen.",
            },
          ]
        : [
            {
              label: "Keynotes & workshops",
              text: "From 30 minutes of inspiration to a full-day workshop. Tailored to your event or team day.",
            },
            {
              label: "25+ years of experience",
              text: "International B2B at Google, Samsung, Microsoft, ING and Vodafone. Company sold in 2022.",
            },
            {
              label: "Proven impact",
              text: "Teams go home with energy, insights and a concrete approach they can apply immediately.",
            },
          ],
    },

    audiences: nl
      ? [
          "Salesteams",
          "Kick-offs",
          "Teamdagen",
          "Conferenties",
          "Management events",
          "Klantevents",
        ]
      : [
          "Sales teams",
          "Kick-offs",
          "Team days",
          "Conferences",
          "Management events",
          "Client events",
        ],

    contentBlock: {
      eyebrow: nl ? "Over de sessie" : "About the session",
      title: nl
        ? "Sales gaat vaak mis door prestatiedruk."
        : "Sales often fails due to performance pressure.",
      titleAccent: nl ? "Het kan ook anders." : "There is another way.",
      imageAlt: nl
        ? "Klaas Kroezen geeft een workshop bij een flipchart"
        : "Klaas Kroezen leading a workshop at a flipchart",
      paragraphs: nl
        ? [
            "Door targets, cijfers en verwachtingen wordt verkoop krampachtig. Mensen raken gespannen, twijfelen, verliezen zichzelf — en het resultaat gaat juist omlaag. Dat kost energie, frustraties, vertrouwen én geld.",
            "Met 25 jaar ervaring in sales en klantbeleving, van scale-up tot boardroom, help ik teams groeien vanuit oprechte verbinding. Niet vanuit trucjes.",
            "Ik stond zelf jarenlang aan de frontlinie als CEO en eigenaar van een internationaal marktonderzoeksbureau. Ik weet hoe het voelt als sales voelt als trekken aan een dood paard. En ik weet hoe het wél werkt.",
          ]
        : [
            "Due to targets, numbers and expectations, selling becomes forced. People get tense, doubt themselves, lose their authenticity — and results actually go down. That costs energy, frustration, trust and money.",
            "With 25 years of experience in sales and customer experience, from scale-up to boardroom, I help teams grow through genuine connection. Not through tricks.",
            "I stood on the front lines for years as CEO and owner of an international market research agency. I know what it feels like when sales feels like a dead end. And I know what actually works.",
          ],
    },

    benefitsGrid: nl
      ? [
          { icon: "✓", text: "Energie en inspiratie die je meeneemt in je werk" },
          {
            icon: "✓",
            text: "Heldere inzichten voor duurzame commerciële groei",
          },
          {
            icon: "✓",
            text: "Verhalen en oefeningen die mensen in beweging zetten",
          },
          {
            icon: "✓",
            text: "Geen trucs. Geen scripts. Oprecht en ontspannen sales.",
          },
        ]
      : [
          {
            icon: "✓",
            text: "Energy and inspiration you take with you into your work",
          },
          {
            icon: "✓",
            text: "Clear insights for sustainable commercial growth",
          },
          {
            icon: "✓",
            text: "Stories and exercises that set people in motion",
          },
          {
            icon: "✓",
            text: "No tricks. No scripts. Genuine and relaxed sales.",
          },
        ],

    videos: {
      eyebrow: nl ? "Op het podium" : "On stage",
      title: nl ? "Bekijk fragmenten." : "Watch clips.",
      titleAccent: nl
        ? "Oprecht en ontspannen in actie."
        : "Genuine and relaxed in action.",
      items: [
        {
          title: nl
            ? "Speech op de boekpresentatie"
            : "Speech at the book launch",
          thumbnail: "/images/spreker/video-thumb-speech.jpg",
          embedUrl: "https://www.youtube.com/embed/F6io8l_VYww",
          duration: "3:35",
        },
        {
          title: nl
            ? "Sales- en klantgerichte mindset in je team"
            : "Sales and customer-focused mindset in your team",
          thumbnail: "/images/spreker/video-thumb-mindset.jpg",
          embedUrl: "https://www.youtube.com/embed/placeholder-mindset",
          duration: "1:46",
        },
      ],
    },

    logoBar: {
      label: nl ? "Gewerkt met onder andere" : "Worked with",
    },

    coaching: {
      sectionEyebrow: nl ? "Coaching & Begeleiding" : "Coaching & Guidance",
      sectionTitle1: nl ? "Persoonlijk of" : "Personal or",
      sectionTitle2: nl ? "als team." : "as a team.",
      individual: {
        label: nl ? "Individueel" : "Individual",
        title: nl ? "1-op-1 Coaching" : "1-on-1 Coaching",
        description: nl
          ? "Persoonlijke begeleiding voor sales professionals en leidinggevenden die willen groeien. Op jouw tempo, afgestemd op jouw uitdagingen."
          : "Personal guidance for sales professionals and leaders who want to grow. At your pace, tailored to your challenges.",
        features: nl
          ? [
              "Individueel traject op maat",
              "Persoonlijke sparring & feedback",
              "Focus op jouw specifieke uitdagingen",
              "Flexibel in te plannen",
            ]
          : [
              "Customised individual programme",
              "Personal sparring & feedback",
              "Focus on your specific challenges",
              "Flexible scheduling",
            ],
        price: nl ? "Op aanvraag" : "On request",
        cta: nl ? "Neem contact op →" : "Get in touch →",
      },
      team: {
        label: "Teams",
        title: nl ? "Coaching voor Teams" : "Team Coaching",
        description: nl
          ? "Begeleid je team naar een gezamenlijke commerciële mindset. Van bewustwording tot implementatie — samen groeien in klantgerichtheid."
          : "Guide your team towards a shared commercial mindset. From awareness to implementation — growing together in customer focus.",
        features: nl
          ? [
              "Gezamenlijke kick-off op locatie",
              "Teamgerichte oefeningen & casussen",
              "Begeleiding tijdens implementatie",
              "Meetbare resultaten per deelnemer",
            ]
          : [
              "Joint kick-off on location",
              "Team-focused exercises & cases",
              "Guidance during implementation",
              "Measurable results per participant",
            ],
        price: nl ? "Op aanvraag" : "On request",
        cta: nl ? "Plan een gesprek →" : "Schedule a call →",
      },
    },

    faq: {
      title: nl ? "Praktische info." : "Practical info.",
      titleAccent: nl ? "Voor organisatoren." : "For organisers.",
      items: nl
        ? [
            {
              question: "Hoe lang duurt een keynote of workshop?",
              answer:
                "Een keynote duurt 30 tot 60 minuten. Een workshop kan een halve of hele dag beslaan. Alles is op maat samen te stellen, afhankelijk van je programma en doelstelling.",
            },
            {
              question: "Waar geeft Klaas zijn sessies?",
              answer:
                "Overal in Nederland en België, op jullie locatie. Internationaal is ook mogelijk — Klaas heeft ervaring in 21 landen en geeft sessies in het Nederlands en Engels.",
            },
            {
              question: "Wat kost een keynote of workshop?",
              answer:
                "De investering hangt af van de duur, locatie en het aantal deelnemers. Neem contact op voor een vrijblijvend voorstel op maat.",
            },
            {
              question: "Voor welk publiek is Klaas geschikt?",
              answer:
                "Salesteams, management, klantenservice, kick-offs, conferenties en klantevents. Van 10 tot 500 deelnemers. De boodschap is altijd: oprecht en ontspannen commercieel groeien.",
            },
            {
              question: "Kan de sessie gecombineerd worden met coaching?",
              answer:
                "Ja, een keynote of workshop kan uitgebreid worden met 1-op-1 coaching of teambegeleiding. Zo blijft de impact niet beperkt tot de dag zelf.",
            },
          ]
        : [
            {
              question: "How long does a keynote or workshop last?",
              answer:
                "A keynote lasts 30 to 60 minutes. A workshop can span half a day or a full day. Everything can be tailored, depending on your programme and objectives.",
            },
            {
              question: "Where does Klaas deliver his sessions?",
              answer:
                "Anywhere in the Netherlands and Belgium, at your location. International is also possible — Klaas has experience in 21 countries and delivers sessions in Dutch and English.",
            },
            {
              question: "What does a keynote or workshop cost?",
              answer:
                "The investment depends on the duration, location and number of participants. Get in touch for a no-obligation custom proposal.",
            },
            {
              question: "What audience is Klaas suited for?",
              answer:
                "Sales teams, management, customer service, kick-offs, conferences and client events. From 10 to 500 participants. The message is always: genuine and relaxed commercial growth.",
            },
            {
              question: "Can the session be combined with coaching?",
              answer:
                "Yes, a keynote or workshop can be extended with 1-on-1 coaching or team guidance. That way the impact is not limited to the day itself.",
            },
          ],
    },

    cta: {
      title: nl ? "Boek Klaas." : "Book Klaas.",
      titleAccent: nl ? "Voor jouw event." : "For your event.",
      description: nl
        ? "Een inspirerende sessie die teams in beweging zet. Neem contact op om de mogelijkheden te bespreken."
        : "An inspiring session that sets teams in motion. Get in touch to discuss the possibilities.",
      href: "/contact",
      ctaLabel: nl ? "Neem contact op" : "Get in touch",
    },
  };
}
