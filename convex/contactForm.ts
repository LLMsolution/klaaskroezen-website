import { v } from "convex/values";
import { mutation, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

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
          from: "Klaas Kroezen Website <noreply@klaaskroezen.com>",
          to: ["info@klaaskroezen.com"],
          reply_to: submission.email,
          subject: `Contactformulier: ${submission.subject}`,
          html: `
            <h2>Nieuw contactformulier</h2>
            <p><strong>Naam:</strong> ${submission.name}</p>
            <p><strong>E-mail:</strong> ${submission.email}</p>
            ${submission.phone ? `<p><strong>Telefoon:</strong> ${submission.phone}</p>` : ""}
            ${submission.company ? `<p><strong>Bedrijf:</strong> ${submission.company}</p>` : ""}
            <p><strong>Onderwerp:</strong> ${submission.subject}</p>
            <hr />
            <p>${submission.message.replace(/\n/g, "<br />")}</p>
          `,
        }),
      });

      const data = await res.json();

      await ctx.runMutation(internal.contactForm.markEmailSent, {
        submissionId,
        success: res.ok,
        resendId: data.id,
        error: res.ok ? undefined : JSON.stringify(data),
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
        to: "info@klaaskroezen.com",
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
