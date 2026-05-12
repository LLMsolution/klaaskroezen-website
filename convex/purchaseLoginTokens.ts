import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/** Generate a cryptographically random URL-safe token. */
function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Issue a single-use login token for the order confirmation email.
 * The token resolves to the buyer's email; the ConvexCredentials provider
 * `purchase-token` validates + consumes it, creating an account if needed.
 */
export const issueToken = internalMutation({
  args: {
    email: v.string(),
    purchaseId: v.optional(v.id("purchases")),
  },
  handler: async (ctx, { email, purchaseId }) => {
    const token = randomToken();
    const now = Date.now();
    await ctx.db.insert("purchaseLoginTokens", {
      token,
      email: email.toLowerCase(),
      purchaseId,
      expiresAt: now + TOKEN_TTL_MS,
      createdAt: now,
    });
    return token;
  },
});

/** Look up a token row by its token string. Used by the auth provider. */
export const lookup = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const row = await ctx.db
      .query("purchaseLoginTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    return row;
  },
});

/** Mark a token as consumed. Idempotent — only sets usedAt if absent. */
export const markUsed = internalMutation({
  args: { tokenId: v.id("purchaseLoginTokens") },
  handler: async (ctx, { tokenId }) => {
    const row = await ctx.db.get(tokenId);
    if (!row || row.usedAt) return;
    await ctx.db.patch(tokenId, { usedAt: Date.now() });
  },
});

/**
 * Public mutation used by the bedankt-pagina once Mollie payment is confirmed.
 * Gated by orderId — only a converted (paid) pendingOrder yields a token,
 * which prevents someone from harvesting tokens for arbitrary emails.
 */
export const issueTokenForPaidOrder = mutation({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    let order;
    try {
      order = await ctx.db.get(orderId as Id<"pendingOrders">);
    } catch {
      return null;
    }
    if (!order || !order.convertedAt) return null;

    const token = randomToken();
    const now = Date.now();
    await ctx.db.insert("purchaseLoginTokens", {
      token,
      email: order.email.toLowerCase(),
      expiresAt: now + 14 * 24 * 60 * 60 * 1000,
      createdAt: now,
    });
    return token;
  },
});
