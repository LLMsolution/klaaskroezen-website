import { v } from "convex/values";
import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/** Execute the current step for an enrollment */
export const executeStep = internalMutation({
  args: { enrollmentId: v.id("workflowEnrollments") },
  handler: async (ctx, { enrollmentId }) => {
    const enrollment = await ctx.db.get(enrollmentId);
    if (!enrollment) return;
    if (enrollment.status !== "active") return;
    if (!enrollment.currentStepId) {
      // No more steps — complete
      await ctx.db.patch(enrollmentId, { status: "completed", completedAt: Date.now() });
      const wf = await ctx.db.get(enrollment.workflowId);
      if (wf) await ctx.db.patch(wf._id, { completedCount: (wf.completedCount ?? 0) + 1 });
      return;
    }

    const step = await ctx.db.get(enrollment.currentStepId);
    if (!step) {
      await ctx.db.patch(enrollmentId, { status: "completed", completedAt: Date.now() });
      return;
    }

    const config = step.config ? JSON.parse(step.config) : {};
    const contact = await ctx.db.get(enrollment.contactId);
    if (!contact) {
      await ctx.db.patch(enrollmentId, { status: "cancelled", cancelledAt: Date.now() });
      return;
    }

    // ── Execute based on step type ──

    if (step.type === "send_email") {
      // Schedule email send via existing email system
      if (config.templateKey && contact.email) {
        await ctx.scheduler.runAfter(0, internal.workflowEngine.sendWorkflowEmail, {
          to: contact.email,
          templateKey: config.templateKey,
          contactId: enrollment.contactId,
          enrollmentId,
        });
      }
      await advanceToNext(ctx, enrollment, step);
    }

    else if (step.type === "wait") {
      const delayMs = (config.days ?? 1) * 24 * 60 * 60 * 1000;
      await ctx.db.patch(enrollmentId, {
        status: "waiting",
        nextRunAt: Date.now() + delayMs,
      });
      // The cron will pick this up when nextRunAt is reached
    }

    else if (step.type === "if_else") {
      const conditionMet = await evaluateCondition(ctx, config, contact, enrollment);
      if (conditionMet && step.nextStepId) {
        await ctx.db.patch(enrollmentId, { currentStepId: step.nextStepId });
        await ctx.scheduler.runAfter(0, internal.workflowEngine.executeStep, { enrollmentId });
      } else if (!conditionMet && step.elseBranchStepId) {
        await ctx.db.patch(enrollmentId, { currentStepId: step.elseBranchStepId });
        await ctx.scheduler.runAfter(0, internal.workflowEngine.executeStep, { enrollmentId });
      } else {
        // No matching branch — complete
        await ctx.db.patch(enrollmentId, { status: "completed", completedAt: Date.now() });
      }
    }

    else if (step.type === "add_tag") {
      if (config.tag) {
        const tags = contact.tags || [];
        if (!tags.includes(config.tag)) {
          await ctx.db.patch(contact._id, { tags: [...tags, config.tag] });
          // Fire tag_added trigger for other workflows
          await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
            trigger: "tag_added",
            contactId: contact._id,
            metadata: JSON.stringify({ tag: config.tag }),
          });
        }
      }
      await advanceToNext(ctx, enrollment, step);
    }

    else if (step.type === "remove_tag") {
      if (config.tag) {
        const tags = contact.tags || [];
        if (tags.includes(config.tag)) {
          await ctx.db.patch(contact._id, { tags: tags.filter((t: string) => t !== config.tag) });
          await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
            trigger: "tag_removed",
            contactId: contact._id,
            metadata: JSON.stringify({ tag: config.tag }),
          });
        }
      }
      await advanceToNext(ctx, enrollment, step);
    }

    else if (step.type === "update_score") {
      const scoreType = config.scoreType ?? "intent";
      const delta = config.delta ?? 0;
      if (scoreType === "intent") {
        await ctx.db.patch(contact._id, { intentScore: (contact.intentScore ?? 0) + delta });
      } else {
        await ctx.db.patch(contact._id, { engagementScore: (contact.engagementScore ?? 0) + delta });
      }
      await advanceToNext(ctx, enrollment, step);
    }

    else if (step.type === "move_stage") {
      // Find lead for this contact and move stage
      if (config.stageSlug) {
        const stage = await ctx.db.query("pipelineStages")
          .withIndex("by_slug", (q) => q.eq("slug", config.stageSlug))
          .first();
        if (stage) {
          const lead = await ctx.db.query("leads")
            .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
            .filter((q) => q.eq(q.field("status"), "open"))
            .first();
          if (lead) {
            await ctx.db.patch(lead._id, { stageId: stage._id, probability: stage.defaultProbability });
          }
        }
      }
      await advanceToNext(ctx, enrollment, step);
    }

    else if (step.type === "notify_team") {
      // Send notification (log for now)
      console.log(`[Workflow] Notify team: ${config.message ?? "Contact requires attention"} — ${contact.email}`);
      await advanceToNext(ctx, enrollment, step);
    }

    else if (step.type === "goal") {
      // Goals are checked when evaluating if_else conditions
      // If we reach a goal step, it means the goal was achieved
      await ctx.db.patch(enrollmentId, { status: "completed", completedAt: Date.now() });
      const wf = await ctx.db.get(enrollment.workflowId);
      if (wf) await ctx.db.patch(wf._id, { completedCount: (wf.completedCount ?? 0) + 1 });
    }

    else if (step.type === "start_workflow") {
      if (config.workflowId) {
        await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
          trigger: "manual",
          contactId: contact._id,
          metadata: JSON.stringify({ sourceWorkflowId: enrollment.workflowId }),
        });
      }
      await advanceToNext(ctx, enrollment, step);
    }

    else if (step.type === "webhook") {
      if (config.url) {
        await ctx.scheduler.runAfter(0, internal.workflowEngine.callWebhook, {
          url: config.url,
          contactEmail: contact.email,
          contactName: contact.firstName,
          metadata: enrollment.metadata,
        });
      }
      await advanceToNext(ctx, enrollment, step);
    }

    else {
      // Unknown step type — skip
      await advanceToNext(ctx, enrollment, step);
    }
  },
});

