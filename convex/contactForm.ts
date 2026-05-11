import { v } from "convex/values";
import { action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimits";
import { contactNotification, contactConfirmationNl, TEMPLATE_OPTIONS } from "./emailTemplates";
import { layout } from "./emailHelpers";

const FROM = "Klaas Kroezen <klaas@klaaskroezen.nl>";

const submitArgs = {
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  subject: v.string(),
  message: v.string(),
};

/**
 * Public submit — verifies the Turnstile token server-side, then writes
 * the submission via an internal mutation. Frontend MUST send a fresh token
 * from the TurnstileWidget; we never trust a client-side "verified" flag.
 */
export const submit = action({
  args: { ...submitArgs, turnstileToken: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const { turnstileToken, ...rest } = args;
    const verifyRes = await ctx.runAction(internal.turnstile.verifyInternal, {
      token: turnstileToken,
    });
    if (!verifyRes.ok) {
      throw new Error(`Bot-check mislukt: ${verifyRes.error}`);
    }
    return await ctx.runMutation(internal.contactForm.submitInternal, rest);
  },
});

/**
 * Internal mutation — does the actual DB write + side-effects. Only callable
 * after the public action has verified the Turnstile token.
 */
export const submitInternal = internalMutation({
  args: submitArgs,
  handler: async (ctx, args): Promise<string> => {
    // Rate limit by email address
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "contactForm", {
      key: args.email,
    });
    if (!ok) {
      throw new Error(
        `Te veel berichten verstuurd. Probeer het over ${Math.ceil((retryAfter ?? 60000) / 60000)} minuten opnieuw.`,
      );
    }

    const id = await ctx.db.insert("contactSubmissions", {
      ...args,
      turnstileVerified: true,
      emailSent: false,
      createdAt: Date.now(),
    });

    // Schedule email sending
    await ctx.scheduler.runAfter(0, internal.contactForm.sendNotification, {
      submissionId: id,
    });

    // CRM: create/update contact + log activity + score
    await ctx.scheduler.runAfter(0, internal.contactForm.crmHook, {
      submissionId: id,
    });

    return id;
  },
});

// Send notification + confirmation emails via the shared sendEmail pipeline (with tracking)
export const sendNotification = internalAction({
  args: { submissionId: v.id("contactSubmissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.runQuery(
      internal.contactForm.getSubmission,
      { submissionId },
    );
    if (!submission) return;

    try {
      // 1. Send admin notification (logged under customer email for tracking)
      await ctx.runAction(internal.emails.sendEmail, {
        to: "klaas@klaaskroezen.nl",
        subject: `Contactformulier: ${submission.subject}`,
        html: layout(contactNotification(submission.name, submission.email, submission.phone, submission.company, submission.subject, submission.message), TEMPLATE_OPTIONS["contact-notification"]),
        template: "contact-notification",
        replyTo: submission.email,
      });

      await ctx.runMutation(internal.contactForm.markEmailSent, {
        submissionId,
        success: true,
      });

      // 2. Send confirmation to customer (tracked + logged under their email)
      await ctx.runAction(internal.emails.sendEmail, {
        to: submission.email,
        subject: "Bedankt voor je bericht — Klaas Kroezen",
        html: layout(contactConfirmationNl(submission.name, submission.subject, submission.message), TEMPLATE_OPTIONS["contact-confirmation-nl"]),
        template: "contact-confirmation",
      });
    } catch (error) {
      await ctx.runMutation(internal.contactForm.markEmailSent, {
        submissionId,
        success: false,
        error: String(error),
      });
    }
  },
});

// Internal query to get submission data
export const getSubmission = internalQuery({
  args: { submissionId: v.id("contactSubmissions") },
  handler: async (ctx, { submissionId }) => {
    return await ctx.db.get(submissionId);
  },
});

// Internal mutation to mark email as sent on contactSubmissions record
export const markEmailSent = internalMutation({
  args: {
    submissionId: v.id("contactSubmissions"),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { submissionId, success }) => {
    await ctx.db.patch(submissionId, { emailSent: success });
  },
});

// CRM hook: create contact, score, activity, and optionally a lead
export const crmHook = internalMutation({
  args: { submissionId: v.id("contactSubmissions") },
  handler: async (ctx, { submissionId }) => {
    const sub = await ctx.db.get(submissionId);
    if (!sub) return;

    const email = sub.email.toLowerCase().trim();
    const nameParts = sub.name.split(" ");
    const firstName = nameParts[0] ?? sub.name;
    const lastName = nameParts.slice(1).join(" ") || undefined;
    const now = Date.now();

    // Find or create contact
    let contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (contact) {
      await ctx.db.patch(contact._id, {
        lastActivityAt: now,
        intentScore: contact.intentScore + 10,
        ...(sub.phone && !contact.phone ? { phone: sub.phone } : {}),
        ...(sub.company && !contact.company ? { company: sub.company } : {}),
        ...(!contact.lastName && lastName ? { lastName } : {}),
      });
    } else {
      const contactId = await ctx.db.insert("contacts", {
        email,
        firstName,
        lastName,
        phone: sub.phone,
        company: sub.company,
        engagementScore: 0,
        intentScore: 10,
        lastActivityAt: now,
        source: "contact_form",
        sourceDetail: sub.subject,
        tags: [],
        unsubscribed: false,
        lang: "nl",
        createdAt: now,
      });
      contact = await ctx.db.get(contactId);
    }

    if (!contact) return;

    // Log activity
    await ctx.db.insert("leadActivities", {
      contactId: contact._id,
      type: "contact_form",
      title: `Contactformulier: ${sub.subject}`,
      description: sub.message.slice(0, 200),
      createdAt: now,
    });

    // Auto-create lead if company is provided
    if (sub.company) {
      const defaultStage = await ctx.db
        .query("pipelineStages")
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();
      if (defaultStage) {
        const leadId = await ctx.db.insert("leads", {
          contactId: contact._id,
          stageId: defaultStage._id,
          title: `${sub.company} — ${sub.subject}`,
          probability: defaultStage.defaultProbability,
          source: "contact_form",
          status: "open",
          createdAt: now,
        });
        await ctx.db.insert("leadActivities", {
          leadId,
          contactId: contact._id,
          type: "lead_created",
          title: `Lead automatisch aangemaakt via contactformulier`,
          createdAt: now,
        });
      }
    }

    // Evaluate automation rules + workflows for contact form submission
    await ctx.scheduler.runAfter(0, internal.crmAutomation.evaluateRules, {
      trigger: "contact_form",
      contactId: contact._id,
      metadata: JSON.stringify({ subject: sub.subject }),
    });
    await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
      trigger: "contact_form",
      contactId: contact._id,
      metadata: JSON.stringify({ subject: sub.subject }),
    });
  },
});
