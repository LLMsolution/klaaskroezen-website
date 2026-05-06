import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "spreker";

export function seedSprekerContent(): PageSeed {
  const sections = [
    { id: "page-meta", type: "page-meta", active: true, sortOrder: -1 },
    { id: "hero", type: "hero", active: true, sortOrder: 0 },
    { id: "audiences", type: "audiences", active: true, sortOrder: 1 },
    { id: "content-block", type: "content-block", active: true, sortOrder: 2 },
    { id: "benefits-grid", type: "benefits-grid", active: true, sortOrder: 3 },
    { id: "videos", type: "videos", active: true, sortOrder: 4 },
    { id: "logo-bar", type: "logo-bar", active: true, sortOrder: 5 },
    { id: "coaching", type: "coaching", active: true, sortOrder: 6 },
    { id: "faq", type: "faq", active: true, sortOrder: 7 },
    { id: "cta", type: "cta", active: true, sortOrder: 8 },
  ];

  const content = [
    // ── SEO metadata ──
    makeContent(SLUG, "page-meta", "page-meta", "nl", {
      title: "Spreker — Klaas Kroezen",
      description: "Boek Klaas Kroezen als spreker. Inspirerende keynotes en workshops over sales, klantgerichtheid en commerciële groei — oprecht en ontspannen.",
    }),
    makeContent(SLUG, "page-meta", "page-meta", "en", {
      title: "Speaker — Klaas Kroezen",
      description: "Book Klaas Kroezen as a speaker. Inspiring keynotes and workshops on sales, customer focus and commercial growth — genuine and relaxed.",
    }),
    makeContent(SLUG, "page-meta", "page-meta", "de", {
      title: "Redner — Klaas Kroezen",
      description: "Buchen Sie Klaas Kroezen als Redner. Inspirierende Keynotes und Workshops zu Vertrieb, Kundenorientierung und kommerziellem Wachstum — aufrichtig und entspannt.",
    }),

    // ── Hero ──
    makeContent(SLUG, "hero", "hero", "nl", {
      eyebrow: "Spreker & Keynote",
      titleLine1: "Inspireer",
      titleLine2: "je team.",
      description: "Een inspiratiesessie waarin ik teams laat ervaren hoe je met minder spanning meer klanten verandert in fans. Geen theorie, maar energie en inzichten die blijven hangen.",
      image: "/images/spreker/klaas-hero.jpeg",
      imageAlt: "Klaas Kroezen als spreker op het podium",
      imagePosition: "center 25%",
      glassItems: [
        { label: "Keynotes & workshops", text: "Van 30 minuten inspiratie tot een volledige dagvullende workshop. Op maat voor jouw event of teamdag." },
        { label: "25+ jaar ervaring", text: "Internationaal B2B bij Google, Samsung, Microsoft, ING en Vodafone. Eigen bedrijf verkocht in 2022." },
        { label: "Bewezen impact", text: "Teams gaan naar huis met energie, inzichten en een concrete aanpak die ze direct kunnen toepassen." },
      ],
    }),
    makeContent(SLUG, "hero", "hero", "en", {
      eyebrow: "Speaker & Keynote",
      titleLine1: "Inspire",
      titleLine2: "your team.",
      description: "An inspiration session where I show teams how to turn more customers into fans with less tension. Not theory, but energy and insights that stick.",
      image: "/images/spreker/klaas-hero.jpeg",
      imageAlt: "Klaas Kroezen as a speaker on stage",
      imagePosition: "center 25%",
      glassItems: [
        { label: "Keynotes & workshops", text: "From 30 minutes of inspiration to a full-day workshop. Tailored to your event or team day." },
        { label: "25+ years of experience", text: "International B2B at Google, Samsung, Microsoft, ING and Vodafone. Company sold in 2022." },
        { label: "Proven impact", text: "Teams go home with energy, insights and a concrete approach they can apply immediately." },
      ],
    }),
    // ── Audiences ──
    makeContent(SLUG, "audiences", "audiences", "nl", {
      items: ["Salesteams", "Kick-offs", "Teamdagen", "Conferenties", "Management events", "Klantevents"],
    }),
    makeContent(SLUG, "audiences", "audiences", "en", {
      items: ["Sales teams", "Kick-offs", "Team days", "Conferences", "Management events", "Client events"],
    }),
    // ── Content Block ──
    makeContent(SLUG, "content-block", "content-block", "nl", {
      eyebrow: "Over de sessie",
      title: "Sales gaat vaak mis door prestatiedruk.",
      titleAccent: "Het kan ook anders.",
      imageAlt: "Klaas Kroezen geeft een workshop bij een flipchart",
      paragraphs: [
        "Door targets, cijfers en verwachtingen wordt verkoop krampachtig. Mensen raken gespannen, twijfelen, verliezen zichzelf — en het resultaat gaat juist omlaag. Dat kost energie, frustraties, vertrouwen én geld.",
        "Met 25 jaar ervaring in sales en klantbeleving, van scale-up tot boardroom, help ik teams groeien vanuit oprechte verbinding. Niet vanuit trucjes.",
        "Ik stond zelf jarenlang aan de frontlinie als CEO en eigenaar van een internationaal marktonderzoeksbureau. Ik weet hoe het voelt als sales voelt als trekken aan een dood paard. En ik weet hoe het wél werkt.",
      ],
    }),
    makeContent(SLUG, "content-block", "content-block", "en", {
      eyebrow: "About the session",
      title: "Sales often fails due to performance pressure.",
      titleAccent: "There is another way.",
      imageAlt: "Klaas Kroezen leading a workshop at a flipchart",
      paragraphs: [
        "Due to targets, numbers and expectations, selling becomes forced. People get tense, doubt themselves, lose their authenticity — and results actually go down. That costs energy, frustration, trust and money.",
        "With 25 years of experience in sales and customer experience, from scale-up to boardroom, I help teams grow through genuine connection. Not through tricks.",
        "I stood on the front lines for years as CEO and owner of an international market research agency. I know what it feels like when sales feels like a dead end. And I know what actually works.",
      ],
    }),
    // ── Benefits Grid ──
    makeContent(SLUG, "benefits-grid", "benefits-grid", "nl", {
      items: [
        { icon: "✓", text: "Energie en inspiratie die je meeneemt in je werk" },
        { icon: "✓", text: "Heldere inzichten voor duurzame commerciële groei" },
        { icon: "✓", text: "Verhalen en oefeningen die mensen in beweging zetten" },
        { icon: "✓", text: "Geen trucs. Geen scripts. Oprecht en ontspannen sales." },
      ],
    }),
    makeContent(SLUG, "benefits-grid", "benefits-grid", "en", {
      items: [
        { icon: "✓", text: "Energy and inspiration you take with you into your work" },
        { icon: "✓", text: "Clear insights for sustainable commercial growth" },
        { icon: "✓", text: "Stories and exercises that set people in motion" },
        { icon: "✓", text: "No tricks. No scripts. Genuine and relaxed sales." },
      ],
    }),
    // ── Videos ──
    makeContent(SLUG, "videos", "videos", "nl", {
      eyebrow: "Op het podium",
      title: "Bekijk fragmenten.",
      titleAccent: "Oprecht en ontspannen in actie.",
      items: [
        { title: "Speech op de boekpresentatie", thumbnail: "/images/spreker/video-thumb-speech.jpg", embedUrl: "https://www.youtube.com/embed/F6io8l_VYww", duration: "3:35" },
        { title: "Sales- en klantgerichte mindset in je team", thumbnail: "/images/spreker/video-thumb-mindset.jpg", embedUrl: "https://www.youtube.com/embed/placeholder-mindset", duration: "1:46" },
      ],
    }),
    makeContent(SLUG, "videos", "videos", "en", {
      eyebrow: "On stage",
      title: "Watch clips.",
      titleAccent: "Genuine and relaxed in action.",
      items: [
        { title: "Speech at the book launch", thumbnail: "/images/spreker/video-thumb-speech.jpg", embedUrl: "https://www.youtube.com/embed/F6io8l_VYww", duration: "3:35" },
        { title: "Sales and customer-focused mindset in your team", thumbnail: "/images/spreker/video-thumb-mindset.jpg", embedUrl: "https://www.youtube.com/embed/placeholder-mindset", duration: "1:46" },
      ],
    }),
    // ── Logo Bar ──
    makeContent(SLUG, "logo-bar", "logo-bar", "nl", { label: "Gewerkt met onder andere" }),
    makeContent(SLUG, "logo-bar", "logo-bar", "en", { label: "Worked with" }),
    // ── Coaching ──
    makeContent(SLUG, "coaching", "coaching", "nl", {
      sectionEyebrow: "Coaching & Begeleiding",
      sectionTitle1: "Persoonlijk of",
      sectionTitle2: "als team.",
      individual: {
        label: "Individueel",
        title: "1-op-1 Coaching",
        description: "Persoonlijke begeleiding voor sales professionals en leidinggevenden die willen groeien. Op jouw tempo, afgestemd op jouw uitdagingen.",
        features: ["Individueel traject op maat", "Persoonlijke sparring & feedback", "Focus op jouw specifieke uitdagingen", "Flexibel in te plannen"],
        price: "Op aanvraag",
        cta: "Neem contact op →",
      },
      team: {
        label: "Teams",
        title: "Coaching voor Teams",
        description: "Begeleid je team naar een gezamenlijke commerciële mindset. Van bewustwording tot implementatie — samen groeien in klantgerichtheid.",
        features: ["Gezamenlijke kick-off op locatie", "Teamgerichte oefeningen & casussen", "Begeleiding tijdens implementatie", "Meetbare resultaten per deelnemer"],
        price: "Op aanvraag",
        cta: "Plan een gesprek →",
      },
    }),
    makeContent(SLUG, "coaching", "coaching", "en", {
      sectionEyebrow: "Coaching & Guidance",
      sectionTitle1: "Personal or",
      sectionTitle2: "as a team.",
      individual: {
        label: "Individual",
        title: "1-on-1 Coaching",
        description: "Personal guidance for sales professionals and leaders who want to grow. At your pace, tailored to your challenges.",
        features: ["Customised individual programme", "Personal sparring & feedback", "Focus on your specific challenges", "Flexible scheduling"],
        price: "On request",
        cta: "Get in touch →",
      },
      team: {
        label: "Teams",
        title: "Team Coaching",
        description: "Guide your team towards a shared commercial mindset. From awareness to implementation — growing together in customer focus.",
        features: ["Joint kick-off on location", "Team-focused exercises & cases", "Guidance during implementation", "Measurable results per participant"],
        price: "On request",
        cta: "Schedule a call →",
      },
    }),
    // ── FAQ ──
    makeContent(SLUG, "faq", "faq", "nl", {
      title: "Praktische info.",
      titleAccent: "Voor organisatoren.",
      items: [
        { question: "Hoe lang duurt een keynote of workshop?", answer: "Een keynote duurt 30 tot 60 minuten. Een workshop kan een halve of hele dag beslaan. Alles is op maat samen te stellen, afhankelijk van je programma en doelstelling." },
        { question: "Waar geeft Klaas zijn sessies?", answer: "Overal in Nederland en België, op jullie locatie. Internationaal is ook mogelijk — Klaas heeft ervaring in 21 landen en geeft sessies in het Nederlands en Engels." },
        { question: "Wat kost een keynote of workshop?", answer: "De investering hangt af van de duur, locatie en het aantal deelnemers. Neem contact op voor een vrijblijvend voorstel op maat." },
        { question: "Voor welk publiek is Klaas geschikt?", answer: "Salesteams, management, klantenservice, kick-offs, conferenties en klantevents. Van 10 tot 500 deelnemers. De boodschap is altijd: oprecht en ontspannen commercieel groeien." },
        { question: "Kan de sessie gecombineerd worden met coaching?", answer: "Ja, een keynote of workshop kan uitgebreid worden met 1-op-1 coaching of teambegeleiding. Zo blijft de impact niet beperkt tot de dag zelf." },
      ],
    }),
    makeContent(SLUG, "faq", "faq", "en", {
      title: "Practical info.",
      titleAccent: "For organisers.",
      items: [
        { question: "How long does a keynote or workshop last?", answer: "A keynote lasts 30 to 60 minutes. A workshop can span half a day or a full day. Everything can be tailored, depending on your programme and objectives." },
        { question: "Where does Klaas deliver his sessions?", answer: "Anywhere in the Netherlands and Belgium, at your location. International is also possible — Klaas has experience in 21 countries and delivers sessions in Dutch and English." },
        { question: "What does a keynote or workshop cost?", answer: "The investment depends on the duration, location and number of participants. Get in touch for a no-obligation custom proposal." },
        { question: "What audience is Klaas suited for?", answer: "Sales teams, management, customer service, kick-offs, conferences and client events. From 10 to 500 participants. The message is always: genuine and relaxed commercial growth." },
        { question: "Can the session be combined with coaching?", answer: "Yes, a keynote or workshop can be extended with 1-on-1 coaching or team guidance. That way the impact is not limited to the day itself." },
      ],
    }),
    // ── CTA ──
    makeContent(SLUG, "cta", "cta", "nl", {
      title: "Boek Klaas.",
      titleAccent: "Voor jouw event.",
      description: "Een inspirerende sessie die teams in beweging zet. Neem contact op om de mogelijkheden te bespreken.",
      href: "/contact",
      ctaLabel: "Neem contact op",
    }),
    makeContent(SLUG, "cta", "cta", "en", {
      title: "Book Klaas.",
      titleAccent: "For your event.",
      description: "An inspiring session that sets teams in motion. Get in touch to discuss the possibilities.",
      href: "/contact",
      ctaLabel: "Get in touch",
    }),
    // ── DE content ──
    makeContent(SLUG, "hero", "hero", "de", {
      eyebrow: "Redner & Keynote",
      titleLine1: "Inspirieren Sie",
      titleLine2: "Ihr Team.",
      description: "Eine Inspirationssitzung, in der ich Teams erleben lasse, wie man mit weniger Anspannung mehr Kunden in Fans verwandelt. Keine Theorie, sondern Energie und Einsichten, die haften bleiben.",
      image: "/images/spreker/klaas-hero.jpeg",
      imageAlt: "Klaas Kroezen als Redner auf der Bühne",
      imagePosition: "center 25%",
      glassItems: [
        { label: "Keynotes & Workshops", text: "Von 30 Minuten Inspiration bis zu einem ganztägigen Workshop. Maßgeschneidert für Ihr Event oder Ihren Teamtag." },
        { label: "25+ Jahre Erfahrung", text: "International B2B bei Google, Samsung, Microsoft, ING und Vodafone. Eigenes Unternehmen 2022 verkauft." },
        { label: "Bewährte Wirkung", text: "Teams gehen mit Energie, Einsichten und einem konkreten Ansatz nach Hause, den sie sofort anwenden können." },
      ],
    }),
    makeContent(SLUG, "audiences", "audiences", "de", {
      items: ["Vertriebsteams", "Kick-offs", "Teamtage", "Konferenzen", "Management-Events", "Kunden-Events"],
    }),
    makeContent(SLUG, "content-block", "content-block", "de", {
      eyebrow: "Über die Sitzung",
      title: "Vertrieb scheitert oft an Leistungsdruck.",
      titleAccent: "Es geht auch anders.",
      imageAlt: "Klaas Kroezen leitet einen Workshop am Flipchart",
      paragraphs: [
        "Durch Ziele, Zahlen und Erwartungen wird Verkaufen verkrampft. Menschen werden angespannt, zweifeln, verlieren sich selbst — und das Ergebnis sinkt. Das kostet Energie, Frustration, Vertrauen und Geld.",
        "Mit 25 Jahren Erfahrung im Vertrieb und Kundenerlebnis, vom Scale-up bis zum Boardroom, helfe ich Teams, aus aufrichtiger Verbindung zu wachsen. Nicht aus Tricks.",
        "Ich stand selbst jahrelang an vorderster Front als CEO und Eigentümer einer internationalen Marktforschungsagentur. Ich weiß, wie es sich anfühlt, wenn Vertrieb wie ein aussichtsloser Kampf wirkt. Und ich weiß, wie es tatsächlich funktioniert.",
      ],
    }),
    makeContent(SLUG, "benefits-grid", "benefits-grid", "de", {
      items: [
        { icon: "✓", text: "Energie und Inspiration, die Sie in Ihre Arbeit mitnehmen" },
        { icon: "✓", text: "Klare Einsichten für nachhaltiges kommerzielles Wachstum" },
        { icon: "✓", text: "Geschichten und Übungen, die Menschen in Bewegung setzen" },
        { icon: "✓", text: "Keine Tricks. Keine Skripte. Aufrichtiger und entspannter Vertrieb." },
      ],
    }),
    makeContent(SLUG, "videos", "videos", "de", {
      eyebrow: "Auf der Bühne",
      title: "Sehen Sie Ausschnitte.",
      titleAccent: "Aufrichtig und entspannt in Aktion.",
      items: [
        { title: "Rede bei der Buchvorstellung", thumbnail: "/images/spreker/video-thumb-speech.jpg", embedUrl: "https://www.youtube.com/embed/F6io8l_VYww", duration: "3:35" },
        { title: "Vertriebs- und kundenorientierte Denkweise in Ihrem Team", thumbnail: "/images/spreker/video-thumb-mindset.jpg", embedUrl: "https://www.youtube.com/embed/placeholder-mindset", duration: "1:46" },
      ],
    }),
    makeContent(SLUG, "logo-bar", "logo-bar", "de", { label: "Unter anderem gearbeitet mit" }),
    makeContent(SLUG, "coaching", "coaching", "de", {
      sectionEyebrow: "Coaching & Begleitung",
      sectionTitle1: "Persönlich oder",
      sectionTitle2: "als Team.",
      individual: {
        label: "Individuell",
        title: "1-zu-1 Coaching",
        description: "Persönliche Begleitung für Vertriebsprofis und Führungskräfte, die wachsen wollen. In Ihrem Tempo, auf Ihre Herausforderungen zugeschnitten.",
        features: ["Maßgeschneidertes individuelles Programm", "Persönliches Sparring & Feedback", "Fokus auf Ihre spezifischen Herausforderungen", "Flexible Terminplanung"],
        price: "Auf Anfrage",
        cta: "Kontakt aufnehmen →",
      },
      team: {
        label: "Teams",
        title: "Team-Coaching",
        description: "Begleiten Sie Ihr Team zu einer gemeinsamen kommerziellen Denkweise. Von Bewusstsein bis Implementierung — gemeinsam wachsen in Kundenorientierung.",
        features: ["Gemeinsamer Kick-off vor Ort", "Teamorientierte Übungen & Fälle", "Begleitung während der Implementierung", "Messbare Ergebnisse pro Teilnehmer"],
        price: "Auf Anfrage",
        cta: "Gespräch planen →",
      },
    }),
    makeContent(SLUG, "faq", "faq", "de", {
      title: "Praktische Infos.",
      titleAccent: "Für Organisatoren.",
      items: [
        { question: "Wie lange dauert eine Keynote oder ein Workshop?", answer: "Eine Keynote dauert 30 bis 60 Minuten. Ein Workshop kann einen halben oder ganzen Tag umfassen. Alles kann je nach Programm und Zielsetzung maßgeschneidert werden." },
        { question: "Wo hält Klaas seine Sitzungen?", answer: "Überall in den Niederlanden und Belgien, an Ihrem Standort. International ist auch möglich — Klaas hat Erfahrung in 21 Ländern und hält Sitzungen auf Niederländisch und Englisch." },
        { question: "Was kostet eine Keynote oder ein Workshop?", answer: "Die Investition hängt von der Dauer, dem Standort und der Anzahl der Teilnehmer ab. Nehmen Sie Kontakt auf für ein unverbindliches maßgeschneidertes Angebot." },
        { question: "Für welches Publikum ist Klaas geeignet?", answer: "Vertriebsteams, Management, Kundenservice, Kick-offs, Konferenzen und Kunden-Events. Von 10 bis 500 Teilnehmern. Die Botschaft ist immer: aufrichtig und entspannt kommerziell wachsen." },
        { question: "Kann die Sitzung mit Coaching kombiniert werden?", answer: "Ja, eine Keynote oder ein Workshop kann mit 1-zu-1 Coaching oder Teambegleitung erweitert werden. So bleibt die Wirkung nicht auf den Tag selbst beschränkt." },
      ],
    }),
    makeContent(SLUG, "cta", "cta", "de", {
      title: "Buchen Sie Klaas.",
      titleAccent: "Für Ihr Event.",
      description: "Eine inspirierende Sitzung, die Teams in Bewegung setzt. Nehmen Sie Kontakt auf, um die Möglichkeiten zu besprechen.",
      href: "/contact",
      ctaLabel: "Kontakt aufnehmen",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Spreker — Klaas Kroezen", en: "Speaker — Klaas Kroezen", de: "Redner — Klaas Kroezen" },
    sections,
    content,
  };
}
