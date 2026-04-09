/**
 * One-off patch for the Module 4 + 5 lesson descriptions on both the
 * Sales Excellence Training and Customer Success Training.
 *
 * Run:
 *   npx convex run trainingContentPatch:patchModule4And5 '{}'
 *
 * This only updates Dutch titles + descriptions — English/German remain empty
 * and can be filled via the admin editor's DeepL button per field.
 */

import { internalMutation } from "./_generated/server";

type LessonPatch = {
  displayNumber: string;
  titleNl?: string;
  descriptionNl: string;
};

const MODULE_4: LessonPatch[] = [
  {
    displayNumber: "4.1",
    titleNl: "Voorbereiding is het halve werk",
    descriptionNl:
      "In deze video leer je hoe goede voorbereiding het verschil maakt bij klantgesprekken. Wat weet je al? Wat wil je weten? Wat is je doel?",
  },
  {
    displayNumber: "4.2",
    titleNl: "Zonder vertrouwen, geen probleem",
    descriptionNl:
      "In deze video gaan we aan de slag met vertrouwen als fundament. Klanten werken alleen écht samen met mensen die ze vertrouwen.",
  },
  {
    displayNumber: "4.3",
    titleNl: "ADA & LSD gespreksvaardigheden",
    descriptionNl:
      "In deze video worden de gespreksvaardigheden ADA (Aandacht, Diepgang, Actie) en LSD (Luisteren, Samenvatten, Doorvragen) opnieuw behandeld.",
  },
  {
    displayNumber: "4.4",
    titleNl: "In de teaching zit de sales & storytelling",
    descriptionNl:
      "In deze video leer je hoe storytelling en teaching je klant helpen en jou als expert positioneren.",
  },
  {
    displayNumber: "4.5",
    titleNl: "Hoe ga je om met verschillende klanttypes?",
    descriptionNl:
      "In deze video leer je hoe je de vier klanttypes herkent en je gesprek daarop aanpast.",
  },
  {
    displayNumber: "4.6",
    titleNl: "Ga eerlijk dieper in het gesprek",
    descriptionNl:
      "In deze video leer je hoe je met eerlijke, diepgaande vragen meer begrijpt van wat er echt speelt bij de klant.",
  },
  {
    displayNumber: "4.7",
    titleNl: "De impact van prijzen op winst",
    descriptionNl:
      "In deze video leer je hoe je professioneel omgaat met prijsdiscussies.",
  },
  {
    displayNumber: "4.8",
    titleNl: "Strategische partnerships",
    descriptionNl:
      "In deze video leer je hoe je uitgroeit van leverancier naar strategisch partner.",
  },
  {
    displayNumber: "4.9",
    titleNl: "Professioneel onderhandelen",
    descriptionNl:
      "In deze video gaan we aan de slag met professioneel onderhandelen. Je leert altijd te werken vanuit drie varianten: de meest gewenste uitkomst, de gewenste uitkomst en de minimaal gewenste uitkomst. Zo kun je ontspannen onderhandelen.",
  },
  {
    displayNumber: "4.10",
    titleNl: "Korte samenvatting module 4",
    descriptionNl:
      "Korte samenvatting van de betrouwbare adviseur: inhoud, vertrouwen, gespreksvaardigheden, storytelling, klanttypes, dieper doorvragen, prijsbeleid, partnerships en onderhandelen.",
  },
];

const MODULE_5: LessonPatch[] = [
  {
    displayNumber: "5.1",
    titleNl: "Een klant mag nooit een vraag hebben",
    descriptionNl:
      "In deze video gaan we aan de slag met proces. Het proces is ontzettend belangrijk om oprecht en ontspannen klanten te helpen. Twee basale principes: je wil dat de klant nooit een vraag heeft (proactief zijn) en dat informatie niet alleen in jouw hoofd zit (documenteer alles).",
  },
  {
    displayNumber: "5.2",
    titleNl: "Het Customer Success Plan — hoe je in de lead bent naar je klant",
    descriptionNl:
      "In deze video gaan we aan de slag met het Customer Success Plan. Het plan zorgt ervoor dat jij in de lead bent. Het omvat: doelstellingen met KPI's, een jaarplan met vaste ritme-meetings, rolduidelijkheid, een escalatieproces, en klanttevredenheidsmetingen.",
  },
  {
    displayNumber: "5.3",
    titleNl: "De Gouden driehoek — hoe betrek je de interne organisatie",
    descriptionNl:
      "In deze video gaan we aan de slag met de Gouden Driehoek: directeur/ondernemer, Customer Success Manager/Account Manager en specialist. Door alle drie samen te betrekken bij klantcontact voorkom je intern gedoe en maak je de klant optimaal blij.",
  },
  {
    displayNumber: "5.4",
    titleNl: "Het IJzer smeden wanneer het heet is",
    descriptionNl:
      "In deze video gaan we aan de slag met ijzersmeden wanneer het heet is. In dealmaking-fases wil je snelheid maken. Direct reageren, ad hoc schakelen en zorgen dat de vertraging nooit bij jouw organisatie ligt.",
  },
  {
    displayNumber: "5.5",
    titleNl: "Hoe blijf je continu leren en verbeteren",
    descriptionNl:
      "In deze video leer je hoe je direct na een meeting de feedback loop goed hebt. Door met je team kort na te bespreken wat goed ging en wat beter kon, gebruik je het Customer Experience Model om continu te groeien.",
  },
  {
    displayNumber: "5.6",
    titleNl: "Hoe verkoop je meer aan bestaande klanten — Upsell en cross-sell",
    descriptionNl:
      "In deze video gaan we aan de slag met hoe je meer aan bestaande klanten verkoopt. Met het Upsell & Cross-sell model maak je een tabel van welke klanten welke producten hebben, zodat je gericht kansen kunt benutten.",
  },
  {
    displayNumber: "5.7",
    titleNl: "Hoe voorkom je het tsunami effect — de golfbeweging in omzet",
    descriptionNl:
      "In deze video gaan we aan de slag met het tsunami-effect: de golfbeweging van heel druk naar helemaal niets. Door het aantal afspraken als KPI bij te houden (op weekbasis, met het hele team) zorg je voor een gestage, geleidelijke groei.",
  },
  {
    displayNumber: "5.8",
    titleNl: "Korte samenvatting van module 5",
    descriptionNl:
      "In deze video de samenvatting van de module Proces. De zeven punten: klant mag nooit een vraag hebben, Customer Success Plan, Gouden Driehoek, IJzer smeden wanneer het heet is, feedback direct verwerken, upsell & cross-sell en het tsunami-effect voorkomen.",
  },
];

