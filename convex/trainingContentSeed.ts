/**
 * Seed the Sales Excellence Training and Customer Success Training with
 * identical module + lesson structure and Vimeo video IDs.
 *
 * Both trainings share the exact same content — only the training name
 * differs. Vimeo IDs are matched to the outline numbering by video duration
 * (the raw Vimeo labels were inconsistent in Modules 1, 3, and 4).
 *
 * Usage (idempotent-ish, destructive on force):
 *   npx convex run trainingContentSeed:seedBothTrainings '{}'
 *   npx convex run trainingContentSeed:seedBothTrainings '{"force":true}'
 *
 * Without force: throws if any modules already exist for either training.
 * With force: deletes existing modules (and their quizzes + progress rows)
 * before reinserting.
 */

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/* ─── Seed data ─── */

type LessonSeed = {
  displayNumber?: string;
  titleNl: string;
  vimeoVideoId?: string;
  durationSeconds?: number;
  quizRequired?: boolean;
};

type ModuleSeed = {
  displayNumber: string;
  titleNl: string;
  lessons: LessonSeed[];
};

const MODULES: ModuleSeed[] = [
  {
    displayNumber: "1",
    titleNl: "Ontdek jouw potentieel",
    lessons: [
      { titleNl: "Welkom — start met het intakeformulier voor het beste resultaat" },
      { displayNumber: "1.1", titleNl: "Introductie training", vimeoVideoId: "1178540137", durationSeconds: 232 },
      { displayNumber: "1.2", titleNl: "Hoe haal je het maximale uit deze training", vimeoVideoId: "1180578433", durationSeconds: 158 },
      { displayNumber: "1.3", titleNl: "Voorstellen en hoe ben ik tot deze training gekomen", vimeoVideoId: "1178540211", durationSeconds: 161 },
      { displayNumber: "1.4", titleNl: "Het Customer Experience Model — de kern", vimeoVideoId: "1178540311", durationSeconds: 493 },
      { displayNumber: "1.5", titleNl: "De Customer Experience Funnel", vimeoVideoId: "1178540537", durationSeconds: 322 },
      { displayNumber: "1.6", titleNl: "De business champions league", vimeoVideoId: "1180578348", durationSeconds: 248 },
      { displayNumber: "1.7", titleNl: "Hoe ga je aan de slag met je werkboek", vimeoVideoId: "1180578499", durationSeconds: 179 },
    ],
  },
  {
    displayNumber: "2",
    titleNl: "Oprecht & Ontspannen naar duurzame klantrelaties",
    lessons: [
      { displayNumber: "2.1", titleNl: "Focus op het proces voor maximaal resultaat", vimeoVideoId: "1180578566", durationSeconds: 314 },
      { displayNumber: "2.2", titleNl: "De impact van echt contact maken", vimeoVideoId: "1180578781", durationSeconds: 216 },
      { displayNumber: "2.3", titleNl: "Voorbereiden om maximaal te presteren", vimeoVideoId: "1180578878", durationSeconds: 284 },
      { displayNumber: "2.4", titleNl: "Korte samenvatting module 2", vimeoVideoId: "1180579060", durationSeconds: 69 },
    ],
  },
  {
    displayNumber: "3",
    titleNl: "Versterk jezelf met krachtige overtuigingen",
    lessons: [
      { displayNumber: "3.1", titleNl: "De impact van overtuigingen op oprecht & ontspannen je klanten helpen", vimeoVideoId: "1180579094", durationSeconds: 426 },
      { displayNumber: "3.2", titleNl: "De top 20 overtuigingen — de eerste 10", vimeoVideoId: "1180579441", durationSeconds: 1659 },
      { displayNumber: "3.3", titleNl: "De top 20 overtuigingen — de tweede 10", vimeoVideoId: "1180580461", durationSeconds: 1679 },
      { displayNumber: "3.4", titleNl: "Korte samenvatting module 3", vimeoVideoId: "1180581636", durationSeconds: 95 },
    ],
  },
  {
    displayNumber: "4",
    titleNl: "Word de betrouwbare adviseur — inhoud",
    lessons: [
      { displayNumber: "4.1", titleNl: "Voorbereiding is het halve werk", vimeoVideoId: "1180581684", durationSeconds: 135 },
      { displayNumber: "4.2", titleNl: "Zonder vertrouwen, geen probleem", vimeoVideoId: "1180581754", durationSeconds: 216 },
      { displayNumber: "4.3", titleNl: "ADA & LSD gespreksvaardigheden", vimeoVideoId: "1180581898", durationSeconds: 166 },
      { displayNumber: "4.4", titleNl: "In de teaching zit de sales & storytelling", vimeoVideoId: "1180581993", durationSeconds: 169 },
      { displayNumber: "4.5", titleNl: "Hoe ga je om met verschillende persoonlijkheidstypes", vimeoVideoId: "1180582081", durationSeconds: 386 },
      { displayNumber: "4.6", titleNl: "Hoe ga je om met een probleem met de klant — ga een laag dieper", vimeoVideoId: "1180582729", durationSeconds: 237 },
      { displayNumber: "4.7", titleNl: "De impact van prijsverhoging of korting op de winst", vimeoVideoId: "1180582372", durationSeconds: 291 },
      { displayNumber: "4.8", titleNl: "Een strategische samenwerking verder uitbouwen", vimeoVideoId: "1180582598", durationSeconds: 223 },
      { displayNumber: "4.9", titleNl: "Professioneel onderhandelen", vimeoVideoId: "1180582864", durationSeconds: 422 },
      { displayNumber: "4.10", titleNl: "Korte samenvatting module 4", vimeoVideoId: "1180583279", durationSeconds: 245 },
    ],
  },
  {
    displayNumber: "5",
    titleNl: "Optimaliseer je proces voor betere resultaten",
    lessons: [
      { displayNumber: "5.1", titleNl: "Een klant mag nooit een vraag hebben", vimeoVideoId: "1180583437", durationSeconds: 281 },
      { displayNumber: "5.2", titleNl: "Het Customer Success Plan — hoe je in de lead bent naar je klant", vimeoVideoId: "1180583643", durationSeconds: 593 },
      { displayNumber: "5.3", titleNl: "De Gouden driehoek — hoe betrek je de interne organisatie", vimeoVideoId: "1180584062", durationSeconds: 312 },
      { displayNumber: "5.4", titleNl: "Het ijzer smeden wanneer het heet is", vimeoVideoId: "1180584255", durationSeconds: 165 },
      { displayNumber: "5.5", titleNl: "Hoe blijf je continu leren en verbeteren", vimeoVideoId: "1180584323", durationSeconds: 135 },
      { displayNumber: "5.6", titleNl: "Hoe verkoop je meer aan bestaande klanten — upsell en cross-sell", vimeoVideoId: "1180584363", durationSeconds: 311 },
      { displayNumber: "5.7", titleNl: "Hoe voorkom je het tsunami-effect — de golfbeweging in omzet", vimeoVideoId: "1180584572", durationSeconds: 395 },
      { displayNumber: "5.8", titleNl: "Korte samenvatting van module 5", vimeoVideoId: "1180584931", durationSeconds: 187 },
    ],
  },
  {
    displayNumber: "6",
    titleNl: "Vorm — presentatie voor betere resultaten",
    lessons: [
      { displayNumber: "6.1", titleNl: "Vorm is alles wat de klant daadwerkelijk ziet", vimeoVideoId: "1180585019", durationSeconds: 254 },
      { displayNumber: "6.2", titleNl: "We gaan samen op pad naar een offline meeting", vimeoVideoId: "1180585157", durationSeconds: 245 },
      { displayNumber: "6.3", titleNl: "Hoe kom je zo goed mogelijk over bij een online meeting", vimeoVideoId: "1180585265", durationSeconds: 290 },
      { displayNumber: "6.4", titleNl: "Een aantal algemene tips voor een betere vorm", vimeoVideoId: "1180585439", durationSeconds: 307 },
      { displayNumber: "6.5", titleNl: "Korte samenvatting module 6 Vorm", vimeoVideoId: "1180585588", durationSeconds: 116 },
      { displayNumber: "eind", titleNl: "De laatste video: oprecht & ontspannen naar duurzame klantrelaties", vimeoVideoId: "1180585637", durationSeconds: 172 },
    ],
  },
  {
    displayNumber: "7",
    titleNl: "Bonusmateriaal",
    lessons: [
      { titleNl: "Welke deel van jezelf selecteer jij wanneer je in contact bent met de klant?" },
      { titleNl: "Waar sta je in de markt?" },
    ],
  },
  {
    displayNumber: "8",
    titleNl: "Examen",
    lessons: [
      { titleNl: "Doe nu het examen en geef feedback", quizRequired: true },
    ],
  },
];

