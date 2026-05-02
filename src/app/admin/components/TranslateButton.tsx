"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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
 * "Vertaal" button — uses the AI translation engine (OpenRouter + glossary)
 * via Convex action. Source language is assumed to be Dutch.
 */
export function TranslateButton({ sourceText, targets = ["en", "de"], onTranslated, label, html = false }: Props) {
  const translateField = useAction(api.aiTranslate.translateField);
  const [loading, setLoading] = useState(false);

  async function handleTranslate() {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const results: Record<string, string> = {};
      for (const lang of targets) {
        results[lang] = await translateField({
          text: sourceText,
          targetLang: lang,
          sourceLang: "nl",
          html,
        });
      }
      onTranslated(results);
    } catch {
      // silently fail — caller can re-attempt
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
      {label || (loading ? "Vertalen..." : "Vertaal")}
    </button>
  );
}
