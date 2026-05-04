"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const LANG_LABEL: Record<Lang, string> = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
};

const ALL_LANGS: Lang[] = ["nl", "en", "de"];

interface Props {
  /** Languages with usable content (offered as source choices). */
  availableLangs: Lang[];
  /** Called with chosen source + target after the user clicks "Vertaal". */
  onTranslate: (sourceLang: Lang, targetLang: Lang) => Promise<void>;
  /** Optional default selection — falls back to first sensible combo. */
  defaultSource?: Lang;
  defaultTarget?: Lang;
  /** Optional status text shown after a run. */
  resultMessage?: string | null;
}

/**
 * Whole-record translation control: explicit source picker + explicit target
 * picker + Vertaal button. Only the target language is overwritten on
 * completion. Used for "translate this whole page / blog post / training".
 */
export function TranslateRecordButton({
  availableLangs,
  onTranslate,
  defaultSource,
  defaultTarget,
  resultMessage,
}: Props) {
  const initialSource: Lang =
    defaultSource && availableLangs.includes(defaultSource)
      ? defaultSource
      : availableLangs[0] ?? "nl";

  const initialTarget: Lang =
    defaultTarget && defaultTarget !== initialSource
      ? defaultTarget
      : (ALL_LANGS.find((l) => l !== initialSource) ?? "en");

  const [source, setSource] = useState<Lang>(initialSource);
  const [target, setTarget] = useState<Lang>(initialTarget);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetCandidates = ALL_LANGS.filter((l) => l !== source);

  async function handleClick() {
    if (source === target) {
      setError("Source en target taal moeten verschillen.");
      return;
    }
    setError(null);
    setRunning(true);
    try {
      await onTranslate(source, target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vertaling mislukt.");
    } finally {
      setRunning(false);
    }
  }

  const selectClass =
    "text-[11px] bg-paper border border-rule px-2 py-1.5 rounded-[2px] text-ink focus:border-copper focus:outline-none cursor-pointer";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
        Vertaal
      </span>
      <span className="text-[11px] text-ink/50">van</span>
      <select
        value={source}
        onChange={(e) => {
          const next = e.target.value as Lang;
          setSource(next);
          if (target === next) {
            setTarget(ALL_LANGS.find((l) => l !== next) ?? "en");
          }
        }}
        disabled={running}
        className={selectClass}
      >
        {availableLangs.map((l) => (
          <option key={l} value={l}>
            {LANG_LABEL[l]}
          </option>
        ))}
      </select>
      <span className="text-[11px] text-ink/50">naar</span>
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value as Lang)}
        disabled={running}
        className={selectClass}
      >
        {targetCandidates.map((l) => (
          <option key={l} value={l}>
            {LANG_LABEL[l]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleClick}
        disabled={running || source === target}
        className="text-[11px] font-medium px-3 py-1.5 rounded-[2px] cursor-pointer bg-copper text-paper hover:bg-copper-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {running ? "Vertalen..." : "Vertaal"}
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
      {!error && resultMessage && (
        <span className="text-[11px] text-ink/60">{resultMessage}</span>
      )}
    </div>
  );
}
