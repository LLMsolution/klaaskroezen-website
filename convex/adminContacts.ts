import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

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
          name: user?.name ?? "\u2014",
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
