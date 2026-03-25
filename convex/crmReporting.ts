import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

/** Pipeline value per stage (total + weighted) */
export const getPipelineReport = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const stages = await ctx.db.query("pipelineStages").collect();
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    const stageReport = stages
      .sort((a, b) => a.order - b.order)
      .map((stage) => {
        const stageLeads = leads.filter((l) => l.stageId === stage._id);
        const totalValue = stageLeads.reduce((sum, l) => sum + (l.valueCents ?? 0), 0);
        const weightedValue = stageLeads.reduce(
          (sum, l) => sum + ((l.valueCents ?? 0) * l.probability) / 100,
          0,
        );
        return {
          name: stage.name,
          color: stage.color,
          count: stageLeads.length,
          totalValue,
          weightedValue,
        };
      });

    const totalPipeline = stageReport.reduce((sum, s) => sum + s.totalValue, 0);
    const weightedPipeline = stageReport.reduce((sum, s) => sum + s.weightedValue, 0);

    return { stages: stageReport, totalPipeline, weightedPipeline };
  },
});

/** Conversion rate between stages */
export const getConversionReport = query({
  args: { periodDays: v.optional(v.number()) },
  handler: async (ctx, { periodDays }) => {
    await requireAdmin(ctx);

    const cutoff = periodDays
      ? Date.now() - periodDays * 24 * 60 * 60 * 1000
      : 0;

    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("by_type", (q) => q.eq("type", "stage_change"))
      .collect();

    const filtered = cutoff
      ? activities.filter((a) => a.createdAt > cutoff)
      : activities;

    // Count transitions between stages
    const transitions: Record<string, number> = {};
    for (const activity of filtered) {
      // Parse "Stage: A → B" from title
      const match = activity.title.match(/Stage: (.+) → (.+)/);
      if (match) {
        const key = `${match[1]} → ${match[2]}`;
        transitions[key] = (transitions[key] ?? 0) + 1;
      }
    }

    return { transitions, totalTransitions: filtered.length };
  },
});

/** Revenue forecast 30/60/90 days */
export const getForecast = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    // Weighted value = value * probability / 100
    const forecast30 = leads
      .filter((l) => (l.valueCents ?? 0) > 0)
      .reduce((sum, l) => sum + ((l.valueCents ?? 0) * Math.min(l.probability + 10, 100)) / 100, 0);

    const forecast60 = leads
      .filter((l) => (l.valueCents ?? 0) > 0)
      .reduce((sum, l) => sum + ((l.valueCents ?? 0) * Math.min(l.probability + 20, 100)) / 100, 0);

    const forecast90 = leads
      .filter((l) => (l.valueCents ?? 0) > 0)
      .reduce((sum, l) => sum + ((l.valueCents ?? 0) * Math.min(l.probability + 30, 100)) / 100, 0);

    return { forecast30, forecast60, forecast90 };
  },
});

/** Win rate per team member */
export const getTeamPerformance = query({
  args: { periodDays: v.optional(v.number()) },
  handler: async (ctx, { periodDays }) => {
    await requireAdmin(ctx);

    const cutoff = periodDays
      ? Date.now() - periodDays * 24 * 60 * 60 * 1000
      : 0;

    const allLeads = await ctx.db.query("leads").collect();
    const leads = cutoff
      ? allLeads.filter((l) => l.closedAt && l.closedAt > cutoff)
      : allLeads.filter((l) => l.closedAt);

    // Group by assignee
    const teamMap = new Map<string, { won: number; lost: number; revenue: number }>();

    for (const lead of leads) {
      const assignee = lead.assignedTo ?? "Niet toegewezen";
      const stats = teamMap.get(assignee) ?? { won: 0, lost: 0, revenue: 0 };
      if (lead.status === "won") {
        stats.won++;
        stats.revenue += lead.valueCents ?? 0;
      } else if (lead.status === "lost") {
        stats.lost++;
      }
      teamMap.set(assignee, stats);
    }

    return Array.from(teamMap.entries())
      .map(([assignee, stats]) => ({
        assignee,
        won: stats.won,
        lost: stats.lost,
        revenue: stats.revenue,
        winRate: stats.won + stats.lost > 0
          ? Math.round((stats.won / (stats.won + stats.lost)) * 100)
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  },
});

/** Lead source effectiveness */
export const getSourceReport = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const leads = await ctx.db.query("leads").collect();

    // Group by source
    const sourceMap = new Map<string, { total: number; won: number; revenue: number }>();

    for (const lead of leads) {
      const source = lead.source ?? "Onbekend";
      const stats = sourceMap.get(source) ?? { total: 0, won: 0, revenue: 0 };
      stats.total++;
      if (lead.status === "won") {
        stats.won++;
        stats.revenue += lead.valueCents ?? 0;
      }
      sourceMap.set(source, stats);
    }

    return Array.from(sourceMap.entries())
      .map(([source, stats]) => ({
        source,
        total: stats.total,
        won: stats.won,
        revenue: stats.revenue,
        conversionRate: stats.total > 0
          ? Math.round((stats.won / stats.total) * 100)
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  },
});

/** Average deal cycle time */
export const getCycleTime = query({
  args: { periodDays: v.optional(v.number()) },
  handler: async (ctx, { periodDays }) => {
    await requireAdmin(ctx);

    const cutoff = periodDays
      ? Date.now() - periodDays * 24 * 60 * 60 * 1000
      : 0;

    const wonLeads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "won"))
      .collect();

    const filtered = cutoff
      ? wonLeads.filter((l) => l.closedAt && l.closedAt > cutoff)
      : wonLeads;

    if (filtered.length === 0) return { avgDays: 0, count: 0 };

    const totalDays = filtered.reduce((sum, l) => {
      const days = (l.closedAt! - l.createdAt) / (24 * 60 * 60 * 1000);
      return sum + days;
    }, 0);

    return {
      avgDays: Math.round(totalDays / filtered.length),
      count: filtered.length,
    };
  },
});