/** Advance enrollment to the next step */
async function advanceToNext(
  ctx: any,
  enrollment: { _id: any; workflowId: any },
  step: { nextStepId?: any },
) {
  if (step.nextStepId) {
    await ctx.db.patch(enrollment._id, { currentStepId: step.nextStepId, status: "active" });
    await ctx.scheduler.runAfter(100, internal.workflowEngine.executeStep, { enrollmentId: enrollment._id });
  } else {
    await ctx.db.patch(enrollment._id, { status: "completed", completedAt: Date.now() });
    const wf = await ctx.db.get(enrollment.workflowId);
    if (wf) await ctx.db.patch(wf._id, { completedCount: (wf.completedCount ?? 0) + 1 });
  }
}

/** Evaluate if/else condition */
async function evaluateCondition(
  ctx: any,
  config: Record<string, unknown>,
  contact: any,
  enrollment: any,
): Promise<boolean> {
  const condType = config.condition as string;

  if (condType === "has_tag") {
    return (contact.tags || []).includes(config.tag as string);
  }
  if (condType === "score_above") {
    const scoreType = (config.scoreType as string) ?? "intent";
    const threshold = (config.threshold as number) ?? 0;
    return scoreType === "intent" ? contact.intentScore >= threshold : contact.engagementScore >= threshold;
  }
  if (condType === "email_opened") {
    // Check if any email was opened in the last X days
    const days = (config.days as number) ?? 7;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const emails = await ctx.db.query("emailLog")
      .withIndex("by_to", (q: any) => q.eq("to", contact.email))
      .filter((q: any) => q.and(q.gte(q.field("createdAt"), since), q.gt(q.field("openCount"), 0)))
      .first();
    return !!emails;
  }
  if (condType === "email_clicked") {
    const days = (config.days as number) ?? 7;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const emails = await ctx.db.query("emailLog")
      .withIndex("by_to", (q: any) => q.eq("to", contact.email))
      .filter((q: any) => q.and(q.gte(q.field("createdAt"), since), q.gt(q.field("clickCount"), 0)))
      .first();
    return !!emails;
  }
  if (condType === "has_purchase") {
    const purchases = await ctx.db.query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", contact.userId))
      .filter((q: any) => q.eq(q.field("status"), "paid"))
      .first();
    return !!purchases;
  }

  return false;
}

