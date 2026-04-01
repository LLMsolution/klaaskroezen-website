import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

// ── Public queries ──

/** Get the active session (if any) — admin only */
export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const active = await ctx.db
      .query("layoutSessions")
      .withIndex("by_status")
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "approved"),
          q.neq(q.field("status"), "rejected"),
          q.neq(q.field("status"), "failed"),
        ),
      )
      .first();
    return active;
  },
});

/** Get session by ID — admin only */
export const getSession = query({
  args: { sessionId: v.id("layoutSessions") },
  handler: async (ctx, { sessionId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(sessionId);
  },
});

/** Get layout config (admin only) */
export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const config = await ctx.db
      .query("layoutConfig")
      .withIndex("by_key", (q) => q.eq("key", "config"))
      .first();
    return config ?? { allowedEmails: [], sessionTimeoutMinutes: 120 };
  },
});

// ── Internal queries (no auth — for cron/internal use) ──

/** Internal session query — no auth check, used by callbacks */
export const getSessionInternal = internalQuery({
  args: { sessionId: v.id("layoutSessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db.get(sessionId);
  },
});

/** Internal config query — no auth check, used by cron cleanup */
export const getConfigInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("layoutConfig")
      .withIndex("by_key", (q) => q.eq("key", "config"))
      .first();
    return config ?? { allowedEmails: [], sessionTimeoutMinutes: 120 };
  },
});

/** Verify caller is admin — used by actions that can't call requireAdmin directly */
export const verifyAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return true;
  },
});

/** Internal list of non-terminal sessions — no auth check, used by cron */
export const listActiveSessions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("layoutSessions")
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "approved"),
          q.neq(q.field("status"), "rejected"),
          q.neq(q.field("status"), "failed"),
        ),
      )
      .collect();
    return sessions;
  },
});

// ── Mutations ──

/** Start a new session (checks lock + permissions) */
export const startSession = mutation({
  args: { targetPage: v.string() },
  handler: async (ctx, { targetPage }) => {
    const { userId, email } = await requireAdmin(ctx);

    // Check config: is this email allowed?
    const config = await ctx.db
      .query("layoutConfig")
      .withIndex("by_key", (q) => q.eq("key", "config"))
      .first();

    if (config && config.allowedEmails.length > 0) {
      if (!config.allowedEmails.includes(email.toLowerCase())) {
        throw new Error("Je hebt geen toegang tot de layout editor.");
      }
    }

    // Check lock: is there an active session?
    const active = await ctx.db
      .query("layoutSessions")
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "approved"),
          q.neq(q.field("status"), "rejected"),
          q.neq(q.field("status"), "failed"),
        ),
      )
      .first();

    if (active) {
      throw new Error(
        `Er is al een actieve sessie van ${active.userEmail}. Wacht tot deze is afgesloten.`,
      );
    }

    const now = Date.now();
    const branchName = `ai/l-${Math.floor(now / 1000).toString(36)}`;

    const sessionId = await ctx.db.insert("layoutSessions", {
      status: "chatting",
      userId,
      userEmail: email,
      targetPage,
      branchName,
      messages: [],
      lastActivityAt: now,
      createdAt: now,
    });

    return sessionId;
  },
});

