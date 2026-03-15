import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const ADMIN_EMAILS = [
  "klaas@klaaskroezen.com",
  "info@klaaskroezen.com",
  "klaas@cxiagroup.com",
];

async function requireAdmin(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Niet ingelogd.");

  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Gebruiker niet gevonden.");

  const accounts = await ctx.db
    .query("authAccounts")
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .collect();

  const emailAccount = accounts.find(
    (a: any) => a.providerAccountId?.includes("@"),
  );

  const email = emailAccount?.providerAccountId ?? user.email ?? "";
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    throw new Error("Geen toegang.");
  }

  return { userId, user, email };
}

/**
 * Dashboard overview stats.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    const pendingOrders = await ctx.db
      .query("pendingOrders")
      .filter((q) => q.eq(q.field("convertedAt"), undefined))
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const recentPurchases = purchases.filter(
      (p) => p.paidAt && p.paidAt > thirtyDaysAgo,
    );
    const weekPurchases = purchases.filter(
      (p) => p.paidAt && p.paidAt > sevenDaysAgo,
    );

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const monthRevenue = recentPurchases.reduce((sum, p) => sum + p.amount, 0);
    const weekRevenue = weekPurchases.reduce((sum, p) => sum + p.amount, 0);

    // Revenue by product type
    const trainingRevenue = purchases
      .filter((p) => p.productType === "training")
      .reduce((sum, p) => sum + p.amount, 0);
    const bookRevenue = purchases
      .filter((p) => p.productType === "book")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalOrders: purchases.length,
      totalRevenue,
      monthRevenue,
      weekRevenue,
      monthOrders: recentPurchases.length,
      weekOrders: weekPurchases.length,
      pendingCarts: pendingOrders.length,
      trainingRevenue,
      bookRevenue,
    };
  },
});

/**
 * List recent orders (paginated).
 */
export const getOrders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    const purchases = await ctx.db
      .query("purchases")
      .order("desc")
      .take(limit ?? 50);

    // Enrich with user info
    const enriched = [];
    for (const purchase of purchases) {
      const user = await ctx.db.get(purchase.userId);

      // Get email
      const accounts = await ctx.db
        .query("authAccounts")
        .filter((q) => q.eq(q.field("userId"), purchase.userId))
        .collect();
      const emailAccount = accounts.find(
        (a) => a.providerAccountId?.includes("@"),
      );

      enriched.push({
        ...purchase,
        userName: user?.name ?? "—",
        userEmail: emailAccount?.providerAccountId ?? user?.email ?? "—",
      });
    }

    return enriched;
  },
});

/**
 * List pending (abandoned) carts.
 */
export const getPendingCarts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("pendingOrders")
      .filter((q) => q.eq(q.field("convertedAt"), undefined))
      .order("desc")
      .take(limit ?? 50);
  },
});

/**
 * List all invoices.
 */
export const getInvoices = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("invoices")
      .order("desc")
      .take(limit ?? 50);
  },
});

/**
 * Get email log.
 */
export const getEmailLog = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("emailLog")
      .order("desc")
      .take(limit ?? 50);
  },
});

/**
 * Get discount codes.
 */
export const getDiscountCodes = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("discountCodes")
      .collect();
  },
});

/**
 * Create a discount code.
 */
export const createDiscountCode = mutation({
  args: {
    code: v.string(),
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    validUntil: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    products: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("discountCodes", {
      code: args.code.toUpperCase(),
      type: args.type,
      value: args.value,
      validUntil: args.validUntil,
      maxUses: args.maxUses,
      currentUses: 0,
      products: args.products,
    });
  },
});

/**
 * Delete a discount code.
 */
export const deleteDiscountCode = mutation({
  args: { id: v.id("discountCodes") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

/**
 * Get cohorts.
 */
export const getCohorts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("cohorts").order("desc").collect();
  },
});

/* ═══════════════════════════════════════════
   BROADCASTS
   ═══════════════════════════════════════════ */

/**
 * List all broadcasts.
 */
export const getBroadcasts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("broadcasts").order("desc").take(50);
  },
});

/**
 * Preview recipient count for a segment.
 */
export const previewSegmentCount = query({
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
    await requireAdmin(ctx);

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    const filtered = purchases.filter((p) => {
      if (segment === "all") return true;
      if (segment === "training-buyers") return p.productType === "training";
      if (segment === "book-buyers") return p.productType === "book";
      if (segment === "set-buyers") return p.product.startsWith("set-");
      if (segment === "cst-buyers") return p.product.startsWith("cst-");
      return true;
    });

    const uniqueUsers = new Set(filtered.map((p) => p.userId));
    return uniqueUsers.size;
  },
});

