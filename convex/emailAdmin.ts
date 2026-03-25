import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

// ── Template CRUD ──

export const createTemplate = mutation({
  args: {
    templateKey: v.string(),
    sequenceType: v.string(),
    stepIndex: v.number(),
    subjectNl: v.string(),
    subjectEn: v.string(),
    subjectDe: v.optional(v.string()),
    htmlNl: v.string(),
    htmlEn: v.string(),
    htmlDe: v.optional(v.string()),
    delayDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("emailTemplates")
      .withIndex("by_key", (q) => q.eq("templateKey", args.templateKey))
      .first();
    if (existing) throw new Error("Template key bestaat al.");

    return await ctx.db.insert("emailTemplates", {
      ...args,
      active: true,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTemplate = mutation({
  args: { id: v.id("emailTemplates") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

export const duplicateTemplate = mutation({
  args: { id: v.id("emailTemplates") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const original = await ctx.db.get(id);
    if (!original) throw new Error("Template niet gevonden.");

    const newKey = `${original.templateKey}-copy-${Date.now()}`;
    return await ctx.db.insert("emailTemplates", {
      templateKey: newKey,
      sequenceType: original.sequenceType,
      stepIndex: original.stepIndex + 100,
      subjectNl: `${original.subjectNl} (kopie)`,
      subjectEn: `${original.subjectEn} (copy)`,
      htmlNl: original.htmlNl,
      htmlEn: original.htmlEn,
      delayDays: original.delayDays,
      active: false,
      updatedAt: Date.now(),
    });
  },
});

// ── Template Performance ──

export const getTemplatePerformance = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const emails = await ctx.db.query("emailLog").collect();
    const stats = new Map<string, { sent: number; opened: number; clicked: number }>();

    for (const email of emails) {
      if (email.status !== "sent") continue;
      const key = email.template;
      const s = stats.get(key) || { sent: 0, opened: 0, clicked: 0 };
      s.sent++;
      if ((email.openCount ?? 0) > 0) s.opened++;
      if ((email.clickCount ?? 0) > 0) s.clicked++;
      stats.set(key, s);
    }

    return [...stats.entries()]
      .map(([template, s]) => ({
        template,
        sent: s.sent,
        opened: s.opened,
        clicked: s.clicked,
        openRate: s.sent > 0 ? Math.round((s.opened / s.sent) * 100) : 0,
        clickRate: s.sent > 0 ? Math.round((s.clicked / s.sent) * 100) : 0,
      }))
      .sort((a, b) => b.sent - a.sent);
  },
});

// ── A/B Testing ──

export const setAbTestVariant = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    subjectNlB: v.string(),
    subjectEnB: v.string(),
    htmlNlB: v.string(),
    htmlEnB: v.string(),
  },
  handler: async (ctx, { templateId, ...variantB }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(templateId, {
      ...variantB,
      abTestActive: true,
      updatedAt: Date.now(),
    });
  },
});

export const toggleAbTest = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    active: v.boolean(),
  },
  handler: async (ctx, { templateId, active }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(templateId, {
      abTestActive: active,
      updatedAt: Date.now(),
    });
  },
});

export const declareAbTestWinner = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    winner: v.union(v.literal("A"), v.literal("B")),
  },
  handler: async (ctx, { templateId, winner }) => {
    await requireAdmin(ctx);
    const template = await ctx.db.get(templateId);
    if (!template) throw new Error("Template niet gevonden.");

    if (winner === "B" && template.htmlNlB && template.htmlEnB) {
      await ctx.db.patch(templateId, {
        subjectNl: template.subjectNlB ?? template.subjectNl,
        subjectEn: template.subjectEnB ?? template.subjectEn,
        htmlNl: template.htmlNlB,
        htmlEn: template.htmlEnB,
        abTestActive: false,
        subjectNlB: undefined,
        subjectEnB: undefined,
        htmlNlB: undefined,
        htmlEnB: undefined,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(templateId, {
        abTestActive: false,
        subjectNlB: undefined,
        subjectEnB: undefined,
        htmlNlB: undefined,
        htmlEnB: undefined,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getAbTestResults = query({
  args: { templateKey: v.string() },
  handler: async (ctx, { templateKey }) => {
    await requireAdmin(ctx);

    const emails = await ctx.db.query("emailLog").collect();
    const relevant = emails.filter((e) => e.template === templateKey && e.variant);

    const results = { A: { sent: 0, opened: 0, clicked: 0 }, B: { sent: 0, opened: 0, clicked: 0 } };
    for (const email of relevant) {
      if (email.status !== "sent") continue;
      const v = email.variant === "B" ? results.B : results.A;
      v.sent++;
      if ((email.openCount ?? 0) > 0) v.opened++;
      if ((email.clickCount ?? 0) > 0) v.clicked++;
    }

    return {
      A: { ...results.A, openRate: results.A.sent > 0 ? Math.round((results.A.opened / results.A.sent) * 100) : 0, clickRate: results.A.sent > 0 ? Math.round((results.A.clicked / results.A.sent) * 100) : 0 },
      B: { ...results.B, openRate: results.B.sent > 0 ? Math.round((results.B.opened / results.B.sent) * 100) : 0, clickRate: results.B.sent > 0 ? Math.round((results.B.clicked / results.B.sent) * 100) : 0 },
    };
  },
});

// ── Unsubscribe ──

export const checkUnsubscribed = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const entry = await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
    return !!entry;
  },
});

export const unsubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.toLowerCase();
    const existing = await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (existing) return;
    await ctx.db.insert("unsubscribes", { email: normalized, createdAt: Date.now() });
  },
});

