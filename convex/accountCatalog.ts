import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin, isAdminEmail } from "./adminAuth";
import { auth } from "./auth";

const langValidator = v.union(v.literal("nl"), v.literal("en"), v.literal("de"));

type DashboardAction = "training" | "download" | "audiobook" | "physical";

/** Infer dashboardAction from category + product slug when not explicitly set. */
function inferAction(
  category: string,
  slug: string,
  explicit?: DashboardAction,
): DashboardAction {
  if (explicit) return explicit;
  if (category === "training") return "training";
  if (slug.includes("luisterboek")) return "audiobook";
  if (slug.includes("hardcopy") || slug.includes("cadeau")) return "physical";
  return "download";
}

/** Find the training slug that matches a checkout product slug. */
function findTrainingSlug(
  productSlug: string,
  trainings: Array<{ slug: string; linkedProducts?: string[] }>,
): string | undefined {
  const match = trainings.find(
    (t) =>
      t.slug === productSlug ||
      `${t.slug}-online` === productSlug ||
      `${t.slug}-coaching` === productSlug ||
      (t.linkedProducts ?? []).includes(productSlug),
  );
  return match?.slug;
}

// ── Public queries ──

/** Fetch the catalog for a language, resolved with product details. */
export const getForLang = query({
  args: { lang: langValidator },
  handler: async (ctx, { lang }) => {
    const row = await ctx.db
      .query("accountCatalog")
      .withIndex("by_lang", (q) => q.eq("lang", lang))
      .first();
    if (!row || row.items.length === 0) return [];

    const allTrainings = await ctx.db
      .query("trainings")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const resolved = [];
    for (const item of [...row.items].sort((a, b) => a.sortOrder - b.sortOrder)) {
      const product = await ctx.db.get(item.checkoutProductId);
      if (!product || !product.active) continue;

      let imageUrl: string | undefined;
      if (product.imageStorageId) {
        imageUrl = (await ctx.storage.getUrl(product.imageStorageId)) ?? undefined;
      }

      const action = inferAction(item.category, product.slug, item.dashboardAction ?? undefined);
      const trainingSlug =
        item.linkedTrainingSlug ??
        ((action === "training" || action === "audiobook")
          ? findTrainingSlug(product.slug, allTrainings)
          : undefined);

      resolved.push({
        checkoutProductId: item.checkoutProductId,
        slug: product.slug,
        name: product.name,
        shortName: product.shortName,
        category: item.category,
        dashboardAction: action,
        linkedTrainingSlug: trainingSlug,
        sortOrder: item.sortOrder,
        image: imageUrl || product.image,
        priceCents: product.priceCents,
      });
    }
    return resolved;
  },
});

/** Same as getForLang but adds `owned` boolean per item based on user's access rights. */
export const getForLangWithAccess = query({
  args: { lang: langValidator },
  handler: async (ctx, { lang }) => {
    const row = await ctx.db
      .query("accountCatalog")
      .withIndex("by_lang", (q) => q.eq("lang", lang))
      .first();
    if (!row || row.items.length === 0) return [];

    const userId = await auth.getUserId(ctx);
    const now = Date.now();

    // Admins see everything as owned
    let isAdmin = false;
    if (userId) {
      const user = await ctx.db.get(userId);
      if (user) {
        const accounts = await ctx.db
          .query("authAccounts")
          .filter((q: any) => q.eq(q.field("userId"), userId))
          .collect();
        const emailAccount = accounts.find((a: any) => a.providerAccountId?.includes("@"));
        const email = emailAccount?.providerAccountId ?? (user as any).email ?? "";
        isAdmin = await isAdminEmail(ctx, email);
      }
    }

    // Fetch user's active access rights
    const ownedSlugs = new Set<string>();
    if (userId && !isAdmin) {
      const rights = await ctx.db
        .query("accessRights")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("revokedAt"), undefined))
        .collect();
      for (const r of rights) {
        if (!r.expiresAt || r.expiresAt > now) {
          ownedSlugs.add(r.resource);
        }
      }
    }

    // Pre-load trainings for slug resolution
    const allTrainings = await ctx.db
      .query("trainings")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const resolved = [];
    for (const item of [...row.items].sort((a, b) => a.sortOrder - b.sortOrder)) {
      const product = await ctx.db.get(item.checkoutProductId);
      if (!product || !product.active) continue;

      let imageUrl: string | undefined;
      if (product.imageStorageId) {
        imageUrl = (await ctx.storage.getUrl(product.imageStorageId)) ?? undefined;
      }

      const owned = isAdmin || ownedSlugs.has(product.slug);
      const action = inferAction(item.category, product.slug, item.dashboardAction ?? undefined);
      const trainingSlug =
        item.linkedTrainingSlug ??
        ((action === "training" || action === "audiobook")
          ? findTrainingSlug(product.slug, allTrainings)
          : undefined);

      resolved.push({
        checkoutProductId: item.checkoutProductId,
        slug: product.slug,
        name: product.name,
        shortName: product.shortName,
        category: item.category,
        dashboardAction: action,
        linkedTrainingSlug: trainingSlug,
        sortOrder: item.sortOrder,
        image: imageUrl || product.image,
        priceCents: product.priceCents,
        owned,
      });
    }
    return resolved;
  },
});

// ── Admin queries/mutations ──

/** Get the raw catalog for a language (admin editing). */
export const adminGet = query({
  args: { lang: langValidator },
  handler: async (ctx, { lang }) => {
    await requireAdmin(ctx);
    const row = await ctx.db
      .query("accountCatalog")
      .withIndex("by_lang", (q) => q.eq("lang", lang))
      .first();
    return row?.items ?? [];
  },
});

/** Upsert the catalog for a language. */
export const adminSave = mutation({
  args: {
    lang: langValidator,
    items: v.array(
      v.object({
        checkoutProductId: v.id("checkoutProducts"),
        category: v.union(v.literal("training"), v.literal("book")),
        dashboardAction: v.optional(v.union(
          v.literal("training"),
          v.literal("download"),
          v.literal("audiobook"),
          v.literal("physical"),
        )),
        linkedTrainingSlug: v.optional(v.string()),
        sortOrder: v.number(),
      }),
    ),
  },
  handler: async (ctx, { lang, items }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("accountCatalog")
      .withIndex("by_lang", (q) => q.eq("lang", lang))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { items, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("accountCatalog", {
        lang,
        items,
        updatedAt: Date.now(),
      });
    }
  },
});
