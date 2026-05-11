import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
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
  purchaseTag: v.optional(v.string()),
  accessDurationDays: v.optional(v.number()),
  mockupType: v.optional(
    v.union(v.literal("tablet"), v.literal("phone"), v.literal("audio")),
  ),
  availableBookLanguages: v.optional(
    v.array(v.union(v.literal("nl"), v.literal("en"), v.literal("de"))),
  ),
  productVariant: v.optional(
    v.union(
      v.literal("ebook"),
      v.literal("audiobook"),
      v.literal("hardcopy"),
      v.literal("online-course"),
      v.literal("coaching"),
      v.literal("event"),
    ),
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
    const oldSlug = product.slug;
    const newSlug = fields.slug;
    if (newSlug !== oldSlug) {
      const conflict = await ctx.db
        .query("checkoutProducts")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();
      if (conflict) throw new Error(`Slug "${newSlug}" is al in gebruik.`);
    }
    await ctx.db.replace(id, fields);

    // Cascade slug change to references in other tables
    if (newSlug !== oldSlug) {
      // 1. trainings.linkedProducts
      const trainings = await ctx.db.query("trainings").collect();
      for (const t of trainings) {
        if (t.linkedProducts?.includes(oldSlug)) {
          await ctx.db.patch(t._id, {
            linkedProducts: t.linkedProducts.map((s) => (s === oldSlug ? newSlug : s)),
          });
        }
      }
      // 2. other checkoutProducts bumps
      const allProducts = await ctx.db.query("checkoutProducts").collect();
      for (const p of allProducts) {
        if (p._id === id) continue;
        if (p.bumps?.includes(oldSlug)) {
          await ctx.db.patch(p._id, {
            bumps: p.bumps.map((s) => (s === oldSlug ? newSlug : s)),
          });
        }
      }
    }
  },
});

export const deactivateProduct = mutation({
  args: { id: v.id("checkoutProducts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { active: false });
  },
});

export const activateProduct = mutation({
  args: { id: v.id("checkoutProducts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { active: true });
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("checkoutProducts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product niet gevonden.");
    if (product.active) throw new Error("Deactiveer het product eerst voordat je het verwijdert.");
    // Check if any orders reference this product
    const order = await ctx.db
      .query("pendingOrders")
      .filter((q) => q.eq(q.field("product"), product.slug))
      .first();
    if (order?.convertedAt) throw new Error("Dit product heeft bestaande bestellingen en kan niet verwijderd worden.");
    await ctx.db.delete(id);
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

// ── One-shot backfill ──
// Maps the existing slugs to the new productVariant enum.
// Run once after deploy via: npx convex run checkoutProducts:backfillProductVariants
const SLUG_VARIANT_MAP: Record<string, "ebook" | "audiobook" | "hardcopy" | "online-course" | "coaching" | "event"> = {
  "boek-ebook": "ebook",
  "boek-luisterboek": "audiobook",
  "boek-hardcopy": "hardcopy",
  "set-online": "online-course",
  "set-coaching": "coaching",
  "cst-online": "online-course",
  "cst-coaching": "coaching",
};

export const backfillProductVariants = internalMutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("checkoutProducts").collect();
    const updated: string[] = [];
    const skipped: string[] = [];
    for (const p of products) {
      if (p.productVariant) {
        skipped.push(`${p.slug} (already ${p.productVariant})`);
        continue;
      }
      const variant = SLUG_VARIANT_MAP[p.slug];
      if (!variant) {
        skipped.push(`${p.slug} (no mapping)`);
        continue;
      }
      await ctx.db.patch(p._id, { productVariant: variant });
      updated.push(`${p.slug} → ${variant}`);
    }
    return { updated, skipped, totalProducts: products.length };
  },
});
