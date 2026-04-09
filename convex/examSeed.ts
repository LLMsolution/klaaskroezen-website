/**
 * Seed the final "exam + feedback" lesson on both trainings.
 *
 *   npx convex run examSeed:seedExamLessons '{}'
 *
 * Finds the existing exam module (displayNumber = "8") and its single lesson,
 * rewrites the lesson title + description to the canonical Dutch text, and
 * upserts a lessonForm with all exam + feedback questions. Idempotent: running
 * it again overwrites the form fields but keeps existing submissions.
 */

import { internalMutation } from "./_generated/server";

type FieldType = "text" | "textarea" | "radio";

type ExamField = {
  id: string;
  type: FieldType;
  labelNl: string;
  required: boolean;
  optionsNl?: string[];
};

const EXAM_FIELDS: ExamField[] = [
  // Naam + e-mail weggelaten — die kennen we al uit het account van de cursist
  // (Klaas ziet ze bovenaan de e-mail + replyTo staat op de cursist).
  {
    id: "belangrijkste-lessen",
    type: "textarea",
    labelNl: "Wat zijn voor jou de belangrijkste lessen uit deze opleiding?",
    required: false,
  },
  {
    id: "vijf-elementen",
    type: "textarea",
    labelNl:
      "Noem de 5 elementen uit het Customer Experience Model. Hoe scoorde je jezelf per element voor de training? Hoe scoor je nu op elk element?",
    required: false,
  },
  {
    id: "oprecht-meeting",
    type: "textarea",
    labelNl:
      "Welke vraag kan je jezelf stellen voor een meeting om zeker te weten dat je zo oprecht mogelijk de meeting in gaat?",
    required: false,
  },
  {
    id: "voorbereiden",
    type: "textarea",
    labelNl:
      "Hoe belangrijk is voorbereiden? Hoe pak jij vanaf nu de voorbereiding aan voor een belangrijke meeting?",
    required: false,
  },
  {
    id: "te-laat",
    type: "textarea",
    labelNl:
      "Stel je komt 10 minuten te laat op een meeting. Dit weet je een uur van te voren. Wat doe je?",
    required: false,
  },
  {
    id: "korting",
    type: "textarea",
    labelNl: "Wat doe je als jouw klant vraagt om korting?",
    required: false,
  },
  {
    id: "meerwerk",
    type: "textarea",
    labelNl:
      "Stel je moet mogelijk meerwerk doen voor de klant waar ze nog niet voor betalen. Hoe ga je dit voortaan aanpakken?",
    required: false,
  },
  {
    id: "klant-begrijpen",
    type: "textarea",
    labelNl:
      "Welke vragen kan je stellen om zeker te weten dat je de klant volledig begrijpt?",
    required: false,
  },
  {
    id: "strategische-partnership",
    type: "textarea",
    labelNl: "Hoe bouw je een strategische partnership?",
    required: false,
  },
  {
    id: "spanning-ontspannen",
    type: "textarea",
    labelNl:
      "Wanneer de spanning rondom het resultaat toeneemt, wat kun je doen om ontspannen en oprecht te blijven?",
    required: false,
  },
  {
    id: "drie-doelen",
    type: "textarea",
    labelNl: "Welke 3 doelen heb je voor komende 9 maanden?",
    required: false,
  },
  {
    id: "concrete-acties",
    type: "textarea",
    labelNl:
      "Wat kan je nu concreet doen om deze doelen te realiseren? Welke kleine acties kan je in de komende 48 uur nemen?",
    required: false,
  },
  // Feedback over de training
  {
    id: "wat-goed",
    type: "textarea",
    labelNl: "Wat vind je goed van deze training? Wat moeten we zeker behouden?",
    required: false,
  },
  {
    id: "verbeteringen",
    type: "textarea",
    labelNl:
      "Heb je mogelijke verbeteringen of suggesties hoe we nog meer waarde kunnen leveren?",
    required: false,
  },
  {
    id: "review",
    type: "textarea",
    labelNl:
      "Wil je een review geven over deze online training? Zo ja, wil je die op Google (CXIA), de app store (CXIA) of hieronder achterlaten? Het mooiste is om deze te schrijven vanuit je uitdaging voor de training, de oplossing is de training en vervolgens het resultaat voor jou.",
    required: false,
  },
  {
    id: "review-publiceren",
    type: "radio",
    labelNl: "Mag de review op de website en socials geplaatst worden?",
    required: false,
    optionsNl: ["Ja", "Liever niet"],
  },
  {
    id: "aanbevelingen",
    type: "textarea",
    labelNl:
      "Heb jij collega's of vrienden die deze training ook zouden moeten doen? Zo ja, wie? Wil je hier verder over spreken met mij hoe dit mogelijk te maken?",
    required: false,
  },
  {
    id: "overig",
    type: "textarea",
    labelNl: "Wil je verder nog iets zeggen of aangeven aan mij?",
    required: false,
  },
];

