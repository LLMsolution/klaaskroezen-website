import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

// ── Helpers ──

async function resolveImageUrl(
  ctx: { storage: { getUrl: (id: any) => Promise<string | null> } },
  product: { image?: string; imageStorageId?: any },
): Promise<string | undefined> {
  if (product.imageStorageId) {
    const url = await ctx.storage.getUrl(product.imageStorageId);
    if (url) return url;
  }
  return product.image;
}

// ── Public queries ──

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("checkoutProducts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!product) return null;
    const image = await resolveImageUrl(ctx, product);
    return { ...product, image };
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("checkoutProducts")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const resolved = await Promise.all(
      products.map(async (p) => ({ ...p, image: await resolveImageUrl(ctx, p) })),
    );
    return resolved.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("checkoutProducts").collect();
    const resolved = await Promise.all(
      products.map(async (p) => ({ ...p, image: await resolveImageUrl(ctx, p) })),
    );
    return resolved.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getBumpsForProduct = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("checkoutProducts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!product) return [];

    const bumps = [];
    for (const bumpSlug of product.bumps) {
      const bumpProduct = await ctx.db
        .query("checkoutProducts")
        .withIndex("by_slug", (q) => q.eq("slug", bumpSlug))
        .first();
      if (!bumpProduct) continue;

      const override = product.bumpPriceOverrides?.find(
        (o) => o.bumpSlug === bumpSlug,
      );
      const image = await resolveImageUrl(ctx, bumpProduct);
      bumps.push({
        slug: bumpProduct.slug,
        name: bumpProduct.shortName,
        price: override?.priceCents ?? bumpProduct.priceCents,
        priceInclBtw: bumpProduct.priceInclBtw,
        btwRate: bumpProduct.btwRate,
        description: bumpProduct.description,
        image,
        mockupType: bumpProduct.mockupType,
        requiresShipping: bumpProduct.requiresShipping,
      });
    }
    return bumps;
  },
});

// ── Internal query (for payments/mollie) ──

export const getProductPriceData = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("checkoutProducts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!product) return null;
    return {
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      priceInclBtw: product.priceInclBtw,
      btwRate: product.btwRate,
      productType: product.productType,
      bumpPriceOverrides: product.bumpPriceOverrides ?? [],
      installments: product.installments,
      quantityTiers: product.quantityTiers,
    };
  },
});

export const getAllProductPriceData = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("checkoutProducts").collect();
  },
});

// ── File upload ──

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    productId: v.id("checkoutProducts"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { productId, storageId }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(productId, { imageStorageId: storageId });
  },
});

export const removeImage = mutation({
  args: { productId: v.id("checkoutProducts") },
  handler: async (ctx, { productId }) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(productId);
    if (product?.imageStorageId) {
      await ctx.storage.delete(product.imageStorageId);
    }
    await ctx.db.patch(productId, { imageStorageId: undefined, image: undefined });
  },
});

// ── Admin mutations ──

const productFields = {
  slug: v.string(),
  active: v.boolean(),
  sortOrder: v.number(),
  name: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
  shortName: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
  description: v.object({ nl: v.string(), en: v.string(), de: v.optional(v.string()) }),
  type: v.union(v.literal("training"), v.literal("book")),
  productType: v.union(
    v.literal("training"),
    v.literal("book"),
    v.literal("event"),
  ),
  priceCents: v.number(),
  priceInclBtw: v.boolean(),
  btwRate: v.number(),
  features: v.object({ nl: v.array(v.string()), en: v.array(v.string()), de: v.optional(v.array(v.string())) }),
  image: v.optional(v.string()),
  imageStorageId: v.optional(v.id("_storage")),
  bumps: v.array(v.string()),
  bumpPriceOverrides: v.optional(
    v.array(v.object({ bumpSlug: v.string(), priceCents: v.number() })),
  ),
  installments: v.optional(
    v.object({ count: v.number(), amountPerTermCents: v.number() }),
  ),
  quantityTiers: v.optional(
    v.array(
      v.object({
        quantity: v.number(),
        unitPriceCents: v.number(),
        savingsPercent: v.number(),
      }),
    ),
  ),
  requiresShipping: v.boolean(),
  mockupType: v.optional(
    v.union(v.literal("tablet"), v.literal("phone"), v.literal("audio")),
  ),
};

export const createProduct = mutation({
  args: productFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("checkoutProducts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error(`Product met slug "${args.slug}" bestaat al.`);
    return await ctx.db.insert("checkoutProducts", args);
  },
});

export const updateProduct = mutation({
  args: { id: v.id("checkoutProducts"), ...productFields },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product niet gevonden.");
    if (fields.slug !== product.slug) {
      const conflict = await ctx.db
        .query("checkoutProducts")
        .withIndex("by_slug", (q) => q.eq("slug", fields.slug))
        .first();
      if (conflict) throw new Error(`Slug "${fields.slug}" is al in gebruik.`);
    }
    await ctx.db.replace(id, fields);
  },
});

export const deactivateProduct = mutation({
  args: { id: v.id("checkoutProducts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { active: false });
  },
});

export const duplicateProduct = mutation({
  args: { id: v.id("checkoutProducts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product niet gevonden.");
    const maxOrder = (await ctx.db.query("checkoutProducts").collect())
      .reduce((max, p) => Math.max(max, p.sortOrder), 0);
    const { _id, _creationTime, slug, name, ...rest } = product;
    return await ctx.db.insert("checkoutProducts", {
      ...rest,
      slug: `${slug}-copy`,
      name: { nl: `${name.nl} (kopie)`, en: `${name.en} (copy)` },
      active: false,
      sortOrder: maxOrder + 1,
      imageStorageId: undefined, // Don't copy storage reference
    });
  },
});

export const reorderProducts = mutation({
  args: { orderedIds: v.array(v.id("checkoutProducts")) },
  handler: async (ctx, { orderedIds }) => {
    await requireAdmin(ctx);
    for (let i = 0; i < orderedIds.length; i++) {
      await ctx.db.patch(orderedIds[i], { sortOrder: i });
    }
  },
});
