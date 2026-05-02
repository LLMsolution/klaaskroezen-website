import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { langValidator } from "./schema";

async function aiTranslate(
  ctx: ActionCtx,
  text: string,
  targetLang: string,
  html?: boolean,
): Promise<string> {
  if (!text || !text.trim()) return text;
  const result = await ctx.runAction(internal.aiTranslate.translate, {
    text,
    targetLang,
    html,
    sourceLang: "nl",
  });
  if (!result.ok) throw new Error(result.error);
  return result.text;
}

/**
 * Translate a single blog post into another language. Creates the target-lang
 * record (or updates the existing translation) using AI translation.
 */
export const translatePost = action({
  args: {
    postId: v.id("blogPosts"),
    targetLang: langValidator,
  },
  handler: async (ctx, { postId, targetLang }) => {
    const post = await ctx.runQuery(api.blog.getById, { id: postId });
    if (!post) throw new Error("Post not found");
    if (post.lang === targetLang) throw new Error("Post is already in target language");

    const existing = await ctx.runQuery(api.blog.findTranslation, {
      sourcePostId: postId,
      lang: targetLang,
    });

    const [title, excerpt, body] = await Promise.all([
      aiTranslate(ctx, post.title, targetLang),
      aiTranslate(ctx, post.excerpt, targetLang),
      aiTranslate(ctx, post.body, targetLang, true),
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
        lang: targetLang,
        sourcePostId: postId,
        autoTranslated: true,
      });
    }
  },
});

/**
 * Translate all NL blog posts that don't yet have a translation in the
 * target language. Returns counts.
 */
export const translateAllPosts = action({
  args: { targetLang: langValidator },
  handler: async (ctx, { targetLang }): Promise<{ translated: number; total: number }> => {
    const allPosts = await ctx.runQuery(api.blog.listAll);
    const originals = (allPosts as Array<{ _id: string; lang: string; sourcePostId?: string }>)
      .filter((p) => p.lang === "nl" && !p.sourcePostId);

    let translated = 0;
    for (const post of originals) {
      const existing = await ctx.runQuery(api.blog.findTranslation, {
        sourcePostId: post._id as never,
        lang: targetLang,
      });
      if (existing) continue;

      const fullPost = await ctx.runQuery(api.blog.getById, { id: post._id as never });
      if (!fullPost) continue;

      const [title, excerpt, body] = await Promise.all([
        aiTranslate(ctx, fullPost.title, targetLang),
        aiTranslate(ctx, fullPost.excerpt, targetLang),
        aiTranslate(ctx, fullPost.body, targetLang, true),
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
        lang: targetLang,
        sourcePostId: post._id as never,
        autoTranslated: true,
      });
      translated++;
    }

    return { translated, total: originals.length };
  },
});
