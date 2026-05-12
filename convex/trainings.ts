import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./adminAuth";
import { checkTrainingAccess, requireTrainingAccess } from "./trainingProgress";

// ── Public queries ──

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const training = await ctx.db
      .query("trainings")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!training) return null;

    let thumbnailUrl: string | undefined;
    if (training.thumbnailStorageId) {
      thumbnailUrl = (await ctx.storage.getUrl(training.thumbnailStorageId)) ?? undefined;
    }

    let coverImageUrl: string | undefined;
    if (training.coverImageStorageId) {
      coverImageUrl = (await ctx.storage.getUrl(training.coverImageStorageId)) ?? undefined;
    }

    const hasAccess = await checkTrainingAccess(ctx, training._id);
    return { ...training, thumbnailUrl, coverImageUrl, hasAccess };
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const trainings = await ctx.db
      .query("trainings")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const resolved = await Promise.all(
      trainings.map(async (t) => {
        let thumbnailUrl: string | undefined;
        if (t.thumbnailStorageId) {
          thumbnailUrl = (await ctx.storage.getUrl(t.thumbnailStorageId)) ?? undefined;
        }
        return { ...t, thumbnailUrl };
      }),
    );
    return resolved.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getModulesForTraining = query({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    await requireTrainingAccess(ctx, trainingId);
    const modules = await ctx.db
      .query("trainingModules")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();
    // Resolve audioUrl so the audiobook overview can probe metadata for any
    // chapter that hasn't had its duration backfilled yet.
    return await Promise.all(
      modules.map(async (m) => {
        let audioUrl: string | undefined;
        if (m.audioStorageId) {
          audioUrl = (await ctx.storage.getUrl(m.audioStorageId)) ?? undefined;
        }
        return { ...m, audioUrl };
      }),
    );
  },
});

// ── Admin queries ──

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const trainings = await ctx.db.query("trainings").collect();
    const resolved = await Promise.all(
      trainings.map(async (t) => {
        let thumbnailUrl: string | undefined;
        if (t.thumbnailStorageId) {
          thumbnailUrl = (await ctx.storage.getUrl(t.thumbnailStorageId)) ?? undefined;
        }
        const modules = await ctx.db
          .query("trainingModules")
          .withIndex("by_training", (q) => q.eq("trainingId", t._id))
          .collect();
        return { ...t, thumbnailUrl, moduleCount: modules.length };
      }),
    );
    return resolved.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/** Admin: get all participants with progress for a training */
