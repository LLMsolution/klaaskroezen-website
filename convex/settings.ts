/**
 * Site settings — admin-adjustable configuration values.
 * Uses a single-row pattern with key "global".
 */

import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

const DEFAULTS = {
  abandonedCartDelayMinutes: 30,
  escalationDelayHours: [24, 48, 96], // 24h, 48h, 4 days
};

// ── Public query (admin) ──

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    return {
      abandonedCartDelayMinutes: settings?.abandonedCartDelayMinutes ?? DEFAULTS.abandonedCartDelayMinutes,
      escalationDelayHours: settings?.escalationDelayHours ?? DEFAULTS.escalationDelayHours,
    };
  },
});

// ── Internal query (for checkout scheduler) ──

export const getAbandonedCartTiming = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    return {
      firstDelayMs: (settings?.abandonedCartDelayMinutes ?? DEFAULTS.abandonedCartDelayMinutes) * 60 * 1000,
      escalationDelaysMs: (settings?.escalationDelayHours ?? DEFAULTS.escalationDelayHours).map(
        (h) => h * 60 * 60 * 1000,
      ),
    };
  },
});

// ── Admin mutation ──

export const updateSettings = mutation({
  args: {
    abandonedCartDelayMinutes: v.number(),
    escalationDelayHours: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.abandonedCartDelayMinutes < 5) throw new Error("Minimaal 5 minuten.");
    if (args.escalationDelayHours.length < 1) throw new Error("Minimaal 1 escalatie stap.");

    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        abandonedCartDelayMinutes: args.abandonedCartDelayMinutes,
        escalationDelayHours: args.escalationDelayHours,
      });
    } else {
      await ctx.db.insert("siteSettings", {
        key: "global",
        abandonedCartDelayMinutes: args.abandonedCartDelayMinutes,
        escalationDelayHours: args.escalationDelayHours,
      });
    }
  },
});
