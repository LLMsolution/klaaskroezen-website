import { mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";

/**
 * Backfill `invoices.userId` for historic rows by inheriting from the linked
 * purchase. Purchases that themselves are still unlinked are reconciled by
 * `reconcileUnlinkedPurchases` below.
 */
export const backfillInvoiceUserIds = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const invoices = await ctx.db.query("invoices").collect();
    let patched = 0;
    for (const inv of invoices) {
      if (inv.userId) continue;
      const purchase = await ctx.db.get(inv.purchaseId);
      if (purchase?.userId) {
        await ctx.db.patch(inv._id, { userId: purchase.userId });
        patched++;
      }
    }
    return { patched, total: invoices.length };
  },
});

/**
 * Walk every paid purchase whose `userId` is still empty. For each email
 * with a matching auth account, hand the work off to `grantAllPendingForEmail`
 * (which is idempotent and patches purchase + invoice userId in one go).
 */
type UnlinkedCandidate = { email: string; userId: import("./_generated/dataModel").Id<"users"> };

export const reconcileUnlinkedPurchases = action({
  args: {},
  handler: async (ctx): Promise<{ processed: number }> => {
    await ctx.runMutation(internal.invoicesMigration.assertAdminFromAction, {});

    const candidates: UnlinkedCandidate[] = await ctx.runQuery(
      internal.invoicesMigration.collectUnlinkedEmails,
      {},
    );
    for (const { email, userId } of candidates) {
      await ctx.runAction(internal.payments.grantAllPendingForEmail, { email, userId });
    }
    return { processed: candidates.length };
  },
});

export const assertAdminFromAction = internalMutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
  },
});

export const collectUnlinkedEmails = internalQuery({
  args: {},
  handler: async (ctx) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_status", (q) => q.eq("status", "paid"))
      .collect();

    const accounts = await ctx.db.query("authAccounts").collect();
    const userIdByEmail = new Map<string, typeof accounts[number]["userId"]>();
    for (const a of accounts) {
      if (!a.providerAccountId?.includes("@")) continue;
      userIdByEmail.set(a.providerAccountId.toLowerCase(), a.userId);
    }

    const seen = new Set<string>();
    const out: Array<{ email: string; userId: typeof accounts[number]["userId"] }> = [];
    for (const p of purchases) {
      if (p.userId) continue;
      const key = p.buyerEmail.toLowerCase();
      if (seen.has(key)) continue;
      const userId = userIdByEmail.get(key);
      if (!userId) continue;
      seen.add(key);
      out.push({ email: p.buyerEmail, userId });
    }
    return out;
  },
});
