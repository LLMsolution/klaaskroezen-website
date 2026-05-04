"use client";

import { useState, useEffect } from "react";
import { TranslateFromButton } from "./TranslateFromButton";

export type Lang = "nl" | "en" | "de";
export const LANGS: Lang[] = ["nl", "en", "de"];

/** Language tab bar — selected tab in copper, others outlined. */
export function LangTabs({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${
            value === lang ? "bg-copper text-paper" : "border border-rule text-ink/50 hover:text-ink"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * Single-language editable field bound to one entry of a multilang object.
 *
 * The "Vertaal vanuit ▾" button lets the admin pick any other language as
 * source and translates it into the active lang only. Other languages are
 * never touched.
 */
export function LangField({
  label,
  value,
  allValues,
  lang,
  onSave,
  multiline,
  placeholder,
  html,
}: {
  label: string;
  value: string;
  allValues: { nl?: string; en?: string; de?: string };
  lang: Lang;
  onSave: (v: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  html?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);
  const cls = "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  async function handleTranslated(translated: string) {
    setVal(translated);
    await onSave(translated);
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] text-ink/50">
            {label} <span className="text-ink/30">({lang.toUpperCase()})</span>
          </p>
          <div className="flex items-center gap-3">
            <TranslateFromButton
              targetLang={lang}
              sourcesAvailable={allValues}
              onTranslated={handleTranslated}
              html={html}
              compact
            />
            <button
              onClick={() => { setVal(value); setEditing(true); }}
              className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
            >
              Wijzig
            </button>
          </div>
        </div>
        <p className={`text-[13px] ${value ? "text-ink" : "text-ink/25"}`}>
          {value || (placeholder ?? "Niet ingesteld")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] text-ink/50">
          {label} <span className="text-ink/30">({lang.toUpperCase()})</span>
        </p>
        <TranslateFromButton
          targetLang={lang}
          sourcesAvailable={allValues}
          onTranslated={handleTranslated}
          html={html}
          compact
        />
      </div>
      {multiline ? (
        <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} className={cls} />
      ) : (
        <input value={val} onChange={(e) => setVal(e.target.value)} className={cls} />
      )}
      <div className="flex gap-2 mt-1">
        <button
          onClick={async () => { await onSave(val); setEditing(false); }}
          className="text-[11px] text-copper cursor-pointer"
        >
          Opslaan
        </button>
        <button onClick={() => setEditing(false)} className="text-[11px] text-ink/40 cursor-pointer">
          Annuleer
        </button>
      </div>
    </div>
  );
}

/** Merge a new value for one language into an existing multilang object. */
export function mergeLang<T extends { nl?: string; en?: string; de?: string }>(
  current: T,
  lang: Lang,
  value: string,
): { nl: string; en: string; de?: string } {
  return {
    nl: lang === "nl" ? value : (current.nl ?? ""),
    en: lang === "en" ? value : (current.en ?? ""),
    de: lang === "de" ? value : (current.de ?? ""),
  };
}
