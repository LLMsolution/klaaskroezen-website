import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

/**
 * List all broadcasts.
 */
export const getBroadcasts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("broadcasts").order("desc").take(50);
  },
});

/**
 * Preview recipient count for a segment.
 */
export const previewSegmentCount = query({
  args: {
    segment: v.union(
      v.literal("all"),
      v.literal("training-buyers"),
      v.literal("book-buyers"),
      v.literal("set-buyers"),
      v.literal("cst-buyers"),
    ),
  },
  handler: async (ctx, { segment }) => {
    await requireAdmin(ctx);

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    const filtered = purchases.filter((p) => {
      if (segment === "all") return true;
      if (segment === "training-buyers") return p.productType === "training";
      if (segment === "book-buyers") return p.productType === "book";
      if (segment === "set-buyers") return p.product.startsWith("set-");
      if (segment === "cst-buyers") return p.product.startsWith("cst-");
      return true;
    });

    const uniqueUsers = new Set(filtered.map((p) => p.userId));
    return uniqueUsers.size;
  },
});

/**
 * Create and optionally send a broadcast.
 */
export const saveBroadcast = mutation({
  args: {
    subject: v.string(),
    htmlBody: v.string(),
    segment: v.union(
      v.literal("all"),
      v.literal("training-buyers"),
      v.literal("book-buyers"),
      v.literal("set-buyers"),
      v.literal("cst-buyers"),
    ),
    sendNow: v.boolean(),
    abTestActive: v.optional(v.boolean()),
    subjectB: v.optional(v.string()),
    htmlBodyB: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const broadcastId = await ctx.db.insert("broadcasts", {
      subject: args.subject,
      htmlBody: args.htmlBody,
      segment: args.segment,
      status: args.sendNow ? "sending" : "draft",
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
      createdAt: Date.now(),
      ...(args.abTestActive ? {
        abTestActive: true,
        subjectB: args.subjectB,
        htmlBodyB: args.htmlBodyB,
      } : {}),
    });

    if (args.sendNow) {
      await ctx.scheduler.runAfter(0, internal.emails.sendBroadcast, {
        broadcastId,
      });
    }

    return broadcastId;
  },
});

/**
 * Send a draft broadcast.
 */
export const triggerBroadcast = mutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    await requireAdmin(ctx);

    const broadcast = await ctx.db.get(broadcastId);
    if (!broadcast || broadcast.status !== "draft") {
      throw new Error("Broadcast kan niet verzonden worden.");
    }

    await ctx.db.patch(broadcastId, { status: "sending" });
    await ctx.scheduler.runAfter(0, internal.emails.sendBroadcast, {
      broadcastId,
    });
  },
});

/**
 * Delete a draft broadcast.
 */
export const deleteBroadcast = mutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    await requireAdmin(ctx);

    const broadcast = await ctx.db.get(broadcastId);
    if (!broadcast) return;
    if (broadcast.status === "sending") throw new Error("Kan actieve broadcast niet verwijderen.");

    await ctx.db.delete(broadcastId);
  },
});