export const getParticipants = query({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    await requireAdmin(ctx);

    const training = await ctx.db.get(trainingId);
    if (!training) return [];

    // Find all access rights matching this training's slug or linkedProducts
    const allAccessRights = await ctx.db.query("accessRights").collect();
    const linked = training.linkedProducts ?? [];
    const matchSlugs = [
      training.slug,
      `${training.slug}-online`,
      `${training.slug}-coaching`,
      ...linked,
    ];

    const matchingRights = allAccessRights.filter(
      (r) => !r.revokedAt && matchSlugs.includes(r.resource),
    );

    // Deduplicate by userId
    const userIds = [...new Set(matchingRights.map((r) => r.userId))];

    // Get modules for this training
    const modules = await ctx.db
      .query("trainingModules")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();
    const activeModules = modules.filter((m) => m.active);

    // Build participant data
    const participants = [];
    for (const userId of userIds) {
      const user = await ctx.db.get(userId);
      if (!user) continue;

      // Get email from authAccounts
      const accounts = await ctx.db
        .query("authAccounts")
        .filter((q: any) => q.eq(q.field("userId"), userId))
        .collect();
      const emailAccount = accounts.find(
        (a: any) => a.providerAccountId?.includes("@"),
      );
      const email = emailAccount?.providerAccountId ?? (user as any).email ?? "";

      // Get module progress
      const progress = await ctx.db
        .query("moduleProgress")
        .withIndex("by_user_training", (q) =>
          q.eq("userId", userId).eq("trainingId", trainingId),
        )
        .collect();

      const completedCount = progress.filter((p) => p.completedAt).length;
      const overallPercent =
        activeModules.length > 0
          ? Math.round((completedCount / activeModules.length) * 100)
          : 0;

      const lastActivity = progress.length > 0
        ? Math.max(...progress.map((p) => p.lastAccessedAt))
        : undefined;

      // Get quiz scores for modules in this training
      const trainingQuizzes: Array<{ moduleId: Id<"trainingModules">; score: number; passed: boolean }> = [];
      for (const mod of modules) {
        const attempts = await ctx.db
          .query("quizAttempts")
          .withIndex("by_user_module", (q) =>
            q.eq("userId", userId).eq("moduleId", mod._id),
          )
          .collect();
        trainingQuizzes.push(...attempts);
      }

      // Per-module progress
      const moduleProgress = activeModules
        .filter((m) => !m.parentModuleId)
        .map((mod) => {
          // Submodules under this chapter
          const subs = activeModules.filter(
            (s) => s.parentModuleId === mod._id,
          );
          const relevantIds = subs.length > 0
            ? subs.map((s) => s._id)
            : [mod._id];
          const prog = progress.filter((p) =>
            relevantIds.includes(p.moduleId),
          );
          const done = prog.filter((p) => p.completedAt).length;
          const quizzes = trainingQuizzes.filter((a) => a.moduleId === mod._id);
          const bestQuiz = quizzes.length > 0
            ? quizzes.sort((x, y) => y.score - x.score)[0]
            : undefined;
          return {
            moduleId: mod._id,
            title: mod.title.nl,
            sortOrder: mod.sortOrder,
            completed: done,
            total: relevantIds.length,
            quizPassed: bestQuiz?.passed,
            quizScore: bestQuiz?.score,
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);

      // Access grant date
      const grant = matchingRights.find((r) => r.userId === userId);

      participants.push({
        userId,
        name: (user as any).name ?? `${email.split("@")[0]}`,
        email,
        overallPercent,
        completedModules: completedCount,
        totalModules: activeModules.length,
        lastActivity,
        grantedAt: grant?.grantedAt,
        moduleProgress,
      });
    }

    return participants.sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? ""),
    );
  },
});

// ── Admin mutations ──

