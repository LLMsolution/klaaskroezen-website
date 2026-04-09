import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
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
  },
  handler: async (ctx, { moduleId, content }) => {
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
      await ctx.db.patch(existing._id, { content, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("userNotes", {
      userId,
      moduleId,
      trainingId: mod.trainingId,
      content,
      updatedAt: now,
    });
  },
});