/** Process waiting enrollments — called by cron */
export const processWaitingEnrollments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ready = await ctx.db.query("workflowEnrollments")
      .withIndex("by_status")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "waiting"),
          q.lte(q.field("nextRunAt"), now),
        ),
      )
      .take(50);

    for (const enrollment of ready) {
      // Advance to next step
      if (enrollment.currentStepId) {
        const step = await ctx.db.get(enrollment.currentStepId);
        if (step?.nextStepId) {
          await ctx.db.patch(enrollment._id, {
            currentStepId: step.nextStepId,
            status: "active",
            nextRunAt: undefined,
          });
          await ctx.scheduler.runAfter(0, internal.workflowEngine.executeStep, {
            enrollmentId: enrollment._id,
          });
        } else {
          await ctx.db.patch(enrollment._id, { status: "completed", completedAt: now });
        }
      }
    }
  },
});

/** Check goals for all active enrollments in a workflow */
export const checkGoals = internalMutation({
  args: { workflowId: v.id("workflows"), contactId: v.id("contacts") },
  handler: async (ctx, { workflowId, contactId }) => {
    const enrollments = await ctx.db.query("workflowEnrollments")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
      .filter((q) =>
        q.and(
          q.eq(q.field("contactId"), contactId),
          q.or(q.eq(q.field("status"), "active"), q.eq(q.field("status"), "waiting")),
        ),
      )
      .collect();

    for (const enrollment of enrollments) {
      // Find any goal steps in this workflow
      const steps = await ctx.db.query("workflowSteps")
        .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
        .filter((q) => q.eq(q.field("type"), "goal"))
        .collect();

      for (const goalStep of steps) {
        const config = goalStep.config ? JSON.parse(goalStep.config) : {};
        const contact = await ctx.db.get(contactId);
        if (contact && await evaluateCondition(ctx, config, contact, enrollment)) {
          // Goal achieved — jump to goal step and complete
          await ctx.db.patch(enrollment._id, {
            currentStepId: goalStep._id,
            status: "completed",
            completedAt: Date.now(),
          });
          const wf = await ctx.db.get(workflowId);
          if (wf) await ctx.db.patch(wf._id, { completedCount: (wf.completedCount ?? 0) + 1 });
          break;
        }
      }
    }
  },
});

/** Send email from workflow step */
export const sendWorkflowEmail = internalMutation({
  args: {
    to: v.string(),
    templateKey: v.string(),
    contactId: v.id("contacts"),
    enrollmentId: v.id("workflowEnrollments"),
  },
  handler: async (ctx, { to, templateKey, contactId }) => {
    // Look up template from emailTemplates table
    const template = await ctx.db.query("emailTemplates")
      .withIndex("by_key", (q) => q.eq("templateKey", templateKey))
      .first();

    if (!template) {
      console.log(`[Workflow] Template not found: ${templateKey}`);
      return;
    }

    // Insert into email log for tracking
    await ctx.db.insert("emailLog", {
      to,
      subject: template.subjectNl,
      template: templateKey,
      status: "queued",
      createdAt: Date.now(),
    });

    // The actual email sending would be handled by the email system
    // For now, schedule via the existing sendEmail function
    console.log(`[Workflow] Email queued: ${templateKey} → ${to}`);
  },
});

/** Call external webhook */
export const callWebhook = internalAction({
  args: {
    url: v.string(),
    contactEmail: v.string(),
    contactName: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, { url, contactEmail, contactName, metadata }) => {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactEmail, name: contactName, metadata }),
      });
    } catch (err) {
      console.log(`[Workflow] Webhook failed: ${url}`, err);
    }
  },
});
