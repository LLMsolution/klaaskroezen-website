"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { langValidator } from "./schema";

/** Translate text via DeepL REST API (no npm package needed) */
async function translateText(
  authKey: string,
  text: string,
  targetLang: string,
  options?: { tagHandling?: string },
): Promise<string> {
  const isFree = authKey.endsWith(":fx");
  const baseUrl = isFree
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const params: Record<string, string> = {
    text,
    target_lang: targetLang,
  };
  if (options?.tagHandling) params.tag_handling = options.tagHandling;

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${authKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepL API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.translations[0].text;
}

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

    const deeplLang = targetLang === "en" ? "EN-US" : targetLang === "de" ? "DE" : "NL";

    const [title, excerpt, body] = await Promise.all([
      translateText(authKey, post.title, deeplLang),
      translateText(authKey, post.excerpt, deeplLang),
      translateText(authKey, post.body, deeplLang, { tagHandling: "html" }),
    ]);

    if (existing) {
      await ctx.runMutation(api.blog.updatePost, {
        id: existing._id,
        title,
        excerpt,
        body,
        published: post.published,
      });
    } else {
      await ctx.runMutation(api.blog.createPost, {
        slug: `${post.slug}-${targetLang}`,
        title,
        excerpt,
        body,
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
  handler: async (ctx, { targetLang }): Promise<{ translated: number; total: number }> => {
    const authKey = process.env.DEEPL_AUTH_KEY;
    if (!authKey) throw new Error("DEEPL_AUTH_KEY not configured");

    const allPosts = await ctx.runQuery(api.blog.listAll);
    const originals = (allPosts as Array<{ _id: string; lang: string; sourcePostId?: string }>)
      .filter((p) => p.lang === "nl" && !p.sourcePostId);

    const deeplLang = targetLang === "en" ? "EN-US" : targetLang === "de" ? "DE" : "NL";
    let translated = 0;

    for (const post of originals) {
      const existing = await ctx.runQuery(api.blog.findTranslation, {
        sourcePostId: post._id as any,
        lang: targetLang,
      });
      if (existing) continue;

      const fullPost = await ctx.runQuery(api.blog.getById, { id: post._id as any });
      if (!fullPost) continue;

      const [title, excerpt, body] = await Promise.all([
        translateText(authKey, fullPost.title, deeplLang),
        translateText(authKey, fullPost.excerpt, deeplLang),
        translateText(authKey, fullPost.body, deeplLang, { tagHandling: "html" }),
      ]);

      await ctx.runMutation(api.blog.createPost, {
        slug: `${fullPost.slug}-${targetLang}`,
        title,
        excerpt,
        body,
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
