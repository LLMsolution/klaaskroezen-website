import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { isAdminEmail } from "./adminAuth";
import { langValidator } from "./schema";

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

    const now = Date.now();
    const all = await ctx.db
      .query("accessRights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("revokedAt"), undefined))
      .collect();

    // Filter out expired access
    return all.filter((r) => !r.expiresAt || r.expiresAt > now);
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

    const now = Date.now();
    const allRights = await ctx.db
      .query("accessRights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("revokedAt"), undefined))
      .collect();
    const accessRights = allRights.filter((r) => !r.expiresAt || r.expiresAt > now);

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

/** Complete registration: save profile + create CRM contact */
export const completeRegistration = mutation({
  args: {
    firstName: v.string(),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    lang: langValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Niet ingelogd.");

    // Save name on user record
    const fullName = [args.firstName, args.lastName].filter(Boolean).join(" ");
    await ctx.db.patch(userId, { name: fullName });

    // Get email from auth accounts
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    const emailAccount = accounts.find(
      (a: { providerAccountId?: string }) => a.providerAccountId?.includes("@"),
    );
    const email = emailAccount?.providerAccountId ?? "";
    if (!email) return;

    // Create CRM contact
    await ctx.scheduler.runAfter(0, internal.crmHooks.registrationCompleted, {
      userId,
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      company: args.company,
      website: args.website,
      linkedin: args.linkedin,
      lang: args.lang,
    });
  },
});

/** Get profile data from CRM contact (for dashboard) */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!contact) return null;
    return {
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      company: contact.company,
      website: contact.website,
      linkedin: contact.linkedin,
    };
  },
});

/** Update profile fields on CRM contact (from dashboard) */
export const updateMyProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Niet ingelogd.");

    // Update user name
    const fullName = [args.firstName, args.lastName].filter(Boolean).join(" ");
    await ctx.db.patch(userId, { name: fullName });

    // Update CRM contact
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (contact) {
      await ctx.db.patch(contact._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        company: args.company,
        website: args.website,
        linkedin: args.linkedin,
        lastActivityAt: Date.now(),
      });
    }
  },
});
