"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Target = "en" | "de";

const TARGETS: { value: Target; label: string }[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];

const SAMPLE = "Klaas Kroezen schrijft over ontspannen verkopen.";

export function TranslationTester() {
  const tryTranslate = useAction(api.aiTranslate.tryTranslate);
  const [source, setSource] = useState(SAMPLE);
  const [target, setTarget] = useState<Target>("en");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!source.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await tryTranslate({ text: source, targetLang: target, sourceLang: "nl" });
      if (res.ok) {
        setResult(res.text);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-rule rounded-[2px] p-5 space-y-4">
      <div>
        <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-1.5">
          Brontekst (NL)
        </label>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={4}
          className="w-full bg-paper border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] font-sans"
        />
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-1.5">
            Doeltaal
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as Target)}
            className="bg-paper border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
          >
            {TARGETS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={run}
          disabled={loading || !source.trim()}
          className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "Vertalen..." : "Vertaal"}
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-[13px] px-3 py-2 rounded-[2px]">
          {error}
        </div>
      )}

      {result !== null && (
        <div>
          <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-1.5">
            Vertaling ({target.toUpperCase()})
          </label>
          <div className="bg-warm border border-rule px-3 py-2 text-[14px] text-ink whitespace-pre-wrap rounded-[2px]">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