export const resubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    await requireAdmin(ctx);
    const entry = await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
    if (entry) await ctx.db.delete(entry._id);
  },
});

export const getUnsubscribes = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("unsubscribes").order("desc").take(200);
  },
});

// ── Scheduled Broadcasts ──

export const scheduleBroadcast = mutation({
  args: {
    broadcastId: v.id("broadcasts"),
    scheduledFor: v.number(),
  },
  handler: async (ctx, { broadcastId, scheduledFor }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(broadcastId, { scheduledFor });
    // Schedule the send job
    const delayMs = scheduledFor - Date.now();
    if (delayMs > 0) {
      await ctx.scheduler.runAfter(delayMs, internal.emailAdmin.processScheduledBroadcast, { broadcastId });
    }
  },
});

export const processScheduledBroadcast = internalMutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    const broadcast = await ctx.db.get(broadcastId);
    if (!broadcast || broadcast.status !== "draft") return;
    // Trigger the existing send logic
    await ctx.db.patch(broadcastId, { status: "sending" });
    await ctx.scheduler.runAfter(0, internal.emails.sendBroadcast, { broadcastId });
  },
});

// ── Extended Segments ──

const SEGMENT_FILTERS: Record<string, (p: { product: string; productType: string; paidAt?: number }) => boolean> = {
  all: () => true,
  "training-buyers": (p) => p.productType === "training",
  "book-buyers": (p) => p.productType === "book",
  "set-buyers": (p) => p.product.startsWith("set-"),
  "cst-buyers": (p) => p.product.startsWith("cst-"),
  "recent-30d": (p) => (p.paidAt ?? 0) > Date.now() - 30 * 24 * 60 * 60 * 1000,
  "recent-90d": (p) => (p.paidAt ?? 0) > Date.now() - 90 * 24 * 60 * 60 * 1000,
  "repeat-buyers": () => true, // Handled separately
};

export const getSegmentRecipients = query({
  args: { segment: v.string() },
  handler: async (ctx, { segment }) => {
    await requireAdmin(ctx);

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    const unsubscribes = await ctx.db.query("unsubscribes").collect();
    const unsubSet = new Set(unsubscribes.map((u) => u.email.toLowerCase()));

    const filterFn = SEGMENT_FILTERS[segment] || SEGMENT_FILTERS.all;

    if (segment === "repeat-buyers") {
      const userCounts = new Map<string, number>();
      for (const p of purchases) {
        userCounts.set(p.userId.toString(), (userCounts.get(p.userId.toString()) ?? 0) + 1);
      }
      const repeatUserIds = new Set(
        [...userCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id),
      );
      const filtered = purchases.filter((p) => repeatUserIds.has(p.userId.toString()));
      const uniqueUsers = new Map<string, typeof purchases[0]>();
      for (const p of filtered) {
        if (!unsubSet.has(p.userId.toString())) {
          uniqueUsers.set(p.userId.toString(), p);
        }
      }
      return uniqueUsers.size;
    }

    const filtered = purchases.filter(filterFn);
    const uniqueUsers = new Set(filtered.map((p) => p.userId.toString()));
    return uniqueUsers.size;
  },
});
