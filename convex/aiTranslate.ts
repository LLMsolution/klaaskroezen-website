"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

type Lang = "nl" | "en" | "de";

const MODEL = "anthropic/claude-haiku-4.5";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const LANG_NAMES: Record<Lang, string> = {
  nl: "Dutch (Nederlands)",
  en: "English",
  de: "German (Deutsch)",
};

type GlossaryEntry = {
  termNl: string;
  mode: "preserve" | "translate";
  en?: string;
  de?: string;
  caseSensitive: boolean;
  notes?: string;
};

/** Normalise inbound language codes (DeepL "EN-US"/"DE" or short codes). */
function normaliseLang(input: string): Lang {
  const v = input.trim().toLowerCase();
  if (v.startsWith("en")) return "en";
  if (v.startsWith("de")) return "de";
  return "nl";
}

function buildSystemPrompt(
  source: Lang,
  target: Lang,
  glossary: GlossaryEntry[],
  isHtml: boolean,
): string {
  const preserveTerms = glossary.filter((g) => g.mode === "preserve");
  const translateTerms = glossary.filter(
    (g) => g.mode === "translate" && (g.en || g.de),
  );

  const lines: string[] = [
    `You are a professional translator from ${LANG_NAMES[source]} to ${LANG_NAMES[target]}.`,
    "Translate the user message and respond with the translation only — no preamble, no quotes, no explanations.",
    "Preserve the original tone, register and paragraph structure. Keep line breaks where the source has them.",
  ];

  if (isHtml) {
    lines.push(
      "The input is HTML. Preserve every tag, attribute, entity and self-closing element exactly. Translate only the visible text content.",
    );
  }

  if (preserveTerms.length > 0) {
    lines.push("");
    lines.push("Always keep the following terms unchanged in the source language:");
    for (const t of preserveTerms) {
      const cs = t.caseSensitive ? " (case-sensitive)" : "";
      const note = t.notes ? ` — ${t.notes}` : "";
      lines.push(`- "${t.termNl}"${cs}${note}`);
    }
  }

  if (translateTerms.length > 0) {
    lines.push("");
    lines.push(`Use these fixed translations for ${LANG_NAMES[target]}:`);
    for (const t of translateTerms) {
      const targetValue = target === "en" ? t.en : t.de;
      if (!targetValue) continue;
      const cs = t.caseSensitive ? " (case-sensitive)" : "";
      const note = t.notes ? ` — ${t.notes}` : "";
      lines.push(`- "${t.termNl}" → "${targetValue}"${cs}${note}`);
    }
  }

  return lines.join("\n");
}

async function callOpenRouter(
  apiKey: string,
  systemPrompt: string,
  text: string,
): Promise<string> {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  };

  const doFetch = () =>
    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://klaaskroezen.nl",
        "X-Title": "Klaas Kroezen — Admin Translate",
      },
      body: JSON.stringify(body),
    });

  let res = await doFetch();
  if (res.status >= 500) {
    res = await doFetch();
  }

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errBody.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter gaf een lege response terug.");
  return content.trim();
}

/**
 * Internal translate — graceful return shape, no auth, no rate limit.
 * Used by other Convex actions (blogTranslate, trainingTranslate) and by
 * the public wrappers below.
 */
export const translate = internalAction({
  args: {
    text: v.string(),
    sourceLang: v.optional(v.string()),
    targetLang: v.string(),
    html: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { text, sourceLang, targetLang, html },
  ): Promise<{ ok: true; text: string } | { ok: false; error: string }> => {
    if (!text.trim()) return { ok: true, text };

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return { ok: false, error: "OPENROUTER_API_KEY niet geconfigureerd." };

    const source = normaliseLang(sourceLang ?? "nl");
    const target = normaliseLang(targetLang);
    if (source === target) return { ok: true, text };

    try {
      const glossary = await ctx.runQuery(
        internal.translationGlossary.listAllInternal,
      );
      const systemPrompt = buildSystemPrompt(
        source,
        target,
        glossary as GlossaryEntry[],
        Boolean(html),
      );
      const translated = await callOpenRouter(apiKey, systemPrompt, text);
      return { ok: true, text: translated };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, error: msg };
    }
  },
});

/**
 * Public translate — admin-only, throws on error so existing button callers
 * (Translate button, blog/training editors) keep their try/catch behaviour.
 */
export const translateField = action({
  args: {
    text: v.string(),
    targetLang: v.string(),
    sourceLang: v.optional(v.string()),
    html: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<string> => {
    await ctx.runMutation(api.aiTranslateAuth.verifyAndConsumeLimit);

    const result: { ok: true; text: string } | { ok: false; error: string } =
      await ctx.runAction(internal.aiTranslate.translate, args);
    if (!result.ok) throw new Error(result.error);
    return result.text;
  },
});

/**
 * Live tester used by the admin glossary tab — same auth as translateField
 * but returns a structured payload so the UI can show errors inline.
 */
export const tryTranslate = action({
  args: {
    text: v.string(),
    targetLang: v.string(),
    sourceLang: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ ok: true; text: string } | { ok: false; error: string }> => {
    await ctx.runMutation(api.aiTranslateAuth.verifyAndConsumeLimit);
    return await ctx.runAction(internal.aiTranslate.translate, args);
  },
});
