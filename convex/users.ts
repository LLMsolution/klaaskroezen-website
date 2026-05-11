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
 * Filters by language with fallback: prefer the requested lang, fall back to NL,
 * then to any file matching the product. Untagged files (lang=undefined) count as NL.
 */
export const getMyDownloads = query({
  args: { lang: v.optional(langValidator) },
  handler: async (ctx, { lang }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const preferredLang = lang ?? "nl";

    // Admins get all digital files directly (they have no accessRights rows)
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q: any) => q.eq(q.field("userId"), userId))
      .collect();
    const emailAccount = accounts.find((a: any) => a.providerAccountId?.includes("@"));
    const email = emailAccount?.providerAccountId ?? "";
    const isAdmin = email ? await isAdminEmail(ctx, email) : false;

    const now = Date.now();
    let accessRights: Array<{ resource: string }>;

    if (isAdmin) {
      const allFiles = await ctx.db.query("digitalFiles").collect();
      const seenProducts = new Set<string>();
      const products = allFiles
        .map((f) => f.product)
        .filter((p) => { if (seenProducts.has(p)) return false; seenProducts.add(p); return true; });
      accessRights = products.map((p) => ({ resource: p }));
    } else {
      const allRights = await ctx.db
        .query("accessRights")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("revokedAt"), undefined))
        .collect();
      accessRights = allRights.filter((r) => !r.expiresAt || r.expiresAt > now);
    }

    const downloads = [];
    for (const right of accessRights) {
      const files = await ctx.db
        .query("digitalFiles")
        .withIndex("by_product", (q) => q.eq("product", right.resource))
        .collect();

      if (files.length === 0) continue;

      // Prefer files matching the user's lang. Files without a lang field count as NL.
      const matchingPreferred = files.filter(
        (f) => (f.lang ?? "nl") === preferredLang,
      );
      const fallbackNl = files.filter((f) => (f.lang ?? "nl") === "nl");
      const chosen = matchingPreferred.length > 0
        ? matchingPreferred
        : fallbackNl.length > 0
          ? fallbackNl
          : files;

      for (const file of chosen) {
        const url = await ctx.storage.getUrl(file.storageId);
        if (url) {
          downloads.push({
            product: file.product,
            fileName: file.fileName,
            fileType: file.fileType,
            lang: file.lang ?? "nl",
            format: file.format,
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
/** Check if an email has an existing account */
export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("providerAccountId"), email.toLowerCase()))
      .first();
    return !!account;
  },
});

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

/**
 * Export all data we hold about the current user (AVG art. 20 portability).
 * Returns a JSON-serializable object with profile, purchases, invoices,
 * access rights, bookmarks, notes and module progress. Buyer email + invoice
 * snapshots remain on `purchases`/`invoices` for fiscal retention even after
 * an account is deleted; this export reflects the data still attached to the
 * authenticated userId.
 */
export const exportMyData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Niet ingelogd.");

    const user = await ctx.db.get(userId);
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    const email = accounts.find((a) => a.providerAccountId?.includes("@"))
      ?.providerAccountId ?? user?.email ?? "";

    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const invoices: Array<Record<string, unknown>> = [];
    for (const purchase of purchases) {
      const invoice = await ctx.db
        .query("invoices")
        .withIndex("by_purchase", (q) => q.eq("purchaseId", purchase._id))
        .first();
      if (invoice) invoices.push(invoice);
    }

    const accessRights = await ctx.db
      .query("accessRights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_module", (q) => q.eq("userId", userId))
      .collect();

    const userNotes = await ctx.db
      .query("userNotes")
      .withIndex("by_user_module", (q) => q.eq("userId", userId))
      .collect();

    const moduleProgress = await ctx.db
      .query("moduleProgress")
      .withIndex("by_user_training", (q) => q.eq("userId", userId))
      .collect();

    const trainingCompletions = await ctx.db
      .query("trainingCompletions")
      .withIndex("by_user_training", (q) => q.eq("userId", userId))
      .collect();

    return {
      exportedAt: new Date().toISOString(),
      account: {
        userId,
        name: user?.name ?? null,
        email,
      },
      profile: contact
        ? {
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone,
            company: contact.company,
            website: contact.website,
            linkedin: contact.linkedin,
            tags: contact.tags,
            unsubscribed: contact.unsubscribed,
            lang: contact.lang,
            createdAt: contact.createdAt,
          }
        : null,
      purchases,
      invoices,
      accessRights,
      bookmarks,
      notes: userNotes,
      moduleProgress,
      trainingCompletions,
    };
  },
});

/**
 * Anonymize and remove the current user's account (AVG art. 17 right to be
 * forgotten). Orders, invoices and purchase records are KEPT but detached
 * from userId — buyerEmail snapshots remain on the invoice for the 7-year
 * fiscal retention obligation. Profile, notes, bookmarks, progress and CRM
 * contact are deleted. The user record itself is anonymized so the auth
 * session breaks on next request.
 */
export const deleteMyAccount = mutation({
  args: { confirm: v.literal("VERWIJDER MIJN ACCOUNT") },
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Niet ingelogd.");

    // Detach userId from purchases (keep purchase row for fiscal retention)
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const p of purchases) {
      await ctx.db.patch(p._id, { userId: undefined });
    }

    // Revoke all access rights
    const rights = await ctx.db
      .query("accessRights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of rights) {
      await ctx.db.delete(r._id);
    }

    // Delete bookmarks, notes, progress
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_module", (q) => q.eq("userId", userId))
      .collect();
    for (const b of bookmarks) await ctx.db.delete(b._id);

    const notes = await ctx.db
      .query("userNotes")
      .withIndex("by_user_module", (q) => q.eq("userId", userId))
      .collect();
    for (const n of notes) await ctx.db.delete(n._id);

    const modProgress = await ctx.db
      .query("moduleProgress")
      .withIndex("by_user_training", (q) => q.eq("userId", userId))
      .collect();
    for (const p of modProgress) await ctx.db.delete(p._id);

    const completions = await ctx.db
      .query("trainingCompletions")
      .withIndex("by_user_training", (q) => q.eq("userId", userId))
      .collect();
    for (const c of completions) await ctx.db.delete(c._id);

    // Delete CRM contact
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (contact) await ctx.db.delete(contact._id);

    // Remove auth accounts (email + OAuth)
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    for (const a of accounts) await ctx.db.delete(a._id);

    // Anonymize user row (cannot delete cleanly because Convex auth holds
    // references; clearing identifying fields breaks the session safely).
    await ctx.db.patch(userId, {
      name: undefined,
      email: undefined,
    });
  },
});
