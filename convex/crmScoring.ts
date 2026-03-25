import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

/**
 * Score decay: reduce scores by 10% per month of inactivity.
 * Run as a daily cron job.
 */
export const decayScores = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Get contacts that haven't had activity in >30 days and haven't been decayed recently
    const contacts = await ctx.db.query("contacts").collect();

    let decayedCount = 0;
    for (const contact of contacts) {
      // Skip if activity within last 30 days
      if (contact.lastActivityAt > oneMonthAgo) continue;

      // Skip if already decayed this month
      if (contact.lastScoreDecayAt && contact.lastScoreDecayAt > oneMonthAgo) continue;

      // Skip if scores are already 0
      if (contact.engagementScore === 0 && contact.intentScore === 0) continue;

      // Apply 10% decay
      const newEngagement = Math.floor(contact.engagementScore * 0.9);
      const newIntent = Math.floor(contact.intentScore * 0.9);

      await ctx.db.patch(contact._id, {
        engagementScore: newEngagement,
        intentScore: newIntent,
        lastScoreDecayAt: now,
      });

      decayedCount++;
    }

    return { decayedCount };
  },
});

/**
 * Check for contacts crossing score thresholds and trigger notifications.
 * Run as a daily cron job.
 */
export const checkScoreThresholds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Get automation rules for score thresholds
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_trigger", (q) => q.eq("trigger", "score_threshold"))
      .collect();

    const activeRules = rules.filter((r) => r.active);
    if (activeRules.length === 0) return { notified: 0 };

    // Get contacts with recent activity
    const contacts = await ctx.db.query("contacts").collect();
    const recentlyActive = contacts.filter((c) => c.lastActivityAt > oneDayAgo);

    let notified = 0;
    for (const rule of activeRules) {
      const config = JSON.parse(rule.triggerConfig) as {
        scoreType: "intent" | "engagement";
        threshold: number;
      };

      for (const contact of recentlyActive) {
        const score = config.scoreType === "intent"
          ? contact.intentScore
          : contact.engagementScore;

        if (score >= config.threshold) {
          // Fire the actual automation action via evaluateRules
          await ctx.scheduler.runAfter(0, internal.crmAutomation.evaluateRules, {
            trigger: "score_threshold",
            contactId: contact._id,
            metadata: JSON.stringify({
              scoreType: config.scoreType,
              score,
              threshold: config.threshold,
            }),
          });
          notified++;
        }
      }
    }

    return { notified };
  },
});

/**
 * Get scoring overview for admin dashboard.
 */
export const getScoringOverview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const contacts = await ctx.db.query("contacts").collect();

    const highIntent = contacts.filter((c) => c.intentScore >= 50).length;
    const mediumIntent = contacts.filter((c) => c.intentScore >= 20 && c.intentScore < 50).length;
    const highEngagement = contacts.filter((c) => c.engagementScore >= 30).length;

    // Top contacts by intent score
    const topByIntent = [...contacts]
      .sort((a, b) => b.intentScore - a.intentScore)
      .slice(0, 10)
      .map((c) => ({
        _id: c._id,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        company: c.company,
        intentScore: c.intentScore,
        engagementScore: c.engagementScore,
        lastActivityAt: c.lastActivityAt,
      }));

    return {
      totalContacts: contacts.length,
      highIntent,
      mediumIntent,
      highEngagement,
      topByIntent,
    };
  },
});
