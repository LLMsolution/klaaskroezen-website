import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

/* ═══════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════ */

export const getRules = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("automationRules").order("desc").collect();
  },
});

export const getRuleById = query({
  args: { ruleId: v.id("automationRules") },
  handler: async (ctx, { ruleId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(ruleId);
  },
});

/* ═══════════════════════════════════════════
   MUTATIONS
   ═══════════════════════════════════════════ */

export const createRule = mutation({
  args: {
    name: v.string(),
    trigger: v.union(
      v.literal("score_threshold"),
      v.literal("stage_change"),
      v.literal("inactivity"),
      v.literal("checkout_abandoned"),
      v.literal("contact_form"),
      v.literal("purchase"),
    ),
    action: v.union(
      v.literal("notify_team"),
      v.literal("send_email"),
      v.literal("start_sequence"),
      v.literal("move_stage"),
      v.literal("assign_lead"),
      v.literal("create_lead"),
    ),
    triggerConfig: v.string(),
    actionConfig: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("automationRules", {
      ...args,
      active: true,
      executionCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateRule = mutation({
  args: {
    ruleId: v.id("automationRules"),
    name: v.optional(v.string()),
    trigger: v.optional(
      v.union(
        v.literal("score_threshold"),
        v.literal("stage_change"),
        v.literal("inactivity"),
        v.literal("checkout_abandoned"),
        v.literal("contact_form"),
        v.literal("purchase"),
      ),
    ),
    action: v.optional(
      v.union(
        v.literal("notify_team"),
        v.literal("send_email"),
        v.literal("start_sequence"),
        v.literal("move_stage"),
        v.literal("assign_lead"),
        v.literal("create_lead"),
      ),
    ),
    triggerConfig: v.optional(v.string()),
    actionConfig: v.optional(v.string()),
  },
  handler: async (ctx, { ruleId, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(ruleId, patch);
    }
  },
});

export const toggleRule = mutation({
  args: { ruleId: v.id("automationRules") },
  handler: async (ctx, { ruleId }) => {
    await requireAdmin(ctx);
    const rule = await ctx.db.get(ruleId);
    if (!rule) throw new Error("Regel niet gevonden.");
    await ctx.db.patch(ruleId, { active: !rule.active });
  },
});

export const deleteRule = mutation({
  args: { ruleId: v.id("automationRules") },
  handler: async (ctx, { ruleId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(ruleId);
  },
});

export const testRule = mutation({
  args: {
    ruleId: v.id("automationRules"),
    testEmail: v.string(),
  },
  handler: async (ctx, { ruleId, testEmail }) => {
    await requireAdmin(ctx);

    const rule = await ctx.db.get(ruleId);
    if (!rule) throw new Error("Regel niet gevonden.");

    // Find contact by email
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", testEmail.toLowerCase()))
      .first();

    if (!contact) {
      return { success: false, message: "Contact niet gevonden voor dit e-mailadres." };
    }

    // Find an open lead for this contact (optional — some actions don't need it)
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
      .collect()
      .then((leads) => leads.find((l) => l.status === "open") ?? null);

    const now = Date.now();
    await executeAction(ctx, rule, lead, contact, now);

    return {
      success: true,
      message: `Actie "${rule.action}" uitgevoerd voor ${contact.firstName} ${contact.lastName ?? ""} (${testEmail}).`.trim(),
    };
  },
});

/* ═══════════════════════════════════════════
   INTERNAL — Rule execution engine
   ═══════════════════════════════════════════ */

/**
 * Check inactivity rules — run as a daily cron.
 * Finds contacts with no activity for X days and triggers actions.
 */
export const checkInactivityRules = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_trigger", (q) => q.eq("trigger", "inactivity"))
      .collect();

    const activeRules = rules.filter((r) => r.active);
    if (activeRules.length === 0) return;

    for (const rule of activeRules) {
      const config = JSON.parse(rule.triggerConfig) as { inactiveDays: number };
      const cutoff = now - config.inactiveDays * 24 * 60 * 60 * 1000;

      // Find leads with contacts inactive beyond threshold
      const leads = await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .collect();

      for (const lead of leads) {
        const contact = await ctx.db.get(lead.contactId);
        if (!contact || contact.lastActivityAt > cutoff) continue;

        // Execute action
        await executeAction(ctx, rule, lead, contact, now);
      }
    }
  },
});

/**
 * Evaluate matching automation rules for a given trigger.
 * Called from CRM hooks (checkout, purchase, contact form) via scheduler.
 */
export const evaluateRules = internalMutation({
  args: {
    trigger: v.string(),
    contactId: v.id("contacts"),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, { trigger, contactId, metadata }) => {
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_trigger", (q) => q.eq("trigger", trigger as "score_threshold" | "stage_change" | "inactivity" | "checkout_abandoned" | "contact_form" | "purchase"))
      .collect();

    const activeRules = rules.filter((r) => r.active);
    if (activeRules.length === 0) return;

    const contact = await ctx.db.get(contactId);
    if (!contact) return;

    const now = Date.now();
    const meta = metadata ? (JSON.parse(metadata) as Record<string, unknown>) : {};

    for (const rule of activeRules) {
      // Parse triggerConfig and check conditions
      const triggerConfig = JSON.parse(rule.triggerConfig) as Record<string, unknown>;

      if (!matchesTriggerConditions(trigger, triggerConfig, contact, meta)) {
        continue;
      }

      // Find existing lead for actions that require one, or pass null
      const lead = await ctx.db
        .query("leads")
        .withIndex("by_contact", (q) => q.eq("contactId", contactId))
        .collect()
        .then((leads) => leads.find((l) => l.status === "open") ?? null);

      await executeAction(ctx, rule, lead, contact, now);
    }
  },
});

/** Check if trigger conditions from triggerConfig are met */
function matchesTriggerConditions(
  trigger: string,
  config: Record<string, unknown>,
  contact: { intentScore: number; engagementScore: number; tags: string[] },
  meta: Record<string, unknown>,
): boolean {
  switch (trigger) {
    case "score_threshold": {
      const threshold = (config.minScore as number | undefined) ?? 0;
      const scoreType = (config.scoreType as string | undefined) ?? "intent";
      const score = scoreType === "engagement" ? contact.engagementScore : contact.intentScore;
      return score >= threshold;
    }
    case "checkout_abandoned":
    case "purchase":
    case "contact_form": {
      // Optional product filter
      const productFilter = config.product as string | undefined;
      if (productFilter && meta.product && meta.product !== productFilter) {
        return false;
      }
      return true;
    }
    case "stage_change": {
      const targetStage = config.stageSlug as string | undefined;
      if (targetStage && meta.newStageSlug && meta.newStageSlug !== targetStage) {
        return false;
      }
      return true;
    }
    default:
      return true;
  }
}

async function executeAction(
  ctx: any,
  rule: any,
  lead: any,
  contact: any,
  now: number,
) {
  const actionConfig = JSON.parse(rule.actionConfig) as {
    notifyEmail?: string;
    stageSlug?: string;
    assignEmail?: string;
    templateKey?: string;
    sequenceId?: string;
    sequenceName?: string;
    leadTitle?: string;
    leadSource?: string;
  };

  switch (rule.action) {
    case "notify_team": {
      const recipientEmail = actionConfig.notifyEmail ?? "klaas@klaaskroezen.nl";

      // Log activity on the contact (with lead if available)
      await ctx.db.insert("leadActivities", {
        ...(lead ? { leadId: lead._id } : {}),
        contactId: contact._id,
        type: "note",
        title: `Automation: ${rule.name} — notificatie verstuurd`,
        description: `Naar: ${recipientEmail}`,
        createdAt: now,
      });

      // Send actual notification email to team
      await ctx.scheduler.runAfter(0, internal.emails.sendEmail, {
        to: recipientEmail,
        subject: `[Automation] ${rule.name} — ${contact.firstName} ${contact.lastName ?? ""}`.trim(),
        html: buildNotificationHtml(rule.name, contact, lead),
        template: "automation-notify-team",
      });
      break;
    }
    case "send_email": {
      if (actionConfig.templateKey) {
        // Look up template directly from DB
        const template = await ctx.db
          .query("emailTemplates")
          .withIndex("by_key", (q: any) => q.eq("templateKey", actionConfig.templateKey!))
          .first();

        if (template) {
          const lang = contact.lang ?? "nl";
          const isNl = lang === "nl";
          const subject = isNl ? template.subjectNl : template.subjectEn;
          const html = isNl ? template.htmlNl : template.htmlEn;

          await ctx.scheduler.runAfter(0, internal.emails.sendEmail, {
            to: contact.email,
            subject,
            html,
            template: `automation-${actionConfig.templateKey}`,
          });
        }

        await ctx.db.insert("leadActivities", {
          ...(lead ? { leadId: lead._id } : {}),
          contactId: contact._id,
          type: "email_sent",
          title: `Automation: ${rule.name} — email "${actionConfig.templateKey}" verstuurd`,
          createdAt: now,
        });
      }
      break;
    }
    case "start_sequence": {
      // Find the nurturing sequence by ID or name
      let sequence = null;
      if (actionConfig.sequenceId) {
        sequence = await ctx.db.get(ctx.db.normalizeId("nurturingSequences", actionConfig.sequenceId));
      }
      if (!sequence && actionConfig.sequenceName) {
        const allSequences = await ctx.db.query("nurturingSequences").collect();
        sequence = allSequences.find((s: any) => s.name === actionConfig.sequenceName) ?? null;
      }

      if (sequence && sequence.active) {
        // Check not already enrolled
        const existing = await ctx.db
          .query("nurturingEnrollments")
          .withIndex("by_contact", (q: any) => q.eq("contactId", contact._id))
          .collect();
        const alreadyActive = existing.find(
          (e: any) => e.sequenceId === sequence!._id && e.status === "active",
        );

        if (!alreadyActive) {
          const enrollmentId = await ctx.db.insert("nurturingEnrollments", {
            sequenceId: sequence._id,
            contactId: contact._id,
            currentStep: 0,
            status: "active",
            createdAt: now,
          });

          // Update enrolled count
          await ctx.db.patch(sequence._id, {
            enrolledCount: sequence.enrolledCount + 1,
          });

          // Schedule first step
          const steps = await ctx.db
            .query("nurturingSteps")
            .withIndex("by_sequence", (q: any) => q.eq("sequenceId", sequence!._id))
            .collect();
          const firstStep = steps.sort((a: any, b: any) => a.order - b.order)[0];
          if (firstStep) {
            await ctx.scheduler.runAfter(
              firstStep.delayDays * 24 * 60 * 60 * 1000,
              internal.crmNurturing.processStep,
              { enrollmentId },
            );
          }

          await ctx.db.insert("leadActivities", {
            ...(lead ? { leadId: lead._id } : {}),
            contactId: contact._id,
            type: "note",
            title: `Automation: ${rule.name} — ingeschreven in "${sequence.name}"`,
            createdAt: now,
          });
        }
      }
      break;
    }
    case "move_stage": {
      if (actionConfig.stageSlug && lead) {
        const stage = await ctx.db
          .query("pipelineStages")
          .withIndex("by_slug", (q: any) => q.eq("slug", actionConfig.stageSlug!))
          .first();
        if (stage) {
          const oldStage = await ctx.db.get(lead.stageId);
          await ctx.db.patch(lead._id, {
            stageId: stage._id,
            probability: stage.defaultProbability,
          });
          await ctx.db.insert("leadActivities", {
            leadId: lead._id,
            contactId: contact._id,
            type: "stage_change",
            title: `Automation: ${oldStage?.name ?? "?"} → ${stage.name}`,
            createdAt: now,
          });
        }
      }
      break;
    }
    case "assign_lead": {
      if (actionConfig.assignEmail && lead) {
        await ctx.db.patch(lead._id, { assignedTo: actionConfig.assignEmail });
        await ctx.db.insert("leadActivities", {
          leadId: lead._id,
          contactId: contact._id,
          type: "note",
          title: `Automation: toegewezen aan ${actionConfig.assignEmail}`,
          createdAt: now,
        });
      }
      break;
    }
    case "create_lead": {
      // Create a lead in the default pipeline stage
      const title = actionConfig.leadTitle
        ?? `${contact.firstName} ${contact.lastName ?? ""} — ${rule.name}`.trim();
      const source = actionConfig.leadSource ?? "automation";

      await ctx.scheduler.runAfter(0, internal.crmLeads.createLeadInternal, {
        contactId: contact._id,
        title,
        source,
      });

      await ctx.db.insert("leadActivities", {
        contactId: contact._id,
        type: "note",
        title: `Automation: ${rule.name} — lead aangemaakt`,
        createdAt: now,
      });
      break;
    }
  }

  // Update rule execution stats
  await ctx.db.patch(rule._id, {
    executionCount: rule.executionCount + 1,
    lastExecutedAt: now,
  });
}

/** Build a simple HTML notification email for team alerts */
function buildNotificationHtml(
  ruleName: string,
  contact: { email: string; firstName: string; lastName?: string; intentScore: number; engagementScore: number },
  lead: { title: string } | null,
): string {
  const name = `${contact.firstName} ${contact.lastName ?? ""}`.trim();
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#B5622A;">Automation: ${ruleName}</h2>
      <p><strong>Contact:</strong> ${name} (${contact.email})</p>
      <p><strong>Intent score:</strong> ${contact.intentScore} | <strong>Engagement:</strong> ${contact.engagementScore}</p>
      ${lead ? `<p><strong>Lead:</strong> ${lead.title}</p>` : ""}
      <hr style="border:none;border-top:1px solid #EDE9E2;margin:16px 0;" />
      <p style="color:#666;font-size:12px;">Dit is een automatisch bericht vanuit het CRM.</p>
    </div>
  `.trim();
}
