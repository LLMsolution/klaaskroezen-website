import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "home";

export function seedHomeContent(): PageSeed {
  const sections = [
    { id: "hero", type: "home-hero", active: true, sortOrder: 0 },
    { id: "slideshow", type: "home-slideshow", active: true, sortOrder: 1 },
    { id: "logos", type: "home-logos", active: true, sortOrder: 2 },
    { id: "training-cards", type: "home-training-cards", active: true, sortOrder: 3 },
    { id: "stats", type: "home-stats", active: true, sortOrder: 4 },
    { id: "team-photos", type: "home-team-photos", active: true, sortOrder: 5 },
    { id: "reviews", type: "home-reviews", active: true, sortOrder: 6 },
    { id: "about-klaas", type: "home-about-klaas", active: true, sortOrder: 7 },
    { id: "book-teaser", type: "home-book-teaser", active: true, sortOrder: 8 },
    { id: "finale-cta", type: "home-finale-cta", active: true, sortOrder: 9 },
  ];

  const content = [
    // ── Hero copy (NL) ──
    makeContent(SLUG, "hero", "home-hero", "nl", {
      eyebrow: "Oprecht. Ontspannen. Winnen.",
      line1: "Meer omzet.",
      line2: "Minder stress.",
      line3: "Echte fans.",
      intro: "Of je nu actief verkoopt of dagelijks klantcontact hebt —",
      introHighlight: "oprecht en ontspannen",
      introEnd: "is de snelste weg naar resultaat.",
      forSales: "Voor verkopers",
      setSalesTitle: "Sales Excellence Training",
      forCS: "Voor klantcontact",
      cstTitle: "Customer Success Training",
      benefits: ["Direct online toegang", "10% resultaat of geld terug", "25+ jaar ervaring"],
    }),

    // ── Finale CTA (NL) ──
    makeContent(SLUG, "finale-cta", "home-finale-cta", "nl", {
      eyebrow: "Klaar om te beginnen?",
      title: "Start vandaag.",
      titleAccent: "Oprecht & Ontspannen.",
      description: "Eén methode, twee doelgroepen. Kies de training die bij jouw rol past.",
      ctaPrimary: "Sales Excellence Training",
      ctaSecondary: "Customer Success Training",
      guarantees: ["Direct online toegang", "Niet enthousiast na de kick-off? Dan betaal je niets.", "25+ jaar ervaring"],
    }),

    // ── Slideshow (NL) ──
    makeContent(SLUG, "slideshow", "home-slideshow", "nl", {
      slides: [
        { image: "/images/hero/sales-excellence-group.jpeg", alt: "Groep deelnemers tijdens de Sales Excellence Training met certificaten", objectPosition: "center 20%", quote: "Direct meer resultaat. De training heeft ons salesteam fundamenteel veranderd.", author: "Simon Kornblum", role: "Directeur Visma YouServe", detail: "30 deelnemers" },
        { image: "/images/spreker/klaas-flipchart.jpeg", alt: "Klaas Kroezen geeft training bij een flipchart", objectPosition: "center 25%", quote: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.", author: "Max de Weijer", role: "Ondernemer", detail: "" },
        { image: "/images/training/visma-youserve-session.jpg", alt: "Training sessie bij Visma YouServe", objectPosition: "center 30%", quote: "Echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding.", author: "Michael Pilarczyk", role: "Oprichter MasterMind Academy", detail: "" },
        { image: "/images/team/heigo-group.jpeg", alt: "Teamtraining bij Heigo Nederland", objectPosition: "center 25%", quote: "Trots op het team en de stappen die we binnen Heigo blijven zetten.", author: "Heigo Nederland", role: "Sales Excellence Training", detail: "" },
        { image: "/images/hero/customer-success-group.jpg", alt: "Deelnemers van de Customer Success Training", objectPosition: "center center", quote: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken.", author: "Mark Tigchelaar", role: "Psycholoog · Focus AAN/UIT", detail: "" },
      ],
    }),

    // ── Logos ──
    makeContent(SLUG, "logos", "home-logos", "nl", {
      label: "Trainingen verzorgd voor",
      items: [
        { image: "/images/logos/visma.png", alt: "Visma", width: 80, height: 26 },
        { image: "/images/logos/heigo.png", alt: "Heigo", width: 80, height: 26 },
        { image: "/images/logos/leadinfo.png", alt: "Leadinfo", width: 90, height: 26 },
        { image: "/images/logos/gp-products.png", alt: "GP Products", width: 90, height: 26 },
        { image: "/images/logos/gradient.png", alt: "Gradient", width: 80, height: 26 },
        { image: "/images/logos/vasco.png", alt: "Vasco", width: 80, height: 26 },
        { image: "/images/logos/edison.png", alt: "Edison", width: 80, height: 26 },
        { image: "/images/logos/mt-sprout.png", alt: "MT Sprout", width: 100, height: 26 },
        { image: "/images/logos/mom-in-balance.png", alt: "Mom in Balance", width: 100, height: 26 },
        { image: "/images/logos/zigt.webp", alt: "Zigt", width: 66, height: 26 },
      ],
    }),

    // ── Training Cards ──
    makeContent(SLUG, "training-cards", "home-training-cards", "nl", {
      eyebrow: "Het aanbod",
      title: "Eén methode.",
      titleAccent: "Twee doelgroepen.",
      introBold: "Dezelfde filosofie",
      introEnd: "— oprecht en ontspannen — voor twee werelden die allebei essentieel zijn voor het succes van je organisatie.",
      items: [
        {
          image: "/images/hero/sales-excellence-group.jpeg",
          imageAlt: "Deelnemers van de Sales Excellence Training met certificaten",
          label: "Voor verkopers",
          title: "Sales Excellence Training",
          who: "accountmanagers, ondernemers, salesteams",
          description: "Meer omzet met minder druk. Je leert hoe je met",
          descriptionHighlight: "oprechtheid en ontspanning",
          descriptionEnd: "structureel beter verkoopt — van eerste gesprek tot deal. Niet met trucjes, maar met een aanpak die bij jou past.",
          points: ["Meer omzet, minder weerstand", "Klanten die jou aanbevelen", "Zelfvertrouwen in elk verkoopgesprek"],
          href: "/sales-excellence-training",
          ctaLabel: "Bekijk training",
        },
        {
          image: "/images/hero/customer-success-group.jpg",
          imageAlt: "Deelnemers van de Customer Success Training",
          label: "Voor klantcontact",
          title: "Customer Success Training",
          who: "CS, support, accountteams, service",
          description: "Maak van klanten fans. Je hebt geen salesfunctie — maar jij bepaalt wél of een klant blijft, groeit en anderen aanbeveelt.",
          descriptionHighlight: "Dat is commercieel goud.",
          descriptionEnd: "Deze training leert je hoe je dat bewust en ontspannen doet.",
          points: ["Hogere klanttevredenheid en retentie", "Klanten die ambassadeurs worden", "Meer plezier in klantcontact"],
          href: "/customer-success-training",
          ctaLabel: "Bekijk training",
        },
      ],
    }),

    // ── Stats ──
    makeContent(SLUG, "stats", "home-stats", "nl", {
      items: [
        { value: "25+", label: "Jaar ervaring" },
        { value: "21", label: "Landen" },
        { value: "9,1", label: "Beoordeling" },
        { value: "#1", label: "Managementboek" },
      ],
    }),

    // ── Team Photos ──
    makeContent(SLUG, "team-photos", "home-team-photos", "nl", {
      eyebrow: "Eerder meegedaan",
      title: "Teams die al",
      titleAccent: "vooroplopen.",
      items: [
        { image: "/images/hero/sales-excellence-group.jpeg", caption: "30 sales- en marketingprofessionals getraind in Sales Excellence — Visma YouServe", featured: "true" },
        { image: "/images/team/heigo-group.jpeg", caption: "Binnendienst, buitendienst én directie samen getraind — Heigo Nederland", featured: "false" },
        { image: "/images/hero/customer-success-group.jpg", caption: "Van klantcontact naar fans — Customer Success Training", featured: "false" },
      ],
    }),

    // ── Reviews ──
    makeContent(SLUG, "reviews", "home-reviews", "nl", {
      eyebrow: "Wat deelnemers zeggen",
      title: "Resultaat dat",
      titleAccent: "voor zich spreekt.",
      items: [
        { text: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.", name: "Max de Weijer", role: "Ondernemer", avatar: "", source: "" },
        { text: "Direct meer resultaat. Klaas heeft ons salesteam fundamenteel veranderd — niet met trucjes maar met een aanpak die écht werkt en blijft hangen.", name: "Simon Kornblum", role: "Directeur Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg", source: "" },
        { text: "Echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. Een must voor wie klanten wil veranderen in fans.", name: "Michael Pilarczyk", role: "Oprichter MasterMind Academy", avatar: "/images/reviews/michael-pilarczyk.jpeg", source: "" },
        { text: "Dit boek gaat helemaal niet over sales. Het gaat over gedrag. Over hoe je oprechte verbinding maakt.", name: "Roderick Göttgens", role: "Oprichter Behavior Boost", avatar: "", source: "" },
        { text: "Sales kan ook rustig. Oprecht. En ijzersterk. Het brengt sales terug naar de basis: vertrouwen, vakmanschap en relaties die blijven.", name: "Hendrika Willemse-Vreugdenhil", role: "Expert Review Managementboek.nl", avatar: "", source: "" },
        { text: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken. Een aanpak die werkt — ook als je jezelf geen verkoper vindt.", name: "Mark Tigchelaar", role: "Psycholoog · Focus AAN/UIT", avatar: "/images/reviews/mark-tigchelaar.jpeg", source: "" },
      ],
    }),

    // ── About Klaas ──
    makeContent(SLUG, "about-klaas", "home-about-klaas", "nl", {
      image: "/images/about/klaas-kroezen-portrait.jpeg",
      imageAlt: "Portretfoto van Klaas Kroezen, sales trainer en auteur",
      label: "De trainer",
      name: "Klaas Kroezen.",
      subtitle: "Ondernemer. Trainer. Auteur.",
      bio1: "Met",
      bio1Bold: "25 jaar internationale ervaring",
      bio1End: "in sales en ondernemerschap realiseerde Klaas tientallen miljoenen euro's omzet — in 21 landen, voor klanten als Google, Microsoft, ING en Samsung.",
      bio2: "Na de verkoop van WUA richt hij zich volledig op het trainen van salesprofessionals én iedereen met klantcontact. Eén methode. Twee werelden. Eén resultaat: fans.",
      ctaPrimary: "Training kopen",
      ctaSecondary: "Meer over Klaas",
    }),

    // ── Book Teaser ──
    makeContent(SLUG, "book-teaser", "home-book-teaser", "nl", {
      image: "/images/book/sales-oprecht-ontspannen-cover.png",
      imageAlt: "Boekcover: Sales, Oprecht & Ontspannen door Klaas Kroezen",
      label: "Het boek",
      title: "Sales, Oprecht",
      titleAccent: "& Ontspannen.",
      description: "De theorie achter de training. #1 Managementboek, nu in 2e druk. Hardcopy, e-book of luisterboek.",
      badges: ["#1 Managementboek", "2e druk", "9,1 beoordeling"],
      ctaLabel: "Bekijk het boek",
    }),

    // ══════════════════════════════════════
    // EN content
    // ══════════════════════════════════════
    makeContent(SLUG, "hero", "home-hero", "en", {
      eyebrow: "Honest. Relaxed. Winning.",
      line1: "More revenue.",
      line2: "Less stress.",
      line3: "Real fans.",
      intro: "Whether you're actively selling or have daily customer contact —",
      introHighlight: "honest and relaxed",
      introEnd: "is the fastest path to results.",
      forSales: "For sales",
      setSalesTitle: "Sales Excellence Training",
      forCS: "For customer contact",
      cstTitle: "Customer Success Training",
      benefits: ["Instant online access", "10% results or money back", "25+ years of experience"],
    }),
    makeContent(SLUG, "finale-cta", "home-finale-cta", "en", {
      eyebrow: "Ready to start?",
      title: "Start today.",
      titleAccent: "Honest & Relaxed.",
      description: "One method, two audiences. Choose the training that fits your role.",
      ctaPrimary: "Sales Excellence Training",
      ctaSecondary: "Customer Success Training",
      guarantees: ["Instant online access", "Not enthusiastic after the kick-off? Then you pay nothing.", "25+ years of experience"],
    }),
    makeContent(SLUG, "slideshow", "home-slideshow", "en", {
      slides: [
        { image: "/images/hero/sales-excellence-group.jpeg", alt: "Group of participants after the Sales Excellence Training with certificates", objectPosition: "center 20%", quote: "Immediate results. The training fundamentally changed our sales team.", author: "Simon Kornblum", role: "Director Visma YouServe", detail: "30 participants" },
        { image: "/images/spreker/klaas-flipchart.jpeg", alt: "Klaas Kroezen delivering training at a flipchart", objectPosition: "center 25%", quote: "Out of 10 leads, 1 to 2 became clients. Now it's 7 to 8. Not by pushing harder, but by being genuinely interested.", author: "Max de Weijer", role: "Entrepreneur", detail: "" },
        { image: "/images/training/visma-youserve-session.jpg", alt: "Training session at Visma YouServe", objectPosition: "center 30%", quote: "Real sales starts with who you are. Mindset, calm and genuine intention lead to connection.", author: "Michael Pilarczyk", role: "Founder MasterMind Academy", detail: "" },
        { image: "/images/team/heigo-group.jpeg", alt: "Team training at Heigo Netherlands", objectPosition: "center 25%", quote: "Proud of the team and the steps we keep taking within Heigo.", author: "Heigo Netherlands", role: "Sales Excellence Training", detail: "" },
        { image: "/images/hero/customer-success-group.jpg", alt: "Participants of the Customer Success Training", objectPosition: "center center", quote: "Klaas shows that selling is not about tricks but about making real connections.", author: "Mark Tigchelaar", role: "Psychologist · Focus ON/OFF", detail: "" },
      ],
    }),
    makeContent(SLUG, "logos", "home-logos", "en", {
      label: "Trainings delivered for",
      items: [
        { image: "/images/logos/visma.png", alt: "Visma", width: 80, height: 26 },
        { image: "/images/logos/heigo.png", alt: "Heigo", width: 80, height: 26 },
        { image: "/images/logos/leadinfo.png", alt: "Leadinfo", width: 90, height: 26 },
        { image: "/images/logos/gp-products.png", alt: "GP Products", width: 90, height: 26 },
        { image: "/images/logos/gradient.png", alt: "Gradient", width: 80, height: 26 },
        { image: "/images/logos/vasco.png", alt: "Vasco", width: 80, height: 26 },
        { image: "/images/logos/edison.png", alt: "Edison", width: 80, height: 26 },
        { image: "/images/logos/mt-sprout.png", alt: "MT Sprout", width: 100, height: 26 },
        { image: "/images/logos/mom-in-balance.png", alt: "Mom in Balance", width: 100, height: 26 },
        { image: "/images/logos/zigt.webp", alt: "Zigt", width: 66, height: 26 },
      ],
    }),
    makeContent(SLUG, "training-cards", "home-training-cards", "en", {
      eyebrow: "The offering",
      title: "One method.",
      titleAccent: "Two audiences.",
      introBold: "The same philosophy",
      introEnd: "— honest and relaxed — for two worlds that are both essential for your organisation's success.",
      items: [
        {
          image: "/images/hero/sales-excellence-group.jpeg",
          imageAlt: "Participants of the Sales Excellence Training with certificates",
          label: "For sales",
          title: "Sales Excellence Training",
          who: "account managers, entrepreneurs, sales teams",
          description: "More revenue with less pressure. Learn how to sell structurally better with",
          descriptionHighlight: "honesty and ease",
          descriptionEnd: "— from first meeting to deal. Not with tricks, but with an approach that fits who you are.",
          points: ["More revenue, less resistance", "Customers who recommend you", "Confidence in every sales conversation"],
          href: "/sales-excellence-training",
          ctaLabel: "View training",
        },
        {
          image: "/images/hero/customer-success-group.jpg",
          imageAlt: "Participants of the Customer Success Training",
          label: "For customer contact",
          title: "Customer Success Training",
          who: "CS, support, account teams, service",
          description: "Turn customers into fans. You're not in sales — but you do determine whether a customer stays, grows and recommends others.",
          descriptionHighlight: "That's commercial gold.",
          descriptionEnd: "This training teaches you how to do that consciously and with ease.",
          points: ["Higher customer satisfaction and retention", "Customers who become ambassadors", "More joy in customer contact"],
          href: "/customer-success-training",
          ctaLabel: "View training",
        },
      ],
    }),
    makeContent(SLUG, "stats", "home-stats", "en", {
      items: [
        { value: "25+", label: "Years experience" },
        { value: "21", label: "Countries" },
        { value: "9.1", label: "Rating" },
        { value: "#1", label: "Management book" },
      ],
    }),
    makeContent(SLUG, "team-photos", "home-team-photos", "en", {
      eyebrow: "Previously joined",
      title: "Teams already",
      titleAccent: "leading the way.",
      items: [
        { image: "/images/hero/sales-excellence-group.jpeg", caption: "30 sales and marketing professionals trained in Sales Excellence — Visma YouServe", featured: "true" },
        { image: "/images/team/heigo-group.jpeg", caption: "Inside sales, field sales and management trained together — Heigo Netherlands", featured: "false" },
        { image: "/images/hero/customer-success-group.jpg", caption: "From customer contact to fans — Customer Success Training", featured: "false" },
      ],
    }),
    makeContent(SLUG, "reviews", "home-reviews", "en", {
      eyebrow: "What participants say",
      title: "Results that",
      titleAccent: "speak for themselves.",
      items: [
        { text: "Out of 10 leads, 1 to 2 became clients. Now it's 7 to 8. Not by pushing harder, but by being genuinely interested.", name: "Max de Weijer", role: "Entrepreneur", avatar: "", source: "" },
        { text: "Immediate results. Klaas fundamentally changed our sales team — not with tricks but with an approach that truly works and sticks.", name: "Simon Kornblum", role: "Director Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg", source: "" },
        { text: "Real sales starts with who you are. Mindset, calm and genuine intention lead to connection. A must for anyone who wants to turn customers into fans.", name: "Michael Pilarczyk", role: "Founder MasterMind Academy", avatar: "/images/reviews/michael-pilarczyk.jpeg", source: "" },
        { text: "This book isn't about sales at all. It's about behaviour. About how you create genuine connection.", name: "Roderick Göttgens", role: "Founder Behavior Boost", avatar: "", source: "" },
        { text: "Sales can also be calm. Genuine. And rock solid. It brings sales back to basics: trust, craftsmanship and lasting relationships.", name: "Hendrika Willemse-Vreugdenhil", role: "Expert Review Managementboek.nl", avatar: "", source: "" },
        { text: "Klaas shows that selling is not about tricks but about making real connections. An approach that works — even if you don't consider yourself a salesperson.", name: "Mark Tigchelaar", role: "Psychologist · Focus ON/OFF", avatar: "/images/reviews/mark-tigchelaar.jpeg", source: "" },
      ],
    }),
    makeContent(SLUG, "about-klaas", "home-about-klaas", "en", {
      image: "/images/about/klaas-kroezen-portrait.jpeg",
      imageAlt: "Portrait of Klaas Kroezen, sales trainer and author",
      label: "The trainer",
      name: "Klaas Kroezen.",
      subtitle: "Entrepreneur. Trainer. Author.",
      bio1: "With",
      bio1Bold: "25 years of international experience",
      bio1End: "in sales and entrepreneurship, Klaas generated tens of millions in revenue — across 21 countries, for clients like Google, Microsoft, ING and Samsung.",
      bio2: "After selling WUA, he focuses fully on training sales professionals and everyone with customer contact. One method. Two worlds. One result: fans.",
      ctaPrimary: "Buy training",
      ctaSecondary: "More about Klaas",
    }),
    makeContent(SLUG, "book-teaser", "home-book-teaser", "en", {
      image: "/images/book/sales-oprecht-ontspannen-cover.png",
      imageAlt: "Book cover: Sales, Honest & Relaxed by Klaas Kroezen",
      label: "The book",
      title: "Sales, Honest",
      titleAccent: "& Relaxed.",
      description: "The theory behind the training. #1 Management book, now in 2nd edition. Hardcopy, e-book or audiobook.",
      badges: ["#1 Management book", "2nd edition", "9.1 rating"],
      ctaLabel: "View the book",
    }),

    // ══════════════════════════════════════
    // DE content
    // ══════════════════════════════════════
    makeContent(SLUG, "hero", "home-hero", "de", {
      eyebrow: "Aufrichtig. Entspannt. Gewinnen.",
      line1: "Mehr Umsatz.",
      line2: "Weniger Stress.",
      line3: "Echte Fans.",
      intro: "Ob Sie aktiv verkaufen oder täglich Kundenkontakt haben —",
      introHighlight: "aufrichtig und entspannt",
      introEnd: "ist der schnellste Weg zum Ergebnis.",
      forSales: "Für Verkäufer",
      setSalesTitle: "Sales Excellence Training",
      forCS: "Für Kundenkontakt",
      cstTitle: "Customer Success Training",
      benefits: ["Sofortiger Online-Zugang", "10% Ergebnis oder Geld zurück", "25+ Jahre Erfahrung"],
    }),
    makeContent(SLUG, "finale-cta", "home-finale-cta", "de", {
      eyebrow: "Bereit anzufangen?",
      title: "Starten Sie heute.",
      titleAccent: "Aufrichtig & Entspannt.",
      description: "Eine Methode, zwei Zielgruppen. Wählen Sie das Training, das zu Ihrer Rolle passt.",
      ctaPrimary: "Sales Excellence Training",
      ctaSecondary: "Customer Success Training",
      guarantees: ["Sofortiger Online-Zugang", "Nicht begeistert nach dem Kick-off? Dann zahlen Sie nichts.", "25+ Jahre Erfahrung"],
    }),
    makeContent(SLUG, "slideshow", "home-slideshow", "de", {
      slides: [
        { image: "/images/hero/sales-excellence-group.jpeg", alt: "Gruppe von Teilnehmern nach dem Sales Excellence Training mit Zertifikaten", objectPosition: "center 20%", quote: "Sofortige Ergebnisse. Das Training hat unser Vertriebsteam grundlegend verändert.", author: "Simon Kornblum", role: "Direktor Visma YouServe", detail: "30 Teilnehmer" },
        { image: "/images/spreker/klaas-flipchart.jpeg", alt: "Klaas Kroezen bei einem Training am Flipchart", objectPosition: "center 25%", quote: "Von 10 Leads wurden 1 bis 2 Kunden. Jetzt sind es 7 bis 8. Nicht durch stärkeren Druck, sondern durch aufrichtiges Interesse.", author: "Max de Weijer", role: "Unternehmer", detail: "" },
        { image: "/images/training/visma-youserve-session.jpg", alt: "Trainingssitzung bei Visma YouServe", objectPosition: "center 30%", quote: "Echter Vertrieb beginnt bei dem, wer Sie sind. Denkweise, Ruhe und aufrichtige Absicht führen zur Verbindung.", author: "Michael Pilarczyk", role: "Gründer MasterMind Academy", detail: "" },
        { image: "/images/team/heigo-group.jpeg", alt: "Teamtraining bei Heigo Niederlande", objectPosition: "center 25%", quote: "Stolz auf das Team und die Schritte, die wir bei Heigo weiterhin machen.", author: "Heigo Niederlande", role: "Sales Excellence Training", detail: "" },
        { image: "/images/hero/customer-success-group.jpg", alt: "Teilnehmer des Customer Success Trainings", objectPosition: "center center", quote: "Klaas zeigt, dass Verkaufen nicht um Tricks geht, sondern um echte Verbindungen.", author: "Mark Tigchelaar", role: "Psychologe · Focus AN/AUS", detail: "" },
      ],
    }),
    makeContent(SLUG, "logos", "home-logos", "de", {
      label: "Trainings durchgeführt für",
      items: [
        { image: "/images/logos/visma.png", alt: "Visma", width: 80, height: 26 },
        { image: "/images/logos/heigo.png", alt: "Heigo", width: 80, height: 26 },
        { image: "/images/logos/leadinfo.png", alt: "Leadinfo", width: 90, height: 26 },
        { image: "/images/logos/gp-products.png", alt: "GP Products", width: 90, height: 26 },
        { image: "/images/logos/gradient.png", alt: "Gradient", width: 80, height: 26 },
        { image: "/images/logos/vasco.png", alt: "Vasco", width: 80, height: 26 },
        { image: "/images/logos/edison.png", alt: "Edison", width: 80, height: 26 },
        { image: "/images/logos/mt-sprout.png", alt: "MT Sprout", width: 100, height: 26 },
        { image: "/images/logos/mom-in-balance.png", alt: "Mom in Balance", width: 100, height: 26 },
        { image: "/images/logos/zigt.webp", alt: "Zigt", width: 66, height: 26 },
      ],
    }),
    makeContent(SLUG, "training-cards", "home-training-cards", "de", {
      eyebrow: "Das Angebot",
      title: "Eine Methode.",
      titleAccent: "Zwei Zielgruppen.",
      introBold: "Dieselbe Philosophie",
      introEnd: "— aufrichtig und entspannt — für zwei Welten, die beide für den Erfolg Ihrer Organisation essentiell sind.",
      items: [
        {
          image: "/images/hero/sales-excellence-group.jpeg",
          imageAlt: "Teilnehmer des Sales Excellence Trainings mit Zertifikaten",
          label: "Für Verkäufer",
          title: "Sales Excellence Training",
          who: "Accountmanager, Unternehmer, Vertriebsteams",
          description: "Mehr Umsatz mit weniger Druck. Lernen Sie, mit",
          descriptionHighlight: "Aufrichtigkeit und Gelassenheit",
          descriptionEnd: "strukturell besser zu verkaufen — vom ersten Gespräch bis zum Abschluss. Nicht mit Tricks, sondern mit einem Ansatz, der zu Ihnen passt.",
          points: ["Mehr Umsatz, weniger Widerstand", "Kunden die Sie weiterempfehlen", "Selbstvertrauen in jedem Verkaufsgespräch"],
          href: "/sales-excellence-training",
          ctaLabel: "Training ansehen",
        },
        {
          image: "/images/hero/customer-success-group.jpg",
          imageAlt: "Teilnehmer des Customer Success Trainings",
          label: "Für Kundenkontakt",
          title: "Customer Success Training",
          who: "CS, Support, Accountteams, Service",
          description: "Verwandeln Sie Kunden in Fans. Sie haben keine Vertriebsrolle — aber Sie bestimmen, ob ein Kunde bleibt, wächst und andere empfiehlt.",
          descriptionHighlight: "Das ist kommerzielles Gold.",
          descriptionEnd: "Dieses Training lehrt Sie, wie Sie das bewusst und entspannt tun.",
          points: ["Höhere Kundenzufriedenheit und Bindung", "Kunden die Botschafter werden", "Mehr Freude am Kundenkontakt"],
          href: "/customer-success-training",
          ctaLabel: "Training ansehen",
        },
      ],
    }),
    makeContent(SLUG, "stats", "home-stats", "de", {
      items: [
        { value: "25+", label: "Jahre Erfahrung" },
        { value: "21", label: "Länder" },
        { value: "9,1", label: "Bewertung" },
        { value: "#1", label: "Managementbuch" },
      ],
    }),
    makeContent(SLUG, "team-photos", "home-team-photos", "de", {
      eyebrow: "Bereits dabei",
      title: "Teams die bereits",
      titleAccent: "vorangehen.",
      items: [
        { image: "/images/hero/sales-excellence-group.jpeg", caption: "30 Vertriebs- und Marketingprofis im Sales Excellence geschult — Visma YouServe", featured: "true" },
        { image: "/images/team/heigo-group.jpeg", caption: "Innendienst, Außendienst und Management gemeinsam geschult — Heigo Niederlande", featured: "false" },
        { image: "/images/hero/customer-success-group.jpg", caption: "Vom Kundenkontakt zum Fan — Customer Success Training", featured: "false" },
      ],
    }),
    makeContent(SLUG, "reviews", "home-reviews", "de", {
      eyebrow: "Was Teilnehmer sagen",
      title: "Ergebnisse die",
      titleAccent: "für sich sprechen.",
      items: [
        { text: "Von 10 Leads wurden 1 bis 2 Kunden. Jetzt sind es 7 bis 8. Nicht durch stärkeren Druck, sondern durch aufrichtiges Interesse.", name: "Max de Weijer", role: "Unternehmer", avatar: "", source: "" },
        { text: "Sofortige Ergebnisse. Klaas hat unser Vertriebsteam grundlegend verändert — nicht mit Tricks, sondern mit einem Ansatz, der wirklich funktioniert und haften bleibt.", name: "Simon Kornblum", role: "Direktor Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg", source: "" },
        { text: "Echter Vertrieb beginnt bei dem, wer Sie sind. Denkweise, Ruhe und aufrichtige Absicht führen zur Verbindung. Ein Muss für alle, die Kunden in Fans verwandeln wollen.", name: "Michael Pilarczyk", role: "Gründer MasterMind Academy", avatar: "/images/reviews/michael-pilarczyk.jpeg", source: "" },
        { text: "Dieses Buch handelt überhaupt nicht von Vertrieb. Es handelt von Verhalten. Davon, wie Sie aufrichtige Verbindung herstellen.", name: "Roderick Göttgens", role: "Gründer Behavior Boost", avatar: "", source: "" },
        { text: "Vertrieb kann auch ruhig sein. Aufrichtig. Und grundsolide. Es bringt den Vertrieb zurück zu den Grundlagen: Vertrauen, Handwerk und dauerhafte Beziehungen.", name: "Hendrika Willemse-Vreugdenhil", role: "Expert Review Managementboek.nl", avatar: "", source: "" },
        { text: "Klaas zeigt, dass Verkaufen nicht um Tricks geht, sondern um echte Verbindungen. Ein Ansatz, der funktioniert — auch wenn Sie sich nicht als Verkäufer sehen.", name: "Mark Tigchelaar", role: "Psychologe · Focus AN/AUS", avatar: "/images/reviews/mark-tigchelaar.jpeg", source: "" },
      ],
    }),
    makeContent(SLUG, "about-klaas", "home-about-klaas", "de", {
      image: "/images/about/klaas-kroezen-portrait.jpeg",
      imageAlt: "Porträt von Klaas Kroezen, Vertriebstrainer und Autor",
      label: "Der Trainer",
      name: "Klaas Kroezen.",
      subtitle: "Unternehmer. Trainer. Autor.",
      bio1: "Mit",
      bio1Bold: "25 Jahren internationaler Erfahrung",
      bio1End: "in Vertrieb und Unternehmertum erzielte Klaas zig Millionen Umsatz — in 21 Ländern, für Kunden wie Google, Microsoft, ING und Samsung.",
      bio2: "Nach dem Verkauf von WUA konzentriert er sich vollständig darauf, Vertriebsprofis und alle mit Kundenkontakt zu schulen. Eine Methode. Zwei Welten. Ein Ergebnis: Fans.",
      ctaPrimary: "Training kaufen",
      ctaSecondary: "Mehr über Klaas",
    }),
    makeContent(SLUG, "book-teaser", "home-book-teaser", "de", {
      image: "/images/book/sales-oprecht-ontspannen-cover.png",
      imageAlt: "Buchcover: Sales, Aufrichtig & Entspannt von Klaas Kroezen",
      label: "Das Buch",
      title: "Sales, Aufrichtig",
      titleAccent: "& Entspannt.",
      description: "Die Theorie hinter dem Training. #1 Managementbuch, jetzt in 2. Auflage. Hardcopy, E-Book oder Hörbuch.",
      badges: ["#1 Managementbuch", "2. Auflage", "9,1 Bewertung"],
      ctaLabel: "Buch ansehen",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Home", en: "Home", de: "Home" },
    sections,
    content,
  };
}
