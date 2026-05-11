"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

const LANG_LABEL: Record<Lang, string> = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
};

interface Props {
  /** The language being edited — translations are written into this language. */
  targetLang: Lang;
  /** All available source texts (NL/EN/DE). Empty values are filtered out. */
  sourcesAvailable: { nl?: string; en?: string; de?: string };
  /** Called with the translated text — caller writes it into the target field. */
  onTranslated: (text: string) => void;
  /** Pass true for HTML/richtext fields so tags are preserved. */
  html?: boolean;
  /** Optional label override (default: "Vertaal vanuit ▾"). */
  label?: string;
  /** Compact size — for inline placement next to small fields. */
  compact?: boolean;
}

/**
 * Per-field translation button. User picks the SOURCE language explicitly;
 * the TARGET is always the language currently being edited (passed in via
 * `targetLang`). Only the target field is written — other languages are
 * never touched.
 */
export function TranslateFromButton({
  targetLang,
  sourcesAvailable,
  onTranslated,
  html = false,
  label,
  compact = false,
}: Props) {
  const translateField = useAction(api.aiTranslate.translateField);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click.
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const candidates: Lang[] = (["nl", "en", "de"] as Lang[]).filter(
    (l) => l !== targetLang && (sourcesAvailable[l] ?? "").trim().length > 0,
  );

  const disabled = loading || candidates.length === 0;

  async function handlePickSource(source: Lang) {
    const text = sourcesAvailable[source];
    if (!text || !text.trim()) return;
    setOpen(false);
    setLoading(true);
    setError("");
    try {
      const translated = await translateField({
        text,
        sourceLang: source,
        targetLang,
        html,
      });
      onTranslated(translated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Vertaling mislukt.";
      setError(msg);
      setTimeout(() => setError(""), 6000);
    } finally {
      setLoading(false);
    }
  }

  const sizeClass = compact
    ? "text-[11px] px-2 py-1"
    : "text-[11px] px-3 py-1.5";

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title={
          candidates.length === 0
            ? "Geen broncontent beschikbaar in andere talen"
            : `Vertaal naar ${LANG_LABEL[targetLang]}`
        }
        className={`inline-flex items-center gap-1.5 ${sizeClass} font-medium rounded-[2px] cursor-pointer transition-colors ${error ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-copper/10 text-copper hover:bg-copper/20"} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="inline-block w-3 h-3 border border-copper/30 border-t-copper rounded-full animate-spin" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
            <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
          </svg>
        )}
        {label ?? (loading ? "Vertalen..." : error ? "Fout — opnieuw?" : "Vertaal vanuit")}
        {!loading && (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
            <path d="M3 4.5L6 7.5L9 4.5" />
          </svg>
        )}
      </button>

      {error && (
        <div className="absolute z-40 mt-1 right-0 w-[280px] bg-red-50 border border-red-200 rounded-[2px] px-3 py-2 text-[11px] text-red-600 shadow-md">
          {error}
        </div>
      )}

      {open && !error && (
        <div className="absolute z-30 mt-1 right-0 min-w-[160px] bg-paper border border-rule rounded-[2px] shadow-md py-1">
          {candidates.map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => handlePickSource(source)}
              className="w-full text-left px-3 py-1.5 text-[12px] text-ink hover:bg-warm/50 cursor-pointer"
            >
              {LANG_LABEL[source]}{" "}
              <span className="text-ink/30 text-[11px]">→ {LANG_LABEL[targetLang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