const MODULE_6: LessonPatch[] = [
  {
    displayNumber: "6.1",
    titleNl: "Vorm is alles wat de klant daadwerkelijk ziet",
    descriptionNl:
      "In deze module gaan we aan de slag met vorm: alles wat de klant letterlijk ziet, zowel offline als online. Dit omvat je kleding, presentaties, e-mails, offertes en facturen. Alles moet representatief en passend bij de klant zijn.",
  },
  {
    displayNumber: "6.2",
    titleNl: "We gaan samen op pad naar een offline meeting",
    descriptionNl:
      "In deze video leer je hoe je een offline meeting ontspannen aanpakt: van een nette auto, op tijd komen, communiceren bij vertraging, tot de juiste houding bij de eerste ontmoeting (blijf staan, geen drank aannemen, tas in linkerhand).",
  },
  {
    displayNumber: "6.3",
    titleNl: "Hoe kom je zo goed mogelijk over bij een online meeting",
    descriptionNl:
      "In deze video leer je hoe je online meetings professioneel aanpakt. Vier aandachtspunten: professionele belichting, camera op ooghoogte, nette achtergrond en goede audio. Zo kom je altijd strak en professioneel over.",
  },
  {
    displayNumber: "6.4",
    titleNl: "Een aantal algemene tips voor een betere vorm",
    descriptionNl:
      "In deze video leer je algemene tips om beter over te komen: formeel vs. informeel taalgebruik, enthousiasme uitstralen, het verschil tussen functioneel en emotioneel contact, en een actieve lichaamshouding bij de klant.",
  },
  {
    displayNumber: "6.5",
    titleNl: "Korte samenvatting module 6 Vorm",
    descriptionNl:
      "In deze video de samenvatting van vorm: alle veelvoorkomende fouten offline en online, de praktische tips over enthousiasme en mensgerichtheid, en de opdrachten in het werkboek.",
  },
];

const PATCH_SET: LessonPatch[] = [...MODULE_4, ...MODULE_5, ...MODULE_6];
const TRAINING_SLUGS = ["sales-excellence-training", "customer-success-training"] as const;

export const patchModule4And5 = internalMutation({
  args: {},
  handler: async (ctx) => {
    const result: Record<string, { patched: number; skipped: string[] }> = {};

    for (const slug of TRAINING_SLUGS) {
      const training = await ctx.db
        .query("trainings")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!training) {
        result[slug] = { patched: 0, skipped: ["training not found"] };
        continue;
      }

      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", training._id))
        .collect();

      // Index lessons by their displayNumber for O(1) lookup.
      const byDisplay = new Map<string, (typeof modules)[number]>();
      for (const m of modules) {
        if (m.displayNumber) byDisplay.set(m.displayNumber, m);
      }

      let patched = 0;
      const skipped: string[] = [];
      for (const p of PATCH_SET) {
        const lesson = byDisplay.get(p.displayNumber);
        if (!lesson) {
          skipped.push(p.displayNumber);
          continue;
        }
        const nextTitle = {
          nl: p.titleNl ?? lesson.title.nl,
          en: lesson.title.en ?? "",
          de: lesson.title.de,
        };
        const nextDescription = {
          nl: p.descriptionNl,
          en: lesson.description.en ?? "",
          de: lesson.description.de,
        };
        await ctx.db.patch(lesson._id, {
          title: nextTitle,
          description: nextDescription,
        });
        patched += 1;
      }

      result[slug] = { patched, skipped };
    }

    return result;
  },
});
