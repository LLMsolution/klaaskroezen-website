import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import type { Id } from "./_generated/dataModel";
import { langValidator } from "./schema";

const CONTACT_SOURCE = v.union(
  v.literal("contact_form"),
  v.literal("checkout"),
  v.literal("purchase"),
  v.literal("manual"),
  v.literal("import"),
  v.literal("referral"),
);

/* ═══════════════════════════════════════════
   QUERIES
   ═══════════════════════════════════════════ */

export const getContacts = query({
  args: {
    search: v.optional(v.string()),
    source: v.optional(v.string()),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { search, source, tag, limit }) => {
    await requireAdmin(ctx);

    let contacts = await ctx.db.query("contacts").order("desc").collect();

    if (search) {
      const q = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.firstName.toLowerCase().includes(q) ||
          (c.lastName?.toLowerCase().includes(q) ?? false) ||
          (c.company?.toLowerCase().includes(q) ?? false),
      );
    }

    if (source) {
      contacts = contacts.filter((c) => c.source === source);
    }

    if (tag) {
      contacts = contacts.filter((c) => c.tags.includes(tag));
    }

    return contacts.slice(0, limit ?? 100);
  },
});

export const getContactByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
  },
});

export const getContactById = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(contactId);
  },
});

export const getContactTimeline = query({
  args: { contactId: v.id("contacts"), limit: v.optional(v.number()) },
  handler: async (ctx, { contactId, limit }) => {
    await requireAdmin(ctx);
    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("by_contact", (q) => q.eq("contactId", contactId))
      .order("desc")
      .take(limit ?? 50);
    return activities;
  },
});

export const getContactPurchases = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => {
    await requireAdmin(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact?.userId) return [];
    return await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", contact.userId!))
      .collect();
  },
});

export const getContactEmails = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => {
    await requireAdmin(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) return [];
    return await ctx.db
      .query("emailLog")
      .withIndex("by_to", (q) => q.eq("to", contact.email))
      .order("desc")
      .take(30);
  },
});

/* ═══════════════════════════════════════════
   MUTATIONS
   ═══════════════════════════════════════════ */

export const createContact = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    source: CONTACT_SOURCE,
    sourceDetail: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    lang: v.optional(langValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const email = args.email.toLowerCase().trim();

    // Check for existing contact
    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      throw new Error("Contact met dit e-mailadres bestaat al.");
    }

    const now = Date.now();
    return await ctx.db.insert("contacts", {
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      company: args.company,
      jobTitle: args.jobTitle,
      engagementScore: 0,
      intentScore: 0,
      lastActivityAt: now,
      source: args.source,
      sourceDetail: args.sourceDetail,
      tags: args.tags ?? [],
      unsubscribed: false,
      lang: args.lang ?? "nl",
      createdAt: now,
    });
  },
});

export const updateContact = mutation({
  args: {
    contactId: v.id("contacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    lang: v.optional(langValidator),
  },
  handler: async (ctx, { contactId, ...fields }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(contactId, patch);
    }
  },
});

export const addTag = mutation({
  args: { contactId: v.id("contacts"), tag: v.string() },
  handler: async (ctx, { contactId, tag }) => {
    await requireAdmin(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) throw new Error("Contact niet gevonden.");
    const normalized = tag.toLowerCase().trim();
    if (contact.tags.includes(normalized)) return;
    await ctx.db.patch(contactId, { tags: [...contact.tags, normalized] });
    await ctx.db.insert("leadActivities", {
      contactId,
      type: "tag_added",
      title: `Tag "${normalized}" toegevoegd`,
      createdAt: Date.now(),
    });
  },
});

export const removeTag = mutation({
  args: { contactId: v.id("contacts"), tag: v.string() },
  handler: async (ctx, { contactId, tag }) => {
    await requireAdmin(ctx);
    const contact = await ctx.db.get(contactId);
    if (!contact) throw new Error("Contact niet gevonden.");
    const normalized = tag.toLowerCase().trim();
    await ctx.db.patch(contactId, {
      tags: contact.tags.filter((t) => t !== normalized),
    });
    await ctx.db.insert("leadActivities", {
      contactId,
      type: "tag_removed",
      title: `Tag "${normalized}" verwijderd`,
      createdAt: Date.now(),
    });
  },
});

