/**
 * Email broadcasts: create, send, and manage broadcast emails to customer segments.
 * Supports A/B testing, unsubscribe filtering, and rate-limited sending.
 */

import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { SITE_URL } from "./emailHelpers";

/* ═══════════════════════════════════════════
   CREATE BROADCAST
   ═══════════════════════════════════════════ */

/** Create a broadcast draft */
export const createBroadcast = internalMutation({
  args: {
    subject: v.string(),
    htmlBody: v.string(),
    segment: v.union(
      v.literal("all"),
      v.literal("training-buyers"),
      v.literal("book-buyers"),
      v.literal("set-buyers"),
      v.literal("cst-buyers"),
    ),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("broadcasts", {
      subject: args.subject,
      htmlBody: args.htmlBody,
      segment: args.segment,
      status: "draft",
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
      scheduledFor: args.scheduledFor,
      createdAt: Date.now(),
    });
  },
});

/* ═══════════════════════════════════════════
   SEND BROADCAST
   ═══════════════════════════════════════════ */

/** Send a broadcast to all matching recipients */
export const sendBroadcast = internalAction({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    const broadcast = await ctx.runQuery(internal.emailBroadcasts.getBroadcast, { broadcastId });
    if (!broadcast || broadcast.status === "sent") return;

    // Get recipients based on segment
    const recipients = await ctx.runQuery(internal.emailBroadcasts.getBroadcastRecipients, {
      segment: broadcast.segment,
    });

    // Mark as sending
    await ctx.runMutation(internal.emailBroadcasts.updateBroadcastStatus, {
      broadcastId,
      status: "sending",
      recipientCount: recipients.length,
    });

    let sentCount = 0;
    let failedCount = 0;

    // Filter out unsubscribed recipients
    const unsubscribes = await ctx.runQuery(internal.emailSequences.getUnsubscribeList);
    const unsubSet = new Set(unsubscribes.map((u: { email: string }) => u.email.toLowerCase()));
    const activeRecipients = recipients.filter((r) => !unsubSet.has(r.email.toLowerCase()));

    // Update count with filtered recipients
    await ctx.runMutation(internal.emailBroadcasts.updateBroadcastStatus, {
      broadcastId,
      status: "sending",
      recipientCount: activeRecipients.length,
    });

    // A/B test: determine if this broadcast has variant B
    const hasAbTest = broadcast.abTestActive && broadcast.subjectB && broadcast.htmlBodyB;

    // Send in batches (Resend rate limit is 10/sec on free plan)
    for (let i = 0; i < activeRecipients.length; i++) {
      const recipient = activeRecipients[i];
      try {
        // A/B split: first half gets A, second half gets B (deterministic split)
        const useB = hasAbTest && i >= Math.ceil(activeRecipients.length / 2);
        const variant = hasAbTest ? (useB ? "B" : "A") : undefined;
        const emailSubject = useB ? (broadcast.subjectB ?? broadcast.subject) : broadcast.subject;
        const emailBody = useB ? (broadcast.htmlBodyB ?? broadcast.htmlBody) : broadcast.htmlBody;

        // Inject unsubscribe link before </body>
        const unsubLink = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(recipient.email)}`;
        const unsubHtml = `<div style="text-align:center;padding:24px 0 8px;"><a href="${unsubLink}" style="color:#999;font-size:11px;text-decoration:underline;">Uitschrijven</a></div>`;
        const htmlWithUnsub = emailBody.includes("</body>")
          ? emailBody.replace("</body>", `${unsubHtml}</body>`)
          : emailBody + unsubHtml;

        await ctx.runAction(internal.emails.sendEmail, {
          to: recipient.email,
          subject: emailSubject,
          html: htmlWithUnsub,
          template: "broadcast",
          variant,
        });
        sentCount++;
      } catch {
        failedCount++;
      }

      // Small delay between sends
      await new Promise((r) => setTimeout(r, 150));
    }

    // Mark as sent
    await ctx.runMutation(internal.emailBroadcasts.updateBroadcastStatus, {
      broadcastId,
      status: sentCount > 0 ? "sent" : "failed",
      sentCount,
      failedCount,
    });
  },
});

/* ═══════════════════════════════════════════
   BROADCAST QUERIES & MUTATIONS
   ═══════════════════════════════════════════ */

export const getBroadcast = internalQuery({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    return await ctx.db.get(broadcastId);
  },
});

/** Get unique email addresses for a broadcast segment */
export const getBroadcastRecipients = internalQuery({
  args: {
    segment: v.union(
      v.literal("all"),
      v.literal("training-buyers"),
      v.literal("book-buyers"),
      v.literal("set-buyers"),
      v.literal("cst-buyers"),
    ),
  },
  handler: async (ctx, { segment }) => {
    // For "all" segment, use contacts table directly (reliable email source)
    if (segment === "all") {
      const contacts = await ctx.db.query("contacts").collect();
      return contacts
        .filter((c) => !c.unsubscribed)
        .map((c) => ({ email: c.email, userId: c.userId ?? "" }));
    }

    // For purchase-based segments, join purchases with contacts
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    const filtered = purchases.filter((p) => {
      if (segment === "training-buyers") return p.productType === "training";
      if (segment === "book-buyers") return p.productType === "book";
      if (segment === "set-buyers") return p.product.startsWith("set-");
      if (segment === "cst-buyers") return p.product.startsWith("cst-");
      return true;
    });

    // Collect unique userIds from matching purchases
    const userIds = new Set<string>();
    for (const purchase of filtered) {
      userIds.add(purchase.userId);
    }

    // Resolve emails via contacts table (reliable, works for OAuth users too)
    const seen = new Set<string>();
    const recipients: { email: string; userId: string }[] = [];

    for (const userId of userIds) {
      const contact = await ctx.db
        .query("contacts")
        .withIndex("by_user", (q) => q.eq("userId", userId as any))
        .first();

      if (contact && !contact.unsubscribed && !seen.has(contact.email)) {
        seen.add(contact.email);
        recipients.push({ email: contact.email, userId });
      }
    }

    return recipients;
  },
});

export const updateBroadcastStatus = internalMutation({
  args: {
    broadcastId: v.id("broadcasts"),
    status: v.union(v.literal("draft"), v.literal("sending"), v.literal("sent"), v.literal("failed")),
    recipientCount: v.optional(v.number()),
    sentCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
  },
  handler: async (ctx, { broadcastId, status, recipientCount, sentCount, failedCount }) => {
    const patch: Record<string, unknown> = { status };
    if (recipientCount !== undefined) patch.recipientCount = recipientCount;
    if (sentCount !== undefined) patch.sentCount = sentCount;
    if (failedCount !== undefined) patch.failedCount = failedCount;
    if (status === "sent") patch.sentAt = Date.now();
    await ctx.db.patch(broadcastId, patch);
  },
});
