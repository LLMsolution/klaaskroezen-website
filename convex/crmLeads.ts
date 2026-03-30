import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// ── Queries ──

export const getLeads = query({
  args: {
    status: v.optional(v.union(v.literal("open"), v.literal("won"), v.literal("lost"))),
    assignedTo: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, assignedTo, limit }) => {
    await requireAdmin(ctx);

    let leads;
    if (status) {
      leads = await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      leads = await ctx.db.query("leads").order("desc").collect();
    }

    if (assignedTo) {
      leads = leads.filter((l) => l.assignedTo === assignedTo);
    }

    // Enrich with contact info
    const enriched = [];
    for (const lead of leads.slice(0, limit ?? 200)) {
      const contact = await ctx.db.get(lead.contactId);
      const stage = await ctx.db.get(lead.stageId);
      enriched.push({
        ...lead,
        contact: contact
          ? { firstName: contact.firstName, lastName: contact.lastName, email: contact.email, company: contact.company }
          : null,
        stageName: stage?.name ?? "Onbekend",
        stageColor: stage?.color ?? "#999",
        stageOrder: stage?.order ?? 0,
      });
    }

    return enriched;
  },
});

export const getLeadsByStage = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const stages = await ctx.db
      .query("pipelineStages")
      .withIndex("by_order")
      .collect();

    const result = [];
    for (const stage of stages.sort((a, b) => a.order - b.order)) {
      const leads = await ctx.db
        .query("leads")
        .withIndex("by_stage", (q) => q.eq("stageId", stage._id))
        .collect();

      const openLeads = leads.filter((l) => l.status === "open");

      // Enrich with contact info
      const enrichedLeads = [];
      for (const lead of openLeads) {
        const contact = await ctx.db.get(lead.contactId);
        enrichedLeads.push({
          ...lead,
          contact: contact
            ? { firstName: contact.firstName, lastName: contact.lastName, email: contact.email, company: contact.company, engagementScore: contact.engagementScore, intentScore: contact.intentScore }
            : null,
        });
      }

      result.push({
        ...stage,
        leads: enrichedLeads,
        totalValue: openLeads.reduce((sum, l) => sum + (l.valueCents ?? 0), 0),
        count: openLeads.length,
      });
    }

    return result;
  },
});

export const getLeadById = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) return null;

    const contact = await ctx.db.get(lead.contactId);
    const stage = await ctx.db.get(lead.stageId);

    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .order("desc")
      .take(50);

    return {
      ...lead,
      contact,
      stage,
      activities,
    };
  },
});

export const getLeadsForContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => {
    await requireAdmin(ctx);
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_contact", (q) => q.eq("contactId", contactId))
      .collect();

    const enriched = [];
    for (const lead of leads) {
      const stage = await ctx.db.get(lead.stageId);
      enriched.push({
        ...lead,
        stageName: stage?.name ?? "Onbekend",
        stageColor: stage?.color ?? "#999",
      });
    }
    return enriched;
  },
});

export const getLeadsByMonth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Build 5 month buckets: current month + 4 ahead
    const now = new Date();
    const months: { key: string; label: string; start: number; end: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" }),
        start: d.getTime(),
        end: nextMonth.getTime(),
      });
    }

    // Get all open leads with expectedCloseAt set
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    const prospects = leads.filter(
      (l) => l.expectedCloseAt !== undefined && l.valueCents !== undefined,
    );

    const result = [];
    for (const month of months) {
      const monthLeads = prospects.filter(
        (l) => l.expectedCloseAt! >= month.start && l.expectedCloseAt! < month.end,
      );

      // Enrich with contact data
      const enrichedLeads = [];
      for (const lead of monthLeads) {
        const contact = await ctx.db.get(lead.contactId);
        const stage = await ctx.db.get(lead.stageId);
        enrichedLeads.push({
          ...lead,
          contact: contact
            ? { firstName: contact.firstName, lastName: contact.lastName, email: contact.email, company: contact.company }
            : null,
          stageName: stage?.name ?? "Onbekend",
          stageColor: stage?.color ?? "#999",
        });
      }

      const totalValue = monthLeads.reduce((sum, l) => sum + (l.valueCents ?? 0), 0);
      const weightedValue = monthLeads.reduce(
        (sum, l) => sum + Math.round((l.valueCents ?? 0) * l.probability / 100),
        0,
      );

      result.push({
        key: month.key,
        label: month.label,
        start: month.start,
        leads: enrichedLeads,
        totalValue,
        weightedValue,
        count: enrichedLeads.length,
      });
    }

    return result;
  },
});

// ── Mutations ──

export const createLead = mutation({
  args: {
    contactId: v.id("contacts"),
    title: v.string(),
    valueCents: v.optional(v.number()),
    source: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    stageId: v.optional(v.id("pipelineStages")),
    expectedCloseAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { email } = await requireAdmin(ctx);
    const now = Date.now();

    // Use provided stage or find default
    let stageId = args.stageId;
    if (!stageId) {
      const defaultStage = await ctx.db
        .query("pipelineStages")
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();
      if (!defaultStage) throw new Error("Geen pipeline stages gevonden. Seed eerst de default stages.");
      stageId = defaultStage._id;
    }

    const stage = await ctx.db.get(stageId);

    const leadId = await ctx.db.insert("leads", {
      contactId: args.contactId,
      stageId,
      title: args.title,
      valueCents: args.valueCents,
      probability: stage?.defaultProbability ?? 10,
      assignedTo: args.assignedTo,
      source: args.source,
      expectedCloseAt: args.expectedCloseAt,
      status: "open",
      createdAt: now,
    });

    // Log activity
    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: args.contactId,
      type: "lead_created",
      title: `Lead "${args.title}" aangemaakt`,
      performedBy: email,
      createdAt: now,
    });

    return leadId;
  },
});

