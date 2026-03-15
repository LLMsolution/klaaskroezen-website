import { v } from "convex/values";
import { mutation, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { rateLimiter } from "./rateLimits";
import { contactNotification, contactConfirmationNl } from "./emailTemplates";

// Store the contact form submission
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    turnstileVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
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
      emailSent: false,
      createdAt: Date.now(),
    });

    // Schedule email sending
    await ctx.scheduler.runAfter(0, internal.contactForm.sendNotification, {
      submissionId: id,
    });

    return id;
  },
});

// Send notification email via Resend (internal action)
export const sendNotification = internalAction({
  args: { submissionId: v.id("contactSubmissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.runQuery(
      internal.contactForm.getSubmission,
      { submissionId },
    );
    if (!submission) return;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Klaas Kroezen Website <info@llmsolution.nl>",
          to: ["info@llmsolution.nl"],
          reply_to: submission.email,
          subject: `Contactformulier: ${submission.subject}`,
          html: contactNotification(submission.name, submission.email, submission.phone, submission.company, submission.subject, submission.message),
        }),
      });

      const data = await res.json();

      await ctx.runMutation(internal.contactForm.markEmailSent, {
        submissionId,
        success: res.ok,
        resendId: data.id,
        error: res.ok ? undefined : JSON.stringify(data),
      });

      // Send confirmation to the user
      if (res.ok) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Klaas Kroezen <info@llmsolution.nl>",
            to: [submission.email],
            subject: "Bedankt voor je bericht — Klaas Kroezen",
            html: contactConfirmationNl(submission.name, submission.subject, submission.message),
          }),
        });
      }
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

// Internal mutation to mark email as sent
export const markEmailSent = internalMutation({
  args: {
    submissionId: v.id("contactSubmissions"),
    success: v.boolean(),
    resendId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { submissionId, success, resendId, error }) => {
    await ctx.db.patch(submissionId, { emailSent: success });

    // Log the email
    const submission = await ctx.db.get(submissionId);
    if (submission) {
      await ctx.db.insert("emailLog", {
        to: "info@llmsolution.nl",
        subject: `Contactformulier: ${submission.subject}`,
        template: "contact-form",
        status: success ? "sent" : "failed",
        resendId,
        error,
        createdAt: Date.now(),
      });
    }
  },
});
