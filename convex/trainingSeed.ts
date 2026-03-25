import { internalMutation } from "./_generated/server";

export const reseed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing training data
    const trainings = await ctx.db.query("trainings").collect();
    for (const t of trainings) await ctx.db.delete(t._id);
    const modules = await ctx.db.query("trainingModules").collect();
    for (const m of modules) await ctx.db.delete(m._id);
    const quizzes = await ctx.db.query("quizzes").collect();
    for (const q of quizzes) await ctx.db.delete(q._id);
    const questions = await ctx.db.query("quizQuestions").collect();
    for (const q of questions) await ctx.db.delete(q._id);
    console.log("Bestaande trainingsdata verwijderd.");
  },
});

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if trainings already exist
    const existing = await ctx.db.query("trainings").collect();
    if (existing.length > 0) {
      console.log("Trainingen bestaan al, seed overgeslagen.");
      return;
    }

    // ── Sales Excellence Training ──
    const setId = await ctx.db.insert("trainings", {
      slug: "sales-excellence-training",
      title: {
        nl: "Sales Excellence Training",
        en: "Sales Excellence Training",
      },
      description: {
        nl: "Meer omzet met minder druk. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt.",
        en: "More revenue with less pressure. Learn how to sell structurally better with authenticity and ease.",
      },
      active: true,
      sortOrder: 0,
      createdAt: Date.now(),
    });

    const setModules = [
      {
        slug: "mindset-identiteit",
        title: { nl: "Mindset & Identiteit", en: "Mindset & Identity" },
        description: {
          nl: "Ontdek hoe je overtuigingen je verkoopresultaat bepalen. Werk aan de mindset die past bij duurzaam succes.",
          en: "Discover how your beliefs determine your sales results. Build the mindset for sustainable success.",
        },
      },
      {
        slug: "oprechte-verbinding",
        title: { nl: "Oprechte Verbinding", en: "Genuine Connection" },
        description: {
          nl: "Leer hoe je vanaf het eerste moment vertrouwen opbouwt. Niet met scripts, maar door echt te luisteren.",
          en: "Learn how to build trust from the first moment. Not with scripts, but by truly listening.",
        },
      },
      {
        slug: "klantvraag-achter-de-vraag",
        title: { nl: "De Klantvraag Achter de Vraag", en: "The Question Behind the Question" },
        description: {
          nl: "Klanten vertellen zelden meteen wat ze echt nodig hebben. Leer hoe je de werkelijke behoefte boven tafel krijgt.",
          en: "Customers rarely tell you what they truly need right away. Learn how to uncover the real need.",
        },
      },
      {
        slug: "ontspannen-presenteren",
        title: { nl: "Ontspannen Presenteren & Pitchen", en: "Relaxed Presenting & Pitching" },
        description: {
          nl: "Presenteer je aanbod vanuit rust en overtuiging. Geen verkooppraatjes, maar een verhaal dat resoneert.",
          en: "Present your offer from a place of calm and conviction. No sales pitches, but a story that resonates.",
        },
      },
      {
        slug: "bezwaren-onderhandelen",
        title: { nl: "Bezwaren & Onderhandelen", en: "Objections & Negotiation" },
        description: {
          nl: "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging. Leer hoe je er ontspannen mee omgaat.",
          en: "Objections are not rejection — they are an invitation. Learn how to handle them with ease.",
        },
      },
      {
        slug: "klanten-die-fans-worden",
        title: { nl: "Klanten die Fans Worden", en: "Customers Who Become Fans" },
        description: {
          nl: "Een deal sluiten is het begin, niet het einde. Bouw relaties die leiden tot herhaalaankopen en aanbevelingen.",
          en: "Closing a deal is the beginning, not the end. Build relationships that lead to repeat purchases and referrals.",
        },
      },
    ];

    for (let i = 0; i < setModules.length; i++) {
      await ctx.db.insert("trainingModules", {
        trainingId: setId,
        ...setModules[i],
        sortOrder: i,
        discussionEnabled: true,
        quizRequired: true,
        active: true,
        createdAt: Date.now(),
      });
    }

    // ── Customer Success Training ──
    const cstId = await ctx.db.insert("trainings", {
      slug: "customer-success-training",
      title: {
        nl: "Customer Success Training",
        en: "Customer Success Training",
      },
      description: {
        nl: "Maak van klanten fans. Leer hoe je vanuit klantcontact bijdraagt aan groei, retentie en ambassadeurschap.",
        en: "Turn customers into fans. Learn how customer interactions drive growth, retention and advocacy.",
      },
      active: true,
      sortOrder: 1,
      createdAt: Date.now(),
    });

    const cstModules = [
      {
        slug: "rol-commercieel-geheel",
        title: { nl: "Jouw Rol in het Commerciële Geheel", en: "Your Role in the Commercial Whole" },
        description: {
          nl: "Begrijp hoe jouw klantcontact direct invloed heeft op omzet, retentie en ambassadeurschap.",
          en: "Understand how your customer interactions directly impact revenue, retention and advocacy.",
        },
      },
      {
        slug: "oprechte-klantfocus",
        title: { nl: "Oprechte Klantfocus", en: "Genuine Customer Focus" },
        description: {
          nl: "Leer luisteren voorbij het oppervlak. Begrijp wat je klant echt nodig heeft.",
          en: "Learn to listen beyond the surface. Understand what your customer truly needs.",
        },
      },
      {
        slug: "signalen-herkennen",
        title: { nl: "Signalen Herkennen", en: "Recognising Signals" },
        description: {
          nl: "Klanten geven continu signalen — over tevredenheid, kansen en risico's. Leer ze herkennen.",
          en: "Customers continuously give signals — about satisfaction, opportunities and risks. Learn to recognise them.",
        },
      },
      {
        slug: "moeilijke-gesprekken",
        title: { nl: "Moeilijke Gesprekken Ontspannen Voeren", en: "Handling Difficult Conversations with Ease" },
        description: {
          nl: "Prijsverhogingen, verwachtingsmanagement, teleurstelling — leer hoe je lastige onderwerpen bespreekt.",
          en: "Price increases, expectation management, disappointment — learn how to discuss difficult topics.",
        },
      },
      {
        slug: "kansen-zien",
        title: { nl: "Kansen Zien Zonder Te Verkopen", en: "Spotting Opportunities Without Selling" },
        description: {
          nl: "Herken natuurlijke momenten om meerwaarde te bieden. Geen upsell-trucjes, maar oprechte suggesties.",
          en: "Recognise natural moments to offer added value. No upsell tricks, but genuine suggestions.",
        },
      },
      {
        slug: "klant-naar-ambassadeur",
        title: { nl: "Van Klant naar Ambassadeur", en: "From Customer to Ambassador" },
        description: {
          nl: "Tevreden klanten zijn goed. Ambassadeurs zijn beter. Leer hoe je van klantcontact een groeimachine maakt.",
          en: "Satisfied customers are good. Ambassadors are better. Learn how to turn customer contact into a growth engine.",
        },
      },
    ];

    for (let i = 0; i < cstModules.length; i++) {
      await ctx.db.insert("trainingModules", {
        trainingId: cstId,
        ...cstModules[i],
        sortOrder: i,
        discussionEnabled: true,
        quizRequired: true,
        active: true,
        createdAt: Date.now(),
      });
    }

    console.log("Seed voltooid: 2 trainingen met 12 modules.");
  },
});