export const updateLead = mutation({
  args: {
    leadId: v.id("leads"),
    title: v.optional(v.string()),
    valueCents: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    nextAction: v.optional(v.string()),
    nextActionAt: v.optional(v.number()),
    expectedCloseAt: v.optional(v.number()),
  },
  handler: async (ctx, { leadId, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(leadId, patch);
    }
  },
});

export const moveLead = mutation({
  args: {
    leadId: v.id("leads"),
    newStageId: v.id("pipelineStages"),
  },
  handler: async (ctx, { leadId, newStageId }) => {
    const { email } = await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead niet gevonden.");

    const oldStage = await ctx.db.get(lead.stageId);
    const newStage = await ctx.db.get(newStageId);

    await ctx.db.patch(leadId, {
      stageId: newStageId,
      probability: newStage?.defaultProbability ?? lead.probability,
    });

    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: lead.contactId,
      type: "stage_change",
      title: `Stage: ${oldStage?.name ?? "?"} → ${newStage?.name ?? "?"}`,
      performedBy: email,
      createdAt: Date.now(),
    });
  },
});

export const moveLeadToMonth = mutation({
  args: {
    leadId: v.id("leads"),
    expectedCloseAt: v.number(),
  },
  handler: async (ctx, { leadId, expectedCloseAt }) => {
    const { email } = await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead niet gevonden.");

    await ctx.db.patch(leadId, { expectedCloseAt });

    const monthLabel = new Date(expectedCloseAt).toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: lead.contactId,
      type: "note",
      title: `Verwachte sluitingsdatum gewijzigd naar ${monthLabel}`,
      performedBy: email,
      createdAt: Date.now(),
    });
  },
});

export const assignLead = mutation({
  args: {
    leadId: v.id("leads"),
    assignedTo: v.string(),
  },
  handler: async (ctx, { leadId, assignedTo }) => {
    const { email } = await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead niet gevonden.");

    await ctx.db.patch(leadId, { assignedTo });
    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: lead.contactId,
      type: "note",
      title: `Toegewezen aan ${assignedTo}`,
      performedBy: email,
      createdAt: Date.now(),
    });
  },
});

export const setNextAction = mutation({
  args: {
    leadId: v.id("leads"),
    nextAction: v.string(),
    nextActionAt: v.number(),
  },
  handler: async (ctx, { leadId, nextAction, nextActionAt }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(leadId, { nextAction, nextActionAt });
  },
});

export const winLead = mutation({
  args: {
    leadId: v.id("leads"),
    purchaseId: v.optional(v.id("purchases")),
  },
  handler: async (ctx, { leadId, purchaseId }) => {
    const { email } = await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead niet gevonden.");

    await ctx.db.patch(leadId, {
      status: "won",
      probability: 100,
      purchaseId,
      closedAt: Date.now(),
    });

    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: lead.contactId,
      type: "lead_won",
      title: `Lead "${lead.title}" gewonnen`,
      performedBy: email,
      purchaseId,
      createdAt: Date.now(),
    });
  },
});

export const loseLead = mutation({
  args: {
    leadId: v.id("leads"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { leadId, reason }) => {
    const { email } = await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead niet gevonden.");

    await ctx.db.patch(leadId, {
      status: "lost",
      probability: 0,
      lostReason: reason,
      closedAt: Date.now(),
    });

    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: lead.contactId,
      type: "lead_lost",
      title: `Lead "${lead.title}" verloren${reason ? `: ${reason}` : ""}`,
      performedBy: email,
      createdAt: Date.now(),
    });
  },
});

export const deleteLead = mutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, { leadId }) => {
    await requireAdmin(ctx);
    // Delete associated activities
    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .collect();
    for (const a of activities) {
      await ctx.db.delete(a._id);
    }
    await ctx.db.delete(leadId);
  },
});

export const addNote = mutation({
  args: {
    leadId: v.id("leads"),
    type: v.union(v.literal("note"), v.literal("call"), v.literal("meeting")),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { leadId, type, title, description }) => {
    const { email } = await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead niet gevonden.");

    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: lead.contactId,
      type,
      title,
      description,
      performedBy: email,
      createdAt: Date.now(),
    });
  },
});

// ── Internal ──

export const createLeadInternal = internalMutation({
  args: {
    contactId: v.id("contacts"),
    title: v.string(),
    valueCents: v.optional(v.number()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const defaultStage = await ctx.db
      .query("pipelineStages")
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();
    if (!defaultStage) return null;

    const now = Date.now();
    const leadId = await ctx.db.insert("leads", {
      contactId: args.contactId,
      stageId: defaultStage._id,
      title: args.title,
      valueCents: args.valueCents,
      probability: defaultStage.defaultProbability,
      source: args.source,
      status: "open",
      createdAt: now,
    });

    await ctx.db.insert("leadActivities", {
      leadId,
      contactId: args.contactId,
      type: "lead_created",
      title: `Lead "${args.title}" automatisch aangemaakt`,
      createdAt: now,
    });

    return leadId;
  },
});
