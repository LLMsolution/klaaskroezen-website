import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { SEED_POSTS } from "./blogSeed";
import { ARCHIVE_POSTS } from "./blogSeedArchive";
import { langValidator } from "./schema";

// ── Public queries ──

export const listPublished = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    lang: v.optional(langValidator),
  },
  handler: async (ctx, { category, limit, lang }) => {
    let posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();

    // Filter by language (default: show all if no lang specified)
    if (lang) {
      posts = posts.filter((p) => p.lang === lang);
    }

    if (category) {
      posts = posts.filter((p) => p.category === category);
    }

    return (limit ? posts.slice(0, limit) : posts).map((p) => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      imageUrl: p.imageUrl,
      videoUrl: p.videoUrl,
      category: p.category,
      publishedAt: p.publishedAt,
      likes: p.likes,
      autoTranslated: p.autoTranslated,
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const findTranslation = query({
  args: {
    sourcePostId: v.id("blogPosts"),
    lang: langValidator,
  },
  handler: async (ctx, { sourcePostId, lang }) => {
    return await ctx.db
      .query("blogPosts")
      .withIndex("by_source_lang", (q) =>
        q.eq("sourcePostId", sourcePostId).eq("lang", lang),
      )
      .first();
  },
});

export const hasLiked = query({
  args: { postId: v.id("blogPosts"), sessionId: v.string() },
  handler: async (ctx, { postId, sessionId }) => {
    const like = await ctx.db
      .query("blogLikes")
      .withIndex("by_session_post", (q) => q.eq("sessionId", sessionId).eq("postId", postId))
      .first();
    return !!like;
  },
});

// ── Public mutations ──

export const likePost = mutation({
  args: { postId: v.id("blogPosts"), sessionId: v.string() },
  handler: async (ctx, { postId, sessionId }) => {
    const existing = await ctx.db
      .query("blogLikes")
      .withIndex("by_session_post", (q) => q.eq("sessionId", sessionId).eq("postId", postId))
      .first();
    if (existing) return;

    await ctx.db.insert("blogLikes", { postId, sessionId, createdAt: Date.now() });
    const post = await ctx.db.get(postId);
    if (post) {
      await ctx.db.patch(postId, { likes: post.likes + 1 });
    }
  },
});

// ── Admin queries/mutations ──

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("blogPosts").order("desc").collect();
  },
});

export const createPost = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    category: v.string(),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    lang: v.optional(langValidator),
    sourcePostId: v.optional(v.id("blogPosts")),
    autoTranslated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("Slug bestaat al.");

    const postId = await ctx.db.insert("blogPosts", {
      ...args,
      publishedAt: args.publishedAt ?? Date.now(),
      lang: args.lang ?? "nl",
      likes: 0,
    });

    // Auto-translation is triggered manually from admin via blogTranslate.translatePost
    return postId;
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("blogPosts"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    body: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }

    // Auto-translation is triggered manually from admin via blogTranslate.translatePost
  },
});

/** Notify mailing list subscribers about a new blog post */
export const notifySubscribers = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Artikel niet gevonden.");

    // Create a broadcast with the blog post content
    const subject = `Nieuw artikel: ${post.title}`;
    const siteUrl = process.env.SITE_URL || "https://www.klaaskroezen.com";
    const postUrl = `${siteUrl}/nieuws/${post.slug}`;

    const htmlBody = `
      <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:32px;">
        <h1 style="font-size:22px;font-weight:700;color:#0E0C0A;margin:0 0 12px;">${post.title}</h1>
        <p style="font-size:15px;color:rgba(14,12,10,0.6);line-height:1.7;margin:0 0 20px;">${post.excerpt}</p>
        ${post.imageUrl ? `<img src="${siteUrl}${post.imageUrl}" alt="" style="width:100%;border-radius:2px;margin-bottom:20px;" />` : ""}
        <a href="${postUrl}" style="display:inline-block;background:#B5622A;color:#F7F4EF;padding:14px 28px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase;border-radius:2px;">Lees het artikel</a>
      </div>
    `;

    // Use existing broadcast system
    const broadcastId = await ctx.db.insert("broadcasts", {
      subject,
      htmlBody,
      segment: "all",
      status: "sending",
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
      createdAt: Date.now(),
    });

    // Schedule sending via existing broadcast system
    await ctx.scheduler.runAfter(0, internal.emails.sendBroadcast, { broadcastId });

    return broadcastId;
  },
});

export const deletePost = mutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(id);
    if (post?.imageStorageId) await ctx.storage.delete(post.imageStorageId);
    await ctx.db.delete(id);
  },
});

export const saveImage = mutation({
  args: { postId: v.id("blogPosts"), storageId: v.id("_storage") },
  handler: async (ctx, { postId, storageId }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (post?.imageStorageId) await ctx.storage.delete(post.imageStorageId);
    await ctx.db.patch(postId, { imageStorageId: storageId, imageUrl: undefined });
  },
});

export const removeImage = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, { postId }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (post?.imageStorageId) await ctx.storage.delete(post.imageStorageId);
    await ctx.db.patch(postId, { imageStorageId: undefined, imageUrl: undefined });
  },
});

// ── Seed existing articles ──

export const seedPosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing posts and re-seed with latest content
    const existing = await ctx.db.query("blogPosts").collect();
    for (const post of existing) {
      await ctx.db.delete(post._id);
    }

    const allPosts = [...SEED_POSTS, ...ARCHIVE_POSTS];
    for (const post of allPosts) {
      await ctx.db.insert("blogPosts", {
        ...post,
        published: true,
        likes: 0,
        lang: "nl" as const,
      });
    }
  },
});
