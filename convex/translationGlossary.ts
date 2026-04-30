import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

const modeValidator = v.union(v.literal("preserve"), v.literal("translate"));

/** Public list — admin-only. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const entries = await ctx.db.query("translationGlossary").collect();
    return entries.sort((a, b) => a.termNl.localeCompare(b.termNl, "nl"));
  },
});

/** Internal list — used by aiTranslate to assemble the prompt. */
export const listAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("translationGlossary").collect();
  },
});

export const createEntry = mutation({
  args: {
    termNl: v.string(),
    mode: modeValidator,
    en: v.optional(v.string()),
    de: v.optional(v.string()),
    caseSensitive: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const term = args.termNl.trim();
    if (!term) throw new Error("Term mag niet leeg zijn.");

    const termLower = term.toLowerCase();
    const existing = await ctx.db
      .query("translationGlossary")
      .withIndex("by_term_lower", (q) => q.eq("termNlLower", termLower))
      .first();
    if (existing) throw new Error("Deze term bestaat al in het woordenboek.");

    const now = Date.now();
    return await ctx.db.insert("translationGlossary", {
      termNl: term,
      termNlLower: termLower,
      mode: args.mode,
      en: args.mode === "translate" ? args.en?.trim() || undefined : undefined,
      de: args.mode === "translate" ? args.de?.trim() || undefined : undefined,
      caseSensitive: args.caseSensitive,
      notes: args.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateEntry = mutation({
  args: {
    id: v.id("translationGlossary"),
    termNl: v.string(),
    mode: modeValidator,
    en: v.optional(v.string()),
    de: v.optional(v.string()),
    caseSensitive: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const term = args.termNl.trim();
    if (!term) throw new Error("Term mag niet leeg zijn.");

    const termLower = term.toLowerCase();
    const conflict = await ctx.db
      .query("translationGlossary")
      .withIndex("by_term_lower", (q) => q.eq("termNlLower", termLower))
      .first();
    if (conflict && conflict._id !== args.id) {
      throw new Error("Een andere ingang gebruikt deze term al.");
    }

    await ctx.db.patch(args.id, {
      termNl: term,
      termNlLower: termLower,
      mode: args.mode,
      en: args.mode === "translate" ? args.en?.trim() || undefined : undefined,
      de: args.mode === "translate" ? args.de?.trim() || undefined : undefined,
      caseSensitive: args.caseSensitive,
      notes: args.notes?.trim() || undefined,
      updatedAt: Date.now(),
    });
  },
});

export const deleteEntry = mutation({
  args: { id: v.id("translationGlossary") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