/* ─── Seeder ─── */

const TRAINING_SLUGS = [
  "sales-excellence-training",
  "customer-success-training",
] as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const seedBothTrainings = internalMutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const result: Record<string, { modulesCreated: number; lessonsCreated: number; wiped: number }> = {};

    for (const slug of TRAINING_SLUGS) {
      const training = await ctx.db
        .query("trainings")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (!training) {
        throw new Error(
          `Training "${slug}" niet gevonden. Maak hem eerst aan via admin.`,
        );
      }

      // Existing modules for this training
      const existing = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", training._id))
        .collect();

      let wipedCount = 0;
      if (existing.length > 0) {
        if (!force) {
          throw new Error(
            `Training "${slug}" heeft al ${existing.length} modules. Gebruik {"force":true} om ze te vervangen.`,
          );
        }
        // Delete modules + their quizzes + question rows + progress rows.
        for (const m of existing) {
          // quizzes → questions
          const quizzes = await ctx.db
            .query("quizzes")
            .withIndex("by_module", (q) => q.eq("moduleId", m._id))
            .collect();
          for (const qz of quizzes) {
            const questions = await ctx.db
              .query("quizQuestions")
              .withIndex("by_quiz", (q) => q.eq("quizId", qz._id))
              .collect();
            for (const qq of questions) await ctx.db.delete(qq._id);
            await ctx.db.delete(qz._id);
          }
          // module progress
          const progressRows = await ctx.db
            .query("moduleProgress")
            .withIndex("by_module", (q) => q.eq("moduleId", m._id))
            .collect();
          for (const p of progressRows) await ctx.db.delete(p._id);

          await ctx.db.delete(m._id);
          wipedCount += 1;
        }
      }

      // Insert modules + lessons
      let modulesCreated = 0;
      let lessonsCreated = 0;
      const now = Date.now();

      for (let mi = 0; mi < MODULES.length; mi++) {
        const mod = MODULES[mi];
        const modSlug = `${slug}-m${mod.displayNumber}`;
        const modId = await ctx.db.insert("trainingModules", {
          trainingId: training._id,
          slug: modSlug,
          title: { nl: mod.titleNl, en: "", de: "" },
          description: { nl: "", en: "", de: "" },
          sortOrder: mi,
          displayNumber: mod.displayNumber,
          discussionEnabled: false,
          quizRequired: false,
          active: true,
          createdAt: now,
        });
        modulesCreated += 1;

        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          const lessonSlugBase = lesson.displayNumber
            ? lesson.displayNumber.replace(/\./g, "-")
            : `${mi}-${li}`;
          const lessonSlug = `${slug}-${lessonSlugBase}-${slugify(lesson.titleNl).slice(0, 40)}`;
          await ctx.db.insert("trainingModules", {
            trainingId: training._id,
            parentModuleId: modId,
            slug: lessonSlug,
            title: { nl: lesson.titleNl, en: "", de: "" },
            description: { nl: "", en: "", de: "" },
            sortOrder: li,
            displayNumber: lesson.displayNumber,
            vimeoVideoId: lesson.vimeoVideoId,
            durationSeconds: lesson.durationSeconds,
            discussionEnabled: false,
            quizRequired: lesson.quizRequired ?? false,
            active: true,
            createdAt: now,
          });
          lessonsCreated += 1;
        }
      }

      result[slug] = { modulesCreated, lessonsCreated, wiped: wipedCount };
    }

    return result;
  },
});
