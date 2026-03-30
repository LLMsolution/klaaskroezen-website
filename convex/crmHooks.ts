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

/** CRM: Create contact from checkout draft (first auto-save with email) */
export const checkoutDraftSaved = internalMutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    product: v.string(),
    lang: v.union(v.literal("nl"), v.literal("en"), v.literal("de")),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    if (!email.includes("@")) return;
    const now = Date.now();

    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastActivityAt: now,
        intentScore: existing.intentScore + 5,
        ...(args.phone && !existing.phone ? { phone: args.phone } : {}),
        ...(args.company && !existing.company ? { company: args.company } : {}),
        ...(!existing.lastName && args.lastName ? { lastName: args.lastName } : {}),
      });
    } else {
      await ctx.db.insert("contacts", {
        email,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        company: args.company,
        engagementScore: 0,
        intentScore: 5,
        lastActivityAt: now,
        source: "checkout",
        sourceDetail: `draft:${args.product}`,
        tags: [],
        unsubscribed: false,
        lang: args.lang,
        createdAt: now,
      });
    }
  },
});

/** CRM: Create contact from account registration */
export const registrationCompleted = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    lang: v.union(v.literal("nl"), v.literal("en"), v.literal("de")),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const now = Date.now();

    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastActivityAt: now,
        intentScore: existing.intentScore + 5,
        userId: args.userId,
        ...(args.phone && !existing.phone ? { phone: args.phone } : {}),
        ...(args.company && !existing.company ? { company: args.company } : {}),
        ...(!existing.lastName && args.lastName ? { lastName: args.lastName } : {}),
      });
    } else {
      await ctx.db.insert("contacts", {
        email,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        company: args.company,
        userId: args.userId,
        engagementScore: 0,
        intentScore: 5,
        lastActivityAt: now,
        source: "registration",
        tags: [],
        unsubscribed: false,
        lang: args.lang,
        createdAt: now,
      });
    }
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

    // Evaluate automation rules for abandoned checkout (legacy + new workflows)
    await ctx.scheduler.runAfter(0, internal.crmAutomation.evaluateRules, {
      trigger: "checkout_abandoned",
      contactId: contact._id,
      metadata: JSON.stringify({ product: order.product }),
    });
    await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
      trigger: "checkout_abandoned",
      contactId: contact._id,
      metadata: JSON.stringify({ product: order.product }),
    });
  },
});

/** CRM: Create contact from Bol.com order */
export const bolOrderCompleted = internalMutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    product: v.string(),
    amountCents: v.number(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    if (!email.includes("@")) return;
    const now = Date.now();

    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    let contactId;
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastActivityAt: now,
        intentScore: existing.intentScore + 50,
        ...(args.phone && !existing.phone ? { phone: args.phone } : {}),
        ...(args.company && !existing.company ? { company: args.company } : {}),
        ...(!existing.lastName && args.lastName ? { lastName: args.lastName } : {}),
      });
      contactId = existing._id;
    } else {
      contactId = await ctx.db.insert("contacts", {
        email,
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        company: args.company,
        engagementScore: 0,
        intentScore: 50,
        lastActivityAt: now,
        source: "bolcom",
        sourceDetail: args.product,
        tags: ["bol.com", "boek"],
        unsubscribed: false,
        lang: "nl",
        createdAt: now,
      });
    }

    // Log activity
    await ctx.db.insert("leadActivities", {
      contactId,
      type: "purchase",
      title: `Bol.com aankoop: ${args.product}`,
      createdAt: now,
    });

    // Mark open leads as won
    const openLeads = await ctx.db
      .query("leads")
      .withIndex("by_contact", (q) => q.eq("contactId", contactId))
      .filter((q) => q.eq(q.field("status"), "open"))
      .collect();
    for (const lead of openLeads) {
      await ctx.db.patch(lead._id, { status: "won", closedAt: now });
    }

    // Fire automation triggers
    await ctx.scheduler.runAfter(0, internal.crmAutomation.evaluateRules, {
      trigger: "purchase",
      contactId,
      metadata: JSON.stringify({ product: args.product, source: "bolcom", amountCents: args.amountCents }),
    });
    await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
      trigger: "purchase",
      contactId,
      metadata: JSON.stringify({ product: args.product, source: "bolcom" }),
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

    // Evaluate automation rules for purchase (legacy + new workflows)
    await ctx.scheduler.runAfter(0, internal.crmAutomation.evaluateRules, {
      trigger: "purchase",
      contactId: contact._id,
      metadata: JSON.stringify({
        product: order.product,
        amountCents,
        purchaseId,
      }),
    });
    await ctx.scheduler.runAfter(0, internal.workflows.evaluateTrigger, {
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