/** Add a message to the session */
export const addMessage = mutation({
  args: {
    sessionId: v.id("layoutSessions"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    text: v.string(),
  },
  handler: async (ctx, { sessionId, role, text }) => {
    await requireAdmin(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Sessie niet gevonden.");

    const message = { role, text, createdAt: Date.now() };

    await ctx.db.patch(sessionId, {
      messages: [...session.messages, message],
      lastActivityAt: Date.now(),
    });
  },
});

/** Internal: add a message without auth (for callback/actions) */
export const addMessageInternal = internalMutation({
  args: {
    sessionId: v.id("layoutSessions"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    text: v.string(),
  },
  handler: async (ctx, { sessionId, role, text }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Sessie niet gevonden.");

    const message = { role, text, createdAt: Date.now() };

    await ctx.db.patch(sessionId, {
      messages: [...session.messages, message],
      lastActivityAt: Date.now(),
    });
  },
});

/** Internal: update session status (used by callback and actions) */
export const updateSessionStatus = internalMutation({
  args: {
    sessionId: v.id("layoutSessions"),
    status: v.union(
      v.literal("chatting"),
      v.literal("planning"),
      v.literal("locked"),
      v.literal("building"),
      v.literal("preview"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("failed"),
      v.literal("reverted"),
    ),
    previewUrl: v.optional(v.string()),
    prNumber: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    plan: v.optional(v.string()),
    planVersion: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, status, previewUrl, prNumber, errorMessage, plan, planVersion }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Sessie niet gevonden.");

    const patch: Record<string, unknown> = {
      status,
      lastActivityAt: Date.now(),
    };
    if (previewUrl !== undefined) patch.previewUrl = previewUrl;
    if (prNumber !== undefined) patch.prNumber = prNumber;
    if (errorMessage !== undefined) patch.errorMessage = errorMessage;
    if (plan !== undefined) patch.plan = plan;
    if (planVersion !== undefined) patch.planVersion = planVersion;
    if (["approved", "rejected", "failed", "reverted"].includes(status)) {
      patch.completedAt = Date.now();
    }

    await ctx.db.patch(sessionId, patch);
  },
});

/** Close session (approve or reject) */
export const closeSession = mutation({
  args: {
    sessionId: v.id("layoutSessions"),
    action: v.union(v.literal("approve"), v.literal("reject")),
  },
  handler: async (ctx, { sessionId, action }) => {
    await requireAdmin(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Sessie niet gevonden.");

    const status = action === "approve" ? "approved" : "rejected";

    await ctx.db.patch(sessionId, {
      status,
      completedAt: Date.now(),
      lastActivityAt: Date.now(),
    });

    return { status, prNumber: session.prNumber, branchName: session.branchName };
  },
});

/** Schedule content sync — now just a fallback, main sync happens via deploy check */
export const scheduleSync = internalMutation({
  args: {
    pageSlug: v.optional(v.string()),
    overwriteContent: v.boolean(),
  },
  handler: async (ctx, { pageSlug }) => {
    // Fallback sync at 12 min (in case deploy check doesn't fire)
    const delayMs = 720_000;
    await ctx.scheduler.runAfter(delayMs, internal.siteSeed.syncNewContent, {});
    if (pageSlug) {
      await ctx.scheduler.runAfter(delayMs + 5000, internal.siteSeed.syncPageContentFull, { pageSlug });
    }
  },
});

/** Sync content immediately after deploy success (called from checkDeployStatus) */
export const syncAfterDeploy = internalMutation({
  args: { sessionId: v.id("layoutSessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return;

    // Sync structure + page content now that deploy is confirmed
    await ctx.scheduler.runAfter(0, internal.siteSeed.syncNewContent, {});
    if (session.targetPage) {
      await ctx.scheduler.runAfter(2000, internal.siteSeed.syncPageContentFull, { pageSlug: session.targetPage });
    }

    // Sync image spec updates if the AI provided them
    if (session.imageSpecUpdates && session.imageSpecUpdates.length > 0) {
      const specsWithPage = session.imageSpecUpdates.map((s) => ({
        ...s,
        pageSlug: session.targetPage,
      }));
      await ctx.scheduler.runAfter(0, internal.imageSpecs.bulkUpsert, {
        specs: specsWithPage,
        force: true,
      });
    }
  },
});

/** Store image spec updates from layout-edit AI on the session */
export const storeImageSpecUpdates = internalMutation({
  args: {
    sessionId: v.id("layoutSessions"),
    imageSpecUpdates: v.array(v.object({
      imageKey: v.string(),
      displayWidth: v.number(),
      displayHeight: v.number(),
      aspectRatio: v.string(),
      context: v.string(),
    })),
  },
  handler: async (ctx, { sessionId, imageSpecUpdates }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return;
    await ctx.db.patch(sessionId, { imageSpecUpdates });
  },
});

/** Reset all stuck sessions — one-time utility */
export const resetStuckSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("layoutSessions")
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "approved"),
          q.neq(q.field("status"), "rejected"),
          q.neq(q.field("status"), "failed"),
        ),
      )
      .collect();
    for (const s of sessions) {
      await ctx.db.patch(s._id, { status: "failed", errorMessage: "Sessie handmatig gereset.", completedAt: Date.now() });
    }
    return sessions.length;
  },
});

