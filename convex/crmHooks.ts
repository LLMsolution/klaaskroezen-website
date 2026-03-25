import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * CRM hooks for checkout events.
 * Called via ctx.scheduler.runAfter from checkout.ts and payments.ts.
 */

/** CRM: Create/update contact when checkout starts */
export const checkoutStarted = internalMutation({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return;

    const email = order.email.toLowerCase().trim();
    const now = Date.now();

    let contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (contact) {
      await ctx.db.patch(contact._id, {
        lastActivityAt: now,
        intentScore: contact.intentScore + 15,
        ...(order.phone && !contact.phone ? { phone: order.phone } : {}),
        ...(order.company && !contact.company ? { company: order.company } : {}),
        ...(!contact.lastName ? { lastName: order.lastName } : {}),
        ...(order.userId && !contact.userId ? { userId: order.userId } : {}),
      });
    } else {
      const contactId = await ctx.db.insert("contacts", {
        email,
        firstName: order.firstName,
        lastName: order.lastName,
        phone: order.phone,
        company: order.company,
        engagementScore: 0,
        intentScore: 15,
        lastActivityAt: now,
        source: "checkout",
        sourceDetail: order.product,
        tags: [],
        unsubscribed: false,
        lang: order.lang,
        createdAt: now,
      });
      contact = await ctx.db.get(contactId);
    }

    if (!contact) return;

    await ctx.db.insert("leadActivities", {
      contactId: contact._id,
      type: "checkout_started",
      title: `Checkout gestart: ${order.product}`,
      createdAt: now,
    });

    // Evaluate automation rules for checkout start (no specific trigger, but score-based rules may fire)
    // Note: no dedicated "checkout_started" trigger exists; scoring hooks can be evaluated separately.
  },
});

/** CRM: Log abandoned cart activity on contact */
export const checkoutAbandoned = internalMutation({
  args: { orderId: v.id("pendingOrders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return;

    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", order.email.toLowerCase()))
      .first();
    if (!contact) return;

    await ctx.db.insert("leadActivities", {
      contactId: contact._id,
      type: "checkout_abandoned",
      title: `Checkout verlaten: ${order.product}`,
      createdAt: Date.now(),
    });

    // Evaluate automation rules for abandoned checkout
    await ctx.scheduler.runAfter(0, internal.crmAutomation.evaluateRules, {
      trigger: "checkout_abandoned",
      contactId: contact._id,
      metadata: JSON.stringify({ product: order.product }),
    });
  },
});

/** CRM: Update contact score, log purchase, mark lead as won */
export const purchaseCompleted = internalMutation({
  args: {
    pendingOrderId: v.id("pendingOrders"),
    purchaseId: v.id("purchases"),
    amountCents: v.number(),
  },
  handler: async (ctx, { pendingOrderId, purchaseId, amountCents }) => {
    const order = await ctx.db.get(pendingOrderId);
    if (!order) return;

    const email = order.email.toLowerCase().trim();
    const now = Date.now();

    let contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (contact) {
      await ctx.db.patch(contact._id, {
        lastActivityAt: now,
        intentScore: contact.intentScore + 50,
        ...(order.userId && !contact.userId ? { userId: order.userId } : {}),
      });
    } else {
      const contactId = await ctx.db.insert("contacts", {
        email,
        firstName: order.firstName,
        lastName: order.lastName,
        phone: order.phone,
        company: order.company,
        engagementScore: 0,
        intentScore: 50,
        lastActivityAt: now,
        source: "purchase",
        sourceDetail: order.product,
        tags: [],
        unsubscribed: false,
        lang: order.lang,
        createdAt: now,
        userId: order.userId,
      });
      contact = await ctx.db.get(contactId);
    }

    if (!contact) return;

    // Log purchase activity
    await ctx.db.insert("leadActivities", {
      contactId: contact._id,
      type: "purchase",
      title: `Aankoop: ${order.product} (€${(amountCents / 100).toFixed(2)})`,
      purchaseId,
      createdAt: now,
    });

    // Mark any open lead for this contact as won
    const openLeads = await ctx.db
      .query("leads")
      .withIndex("by_contact", (q) => q.eq("contactId", contact!._id))
      .collect();

    for (const lead of openLeads.filter((l) => l.status === "open")) {
      await ctx.db.patch(lead._id, {
        status: "won",
        probability: 100,
        purchaseId,
        closedAt: now,
      });
      await ctx.db.insert("leadActivities", {
        leadId: lead._id,
        contactId: contact!._id,
        type: "lead_won",
        title: `Lead "${lead.title}" gewonnen via aankoop`,
        purchaseId,
        createdAt: now,
      });
    }

    // Evaluate automation rules for purchase
    await ctx.scheduler.runAfter(0, internal.crmAutomation.evaluateRules, {
      trigger: "purchase",
      contactId: contact._id,
      metadata: JSON.stringify({
        product: order.product,
        amountCents,
        purchaseId,
      }),
    });
  },
});
