import type { Lang } from "@/lib/i18n";

export function getBoekContent(lang: Lang) {
  const nl = lang === "nl";

  return {
    meta: {
      title: nl
        ? "Boek — Sales, Oprecht en Ontspannen"
        : "Book — Sales, Honest & Relaxed",
      description: nl
        ? "Bestseller van Klaas Kroezen. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt. Beschikbaar als hardcopy, e-book en luisterboek."
        : "Bestseller by Klaas Kroezen. Learn how to sell structurally better with authenticity and ease. Available as hardcopy, e-book and audiobook.",
    },

    hero: {
      label: "Bestseller",
      imageAlt: nl
        ? "Boek: Sales, Oprecht en Ontspannen door Klaas Kroezen"
        : "Book: Sales, Honest & Relaxed by Klaas Kroezen",
      titleLine1: nl ? "Sales, Oprecht" : "Sales, Honest",
      titleAccent: nl ? "en Ontspannen." : "& Relaxed.",
      paragraphs: nl
        ? [
            "Waarom voelt sales zo vaak ongemakkelijk en geforceerd? Omdat we geconditioneerd zijn om te overtuigen in plaats van oprecht te helpen.",
            "Dit boek is een praktische gids voor iedereen die dat traditionele, pushy salesgedoe spuugzat is en verlangt naar iets wat",
          ]
        : [
            "Why does sales so often feel uncomfortable and forced? Because we've been conditioned to convince rather than genuinely help.",
            "This book is a practical guide for anyone who is fed up with that traditional, pushy sales approach and yearns for something that",
          ],
      boldText: nl ? "oprecht werkt" : "truly works",
      afterBold: nl ? ": het creëren van ware fans." : ": creating true fans.",
      badges: nl
        ? ["Bestseller", "2e druk · 2.500+", "#1 Managementboek"]
        : ["Bestseller", "2nd edition · 2,500+", "#1 Management book"],
      cta: nl ? "Direct bestellen" : "Order now",
    },

    program: {
      price: "€ 32,50",
      pricingAnchor: "#bestellen",
      ctaLabel: nl ? "Bestel het boek" : "Order the book",
      modules: nl
        ? [
            {
              number: "01",
              title: "Mindset & Overtuigingen",
              description:
                "Ontdek hoe je eigen overtuigingen je verkoopresultaat bepalen. Werk aan de mindset die past bij duurzaam succes.",
            },
            {
              number: "02",
              title: "Oprechte Verbinding",
              description:
                "Leer hoe je vanaf het eerste moment vertrouwen opbouwt. Niet met scripts, maar door écht te luisteren.",
            },
            {
              number: "03",
              title: "De Vraag Achter de Vraag",
              description:
                "Klanten vertellen zelden meteen wat ze echt nodig hebben. Leer de werkelijke behoefte boven tafel te krijgen.",
            },
            {
              number: "04",
              title: "Ontspannen Presenteren",
              description:
                "Presenteer je aanbod vanuit rust en overtuiging. Geen verkooppraatjes, maar een verhaal dat resoneert.",
            },
            {
              number: "05",
              title: "Bezwaren & Onderhandelen",
              description:
                "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging. Leer er ontspannen mee omgaan.",
            },
            {
              number: "06",
              title: "Van Klant naar Fan",
              description:
                "Een deal sluiten is het begin. Bouw relaties die leiden tot herhaalaankopen en aanbevelingen.",
            },
          ]
        : [
            {
              number: "01",
              title: "Mindset & Beliefs",
              description:
                "Discover how your own beliefs determine your sales results. Build the mindset for sustainable success.",
            },
            {
              number: "02",
              title: "Genuine Connection",
              description:
                "Learn how to build trust from the first moment. Not with scripts, but by truly listening.",
            },
            {
              number: "03",
              title: "The Question Behind the Question",
              description:
                "Customers rarely tell you what they truly need right away. Learn to uncover the real need.",
            },
            {
              number: "04",
              title: "Relaxed Presenting",
              description:
                "Present your offer from a place of calm and conviction. No sales pitches, but a story that resonates.",
            },
            {
              number: "05",
              title: "Objections & Negotiation",
              description:
                "Objections are not rejection — they are an invitation. Learn to handle them with ease.",
            },
            {
              number: "06",
              title: "From Customer to Fan",
              description:
                "Closing a deal is the beginning. Build relationships that lead to repeat purchases and referrals.",
            },
          ],
    },

    testimonials: {
      eyebrow: nl ? "Wat lezers zeggen" : "What readers say",
      title: nl ? "Bewezen resultaat." : "Proven results.",
      titleAccent: nl
        ? "Van LinkedIn tot Managementboek."
        : "From LinkedIn to Managementboek.",
      reviews: nl
        ? [
            {
              text: "Dit boek laat zien dat echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. Een must-read voor wie klanten wil veranderen in fans.",
              name: "Michael Pilarczyk",
              role: "Oprichter MasterMind Academy",
            },
            {
              text: "In dit boek spat de oprechtheid er vanaf. Sales zoals het bedoeld is: met pure intentie de verbinding maken tussen de échte klantbehoefte en wat je vertegenwoordigt.",
              name: "Simon Kornblum",
              role: "Directeur Visma YouServe",
            },
            {
              text: "Verkopen gaat niet over trucjes, maar over écht contact maken. Een manier van sales die past bij wie je bent — ook als je jezelf geen verkoper vindt.",
              name: "Mark Tigchelaar",
              role: "Psycholoog · Focus AAN/UIT",
            },
            {
              text: "Ik gun je een Klaas! Hij is al jaren de motor achter mijn succesvolle bedrijf.",
              name: "Tijn Touber",
              role: "Oprichter Lois Lane · schrijver en inspirator",
            },
            {
              text: "Dit boek gaat helemaal niet over sales. Het gaat over gedrag. In één ruk uitgelezen. En ik ben helemaal energiek om sales te gaan doen.",
              name: "Roderick Göttgens",
              role: "Oprichter Behavior Boost",
              source: "LinkedIn",
            },
            {
              text: "Sales kan ook rustig. Oprecht. En ijzersterk. Dit boek brengt het vak terug naar de basis: vertrouwen, vakmanschap en relaties die blijven.",
              name: "Hendrika Willemse-Vreugdenhil",
              role: "Speaker & auteur",
              source: "LinkedIn",
            },
            {
              text: "Topboek! Leest vlot en op zo'n manier geschreven dat je er vertrouwen in krijgt dat je dit morgen kan toepassen.",
              name: "M. de Schipper",
              role: "Lezer",
              source: "Managementboek",
            },
            {
              text: "Dit boek raakt de essentie en nodigt je uit om actief naar je eigen overtuigingen te kijken. Super praktisch toepasbaar.",
              name: "M. te Woerd",
              role: "Lezer",
              source: "Managementboek",
            },
            {
              text: "Sales gaat niet over verkopen aan iemand, maar over het helpen van iemand. Met die insteek voelt sales nu al anders.",
              name: "Y. Kruger",
              role: "Lezer",
              source: "Managementboek",
            },
            {
              text: "Echt een super goed boek. Maakt sales oprecht, menselijk en ontspannen, vol praktische tips die ik gelijk kan toepassen.",
              name: "E. Verheijen",
              role: "Lezer",
              source: "Managementboek",
            },
          ]
        : [
            {
              text: "This book shows that real sales starts with who you are. Mindset, calm and genuine intention lead to connection. A must-read for anyone who wants to turn customers into fans.",
              name: "Michael Pilarczyk",
              role: "Founder MasterMind Academy",
            },
            {
              text: "This book radiates authenticity. Sales as it was meant to be: connecting the real customer need with what you represent, with pure intention.",
              name: "Simon Kornblum",
              role: "Director Visma YouServe",
            },
            {
              text: "Selling is not about tricks, but about making real connections. A way of selling that fits who you are — even if you don't consider yourself a salesperson.",
              name: "Mark Tigchelaar",
              role: "Psychologist · Focus ON/OFF",
            },
            {
              text: "I wish you a Klaas! He has been the driving force behind my successful company for years.",
              name: "Tijn Touber",
              role: "Founder Lois Lane · writer and inspirator",
            },
            {
              text: "This book isn't about sales at all. It's about behaviour. Read it in one sitting. And I'm full of energy to start doing sales.",
              name: "Roderick Göttgens",
              role: "Founder Behavior Boost",
              source: "LinkedIn",
            },
            {
              text: "Sales can also be calm. Genuine. And rock solid. This book brings the craft back to basics: trust, mastery and lasting relationships.",
              name: "Hendrika Willemse-Vreugdenhil",
              role: "Speaker & author",
              source: "LinkedIn",
            },
            {
              text: "Great book! Reads smoothly and written in a way that gives you confidence you can apply this tomorrow.",
              name: "M. de Schipper",
              role: "Reader",
              source: "Managementboek",
            },
            {
              text: "This book touches the essence and invites you to actively look at your own beliefs. Super practically applicable.",
              name: "M. te Woerd",
              role: "Reader",
              source: "Managementboek",
            },
            {
              text: "Sales is not about selling to someone, but about helping someone. With that approach, sales already feels different.",
              name: "Y. Kruger",
              role: "Reader",
              source: "Managementboek",
            },
            {
              text: "Truly a great book. Makes sales genuine, human and relaxed, full of practical tips I can apply immediately.",
              name: "E. Verheijen",
              role: "Reader",
              source: "Managementboek",
            },
          ],
    },

    faq: {
      title: nl ? "Over het boek." : "About the book.",
      titleAccent: nl ? "Veelgestelde vragen." : "Frequently asked questions.",
      items: nl
        ? [
            {
              question: "Voor wie is dit boek geschreven?",
              answer:
                "Voor iedereen die commercieel actief is: sales professionals, ondernemers, accountmanagers en managers. Maar ook voor mensen die 'iets met klanten doen' en daar beter in willen worden — zonder zich anders voor te doen.",
            },
            {
              question: "Hoe snel wordt het boek bezorgd?",
              answer:
                "De hardcopy wordt binnen één werkdag verzonden met gratis verzending binnen Nederland. Het e-book en luisterboek zijn direct na betaling beschikbaar.",
            },
            {
              question: "Wie leest het luisterboek in?",
              answer:
                "Klaas zelf. Zo hoor je de verhalen en inzichten precies zoals ze bedoeld zijn — met de energie en overtuiging van de auteur.",
            },
            {
              question: "Kan ik het boek in bulk bestellen voor mijn team?",
              answer:
                "Ja, neem contact op voor een aantrekkelijk groepstarief. Veel bedrijven bestellen het boek als cadeau bij een training of kick-off.",
            },
            {
              question: "Is het boek ook als training beschikbaar?",
              answer:
                "Ja, de Sales Excellence Training en Customer Success Training zijn gebaseerd op dezelfde methode als het boek, maar dan als verdiepend programma met oefeningen, video's en persoonlijke begeleiding.",
            },
          ]
        : [
            {
              question: "Who is this book written for?",
              answer:
                "For anyone who is commercially active: sales professionals, entrepreneurs, account managers and managers. But also for people who 'do something with customers' and want to get better at it — without pretending to be someone else.",
            },
            {
              question: "How quickly is the book delivered?",
              answer:
                "The hardcopy is shipped within one business day with free shipping within the Netherlands. The e-book and audiobook are available immediately after payment.",
            },
            {
              question: "Who narrates the audiobook?",
              answer:
                "Klaas himself. So you hear the stories and insights exactly as they were intended — with the energy and conviction of the author.",
            },
            {
              question: "Can I order the book in bulk for my team?",
              answer:
                "Yes, get in touch for an attractive group rate. Many companies order the book as a gift with a training or kick-off.",
            },
            {
              question: "Is the book also available as a training?",
              answer:
                "Yes, the Sales Excellence Training and Customer Success Training are based on the same method as the book, but as an in-depth programme with exercises, videos and personal guidance.",
            },
          ],
    },

    videos: {
      eyebrow: nl ? "Bekijk" : "Watch",
      title: nl
        ? "Speech op de boeklancering."
        : "Speech at the book launch.",
      description: nl
        ? "Waar komt mijn drive vandaan? Waarom Sales, oprecht en ontspannen?"
        : "Where does my drive come from? Why Sales, Honest & Relaxed?",
      items: [
        {
          title: nl
            ? "Speech op de boeklancering"
            : "Speech at the book launch",
          thumbnail: "/images/spreker/video-thumb-speech.jpg",
          embedUrl: "https://www.youtube.com/embed/F6io8l_VYww",
          duration: "3:35",
        },
        {
          title: nl
            ? "Aftermovie boeklancering"
            : "Aftermovie book launch",
          thumbnail: "/images/book/boeklancering.jpeg",
          embedUrl: "https://www.youtube.com/embed/o7ajUmwEWpI",
          duration: "1:08",
        },
      ],
    },

    crossLink: {
      eyebrow: nl ? "Verder leren" : "Continue learning",
      title: "Sales Excellence Training.",
      titleAccent: nl ? "Van boek naar praktijk." : "From book to practice.",
      description: nl
        ? "Het boek gelezen? Ga verder met de training. Dezelfde filosofie, maar dan met persoonlijke begeleiding en praktijkoefeningen."
        : "Read the book? Continue with the training. The same philosophy, but with personal guidance and hands-on exercises.",
      image: "/images/hero/sales-excellence-group.jpeg",
      imageAlt: nl
        ? "Deelnemers van de Sales Excellence Training"
        : "Participants of the Sales Excellence Training",
      href: "/sales-excellence-training",
      ctaLabel: nl ? "Bekijk training" : "View training",
    },

    cta: {
      title: nl ? "Bestel het boek." : "Order the book.",
      titleAccent: nl ? "Oprecht & ontspannen." : "Genuine & relaxed.",
      description: nl
        ? "Beschikbaar als hardcopy, e-book en luisterboek. Start vandaag met een aanpak die werkt — en die bij je past."
        : "Available as hardcopy, e-book and audiobook. Start today with an approach that works — and fits who you are.",
      href: "#bestellen",
      ctaLabel: nl ? "Bekijk opties" : "View options",
    },
  };
}
