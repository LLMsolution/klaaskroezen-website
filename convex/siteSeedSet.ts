import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "sales-excellence-training";

export function seedSetContent(): PageSeed {
  const sections = [
    { id: "hero", type: "hero", active: true, sortOrder: 0 },
    { id: "pain-points", type: "pain-points", active: true, sortOrder: 1 },
    { id: "transformation", type: "transformation", active: true, sortOrder: 2 },
    { id: "audiences", type: "audiences", active: true, sortOrder: 3 },
    { id: "program", type: "program", active: true, sortOrder: 4 },
    { id: "reviews", type: "reviews", active: true, sortOrder: 5 },
    { id: "pricing", type: "pricing", active: true, sortOrder: 6 },
    { id: "cross-link", type: "cross-link", active: true, sortOrder: 7 },
    { id: "faq", type: "faq", active: true, sortOrder: 8 },
    { id: "cta", type: "cta", active: true, sortOrder: 9 },
  ];

  const content = [
    // ── Hero NL ──
    makeContent(SLUG, "hero", "hero", "nl", {
      eyebrow: "Sales Excellence Training",
      titleLine1: "Meer omzet.",
      titleLine2: "Minder stress.",
      description: "Voor teams en professionals die weten dat er meer in zit. Geen trucjes, maar een bewezen aanpak die past bij wie je bent.",
      image: "/images/training/visma-youserve-session.jpg",
      imageAlt: "Klaas Kroezen geeft de Sales Excellence Training aan een groep professionals",
      imagePosition: "center 25%",
      glassItems: [
        { label: "Gemiddelde beoordeling", text: "9.1 — op basis van honderden deelnemers uit het bedrijfsleven." },
        { label: "25+ jaar ervaring", text: "Internationaal B2B bij Google, Samsung, Microsoft, ING en Vodafone. Bedrijf verkocht in 2022." },
        { label: "Resultaatgarantie", text: "10% beter in sales of geld terug. Gemeten via het Customer Experience Model." },
      ],
    }),
    // ── Hero EN ──
    makeContent(SLUG, "hero", "hero", "en", {
      eyebrow: "Sales Excellence Training",
      titleLine1: "More revenue.",
      titleLine2: "Less stress.",
      description: "For teams and professionals who know there is more potential. No tricks, but a proven approach that fits who you are.",
      image: "/images/training/visma-youserve-session.jpg",
      imageAlt: "Klaas Kroezen delivering the Sales Excellence Training to a group of professionals",
      imagePosition: "center 25%",
      glassItems: [
        { label: "Average rating", text: "9.1 — based on hundreds of participants from the business world." },
        { label: "25+ years of experience", text: "International B2B at Google, Samsung, Microsoft, ING and Vodafone. Company sold in 2022." },
        { label: "Results guarantee", text: "10% better in sales or your money back. Measured via the Customer Experience Model." },
      ],
    }),
    // ── Pain Points ──
    makeContent(SLUG, "pain-points", "pain-points", "nl", {
      title: "Je herkent dit.",
      titleAccent: "En je wilt het anders.",
      points: [
        "Sales loopt achter op target — en de druk neemt toe",
        "Klantgesprekken voelen als duwen in plaats van verbinden",
        "Bestaande klanten blijven niet, nieuwe komen moeilijk binnen",
        "Je team werkt hard, maar zonder structuur of energie",
        "Korting geven is de standaard geworden om deals te sluiten",
        "Motivatie is wisselend — de ene maand goed, de volgende niet",
      ],
    }),
    makeContent(SLUG, "pain-points", "pain-points", "en", {
      title: "You recognise this.",
      titleAccent: "And you want it to change.",
      points: [
        "Sales is behind on target — and the pressure keeps rising",
        "Customer conversations feel like pushing instead of connecting",
        "Existing customers leave, new ones are hard to win",
        "Your team works hard, but lacks structure or energy",
        "Discounting has become the default to close deals",
        "Motivation is inconsistent — one month good, the next not",
      ],
    }),
    // ── Transformation ──
    makeContent(SLUG, "transformation", "transformation", "nl", {
      items: [
        { label: "Targets", before: "Sales loopt achter op target — de druk neemt toe", after: "Omzet groeit structureel en voorspelbaar" },
        { label: "Gesprekken", before: "Klantgesprekken voelen als duwen in plaats van verbinden", after: "Gesprekken voelen als oprechte verbinding" },
        { label: "Deals", before: "Korting geven is de standaard om deals te sluiten", after: "Klanten kiezen voor jou op basis van waarde" },
        { label: "Team", before: "Je team werkt hard, maar zonder structuur of energie", after: "Energie en trots in het team — iedereen weet wat werkt" },
        { label: "Klanten", before: "Bestaande klanten blijven niet, nieuwe komen moeilijk binnen", after: "Klanten blijven langer en bevelen je actief aan" },
        { label: "Resultaat", before: "Motivatie is wisselend — de ene maand goed, de volgende niet", after: "Consistente resultaten door een bewezen aanpak" },
      ],
    }),
    makeContent(SLUG, "transformation", "transformation", "en", {
      items: [
        { label: "Targets", before: "Sales is behind on target — the pressure keeps rising", after: "Revenue grows structurally and predictably" },
        { label: "Conversations", before: "Customer conversations feel like pushing instead of connecting", after: "Conversations feel like genuine connection" },
        { label: "Deals", before: "Discounting has become the default to close deals", after: "Customers choose you based on value" },
        { label: "Team", before: "Your team works hard, but lacks structure or energy", after: "Energy and pride in the team — everyone knows what works" },
        { label: "Customers", before: "Existing customers leave, new ones are hard to win", after: "Customers stay longer and actively recommend you" },
        { label: "Results", before: "Motivation is inconsistent — one month good, the next not", after: "Consistent results through a proven approach" },
      ],
    }),
    // ── Audiences ──
    makeContent(SLUG, "audiences", "audiences", "nl", {
      items: ["Accountmanagers", "Salesteams", "Ondernemers", "Directeuren", "Junior verkopers", "Senior verkopers"],
    }),
    makeContent(SLUG, "audiences", "audiences", "en", {
      items: ["Account managers", "Sales teams", "Entrepreneurs", "Directors", "Junior sales reps", "Senior sales reps"],
    }),
    // ── Program ──
    makeContent(SLUG, "program", "program", "nl", {
      price: "€ 2.250",
      modules: [
        { number: "01", title: "Mindset & Identiteit", description: "Ontdek hoe je overtuigingen je verkoopresultaat bepalen. Werk aan de mindset die past bij duurzaam succes — zonder masker, zonder druk." },
        { number: "02", title: "Oprechte Verbinding", description: "Leer hoe je vanaf het eerste moment vertrouwen opbouwt. Niet met scripts, maar door écht te luisteren en je te verdiepen in de ander." },
        { number: "03", title: "De Klantvraag Achter de Vraag", description: "Klanten vertellen zelden meteen wat ze echt nodig hebben. Leer hoe je de werkelijke behoefte boven tafel krijgt — respectvol en trefzeker." },
        { number: "04", title: "Ontspannen Presenteren & Pitchen", description: "Presenteer je aanbod vanuit rust en overtuiging. Geen verkooppraatjes, maar een verhaal dat resoneert en blijft hangen." },
        { number: "05", title: "Bezwaren & Onderhandelen", description: "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging. Leer hoe je er ontspannen mee omgaat en betere deals sluit zonder korting te geven." },
        { number: "06", title: "Klanten die Fans Worden", description: "Een deal sluiten is het begin, niet het einde. Bouw relaties die leiden tot herhaalaankopen, aanbevelingen en klanten die ambassadeur worden." },
      ],
    }),
    makeContent(SLUG, "program", "program", "en", {
      price: "€ 2,250",
      modules: [
        { number: "01", title: "Mindset & Identity", description: "Discover how your beliefs determine your sales results. Build the mindset for sustainable success — without masks, without pressure." },
        { number: "02", title: "Genuine Connection", description: "Learn how to build trust from the first moment. Not with scripts, but by truly listening and engaging with the other person." },
        { number: "03", title: "The Question Behind the Question", description: "Customers rarely tell you what they truly need right away. Learn how to uncover the real need — respectfully and accurately." },
        { number: "04", title: "Relaxed Presenting & Pitching", description: "Present your offer from a place of calm and conviction. No sales pitches, but a story that resonates and sticks." },
        { number: "05", title: "Objections & Negotiation", description: "Objections are not rejection — they are an invitation. Learn how to handle them with ease and close better deals without discounting." },
        { number: "06", title: "Customers Who Become Fans", description: "Closing a deal is the beginning, not the end. Build relationships that lead to repeat purchases, referrals and brand ambassadors." },
      ],
    }),
    // ── Reviews ──
    makeContent(SLUG, "reviews", "reviews", "nl", {
      items: [
        { text: "Direct meer resultaat. Klaas heeft ons salesteam fundamenteel veranderd — niet met trucjes maar met een aanpak die écht werkt en blijft hangen.", name: "Simon Kornblum", role: "Directeur Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg" },
        { text: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.", name: "Max de Weijer", role: "Ondernemer" },
        { text: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken. Een aanpak die werkt — ook als je jezelf geen verkoper vindt.", name: "Mark Tigchelaar", role: "Psycholoog · Focus AAN/UIT", avatar: "/images/reviews/mark-tigchelaar.jpeg" },
      ],
    }),
    makeContent(SLUG, "reviews", "reviews", "en", {
      items: [
        { text: "Immediate results. Klaas fundamentally changed our sales team — not with tricks but with an approach that truly works and sticks.", name: "Simon Kornblum", role: "Director Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg" },
        { text: "Out of 10 leads, 1 to 2 became clients. Now it's 7 to 8. Not by pushing harder, but by being genuinely interested.", name: "Max de Weijer", role: "Entrepreneur" },
        { text: "Klaas shows that selling is not about tricks but about making real connections. An approach that works — even if you don't consider yourself a salesperson.", name: "Mark Tigchelaar", role: "Psychologist · Focus ON/OFF", avatar: "/images/reviews/mark-tigchelaar.jpeg" },
      ],
    }),
    // ── Pricing ──
    makeContent(SLUG, "pricing", "pricing", "nl", {
      guarantee: "10% beter in sales of geld terug — gemeten via het Customer Experience Model.",
      individual: {
        tiers: [
          { label: "Zelf studeren", title: "Online", price: "€ 2.250", priceNote: "Excl. BTW", description: "Flexibel en in eigen tempo. Start direct met de volledige online training.", features: ["6 modules online training", "Digitaal werkboek met opdrachten", "1 jaar toegang", "Inclusief bestseller boek", "Certificaat na afronding"], cta: "Direct starten", href: "/checkout/set-online" },
          { label: "Meest gekozen", title: "Training + Coaching", price: "€ 3.750", priceNote: "Excl. BTW", description: "Alles van Online plus persoonlijke begeleiding van kick-off tot afronding.", features: ["Alles van Online", "Fysiek werkboek met opdrachten", "Persoonlijke kick-off sessie", "Presentatie met feedback van Klaas", "Actieplan op maat"], cta: "Training kopen", href: "/checkout/set-coaching", featured: true },
        ],
      },
      team: {
        tiers: [
          { label: "Kleine teams", title: "Team Training", price: "€ 2.250", priceNote: "Per deelnemer · Excl. BTW · Vanaf 3 personen", description: "Dezelfde training, maar samen met je team. Inclusief gezamenlijke kick-off en teamgerichte oefeningen.", features: ["Alles van Training + Coaching", "Fysiek werkboek per deelnemer", "Gezamenlijke kick-off op locatie", "Groepspresentaties met live feedback", "Certificaat per deelnemer"], cta: "Neem contact op", href: "/contact", featured: true },
          { label: "Maatwerk", title: "Enterprise", price: "Op aanvraag", description: "Voor grotere organisaties. Volledig op maat, inclusief team-implementatie en persoonlijke coaching.", features: ["Alles van Team Training", "Op locatie of hybride", "Volledige team-implementatie", "Op maat voor jouw organisatie", "Persoonlijke coaching per deelnemer", "Managementrapportage"], cta: "Plan een gesprek", href: "/contact" },
        ],
      },
    }),
    makeContent(SLUG, "pricing", "pricing", "en", {
      guarantee: "10% better in sales or your money back — measured via the Customer Experience Model.",
      individual: {
        tiers: [
          { label: "Self-study", title: "Online", price: "€ 2,250", priceNote: "Excl. VAT", description: "Flexible and at your own pace. Start immediately with the full online training.", features: ["6 modules online training", "Digital workbook with exercises", "1 year access", "Includes bestselling book", "Certificate upon completion"], cta: "Start now", href: "/checkout/set-online" },
          { label: "Most popular", title: "Training + Coaching", price: "€ 3,750", priceNote: "Excl. VAT", description: "Everything from Online plus personal guidance from kick-off to completion.", features: ["Everything from Online", "Physical workbook with exercises", "Personal kick-off session", "Presentation with feedback from Klaas", "Custom action plan"], cta: "Buy training", href: "/checkout/set-coaching", featured: true },
        ],
      },
      team: {
        tiers: [
          { label: "Small teams", title: "Team Training", price: "€ 2,250", priceNote: "Per participant · Excl. VAT · From 3 people", description: "The same training, but together with your team. Including joint kick-off and team-focused exercises.", features: ["Everything from Training + Coaching", "Physical workbook per participant", "Joint kick-off on location", "Group presentations with live feedback", "Certificate per participant"], cta: "Get in touch", href: "/contact", featured: true },
          { label: "Custom", title: "Enterprise", price: "On request", description: "For larger organisations. Fully customised, including team implementation and personal coaching.", features: ["Everything from Team Training", "On location or hybrid", "Full team implementation", "Tailored to your organisation", "Personal coaching per participant", "Management reporting"], cta: "Schedule a call", href: "/contact" },
        ],
      },
    }),
    // ── Cross-link ──
    makeContent(SLUG, "cross-link", "cross-link", "nl", {
      eyebrow: "Ook interessant",
      title: "Customer Success Training.",
      titleAccent: "Van klant naar fan.",
      description: "Geen salesfunctie, maar wél commercieel cruciaal. Leer hoe je vanuit klantcontact bijdraagt aan groei, retentie en ambassadeurschap.",
      image: "/images/hero/customer-success-group.jpg",
      imageAlt: "Deelnemers van de Customer Success Training",
      href: "/customer-success-training",
      ctaLabel: "Bekijk training",
    }),
    makeContent(SLUG, "cross-link", "cross-link", "en", {
      eyebrow: "Also interesting",
      title: "Customer Success Training.",
      titleAccent: "From customer to fan.",
      description: "Not a sales role, but commercially crucial. Learn how customer interactions drive growth, retention and advocacy.",
      image: "/images/hero/customer-success-group.jpg",
      imageAlt: "Participants of the Customer Success Training",
      href: "/customer-success-training",
      ctaLabel: "View training",
    }),
    // ── FAQ ──
    makeContent(SLUG, "faq", "faq", "nl", {
      title: "Nog vragen?",
      titleAccent: "We helpen je graag.",
      items: [
        { question: "Voor wie is deze training bedoeld?", answer: "Voor iedereen met een commerciële rol: sales professionals, accountmanagers, business developers en salesmanagers. Of je nu 2 of 20 jaar ervaring hebt — de methode past zich aan op jouw niveau." },
        { question: "Hoe lang duurt de training?", answer: "De online training bestaat uit 6 modules die je in je eigen tempo doorloopt. Gemiddeld ben je 6 tot 8 weken bezig. Bij de variant met coaching krijg je daarnaast persoonlijke begeleiding." },
        { question: "Wat als het niet werkt voor mij?", answer: "We bieden een 10% resultaatgarantie. Als je na het volledig doorlopen van de training niet minimaal 10% verbetering ervaart, krijg je je geld terug. Geen kleine lettertjes." },
        { question: "Kan ik de training ook voor mijn team inkopen?", answer: "Ja, we bieden een incompany variant aan op maat. Met groepsoefeningen, teamgerichte casussen en begeleiding op de werkvloer. Neem contact op voor een voorstel." },
        { question: "Krijg ik direct toegang na aankoop?", answer: "Ja, je ontvangt direct na betaling een e-mail met je inloggegevens. Je kunt meteen beginnen met de eerste module." },
        { question: "Wat maakt deze training anders dan andere salestrainingen?", answer: "Geen scripts, geen trucjes, geen NLP. We werken vanuit oprechte verbinding en ontspanning. Het resultaat: meer omzet die ook nog eens goed voelt. Gebaseerd op 25+ jaar praktijkervaring." },
      ],
    }),
    makeContent(SLUG, "faq", "faq", "en", {
      title: "Questions?",
      titleAccent: "We're happy to help.",
      items: [
        { question: "Who is this training for?", answer: "For anyone in a commercial role: sales professionals, account managers, business developers and sales managers. Whether you have 2 or 20 years of experience — the method adapts to your level." },
        { question: "How long does the training take?", answer: "The online training consists of 6 modules you complete at your own pace. On average it takes 6 to 8 weeks. The coaching variant includes personal guidance alongside." },
        { question: "What if it doesn't work for me?", answer: "We offer a 10% results guarantee. If after completing the full training you don't experience at least 10% improvement, you get your money back. No fine print." },
        { question: "Can I purchase the training for my team?", answer: "Yes, we offer a customised in-company variant. With group exercises, team-focused cases and on-the-job guidance. Get in touch for a proposal." },
        { question: "Do I get immediate access after purchase?", answer: "Yes, you receive an email with your login details immediately after payment. You can start with the first module right away." },
        { question: "What makes this training different from other sales trainings?", answer: "No scripts, no tricks, no NLP. We work from genuine connection and ease. The result: more revenue that also feels right. Based on 25+ years of hands-on experience." },
      ],
    }),
    // ── CTA ──
    makeContent(SLUG, "cta", "cta", "nl", {
      title: "Start vandaag.",
      titleAccent: "Oprecht & ontspannen.",
      description: "Meer omzet, minder stress. Zonder trucjes, zonder druk. Ontdek een aanpak die bij je past — en die blijft werken.",
      href: "#pricing",
    }),
    makeContent(SLUG, "cta", "cta", "en", {
      title: "Start today.",
      titleAccent: "Genuine & relaxed.",
      description: "More revenue, less stress. No tricks, no pressure. Discover an approach that fits you — and keeps working.",
      href: "#pricing",
    }),
    // ── DE content ──
    makeContent(SLUG, "hero", "hero", "de", {
      eyebrow: "Sales Excellence Training",
      titleLine1: "Mehr Umsatz.",
      titleLine2: "Weniger Stress.",
      description: "Für Teams und Fachkräfte, die wissen, dass mehr Potenzial vorhanden ist. Keine Tricks, sondern ein bewährter Ansatz, der zu Ihnen passt.",
      image: "/images/training/visma-youserve-session.jpg",
      imageAlt: "Klaas Kroezen gibt das Sales Excellence Training an eine Gruppe von Fachkräften",
      imagePosition: "center 25%",
      glassItems: [
        { label: "Durchschnittliche Bewertung", text: "9,1 — basierend auf Hunderten von Teilnehmern aus der Geschäftswelt." },
        { label: "25+ Jahre Erfahrung", text: "International B2B bei Google, Samsung, Microsoft, ING und Vodafone. Unternehmen 2022 verkauft." },
        { label: "Ergebnisgarantie", text: "10% besser im Vertrieb oder Geld zurück. Gemessen über das Customer Experience Model." },
      ],
    }),
    makeContent(SLUG, "pain-points", "pain-points", "de", {
      title: "Sie erkennen das.",
      titleAccent: "Und Sie wollen es ändern.",
      points: [
        "Der Vertrieb hinkt dem Ziel hinterher — und der Druck steigt",
        "Kundengespräche fühlen sich wie Drücken statt Verbinden an",
        "Bestandskunden bleiben nicht, neue sind schwer zu gewinnen",
        "Ihr Team arbeitet hart, aber ohne Struktur oder Energie",
        "Rabatte geben ist zum Standard geworden, um Deals abzuschließen",
        "Die Motivation ist schwankend — einen Monat gut, den nächsten nicht",
      ],
    }),
    makeContent(SLUG, "transformation", "transformation", "de", {
      items: [
        { label: "Ziele", before: "Der Vertrieb hinkt dem Ziel hinterher — der Druck steigt", after: "Der Umsatz wächst strukturell und vorhersehbar" },
        { label: "Gespräche", before: "Kundengespräche fühlen sich wie Drücken statt Verbinden an", after: "Gespräche fühlen sich wie aufrichtige Verbindung an" },
        { label: "Deals", before: "Rabatte geben ist der Standard, um Deals abzuschließen", after: "Kunden wählen Sie auf Basis des Wertes" },
        { label: "Team", before: "Ihr Team arbeitet hart, aber ohne Struktur oder Energie", after: "Energie und Stolz im Team — jeder weiß, was funktioniert" },
        { label: "Kunden", before: "Bestandskunden bleiben nicht, neue sind schwer zu gewinnen", after: "Kunden bleiben länger und empfehlen Sie aktiv weiter" },
        { label: "Ergebnis", before: "Die Motivation ist schwankend — einen Monat gut, den nächsten nicht", after: "Konsistente Ergebnisse durch einen bewährten Ansatz" },
      ],
    }),
    makeContent(SLUG, "audiences", "audiences", "de", {
      items: ["Accountmanager", "Vertriebsteams", "Unternehmer", "Direktoren", "Junior-Verkäufer", "Senior-Verkäufer"],
    }),
    makeContent(SLUG, "program", "program", "de", {
      price: "€ 2.250",
      modules: [
        { number: "01", title: "Mindset & Identität", description: "Entdecken Sie, wie Überzeugungen Ihr Verkaufsergebnis bestimmen. Arbeiten Sie an der Denkweise für nachhaltigen Erfolg — ohne Maske, ohne Druck." },
        { number: "02", title: "Aufrichtige Verbindung", description: "Lernen Sie, wie Sie vom ersten Moment an Vertrauen aufbauen. Nicht mit Skripten, sondern durch echtes Zuhören." },
        { number: "03", title: "Die Kundenfrage hinter der Frage", description: "Kunden sagen selten sofort, was sie wirklich brauchen. Lernen Sie, das echte Bedürfnis ans Licht zu bringen — respektvoll und zielsicher." },
        { number: "04", title: "Entspanntes Präsentieren & Pitchen", description: "Präsentieren Sie Ihr Angebot aus Ruhe und Überzeugung. Keine Verkaufsgespräche, sondern eine Geschichte, die resoniert und haften bleibt." },
        { number: "05", title: "Einwände & Verhandlung", description: "Einwände sind keine Ablehnung — sie sind eine Einladung. Lernen Sie, entspannt damit umzugehen und bessere Deals ohne Rabatte abzuschließen." },
        { number: "06", title: "Kunden die Fans werden", description: "Einen Deal abzuschließen ist der Anfang, nicht das Ende. Bauen Sie Beziehungen auf, die zu Wiederholungskäufen und Markenbotschaftern führen." },
      ],
    }),
    makeContent(SLUG, "reviews", "reviews", "de", {
      items: [
        { text: "Sofortige Ergebnisse. Klaas hat unser Vertriebsteam grundlegend verändert — nicht mit Tricks, sondern mit einem Ansatz, der wirklich funktioniert und haften bleibt.", name: "Simon Kornblum", role: "Direktor Visma YouServe", avatar: "/images/reviews/simon-kornblum.jpg" },
        { text: "Von 10 Leads wurden 1 bis 2 Kunden. Jetzt sind es 7 bis 8. Nicht durch stärkeren Druck, sondern durch aufrichtiges Interesse.", name: "Max de Weijer", role: "Unternehmer" },
        { text: "Klaas zeigt, dass Verkaufen nicht um Tricks geht, sondern um echte Verbindungen. Ein Ansatz, der funktioniert — auch wenn Sie sich nicht als Verkäufer sehen.", name: "Mark Tigchelaar", role: "Psychologe · Focus AN/AUS", avatar: "/images/reviews/mark-tigchelaar.jpeg" },
      ],
    }),
    makeContent(SLUG, "pricing", "pricing", "de", {
      guarantee: "10% besser im Vertrieb oder Geld zurück — gemessen über das Customer Experience Model.",
      individual: {
        tiers: [
          { label: "Selbststudium", title: "Online", price: "€ 2.250", priceNote: "Zzgl. MwSt.", description: "Flexibel und im eigenen Tempo. Starten Sie sofort mit dem vollständigen Online-Training.", features: ["6 Module Online-Training", "Digitales Arbeitsbuch mit Aufgaben", "1 Jahr Zugang", "Inklusive Bestseller-Buch", "Zertifikat nach Abschluss"], cta: "Jetzt starten", href: "/checkout/set-online" },
          { label: "Am beliebtesten", title: "Training + Coaching", price: "€ 3.750", priceNote: "Zzgl. MwSt.", description: "Alles aus Online plus persönliche Begleitung von Kick-off bis Abschluss.", features: ["Alles aus Online", "Physisches Arbeitsbuch mit Aufgaben", "Persönliche Kick-off-Sitzung", "Präsentation mit Feedback von Klaas", "Maßgeschneiderter Aktionsplan"], cta: "Training kaufen", href: "/checkout/set-coaching", featured: true },
        ],
      },
      team: {
        tiers: [
          { label: "Kleine Teams", title: "Team-Training", price: "€ 2.250", priceNote: "Pro Teilnehmer · Zzgl. MwSt. · Ab 3 Personen", description: "Dasselbe Training, aber gemeinsam mit Ihrem Team. Inklusive gemeinsamem Kick-off und teamorientierten Übungen.", features: ["Alles aus Training + Coaching", "Physisches Arbeitsbuch pro Teilnehmer", "Gemeinsamer Kick-off vor Ort", "Gruppenpräsentationen mit Live-Feedback", "Zertifikat pro Teilnehmer"], cta: "Kontakt aufnehmen", href: "/contact", featured: true },
          { label: "Maßgeschneidert", title: "Enterprise", price: "Auf Anfrage", description: "Für größere Organisationen. Vollständig maßgeschneidert, inklusive Team-Implementierung und persönlichem Coaching.", features: ["Alles aus Team-Training", "Vor Ort oder hybrid", "Vollständige Team-Implementierung", "Maßgeschneidert für Ihre Organisation", "Persönliches Coaching pro Teilnehmer", "Management-Berichterstattung"], cta: "Gespräch planen", href: "/contact" },
        ],
      },
    }),
    makeContent(SLUG, "cross-link", "cross-link", "de", {
      eyebrow: "Auch interessant",
      title: "Customer Success Training.",
      titleAccent: "Vom Kunden zum Fan.",
      description: "Keine Vertriebsrolle, aber kommerziell entscheidend. Lernen Sie, wie Kundeninteraktionen zu Wachstum, Kundenbindung und Empfehlungen führen.",
      image: "/images/hero/customer-success-group.jpg",
      imageAlt: "Teilnehmer des Customer Success Trainings",
      href: "/customer-success-training",
      ctaLabel: "Training ansehen",
    }),
    makeContent(SLUG, "faq", "faq", "de", {
      title: "Noch Fragen?",
      titleAccent: "Wir helfen gerne.",
      items: [
        { question: "Für wen ist dieses Training gedacht?", answer: "Für alle mit einer kommerziellen Rolle: Vertriebsprofis, Accountmanager, Business Developer und Vertriebsmanager. Ob Sie 2 oder 20 Jahre Erfahrung haben — die Methode passt sich Ihrem Niveau an." },
        { question: "Wie lange dauert das Training?", answer: "Das Online-Training besteht aus 6 Modulen, die Sie im eigenen Tempo durchgehen. Im Durchschnitt sind Sie 6 bis 8 Wochen beschäftigt. Die Variante mit Coaching umfasst zusätzlich persönliche Begleitung." },
        { question: "Was, wenn es für mich nicht funktioniert?", answer: "Wir bieten eine 10%-Ergebnisgarantie. Wenn Sie nach Abschluss des vollständigen Trainings keine Verbesserung von mindestens 10% erleben, erhalten Sie Ihr Geld zurück. Kein Kleingedrucktes." },
        { question: "Kann ich das Training auch für mein Team kaufen?", answer: "Ja, wir bieten eine maßgeschneiderte Inhouse-Variante an. Mit Gruppenübungen, teamorientierten Fällen und Begleitung vor Ort. Nehmen Sie Kontakt auf für ein Angebot." },
        { question: "Erhalte ich nach dem Kauf sofort Zugang?", answer: "Ja, Sie erhalten unmittelbar nach Zahlung eine E-Mail mit Ihren Login-Daten. Sie können sofort mit dem ersten Modul beginnen." },
        { question: "Was macht dieses Training anders als andere Vertriebstrainings?", answer: "Keine Skripte, keine Tricks, kein NLP. Wir arbeiten aus aufrichtiger Verbindung und Gelassenheit. Das Ergebnis: mehr Umsatz, der sich auch richtig anfühlt. Basierend auf 25+ Jahren Praxiserfahrung." },
      ],
    }),
    makeContent(SLUG, "cta", "cta", "de", {
      title: "Starten Sie heute.",
      titleAccent: "Aufrichtig & entspannt.",
      description: "Mehr Umsatz, weniger Stress. Keine Tricks, kein Druck. Entdecken Sie einen Ansatz, der zu Ihnen passt — und der weiterhin funktioniert.",
      href: "#pricing",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Sales Excellence Training", en: "Sales Excellence Training", de: "Sales Excellence Training" },
    sections,
    content,
  };
}