export const createTraining = mutation({
  args: {
    slug: v.string(),
    type: v.optional(v.union(v.literal("training"), v.literal("audiobook"))),
    title: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    description: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("trainings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error(`Training met slug "${args.slug}" bestaat al.`);

    const all = await ctx.db.query("trainings").collect();
    const maxOrder = all.reduce((max, t) => Math.max(max, t.sortOrder), -1);

    return await ctx.db.insert("trainings", {
      ...args,
      sortOrder: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const updateTraining = mutation({
  args: {
    id: v.id("trainings"),
    slug: v.optional(v.string()),
    type: v.optional(v.union(v.literal("training"), v.literal("audiobook"))),
    title: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    description: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    linkedProducts: v.optional(v.array(v.string())),
    active: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(id);
    if (!training) throw new Error("Training niet gevonden.");

    const oldSlug = training.slug;
    const newSlug = updates.slug;

    if (newSlug && newSlug !== oldSlug) {
      const conflict = await ctx.db
        .query("trainings")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();
      if (conflict) throw new Error(`Slug "${newSlug}" is al in gebruik.`);
    }

    const patch: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }

    // Cascade slug change to accountCatalog items that reference the old slug
    if (newSlug && newSlug !== oldSlug) {
      const catalogs = await ctx.db.query("accountCatalog").collect();
      for (const catalog of catalogs) {
        const hasRef = catalog.items.some((item) => item.linkedTrainingSlug === oldSlug);
        if (hasRef) {
          await ctx.db.patch(catalog._id, {
            items: catalog.items.map((item) =>
              item.linkedTrainingSlug === oldSlug
                ? { ...item, linkedTrainingSlug: newSlug }
                : item
            ),
          });
        }
      }
    }
  },
});

export const deactivateTraining = mutation({
  args: { id: v.id("trainings") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { active: false });
  },
});

// ── File upload ──

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveThumbnail = mutation({
  args: {
    trainingId: v.id("trainings"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { trainingId, storageId }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(trainingId, { thumbnailStorageId: storageId });
  },
});

export const saveCoverImage = mutation({
  args: {
    trainingId: v.id("trainings"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { trainingId, storageId }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.coverImageStorageId) {
      await ctx.storage.delete(training.coverImageStorageId);
    }
    await ctx.db.patch(trainingId, { coverImageStorageId: storageId });
  },
});

export const removeCoverImage = mutation({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.coverImageStorageId) {
      await ctx.storage.delete(training.coverImageStorageId);
    }
    await ctx.db.patch(trainingId, { coverImageStorageId: undefined });
  },
});

export const removeThumbnail = mutation({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.thumbnailStorageId) {
      await ctx.storage.delete(training.thumbnailStorageId);
    }
    await ctx.db.patch(trainingId, { thumbnailStorageId: undefined });
  },
});

// ── Werkboek (training-level PDF with metadata, per language) ──

const workbookFieldByLang = {
  nl: "workbookNl",
  en: "workbookEn",
  de: "workbookDe",
} as const;

const langValidator = v.union(v.literal("nl"), v.literal("en"), v.literal("de"));

export const saveWorkbook = mutation({
  args: {
    trainingId: v.id("trainings"),
    lang: langValidator,
    storageId: v.id("_storage"),
    fileName: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    buttonLabel: v.optional(v.string()),
  },
  handler: async (ctx, { trainingId, lang, storageId, fileName, title, description, buttonLabel }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (!training) throw new Error("Training niet gevonden.");
    const field = workbookFieldByLang[lang];
    const existing = training[field];
    if (existing?.storageId) await ctx.storage.delete(existing.storageId);
    await ctx.db.patch(trainingId, {
      [field]: { storageId, fileName, title, description, buttonLabel },
    });
  },
});

export const updateWorkbookMeta = mutation({
  args: {
    trainingId: v.id("trainings"),
    lang: langValidator,
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    buttonLabel: v.optional(v.string()),
  },
  handler: async (ctx, { trainingId, lang, title, description, buttonLabel }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (!training) throw new Error("Training niet gevonden.");
    const field = workbookFieldByLang[lang];
    const existing = training[field];
    if (!existing) throw new Error(`Geen werkboek voor taal ${lang}.`);
    await ctx.db.patch(trainingId, {
      [field]: { ...existing, title, description, buttonLabel },
    });
  },
});

export const saveWorkbookImage = mutation({
  args: { trainingId: v.id("trainings"), storageId: v.id("_storage") },
  handler: async (ctx, { trainingId, storageId }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.workbookImageStorageId) await ctx.storage.delete(training.workbookImageStorageId);
    await ctx.db.patch(trainingId, { workbookImageStorageId: storageId });
  },
});

export const removeWorkbook = mutation({
  args: { trainingId: v.id("trainings"), lang: langValidator },
  handler: async (ctx, { trainingId, lang }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (!training) return;
    const field = workbookFieldByLang[lang];
    const existing = training[field];
    if (existing?.storageId) await ctx.storage.delete(existing.storageId);
    await ctx.db.patch(trainingId, { [field]: undefined });
  },
});

export const getWorkbookUrl = query({
  args: { trainingId: v.id("trainings"), lang: langValidator },
  handler: async (ctx, { trainingId, lang }) => {
    await requireTrainingAccess(ctx, trainingId);
    const training = await ctx.db.get(trainingId);
    if (!training) return null;
    const field = workbookFieldByLang[lang];
    const wb = training[field];
    // Fallback: if requested lang has no workbook, return NL version.
    const resolved = wb ?? training.workbookNl;
    if (!resolved) return null;
    const pdfUrl = await ctx.storage.getUrl(resolved.storageId);
    const imageUrl = training.workbookImageStorageId
      ? await ctx.storage.getUrl(training.workbookImageStorageId)
      : undefined;
    return {
      url: pdfUrl,
      fileName: resolved.fileName,
      title: resolved.title,
      description: resolved.description,
      buttonLabel: resolved.buttonLabel,
      imageUrl: imageUrl ?? undefined,
    };
  },
});
