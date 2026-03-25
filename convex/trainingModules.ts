import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { requireTrainingAccess } from "./trainingProgress";

// ── Public queries (access-gated) ──

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const mod = await ctx.db
      .query("trainingModules")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!mod) return null;

    await requireTrainingAccess(ctx, mod.trainingId);
    return mod;
  },
});

export const getWithProgress = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    const mod = await ctx.db.get(moduleId);
    if (!mod) return null;

    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    const progress = await ctx.db
      .query("moduleProgress")
      .withIndex("by_user_training", (q) =>
        q.eq("userId", userId).eq("trainingId", mod.trainingId),
      )
      .filter((q) => q.eq(q.field("moduleId"), moduleId))
      .first();

    let workbookUrl: string | undefined;
    if (mod.workbookStorageId) {
      workbookUrl = (await ctx.storage.getUrl(mod.workbookStorageId)) ?? undefined;
    }

    return { ...mod, progress, workbookUrl };
  },
});

// ── Admin mutations ──

export const createModule = mutation({
  args: {
    trainingId: v.id("trainings"),
    parentModuleId: v.optional(v.id("trainingModules")),
    slug: v.string(),
    title: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    description: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
    vimeoVideoId: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    discussionEnabled: v.boolean(),
    quizRequired: v.boolean(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("trainingModules")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error(`Module slug "${args.slug}" bestaat al.`);

    // Count siblings for sortOrder
    const siblings = args.parentModuleId
      ? await ctx.db
          .query("trainingModules")
          .withIndex("by_parent", (q) => q.eq("parentModuleId", args.parentModuleId))
          .collect()
      : await ctx.db
          .query("trainingModules")
          .withIndex("by_training", (q) => q.eq("trainingId", args.trainingId))
          .filter((q) => q.eq(q.field("parentModuleId"), undefined))
          .collect();
    const maxOrder = siblings.reduce((max, m) => Math.max(max, m.sortOrder), -1);

    return await ctx.db.insert("trainingModules", {
      ...args,
      sortOrder: maxOrder + 1,
      createdAt: Date.now(),
    });
  },
});

export const updateModule = mutation({
  args: {
    id: v.id("trainingModules"),
    slug: v.optional(v.string()),
    title: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    description: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    vimeoVideoId: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    discussionEnabled: v.optional(v.boolean()),
    quizRequired: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const mod = await ctx.db.get(id);
    if (!mod) throw new Error("Module niet gevonden.");

    if (updates.slug && updates.slug !== mod.slug) {
      const conflict = await ctx.db
        .query("trainingModules")
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

export const deleteModule = mutation({
  args: { id: v.id("trainingModules") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

export const reorderModules = mutation({
  args: { orderedIds: v.array(v.id("trainingModules")) },
  handler: async (ctx, { orderedIds }) => {
    await requireAdmin(ctx);
    for (let i = 0; i < orderedIds.length; i++) {
      await ctx.db.patch(orderedIds[i], { sortOrder: i });
    }
  },
});

// ── File upload (workbook) ──

export const saveWorkbook = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, { moduleId, storageId, fileName }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(moduleId, {
      workbookStorageId: storageId,
      workbookFileName: fileName,
    });
  },
});

export const removeWorkbook = mutation({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    await requireAdmin(ctx);
    const mod = await ctx.db.get(moduleId);
    if (mod?.workbookStorageId) {
      await ctx.storage.delete(mod.workbookStorageId);
    }
    await ctx.db.patch(moduleId, {
      workbookStorageId: undefined,
      workbookFileName: undefined,
    });
  },
});
