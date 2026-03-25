import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

/** Update layout editor config */
export const updateConfig = mutation({
  args: {
    allowedEmails: v.array(v.string()),
    sessionTimeoutMinutes: v.number(),
  },
  handler: async (ctx, { allowedEmails, sessionTimeoutMinutes }) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("layoutConfig")
      .withIndex("by_key", (q) => q.eq("key", "config"))
      .first();

    const data = {
      key: "config" as const,
      allowedEmails: allowedEmails.map((e) => e.toLowerCase().trim()),
      sessionTimeoutMinutes: Math.max(10, sessionTimeoutMinutes),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("layoutConfig", data);
    }
  },
});

/** Get layout editor config */
export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const config = await ctx.db
      .query("layoutConfig")
      .withIndex("by_key", (q) => q.eq("key", "config"))
      .first();
    return config ?? { key: "config", allowedEmails: [], sessionTimeoutMinutes: 120 };
  },
});