/**
 * Create and optionally send a broadcast.
 */
export const saveBroadcast = mutation({
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
    sendNow: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const broadcastId = await ctx.db.insert("broadcasts", {
      subject: args.subject,
      htmlBody: args.htmlBody,
      segment: args.segment,
      status: args.sendNow ? "sending" : "draft",
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
      createdAt: Date.now(),
    });

    if (args.sendNow) {
      await ctx.scheduler.runAfter(0, internal.emails.sendBroadcast, {
        broadcastId,
      });
    }

    return broadcastId;
  },
});

/**
 * Send a draft broadcast.
 */
export const triggerBroadcast = mutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    await requireAdmin(ctx);

    const broadcast = await ctx.db.get(broadcastId);
    if (!broadcast || broadcast.status !== "draft") {
      throw new Error("Broadcast kan niet verzonden worden.");
    }

    await ctx.db.patch(broadcastId, { status: "sending" });
    await ctx.scheduler.runAfter(0, internal.emails.sendBroadcast, {
      broadcastId,
    });
  },
});

/**
 * Delete a draft broadcast.
 */
export const deleteBroadcast = mutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, { broadcastId }) => {
    await requireAdmin(ctx);

    const broadcast = await ctx.db.get(broadcastId);
    if (!broadcast) return;
    if (broadcast.status === "sending") throw new Error("Kan actieve broadcast niet verwijderen.");

    await ctx.db.delete(broadcastId);
  },
});

/* ═══════════════════════════════════════════
   EMAIL SEQUENCES & TEMPLATES
   ═══════════════════════════════════════════ */

/**
 * List active email sequences with enriched data.
 */
export const getSequences = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const sequences = await ctx.db.query("emailSequences").order("desc").take(100);

    const enriched = [];
    for (const seq of sequences) {
      const user = await ctx.db.get(seq.userId);
      enriched.push({
        ...seq,
        userName: user?.name ?? "—",
      });
    }
    return enriched;
  },
});

/**
 * Get all email templates (for sequence editor).
 */
export const getEmailTemplates = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("emailTemplates").collect();
  },
});

/**
 * Initialize default templates from code.
 */
export const initEmailTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await ctx.scheduler.runAfter(0, internal.emails.initializeTemplates, {});
  },
});

/**
 * Update an email template.
 */
export const updateEmailTemplate = mutation({
  args: {
    id: v.id("emailTemplates"),
    subjectNl: v.optional(v.string()),
    subjectEn: v.optional(v.string()),
    htmlNl: v.optional(v.string()),
    htmlEn: v.optional(v.string()),
    delayDays: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.subjectNl !== undefined) patch.subjectNl = updates.subjectNl;
    if (updates.subjectEn !== undefined) patch.subjectEn = updates.subjectEn;
    if (updates.htmlNl !== undefined) patch.htmlNl = updates.htmlNl;
    if (updates.htmlEn !== undefined) patch.htmlEn = updates.htmlEn;
    if (updates.delayDays !== undefined) patch.delayDays = updates.delayDays;
    if (updates.active !== undefined) patch.active = updates.active;

    await ctx.db.patch(id, patch);
  },
});

/* ═══════════════════════════════════════════
   MAILING LIST & CONTACTS
   ═══════════════════════════════════════════ */

/**
 * Get full mailing list: all unique contacts from purchases + pending orders
 * with engagement stats (emails sent, opens, clicks).
 */
