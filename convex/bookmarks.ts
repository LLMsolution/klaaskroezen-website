import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireTrainingAccess } from "./trainingProgress";

/**
 * Map of { moduleId -> bookmark count } for the current user across every
 * module of a training. Used by the module sidebar + training overview to
 * badge lessons that already have bookmarks.
 */
export const countsForTraining = query({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    const { userId } = await requireTrainingAccess(ctx, trainingId);
    const modules = await ctx.db
      .query("trainingModules")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();

    const counts: Record<string, number> = {};
    for (const m of modules) {
      const rows = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_module", (q) =>
          q.eq("userId", userId).eq("moduleId", m._id),
        )
        .collect();
      if (rows.length > 0) counts[m._id] = rows.length;
    }
    return counts;
  },
});

export const listForModule = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    const mod = await ctx.db.get(moduleId);
    if (!mod) return [];
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    return await ctx.db
      .query("bookmarks")
      .withIndex("by_user_module", (q) => q.eq("userId", userId).eq("moduleId", moduleId))
      .collect();
  },
});

export const create = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    videoTimestamp: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mod = await ctx.db.get(args.moduleId);
    if (!mod) throw new Error("Module niet gevonden.");
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    return await ctx.db.insert("bookmarks", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("bookmarks"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { id, note }) => {
    const bookmark = await ctx.db.get(id);
    if (!bookmark) throw new Error("Bookmark niet gevonden.");

    const mod = await ctx.db.get(bookmark.moduleId);
    if (!mod) throw new Error("Module niet gevonden.");
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    if (bookmark.userId !== userId) throw new Error("Bookmark niet gevonden.");
    await ctx.db.patch(id, { note });
  },
});

export const remove = mutation({
  args: { id: v.id("bookmarks") },
  handler: async (ctx, { id }) => {
    const bookmark = await ctx.db.get(id);
    if (!bookmark) throw new Error("Bookmark niet gevonden.");

    const mod = await ctx.db.get(bookmark.moduleId);
    if (!mod) throw new Error("Module niet gevonden.");
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    if (bookmark.userId !== userId) throw new Error("Bookmark niet gevonden.");
    await ctx.db.delete(id);
  },
});
