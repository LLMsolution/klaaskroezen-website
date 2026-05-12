/**
 * Site settings — admin-adjustable configuration values.
 * Uses a single-row pattern with key "global".
 */

import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

const DEFAULTS = {
  abandonedCartDelayMinutes: 30,
  escalationDelayHours: [24, 48, 96], // 24h, 48h, 4 days
};

// ── Public query (admin) ──

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    return {
      abandonedCartDelayMinutes: settings?.abandonedCartDelayMinutes ?? DEFAULTS.abandonedCartDelayMinutes,
      escalationDelayHours: settings?.escalationDelayHours ?? DEFAULTS.escalationDelayHours,
    };
  },
});

// ── Internal query (for checkout scheduler) ──

export const getAbandonedCartTiming = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    return {
      firstDelayMs: (settings?.abandonedCartDelayMinutes ?? DEFAULTS.abandonedCartDelayMinutes) * 60 * 1000,
      escalationDelaysMs: (settings?.escalationDelayHours ?? DEFAULTS.escalationDelayHours).map(
        (h) => h * 60 * 60 * 1000,
      ),
    };
  },
});

// ── Admin mutation ──

export const updateSettings = mutation({
  args: {
    abandonedCartDelayMinutes: v.number(),
    escalationDelayHours: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.abandonedCartDelayMinutes < 5) throw new Error("Minimaal 5 minuten.");
    if (args.escalationDelayHours.length < 1) throw new Error("Minimaal 1 escalatie stap.");

    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        abandonedCartDelayMinutes: args.abandonedCartDelayMinutes,
        escalationDelayHours: args.escalationDelayHours,
      });
    } else {
      await ctx.db.insert("siteSettings", {
        key: "global",
        abandonedCartDelayMinutes: args.abandonedCartDelayMinutes,
        escalationDelayHours: args.escalationDelayHours,
      });
    }
  },
});

// ── Seller / company info ──

export const getSellerInfo = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    return {
      sellerName: settings?.sellerName ?? "",
      sellerAddress: settings?.sellerAddress ?? "",
      sellerPostalCity: settings?.sellerPostalCity ?? "",
      sellerKvk: settings?.sellerKvk ?? "",
      sellerBtw: settings?.sellerBtw ?? "",
      sellerIban: settings?.sellerIban ?? "",
      sellerEmail: settings?.sellerEmail ?? "",
      contactNotificationEmail: settings?.contactNotificationEmail ?? "",
    };
  },
});

export const getSellerSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    return {
      sellerName: settings?.sellerName ?? "",
      sellerAddress: settings?.sellerAddress ?? "",
      sellerPostalCity: settings?.sellerPostalCity ?? "",
      sellerKvk: settings?.sellerKvk ?? "",
      sellerBtw: settings?.sellerBtw ?? "",
      sellerIban: settings?.sellerIban ?? "",
      sellerEmail: settings?.sellerEmail ?? "",
      contactNotificationEmail: settings?.contactNotificationEmail ?? "",
    };
  },
});

export const updateSellerSettings = mutation({
  args: {
    sellerName: v.string(),
    sellerAddress: v.string(),
    sellerPostalCity: v.string(),
    sellerKvk: v.string(),
    sellerBtw: v.string(),
    sellerIban: v.string(),
    sellerEmail: v.string(),
    contactNotificationEmail: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("siteSettings", { key: "global", ...args });
    }
  },
});

// ── Email signatures ──

const DEFAULT_SIG = {
  nl: `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">Met vriendelijke groet,<br /><strong style="color: #0E0C0A;">Klaas Kroezen</strong></p>`,
  en: `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">Best regards,<br /><strong style="color: #0E0C0A;">Klaas Kroezen</strong></p>`,
  de: `<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.75; color: #444;">Mit freundlichen Grüßen,<br /><strong style="color: #0E0C0A;">Klaas Kroezen</strong></p>`,
};

export const getEmailSignatures = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    return {
      nl: (settings?.emailSignatureNl?.trim() || DEFAULT_SIG.nl),
      en: (settings?.emailSignatureEn?.trim() || DEFAULT_SIG.en),
      de: (settings?.emailSignatureDe?.trim() || DEFAULT_SIG.de),
    };
  },
});

export const getEmailSignaturesSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    return {
      emailSignatureNl: settings?.emailSignatureNl ?? "",
      emailSignatureEn: settings?.emailSignatureEn ?? "",
      emailSignatureDe: settings?.emailSignatureDe ?? "",
    };
  },
});

export const updateEmailSignatures = mutation({
  args: {
    emailSignatureNl: v.string(),
    emailSignatureEn: v.string(),
    emailSignatureDe: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("siteSettings", { key: "global", ...args });
    }
  },
});

// ── Contact form recipient ──

export const getContactNotificationEmail = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    const configured = settings?.contactNotificationEmail?.trim();
    return configured || "klaas@klaaskroezen.nl";
  },
});

// ── Popup config ──

export const getPopupConfig = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();
    if (!settings) return null;
    const imageUrl = settings.popupImageStorageId
      ? await ctx.storage.getUrl(settings.popupImageStorageId)
      : null;
    return {
      enabled: settings.popupEnabled ?? false,
      product: settings.popupProduct,
      imageUrl,
      label: settings.popupLabel,
      title: settings.popupTitle,
      description: settings.popupDescription,
      cta: settings.popupCta,
      price: settings.popupPrice,
      pages: settings.popupPages ?? [],
    };
  },
});

export const updatePopupConfig = mutation({
  args: {
    enabled: v.boolean(),
    product: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    label: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    title: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    description: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    cta: v.optional(v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) })),
    price: v.optional(v.string()),
    pages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .first();

    const patch: Record<string, unknown> = {
      popupEnabled: args.enabled,
    };
    if (args.product !== undefined) patch.popupProduct = args.product;
    if (args.imageStorageId !== undefined) patch.popupImageStorageId = args.imageStorageId;
    if (args.label !== undefined) patch.popupLabel = args.label;
    if (args.title !== undefined) patch.popupTitle = args.title;
    if (args.description !== undefined) patch.popupDescription = args.description;
    if (args.cta !== undefined) patch.popupCta = args.cta;
    if (args.price !== undefined) patch.popupPrice = args.price;
    if (args.pages !== undefined) patch.popupPages = args.pages;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("siteSettings", { key: "global", ...patch });
    }
  },
});
