/**
 * Checkout page A/B testing — experiment CRUD + conversion tracking.
 * Middleware assigns variants via cookies; this file tracks results.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// ── Admin Queries ──

export const getExperiments = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("experiments").order("desc").collect();
  },
});

export const getExperiment = query({
  args: { id: v.id("experiments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(id);
  },
});

// ── Admin Mutations ──

export const createExperiment = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    product: v.string(),
    variantALabel: v.string(),
    variantBLabel: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("experiments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("Experiment slug bestaat al.");

    return await ctx.db.insert("experiments", {
      ...args,
      status: "draft",
      impressionsA: 0,
      impressionsB: 0,
      conversionsA: 0,
      conversionsB: 0,
      revenueA: 0,
      revenueB: 0,
      createdAt: Date.now(),
    });
  },
});

export const startExperiment = mutation({
  args: { id: v.id("experiments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const exp = await ctx.db.get(id);
    if (!exp) throw new Error("Experiment niet gevonden.");

    // Only one running experiment per product
    const running = await ctx.db
      .query("experiments")
      .withIndex("by_product_status", (q) =>
        q.eq("product", exp.product).eq("status", "running"),
      )
      .first();
    if (running && running._id !== id) {
      throw new Error(`Er draait al een experiment voor ${exp.product}: "${running.name}"`);
    }

    await ctx.db.patch(id, { status: "running", startedAt: Date.now() });
  },
});

export const pauseExperiment = mutation({
  args: { id: v.id("experiments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status: "paused" });
  },
});

export const declareWinner = mutation({
  args: {
    id: v.id("experiments"),
    winner: v.union(v.literal("A"), v.literal("B")),
  },
  handler: async (ctx, { id, winner }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, {
      winner,
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const deleteExperiment = mutation({
  args: { id: v.id("experiments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const exp = await ctx.db.get(id);
    if (exp?.status === "running") throw new Error("Stop het experiment eerst.");
    await ctx.db.delete(id);
  },
});

// ── Tracking (called from checkout flow) ──

export const recordImpression = internalMutation({
  args: {
    slug: v.string(),
    variant: v.string(),
  },
  handler: async (ctx, { slug, variant }) => {
    const exp = await ctx.db
      .query("experiments")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!exp || exp.status !== "running") return;

    if (variant === "B") {
      await ctx.db.patch(exp._id, { impressionsB: exp.impressionsB + 1 });
    } else {
      await ctx.db.patch(exp._id, { impressionsA: exp.impressionsA + 1 });
    }
  },
});

export const recordConversion = internalMutation({
  args: {
    slug: v.string(),
    variant: v.string(),
    revenueCents: v.number(),
  },
  handler: async (ctx, { slug, variant, revenueCents }) => {
    const exp = await ctx.db
      .query("experiments")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!exp) return;

    if (variant === "B") {
      await ctx.db.patch(exp._id, {
        conversionsB: exp.conversionsB + 1,
        revenueB: exp.revenueB + revenueCents,
      });
    } else {
      await ctx.db.patch(exp._id, {
        conversionsA: exp.conversionsA + 1,
        revenueA: exp.revenueA + revenueCents,
      });
    }
  },
});

// ── Public query for checkout page (no auth needed) ──

export const getActiveExperimentForProduct = query({
  args: { product: v.string() },
  handler: async (ctx, { product }) => {
    // Check product-specific experiment
    const specific = await ctx.db
      .query("experiments")
      .withIndex("by_product_status", (q) =>
        q.eq("product", product).eq("status", "running"),
      )
      .first();
    if (specific) return { slug: specific.slug, weight: specific.weight };

    // Check wildcard experiment
    const wildcard = await ctx.db
      .query("experiments")
      .withIndex("by_product_status", (q) =>
        q.eq("product", "*").eq("status", "running"),
      )
      .first();
    if (wildcard) return { slug: wildcard.slug, weight: wildcard.weight };

    return null;
  },
});
