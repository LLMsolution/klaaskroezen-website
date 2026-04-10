import { makeContent, type PageSeed } from "./siteSeed";

const SLUG = "boek";

export function seedBoekContent(): PageSeed {
  const sections = [
    { id: "hero", type: "hero-book", active: true, sortOrder: 0 },
    { id: "book-preview", type: "book-preview", active: true, sortOrder: 1 },
    { id: "program", type: "program", active: true, sortOrder: 2 },
    { id: "bestellen", type: "book-pricing", active: true, sortOrder: 3 },
    { id: "reviews", type: "reviews", active: true, sortOrder: 4 },
    { id: "videos", type: "videos", active: true, sortOrder: 5 },
    { id: "interview", type: "interview", active: true, sortOrder: 6 },
    { id: "cross-link", type: "cross-link", active: true, sortOrder: 7 },
    { id: "faq", type: "faq", active: true, sortOrder: 8 },
    { id: "cta", type: "cta", active: true, sortOrder: 9 },
  ];

  const previewPages = [5, 6, 7, 8, 9, 11, 14, 19, 21, 24, 25, 27, 28, 31, 33, 35, 39, 132].map((n) => ({
    image: `/images/book/preview/page-${n}.png`,
    pageNumber: String(n),
  }));

  const content = [
    // ── Hero ──
    makeContent(SLUG, "hero", "hero-book", "nl", {
      label: "Bestseller",
      imageAlt: "Boek: Sales, Oprecht en Ontspannen door Klaas Kroezen",
      titleLine1: "Sales, Oprecht",
      titleAccent: "en Ontspannen.",
      paragraphs: [
        "Waarom voelt sales zo vaak ongemakkelijk en geforceerd? Omdat we geconditioneerd zijn om te overtuigen in plaats van oprecht te helpen.",
        "Dit boek is een praktische gids voor iedereen die dat traditionele, pushy salesgedoe spuugzat is en verlangt naar iets wat",
      ],
      boldText: "oprecht werkt",
      afterBold: ": het creëren van ware fans.",
      badges: ["Bestseller", "2e druk · 2.500+", "#1 Managementboek"],
      cta: "Direct bestellen",
    }),
    makeContent(SLUG, "hero", "hero-book", "en", {
      label: "Bestseller",
      imageAlt: "Book: Sales, Honest & Relaxed by Klaas Kroezen",
      titleLine1: "Sales, Honest",
      titleAccent: "& Relaxed.",
      paragraphs: [
        "Why does sales so often feel uncomfortable and forced? Because we've been conditioned to convince rather than genuinely help.",
        "This book is a practical guide for anyone who is fed up with that traditional, pushy sales approach and yearns for something that",
      ],
      boldText: "truly works",
      afterBold: ": creating true fans.",
      badges: ["Bestseller", "2nd edition · 2,500+", "#1 Management book"],
      cta: "Order now",
    }),
    // ── Book Preview ──
    makeContent(SLUG, "book-preview", "book-preview", "nl", {
      eyebrow: "Inkijken",
      title: "Blader door het boek",
      pages: previewPages,
    }),
    makeContent(SLUG, "book-preview", "book-preview", "en", {
      eyebrow: "Preview",
      title: "Browse the book",
      pages: previewPages,
    }),
    // ── Program ──
    makeContent(SLUG, "program", "program", "nl", {
      price: "€ 32,50",
      pricingAnchor: "#bestellen",
      ctaLabel: "Bestel het boek",
      modules: [
        { number: "01", title: "Mindset & Overtuigingen", description: "Ontdek hoe je eigen overtuigingen je verkoopresultaat bepalen. Werk aan de mindset die past bij duurzaam succes." },
        { number: "02", title: "Oprechte Verbinding", description: "Leer hoe je vanaf het eerste moment vertrouwen opbouwt. Niet met scripts, maar door écht te luisteren." },
        { number: "03", title: "De Vraag Achter de Vraag", description: "Klanten vertellen zelden meteen wat ze echt nodig hebben. Leer de werkelijke behoefte boven tafel te krijgen." },
        { number: "04", title: "Ontspannen Presenteren", description: "Presenteer je aanbod vanuit rust en overtuiging. Geen verkooppraatjes, maar een verhaal dat resoneert." },
        { number: "05", title: "Bezwaren & Onderhandelen", description: "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging. Leer er ontspannen mee omgaan." },
        { number: "06", title: "Van Klant naar Fan", description: "Een deal sluiten is het begin. Bouw relaties die leiden tot herhaalaankopen en aanbevelingen." },
      ],
    }),
    makeContent(SLUG, "program", "program", "en", {
      price: "€ 32.50",
      pricingAnchor: "#bestellen",
      ctaLabel: "Order the book",
      modules: [
        { number: "01", title: "Mindset & Beliefs", description: "Discover how your own beliefs determine your sales results. Build the mindset for sustainable success." },
        { number: "02", title: "Genuine Connection", description: "Learn how to build trust from the first moment. Not with scripts, but by truly listening." },
        { number: "03", title: "The Question Behind the Question", description: "Customers rarely tell you what they truly need right away. Learn to uncover the real need." },
        { number: "04", title: "Relaxed Presenting", description: "Present your offer from a place of calm and conviction. No sales pitches, but a story that resonates." },
        { number: "05", title: "Objections & Negotiation", description: "Objections are not rejection — they are an invitation. Learn to handle them with ease." },
        { number: "06", title: "From Customer to Fan", description: "Closing a deal is the beginning. Build relationships that lead to repeat purchases and referrals." },
      ],
    }),
    // ── Reviews ──
    makeContent(SLUG, "reviews", "reviews", "nl", {
      eyebrow: "Wat lezers zeggen",
      title: "Bewezen resultaat.",
      titleAccent: "Van LinkedIn tot Managementboek.",
      items: [
        { text: "Dit boek laat zien dat echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. Een must-read voor wie klanten wil veranderen in fans.", name: "Michael Pilarczyk", role: "Oprichter MasterMind Academy" },
        { text: "In dit boek spat de oprechtheid er vanaf. Sales zoals het bedoeld is: met pure intentie de verbinding maken tussen de échte klantbehoefte en wat je vertegenwoordigt.", name: "Simon Kornblum", role: "Directeur Visma YouServe" },
        { text: "Verkopen gaat niet over trucjes, maar over écht contact maken. Een manier van sales die past bij wie je bent — ook als je jezelf geen verkoper vindt.", name: "Mark Tigchelaar", role: "Psycholoog · Focus AAN/UIT" },
        { text: "Ik gun je een Klaas! Hij is al jaren de motor achter mijn succesvolle bedrijf.", name: "Tijn Touber", role: "Oprichter Lois Lane · schrijver en inspirator" },
        { text: "Dit boek gaat helemaal niet over sales. Het gaat over gedrag. In één ruk uitgelezen. En ik ben helemaal energiek om sales te gaan doen.", name: "Roderick Göttgens", role: "Oprichter Behavior Boost", source: "LinkedIn" },
        { text: "Sales kan ook rustig. Oprecht. En ijzersterk. Dit boek brengt het vak terug naar de basis: vertrouwen, vakmanschap en relaties die blijven.", name: "Hendrika Willemse-Vreugdenhil", role: "Speaker & auteur", source: "LinkedIn" },
        { text: "Topboek! Leest vlot en op zo'n manier geschreven dat je er vertrouwen in krijgt dat je dit morgen kan toepassen.", name: "M. de Schipper", role: "Lezer", source: "Managementboek" },
        { text: "Dit boek raakt de essentie en nodigt je uit om actief naar je eigen overtuigingen te kijken. Super praktisch toepasbaar.", name: "M. te Woerd", role: "Lezer", source: "Managementboek" },
        { text: "Sales gaat niet over verkopen aan iemand, maar over het helpen van iemand. Met die insteek voelt sales nu al anders.", name: "Y. Kruger", role: "Lezer", source: "Managementboek" },
        { text: "Echt een super goed boek. Maakt sales oprecht, menselijk en ontspannen, vol praktische tips die ik gelijk kan toepassen.", name: "E. Verheijen", role: "Lezer", source: "Managementboek" },
      ],
    }),
    makeContent(SLUG, "reviews", "reviews", "en", {
      eyebrow: "What readers say",
      title: "Proven results.",
      titleAccent: "From LinkedIn to Managementboek.",
      items: [
        { text: "This book shows that real sales starts with who you are. Mindset, calm and genuine intention lead to connection. A must-read for anyone who wants to turn customers into fans.", name: "Michael Pilarczyk", role: "Founder MasterMind Academy" },
        { text: "This book radiates authenticity. Sales as it was meant to be: connecting the real customer need with what you represent, with pure intention.", name: "Simon Kornblum", role: "Director Visma YouServe" },
        { text: "Selling is not about tricks, but about making real connections. A way of selling that fits who you are — even if you don't consider yourself a salesperson.", name: "Mark Tigchelaar", role: "Psychologist · Focus ON/OFF" },
        { text: "I wish you a Klaas! He has been the driving force behind my successful company for years.", name: "Tijn Touber", role: "Founder Lois Lane · writer and inspirator" },
        { text: "This book isn't about sales at all. It's about behaviour. Read it in one sitting. And I'm full of energy to start doing sales.", name: "Roderick Göttgens", role: "Founder Behavior Boost", source: "LinkedIn" },
        { text: "Sales can also be calm. Genuine. And rock solid. This book brings the craft back to basics: trust, mastery and lasting relationships.", name: "Hendrika Willemse-Vreugdenhil", role: "Speaker & author", source: "LinkedIn" },
        { text: "Great book! Reads smoothly and written in a way that gives you confidence you can apply this tomorrow.", name: "M. de Schipper", role: "Reader", source: "Managementboek" },
        { text: "This book touches the essence and invites you to actively look at your own beliefs. Super practically applicable.", name: "M. te Woerd", role: "Reader", source: "Managementboek" },
        { text: "Sales is not about selling to someone, but about helping someone. With that approach, sales already feels different.", name: "Y. Kruger", role: "Reader", source: "Managementboek" },
        { text: "Truly a great book. Makes sales genuine, human and relaxed, full of practical tips I can apply immediately.", name: "E. Verheijen", role: "Reader", source: "Managementboek" },
      ],
    }),
    // ── Bestellen ──
    makeContent(SLUG, "bestellen", "book-pricing", "nl", {
      label: "Bestellen",
      heading: "Kies jouw formaat.",
      formats: [
        { title: "E-book", price: "€ 22,50", priceNote: "Direct toegang", description: "Direct lezen op je computer, tablet of telefoon.", features: ["Begin vandaag nog", "Direct toegang na betaling"], href: "/checkout/boek-ebook", cta: "Bestel e-book" },
        { title: "Hard Copy", price: "€ 32,50", priceNote: "Incl. BTW · gratis verzending", description: "Het fysieke boek, thuis binnen één werkdag. De meest gekozen optie.", features: ["Levering binnen één werkdag", "Gratis verzending", "Inclusief BTW"], href: "/checkout/boek-hardcopy", cta: "Bestel boek", featured: "true" },
        { title: "Luisterboek", price: "€ 22,50", priceNote: "Voorgelezen door Klaas", description: "Luister onderweg, tijdens het sporten of thuis op de bank.", features: ["Direct luisteren", "Voorgelezen door de auteur", "Ideaal voor onderweg"], href: "/checkout/boek-luisterboek", cta: "Bestel luisterboek" },
      ],
    }),
    makeContent(SLUG, "bestellen", "book-pricing", "en", {
      label: "Order",
      heading: "Choose your format.",
      formats: [
        { title: "E-book", price: "€ 22.50", priceNote: "Instant access", description: "Read instantly on your computer, tablet or phone.", features: ["Start reading today", "Instant access after payment"], href: "/checkout/boek-ebook?lang=en", cta: "Order e-book" },
        { title: "Hard Copy", price: "€ 32.50", priceNote: "Incl. VAT · free shipping", description: "The physical book, delivered within one business day. The most popular option.", features: ["Delivered within one business day", "Free shipping", "VAT included"], href: "/checkout/boek-hardcopy?lang=en", cta: "Order book", featured: "true" },
        { title: "Audiobook", price: "€ 22.50", priceNote: "Narrated by Klaas", description: "Listen on the go, during workouts or at home on the couch.", features: ["Listen instantly", "Narrated by the author", "Perfect for on the go"], href: "/checkout/boek-luisterboek?lang=en", cta: "Order audiobook" },
      ],
    }),
    // ── Videos ──
    makeContent(SLUG, "videos", "videos", "nl", {
      eyebrow: "Bekijk",
      title: "Speech op de boeklancering.",
      description: "Waar komt mijn drive vandaan? Waarom Sales, oprecht en ontspannen?",
      items: [
        { title: "Speech op de boeklancering", thumbnail: "/images/spreker/video-thumb-speech.jpg", embedUrl: "https://www.youtube.com/embed/F6io8l_VYww", duration: "3:35" },
        { title: "Aftermovie boeklancering", thumbnail: "/images/book/boeklancering.jpeg", embedUrl: "https://www.youtube.com/embed/o7ajUmwEWpI", duration: "1:08" },
      ],
    }),
    makeContent(SLUG, "videos", "videos", "en", {
      eyebrow: "Watch",
      title: "Speech at the book launch.",
      description: "Where does my drive come from? Why Sales, Honest & Relaxed?",
      items: [
        { title: "Speech at the book launch", thumbnail: "/images/spreker/video-thumb-speech.jpg", embedUrl: "https://www.youtube.com/embed/F6io8l_VYww", duration: "3:35" },
        { title: "Aftermovie book launch", thumbnail: "/images/book/boeklancering.jpeg", embedUrl: "https://www.youtube.com/embed/o7ajUmwEWpI", duration: "1:08" },
      ],
    }),
    // ── Interview ──
    makeContent(SLUG, "interview", "interview", "nl", {
      eyebrow: "Managementboek.nl",
      title: "Sales is menselijk contact.",
      titleAccent: "Oprechte interesse.",
      image: "/images/blog/klaas-managementboek-interview.jpg",
      imageAlt: "Klaas Kroezen — interview Managementboek.nl",
      intro: "In een interview met Managementboek.nl vertelt Klaas over de kern van zijn filosofie.",
      quotes: [
        { question: "Waarom dit boek?", answer: "Er gaat zoveel energie verloren in sales door constante prestatiedruk. Als gesprekken dat gewicht dragen, verdwijnt de echte verbinding — en mensen voelen dat meteen." },
        { question: "Wat gaat er mis in salesgesprekken?", answer: "Gesprekken worden vermomde transacties. De verdeelde aandacht ondermijnt vertrouwen. De ander voelt dat er niet écht geluisterd wordt." },
        { question: "Wat was jouw keerpunt?", answer: "Iemand zei tegen mij: 'Je gaat te snel. Je maakt geen echt contact.' Dat veranderde alles — van transactiegericht naar relatiegericht werken." },
      ],
      linkText: "Lees het volledige interview",
      linkUrl: "https://www.managementboek.nl/magazine/q&a/23083/klaas-kroezen-sales-is-menselijk-contact.-oprechte-interesse",
    }),
    makeContent(SLUG, "interview", "interview", "en", {
      eyebrow: "Managementboek.nl",
      title: "Sales is human contact.",
      titleAccent: "Genuine interest.",
      image: "/images/blog/klaas-managementboek-interview.jpg",
      imageAlt: "Klaas Kroezen — interview Managementboek.nl",
      intro: "In an interview with Managementboek.nl, Klaas shares the core of his philosophy.",
      quotes: [
        { question: "Why this book?", answer: "So much energy is lost in sales due to constant performance pressure. When conversations carry that weight, genuine connection disappears — and people sense it immediately." },
        { question: "What goes wrong in sales conversations?", answer: "Meetings become disguised transactions. Divided attention undermines trust. The other person feels they're not truly being heard." },
        { question: "What was your turning point?", answer: "Someone told me: 'You're moving too fast. You're not making real contact.' That changed everything — from transaction-focused to relationship-focused work." },
      ],
      linkText: "Read the full interview",
      linkUrl: "https://www.managementboek.nl/magazine/q&a/23083/klaas-kroezen-sales-is-menselijk-contact.-oprechte-interesse",
    }),
    // ── Cross-link ──
    makeContent(SLUG, "cross-link", "cross-link", "nl", {
      eyebrow: "Verder leren",
      title: "Sales Excellence Training.",
      titleAccent: "Van boek naar praktijk.",
      description: "Het boek gelezen? Ga verder met de training. Dezelfde filosofie, maar dan met persoonlijke begeleiding en praktijkoefeningen.",
      image: "/images/hero/sales-excellence-group.jpeg",
      imageAlt: "Deelnemers van de Sales Excellence Training",
      href: "/sales-excellence-training",
      ctaLabel: "Bekijk training",
    }),
    makeContent(SLUG, "cross-link", "cross-link", "en", {
      eyebrow: "Continue learning",
      title: "Sales Excellence Training.",
      titleAccent: "From book to practice.",
      description: "Read the book? Continue with the training. The same philosophy, but with personal guidance and hands-on exercises.",
      image: "/images/hero/sales-excellence-group.jpeg",
      imageAlt: "Participants of the Sales Excellence Training",
      href: "/sales-excellence-training",
      ctaLabel: "View training",
    }),
    // ── FAQ ──
    makeContent(SLUG, "faq", "faq", "nl", {
      title: "Over het boek.",
      titleAccent: "Veelgestelde vragen.",
      items: [
        { question: "Voor wie is dit boek geschreven?", answer: "Voor iedereen die commercieel actief is: sales professionals, ondernemers, accountmanagers en managers. Maar ook voor mensen die 'iets met klanten doen' en daar beter in willen worden — zonder zich anders voor te doen." },
        { question: "Hoe snel wordt het boek bezorgd?", answer: "De hardcopy wordt binnen één werkdag verzonden met gratis verzending binnen Nederland. Het e-book en luisterboek zijn direct na betaling beschikbaar." },
        { question: "Wie spreekt het luisterboek in?", answer: "Klaas zelf. Zo hoor je de verhalen en inzichten precies zoals ze bedoeld zijn — met de energie en overtuiging van de auteur." },
        { question: "Kan ik het boek in bulk bestellen voor mijn team?", answer: "Ja, neem contact op voor een aantrekkelijk groepstarief. Veel bedrijven bestellen het boek als cadeau bij een training of kick-off." },
        { question: "Is het boek ook als training beschikbaar?", answer: "Ja, de Sales Excellence Training en Customer Success Training zijn gebaseerd op dezelfde methode als het boek, maar dan als verdiepend programma met oefeningen, video's en persoonlijke begeleiding." },
      ],
    }),
    makeContent(SLUG, "faq", "faq", "en", {
      title: "About the book.",
      titleAccent: "Frequently asked questions.",
      items: [
        { question: "Who is this book written for?", answer: "For anyone who is commercially active: sales professionals, entrepreneurs, account managers and managers. But also for people who 'do something with customers' and want to get better at it — without pretending to be someone else." },
        { question: "How quickly is the book delivered?", answer: "The hardcopy is shipped within one business day with free shipping within the Netherlands. The e-book and audiobook are available immediately after payment." },
        { question: "Who narrates the audiobook?", answer: "Klaas himself. So you hear the stories and insights exactly as they were intended — with the energy and conviction of the author." },
        { question: "Can I order the book in bulk for my team?", answer: "Yes, get in touch for an attractive group rate. Many companies order the book as a gift with a training or kick-off." },
        { question: "Is the book also available as a training?", answer: "Yes, the Sales Excellence Training and Customer Success Training are based on the same method as the book, but as an in-depth programme with exercises, videos and personal guidance." },
      ],
    }),
    // ── CTA ──
    makeContent(SLUG, "cta", "cta", "nl", {
      title: "Bestel het boek.",
      titleAccent: "Oprecht & ontspannen.",
      description: "Beschikbaar als hardcopy, e-book en luisterboek. Start vandaag met een aanpak die werkt — en die bij je past.",
      href: "#bestellen",
      ctaLabel: "Bekijk opties",
    }),
    makeContent(SLUG, "cta", "cta", "en", {
      title: "Order the book.",
      titleAccent: "Genuine & relaxed.",
      description: "Available as hardcopy, e-book and audiobook. Start today with an approach that works — and fits who you are.",
      href: "#bestellen",
      ctaLabel: "View options",
    }),
    // ── DE content ──
    makeContent(SLUG, "hero", "hero-book", "de", {
      label: "Bestseller",
      imageAlt: "Buch: Sales, Aufrichtig und Entspannt von Klaas Kroezen",
      titleLine1: "Sales, Aufrichtig",
      titleAccent: "und Entspannt.",
      paragraphs: [
        "Warum fühlt sich Vertrieb so oft unangenehm und erzwungen an? Weil wir darauf konditioniert sind zu überzeugen, statt aufrichtig zu helfen.",
        "Dieses Buch ist ein praktischer Leitfaden für alle, die diesen traditionellen, aufdringlichen Vertriebsansatz satt haben und sich nach etwas sehnen, das",
      ],
      boldText: "wirklich funktioniert",
      afterBold: ": echte Fans schaffen.",
      badges: ["Bestseller", "2. Auflage · 2.500+", "#1 Managementbuch"],
      cta: "Jetzt bestellen",
    }),
    makeContent(SLUG, "book-preview", "book-preview", "de", {
      eyebrow: "Einblick",
      title: "Blättern Sie durch das Buch",
      pages: previewPages,
    }),
    makeContent(SLUG, "program", "program", "de", {
      price: "€ 32,50",
      pricingAnchor: "#bestellen",
      ctaLabel: "Buch bestellen",
      modules: [
        { number: "01", title: "Mindset & Überzeugungen", description: "Entdecken Sie, wie Ihre eigenen Überzeugungen Ihr Verkaufsergebnis bestimmen. Arbeiten Sie an der Denkweise für nachhaltigen Erfolg." },
        { number: "02", title: "Aufrichtige Verbindung", description: "Lernen Sie, wie Sie vom ersten Moment an Vertrauen aufbauen. Nicht mit Skripten, sondern durch echtes Zuhören." },
        { number: "03", title: "Die Frage hinter der Frage", description: "Kunden sagen selten sofort, was sie wirklich brauchen. Lernen Sie, das echte Bedürfnis ans Licht zu bringen." },
        { number: "04", title: "Entspanntes Präsentieren", description: "Präsentieren Sie Ihr Angebot aus Ruhe und Überzeugung. Keine Verkaufsgespräche, sondern eine Geschichte, die resoniert." },
        { number: "05", title: "Einwände & Verhandlung", description: "Einwände sind keine Ablehnung — sie sind eine Einladung. Lernen Sie, entspannt damit umzugehen." },
        { number: "06", title: "Vom Kunden zum Fan", description: "Einen Deal abzuschließen ist der Anfang. Bauen Sie Beziehungen auf, die zu Wiederholungskäufen und Empfehlungen führen." },
      ],
    }),
    makeContent(SLUG, "reviews", "reviews", "de", {
      eyebrow: "Was Leser sagen",
      title: "Bewährte Ergebnisse.",
      titleAccent: "Von LinkedIn bis Managementboek.",
      items: [
        { text: "Dieses Buch zeigt, dass echter Vertrieb bei dem beginnt, wer Sie sind. Denkweise, Ruhe und aufrichtige Absicht führen zur Verbindung. Ein Muss für alle, die Kunden in Fans verwandeln wollen.", name: "Michael Pilarczyk", role: "Gründer MasterMind Academy" },
        { text: "Dieses Buch strahlt Authentizität aus. Vertrieb wie er gemeint war: das echte Kundenbedürfnis mit reiner Absicht mit dem zu verbinden, was Sie vertreten.", name: "Simon Kornblum", role: "Direktor Visma YouServe" },
        { text: "Verkaufen geht nicht um Tricks, sondern um echte Verbindungen. Eine Art zu verkaufen, die zu Ihnen passt — auch wenn Sie sich nicht als Verkäufer sehen.", name: "Mark Tigchelaar", role: "Psychologe · Focus AN/AUS" },
        { text: "Ich wünsche Ihnen einen Klaas! Er ist seit Jahren die treibende Kraft hinter meinem erfolgreichen Unternehmen.", name: "Tijn Touber", role: "Gründer Lois Lane · Autor und Inspirator" },
        { text: "Dieses Buch handelt überhaupt nicht von Vertrieb. Es handelt von Verhalten. In einem Zug gelesen. Und ich bin voller Energie, um mit dem Vertrieb zu beginnen.", name: "Roderick Göttgens", role: "Gründer Behavior Boost", source: "LinkedIn" },
        { text: "Vertrieb kann auch ruhig sein. Aufrichtig. Und grundsolide. Dieses Buch bringt das Handwerk zurück zu den Grundlagen: Vertrauen, Meisterschaft und dauerhafte Beziehungen.", name: "Hendrika Willemse-Vreugdenhil", role: "Rednerin & Autorin", source: "LinkedIn" },
        { text: "Tolles Buch! Liest sich flüssig und so geschrieben, dass Sie Vertrauen haben, dies morgen anwenden zu können.", name: "M. de Schipper", role: "Leser", source: "Managementboek" },
        { text: "Dieses Buch trifft den Kern und lädt Sie ein, Ihre eigenen Überzeugungen aktiv zu betrachten. Sehr praktisch anwendbar.", name: "M. te Woerd", role: "Leser", source: "Managementboek" },
        { text: "Vertrieb geht nicht darum, jemandem etwas zu verkaufen, sondern jemandem zu helfen. Mit diesem Ansatz fühlt sich Vertrieb bereits anders an.", name: "Y. Kruger", role: "Leser", source: "Managementboek" },
        { text: "Wirklich ein großartiges Buch. Macht den Vertrieb aufrichtig, menschlich und entspannt, voller praktischer Tipps, die ich sofort anwenden kann.", name: "E. Verheijen", role: "Leser", source: "Managementboek" },
      ],
    }),
    makeContent(SLUG, "videos", "videos", "de", {
      eyebrow: "Ansehen",
      title: "Rede bei der Buchvorstellung.",
      description: "Woher kommt mein Antrieb? Warum Sales, Aufrichtig und Entspannt?",
      items: [
        { title: "Rede bei der Buchvorstellung", thumbnail: "/images/spreker/video-thumb-speech.jpg", embedUrl: "https://www.youtube.com/embed/F6io8l_VYww", duration: "3:35" },
        { title: "Aftermovie Buchvorstellung", thumbnail: "/images/book/boeklancering.jpeg", embedUrl: "https://www.youtube.com/embed/o7ajUmwEWpI", duration: "1:08" },
      ],
    }),
    makeContent(SLUG, "interview", "interview", "de", {
      eyebrow: "Managementboek.nl",
      title: "Vertrieb ist menschlicher Kontakt.",
      titleAccent: "Aufrichtiges Interesse.",
      image: "/images/blog/klaas-managementboek-interview.jpg",
      imageAlt: "Klaas Kroezen — Interview Managementboek.nl",
      intro: "In einem Interview mit Managementboek.nl teilt Klaas den Kern seiner Philosophie.",
      quotes: [
        { question: "Warum dieses Buch?", answer: "Im Vertrieb geht so viel Energie durch ständigen Leistungsdruck verloren. Wenn Gespräche dieses Gewicht tragen, verschwindet die echte Verbindung — und Menschen spüren das sofort." },
        { question: "Was läuft in Verkaufsgesprächen schief?", answer: "Meetings werden zu verkleideten Transaktionen. Geteilte Aufmerksamkeit untergräbt Vertrauen. Die andere Person fühlt, dass ihr nicht wirklich zugehört wird." },
        { question: "Was war Ihr Wendepunkt?", answer: "Jemand sagte zu mir: 'Du gehst zu schnell. Du machst keinen echten Kontakt.' Das hat alles verändert — von transaktionsorientierter zu beziehungsorientierter Arbeit." },
      ],
      linkText: "Lesen Sie das vollständige Interview",
      linkUrl: "https://www.managementboek.nl/magazine/q&a/23083/klaas-kroezen-sales-is-menselijk-contact.-oprechte-interesse",
    }),
    makeContent(SLUG, "cross-link", "cross-link", "de", {
      eyebrow: "Weiter lernen",
      title: "Sales Excellence Training.",
      titleAccent: "Vom Buch zur Praxis.",
      description: "Das Buch gelesen? Machen Sie weiter mit dem Training. Dieselbe Philosophie, aber mit persönlicher Begleitung und praktischen Übungen.",
      image: "/images/hero/sales-excellence-group.jpeg",
      imageAlt: "Teilnehmer des Sales Excellence Trainings",
      href: "/sales-excellence-training",
      ctaLabel: "Training ansehen",
    }),
    makeContent(SLUG, "faq", "faq", "de", {
      title: "Über das Buch.",
      titleAccent: "Häufig gestellte Fragen.",
      items: [
        { question: "Für wen ist dieses Buch geschrieben?", answer: "Für alle, die kommerziell aktiv sind: Vertriebsprofis, Unternehmer, Accountmanager und Manager. Aber auch für Menschen, die 'etwas mit Kunden machen' und darin besser werden wollen — ohne sich zu verstellen." },
        { question: "Wie schnell wird das Buch geliefert?", answer: "Die Hardcopy wird innerhalb eines Werktages mit kostenloser Lieferung innerhalb der Niederlande versandt. Das E-Book und Hörbuch sind sofort nach Zahlung verfügbar." },
        { question: "Wer spricht das Hörbuch ein?", answer: "Klaas selbst. So hören Sie die Geschichten und Einsichten genau so, wie sie gemeint sind — mit der Energie und Überzeugung des Autors." },
        { question: "Kann ich das Buch in großen Mengen für mein Team bestellen?", answer: "Ja, nehmen Sie Kontakt auf für einen attraktiven Gruppentarif. Viele Unternehmen bestellen das Buch als Geschenk bei einem Training oder Kick-off." },
        { question: "Ist das Buch auch als Training verfügbar?", answer: "Ja, das Sales Excellence Training und Customer Success Training basieren auf derselben Methode wie das Buch, aber als vertiefendes Programm mit Übungen, Videos und persönlicher Begleitung." },
      ],
    }),
    makeContent(SLUG, "cta", "cta", "de", {
      title: "Bestellen Sie das Buch.",
      titleAccent: "Aufrichtig & entspannt.",
      description: "Verfügbar als Hardcopy, E-Book und Hörbuch. Beginnen Sie heute mit einem Ansatz, der funktioniert — und zu Ihnen passt.",
      href: "#bestellen",
      ctaLabel: "Optionen ansehen",
    }),
  ];

  return {
    slug: SLUG,
    title: { nl: "Boek — Sales, Oprecht en Ontspannen", en: "Book — Sales, Honest & Relaxed", de: "Buch — Sales, Aufrichtig und Entspannt" },
    sections,
    content,
  };
}
