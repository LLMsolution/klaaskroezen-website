import { internalMutation } from "./_generated/server";

/** Reseed SET training with expanded module structure (without videos) */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing SET training + modules
    const existing = await ctx.db
      .query("trainings")
      .withIndex("by_slug", (q) => q.eq("slug", "sales-excellence-training"))
      .first();

    if (existing) {
      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", existing._id))
        .collect();
      for (const m of modules) {
        const quiz = await ctx.db
          .query("quizzes")
          .withIndex("by_module", (q) => q.eq("moduleId", m._id))
          .first();
        if (quiz) {
          const questions = await ctx.db
            .query("quizQuestions")
            .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
            .collect();
          for (const q of questions) await ctx.db.delete(q._id);
          await ctx.db.delete(quiz._id);
        }
        await ctx.db.delete(m._id);
      }
      await ctx.db.delete(existing._id);
    }

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
      linkedProducts: ["set-online", "set-coaching"],
      active: true,
      sortOrder: 0,
      createdAt: Date.now(),
    });

    const modules = [
      // ── Welkom & Introductie ──
      {
        slug: "welkom-intakeformulier",
        title: {
          nl: "Welkom - Start met het intakeformulier",
          en: "Welcome - Start with the intake form",
        },
        description: {
          nl: "Welkom bij de Sales Excellence Training. Vul het intakeformulier in voor het beste resultaat.",
          en: "Welcome to the Sales Excellence Training. Fill in the intake form for the best results.",
        },
      },
      {
        slug: "1-1-introductie-set",
        title: {
          nl: "1.1 Introductie Sales Excellence Training",
          en: "1.1 Introduction Sales Excellence Training",
        },
        description: {
          nl: "Wat ga je leren in deze training? Een overzicht van de 6 modules en hoe de training is opgebouwd.",
          en: "What will you learn in this training? An overview of the 6 modules and how the training is structured.",
        },
      },
      {
        slug: "1-2-maximale-uit-training",
        title: {
          nl: "1.2 Hoe haal je het maximale uit deze training",
          en: "1.2 How to get the most from this training",
        },
        description: {
          nl: "Praktische tips om het maximale uit deze training te halen. Hoe je het werkboek gebruikt en de lessen toepast.",
          en: "Practical tips to get the most from this training. How to use the workbook and apply the lessons.",
        },
      },
      {
        slug: "1-3-voorstellen-klaas",
        title: {
          nl: "1.3 Voorstellen - 25 jaar sales ervaring",
          en: "1.3 Introduction - 25 years of sales experience",
        },
        description: {
          nl: "Wie is Klaas Kroezen? Van Google en Samsung tot eigen bedrijf verkocht. Hoe deze ervaring de basis werd voor oprecht en ontspannen verkopen.",
          en: "Who is Klaas Kroezen? From Google and Samsung to selling his own company. How this experience became the foundation for genuine and relaxed selling.",
        },
      },
      {
        slug: "1-4-customer-experience-model",
        title: {
          nl: "1.4 Het Customer Experience Model",
          en: "1.4 The Customer Experience Model",
        },
        description: {
          nl: "De kern van alles: het Customer Experience Model. Dit model vormt de rode draad door de hele training.",
          en: "The core of everything: the Customer Experience Model. This model forms the common thread throughout the training.",
        },
      },
      {
        slug: "1-5-werkboek-instructie",
        title: {
          nl: "1.5 Hoe ga je aan de slag met je werkboek",
          en: "1.5 How to work with your workbook",
        },
        description: {
          nl: "Het werkboek is essentieel om alles uit de training te halen. Zo gebruik je het effectief bij elke module.",
          en: "The workbook is essential to get the most from the training. Here's how to use it effectively with each module.",
        },
      },

      // ── Module 2: Mindset & Identiteit ──
      {
        slug: "2-1-impact-overtuigingen-sales",
        title: {
          nl: "2.1 De impact van overtuigingen op je salesresultaat",
          en: "2.1 The impact of beliefs on your sales results",
        },
        description: {
          nl: "Je overtuigingen bepalen je gedrag, en je gedrag bepaalt je resultaat. Ontdek welke overtuigingen je helpen en welke je remmen.",
          en: "Your beliefs determine your behavior, and your behavior determines your results. Discover which beliefs help and which hold you back.",
        },
      },
      {
        slug: "2-2-identiteit-als-verkoper",
        title: {
          nl: "2.2 Je identiteit als verkoper - wie ben je echt",
          en: "2.2 Your identity as a salesperson - who are you really",
        },
        description: {
          nl: "Veel verkopers dragen een masker. Leer hoe je verkoopt vanuit wie je echt bent, zonder druk of prestatiedwang.",
          en: "Many salespeople wear a mask. Learn how to sell from who you truly are, without pressure or performance anxiety.",
        },
      },
      {
        slug: "2-3-top-overtuigingen-sales",
        title: {
          nl: "2.3 De top overtuigingen voor sales succes",
          en: "2.3 The top beliefs for sales success",
        },
        description: {
          nl: "De krachtigste overtuigingen die het verschil maken tussen middelmatige en excellente verkopers. Hoe je ze installeert.",
          en: "The most powerful beliefs that make the difference between mediocre and excellent salespeople. How to install them.",
        },
      },
      {
        slug: "2-4-van-druk-naar-ontspanning",
        title: {
          nl: "2.4 Van druk naar ontspanning in je salesaanpak",
          en: "2.4 From pressure to relaxation in your sales approach",
        },
        description: {
          nl: "De paradox van sales: hoe minder je duwt, hoe meer je verkoopt. Leer de mindset van ontspannen verkopen.",
          en: "The sales paradox: the less you push, the more you sell. Learn the mindset of relaxed selling.",
        },
      },
      {
        slug: "2-5-samenvatting-mindset",
        title: {
          nl: "2.5 Samenvatting Mindset & Identiteit",
          en: "2.5 Summary Mindset & Identity",
        },
        description: {
          nl: "Korte samenvatting van de module Mindset & Identiteit. De kernpunten die je meeneemt naar de volgende modules.",
          en: "Brief summary of the Mindset & Identity module. The key takeaways for the next modules.",
        },
      },

      // ── Module 3: Oprechte Verbinding ──
      {
        slug: "3-1-waarom-vertrouwen-alles-is",
        title: {
          nl: "3.1 Waarom vertrouwen alles is in sales",
          en: "3.1 Why trust is everything in sales",
        },
        description: {
          nl: "Zonder vertrouwen geen deal. Leer waarom vertrouwen de basis is van elke succesvolle verkooprelatie.",
          en: "No trust, no deal. Learn why trust is the foundation of every successful sales relationship.",
        },
      },
      {
        slug: "3-2-echt-luisteren",
        title: {
          nl: "3.2 Echt luisteren - voorbij de oppervlakte",
          en: "3.2 Truly listening - beyond the surface",
        },
        description: {
          nl: "De meeste verkopers luisteren om te antwoorden. Leer luisteren om te begrijpen. Het verschil verandert alles.",
          en: "Most salespeople listen to reply. Learn to listen to understand. The difference changes everything.",
        },
      },
      {
        slug: "3-3-eerste-indruk-verbinding",
        title: {
          nl: "3.3 De eerste indruk - verbinding in de eerste 30 seconden",
          en: "3.3 The first impression - connection in the first 30 seconds",
        },
        description: {
          nl: "Hoe je vanaf het allereerste moment vertrouwen en verbinding opbouwt. Niet met trucjes, maar met oprechte interesse.",
          en: "How to build trust and connection from the very first moment. Not with tricks, but with genuine interest.",
        },
      },
      {
        slug: "3-4-lsd-ada-gespreksvaardigheden",
        title: {
          nl: "3.4 LSD & ADA - krachtige gespreksvaardigheden",
          en: "3.4 LSD & ADA - powerful conversation skills",
        },
        description: {
          nl: "Twee bewezen gesprekstechnieken: Luisteren-Samenvatten-Doorvragen en Aandacht-Doorvragen-Afstemmen.",
          en: "Two proven conversation techniques: Listen-Summarize-Question and Attention-Question-Align.",
        },
      },
      {
        slug: "3-5-samenvatting-verbinding",
        title: {
          nl: "3.5 Samenvatting Oprechte Verbinding",
          en: "3.5 Summary Genuine Connection",
        },
        description: {
          nl: "Korte samenvatting van de module Oprechte Verbinding.",
          en: "Brief summary of the Genuine Connection module.",
        },
      },

      // ── Module 4: De Klantvraag Achter de Vraag ──
      {
        slug: "4-1-waarom-klanten-niet-vertellen",
        title: {
          nl: "4.1 Waarom klanten niet vertellen wat ze echt nodig hebben",
          en: "4.1 Why customers don't tell you what they really need",
        },
        description: {
          nl: "Klanten vertellen zelden meteen wat ze echt nodig hebben. Begrijp waarom, en leer hoe je de echte behoefte achterhaalt.",
          en: "Customers rarely tell you what they really need right away. Understand why, and learn how to uncover the real need.",
        },
      },
      {
        slug: "4-2-lagen-van-klantvragen",
        title: {
          nl: "4.2 De lagen van klantvragen - ga een laag dieper",
          en: "4.2 The layers of customer questions - go deeper",
        },
        description: {
          nl: "Elke klantvraag heeft meerdere lagen. Leer hoe je doorvraagt tot je bij de werkelijke behoefte komt.",
          en: "Every customer question has multiple layers. Learn how to probe until you reach the real need.",
        },
      },
      {
        slug: "4-3-persoonlijkheidstypes-verkoop",
        title: {
          nl: "4.3 Verschillende persoonlijkheidstypes in het verkoopgesprek",
          en: "4.3 Different personality types in sales conversations",
        },
        description: {
          nl: "Niet elke klant communiceert hetzelfde. Leer de verschillende persoonlijkheidstypes herkennen en je aanpak aanpassen.",
          en: "Not every customer communicates the same way. Learn to recognize different personality types and adapt your approach.",
        },
      },
      {
        slug: "4-4-vraag-achter-de-vraag-toepassen",
        title: {
          nl: "4.4 De vraag achter de vraag in de praktijk",
          en: "4.4 The question behind the question in practice",
        },
        description: {
          nl: "Praktische oefeningen en voorbeelden van hoe je de werkelijke klantvraag boven tafel krijgt in echte gesprekken.",
          en: "Practical exercises and examples of uncovering the real customer need in actual conversations.",
        },
      },
      {
        slug: "4-5-samenvatting-klantvraag",
        title: {
          nl: "4.5 Samenvatting De Klantvraag Achter de Vraag",
          en: "4.5 Summary The Question Behind the Question",
        },
        description: {
          nl: "Korte samenvatting van de module De Klantvraag Achter de Vraag.",
          en: "Brief summary of The Question Behind the Question module.",
        },
      },

      // ── Module 5: Ontspannen Presenteren & Pitchen ──
      {
        slug: "5-1-presenteren-vanuit-rust",
        title: {
          nl: "5.1 Presenteren vanuit rust en overtuiging",
          en: "5.1 Presenting from calm and conviction",
        },
        description: {
          nl: "Geen verkooppraatjes, maar een verhaal dat resoneert. Leer hoe je presenteert vanuit rust en zelfvertrouwen.",
          en: "No sales pitches, but a story that resonates. Learn to present from calm and self-confidence.",
        },
      },
      {
        slug: "5-2-storytelling-in-sales",
        title: {
          nl: "5.2 Storytelling in sales - in de teaching zit de sales",
          en: "5.2 Storytelling in sales - teaching is selling",
        },
        description: {
          nl: "De krachtigste manier om te overtuigen is door te leren en verhalen te vertellen. Hoe je storytelling inzet in je verkoopgesprek.",
          en: "The most powerful way to convince is through teaching and storytelling. How to use storytelling in your sales conversation.",
        },
      },
      {
        slug: "5-3-online-vs-offline-presentatie",
        title: {
          nl: "5.3 Online vs. offline presentatie - de beste vorm kiezen",
          en: "5.3 Online vs. offline presentation - choosing the best format",
        },
        description: {
          nl: "Tips voor zowel online als offline presentaties. Hoe je in beide settings maximaal overkomt.",
          en: "Tips for both online and offline presentations. How to make maximum impact in both settings.",
        },
      },
      {
        slug: "5-4-pitch-zonder-druk",
        title: {
          nl: "5.4 De pitch zonder druk - je aanbod laten spreken",
          en: "5.4 The pitch without pressure - let your offer speak",
        },
        description: {
          nl: "Hoe je je aanbod presenteert op een manier die uitnodigt in plaats van duwt. De klant kiest voor jou op basis van waarde.",
          en: "How to present your offer in a way that invites rather than pushes. The customer chooses you based on value.",
        },
      },
      {
        slug: "5-5-samenvatting-presenteren",
        title: {
          nl: "5.5 Samenvatting Ontspannen Presenteren & Pitchen",
          en: "5.5 Summary Relaxed Presenting & Pitching",
        },
        description: {
          nl: "Korte samenvatting van de module Ontspannen Presenteren & Pitchen.",
          en: "Brief summary of the Relaxed Presenting & Pitching module.",
        },
      },

      // ── Module 6: Bezwaren & Onderhandelen ──
      {
        slug: "6-1-bezwaren-zijn-uitnodigingen",
        title: {
          nl: "6.1 Bezwaren zijn geen afwijzing - ze zijn een uitnodiging",
          en: "6.1 Objections are not rejection - they are an invitation",
        },
        description: {
          nl: "De meeste verkopers vrezen bezwaren. Leer ze zien als een teken van interesse en een kans om dieper te verbinden.",
          en: "Most salespeople fear objections. Learn to see them as a sign of interest and an opportunity to connect deeper.",
        },
      },
      {
        slug: "6-2-omgaan-met-prijsbezwaren",
        title: {
          nl: "6.2 Omgaan met prijsbezwaren - waarde boven prijs",
          en: "6.2 Handling price objections - value over price",
        },
        description: {
          nl: "De impact van korting op je winst. Hoe je de waardediscussie voert in plaats van de prijsdiscussie.",
          en: "The impact of discounting on your profit. How to have the value discussion instead of the price discussion.",
        },
      },
      {
        slug: "6-3-professioneel-onderhandelen",
        title: {
          nl: "6.3 Professioneel onderhandelen - naar win-win",
          en: "6.3 Professional negotiation - towards win-win",
        },
        description: {
          nl: "De principes van professioneel onderhandelen. Hoe je tot een win-win komt zonder concessies op kwaliteit.",
          en: "The principles of professional negotiation. How to reach win-win without compromising on quality.",
        },
      },
      {
        slug: "6-4-deal-sluiten-zonder-druk",
        title: {
          nl: "6.4 De deal sluiten zonder druk",
          en: "6.4 Closing the deal without pressure",
        },
        description: {
          nl: "Het moment van de deal. Hoe je ontspannen en natuurlijk naar de sluiting toewerkt.",
          en: "The moment of the deal. How to work towards the close in a relaxed and natural way.",
        },
      },
      {
        slug: "6-5-samenvatting-bezwaren",
        title: {
          nl: "6.5 Samenvatting Bezwaren & Onderhandelen",
          en: "6.5 Summary Objections & Negotiation",
        },
        description: {
          nl: "Korte samenvatting van de module Bezwaren & Onderhandelen.",
          en: "Brief summary of the Objections & Negotiation module.",
        },
      },

      // ── Module 7: Klanten die Fans Worden ──
      {
        slug: "7-1-deal-is-het-begin",
        title: {
          nl: "7.1 Een deal sluiten is het begin, niet het einde",
          en: "7.1 Closing a deal is the beginning, not the end",
        },
        description: {
          nl: "De echte waarde zit in de relatie na de deal. Hoe je van een eenmalige klant een langetermijnrelatie maakt.",
          en: "The real value is in the relationship after the deal. How to turn a one-time customer into a long-term relationship.",
        },
      },
      {
        slug: "7-2-upsell-cross-sell-oprecht",
        title: {
          nl: "7.2 Upsell en cross-sell - oprecht meerwaarde bieden",
          en: "7.2 Upsell and cross-sell - genuinely offering more value",
        },
        description: {
          nl: "Hoe je meer aan bestaande klanten verkoopt door oprechte meerwaarde te bieden. Geen trucjes, maar logische vervolgstappen.",
          en: "How to sell more to existing customers by genuinely offering more value. No tricks, but logical next steps.",
        },
      },
      {
        slug: "7-3-klant-naar-ambassadeur",
        title: {
          nl: "7.3 Van klant naar ambassadeur",
          en: "7.3 From customer to ambassador",
        },
        description: {
          nl: "Tevreden klanten zijn goed. Ambassadeurs zijn beter. Leer hoe je klanten activeert om jou aan te bevelen.",
          en: "Satisfied customers are good. Ambassadors are better. Learn how to activate customers to recommend you.",
        },
      },
      {
        slug: "7-4-tsunami-effect-voorkomen",
        title: {
          nl: "7.4 Het tsunami-effect voorkomen in je omzet",
          en: "7.4 Preventing the tsunami effect in your revenue",
        },
        description: {
          nl: "De golfbeweging in omzet die ontstaat als je niet structureel aan je klantportfolio werkt. Hoe je dit voorkomt.",
          en: "The wave pattern in revenue that occurs when you don't structurally manage your customer portfolio. How to prevent this.",
        },
      },
      {
        slug: "7-5-samenvatting-fans",
        title: {
          nl: "7.5 Samenvatting Klanten die Fans Worden",
          en: "7.5 Summary Customers Who Become Fans",
        },
        description: {
          nl: "Korte samenvatting van de module Klanten die Fans Worden.",
          en: "Brief summary of the Customers Who Become Fans module.",
        },
      },

      // ── Afsluiting ──
      {
        slug: "afsluiting-oprecht-ontspannen",
        title: {
          nl: "Afsluiting: Oprecht & ontspannen naar meer omzet",
          en: "Closing: Genuine & relaxed towards more revenue",
        },
        description: {
          nl: "De laatste video van de training. Een samenvatting en motivatie om alles toe te passen. Meer omzet, minder druk.",
          en: "The final video of the training. A summary and motivation to apply everything. More revenue, less pressure.",
        },
      },
    ];

    for (let i = 0; i < modules.length; i++) {
      await ctx.db.insert("trainingModules", {
        trainingId: setId,
        slug: modules[i].slug,
        title: modules[i].title,
        description: modules[i].description,
        sortOrder: i,
        discussionEnabled: true,
        quizRequired: false,
        active: true,
        createdAt: Date.now(),
      });
    }

    console.log(`SET Training seed voltooid: ${modules.length} modules aangemaakt.`);
  },
});
