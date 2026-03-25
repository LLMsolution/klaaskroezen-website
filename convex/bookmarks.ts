import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireTrainingAccess } from "./trainingProgress";

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
