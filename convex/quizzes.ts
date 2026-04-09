import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { requireTrainingAccess } from "./trainingProgress";

// ── Helper: resolve module → training access ──

async function requireModuleAccess(
  ctx: QueryCtx | MutationCtx,
  moduleId: Id<"trainingModules">,
) {
  const mod = await ctx.db.get(moduleId);
  if (!mod) throw new Error("Module niet gevonden.");
  const { userId } = await requireTrainingAccess(ctx, mod.trainingId);
  return { userId, mod };
}

// ── Public queries (access-gated) ──

export const getForModule = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    await requireModuleAccess(ctx, moduleId);

    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .first();
    if (!quiz || !quiz.active) return null;

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();

    // Strip correct answers from client response
    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      sortOrder: q.sortOrder,
      type: q.type,
      question: q.question,
      options: q.options?.map((o) => ({ text: o.text })),
      scaleMin: q.scaleMin,
      scaleMax: q.scaleMax,
      scaleLabels: q.scaleLabels,
    }));

    return {
      _id: quiz._id,
      passingScore: quiz.passingScore,
      questions: safeQuestions,
    };
  },
});

export const getMyAttempts = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    const { userId } = await requireModuleAccess(ctx, moduleId);

    return await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_module", (q) => q.eq("userId", userId).eq("moduleId", moduleId))
      .order("desc")
      .collect();
  },
});

// ── Public mutations (access-gated) ──

export const submitAttempt = mutation({
  args: {
    quizId: v.id("quizzes"),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        answer: v.string(), // JSON-encoded
      }),
    ),
  },
  handler: async (ctx, { quizId, answers }) => {
    const quiz = await ctx.db.get(quizId);
    if (!quiz) throw new Error("Quiz niet gevonden.");

    const { userId } = await requireModuleAccess(ctx, quiz.moduleId);

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
      .collect();

    // Score: only gradable types count (multiple_choice, multiple_select)
    const gradable = questions.filter(
      (q) => q.type === "multiple_choice" || q.type === "multiple_select",
    );
    let correctCount = 0;

    const scoredAnswers = answers.map((a) => {
      const question = questions.find((q) => q._id === a.questionId);
      if (!question) return { ...a, correct: false };

      if (question.type === "multiple_choice") {
        const correctOption = question.options?.findIndex((o) => o.correct);
        const isCorrect = parseInt(a.answer) === correctOption;
        if (isCorrect) correctCount++;
        return { ...a, correct: isCorrect };
      }

      if (question.type === "multiple_select") {
        let parsed: unknown;
        try { parsed = JSON.parse(a.answer); } catch { return { ...a, correct: false }; }
        if (!Array.isArray(parsed) || !parsed.every((s) => typeof s === "number")) {
          return { ...a, correct: false };
        }
        const selected = parsed as number[];
        const correctIndices = question.options
          ?.map((o, i) => (o.correct ? i : -1))
          .filter((i) => i >= 0) ?? [];
        const isCorrect =
          selected.length === correctIndices.length &&
          selected.every((s) => correctIndices.includes(s));
        if (isCorrect) correctCount++;
        return { ...a, correct: isCorrect };
      }

      // open and scale: not auto-graded
      return { ...a, correct: undefined };
    });

    const score =
      gradable.length > 0
        ? Math.round((correctCount / gradable.length) * 100)
        : 100;
    const passed = score >= quiz.passingScore;

    const attemptId = await ctx.db.insert("quizAttempts", {
      userId,
      quizId,
      moduleId: quiz.moduleId,
      score,
      passed,
      answers: scoredAnswers,
      createdAt: Date.now(),
    });

    // Update module progress if passed
    if (passed) {
      const existing = await ctx.db
        .query("moduleProgress")
        .withIndex("by_user_training", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("moduleId"), quiz.moduleId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { quizPassed: true });
      }

      // Check if this was the final required quiz for the training.
      // If so, record completion and fire the celebration email exactly once.
      const mod = await ctx.db.get(quiz.moduleId);
      if (mod) {
        const trainingId = mod.trainingId;
        const allModules = await ctx.db
          .query("trainingModules")
          .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
          .collect();
        const required = allModules.filter((m) => m.active && m.quizRequired);
        if (required.length > 0) {
          const progressRows = await ctx.db
            .query("moduleProgress")
            .withIndex("by_user_training", (q) =>
              q.eq("userId", userId).eq("trainingId", trainingId),
            )
            .collect();
          const passedIds = new Set(
            progressRows.filter((p) => p.quizPassed).map((p) => p.moduleId),
          );
          // The just-passed module may not be in progressRows yet if moduleProgress
          // was never initialised; treat the current module as passed too.
          passedIds.add(quiz.moduleId);
          const allPassed = required.every((m) => passedIds.has(m._id));

          if (allPassed) {
            const already = await ctx.db
              .query("trainingCompletions")
              .withIndex("by_user_training", (q) =>
                q.eq("userId", userId).eq("trainingId", trainingId),
              )
              .first();
            if (!already) {
              await ctx.db.insert("trainingCompletions", {
                userId,
                trainingId,
                completedAt: Date.now(),
              });
              // Schedule the email action (mutations can't invoke actions directly)
              await ctx.scheduler.runAfter(
                0,
                internal.emails.sendTrainingCompletionEmail,
                { userId, trainingId },
              );
            }
          }
        }
      }
    }

    return { attemptId, score, passed };
  },
});

// ── Admin queries ──

export const getFullQuiz = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    await requireAdmin(ctx);
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .first();
    if (!quiz) return null;

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();

    return { ...quiz, questions };
  },
});

// ── Admin mutations ──

export const createQuiz = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    passingScore: v.number(),
  },
  handler: async (ctx, { moduleId, passingScore }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("quizzes")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .first();
    if (existing) throw new Error("Deze module heeft al een quiz.");

    return await ctx.db.insert("quizzes", {
      moduleId,
      passingScore,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const updateQuiz = mutation({
  args: {
    id: v.id("quizzes"),
    passingScore: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

export const addQuestion = mutation({
  args: {
    quizId: v.id("quizzes"),
    type: v.union(
      v.literal("multiple_choice"),
      v.literal("multiple_select"),
      v.literal("open"),
      v.literal("scale"),
    ),
    question: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    options: v.optional(
      v.array(
        v.object({
          text: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
          correct: v.boolean(),
        }),
      ),
    ),
    scaleMin: v.optional(v.number()),
    scaleMax: v.optional(v.number()),
    scaleLabels: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
    const maxOrder = questions.reduce((max, q) => Math.max(max, q.sortOrder), -1);

    return await ctx.db.insert("quizQuestions", {
      ...args,
      sortOrder: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const updateQuestion = mutation({
  args: {
    id: v.id("quizQuestions"),
    question: v.optional(v.object({ nl: v.string(), en: v.string() })),
    options: v.optional(
      v.array(
        v.object({
          text: v.object({ nl: v.string(), en: v.string() }),
          correct: v.boolean(),
        }),
      ),
    ),
    scaleMin: v.optional(v.number()),
    scaleMax: v.optional(v.number()),
    scaleLabels: v.optional(v.object({ nl: v.string(), en: v.string() })),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

export const removeQuestion = mutation({
  args: { id: v.id("quizQuestions") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
