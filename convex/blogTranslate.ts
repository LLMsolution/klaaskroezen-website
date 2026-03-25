"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { langValidator } from "./schema";

export const translatePost = action({
  args: {
    postId: v.id("blogPosts"),
    targetLang: langValidator,
  },
  handler: async (ctx, { postId, targetLang }) => {
    const authKey = process.env.DEEPL_AUTH_KEY;
    if (!authKey) throw new Error("DEEPL_AUTH_KEY not configured");

    const post = await ctx.runQuery(api.blog.getById, { id: postId });
    if (!post) throw new Error("Post not found");
    if (post.lang === targetLang) throw new Error("Post is already in target language");

    const existing = await ctx.runQuery(api.blog.findTranslation, {
      sourcePostId: postId,
      lang: targetLang,
    });

    const deepl = await import("deepl-node");
    const translator = new deepl.Translator(authKey);
    const deeplLang = targetLang === "en" ? "en-US" : targetLang === "de" ? "de" : "nl";

    const [titleResult, excerptResult, bodyResult] = await Promise.all([
      translator.translateText(post.title, null, deeplLang as "en-US" | "de" | "nl"),
      translator.translateText(post.excerpt, null, deeplLang as "en-US" | "de" | "nl"),
      translator.translateText(post.body, null, deeplLang as "en-US" | "de" | "nl", { tagHandling: "html" }),
    ]);

    if (existing) {
      await ctx.runMutation(api.blog.updatePost, {
        id: existing._id,
        title: titleResult.text,
        excerpt: excerptResult.text,
        body: bodyResult.text,
        published: post.published,
      });
    } else {
      // Create new translated post via the public createPost mutation
      await ctx.runMutation(api.blog.createPost, {
        slug: `${post.slug}-${targetLang}`,
        title: titleResult.text,
        excerpt: excerptResult.text,
        body: bodyResult.text,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        ctaText: post.ctaText,
        ctaUrl: post.ctaUrl,
        category: post.category,
        published: post.published,
        lang: targetLang as "nl" | "en" | "de",
        sourcePostId: postId,
        autoTranslated: true,
      });
    }
  },
});

export const translateAllPosts = action({
  args: { targetLang: langValidator },
  handler: async (ctx, { targetLang }) => {
    const authKey = process.env.DEEPL_AUTH_KEY;
    if (!authKey) throw new Error("DEEPL_AUTH_KEY not configured");

    const allPosts = await ctx.runQuery(api.blog.listAll);
    const originals = (allPosts as Array<{ _id: string; lang: string; sourcePostId?: string }>)
      .filter((p) => p.lang === "nl" && !p.sourcePostId);

    const deepl = await import("deepl-node");
    const translator = new deepl.Translator(authKey);
    const deeplLang = targetLang === "en" ? "en-US" : targetLang === "de" ? "de" : "nl";

    let translated = 0;
    for (const post of originals) {
      const existing = await ctx.runQuery(api.blog.findTranslation, {
        sourcePostId: post._id as any,
        lang: targetLang,
      });
      if (existing) continue;

      const fullPost = await ctx.runQuery(api.blog.getById, { id: post._id as any });
      if (!fullPost) continue;

      const [titleResult, excerptResult, bodyResult] = await Promise.all([
        translator.translateText(fullPost.title, null, deeplLang as "en-US" | "de" | "nl"),
        translator.translateText(fullPost.excerpt, null, deeplLang as "en-US" | "de" | "nl"),
        translator.translateText(fullPost.body, null, deeplLang as "en-US" | "de" | "nl", { tagHandling: "html" }),
      ]);

      await ctx.runMutation(api.blog.createPost, {
        slug: `${fullPost.slug}-${targetLang}`,
        title: titleResult.text,
        excerpt: excerptResult.text,
        body: bodyResult.text,
        imageUrl: fullPost.imageUrl,
        videoUrl: fullPost.videoUrl,
        ctaText: fullPost.ctaText,
        ctaUrl: fullPost.ctaUrl,
        category: fullPost.category,
        published: fullPost.published,
        lang: targetLang as "nl" | "en" | "de",
        sourcePostId: post._id as any,
        autoTranslated: true,
      });
      translated++;
    }

    return { translated, total: originals.length };
  },
});
