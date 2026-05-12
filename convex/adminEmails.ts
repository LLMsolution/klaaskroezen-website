import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { langValidator } from "./schema";

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
      const user = seq.userId ? await ctx.db.get(seq.userId) : null;
      enriched.push({
        ...seq,
        userName: (user as any)?.name ?? "\u2014",
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
    subjectDe: v.optional(v.string()),
    htmlNl: v.optional(v.string()),
    htmlEn: v.optional(v.string()),
    htmlDe: v.optional(v.string()),
    delayDays: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.subjectNl !== undefined) patch.subjectNl = updates.subjectNl;
    if (updates.subjectEn !== undefined) patch.subjectEn = updates.subjectEn;
    if (updates.subjectDe !== undefined) patch.subjectDe = updates.subjectDe;
    if (updates.htmlNl !== undefined) patch.htmlNl = updates.htmlNl;
    if (updates.htmlEn !== undefined) patch.htmlEn = updates.htmlEn;
    if (updates.htmlDe !== undefined) patch.htmlDe = updates.htmlDe;
    if (updates.delayDays !== undefined) patch.delayDays = updates.delayDays;
    if (updates.active !== undefined) patch.active = updates.active;

    await ctx.db.patch(id, patch);
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
  args: { templateId: v.id("emailTemplates"), lang: langValidator },
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
