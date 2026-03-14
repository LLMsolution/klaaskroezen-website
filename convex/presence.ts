import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const PRESENCE_TIMEOUT = 30 * 1000; // 30 seconds

/** Heartbeat: update or create presence for a session on a page */
export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    page: v.string(),
  },
  handler: async (ctx, { sessionId, page }) => {
    const existing = await ctx.db
      .query("pagePresence")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        page,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("pagePresence", {
        sessionId,
        page,
        lastSeen: Date.now(),
      });
    }
  },
});

/** Get count of active visitors on a page (seen within last 30 seconds) */
export const getActiveCount = query({
  args: { page: v.string() },
  handler: async (ctx, { page }) => {
    const cutoff = Date.now() - PRESENCE_TIMEOUT;

    const visitors = await ctx.db
      .query("pagePresence")
      .withIndex("by_page", (q) => q.eq("page", page))
      .collect();

    return visitors.filter((v) => v.lastSeen > cutoff).length;
  },
});

/** Remove a session's presence (on page leave) */
export const leave = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const existing = await ctx.db
      .query("pagePresence")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
