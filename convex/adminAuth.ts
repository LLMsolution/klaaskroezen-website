import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { auth } from "./auth";

type Ctx = QueryCtx | MutationCtx;

// Bootstrap admin emails — used as fallback when adminEmails table is empty
const SEED_ADMIN_EMAILS = [
  "klaas@klaaskroezen.nl",
  "timlind18@icloud.com",
  "yvon@yvonkruger.nl",
];

/**
 * Get admin email list from database, falling back to seed list if empty.
 */
async function getAdminEmailList(ctx: Ctx): Promise<string[]> {
  const entries = await ctx.db.query("adminEmails").collect();
  if (entries.length > 0) {
    return entries.map((e) => (e.email as string).toLowerCase());
  }
  return SEED_ADMIN_EMAILS.map((e) => e.toLowerCase());
}

/**
 * Check if an email has admin access.
 */
export async function isAdminEmail(ctx: Ctx, email: string): Promise<boolean> {
  const adminEmails = await getAdminEmailList(ctx);
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Require admin access — throws if not authorized.
 * Shared helper used by admin.ts and other backend files.
 */
export async function requireAdmin(ctx: Ctx) {
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
  const isAdmin = await isAdminEmail(ctx, email);
  if (!isAdmin) {
    throw new Error("Geen toegang.");
  }

  return { userId, user, email };
}

// ── Public queries & mutations ──

export const listAdminEmails = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const entries = await ctx.db.query("adminEmails").collect();
    if (entries.length === 0) {
      return {
        emails: SEED_ADMIN_EMAILS.map((email) => ({
          _id: null as string | null,
          email,
          name: undefined as string | undefined,
          addedAt: 0,
        })),
        isSeeded: false,
      };
    }
    return {
      emails: entries.map((e) => ({
        _id: e._id as string | null,
        email: e.email,
        name: e.name,
        addedAt: e.addedAt,
      })),
      isSeeded: true,
    };
  },
});

export const listAdminEmailsPublic = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const entries = await ctx.db.query("adminEmails").collect();
    if (entries.length === 0) {
      return SEED_ADMIN_EMAILS.map((email) => ({
        email,
        name: undefined as string | undefined,
      }));
    }
    return entries.map((e) => ({
      email: e.email,
      name: e.name,
    }));
  },
});

export const addAdminEmail = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, { email, name }) => {
    await requireAdmin(ctx);
    const normalized = email.toLowerCase().trim();
    if (!normalized.includes("@")) {
      throw new Error("Ongeldig e-mailadres.");
    }
    const existing = await ctx.db
      .query("adminEmails")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (existing) {
      throw new Error("Dit e-mailadres is al beheerder.");
    }
    await ctx.db.insert("adminEmails", {
      email: normalized,
      name: name?.trim() || undefined,
      addedAt: Date.now(),
    });
  },
});

export const removeAdminEmail = mutation({
  args: { id: v.id("adminEmails") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("adminEmails").collect();
    if (all.length <= 1) {
      throw new Error("Er moet minimaal één beheerder zijn.");
    }
    await ctx.db.delete(id);
  },
});

export const updateAdminEmail = mutation({
  args: { id: v.id("adminEmails"), name: v.optional(v.string()) },
  handler: async (ctx, { id, name }) => {
    await requireAdmin(ctx);
    const entry = await ctx.db.get(id);
    if (!entry) throw new Error("Beheerder niet gevonden.");
    await ctx.db.patch(id, { name: name?.trim() || undefined });
  },
});

export const initAdminEmails = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("adminEmails").collect();
    if (existing.length > 0) return;
    for (const email of SEED_ADMIN_EMAILS) {
      await ctx.db.insert("adminEmails", {
        email: email.toLowerCase(),
        addedAt: Date.now(),
      });
    }
  },
});
