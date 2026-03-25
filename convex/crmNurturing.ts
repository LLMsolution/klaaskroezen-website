import { v } from "convex/values";
import { query, mutation, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { langValidator } from "./schema";

/* ═══════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════ */

export const getSequences = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("nurturingSequences").order("desc").collect();
  },
});

export const getSequenceById = query({
  args: { sequenceId: v.id("nurturingSequences") },
  handler: async (ctx, { sequenceId }) => {
    await requireAdmin(ctx);
    const sequence = await ctx.db.get(sequenceId);
    if (!sequence) return null;

    const steps = await ctx.db
      .query("nurturingSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", sequenceId))
      .collect();

    const enrollments = await ctx.db
      .query("nurturingEnrollments")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", sequenceId))
      .collect();

    return {
      ...sequence,
      steps: steps.sort((a, b) => a.order - b.order),
      enrollments: {
        active: enrollments.filter((e) => e.status === "active").length,
        completed: enrollments.filter((e) => e.status === "completed").length,
        cancelled: enrollments.filter((e) => e.status === "cancelled").length,
      },
    };
  },
});

export const getEnrollments = query({
  args: { sequenceId: v.id("nurturingSequences") },
  handler: async (ctx, { sequenceId }) => {
    await requireAdmin(ctx);
    const enrollments = await ctx.db
      .query("nurturingEnrollments")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", sequenceId))
      .collect();

    const enriched = [];
    for (const enrollment of enrollments) {
      const contact = await ctx.db.get(enrollment.contactId);
      enriched.push({
        ...enrollment,
        contact: contact
          ? { email: contact.email, firstName: contact.firstName, lastName: contact.lastName }
          : null,
      });
    }
    return enriched;
  },
});

/* ═══════════════════════════════════════════
   MUTATIONS
   ═══════════════════════════════════════════ */

export const createSequence = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("nurturingSequences", {
      name: args.name,
      description: args.description,
      active: false,
      totalSteps: 0,
      enrolledCount: 0,
      completedCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateSequence = mutation({
  args: {
    sequenceId: v.id("nurturingSequences"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { sequenceId, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(sequenceId, patch);
    }
  },
});

export const deleteSequence = mutation({
  args: { sequenceId: v.id("nurturingSequences") },
  handler: async (ctx, { sequenceId }) => {
    await requireAdmin(ctx);
    // Delete steps
    const steps = await ctx.db
      .query("nurturingSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", sequenceId))
      .collect();
    for (const step of steps) await ctx.db.delete(step._id);
    // Cancel active enrollments
    const enrollments = await ctx.db
      .query("nurturingEnrollments")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", sequenceId))
      .collect();
    for (const e of enrollments) {
      if (e.status === "active") {
        await ctx.db.patch(e._id, { status: "cancelled", cancelReason: "sequence_deleted" });
      }
    }
    await ctx.db.delete(sequenceId);
  },
});

export const addStep = mutation({
  args: {
    sequenceId: v.id("nurturingSequences"),
    templateKey: v.string(),
    delayDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const steps = await ctx.db
      .query("nurturingSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", args.sequenceId))
      .collect();

    const maxOrder = steps.reduce((max, s) => Math.max(max, s.order), -1);

    const stepId = await ctx.db.insert("nurturingSteps", {
      sequenceId: args.sequenceId,
      order: maxOrder + 1,
      templateKey: args.templateKey,
      delayDays: args.delayDays,
      createdAt: Date.now(),
    });

    // Update total steps count
    await ctx.db.patch(args.sequenceId, { totalSteps: steps.length + 1 });

    return stepId;
  },
});

export const removeStep = mutation({
  args: { stepId: v.id("nurturingSteps") },
  handler: async (ctx, { stepId }) => {
    await requireAdmin(ctx);
    const step = await ctx.db.get(stepId);
    if (!step) return;

    await ctx.db.delete(stepId);

    // Reorder remaining steps
    const remaining = await ctx.db
      .query("nurturingSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", step.sequenceId))
      .collect();
    const sorted = remaining.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].order !== i) {
        await ctx.db.patch(sorted[i]._id, { order: i });
      }
    }

    // Update total steps count
    await ctx.db.patch(step.sequenceId, { totalSteps: sorted.length });
  },
});

export const reorderSteps = mutation({
  args: { stepIds: v.array(v.id("nurturingSteps")) },
  handler: async (ctx, { stepIds }) => {
    await requireAdmin(ctx);
    for (let i = 0; i < stepIds.length; i++) {
      await ctx.db.patch(stepIds[i], { order: i });
    }
  },
});

