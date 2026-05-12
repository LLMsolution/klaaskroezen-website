import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/** All training modules with audio that don't yet have a stored duration. */
export const listModulesNeedingDuration = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("trainingModules").collect();
    return all
      .filter((m) => m.audioStorageId && !m.audioDurationSeconds)
      .map((m) => ({ _id: m._id, audioStorageId: m.audioStorageId! }));
  },
});

export const saveDuration = internalMutation({
  args: { moduleId: v.id("trainingModules"), durationSeconds: v.number() },
  handler: async (ctx, { moduleId, durationSeconds }) => {
    await ctx.db.patch(moduleId, { audioDurationSeconds: durationSeconds });
  },
});
