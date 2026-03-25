import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { auth } from "./auth";
import { isAdminEmail } from "./adminAuth";

/** Check if user is an admin (by email in adminEmails table) */
async function isUserAdmin(ctx: QueryCtx | MutationCtx, userId: Id<"users">): Promise<boolean> {
  const user = await ctx.db.get(userId);
  if (!user) return false;
  const accounts = await ctx.db
    .query("authAccounts")
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .collect();
  const emailAccount = accounts.find((a: any) => a.providerAccountId?.includes("@"));
  const email = emailAccount?.providerAccountId ?? (user as any).email ?? "";
  if (!email) return false;
  return isAdminEmail(ctx, email);
}

/** Shared access check — reused by trainings, modules, quizzes, discussions */
export async function requireTrainingAccess(
  ctx: QueryCtx | MutationCtx,
  trainingId: Id<"trainings">,
): Promise<{ userId: Id<"users"> }> {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Niet ingelogd.");

  // Admins always have access to all trainings
  if (await isUserAdmin(ctx, userId)) return { userId };

  const accessRights = await ctx.db
    .query("accessRights")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("revokedAt"), undefined))
    .collect();

  const training = await ctx.db.get(trainingId);
  if (!training) throw new Error("Training niet gevonden.");

  const linked = training.linkedProducts ?? [];
  const hasAccess = accessRights.some(
    (r) =>
      linked.includes(r.resource) ||
      r.resource === training.slug ||
      r.resource === `${training.slug}-online` ||
      r.resource === `${training.slug}-coaching`,
  );
  if (!hasAccess) throw new Error("Geen toegang tot deze training.");
  return { userId };
}

/** Check access without throwing — returns boolean */
export async function checkTrainingAccess(
  ctx: QueryCtx,
  trainingId: Id<"trainings">,
): Promise<boolean> {
  const userId = await auth.getUserId(ctx);
  if (!userId) return false;

  // Admins always have access
  if (await isUserAdmin(ctx, userId)) return true;

  const accessRights = await ctx.db
    .query("accessRights")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("revokedAt"), undefined))
    .collect();

  const training = await ctx.db.get(trainingId);
  if (!training) return false;

  const linked = training.linkedProducts ?? [];
  return accessRights.some(
    (r) =>
      linked.includes(r.resource) ||
      r.resource === training.slug ||
      r.resource === `${training.slug}-online` ||
      r.resource === `${training.slug}-coaching`,
  );
}

export const updateVideoProgress = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    trainingId: v.id("trainings"),
    videoProgress: v.number(), // 0-100
    videoPosition: v.number(), // seconds
  },
  handler: async (ctx, { moduleId, trainingId, videoProgress, videoPosition }) => {
    const { userId } = await requireTrainingAccess(ctx, trainingId);

    const existing = await ctx.db
      .query("moduleProgress")
      .withIndex("by_user_training", (q) => q.eq("userId", userId).eq("trainingId", trainingId))
      .filter((q) => q.eq(q.field("moduleId"), moduleId))
      .first();

    const now = Date.now();
    if (existing) {
      const patch: Record<string, unknown> = {
        videoProgress: Math.max(existing.videoProgress, videoProgress),
        videoPosition,
        lastAccessedAt: now,
      };
      // Mark as completed when video is 90%+ watched
      if (videoProgress >= 90 && !existing.completedAt) {
        patch.completedAt = now;
      }
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("moduleProgress", {
        userId,
        moduleId,
        trainingId,
        videoProgress,
        videoPosition,
        quizPassed: false,
        completedAt: videoProgress >= 90 ? now : undefined,
        lastAccessedAt: now,
      });
    }
  },
});

export const getMyTrainingProgress = query({
  args: { trainingId: v.id("trainings") },
  handler: async (ctx, { trainingId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("moduleProgress")
      .withIndex("by_user_training", (q) => q.eq("userId", userId).eq("trainingId", trainingId))
      .collect();
  },
});

export const getMyTrainings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const admin = await isUserAdmin(ctx, userId);

    const accessRights = admin
      ? []
      : await ctx.db
          .query("accessRights")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.eq(q.field("revokedAt"), undefined))
          .collect();

    const trainings = await ctx.db
      .query("trainings")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const result = [];
    for (const training of trainings) {
      // Admins have access to all trainings
      if (!admin) {
        const linked = training.linkedProducts ?? [];
        const hasAccess = accessRights.some(
          (r) =>
            linked.includes(r.resource) ||
            r.resource === training.slug ||
            r.resource === `${training.slug}-online` ||
            r.resource === `${training.slug}-coaching`,
        );
        if (!hasAccess) continue;
      }

      const modules = await ctx.db
        .query("trainingModules")
        .withIndex("by_training", (q) => q.eq("trainingId", training._id))
        .collect();

      const progress = await ctx.db
        .query("moduleProgress")
        .withIndex("by_user_training", (q) => q.eq("userId", userId).eq("trainingId", training._id))
        .collect();

      const activeModules = modules.filter((m) => m.active);
      const completedModules = progress.filter((p) => p.completedAt);
      const overallProgress = activeModules.length > 0
        ? Math.round((completedModules.length / activeModules.length) * 100)
        : 0;

      // Find last accessed module for resume link
      const lastAccessed = progress.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)[0];
      const lastModule = lastAccessed
        ? modules.find((m) => m._id === lastAccessed.moduleId)
        : null;

      let thumbnailUrl: string | undefined;
      if (training.thumbnailStorageId) {
        thumbnailUrl = (await ctx.storage.getUrl(training.thumbnailStorageId)) ?? undefined;
      }

      result.push({
        _id: training._id,
        slug: training.slug,
        title: training.title,
        type: training.type ?? "training",
        thumbnailUrl,
        overallProgress,
        totalModules: activeModules.length,
        completedModules: completedModules.length,
        lastModuleSlug: lastModule?.slug,
      });
    }

    return result;
  },
});
