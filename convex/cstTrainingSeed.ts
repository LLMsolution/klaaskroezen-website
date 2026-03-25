import { internalMutation } from "./_generated/server";

/** Reseed CST training with actual Kajabi module structure (without videos) */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing CST training + modules
    const existing = await ctx.db
      .query("trainings")
      .withIndex("by_slug", (q) => q.eq("slug", "customer-success-training"))
      .first();

    if (existing) {
      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", existing._id))
        .collect();
      for (const m of modules) {
        // Delete quizzes for module
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

    // Create CST training
    const cstId = await ctx.db.insert("trainings", {
      slug: "customer-success-training",
      title: {
        nl: "Customer Success Training",
        en: "Customer Success Training",
      },
      description: {
        nl: "Ontdek hoe je de absolute top in Customer Success bereikt, zodat klanten langer blijven, meer investeren en fans worden.",
        en: "Discover how to reach the absolute top in Customer Success, so customers stay longer, invest more and become fans.",
      },
      linkedProducts: ["cst-online", "cst-coaching"],
      active: true,
      sortOrder: 1,
      createdAt: Date.now(),
    });

    const modules = [
      // ── Module 1: Ontdek jouw potentieel (29:54) ──
      {
        slug: "welkom-intakeformulier",
        title: {
          nl: "Welkom - Start met het intakeformulier",
          en: "Welcome - Start with the intake form",
        },
        description: {
          nl: "Welkom bij de Customer Success Training. Vul het intakeformulier in om het beste resultaat uit deze training te halen.",
          en: "Welcome to the Customer Success Training. Fill in the intake form to get the best results from this training.",
        },
        durationSeconds: 0,
      },
      {
        slug: "1-1-introductie-cst",
        title: {
          nl: "1.1 Introductie Customer Success Training",
          en: "1.1 Introduction Customer Success Training",
        },
        description: {
          nl: "Een introductie op de Customer Success Training. Wat ga je leren en hoe is de training opgebouwd?",
          en: "An introduction to the Customer Success Training. What will you learn and how is the training structured?",
        },
        durationSeconds: 232,
      },
      {
        slug: "1-2-maximale-uit-training",
        title: {
          nl: "1.2 Hoe haal je het maximale uit deze training",
          en: "1.2 How to get the most from this training",
        },
        description: {
          nl: "Praktische tips om het maximale uit deze training te halen. Hoe je het werkboek gebruikt en hoe je de lessen toepast in de praktijk.",
          en: "Practical tips to get the most from this training. How to use the workbook and apply the lessons in practice.",
        },
        durationSeconds: 158,
      },
      {
        slug: "1-3-voorstellen",
        title: {
          nl: "1.3 Voorstellen en hoe ben ik tot deze training gekomen",
          en: "1.3 Introduction and how I came to this training",
        },
        description: {
          nl: "Wie is Klaas Kroezen en hoe is hij tot de Customer Success Training oprecht en ontspannen gekomen?",
          en: "Who is Klaas Kroezen and how did he develop the Customer Success Training?",
        },
        durationSeconds: 161,
      },
      {
        slug: "1-4-customer-experience-model",
        title: {
          nl: "1.4 Het Customer Experience Model - de kern van Customer Success",
          en: "1.4 The Customer Experience Model - the core of Customer Success",
        },
        description: {
          nl: "Om je klanten oprecht en ontspannen te helpen, hebben we het Customer Experience Model ontwikkeld. Dit is de kern van alles wat je in deze training leert.",
          en: "To help your customers genuinely and relaxed, we developed the Customer Experience Model. This is the core of everything you'll learn.",
        },
        durationSeconds: 493,
      },
      {
        slug: "1-5-customer-experience-funnel",
        title: {
          nl: "1.5 De Customer Experience Funnel",
          en: "1.5 The Customer Experience Funnel",
        },
        description: {
          nl: "Centraal staat in deze training oprecht en ontspannen. En wat betekent dat precies in de customer experience funnel?",
          en: "Central to this training is genuine and relaxed. What does that mean exactly in the customer experience funnel?",
        },
        durationSeconds: 322,
      },
      {
        slug: "1-6-business-champions-league",
        title: {
          nl: "1.6 De Business Champions League & Customer Success",
          en: "1.6 The Business Champions League & Customer Success",
        },
        description: {
          nl: "We gaan aan de slag met de totale funnel en hoe Customer Success daarin past. Hoe speel je in de business champions league?",
          en: "Working with the full funnel and how Customer Success fits in. How do you play in the business champions league?",
        },
        durationSeconds: 248,
      },
      {
        slug: "1-7-werkboek",
        title: {
          nl: "1.7 Hoe ga je aan de slag met je werkboek",
          en: "1.7 How to work with your workbook",
        },
        description: {
          nl: "Hoe ga je aan de slag met je werkboek? Praktische uitleg over het invullen en toepassen van de oefeningen.",
          en: "How to work with your workbook? Practical explanation on completing and applying the exercises.",
        },
        durationSeconds: 179,
      },

      // ── Module 2: Oprecht & Ontspannen naar duurzame klantrelaties (14:43) ──
      {
        slug: "2-1-focus-op-proces",
        title: {
          nl: "2.1 Focus op het proces voor maximaal resultaat",
          en: "2.1 Focus on the process for maximum results",
        },
        description: {
          nl: "De kern van deze training is oprecht en ontspannen je klanten helpen. In deze les leer je hoe je focust op het proces in plaats van alleen het resultaat.",
          en: "The core of this training is genuinely and relaxed helping your customers. Learn to focus on the process instead of just the result.",
        },
        durationSeconds: 314,
      },
      {
        slug: "2-2-impact-echt-contact",
        title: {
          nl: "2.2 De impact van echt contact maken",
          en: "2.2 The impact of making genuine contact",
        },
        description: {
          nl: "Wanneer je alles uit deze training echt toepast, wat kan er dan gebeuren? Ontdek de impact van echt contact maken met je klanten.",
          en: "When you truly apply everything from this training, what can happen? Discover the impact of making genuine contact.",
        },
        durationSeconds: 216,
      },
      {
        slug: "2-3-voorbereiden-presteren",
        title: {
          nl: "2.3 Voorbereiden om maximaal te presteren",
          en: "2.3 Preparing for maximum performance",
        },
        description: {
          nl: "Om oprecht en ontspannen je klant het allerbeste te helpen, is voorbereiding essentieel. Leer hoe je je optimaal voorbereidt.",
          en: "To genuinely and relaxed help your customer, preparation is essential. Learn how to optimally prepare.",
        },
        durationSeconds: 284,
      },
      {
        slug: "2-4-samenvatting-module-2",
        title: {
          nl: "2.4 Samenvatting module 2",
          en: "2.4 Summary module 2",
        },
        description: {
          nl: "Een korte samenvatting van wat we hebben behandeld in module 2: oprecht en ontspannen naar duurzame klantrelaties.",
          en: "A brief summary of what we covered in module 2: genuine and relaxed towards sustainable customer relationships.",
        },
        durationSeconds: 69,
      },

      // ── Module 3: Versterk jezelf met krachtige overtuigingen (1:02:44) ──
      {
        slug: "3-1-impact-overtuigingen",
        title: {
          nl: "3.1 De impact van overtuigingen op oprecht & ontspannen je klanten helpen",
          en: "3.1 The impact of beliefs on genuinely helping your customers",
        },
        description: {
          nl: "In deze module gaan we aan de slag met overtuigingen. Hoe bepalen jouw overtuigingen hoe je met klanten omgaat?",
          en: "In this module we work on beliefs. How do your beliefs determine how you interact with customers?",
        },
        durationSeconds: 426,
      },
      {
        slug: "3-2-top-20-overtuigingen-deel-1",
        title: {
          nl: "3.2 De top 20 overtuigingen - de eerste 10",
          en: "3.2 The top 20 beliefs - the first 10",
        },
        description: {
          nl: "We gaan aan de slag met de top 20 overtuigingen die het verschil maken in Customer Success. In deze video de eerste 10.",
          en: "Working with the top 20 beliefs that make the difference in Customer Success. In this video the first 10.",
        },
        durationSeconds: 1659,
      },
      {
        slug: "3-3-top-20-overtuigingen-deel-2",
        title: {
          nl: "3.3 De top 20 overtuigingen - de tweede 10",
          en: "3.3 The top 20 beliefs - the second 10",
        },
        description: {
          nl: "We gaan aan de slag met het tweede set van tien overtuigingen. Deze overtuigingen helpen je om op topniveau met klanten te werken.",
          en: "Working with the second set of ten beliefs. These beliefs help you work with customers at the highest level.",
        },
        durationSeconds: 1679,
      },

      // ── Module 4: Word de betrouwbare adviseur - inhoud (41:30) ──
      {
        slug: "4-1-voorbereiding-halve-werk",
        title: {
          nl: "4.1 Voorbereiding is het halve werk",
          en: "4.1 Preparation is half the work",
        },
        description: {
          nl: "In deze module gaan we aan de slag met inhoud. De inhoud bepaalt hoe goed je je klant kunt helpen.",
          en: "In this module we work on content. Content determines how well you can help your customer.",
        },
        durationSeconds: 135,
      },
      {
        slug: "4-2-zonder-vertrouwen-geen-probleem",
        title: {
          nl: "4.2 Zonder vertrouwen, geen probleem",
          en: "4.2 Without trust, no problem",
        },
        description: {
          nl: "Zonder vertrouwen deelt je klant geen problemen. Leer hoe je vertrouwen opbouwt zodat klanten zich openstellen.",
          en: "Without trust your customer won't share problems. Learn how to build trust so customers open up.",
        },
        durationSeconds: 216,
      },
      {
        slug: "4-3-ada-lsd-gespreksvaardigheden",
        title: {
          nl: "4.3 ADA & LSD gespreksvaardigheden",
          en: "4.3 ADA & LSD conversation skills",
        },
        description: {
          nl: "Twee ontzettend krachtige tools voor betere gesprekken met klanten: ADA (Aandacht, Doorvragen, Afstemmen) en LSD (Luisteren, Samenvatten, Doorvragen).",
          en: "Two incredibly powerful tools for better customer conversations: ADA and LSD conversation frameworks.",
        },
        durationSeconds: 166,
      },
      {
        slug: "4-4-teaching-sales-storytelling",
        title: {
          nl: "4.4 In de teaching zit de sales & storytelling",
          en: "4.4 In teaching lies the sales & storytelling",
        },
        description: {
          nl: "In het lesgeven en delen van kennis zit de echte sales. Leer hoe storytelling je helpt om klanten te overtuigen.",
          en: "In teaching and sharing knowledge lies the real sales. Learn how storytelling helps convince customers.",
        },
        durationSeconds: 169,
      },
      {
        slug: "4-5-persoonlijkheidstypes",
        title: {
          nl: "4.5 Hoe ga je om met verschillende persoonlijkheidstypes",
          en: "4.5 How to deal with different personality types",
        },
        description: {
          nl: "In deze video gaan we aan de slag met persoonlijkheidstypes en hoe je je aanpak afstemt op verschillende typen klanten.",
          en: "Working with personality types and how to adapt your approach to different types of customers.",
        },
        durationSeconds: 386,
      },
      {
        slug: "4-6-probleem-klant-laag-dieper",
        title: {
          nl: "4.6 Hoe ga je om met een probleem met de klant - ga een laag dieper",
          en: "4.6 How to handle a customer problem - go a layer deeper",
        },
        description: {
          nl: "Wanneer er een probleem is met een klant, ga dan een laag dieper. Leer hoe je de werkelijke oorzaak achterhaalt.",
          en: "When there's a problem with a customer, go a layer deeper. Learn how to find the real root cause.",
        },
        durationSeconds: 237,
      },
      {
        slug: "4-7-prijsverhoging-korting-winst",
        title: {
          nl: "4.7 De impact van prijsverhoging of korting op de winst",
          en: "4.7 The impact of price increases or discounts on profit",
        },
        description: {
          nl: "Wat is de daadwerkelijke impact van de prijs die we vragen? Leer over de relatie tussen prijs, korting en winstgevendheid.",
          en: "What is the actual impact of the price we charge? Learn about the relationship between price, discount and profitability.",
        },
        durationSeconds: 291,
      },
      {
        slug: "4-8-strategische-samenwerking",
        title: {
          nl: "4.8 Een strategische samenwerking verder uitbouwen",
          en: "4.8 Expanding a strategic partnership",
        },
        description: {
          nl: "Hoe bouw je strategisch je samenwerking met klanten verder uit? Van leverancier naar strategisch partner.",
          en: "How to strategically expand your collaboration with customers? From supplier to strategic partner.",
        },
        durationSeconds: 223,
      },
      {
        slug: "4-9-professioneel-onderhandelen",
        title: {
          nl: "4.9 Professioneel onderhandelen",
          en: "4.9 Professional negotiation",
        },
        description: {
          nl: "Leer de principes van professioneel onderhandelen. Hoe je tot een win-win komt zonder concessies te doen op kwaliteit.",
          en: "Learn the principles of professional negotiation. How to reach win-win without compromising quality.",
        },
        durationSeconds: 422,
      },
      {
        slug: "4-10-samenvatting-module-4",
        title: {
          nl: "4.10 Samenvatting module 4",
          en: "4.10 Summary module 4",
        },
        description: {
          nl: "Een korte samenvatting van module 4: word de betrouwbare adviseur door sterke inhoud.",
          en: "A brief summary of module 4: become the trusted advisor through strong content.",
        },
        durationSeconds: 245,
      },

      // ── Module 5: Optimaliseer je proces voor betere resultaten (39:52) ──
      {
        slug: "5-1-klant-mag-nooit-vraag-hebben",
        title: {
          nl: "5.1 Een klant mag nooit een vraag hebben",
          en: "5.1 A customer should never have a question",
        },
        description: {
          nl: "In deze module gaan we aan de slag met het proces. Een goede Customer Success professional zorgt ervoor dat de klant nooit een vraag hoeft te hebben.",
          en: "In this module we work on process. A good Customer Success professional ensures the customer never needs to ask.",
        },
        durationSeconds: 281,
      },
      {
        slug: "5-2-customer-success-plan",
        title: {
          nl: "5.2 Het Customer Success Plan - hoe je in de lead bent",
          en: "5.2 The Customer Success Plan - how to take the lead",
        },
        description: {
          nl: "Leer het Customer Success Plan: hoe je proactief in de lead bent richting je klant en altijd een stap voor bent.",
          en: "Learn the Customer Success Plan: how to proactively take the lead with your customer and always be one step ahead.",
        },
        durationSeconds: 593,
      },
      {
        slug: "5-3-gouden-driehoek",
        title: {
          nl: "5.3 De Gouden Driehoek - hoe betrek je de interne organisatie",
          en: "5.3 The Golden Triangle - how to involve the internal organization",
        },
        description: {
          nl: "De gouden driehoek: hoe betrek je de interne organisatie bij Customer Success? Samenwerking tussen sales, delivery en management.",
          en: "The golden triangle: how to involve the internal organization in Customer Success? Collaboration between sales, delivery and management.",
        },
        durationSeconds: 312,
      },
      {
        slug: "5-4-ijzer-smeden",
        title: {
          nl: "5.4 Het ijzer smeden wanneer het heet is",
          en: "5.4 Strike while the iron is hot",
        },
        description: {
          nl: "Timing is alles. Leer hoe je het juiste moment herkent om actie te ondernemen bij je klant.",
          en: "Timing is everything. Learn how to recognize the right moment to take action with your customer.",
        },
        durationSeconds: 165,
      },
      {
        slug: "5-5-continu-leren-verbeteren",
        title: {
          nl: "5.5 Hoe blijf je continu leren en verbeteren",
          en: "5.5 How to keep learning and improving",
        },
        description: {
          nl: "Na het ijzer smeden wanneer het heet is, moet je continu blijven leren en verbeteren. Hoe doe je dat structureel?",
          en: "After striking while the iron is hot, you need to keep learning and improving. How to do that structurally?",
        },
        durationSeconds: 135,
      },
      {
        slug: "5-6-upsell-cross-sell",
        title: {
          nl: "5.6 Hoe verkoop je meer aan bestaande klanten - Upsell en cross-sell",
          en: "5.6 How to sell more to existing customers - Upsell and cross-sell",
        },
        description: {
          nl: "Leer hoe je meer aan bestaande klanten verkoopt door upsell en cross-sell. Niet als verkooptruc, maar als oprechte meerwaarde.",
          en: "Learn how to sell more to existing customers through upsell and cross-sell. Not as a sales trick, but as genuine added value.",
        },
        durationSeconds: 312,
      },
      {
        slug: "5-7-tsunami-effect",
        title: {
          nl: "5.7 Hoe voorkom je het tsunami-effect - de golfbeweging in omzet",
          en: "5.7 How to prevent the tsunami effect - the wave pattern in revenue",
        },
        description: {
          nl: "Het tsunami-effect is de golfbeweging in omzet die ontstaat als je niet structureel werkt aan je klantportfolio. Leer hoe je dit voorkomt.",
          en: "The tsunami effect is the wave pattern in revenue that occurs when you don't structurally manage your customer portfolio.",
        },
        durationSeconds: 395,
      },
      {
        slug: "5-8-samenvatting-module-5",
        title: {
          nl: "5.8 Samenvatting module 5",
          en: "5.8 Summary module 5",
        },
        description: {
          nl: "Samenvatting van de module Proces. We gaan kort door alles wat we hebben behandeld over procesoptimalisatie.",
          en: "Summary of the Process module. We briefly review everything we covered about process optimization.",
        },
        durationSeconds: 187,
      },

      // ── Module 6: Vorm - Presentatie voor betere resultaten (23:04) ──
      {
        slug: "6-1-vorm-klant-ziet",
        title: {
          nl: "6.1 Vorm is alles wat de klant daadwerkelijk ziet",
          en: "6.1 Form is everything the customer actually sees",
        },
        description: {
          nl: "In deze module gaan we aan de slag met vorm. Vorm betekent alles wat de klant daadwerkelijk ziet, hoort en ervaart.",
          en: "In this module we work on form. Form means everything the customer actually sees, hears and experiences.",
        },
        durationSeconds: 254,
      },
      {
        slug: "6-2-offline-meeting",
        title: {
          nl: "6.2 We gaan samen op pad naar een offline meeting",
          en: "6.2 Let's go to an offline meeting together",
        },
        description: {
          nl: "Hoe bereid je een offline meeting optimaal voor? Van het eerste contact tot de follow-up. We nemen je mee in het hele proces.",
          en: "How to optimally prepare an offline meeting? From first contact to follow-up. We take you through the entire process.",
        },
        durationSeconds: 245,
      },
      {
        slug: "6-3-online-meeting",
        title: {
          nl: "6.3 Hoe kom je zo goed mogelijk over bij een online meeting",
          en: "6.3 How to come across as well as possible in an online meeting",
        },
        description: {
          nl: "Hoe zorg je dat je online net zo goed overkomt als offline? Tips voor camera, geluid, achtergrond en presentatie.",
          en: "How to come across as well online as offline? Tips for camera, sound, background and presentation.",
        },
        durationSeconds: 290,
      },
      {
        slug: "6-4-algemene-tips-vorm",
        title: {
          nl: "6.4 Een aantal algemene tips voor een betere vorm",
          en: "6.4 General tips for better presentation",
        },
        description: {
          nl: "Een heel aantal algemene tips die je direct kunt toepassen om je vorm en presentatie te verbeteren.",
          en: "A range of general tips you can apply immediately to improve your form and presentation.",
        },
        durationSeconds: 307,
      },
      {
        slug: "6-5-samenvatting-module-6",
        title: {
          nl: "6.5 Samenvatting module 6 - Vorm",
          en: "6.5 Summary module 6 - Form",
        },
        description: {
          nl: "Samenvatting van de module Vorm en waar we naar hebben gekeken om je presentatie naar een hoger niveau te tillen.",
          en: "Summary of the Form module and what we looked at to elevate your presentation to a higher level.",
        },
        durationSeconds: 116,
      },
      {
        slug: "6-6-afsluiting",
        title: {
          nl: "Afsluiting: Oprecht & ontspannen naar duurzame klantrelaties",
          en: "Closing: Genuine & relaxed towards sustainable customer relationships",
        },
        description: {
          nl: "De laatste video van de training. Een samenvatting en motivatie om alles wat je hebt geleerd toe te passen in de praktijk.",
          en: "The final video of the training. A summary and motivation to apply everything you've learned in practice.",
        },
        durationSeconds: 172,
      },

      // ── Module 7: Bonus materiaal ──
      {
        slug: "bonus-deel-van-jezelf",
        title: {
          nl: "Bonus: Welk deel van jezelf selecteer jij in klantcontact?",
          en: "Bonus: Which part of yourself do you select in customer contact?",
        },
        description: {
          nl: "Een bonusles over zelfbewustzijn in klantcontact. Welk deel van jezelf activeer je wanneer je met een klant in gesprek bent?",
          en: "A bonus lesson on self-awareness in customer contact. Which part of yourself do you activate when talking to a customer?",
        },
        durationSeconds: 0,
      },
      {
        slug: "bonus-waar-sta-je-in-de-markt",
        title: {
          nl: "Bonus: Waar sta je in de markt?",
          en: "Bonus: Where do you stand in the market?",
        },
        description: {
          nl: "Een bonusles over positionering. Begrijp waar jij en je organisatie staan in de markt ten opzichte van de concurrentie.",
          en: "A bonus lesson on positioning. Understand where you and your organization stand in the market relative to competitors.",
        },
        durationSeconds: 0,
      },
    ];

    for (let i = 0; i < modules.length; i++) {
      await ctx.db.insert("trainingModules", {
        trainingId: cstId,
        slug: modules[i].slug,
        title: modules[i].title,
        description: modules[i].description,
        durationSeconds: modules[i].durationSeconds || undefined,
        sortOrder: i,
        discussionEnabled: true,
        quizRequired: false,
        active: true,
        createdAt: Date.now(),
      });
    }

    console.log(`CST Training seed voltooid: ${modules.length} modules aangemaakt.`);
  },
});