export const mergeContacts = mutation({
  args: {
    keepId: v.id("contacts"),
    mergeId: v.id("contacts"),
  },
  handler: async (ctx, { keepId, mergeId }) => {
    await requireAdmin(ctx);
    const keep = await ctx.db.get(keepId);
    const merge = await ctx.db.get(mergeId);
    if (!keep || !merge) throw new Error("Contact niet gevonden.");

    // Merge tags
    const allTags = [...new Set([...keep.tags, ...merge.tags])];
    // Keep higher scores
    const engagementScore = Math.max(keep.engagementScore, merge.engagementScore);
    const intentScore = Math.max(keep.intentScore, merge.intentScore);

    await ctx.db.patch(keepId, {
      tags: allTags,
      engagementScore,
      intentScore,
      phone: keep.phone || merge.phone,
      company: keep.company || merge.company,
      jobTitle: keep.jobTitle || merge.jobTitle,
      lastName: keep.lastName || merge.lastName,
    });

    // Move activities from merged contact
    const activities = await ctx.db
      .query("leadActivities")
      .withIndex("by_contact", (q) => q.eq("contactId", mergeId))
      .collect();
    for (const activity of activities) {
      await ctx.db.patch(activity._id, { contactId: keepId });
    }

    // Move leads from merged contact
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_contact", (q) => q.eq("contactId", mergeId))
      .collect();
    for (const lead of leads) {
      await ctx.db.patch(lead._id, { contactId: keepId });
    }

    // Delete merged contact
    await ctx.db.delete(mergeId);
  },
});

/* ═══════════════════════════════════════════
   INTERNAL — used by integrations (Phase 4)
   ═══════════════════════════════════════════ */

export const findOrCreateContact = internalMutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    source: CONTACT_SOURCE,
    sourceDetail: v.optional(v.string()),
    lang: v.optional(langValidator),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      // Update fields if more info is available
      const patch: Record<string, unknown> = { lastActivityAt: Date.now() };
      if (!existing.phone && args.phone) patch.phone = args.phone;
      if (!existing.company && args.company) patch.company = args.company;
      if (!existing.lastName && args.lastName) patch.lastName = args.lastName;
      if (!existing.userId && args.userId) patch.userId = args.userId;
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("contacts", {
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      company: args.company,
      engagementScore: 0,
      intentScore: 0,
      lastActivityAt: now,
      source: args.source,
      sourceDetail: args.sourceDetail,
      tags: [],
      unsubscribed: false,
      lang: args.lang ?? "nl",
      createdAt: now,
    });
  },
});

export const updateContactScore = internalMutation({
  args: {
    contactId: v.id("contacts"),
    engagementDelta: v.optional(v.number()),
    intentDelta: v.optional(v.number()),
  },
  handler: async (ctx, { contactId, engagementDelta, intentDelta }) => {
    const contact = await ctx.db.get(contactId);
    if (!contact) return;
    const patch: Record<string, unknown> = { lastActivityAt: Date.now() };
    if (engagementDelta) {
      patch.engagementScore = Math.max(0, contact.engagementScore + engagementDelta);
    }
    if (intentDelta) {
      patch.intentScore = Math.max(0, contact.intentScore + intentDelta);
    }
    await ctx.db.patch(contactId, patch);
  },
});

export const getContactByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first();
  },
});

export const logActivity = internalMutation({
  args: {
    contactId: v.id("contacts"),
    leadId: v.optional(v.id("leads")),
    type: v.union(
      v.literal("note"),
      v.literal("call"),
      v.literal("meeting"),
      v.literal("email_sent"),
      v.literal("email_opened"),
      v.literal("email_clicked"),
      v.literal("stage_change"),
      v.literal("score_change"),
      v.literal("contact_form"),
      v.literal("checkout_started"),
      v.literal("checkout_abandoned"),
      v.literal("purchase"),
      v.literal("lead_created"),
      v.literal("lead_won"),
      v.literal("lead_lost"),
      v.literal("tag_added"),
      v.literal("tag_removed"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    performedBy: v.optional(v.string()),
    emailLogId: v.optional(v.id("emailLog")),
    purchaseId: v.optional(v.id("purchases")),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("leadActivities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