const EXAM_DESCRIPTION_NL =
  "Je bent aan het einde van deze training gekomen. Super goed! Hieronder vind je eerst het examen en vervolgens een aantal vragen over de training zelf. Ik kijk het examen persoonlijk na en kom er binnen een week bij je op terug. Mocht je het daarnaast leuk vinden, dan stellen we het erg op prijs als je een review zou willen achterlaten.";

const TRAININGS = [
  {
    slug: "sales-excellence-training",
    lessonTitleNl: "Het examen en feedback Sales Excellence Training",
  },
  {
    slug: "customer-success-training",
    lessonTitleNl: "Het examen en feedback Customer Success Training",
  },
] as const;

export const seedExamLessons = internalMutation({
  args: {},
  handler: async (ctx) => {
    const result: Record<
      string,
      { updatedLesson: boolean; formUpsertedId: string | null; skipped: string[] }
    > = {};

    for (const t of TRAININGS) {
      const skipped: string[] = [];
      const training = await ctx.db
        .query("trainings")
        .withIndex("by_slug", (q) => q.eq("slug", t.slug))
        .first();
      if (!training) {
        result[t.slug] = { updatedLesson: false, formUpsertedId: null, skipped: ["training not found"] };
        continue;
      }

      // Find module 8 (the exam module) by displayNumber on this training.
      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", training._id))
        .collect();
      const examModule = modules.find(
        (m) => !m.parentModuleId && m.displayNumber === "8",
      );
      if (!examModule) {
        result[t.slug] = { updatedLesson: false, formUpsertedId: null, skipped: ["exam module (displayNumber=8) not found"] };
        continue;
      }

      // The exam module should have a single child lesson.
      const examLessons = modules.filter((m) => m.parentModuleId === examModule._id);
      let examLesson = examLessons[0];
      if (!examLesson) {
        // If no lesson exists yet under the exam module, create one.
        const newId = await ctx.db.insert("trainingModules", {
          trainingId: training._id,
          parentModuleId: examModule._id,
          slug: `${t.slug}-exam-${Date.now().toString(36)}`,
          title: { nl: t.lessonTitleNl, en: "", de: "" },
          description: { nl: EXAM_DESCRIPTION_NL, en: "", de: "" },
          sortOrder: 0,
          discussionEnabled: false,
          quizRequired: true,
          active: true,
          createdAt: Date.now(),
        });
        const fresh = await ctx.db.get(newId);
        if (!fresh) {
          result[t.slug] = { updatedLesson: false, formUpsertedId: null, skipped: ["failed to create exam lesson"] };
          continue;
        }
        examLesson = fresh;
      } else {
        // Patch existing lesson.
        await ctx.db.patch(examLesson._id, {
          title: { nl: t.lessonTitleNl, en: "", de: "" },
          description: { nl: EXAM_DESCRIPTION_NL, en: "", de: "" },
          quizRequired: true,
          active: true,
        });
      }

      // Build the form field payload.
      const formFields = EXAM_FIELDS.map((f) => ({
        id: f.id,
        type: f.type,
        label: { nl: f.labelNl, en: "", de: "" },
        required: f.required,
        options: f.optionsNl
          ? f.optionsNl.map((o) => ({ nl: o, en: "", de: "" }))
          : undefined,
      }));

      // Upsert the lessonForm for the exam lesson.
      const existingForm = await ctx.db
        .query("lessonForms")
        .withIndex("by_module", (q) => q.eq("moduleId", examLesson._id))
        .first();
      const now = Date.now();
      let formId: string;
      if (existingForm) {
        await ctx.db.patch(existingForm._id, {
          recipientEmail: "klaas@klaaskroezen.com",
          introText: {
            nl: "Vul het examen en de feedback hieronder in. Ik kijk het persoonlijk na.",
            en: "",
            de: "",
          },
          submitLabel: { nl: "Versturen", en: "Submit", de: "Absenden" },
          fields: formFields,
          active: true,
          updatedAt: now,
        });
        formId = existingForm._id;
      } else {
        formId = await ctx.db.insert("lessonForms", {
          moduleId: examLesson._id,
          recipientEmail: "klaas@klaaskroezen.com",
          introText: {
            nl: "Vul het examen en de feedback hieronder in. Ik kijk het persoonlijk na.",
            en: "",
            de: "",
          },
          submitLabel: { nl: "Versturen", en: "Submit", de: "Absenden" },
          fields: formFields,
          active: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      result[t.slug] = { updatedLesson: true, formUpsertedId: formId, skipped };
    }

    return result;
  },
});