export const getMailingList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const contacts = new Map<string, {
      email: string;
      name: string;
      products: string[];
      totalSpent: number;
      purchaseCount: number;
      firstPurchaseAt: number | null;
      lastPurchaseAt: number | null;
      emailsSent: number;
      totalOpens: number;
      totalClicks: number;
      lastEmailAt: number | null;
      source: "purchase" | "pending";
    }>();

    // 1. Purchases
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    for (const p of purchases) {
      const accounts = await ctx.db
        .query("authAccounts")
        .filter((q) => q.eq(q.field("userId"), p.userId))
        .collect();
      const emailAccount = accounts.find((a) => a.providerAccountId?.includes("@"));
      const user = await ctx.db.get(p.userId);
      const email = emailAccount?.providerAccountId ?? (user as any)?.email ?? "";
      if (!email) continue;

      const lowerEmail = email.toLowerCase();
      const existing = contacts.get(lowerEmail);
      if (existing) {
        existing.products.push(p.product);
        existing.totalSpent += p.amount;
        existing.purchaseCount++;
        if (p.paidAt && (!existing.lastPurchaseAt || p.paidAt > existing.lastPurchaseAt)) {
          existing.lastPurchaseAt = p.paidAt;
        }
        if (p.paidAt && (!existing.firstPurchaseAt || p.paidAt < existing.firstPurchaseAt)) {
          existing.firstPurchaseAt = p.paidAt;
        }
      } else {
        contacts.set(lowerEmail, {
          email,
          name: user?.name ?? "—",
          products: [p.product],
          totalSpent: p.amount,
          purchaseCount: 1,
          firstPurchaseAt: p.paidAt ?? null,
          lastPurchaseAt: p.paidAt ?? null,
          emailsSent: 0,
          totalOpens: 0,
          totalClicks: 0,
          lastEmailAt: null,
          source: "purchase",
        });
      }
    }

    // 2. Pending orders (not converted) — add if not already in contacts
    const pendingOrders = await ctx.db
      .query("pendingOrders")
      .filter((q) => q.eq(q.field("convertedAt"), undefined))
      .collect();

    for (const po of pendingOrders) {
      const lowerEmail = po.email.toLowerCase();
      if (!contacts.has(lowerEmail)) {
        contacts.set(lowerEmail, {
          email: po.email,
          name: `${po.firstName} ${po.lastName}`,
          products: [],
          totalSpent: 0,
          purchaseCount: 0,
          firstPurchaseAt: null,
          lastPurchaseAt: null,
          emailsSent: 0,
          totalOpens: 0,
          totalClicks: 0,
          lastEmailAt: null,
          source: "pending",
        });
      }
    }

    // 3. Enrich with email engagement data
    const emailLogs = await ctx.db.query("emailLog").collect();
    for (const log of emailLogs) {
      const lowerEmail = log.to.toLowerCase();
      const contact = contacts.get(lowerEmail);
      if (!contact) continue;

      if (log.status === "sent") {
        contact.emailsSent++;
        contact.totalOpens += log.openCount ?? 0;
        contact.totalClicks += log.clickCount ?? 0;
        if (!contact.lastEmailAt || log.createdAt > contact.lastEmailAt) {
          contact.lastEmailAt = log.createdAt;
        }
      }
    }

    return Array.from(contacts.values()).sort((a, b) => {
      return (b.lastPurchaseAt ?? b.lastEmailAt ?? 0) - (a.lastPurchaseAt ?? a.lastEmailAt ?? 0);
    });
  },
});

/**
 * Get detailed email history for a contact.
 */
export const getContactEmails = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    await requireAdmin(ctx);

    const emails = await ctx.db
      .query("emailLog")
      .withIndex("by_to", (q) => q.eq("to", email))
      .collect();

    // Get events for each email
    const enriched = [];
    for (const e of emails) {
      const events = await ctx.db
        .query("emailEvents")
        .withIndex("by_email", (q) => q.eq("emailLogId", e._id))
        .collect();

      enriched.push({
        ...e,
        events,
      });
    }

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get enhanced email log with open/click data.
 */
export const getEmailLogEnhanced = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);

    return await ctx.db
      .query("emailLog")
      .order("desc")
      .take(limit ?? 100);
  },
});

/**
 * Get an email's HTML body for preview.
 */
export const getEmailPreview = query({
  args: { emailId: v.id("emailLog") },
  handler: async (ctx, { emailId }) => {
    await requireAdmin(ctx);
    const email = await ctx.db.get(emailId);
    return email?.htmlBody ?? null;
  },
});

/**
 * Get a template's preview HTML (wrapped in email template).
 */
export const previewTemplate = query({
  args: { templateId: v.id("emailTemplates"), lang: v.union(v.literal("nl"), v.literal("en")) },
  handler: async (ctx, { templateId, lang }) => {
    await requireAdmin(ctx);
    const template = await ctx.db.get(templateId);
    if (!template) return null;

    const isNl = lang === "nl";
    const subject = isNl ? template.subjectNl : template.subjectEn;
    const body = isNl ? template.htmlNl : template.htmlEn;

    return { subject, body };
  },
});
