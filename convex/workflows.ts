import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import type { Id } from "./_generated/dataModel";

// ── Admin queries ──

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("workflows").collect();
  },
});

export const getWorkflow = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const workflow = await ctx.db.get(id);
    if (!workflow) return null;
    const steps = await ctx.db
      .query("workflowSteps")
      .withIndex("by_workflow", (q) => q.eq("workflowId", id))
      .collect();
    const enrollments = await ctx.db
      .query("workflowEnrollments")
      .withIndex("by_workflow", (q) => q.eq("workflowId", id))
      .collect();
    return {
      ...workflow,
      steps: steps.sort((a, b) => a.sortOrder - b.sortOrder),
      activeEnrollments: enrollments.filter((e) => e.status === "active" || e.status === "waiting").length,
      totalEnrollments: enrollments.length,
    };
  },
});

// ── Admin mutations ──

export const createWorkflow = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.string(),
    triggerConfig: v.optional(v.string()),
    allowReentry: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("workflows", {
      name: args.name,
      description: args.description,
      trigger: args.trigger as any,
      triggerConfig: args.triggerConfig,
      active: false,
      allowReentry: args.allowReentry ?? false,
      enrolledCount: 0,
      completedCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateWorkflow = mutation({
  args: {
    id: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.string()),
    triggerConfig: v.optional(v.string()),
    active: v.optional(v.boolean()),
    allowReentry: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) patch[k] = val;
    }
    if (Object.keys(patch).length > 0) await ctx.db.patch(id, patch);
  },
});

export const deleteWorkflow = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    // Delete steps
    const steps = await ctx.db.query("workflowSteps").withIndex("by_workflow", (q) => q.eq("workflowId", id)).collect();
    for (const s of steps) await ctx.db.delete(s._id);
    // Cancel active enrollments
    const enrollments = await ctx.db.query("workflowEnrollments").withIndex("by_workflow", (q) => q.eq("workflowId", id)).collect();
    for (const e of enrollments) {
      if (e.status === "active" || e.status === "waiting") {
        await ctx.db.patch(e._id, { status: "cancelled", cancelledAt: Date.now() });
      }
    }
    await ctx.db.delete(id);
  },
});

// ── Step CRUD ──

export const addStep = mutation({
  args: {
    workflowId: v.id("workflows"),
    type: v.string(),
    config: v.string(),
    afterStepId: v.optional(v.id("workflowSteps")),
  },
  handler: async (ctx, { workflowId, type, config, afterStepId }) => {
    await requireAdmin(ctx);
    const steps = await ctx.db.query("workflowSteps").withIndex("by_workflow", (q) => q.eq("workflowId", workflowId)).collect();
    const maxOrder = steps.reduce((max, s) => Math.max(max, s.sortOrder), -1);

    const newStepId = await ctx.db.insert("workflowSteps", {
      workflowId,
      type: type as any,
      config,
      sortOrder: maxOrder + 1,
      createdAt: Date.now(),
    });

    // Link previous step to this one
    if (afterStepId) {
      await ctx.db.patch(afterStepId, { nextStepId: newStepId });
    }

    return newStepId;
  },
});

export const updateStep = mutation({
  args: {
    id: v.id("workflowSteps"),
    type: v.optional(v.string()),
    config: v.optional(v.string()),
    nextStepId: v.optional(v.id("workflowSteps")),
    elseBranchStepId: v.optional(v.id("workflowSteps")),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) patch[k] = val;
    }
    if (Object.keys(patch).length > 0) await ctx.db.patch(id, patch);
  },
});

export const deleteStep = mutation({
  args: { id: v.id("workflowSteps") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const step = await ctx.db.get(id);
    if (!step) return;
    // Relink: find step that points to this one and redirect to our nextStepId
    const allSteps = await ctx.db.query("workflowSteps").withIndex("by_workflow", (q) => q.eq("workflowId", step.workflowId)).collect();
    for (const s of allSteps) {
      if (s.nextStepId === id) await ctx.db.patch(s._id, { nextStepId: step.nextStepId });
      if (s.elseBranchStepId === id) await ctx.db.patch(s._id, { elseBranchStepId: step.nextStepId });
    }
    await ctx.db.delete(id);
  },
});

// ── Enrollment ──

