"use node";

import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { langValidator } from "./schema";

// DeepL free API: https://api-free.deepl.com/v2/translate
// DeepL pro API: https://api.deepl.com/v2/translate

export const translatePost = action({
  args: {
    postId: v.id("blogPosts"),
    targetLang: langValidator,
  },
  handler: async (ctx, { postId, targetLang }) => {
    const authKey = process.env.DEEPL_AUTH_KEY;
    if (!authKey) throw new Error("DEEPL_AUTH_KEY not configured");

    // 1. Get original post
    const post = await ctx.runQuery(api.blog.getById, { id: postId });
    if (!post) throw new Error("Post not found");
    if (post.lang === targetLang)
      throw new Error("Post is already in target language");

    // 2. Check if translation already exists
    const existing = await ctx.runQuery(api.blog.findTranslation, {
      sourcePostId: postId,
      lang: targetLang,
    });

    // 3. Translate title, excerpt, body via DeepL
    const deepl = await import("deepl-node");
    const translator = new deepl.Translator(authKey);

    const deeplLang =
      targetLang === "en" ? "en-US" : targetLang === "de" ? "de" : "nl";

    const [titleResult, excerptResult, bodyResult] = await Promise.all([
      translator.translateText(post.title, null, deeplLang as "en-US" | "de" | "nl"),
      translator.translateText(post.excerpt, null, deeplLang as "en-US" | "de" | "nl"),
      translator.translateText(post.body, null, deeplLang as "en-US" | "de" | "nl", {
        tagHandling: "html",
      }),
    ]);

    const translatedData = {
      slug: `${post.slug}-${targetLang}`,
      title: titleResult.text,
      excerpt: excerptResult.text,
      body: bodyResult.text,
      imageUrl: post.imageUrl,
      imageStorageId: post.imageStorageId,
      videoUrl: post.videoUrl,
      ctaText: post.ctaText,
      ctaUrl: post.ctaUrl,
      category: post.category,
      published: post.published,
      publishedAt: post.publishedAt,
      likes: 0,
      lang: targetLang as "nl" | "en" | "de",
      sourcePostId: postId,
      autoTranslated: true as const,
    };

    // 4. Create or update translation
    if (existing) {
      await ctx.runMutation(api.blog.updatePost, {
        id: existing._id,
        title: translatedData.title,
        excerpt: translatedData.excerpt,
        body: translatedData.body,
        published: translatedData.published,
      });
    } else {
      await ctx.runMutation(internal.blogTranslate.createTranslatedPost, translatedData);
    }
  },
});

// Bulk translate all untranslated posts
export const translateAllPosts = action({
  args: { targetLang: langValidator },
  handler: async (ctx, { targetLang }) => {
    const authKey = process.env.DEEPL_AUTH_KEY;
    if (!authKey) throw new Error("DEEPL_AUTH_KEY not configured");

    // Get all NL source posts (originals)
    const allPosts = await ctx.runQuery(api.blog.listAll);
    const originals = allPosts.filter(
      (p: { lang: string; sourcePostId?: string }) =>
        p.lang === "nl" && !p.sourcePostId,
    );

    let translated = 0;
    for (const post of originals) {
      // Check if translation exists
      const existing = await ctx.runQuery(api.blog.findTranslation, {
        sourcePostId: post._id,
        lang: targetLang,
      });
      if (existing) continue;

      // Translate
      await ctx.runAction(api.blogTranslate.translatePost, {
        postId: post._id,
        targetLang,
      });
      translated++;
    }

    return { translated, total: originals.length };
  },
});

// Internal mutation to create translated post (bypasses admin auth)
export const createTranslatedPost = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    category: v.string(),
    published: v.boolean(),
    publishedAt: v.number(),
    likes: v.number(),
    lang: langValidator,
    sourcePostId: v.optional(v.id("blogPosts")),
    autoTranslated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("blogPosts", args);
  },
});
