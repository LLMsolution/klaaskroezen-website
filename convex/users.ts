import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { isAdminEmail } from "./adminAuth";

/**
 * Get the currently authenticated user with their email.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Get email from authAccounts
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const emailAccount = accounts.find(
      (a) => a.providerAccountId?.includes("@"),
    );

    const email = emailAccount?.providerAccountId ?? user.email ?? "";
    const isAdmin = await isAdminEmail(ctx, email);

    return {
      _id: user._id,
      name: user.name,
      email,
      isAdmin,
    };
  },
});

/**
 * Get purchases for the currently logged-in user.
 */
export const getMyPurchases = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get access rights for the currently logged-in user.
 */
export const getMyAccessRights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("accessRights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("revokedAt"), undefined))
      .collect();
  },
});

/**
 * Get invoices for the currently logged-in user.
 */
export const getMyInvoices = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Get purchases first to find invoices
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const invoices = [];
    for (const purchase of purchases) {
      const invoice = await ctx.db
        .query("invoices")
        .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
        .first();
      if (invoice) invoices.push(invoice);
    }

    return invoices.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get downloadable files for the user based on their access rights.
 */
export const getMyDownloads = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const accessRights = await ctx.db
      .query("accessRights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("revokedAt"), undefined))
      .collect();

    const downloads = [];
    for (const right of accessRights) {
      const files = await ctx.db
        .query("digitalFiles")
        .withIndex("by_product", (q) => q.eq("product", right.resource))
        .collect();

      for (const file of files) {
        const url = await ctx.storage.getUrl(file.storageId);
        if (url) {
          downloads.push({
            product: file.product,
            fileName: file.fileName,
            fileType: file.fileType,
            url,
          });
        }
      }
    }

    return downloads;
  },
});

/**
 * Update user profile name.
 */
export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Niet ingelogd.");

    await ctx.db.patch(userId, { name });
  },
});
