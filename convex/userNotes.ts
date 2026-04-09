import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { requireTrainingAccess } from "./trainingProgress";

/** Fetch the current user's personal note for a module (null if none). */
export const getMyNote = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, { moduleId }) => {
    const mod = await ctx.db.get(moduleId);
    if (!mod) return null;
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    const existing = await ctx.db
      .query("userNotes")
      .withIndex("by_user_module", (q) =>
        q.eq("userId", userId).eq("moduleId", moduleId),
      )
      .first();
    return existing;
  },
});

/** Upsert (insert or replace) the current user's note for a module. */
export const saveNote = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    content: v.string(),
    contentJson: v.optional(v.any()),
  },
  handler: async (ctx, { moduleId, content, contentJson }) => {
    const mod = await ctx.db.get(moduleId);
    if (!mod) throw new Error("Module niet gevonden.");
    const { userId } = await requireTrainingAccess(ctx, mod.trainingId);

    const existing = await ctx.db
      .query("userNotes")
      .withIndex("by_user_module", (q) =>
        q.eq("userId", userId).eq("moduleId", moduleId),
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { content, contentJson, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("userNotes", {
      userId,
      moduleId,
      trainingId: mod.trainingId,
      content,
      contentJson,
      updatedAt: now,
    });
  },
});

/**
 * Fetch all notes for a training for the current user, joined with module
 * titles and sorted by module sortOrder. Used by the PDF export action.
 * Internal so only the action can call it.
 */
export const getNotesForTrainingExport = internalQuery({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    const { userId } = await requireTrainingAccess(ctx, trainingId);

    const training = await ctx.db.get(trainingId);
    if (!training) throw new Error("Training niet gevonden.");

    const notes = await ctx.db
      .query("userNotes")
      .withIndex("by_user_training", (q) =>
        q.eq("userId", userId).eq("trainingId", trainingId),
      )
      .collect();

    const modules = await ctx.db
      .query("trainingModules")
      .withIndex("by_training", (q) => q.eq("trainingId", trainingId))
      .collect();

    const moduleById = new Map(modules.map((m) => [m._id, m]));

    const user = await ctx.db.get(userId);

    const sections = notes
      .map((n) => {
        const mod = moduleById.get(n.moduleId);
        if (!mod) return null;
        return {
          moduleId: n.moduleId,
          moduleTitle: mod.title,
          moduleSortOrder: mod.sortOrder,
          moduleDisplayNumber: mod.displayNumber,
          content: n.content ?? "",
          contentJson: n.contentJson ?? null,
          updatedAt: n.updatedAt,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => a.moduleSortOrder - b.moduleSortOrder);

    return {
      training: {
        title: training.title,
      },
      user: {
        name: (user as unknown as { name?: string })?.name ?? "",
      },
      sections,
    };
  },
});