export const enrollContact = mutation({
  args: {
    sequenceId: v.id("nurturingSequences"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, { sequenceId, contactId }) => {
    await requireAdmin(ctx);

    // Check not already enrolled
    const existing = await ctx.db
      .query("nurturingEnrollments")
      .withIndex("by_contact", (q) => q.eq("contactId", contactId))
      .collect();
    const active = existing.find(
      (e) => e.sequenceId === sequenceId && e.status === "active",
    );
    if (active) throw new Error("Contact is al ingeschreven in deze sequence.");

    const now = Date.now();
    const enrollmentId = await ctx.db.insert("nurturingEnrollments", {
      sequenceId,
      contactId,
      currentStep: 0,
      status: "active",
      createdAt: now,
    });

    // Update enrolled count
    const seq = await ctx.db.get(sequenceId);
    if (seq) {
      await ctx.db.patch(sequenceId, { enrolledCount: seq.enrolledCount + 1 });
    }

    // Schedule first step
    const steps = await ctx.db
      .query("nurturingSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", sequenceId))
      .collect();
    const firstStep = steps.sort((a, b) => a.order - b.order)[0];
    if (firstStep) {
      await ctx.scheduler.runAfter(
        firstStep.delayDays * 24 * 60 * 60 * 1000,
        internal.crmNurturing.processStep,
        { enrollmentId },
      );
    }

    return enrollmentId;
  },
});

export const cancelEnrollment = mutation({
  args: {
    enrollmentId: v.id("nurturingEnrollments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { enrollmentId, reason }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(enrollmentId, {
      status: "cancelled",
      cancelReason: reason ?? "manual",
    });
  },
});

/* ═══════════════════════════════════════════
   INTERNAL — Step processing
   ═══════════════════════════════════════════ */

export const processStep = internalMutation({
  args: { enrollmentId: v.id("nurturingEnrollments") },
  handler: async (ctx, { enrollmentId }) => {
    const enrollment = await ctx.db.get(enrollmentId);
    if (!enrollment || enrollment.status !== "active") return;

    const contact = await ctx.db.get(enrollment.contactId);
    if (!contact) return;

    // Check if contact has purchased (auto-cancel)
    if (contact.userId) {
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_user", (q) => q.eq("userId", contact.userId!))
        .first();
      if (purchases) {
        await ctx.db.patch(enrollmentId, {
          status: "cancelled",
          cancelReason: "purchased",
        });
        return;
      }
    }

    // Check unsubscribed
    if (contact.unsubscribed) {
      await ctx.db.patch(enrollmentId, {
        status: "cancelled",
        cancelReason: "unsubscribed",
      });
      return;
    }

    // Get the current step
    const steps = await ctx.db
      .query("nurturingSteps")
      .withIndex("by_sequence", (q) => q.eq("sequenceId", enrollment.sequenceId))
      .collect();
    const sorted = steps.sort((a, b) => a.order - b.order);
    const currentStep = sorted[enrollment.currentStep];

    if (!currentStep) {
      // No more steps — complete
      await ctx.db.patch(enrollmentId, {
        status: "completed",
        completedAt: Date.now(),
      });
      const seq = await ctx.db.get(enrollment.sequenceId);
      if (seq) {
        await ctx.db.patch(enrollment.sequenceId, {
          completedCount: seq.completedCount + 1,
        });
      }
      return;
    }

    // Schedule sending the email via action
    await ctx.scheduler.runAfter(0, internal.crmNurturing.sendNurturingEmail, {
      enrollmentId,
      contactEmail: contact.email,
      contactFirstName: contact.firstName,
      templateKey: currentStep.templateKey,
      lang: contact.lang,
    });

    // Advance enrollment
    const nextStep = enrollment.currentStep + 1;
    const now = Date.now();
    await ctx.db.patch(enrollmentId, {
      currentStep: nextStep,
      lastSentAt: now,
    });

    // Schedule next step if exists
    const nextStepDef = sorted[nextStep];
    if (nextStepDef) {
      const delayMs = nextStepDef.delayDays * 24 * 60 * 60 * 1000;
      await ctx.scheduler.runAfter(delayMs, internal.crmNurturing.processStep, {
        enrollmentId,
      });
    } else {
      // Complete
      await ctx.db.patch(enrollmentId, {
        status: "completed",
        completedAt: now,
      });
      const seq = await ctx.db.get(enrollment.sequenceId);
      if (seq) {
        await ctx.db.patch(enrollment.sequenceId, {
          completedCount: seq.completedCount + 1,
        });
      }
    }
  },
});

/** Send nurturing email using the shared email pipeline */
export const sendNurturingEmail = internalAction({
  args: {
    enrollmentId: v.id("nurturingEnrollments"),
    contactEmail: v.string(),
    contactFirstName: v.string(),
    templateKey: v.string(),
    lang: langValidator,
  },
  handler: async (ctx, { contactEmail, templateKey, lang }) => {
    // Look up template
    const template = await ctx.runQuery(internal.emails.getTemplateByKey, {
      templateKey,
    });

    if (!template) return;

    const isNl = lang === "nl";
    const subject = isNl ? template.subjectNl : template.subjectEn;
    const html = isNl ? template.htmlNl : template.htmlEn;

    await ctx.runAction(internal.emails.sendEmail, {
      to: contactEmail,
      subject,
      html,
      template: `nurturing-${templateKey}`,
    });
  },
});
