import type { Lang } from "@/lib/i18n";

export function getSetContent(lang: Lang) {
  const nl = lang === "nl";

  return {
    meta: {
      title: "Sales Excellence Training",
      description: nl
        ? "Meer omzet met minder druk. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt. Voor verkopers, accountmanagers en salesteams."
        : "More revenue with less pressure. Learn how to sell structurally better with authenticity and ease. For sales professionals, account managers and teams.",
    },

    jsonLd: {
      name: "Sales Excellence Training",
      description: nl
        ? "Meer omzet met minder druk. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt."
        : "More revenue with less pressure. Learn how to sell structurally better with authenticity and ease.",
      url: "https://www.klaaskroezen.com/sales-excellence-training",
      price: "2250",
    },

    hero: {
      eyebrow: "Sales Excellence Training",
      titleLine1: nl ? "Meer omzet." : "More revenue.",
      titleLine2: nl ? "Minder stress." : "Less stress.",
      description: nl
        ? "Voor teams en professionals die weten dat er meer in zit. Geen trucjes, maar een bewezen aanpak die past bij wie je bent."
        : "For teams and professionals who know there is more potential. No tricks, but a proven approach that fits who you are.",
      image: "/images/training/visma-youserve-session.jpg",
      imageAlt: nl
        ? "Klaas Kroezen geeft de Sales Excellence Training aan een groep professionals"
        : "Klaas Kroezen delivering the Sales Excellence Training to a group of professionals",
      imagePosition: "center 25%",
      glassItems: nl
        ? [
            {
              label: "Gemiddelde beoordeling",
              text: "9.1 — op basis van honderden deelnemers uit het bedrijfsleven.",
            },
            {
              label: "25+ jaar ervaring",
              text: "Internationaal B2B bij Google, Samsung, Microsoft, ING en Vodafone. Bedrijf verkocht in 2022.",
            },
            {
              label: "Resultaatgarantie",
              text: "10% beter in sales of geld terug. Gemeten via het Customer Experience Model.",
            },
          ]
        : [
            {
              label: "Average rating",
              text: "9.1 — based on hundreds of participants from the business world.",
            },
            {
              label: "25+ years of experience",
              text: "International B2B at Google, Samsung, Microsoft, ING and Vodafone. Company sold in 2022.",
            },
            {
              label: "Results guarantee",
              text: "10% better in sales or your money back. Measured via the Customer Experience Model.",
            },
          ],
    },

    painPoints: {
      title: nl ? "Je herkent dit." : "You recognise this.",
      titleAccent: nl ? "En je wilt het anders." : "And you want it to change.",
      points: nl
        ? [
            "Sales loopt achter op target — en de druk neemt toe",
            "Klantgesprekken voelen als duwen in plaats van verbinden",
            "Bestaande klanten blijven niet, nieuwe komen moeilijk binnen",
            "Je team werkt hard, maar zonder structuur of energie",
            "Korting geven is de standaard geworden om deals te sluiten",
            "Motivatie is wisselend — de ene maand goed, de volgende niet",
          ]
        : [
            "Sales is behind on target — and the pressure keeps rising",
            "Customer conversations feel like pushing instead of connecting",
            "Existing customers leave, new ones are hard to win",
            "Your team works hard, but lacks structure or energy",
            "Discounting has become the default to close deals",
            "Motivation is inconsistent — one month good, the next not",
          ],
    },

    transformation: nl
      ? [
          {
            label: "Targets",
            before: "Sales loopt achter op target — de druk neemt toe",
            after: "Omzet groeit structureel en voorspelbaar",
          },
          {
            label: "Gesprekken",
            before: "Klantgesprekken voelen als duwen in plaats van verbinden",
            after: "Gesprekken voelen als oprechte verbinding",
          },
          {
            label: "Deals",
            before: "Korting geven is de standaard om deals te sluiten",
            after: "Klanten kiezen voor jou op basis van waarde",
          },
          {
            label: "Team",
            before: "Je team werkt hard, maar zonder structuur of energie",
            after: "Energie en trots in het team — iedereen weet wat werkt",
          },
          {
            label: "Klanten",
            before: "Bestaande klanten blijven niet, nieuwe komen moeilijk binnen",
            after: "Klanten blijven langer en bevelen je actief aan",
          },
          {
            label: "Resultaat",
            before:
              "Motivatie is wisselend — de ene maand goed, de volgende niet",
            after: "Consistente resultaten door een bewezen aanpak",
          },
        ]
      : [
          {
            label: "Targets",
            before: "Sales is behind on target — the pressure keeps rising",
            after: "Revenue grows structurally and predictably",
          },
          {
            label: "Conversations",
            before:
              "Customer conversations feel like pushing instead of connecting",
            after: "Conversations feel like genuine connection",
          },
          {
            label: "Deals",
            before: "Discounting has become the default to close deals",
            after: "Customers choose you based on value",
          },
          {
            label: "Team",
            before: "Your team works hard, but lacks structure or energy",
            after: "Energy and pride in the team — everyone knows what works",
          },
          {
            label: "Customers",
            before: "Existing customers leave, new ones are hard to win",
            after: "Customers stay longer and actively recommend you",
          },
          {
            label: "Results",
            before: "Motivation is inconsistent — one month good, the next not",
            after: "Consistent results through a proven approach",
          },
        ],

    audiences: nl
      ? [
          "Accountmanagers",
          "Salesteams",
          "Ondernemers",
          "Directeuren",
          "Junior verkopers",
          "Senior verkopers",
        ]
      : [
          "Account managers",
          "Sales teams",
          "Entrepreneurs",
          "Directors",
          "Junior sales reps",
          "Senior sales reps",
        ],

    program: {
      price: "€ 2.250",
      modules: nl
        ? [
            {
              number: "01",
              title: "Mindset & Identiteit",
              description:
                "Ontdek hoe je overtuigingen je verkoopresultaat bepalen. Werk aan de mindset die past bij duurzaam succes — zonder masker, zonder druk.",
            },
            {
              number: "02",
              title: "Oprechte Verbinding",
              description:
                "Leer hoe je vanaf het eerste moment vertrouwen opbouwt. Niet met scripts, maar door écht te luisteren en je te verdiepen in de ander.",
            },
            {
              number: "03",
              title: "De Klantvraag Achter de Vraag",
              description:
                "Klanten vertellen zelden meteen wat ze echt nodig hebben. Leer hoe je de werkelijke behoefte boven tafel krijgt — respectvol en trefzeker.",
            },
            {
              number: "04",
              title: "Ontspannen Presenteren & Pitchen",
              description:
                "Presenteer je aanbod vanuit rust en overtuiging. Geen verkooppraatjes, maar een verhaal dat resoneert en blijft hangen.",
            },
            {
              number: "05",
              title: "Bezwaren & Onderhandelen",
              description:
                "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging. Leer hoe je er ontspannen mee omgaat en betere deals sluit zonder korting te geven.",
            },
            {
              number: "06",
              title: "Klanten die Fans Worden",
              description:
                "Een deal sluiten is het begin, niet het einde. Bouw relaties die leiden tot herhaalaankopen, aanbevelingen en klanten die ambassadeur worden.",
            },
          ]
        : [
            {
              number: "01",
              title: "Mindset & Identity",
              description:
                "Discover how your beliefs determine your sales results. Build the mindset for sustainable success — without masks, without pressure.",
            },
            {
              number: "02",
              title: "Genuine Connection",
              description:
                "Learn how to build trust from the first moment. Not with scripts, but by truly listening and engaging with the other person.",
            },
            {
              number: "03",
              title: "The Question Behind the Question",
              description:
                "Customers rarely tell you what they truly need right away. Learn how to uncover the real need — respectfully and accurately.",
            },
            {
              number: "04",
              title: "Relaxed Presenting & Pitching",
              description:
                "Present your offer from a place of calm and conviction. No sales pitches, but a story that resonates and sticks.",
            },
            {
              number: "05",
              title: "Objections & Negotiation",
              description:
                "Objections are not rejection — they are an invitation. Learn how to handle them with ease and close better deals without discounting.",
            },
            {
              number: "06",
              title: "Customers Who Become Fans",
              description:
                "Closing a deal is the beginning, not the end. Build relationships that lead to repeat purchases, referrals and brand ambassadors.",
            },
          ],
    },

    reviews: nl
      ? [
          {
            text: "Direct meer resultaat. Klaas heeft ons salesteam fundamenteel veranderd — niet met trucjes maar met een aanpak die écht werkt en blijft hangen.",
            name: "Simon Kornblum",
            role: "Directeur Visma YouServe",
            avatar: "/images/reviews/simon-kornblum.jpg",
          },
          {
            text: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.",
            name: "Max de Weijer",
            role: "Ondernemer",
          },
          {
            text: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken. Een aanpak die werkt — ook als je jezelf geen verkoper vindt.",
            name: "Mark Tigchelaar",
            role: "Psycholoog · Focus AAN/UIT",
            avatar: "/images/reviews/mark-tigchelaar.jpeg",
          },
        ]
      : [
          {
            text: "Immediate results. Klaas fundamentally changed our sales team — not with tricks but with an approach that truly works and sticks.",
            name: "Simon Kornblum",
            role: "Director Visma YouServe",
            avatar: "/images/reviews/simon-kornblum.jpg",
          },
          {
            text: "Out of 10 leads, 1 to 2 became clients. Now it's 7 to 8. Not by pushing harder, but by being genuinely interested.",
            name: "Max de Weijer",
            role: "Entrepreneur",
          },
          {
            text: "Klaas shows that selling is not about tricks but about making real connections. An approach that works — even if you don't consider yourself a salesperson.",
            name: "Mark Tigchelaar",
            role: "Psychologist · Focus ON/OFF",
            avatar: "/images/reviews/mark-tigchelaar.jpeg",
          },
        ],

    pricing: {
      guarantee: nl
        ? "10% beter in sales of geld terug — gemeten via het Customer Experience Model."
        : "10% better in sales or your money back — measured via the Customer Experience Model.",
      individual: {
        tiers: nl
          ? [
              {
                label: "Zelf studeren",
                title: "Online",
                price: "€ 2.250",
                priceNote: "Excl. BTW",
                description:
                  "Flexibel en in eigen tempo. Start direct met de volledige online training.",
                features: [
                  "6 modules online training",
                  "Digitaal werkboek met opdrachten",
                  "1 jaar toegang",
                  "Inclusief bestseller boek",
                  "Certificaat na afronding",
                ],
                cta: "Direct starten",
                href: "https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training",
              },
              {
                label: "Meest gekozen",
                title: "Training + Coaching",
                price: "€ 3.750",
                priceNote: "Excl. BTW",
                description:
                  "Alles van Online plus persoonlijke begeleiding van kick-off tot afronding.",
                features: [
                  "Alles van Online",
                  "Fysiek werkboek met opdrachten",
                  "Persoonlijke kick-off sessie",
                  "Presentatie met feedback van Klaas",
                  "Actieplan op maat",
                ],
                cta: "Training kopen",
                href: "https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training",
                featured: true,
              },
            ]
          : [
              {
                label: "Self-study",
                title: "Online",
                price: "€ 2,250",
                priceNote: "Excl. VAT",
                description:
                  "Flexible and at your own pace. Start immediately with the full online training.",
                features: [
                  "6 modules online training",
                  "Digital workbook with exercises",
                  "1 year access",
                  "Includes bestselling book",
                  "Certificate upon completion",
                ],
                cta: "Start now",
                href: "https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training",
              },
              {
                label: "Most popular",
                title: "Training + Coaching",
                price: "€ 3,750",
                priceNote: "Excl. VAT",
                description:
                  "Everything from Online plus personal guidance from kick-off to completion.",
                features: [
                  "Everything from Online",
                  "Physical workbook with exercises",
                  "Personal kick-off session",
                  "Presentation with feedback from Klaas",
                  "Custom action plan",
                ],
                cta: "Buy training",
                href: "https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training",
                featured: true,
              },
            ],
      },
      team: {
        tiers: nl
          ? [
              {
                label: "Kleine teams",
                title: "Team Training",
                price: "€ 2.250",
                priceNote: "Per deelnemer · Excl. BTW · Vanaf 3 personen",
                description:
                  "Dezelfde training, maar samen met je team. Inclusief gezamenlijke kick-off en teamgerichte oefeningen.",
                features: [
                  "Alles van Training + Coaching",
                  "Fysiek werkboek per deelnemer",
                  "Gezamenlijke kick-off op locatie",
                  "Groepspresentaties met live feedback",
                  "Certificaat per deelnemer",
                ],
                cta: "Neem contact op",
                href: "/contact",
                featured: true,
              },
              {
                label: "Maatwerk",
                title: "Enterprise",
                price: "Op aanvraag",
                description:
                  "Voor grotere organisaties. Volledig op maat, inclusief team-implementatie en persoonlijke coaching.",
                features: [
                  "Alles van Team Training",
                  "Op locatie of hybride",
                  "Volledige team-implementatie",
                  "Op maat voor jouw organisatie",
                  "Persoonlijke coaching per deelnemer",
                  "Managementrapportage",
                ],
                cta: "Plan een gesprek",
                href: "/contact",
              },
            ]
          : [
              {
                label: "Small teams",
                title: "Team Training",
                price: "€ 2,250",
                priceNote: "Per participant · Excl. VAT · From 3 people",
                description:
                  "The same training, but together with your team. Including joint kick-off and team-focused exercises.",
                features: [
                  "Everything from Training + Coaching",
                  "Physical workbook per participant",
                  "Joint kick-off on location",
                  "Group presentations with live feedback",
                  "Certificate per participant",
                ],
                cta: "Get in touch",
                href: "/contact",
                featured: true,
              },
              {
                label: "Custom",
                title: "Enterprise",
                price: "On request",
                description:
                  "For larger organisations. Fully customised, including team implementation and personal coaching.",
                features: [
                  "Everything from Team Training",
                  "On location or hybrid",
                  "Full team implementation",
                  "Tailored to your organisation",
                  "Personal coaching per participant",
                  "Management reporting",
                ],
                cta: "Schedule a call",
                href: "/contact",
              },
            ],
      },
    },

    crossLink: {
      eyebrow: nl ? "Ook interessant" : "Also interesting",
      title: "Customer Success Training.",
      titleAccent: nl ? "Van klant naar fan." : "From customer to fan.",
      description: nl
        ? "Geen salesfunctie, maar wél commercieel cruciaal. Leer hoe je vanuit klantcontact bijdraagt aan groei, retentie en ambassadeurschap."
        : "Not a sales role, but commercially crucial. Learn how customer interactions drive growth, retention and advocacy.",
      image: "/images/hero/customer-success-group.jpg",
      imageAlt: nl
        ? "Deelnemers van de Customer Success Training"
        : "Participants of the Customer Success Training",
      href: "/customer-success-training",
      ctaLabel: nl ? "Bekijk training" : "View training",
    },

    faq: {
      title: nl ? "Nog vragen?" : "Questions?",
      titleAccent: nl ? "We helpen je graag." : "We're happy to help.",
      items: nl
        ? [
            {
              question: "Voor wie is deze training bedoeld?",
              answer:
                "Voor iedereen met een commerciële rol: sales professionals, accountmanagers, business developers en salesmanagers. Of je nu 2 of 20 jaar ervaring hebt — de methode past zich aan op jouw niveau.",
            },
            {
              question: "Hoe lang duurt de training?",
              answer:
                "De online training bestaat uit 6 modules die je in je eigen tempo doorloopt. Gemiddeld ben je 6 tot 8 weken bezig. Bij de variant met coaching krijg je daarnaast persoonlijke begeleiding.",
            },
            {
              question: "Wat als het niet werkt voor mij?",
              answer:
                "We bieden een 10% resultaatgarantie. Als je na het volledig doorlopen van de training niet minimaal 10% verbetering ervaart, krijg je je geld terug. Geen kleine lettertjes.",
            },
            {
              question: "Kan ik de training ook voor mijn team inkopen?",
              answer:
                "Ja, we bieden een incompany variant aan op maat. Met groepsoefeningen, teamgerichte casussen en begeleiding op de werkvloer. Neem contact op voor een voorstel.",
            },
            {
              question: "Krijg ik direct toegang na aankoop?",
              answer:
                "Ja, je ontvangt direct na betaling een e-mail met je inloggegevens. Je kunt meteen beginnen met de eerste module.",
            },
            {
              question:
                "Wat maakt deze training anders dan andere salestrainingen?",
              answer:
                "Geen scripts, geen trucjes, geen NLP. We werken vanuit oprechte verbinding en ontspanning. Het resultaat: meer omzet die ook nog eens goed voelt. Gebaseerd op 25+ jaar praktijkervaring.",
            },
          ]
        : [
            {
              question: "Who is this training for?",
              answer:
                "For anyone in a commercial role: sales professionals, account managers, business developers and sales managers. Whether you have 2 or 20 years of experience — the method adapts to your level.",
            },
            {
              question: "How long does the training take?",
              answer:
                "The online training consists of 6 modules you complete at your own pace. On average it takes 6 to 8 weeks. The coaching variant includes personal guidance alongside.",
            },
            {
              question: "What if it doesn't work for me?",
              answer:
                "We offer a 10% results guarantee. If after completing the full training you don't experience at least 10% improvement, you get your money back. No fine print.",
            },
            {
              question: "Can I purchase the training for my team?",
              answer:
                "Yes, we offer a customised in-company variant. With group exercises, team-focused cases and on-the-job guidance. Get in touch for a proposal.",
            },
            {
              question: "Do I get immediate access after purchase?",
              answer:
                "Yes, you receive an email with your login details immediately after payment. You can start with the first module right away.",
            },
            {
              question:
                "What makes this training different from other sales trainings?",
              answer:
                "No scripts, no tricks, no NLP. We work from genuine connection and ease. The result: more revenue that also feels right. Based on 25+ years of hands-on experience.",
            },
          ],
    },

    cta: {
      title: nl ? "Start vandaag." : "Start today.",
      titleAccent: nl ? "Oprecht & ontspannen." : "Genuine & relaxed.",
      description: nl
        ? "Meer omzet, minder stress. Zonder trucjes, zonder druk. Ontdek een aanpak die bij je past — en die blijft werken."
        : "More revenue, less stress. No tricks, no pressure. Discover an approach that fits you — and keeps working.",
      href: "#pricing",
    },
  };
}
