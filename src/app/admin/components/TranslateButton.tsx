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
  const [error, setError] = useState("");

  async function handleTranslate() {
    if (!sourceText.trim()) return;
    setLoading(true);
    setError("");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vertaling mislukt.");
      setTimeout(() => setError(""), 6000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={handleTranslate}
        disabled={loading || !sourceText.trim()}
        className={`inline-flex items-center gap-1.5 text-[11px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${error ? "text-red-500 hover:text-red-600" : "text-copper hover:text-copper-light"}`}
      >
        {loading ? (
          <div className="w-3 h-3 border border-copper/30 border-t-copper rounded-full animate-spin" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
            <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
          </svg>
        )}
        {label || (loading ? "Vertalen..." : error ? "Fout — opnieuw?" : "Vertaal")}
      </button>
      {error && <p className="text-[10px] text-red-500 max-w-[240px]">{error}</p>}
    </div>
  );
}
