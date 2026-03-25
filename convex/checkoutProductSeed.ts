import { internalMutation } from "./_generated/server";

/**
 * Seed checkoutProducts + checkoutReviews tables from hardcoded data.
 * Idempotent: only runs if checkoutProducts table is empty.
 */
export const seedProducts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("checkoutProducts").first();
    if (existing) return { seeded: false };

    const products = [
      {
        slug: "set-online",
        active: true,
        sortOrder: 0,
        name: { nl: "Sales Excellence Training — Online", en: "Sales Excellence Training — Online" },
        shortName: { nl: "SET Online", en: "SET Online" },
        description: { nl: "6 modules online training met digitaal werkboek. Flexibel in eigen tempo.", en: "6 modules online training with digital workbook. Flexible at your own pace." },
        type: "training" as const,
        productType: "training" as const,
        priceCents: 225000,
        priceInclBtw: false,
        btwRate: 21,
        features: {
          nl: ["6 modules online training", "Digitaal werkboek", "Certificaat na afronding", "Bestseller boek inbegrepen", "12 maanden toegang"],
          en: ["6 modules online training", "Digital workbook", "Certificate upon completion", "Bestselling book included", "12 months access"],
        },
        image: "/images/hero/sales-excellence-group.jpeg",
        bumps: ["boek-hardcopy", "boek-ebook", "boek-luisterboek"],
        installments: { count: 3, amountPerTermCents: 75000 },
        requiresShipping: false,
      },
      {
        slug: "set-coaching",
        active: true,
        sortOrder: 1,
        name: { nl: "Sales Excellence Training — Training + Coaching", en: "Sales Excellence Training — Training + Coaching" },
        shortName: { nl: "SET + Coaching", en: "SET + Coaching" },
        description: { nl: "Alles van Online plus fysiek werkboek, persoonlijke kick-off en coaching van Klaas.", en: "Everything from Online plus physical workbook, personal kick-off and coaching from Klaas." },
        type: "training" as const,
        productType: "training" as const,
        priceCents: 375000,
        priceInclBtw: false,
        btwRate: 21,
        features: {
          nl: ["Alles van Online", "Fysiek werkboek", "Persoonlijke kick-off met Klaas", "Presentatie met live feedback", "Actieplan op maat", "12 maanden toegang"],
          en: ["Everything from Online", "Physical workbook", "Personal kick-off with Klaas", "Presentation with live feedback", "Custom action plan", "12 months access"],
        },
        image: "/images/hero/sales-excellence-group.jpeg",
        bumps: ["boek-hardcopy", "boek-ebook", "boek-luisterboek"],
        installments: { count: 3, amountPerTermCents: 125000 },
        requiresShipping: false,
      },
      {
        slug: "cst-online",
        active: true,
        sortOrder: 2,
        name: { nl: "Customer Success Training — Online", en: "Customer Success Training — Online" },
        shortName: { nl: "CST Online", en: "CST Online" },
        description: { nl: "6 modules online training voor professionals in klantcontact, service en delivery.", en: "6 modules online training for professionals in customer contact, service and delivery." },
        type: "training" as const,
        productType: "training" as const,
        priceCents: 225000,
        priceInclBtw: false,
        btwRate: 21,
        features: {
          nl: ["6 modules online training", "Digitaal werkboek", "Certificaat na afronding", "Bestseller boek inbegrepen", "12 maanden toegang"],
          en: ["6 modules online training", "Digital workbook", "Certificate upon completion", "Bestselling book included", "12 months access"],
        },
        image: "/images/hero/customer-success-group.jpg",
        bumps: ["boek-hardcopy", "boek-ebook", "boek-luisterboek"],
        installments: { count: 3, amountPerTermCents: 75000 },
        requiresShipping: false,
      },
      {
        slug: "cst-coaching",
        active: true,
        sortOrder: 3,
        name: { nl: "Customer Success Training — Training + Coaching", en: "Customer Success Training — Training + Coaching" },
        shortName: { nl: "CST + Coaching", en: "CST + Coaching" },
        description: { nl: "Alles van Online plus fysiek werkboek, persoonlijke kick-off en coaching van Klaas.", en: "Everything from Online plus physical workbook, personal kick-off and coaching from Klaas." },
        type: "training" as const,
        productType: "training" as const,
        priceCents: 375000,
        priceInclBtw: false,
        btwRate: 21,
        features: {
          nl: ["Alles van Online", "Fysiek werkboek", "Persoonlijke kick-off met Klaas", "Presentatie met live feedback", "Actieplan op maat", "12 maanden toegang"],
          en: ["Everything from Online", "Physical workbook", "Personal kick-off with Klaas", "Presentation with live feedback", "Custom action plan", "12 months access"],
        },
        image: "/images/hero/customer-success-group.jpg",
        bumps: ["boek-hardcopy", "boek-ebook", "boek-luisterboek"],
        installments: { count: 3, amountPerTermCents: 125000 },
        requiresShipping: false,
      },
      {
        slug: "boek-ebook",
        active: true,
        sortOrder: 4,
        name: { nl: "Sales, Oprecht & Ontspannen — E-book", en: "Sales, Honest & Relaxed — E-book" },
        shortName: { nl: "E-book", en: "E-book" },
        description: { nl: "Direct toegang tot het e-book. Lees op je telefoon, tablet of computer.", en: "Instant access to the e-book. Read on your phone, tablet or computer." },
        type: "book" as const,
        productType: "book" as const,
        priceCents: 2250,
        priceInclBtw: true,
        btwRate: 9,
        features: {
          nl: ["Direct downloaden (PDF)", "Lezen op elk apparaat", "Bestseller — 2.500+ verkocht"],
          en: ["Instant download (PDF)", "Read on any device", "Bestseller — 2,500+ sold"],
        },
        image: "/images/book/sales-oprecht-ontspannen-cover.png",
        bumps: ["boek-hardcopy", "boek-luisterboek"],
        requiresShipping: false,
        mockupType: "tablet" as const,
      },
      {
        slug: "boek-hardcopy",
        active: true,
        sortOrder: 5,
        name: { nl: "Sales, Oprecht & Ontspannen — Hard Copy", en: "Sales, Honest & Relaxed — Hard Copy" },
        shortName: { nl: "Hard Copy", en: "Hard Copy" },
        description: { nl: "Fysiek boek, gratis verzending binnen Nederland.", en: "Physical book, free shipping within the Netherlands." },
        type: "book" as const,
        productType: "book" as const,
        priceCents: 3250,
        priceInclBtw: true,
        btwRate: 9,
        features: {
          nl: ["Gratis verzending (NL)", "Binnen 2 werkdagen bezorgd", "Bestseller — 2.500+ verkocht"],
          en: ["Free shipping (NL)", "Delivered within 2 business days", "Bestseller — 2,500+ sold"],
        },
        image: "/images/book/sales-oprecht-ontspannen-cover.png",
        bumps: ["boek-ebook", "boek-luisterboek", "boek-cadeau"],
        bumpPriceOverrides: [
          { bumpSlug: "boek-ebook", priceCents: 1000 },
          { bumpSlug: "boek-luisterboek", priceCents: 1000 },
          { bumpSlug: "boek-cadeau", priceCents: 2950 },
        ],
        requiresShipping: true,
        quantityTiers: [
          { quantity: 1, unitPriceCents: 3250, savingsPercent: 0 },
          { quantity: 3, unitPriceCents: 2950, savingsPercent: 9 },
          { quantity: 10, unitPriceCents: 2750, savingsPercent: 15 },
        ],
      },
      {
        slug: "boek-luisterboek",
        active: true,
        sortOrder: 6,
        name: { nl: "Sales, Oprecht & Ontspannen — Luisterboek", en: "Sales, Honest & Relaxed — Audiobook" },
        shortName: { nl: "Luisterboek", en: "Audiobook" },
        description: { nl: "Ingesproken door Klaas zelf. Luister onderweg of op kantoor.", en: "Narrated by Klaas himself. Listen on the go or at the office." },
        type: "book" as const,
        productType: "book" as const,
        priceCents: 2250,
        priceInclBtw: true,
        btwRate: 9,
        features: {
          nl: ["Direct downloaden (MP3)", "Ingesproken door Klaas", "Bestseller — 2.500+ verkocht"],
          en: ["Instant download (MP3)", "Narrated by Klaas", "Bestseller — 2,500+ sold"],
        },
        image: "/images/book/sales-oprecht-ontspannen-cover.png",
        bumps: ["boek-hardcopy", "boek-ebook"],
        requiresShipping: false,
        mockupType: "audio" as const,
      },
      {
        slug: "boek-cadeau",
        active: false, // Only exists as bump, not standalone
        sortOrder: 7,
        name: { nl: "Sales, Oprecht & Ontspannen — Cadeau-exemplaar", en: "Sales, Honest & Relaxed — Gift Copy" },
        shortName: { nl: "Cadeau-exemplaar", en: "Gift copy" },
        description: { nl: "Bestel een tweede hardcopy als cadeau voor een collega of vriend.", en: "Order a second hard copy as a gift for a colleague or friend." },
        type: "book" as const,
        productType: "book" as const,
        priceCents: 2950,
        priceInclBtw: true,
        btwRate: 9,
        features: { nl: ["Gratis verzending (NL)"], en: ["Free shipping (NL)"] },
        image: "/images/book/sales-oprecht-ontspannen-cover.png",
        bumps: [],
        requiresShipping: true,
      },
    ];

    for (const p of products) {
      await ctx.db.insert("checkoutProducts", p);
    }

    // Seed reviews
    const reviews = [
      {
        productType: "training" as const,
        text: { nl: "Direct meer resultaat. Klaas heeft ons salesteam fundamenteel veranderd — niet met trucjes maar met een aanpak die echt werkt en blijft hangen.", en: "Immediate results. Klaas fundamentally changed our sales team — not with tricks but with an approach that truly works and sticks." },
        name: "Simon Kornblum",
        role: { nl: "Directeur Visma YouServe", en: "Director Visma YouServe" },
        avatar: "/images/reviews/simon-kornblum.jpg",
        rating: 5,
        active: true,
        sortOrder: 0,
      },
      {
        productType: "training" as const,
        text: { nl: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geinteresseerd te zijn.", en: "Out of 10 leads, 1 or 2 became clients. Now it's 7 or 8. Not by pushing harder, but by being genuinely interested." },
        name: "Max de Weijer",
        role: { nl: "Ondernemer", en: "Entrepreneur" },
        rating: 5,
        active: true,
        sortOrder: 1,
      },
      {
        productType: "training" as const,
        text: { nl: "Klaas laat zien dat verkopen niet gaat over trucjes maar over echt contact maken. Een aanpak die werkt — ook als je jezelf geen verkoper vindt.", en: "Klaas shows that selling isn't about tricks but about making real connections. An approach that works — even if you don't see yourself as a salesperson." },
        name: "Mark Tigchelaar",
        role: { nl: "Psycholoog · Focus AAN/UIT", en: "Psychologist · Focus ON/OFF" },
        avatar: "/images/reviews/mark-tigchelaar.jpeg",
        rating: 5,
        active: true,
        sortOrder: 2,
      },
      {
        productType: "book" as const,
        text: { nl: "Een verfrissend boek dat laat zien dat je geen typische verkoper hoeft te zijn om succesvol te verkopen.", en: "A refreshing book that shows you don't need to be a typical salesperson to sell successfully." },
        name: "Michael Pilarczyk",
        role: { nl: "Bestsellerauteur · Ondernemer", en: "Bestselling author · Entrepreneur" },
        avatar: "/images/reviews/michael-pilarczyk.jpeg",
        rating: 5,
        active: true,
        sortOrder: 0,
      },
      {
        productType: "book" as const,
        text: { nl: "Dit boek verandert hoe je naar sales kijkt. Oprecht, praktisch en direct toepasbaar.", en: "This book changes how you look at sales. Honest, practical and immediately applicable." },
        name: "Tijn Touber",
        role: { nl: "Auteur · Spreker", en: "Author · Speaker" },
        avatar: "/images/reviews/tijn-touber.jpg",
        rating: 5,
        active: true,
        sortOrder: 1,
      },
    ];

    for (const r of reviews) {
      await ctx.db.insert("checkoutReviews", r);
    }

    return { seeded: true, products: products.length, reviews: reviews.length };
  },
});
