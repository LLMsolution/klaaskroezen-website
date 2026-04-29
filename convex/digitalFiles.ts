import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { langValidator } from "./schema";

/** Generate a one-time upload URL for the admin file upload flow. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Save (or replace) the digital file for a product + language combination. */
export const saveFile = mutation({
  args: {
    product: v.string(),
    lang: langValidator,
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db
      .query("digitalFiles")
      .withIndex("by_product_lang", (q) =>
        q.eq("product", args.product).eq("lang", args.lang),
      )
      .first();

    if (existing) {
      await ctx.storage.delete(existing.storageId);
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        fileName: args.fileName,
        fileType: args.fileType,
      });
      return existing._id;
    }

    return await ctx.db.insert("digitalFiles", {
      product: args.product,
      lang: args.lang,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
    });
  },
});

/** Delete a digital file (also removes the underlying storage blob). */
export const deleteFile = mutation({
  args: { id: v.id("digitalFiles") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const file = await ctx.db.get(id);
    if (!file) return;
    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(id);
  },
});

/** List all digital files with their download URLs (admin overview). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const files = await ctx.db.query("digitalFiles").collect();
    return await Promise.all(
      files.map(async (f) => ({
        _id: f._id,
        product: f.product,
        lang: f.lang ?? "nl",
        fileName: f.fileName,
        fileType: f.fileType,
        url: await ctx.storage.getUrl(f.storageId),
      })),
    );
  },
});
