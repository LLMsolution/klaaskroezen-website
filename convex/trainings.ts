import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
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
    return await ctx.db
      .query("trainingModules")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();
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

// ── Admin mutations ──

export const createTraining = mutation({
  args: {
    slug: v.string(),
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

    if (updates.slug && updates.slug !== training.slug) {
      const conflict = await ctx.db
        .query("trainings")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();
      if (conflict) throw new Error(`Slug "${updates.slug}" is al in gebruik.`);
    }

    const patch: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
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

// ── Certificate upload ──

export const saveCertificate = mutation({
  args: {
    trainingId: v.id("trainings"),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, { trainingId, storageId, fileName }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.certificateStorageId) {
      await ctx.storage.delete(training.certificateStorageId);
    }
    await ctx.db.patch(trainingId, { certificateStorageId: storageId, certificateFileName: fileName });
  },
});

export const removeCertificate = mutation({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.certificateStorageId) {
      await ctx.storage.delete(training.certificateStorageId);
    }
    await ctx.db.patch(trainingId, { certificateStorageId: undefined, certificateFileName: undefined });
  },
});

// ── Werkboek (training-level PDF with metadata) ──

export const saveWorkbook = mutation({
  args: {
    trainingId: v.id("trainings"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { trainingId, storageId, fileName, title, description }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.workbookStorageId) await ctx.storage.delete(training.workbookStorageId);
    await ctx.db.patch(trainingId, {
      workbookStorageId: storageId,
      workbookFileName: fileName,
      workbookTitle: title,
      workbookDescription: description,
    });
  },
});

export const updateWorkbookMeta = mutation({
  args: {
    trainingId: v.id("trainings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { trainingId, title, description }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(trainingId, { workbookTitle: title, workbookDescription: description });
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
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    await requireAdmin(ctx);
    const training = await ctx.db.get(trainingId);
    if (training?.workbookStorageId) await ctx.storage.delete(training.workbookStorageId);
    if (training?.workbookImageStorageId) await ctx.storage.delete(training.workbookImageStorageId);
    await ctx.db.patch(trainingId, {
      workbookStorageId: undefined, workbookFileName: undefined,
      workbookTitle: undefined, workbookDescription: undefined,
      workbookImageStorageId: undefined,
    });
  },
});

export const getWorkbookUrl = query({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    await requireTrainingAccess(ctx, trainingId);
    const training = await ctx.db.get(trainingId);
    if (!training?.workbookStorageId) return null;
    const pdfUrl = await ctx.storage.getUrl(training.workbookStorageId);
    const imageUrl = training.workbookImageStorageId
      ? await ctx.storage.getUrl(training.workbookImageStorageId)
      : undefined;
    return {
      url: pdfUrl,
      fileName: training.workbookFileName,
      title: training.workbookTitle,
      description: training.workbookDescription,
      imageUrl: imageUrl ?? undefined,
    };
  },
});

/** Get certificate download URL — requires access + all quizzes passed */
export const getCertificateUrl = query({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    const { userId } = await requireTrainingAccess(ctx, trainingId);

    // Verify all required quizzes are passed (server-side enforcement)
    const quizModules = await ctx.db
      .query("trainingModules")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();
    const requiredModules = quizModules.filter((m) => m.active && m.quizRequired);

    if (requiredModules.length > 0) {
      const progress = await ctx.db
        .query("moduleProgress")
        .withIndex("by_user_training", (q) => q.eq("userId", userId).eq("trainingId", trainingId))
        .collect();
      const allPassed = requiredModules.every((m) =>
        progress.find((p) => p.moduleId === m._id)?.quizPassed === true,
      );
      if (!allPassed) return null;
    }

    const training = await ctx.db.get(trainingId);
    if (!training?.certificateStorageId) return null;
    const url = await ctx.storage.getUrl(training.certificateStorageId);
    return url ? { url, fileName: training.certificateFileName } : null;
  },
});
