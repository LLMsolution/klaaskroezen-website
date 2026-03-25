"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const DEEPL_LANGS: Record<string, string> = {
  en: "EN-US",
  de: "DE",
};

interface Props {
  /** The source text (always NL) */
  sourceText: string;
  /** Target languages to translate to */
  targets?: ("en" | "de")[];
  /** Called with translations: { en: "...", de: "..." } */
  onTranslated: (translations: Record<string, string>) => void;
  /** Label override */
  label?: string;
  /** Is HTML content? */
  html?: boolean;
}

/**
 * "Vertaal met DeepL" button.
 * Calls Convex action that uses DeepL REST API — key stays in Convex env only.
 */
export function DeepLButton({ sourceText, targets = ["en", "de"], onTranslated, label, html = false }: Props) {
  const translateField = useAction(api.blogTranslate.translateField);
  const [loading, setLoading] = useState(false);

  async function handleTranslate() {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const results: Record<string, string> = {};
      for (const lang of targets) {
        const translated = await translateField({
          text: sourceText,
          targetLang: DEEPL_LANGS[lang],
          html,
        });
        results[lang] = translated;
      }
      onTranslated(results);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={loading || !sourceText.trim()}
      className="inline-flex items-center gap-1.5 text-[11px] text-copper hover:text-copper-light cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-3 h-3 border border-copper/30 border-t-copper rounded-full animate-spin" />
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
          <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
        </svg>
      )}
      {label || (loading ? "Vertalen..." : "Vertaal met DeepL")}
    </button>
  );
}
