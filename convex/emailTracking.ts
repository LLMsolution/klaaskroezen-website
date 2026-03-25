/**
 * Email tracking: logging sent emails and recording open/click events.
 * Also updates CRM engagement scores on contacts.
 */

import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/* ═══════════════════════════════════════════
   EMAIL LOGGING
   ═══════════════════════════════════════════ */

export const logEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    template: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    resendId: v.optional(v.string()),
    error: v.optional(v.string()),
    trackingId: v.optional(v.string()),
    htmlBody: v.optional(v.string()),
    variant: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLog", {
      to: args.to,
      subject: args.subject,
      template: args.template,
      status: args.status,
      resendId: args.resendId,
      error: args.error,
      trackingId: args.trackingId,
      htmlBody: args.htmlBody,
      variant: args.variant,
      openCount: 0,
      clickCount: 0,
      createdAt: Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════
   TRACKING EVENTS
   ═══════════════════════════════════════════ */

/** Record an open or click event (called from internal actions) */
export const recordEmailEvent = internalMutation({
  args: {
    trackingId: v.string(),
    type: v.union(v.literal("open"), v.literal("click")),
    url: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, { trackingId, type, url, ip, userAgent }) => {
    const email = await ctx.db
      .query("emailLog")
      .withIndex("by_tracking", (q) => q.eq("trackingId", trackingId))
      .first();
    if (!email) return;

    await ctx.db.insert("emailEvents", {
      emailLogId: email._id,
      type,
      url,
      ip,
      userAgent,
      createdAt: Date.now(),
    });

    const now = Date.now();
    if (type === "open") {
      await ctx.db.patch(email._id, {
        openCount: (email.openCount ?? 0) + 1,
        lastOpenedAt: now,
      });
    } else {
      await ctx.db.patch(email._id, {
        clickCount: (email.clickCount ?? 0) + 1,
        lastClickedAt: now,
      });
    }

    // CRM: update engagement score on contact
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email.to.toLowerCase()))
      .first();
    if (contact) {
      const delta = type === "open" ? 2 : 5;
      await ctx.db.patch(contact._id, {
        engagementScore: contact.engagementScore + delta,
        lastActivityAt: now,
      });
      await ctx.db.insert("leadActivities", {
        contactId: contact._id,
        type: type === "open" ? "email_opened" : "email_clicked",
        title: type === "open" ? `Email geopend: ${email.subject}` : `Email link geklikt: ${email.subject}`,
        emailLogId: email._id,
        createdAt: now,
      });
    }
  },
});

/** Public mutation for tracking (called from API routes).
 *  Also updates CRM engagement scores. */
export const trackEvent = mutation({
  args: {
    trackingId: v.string(),
    type: v.union(v.literal("open"), v.literal("click")),
    url: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, { trackingId, type, url, ip, userAgent }) => {
    const email = await ctx.db
      .query("emailLog")
      .withIndex("by_tracking", (q) => q.eq("trackingId", trackingId))
      .first();
    if (!email) return;

    await ctx.db.insert("emailEvents", {
      emailLogId: email._id,
      type,
      url,
      ip,
      userAgent,
      createdAt: Date.now(),
    });

    const now = Date.now();
    if (type === "open") {
      await ctx.db.patch(email._id, {
        openCount: (email.openCount ?? 0) + 1,
        lastOpenedAt: now,
      });
    } else {
      await ctx.db.patch(email._id, {
        clickCount: (email.clickCount ?? 0) + 1,
        lastClickedAt: now,
      });
    }

    // CRM: update engagement score on contact + evaluate workflow triggers
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email.to.toLowerCase()))
      .first();
    if (contact) {
      const delta = type === "open" ? 2 : 5;
      await ctx.db.patch(contact._id, {
        engagementScore: contact.engagementScore + delta,
        lastActivityAt: now,
      });
      await ctx.db.insert("leadActivities", {
        contactId: contact._id,
        type: type === "open" ? "email_opened" : "email_clicked",
        title: type === "open" ? `Email geopend: ${email.subject}` : `Email link geklikt: ${email.subject}`,
        emailLogId: email._id,
        createdAt: now,
      });
      // Fire workflow triggers for email engagement
      await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
        trigger: type === "open" ? "email_opened" : "email_clicked",
        contactId: contact._id,
        metadata: JSON.stringify({ subject: email.subject, template: email.template }),
      });
    }
  },
});

/** Get email by tracking ID (for API routes) */
export const getEmailByTrackingId = internalQuery({
  args: { trackingId: v.string() },
  handler: async (ctx, { trackingId }) => {
    return await ctx.db
      .query("emailLog")
      .withIndex("by_tracking", (q) => q.eq("trackingId", trackingId))
      .first();
  },
});
