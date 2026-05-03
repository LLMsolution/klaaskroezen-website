"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { layout } from "../../../../convex/emailHelpers";
import { TranslateButton } from "./TranslateButton";

type AbTestPanelProps = {
  templateId: Id<"emailTemplates">;
  templateKey: string;
  abTestActive?: boolean;
  subjectNlB?: string;
  subjectEnB?: string;
  htmlNlB?: string;
  htmlEnB?: string;
};

export function AbTestPanel({
  templateId,
  templateKey,
  abTestActive,
  subjectNlB,
  subjectEnB,
  htmlNlB,
  htmlEnB,
}: AbTestPanelProps) {
  const results = useQuery(api.emailAdmin.getAbTestResults, { templateKey });
  const setVariant = useMutation(api.emailAdmin.setAbTestVariant);
  const toggleTest = useMutation(api.emailAdmin.toggleAbTest);
  const declareWinner = useMutation(api.emailAdmin.declareAbTestWinner);

  const [editing, setEditing] = useState(false);
  const [subNlB, setSubNlB] = useState(subjectNlB ?? "");
  const [subEnB, setSubEnB] = useState(subjectEnB ?? "");
  const [htmlNl, setHtmlNl] = useState(htmlNlB ?? "");
  const [htmlEn, setHtmlEn] = useState(htmlEnB ?? "");
  const [htmlDe, setHtmlDe] = useState("");
  const [editLang, setEditLang] = useState<"nl" | "en" | "de">("nl");
  const [saving, setSaving] = useState(false);

  const hasVariantB = !!(subjectNlB && htmlNlB);

  async function handleSaveVariantB() {
    setSaving(true);
    try {
      await setVariant({
        templateId,
        subjectNlB: subNlB,
        subjectEnB: subEnB,
        htmlNlB: htmlNl,
        htmlEnB: htmlEn,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    await toggleTest({ templateId, active: !abTestActive });
  }

  async function handleDeclareWinner(winner: "A" | "B") {
    if (!confirm(`Variant ${winner} als winnaar instellen? De andere variant wordt verwijderd.`)) return;
    await declareWinner({ templateId, winner });
  }

  return (
    <div className="border-t border-rule pt-5 mt-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          A/B Test
        </p>
        {hasVariantB && (
          <button
            onClick={handleToggle}
            className={`text-[11px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${
              abTestActive
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-ink/5 text-ink/40 hover:bg-ink/10"
            }`}
          >
            {abTestActive ? "Test actief" : "Test inactief"}
          </button>
        )}
      </div>

      {/* Results (when test has data) */}
      {results && (results.A.sent > 0 || results.B.sent > 0) && (
        <div className="mb-5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <VariantResultCard variant="A" data={results.A} isWinning={results.A.openRate > results.B.openRate} />
            <VariantResultCard variant="B" data={results.B} isWinning={results.B.openRate > results.A.openRate} />
          </div>
          {abTestActive && results.A.sent >= 10 && results.B.sent >= 10 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleDeclareWinner("A")}
                className="text-[11px] px-3 py-1.5 border border-rule rounded-[2px] text-ink/60 hover:text-ink hover:border-copper/40 transition-colors cursor-pointer"
              >
                A wint
              </button>
              <button
                onClick={() => handleDeclareWinner("B")}
                className="text-[11px] px-3 py-1.5 border border-rule rounded-[2px] text-ink/60 hover:text-ink hover:border-copper/40 transition-colors cursor-pointer"
              >
                B wint
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create / edit variant B */}
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50">
                  Onderwerp B (NL)
                </label>
                <TranslateButton
                  sourceText={subNlB}
                  targets={["en"]}
                  onTranslated={(t) => setSubEnB(t.en ?? subEnB)}
                />
              </div>
              <input
                type="text"
                value={subNlB}
                onChange={(e) => setSubNlB(e.target.value)}
                className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5">
                Subject B (EN)
              </label>
              <input
                type="text"
                value={subEnB}
                onChange={(e) => setSubEnB(e.target.value)}
                className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50">
                  HTML B
                </label>
                <div className="flex border border-rule rounded-[2px] overflow-hidden">
                  {(["nl", "en", "de"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setEditLang(l)}
                      className={`text-[10px] px-2 py-1 cursor-pointer transition-colors ${
                        editLang === l ? "bg-copper text-paper" : "text-ink/50 hover:bg-warm/30"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {editLang === "nl" && (
                <TranslateButton
                  sourceText={htmlNl}
                  targets={["en"]}
                  onTranslated={(t) => setHtmlEn(t.en ?? htmlEn)}
                  html
                  label="Vertaal HTML naar EN"
                />
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <textarea
                value={{ nl: htmlNl, en: htmlEn, de: htmlDe }[editLang]}
                onChange={(e) => ({ nl: setHtmlNl, en: setHtmlEn, de: setHtmlDe }[editLang](e.target.value))}
                className="w-full bg-white border border-rule px-3 py-2 text-[11px] text-ink font-mono focus:border-copper focus:outline-none rounded-[2px] resize-y"
                style={{ minHeight: 300 }}
                spellCheck={false}
              />
              <div className="bg-warm/20 rounded-[2px] p-2">
                <iframe
                  srcDoc={layout({ nl: htmlNl, en: htmlEn, de: htmlDe }[editLang], { lang: editLang })}
                  className="w-full border-0 bg-white rounded-[2px]"
                  style={{ minHeight: 300 }}
                  title={`Variant B preview ${editLang}`}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveVariantB}
              disabled={saving || !subNlB || !htmlNl}
              className="bg-copper text-paper px-5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
            >
              {saving ? "Opslaan..." : "Variant B opslaan"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-[11px] text-ink/40 hover:text-ink transition-colors px-3 py-2 cursor-pointer"
            >
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <div>
          {hasVariantB ? (
            <div className="flex items-center gap-3">
              <p className="text-[13px] text-ink/60">
                Variant B: <span className="text-ink">{subjectNlB}</span>
              </p>
              <button
                onClick={() => {
                  setSubNlB(subjectNlB ?? "");
                  setSubEnB(subjectEnB ?? "");
                  setHtmlNl(htmlNlB ?? "");
                  setHtmlEn(htmlEnB ?? "");
                  setEditing(true);
                }}
                className="text-[11px] text-copper hover:text-copper-light transition-colors cursor-pointer"
              >
                Bewerken
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[12px] text-copper hover:text-copper-light transition-colors cursor-pointer"
            >
              + Variant B aanmaken
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Variant Result Card ─── */

function VariantResultCard({
  variant,
  data,
  isWinning,
}: {
  variant: "A" | "B";
  data: { sent: number; opened: number; clicked: number; openRate: number; clickRate: number };
  isWinning: boolean;
}) {
  return (
    <div className={`border rounded-[2px] p-4 ${isWinning && data.sent > 0 ? "border-green-300 bg-green-50/30" : "border-rule"}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-medium text-ink">Variant {variant}</p>
        {isWinning && data.sent > 0 && (
          <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-green-600">Leidt</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[18px] font-display font-black text-ink">{data.sent}</p>
          <p className="text-[10px] text-ink/40">Verzonden</p>
        </div>
        <div>
          <p className={`text-[18px] font-display font-black ${data.openRate >= 40 ? "text-green-600" : data.openRate >= 20 ? "text-amber-600" : "text-ink/40"}`}>
            {data.openRate}%
          </p>
          <p className="text-[10px] text-ink/40">Open rate</p>
        </div>
        <div>
          <p className={`text-[18px] font-display font-black ${data.clickRate >= 10 ? "text-green-600" : data.clickRate >= 5 ? "text-amber-600" : "text-ink/40"}`}>
            {data.clickRate}%
          </p>
          <p className="text-[10px] text-ink/40">Click rate</p>
        </div>
      </div>
    </div>
  );
}
