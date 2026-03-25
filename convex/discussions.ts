import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { isAdminEmail } from "./adminAuth";
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

export const listForModule = query({
  args: {
    moduleId: v.id("trainingModules"),
    sortBy: v.optional(v.union(v.literal("newest"), v.literal("upvoted"))),
  },
  handler: async (ctx, { moduleId, sortBy = "newest" }) => {
    await requireModuleAccess(ctx, moduleId);

    const posts = await ctx.db
      .query("discussions")
      .withIndex("by_module", (q) => q.eq("moduleId", moduleId))
      .collect();

    // Get top-level posts (no parentId)
    const topLevel = posts.filter((p) => !p.parentId);
    const replies = posts.filter((p) => p.parentId);

    // Sort top-level
    if (sortBy === "upvoted") {
      topLevel.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      topLevel.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Attach replies to each top-level post
    return topLevel.map((post) => ({
      ...post,
      replies: replies
        .filter((r) => r.parentId === post._id)
        .sort((a, b) => a.createdAt - b.createdAt),
    }));
  },
});

// ── Public mutations (access-gated) ──

export const create = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    text: v.string(),
  },
  handler: async (ctx, { moduleId, text }) => {
    if (text.length > 5000) throw new Error("Bericht te lang (max 5000 tekens).");
    const { userId } = await requireModuleAccess(ctx, moduleId);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Gebruiker niet gevonden.");

    // Check if user is trainer
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    const emailAccount = accounts.find(
      (a) => a.providerAccountId?.includes("@"),
    );
    const email = emailAccount?.providerAccountId ?? "";
    const isTrainer = await isAdminEmail(ctx, email);

    const postId = await ctx.db.insert("discussions", {
      moduleId,
      userId,
      userName: user.name || email.split("@")[0],
      text,
      upvotes: 0,
      isTrainer,
      createdAt: Date.now(),
    });

    // Notify trainer about new discussion question (unless poster is trainer)
    if (!isTrainer) {
      await ctx.scheduler.runAfter(0, internal.emails.sendDiscussionNotification, {
        moduleId,
        postId,
        userName: user.name || "Deelnemer",
        text,
      });
    }

    return postId;
  },
});

export const reply = mutation({
  args: {
    parentId: v.id("discussions"),
    text: v.string(),
  },
  handler: async (ctx, { parentId, text }) => {
    if (text.length > 5000) throw new Error("Bericht te lang (max 5000 tekens).");
    const parent = await ctx.db.get(parentId);
    if (!parent) throw new Error("Bericht niet gevonden.");

    const { userId } = await requireModuleAccess(ctx, parent.moduleId);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Gebruiker niet gevonden.");

    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    const emailAccount = accounts.find(
      (a) => a.providerAccountId?.includes("@"),
    );
    const email = emailAccount?.providerAccountId ?? "";
    const isTrainer = await isAdminEmail(ctx, email);

    return await ctx.db.insert("discussions", {
      moduleId: parent.moduleId,
      userId,
      userName: user.name || email.split("@")[0],
      text,
      upvotes: 0,
      isTrainer,
      parentId,
      createdAt: Date.now(),
    });
  },
});

export const toggleVote = mutation({
  args: { discussionId: v.id("discussions") },
  handler: async (ctx, { discussionId }) => {
    const post = await ctx.db.get(discussionId);
    if (!post) throw new Error("Bericht niet gevonden.");

    const { userId } = await requireModuleAccess(ctx, post.moduleId);

    const existing = await ctx.db
      .query("discussionVotes")
      .withIndex("by_user_discussion", (q) =>
        q.eq("userId", userId).eq("discussionId", discussionId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(discussionId, { upvotes: Math.max(0, post.upvotes - 1) });
      return false;
    } else {
      await ctx.db.insert("discussionVotes", {
        discussionId,
        userId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(discussionId, { upvotes: post.upvotes + 1 });
      return true;
    }
  },
});
