import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

/* ═══════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════ */

export const getStages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const stages = await ctx.db
      .query("pipelineStages")
      .withIndex("by_order")
      .collect();
    return stages.sort((a, b) => a.order - b.order);
  },
});

export const getPipelineStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const stages = await ctx.db
      .query("pipelineStages")
      .withIndex("by_order")
      .collect();

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Won leads in last 30 days
    const allLeads = await ctx.db.query("leads").collect();
    const wonRecent = allLeads.filter(
      (l) => l.status === "won" && l.closedAt && l.closedAt > thirtyDaysAgo,
    );
    const lostRecent = allLeads.filter(
      (l) => l.status === "lost" && l.closedAt && l.closedAt > thirtyDaysAgo,
    );

    const totalPipelineValue = leads.reduce(
      (sum, l) => sum + (l.valueCents ?? 0),
      0,
    );
    const weightedPipelineValue = leads.reduce(
      (sum, l) => sum + ((l.valueCents ?? 0) * l.probability) / 100,
      0,
    );

    const wonRevenue = wonRecent.reduce(
      (sum, l) => sum + (l.valueCents ?? 0),
      0,
    );

    const winRate =
      wonRecent.length + lostRecent.length > 0
        ? Math.round(
            (wonRecent.length / (wonRecent.length + lostRecent.length)) * 100,
          )
        : 0;

    // Per-stage stats
    const stageStats = stages
      .sort((a, b) => a.order - b.order)
      .map((stage) => {
        const stageLeads = leads.filter(
          (l) => l.stageId === stage._id,
        );
        return {
          name: stage.name,
          color: stage.color,
          count: stageLeads.length,
          value: stageLeads.reduce(
            (sum, l) => sum + (l.valueCents ?? 0),
            0,
          ),
        };
      });

    return {
      totalOpenLeads: leads.length,
      totalPipelineValue,
      weightedPipelineValue,
      wonRevenue30d: wonRevenue,
      wonCount30d: wonRecent.length,
      lostCount30d: lostRecent.length,
      winRate,
      stageStats,
    };
  },
});

/* ═══════════════════════════════════════════
   MUTATIONS
   ═══════════════════════════════════════════ */

export const createStage = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    color: v.string(),
    defaultProbability: v.number(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get next order number
    const stages = await ctx.db.query("pipelineStages").collect();
    const maxOrder = stages.reduce((max, s) => Math.max(max, s.order), -1);

    // If setting as default, unset others
    if (args.isDefault) {
      for (const s of stages) {
        if (s.isDefault) {
          await ctx.db.patch(s._id, { isDefault: false });
        }
      }
    }

    return await ctx.db.insert("pipelineStages", {
      name: args.name,
      slug: args.slug,
      order: maxOrder + 1,
      color: args.color,
      defaultProbability: args.defaultProbability,
      isDefault: args.isDefault ?? false,
      createdAt: Date.now(),
    });
  },
});

export const updateStage = mutation({
  args: {
    stageId: v.id("pipelineStages"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    defaultProbability: v.optional(v.number()),
  },
  handler: async (ctx, { stageId, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(stageId, patch);
    }
  },
});

export const reorderStages = mutation({
  args: {
    stageIds: v.array(v.id("pipelineStages")),
  },
  handler: async (ctx, { stageIds }) => {
    await requireAdmin(ctx);
    for (let i = 0; i < stageIds.length; i++) {
      await ctx.db.patch(stageIds[i], { order: i });
    }
  },
});

export const deleteStage = mutation({
  args: { stageId: v.id("pipelineStages") },
  handler: async (ctx, { stageId }) => {
    await requireAdmin(ctx);

    // Check for leads in this stage
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_stage", (q) => q.eq("stageId", stageId))
      .first();
    if (leads) {
      throw new Error("Kan stage niet verwijderen: er zijn nog leads in deze fase.");
    }

    await ctx.db.delete(stageId);
  },
});

export const seedDefaultStages = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Only seed if no stages exist
    const existing = await ctx.db.query("pipelineStages").first();
    if (existing) {
      throw new Error("Pipeline stages bestaan al.");
    }

    const now = Date.now();
    const defaults = [
      { name: "Nieuw", slug: "nieuw", order: 0, color: "#6B7280", defaultProbability: 10, isDefault: true },
      { name: "Kennismaking", slug: "kennismaking", order: 1, color: "#3B82F6", defaultProbability: 25, isDefault: false },
      { name: "Behoefteanalyse", slug: "behoefteanalyse", order: 2, color: "#8B5CF6", defaultProbability: 40, isDefault: false },
      { name: "Voorstel", slug: "voorstel", order: 3, color: "#F59E0B", defaultProbability: 60, isDefault: false },
      { name: "Onderhandeling", slug: "onderhandeling", order: 4, color: "#F97316", defaultProbability: 80, isDefault: false },
      { name: "Gewonnen", slug: "gewonnen", order: 5, color: "#10B981", defaultProbability: 100, isDefault: false },
      { name: "Verloren", slug: "verloren", order: 6, color: "#EF4444", defaultProbability: 0, isDefault: false },
    ];

    for (const stage of defaults) {
      await ctx.db.insert("pipelineStages", { ...stage, createdAt: now });
    }
  },
});
