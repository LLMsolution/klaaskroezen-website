import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { requireAdmin } from "./adminAuth";
import { langValidator } from "./schema";

// ── Queries ──

export const getSession = query({
  args: { sessionId: v.id("emailEditorSessions") },
  handler: async (ctx, { sessionId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(sessionId);
  },
});

export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("emailEditorSessions")
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "completed"),
          q.neq(q.field("status"), "failed"),
        ),
      )
      .first();
  },
});

// ── Mutations ──

export const startSession = mutation({
  args: {
    mode: v.union(v.literal("new"), v.literal("edit")),
    lang: langValidator,
    prompt: v.string(),
    imageUrls: v.array(v.string()),
    existingHtml: v.optional(v.string()),
    templateId: v.optional(v.id("emailTemplates")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("emailEditorSessions", {
      status: "pending",
      mode: args.mode,
      lang: args.lang,
      prompt: args.prompt,
      imageUrls: args.imageUrls,
      existingHtml: args.existingHtml,
      templateId: args.templateId,
      createdAt: Date.now(),
    });
  },
});

export const updateSessionHtml = internalMutation({
  args: {
    sessionId: v.id("emailEditorSessions"),
    status: v.string(),
    generatedHtml: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, status, generatedHtml, errorMessage }) => {
    await ctx.db.patch(sessionId, {
      status: status as "generating" | "completed" | "failed",
      ...(generatedHtml !== undefined && { generatedHtml }),
      ...(errorMessage !== undefined && { errorMessage }),
    });
  },
});

export const applyToTemplate = mutation({
  args: {
    sessionId: v.id("emailEditorSessions"),
    templateId: v.id("emailTemplates"),
  },
  handler: async (ctx, { sessionId, templateId }) => {
    await requireAdmin(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session?.generatedHtml) throw new Error("Geen gegenereerde HTML.");

    const field = session.lang === "nl" ? "htmlNl" : "htmlEn";
    await ctx.db.patch(templateId, { [field]: session.generatedHtml, updatedAt: Date.now() });
    await ctx.db.patch(sessionId, { status: "completed" as const });
  },
});

export const discardSession = mutation({
  args: { sessionId: v.id("emailEditorSessions") },
  handler: async (ctx, { sessionId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(sessionId);
  },
});

// ── Action: trigger GitHub Actions ──

export const triggerGeneration = action({
  args: { sessionId: v.id("emailEditorSessions") },
  handler: async (ctx, { sessionId }) => {
    await ctx.runMutation(api.emailEditor.verifyAdmin);

    const session = await ctx.runQuery(api.emailEditor.getSession, { sessionId });
    if (!session) throw new Error("Sessie niet gevonden.");

    const githubToken = process.env.GITHUB_PAT;
    if (!githubToken) throw new Error("GITHUB_PAT niet geconfigureerd.");
    const callbackSecret = process.env.LAYOUT_CALLBACK_SECRET;
    if (!callbackSecret) throw new Error("LAYOUT_CALLBACK_SECRET niet geconfigureerd.");
    const convexUrl = process.env.CONVEX_SITE_URL;
    if (!convexUrl) throw new Error("CONVEX_SITE_URL niet geconfigureerd.");

    await ctx.runMutation(internal.emailEditor.updateSessionHtml, {
      sessionId,
      status: "generating",
    });

    const response = await fetch(
      "https://api.github.com/repos/timlind/website-klaaskroezen/dispatches",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "email-generate",
          client_payload: {
            sessionId,
            prompt: session.prompt,
            imageUrls: (session.imageUrls ?? []).join("\n"),
            existingHtml: session.existingHtml ?? "",
            mode: session.mode,
            lang: session.lang,
            callbackUrl: `${convexUrl}/email-callback`,
            callbackSecret,
          },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      await ctx.runMutation(internal.emailEditor.updateSessionHtml, {
        sessionId,
        status: "failed",
        errorMessage: `GitHub API error: ${response.status} ${text}`,
      });
      throw new Error(`GitHub dispatch failed: ${response.status}`);
    }
  },
});

export const verifyAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return true;
  },
});