/** Generate upload URL for layout editor images */
export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Save uploaded image to session */
export const addImageToSession = mutation({
  args: {
    sessionId: v.id("layoutSessions"),
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, { sessionId, storageId, fileName }) => {
    await requireAdmin(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Sessie niet gevonden.");

    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Afbeelding niet gevonden in storage.");

    const images = session.uploadedImages ?? [];
    images.push({ storageId, url, fileName });

    await ctx.db.patch(sessionId, {
      uploadedImages: images,
      lastActivityAt: Date.now(),
    });

    return url;
  },
});

/** Get recent sessions (history, admin only) */
export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("layoutSessions")
      .order("desc")
      .take(20);
  },
});

/** Get the last approved session that can be reverted (admin only) */
export const getRevertableSession = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const session = await ctx.db
      .query("layoutSessions")
      .withIndex("by_status")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .first();

    if (!session?.mergeCommitSha) return null;
    return {
      _id: session._id,
      targetPage: session.targetPage,
      completedAt: session.completedAt,
      userEmail: session.userEmail,
      plan: session.plan,
    };
  },
});

/** Internal: store revert data on approved session */
export const storeRevertData = internalMutation({
  args: {
    sessionId: v.id("layoutSessions"),
    mergeCommitSha: v.string(),
    sectionSnapshot: v.string(),
  },
  handler: async (ctx, { sessionId, mergeCommitSha, sectionSnapshot }) => {
    await ctx.db.patch(sessionId, { mergeCommitSha, sectionSnapshot });
  },
});

/** Internal: restore page sections from snapshot (used by revert) */
/** Schedule deploy status check after merge */
export const scheduleDeployCheck = internalMutation({
  args: {
    sessionId: v.id("layoutSessions"),
    mergeCommitSha: v.string(),
    delayMs: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, mergeCommitSha, delayMs }) => {
    await ctx.db.patch(sessionId, { deployStatus: "pending" });
    await ctx.scheduler.runAfter(
      delayMs ?? 300_000, // 5 min default
      internal.layoutEditorOps.checkDeployStatus,
      { sessionId, mergeCommitSha },
    );
  },
});

/** Update deploy status on session */
export const updateDeployStatus = internalMutation({
  args: {
    sessionId: v.id("layoutSessions"),
    deployStatus: v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    deployError: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, deployStatus, deployError }) => {
    const patch: Record<string, unknown> = { deployStatus };
    if (deployError !== undefined) patch.deployError = deployError;
    await ctx.db.patch(sessionId, patch);
  },
});

/** Get session with deploy failure (for admin notification) */
export const getDeployFailure = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const session = await ctx.db
      .query("layoutSessions")
      .withIndex("by_status")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc")
      .first();

    if (!session || session.deployStatus !== "failed") return null;
    return {
      _id: session._id,
      targetPage: session.targetPage,
      deployError: session.deployError,
      completedAt: session.completedAt,
    };
  },
});

export const restorePageSections = internalMutation({
  args: {
    pageSlug: v.string(),
    sectionSnapshot: v.string(),
  },
  handler: async (ctx, { pageSlug, sectionSnapshot }) => {
    const page = await ctx.db.query("sitePages")
      .filter((q) => q.eq(q.field("slug"), pageSlug))
      .first();
    if (!page) return;

    const sections = JSON.parse(sectionSnapshot);
    await ctx.db.patch(page._id, { sections, updatedAt: Date.now() });
  },
});