export const enrollContact = mutation({
  args: {
    workflowId: v.id("workflows"),
    contactId: v.id("contacts"),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, { workflowId, contactId, metadata }) => {
    const workflow = await ctx.db.get(workflowId);
    if (!workflow || !workflow.active) return null;

    // Check reentry
    if (!workflow.allowReentry) {
      const existing = await ctx.db.query("workflowEnrollments")
        .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
        .filter((q) => q.eq(q.field("contactId"), contactId))
        .first();
      if (existing) return null;
    }

    // Find first step
    const steps = await ctx.db.query("workflowSteps")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
      .collect();
    const sorted = steps.sort((a, b) => a.sortOrder - b.sortOrder);
    const firstStep = sorted[0];

    const enrollmentId = await ctx.db.insert("workflowEnrollments", {
      workflowId,
      contactId,
      currentStepId: firstStep?._id,
      status: firstStep ? "active" : "completed",
      metadata,
      createdAt: Date.now(),
    });

    await ctx.db.patch(workflowId, { enrolledCount: workflow.enrolledCount + 1 });

    // Schedule first step execution
    if (firstStep) {
      await ctx.scheduler.runAfter(0, internal.workflowEngine.executeStep, {
        enrollmentId,
      });
    }

    return enrollmentId;
  },
});

export const pauseEnrollment = mutation({
  args: { id: v.id("workflowEnrollments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status: "paused", pausedAt: Date.now() });
  },
});

export const resumeEnrollment = mutation({
  args: { id: v.id("workflowEnrollments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const enrollment = await ctx.db.get(id);
    if (!enrollment || enrollment.status !== "paused") return;
    await ctx.db.patch(id, { status: "active", pausedAt: undefined });
    // Resume execution
    await ctx.scheduler.runAfter(0, internal.workflowEngine.executeStep, { enrollmentId: id });
  },
});

export const cancelEnrollment = mutation({
  args: { id: v.id("workflowEnrollments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status: "cancelled", cancelledAt: Date.now() });
  },
});

// ── Internal: Find and enroll contacts for a trigger ──

export const evaluateTrigger = internalMutation({
  args: {
    trigger: v.string(),
    contactId: v.id("contacts"),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, { trigger, contactId, metadata }) => {
    // Find all active workflows with this trigger
    const workflows = await ctx.db.query("workflows")
      .withIndex("by_trigger", (q) => q.eq("trigger", trigger as any).eq("active", true))
      .collect();

    for (const wf of workflows) {
      // Check trigger config match
      if (wf.triggerConfig) {
        const config = JSON.parse(wf.triggerConfig);
        if (metadata) {
          const meta = JSON.parse(metadata);
          // Tag trigger: check tag matches
          if (trigger === "tag_added" || trigger === "tag_removed") {
            if (config.tag && config.tag !== meta.tag) continue;
          }
          // Product trigger: check product matches
          if (trigger === "purchase" || trigger === "checkout_abandoned") {
            if (config.product && config.product !== meta.product && config.product !== "*") continue;
          }
          // Score threshold: check score
          if (trigger === "score_threshold") {
            if (config.threshold && meta.score < config.threshold) continue;
          }
        }
      }

      // Enroll (reuses the public mutation logic but without admin auth)
      const workflow = await ctx.db.get(wf._id);
      if (!workflow || !workflow.active) continue;

      if (!workflow.allowReentry) {
        const existing = await ctx.db.query("workflowEnrollments")
          .withIndex("by_workflow", (q) => q.eq("workflowId", wf._id))
          .filter((q) => q.eq(q.field("contactId"), contactId))
          .first();
        if (existing) continue;
      }

      const steps = await ctx.db.query("workflowSteps")
        .withIndex("by_workflow", (q) => q.eq("workflowId", wf._id))
        .collect();
      const firstStep = steps.sort((a, b) => a.sortOrder - b.sortOrder)[0];

      const enrollmentId = await ctx.db.insert("workflowEnrollments", {
        workflowId: wf._id,
        contactId,
        currentStepId: firstStep?._id,
        status: firstStep ? "active" : "completed",
        metadata,
        createdAt: Date.now(),
      });

      await ctx.db.patch(wf._id, { enrolledCount: (workflow.enrolledCount ?? 0) + 1 });

      if (firstStep) {
        await ctx.scheduler.runAfter(0, internal.workflowEngine.executeStep, { enrollmentId });
      }
    }
  },
});

// ── Internal: list enrollments ready to process ──

export const listReadyEnrollments = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db.query("workflowEnrollments")
      .withIndex("by_next_run")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "waiting"),
          q.lte(q.field("nextRunAt"), now),
        ),
      )
      .collect();
  },
});
