"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "./shared";
import type { Lang } from "./LangEditor";

type QuestionType = "multiple_choice" | "multiple_select" | "open" | "scale";
type MultilangString = { nl: string; en: string; de?: string };
type OptionState = { nl: string; en: string; de: string; correct: boolean };


interface Props {
  moduleId: Id<"trainingModules">;
  editLang: Lang;
  onBack: () => void;
}

export function QuizEditor({ moduleId, editLang, onBack }: Props) {
  const quiz = useQuery(api.quizzes.getFullQuiz, { moduleId });
  const createQuiz = useMutation(api.quizzes.createQuiz);
  const addQuestion = useMutation(api.quizzes.addQuestion);
  const removeQuestion = useMutation(api.quizzes.removeQuestion);

  const [showForm, setShowForm] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Question form state — full multilang object so we can edit any lang.
  const [qType, setQType] = useState<QuestionType>("multiple_choice");
  const [qText, setQText] = useState<MultilangString>({ nl: "", en: "", de: "" });
  const [options, setOptions] = useState<OptionState[]>([
    { nl: "", en: "", de: "", correct: true },
    { nl: "", en: "", de: "", correct: false },
  ]);
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(10);
  const [scaleLabels, setScaleLabels] = useState<MultilangString>({ nl: "", en: "", de: "" });

  if (quiz === undefined) return <Loading />;

  async function handleCreateQuiz() {
    setSaving(true);
    try {
      await createQuiz({ moduleId, passingScore });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout.");
    } finally {
      setSaving(false);
    }
  }

  function resetQuestionForm() {
    setQType("multiple_choice");
    setQText({ nl: "", en: "", de: "" });
    setOptions([
      { nl: "", en: "", de: "", correct: true },
      { nl: "", en: "", de: "", correct: false },
    ]);
    setScaleMin(1);
    setScaleMax(10);
    setScaleLabels({ nl: "", en: "", de: "" });
    setError("");
  }

  async function handleAddQuestion() {
    if (!qText.nl.trim()) {
      setError("Vraag (NL) is verplicht als brontekst.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const args: Parameters<typeof addQuestion>[0] = {
        quizId: quiz!._id,
        type: qType,
        question: { nl: qText.nl, en: qText.en, de: qText.de || undefined },
      };
      if (qType === "multiple_choice" || qType === "multiple_select") {
        args.options = options.map((o) => ({
          text: { nl: o.nl, en: o.en, de: o.de || undefined },
          correct: o.correct,
        }));
      }
      if (qType === "scale") {
        args.scaleMin = scaleMin;
        args.scaleMax = scaleMax;
        if (scaleLabels.nl || scaleLabels.en || scaleLabels.de) {
          args.scaleLabels = { nl: scaleLabels.nl, en: scaleLabels.en, de: scaleLabels.de || undefined };
        }
      }
      await addQuestion(args);
      resetQuestionForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout.");
    } finally {
      setSaving(false);
    }
  }

  // No quiz yet
  if (!quiz) {
    return (
      <div className="max-w-[600px]">
        <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink mb-6 cursor-pointer">
          ← Terug
        </button>
        <h2 className="font-display text-[20px] font-black tracking-[-0.02em] mb-4">
          Quiz aanmaken
        </h2>
        <p className="text-[14px] text-ink/50 mb-4">Deze module heeft nog geen quiz.</p>
        {error && <p className="text-red-600 text-[13px] mb-3">{error}</p>}
        <div className="flex items-center gap-3 mb-4">
          <label className="text-[13px] text-ink/60">Slagingspercentage:</label>
          <input
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            min={0}
            max={100}
            className="w-20 bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
          />
          <span className="text-[13px] text-ink/40">%</span>
        </div>
        <button
          onClick={handleCreateQuiz}
          disabled={saving}
          className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Aanmaken..." : "Quiz aanmaken"}
        </button>
      </div>
    );
  }

  const questions = quiz.questions.sort((a, b) => a.sortOrder - b.sortOrder);
  const TYPE_LABELS: Record<QuestionType, string> = {
    multiple_choice: "Multiple choice",
    multiple_select: "Multiple select",
    open: "Open vraag",
    scale: "Schaal",
  };

  return (
    <div className="max-w-[700px]">
      <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink mb-6 cursor-pointer">
        ← Terug naar modules
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-[20px] font-black tracking-[-0.02em]">Quiz bewerken</h2>
          <p className="text-[11px] text-ink/40 mt-0.5">
            Weergegeven in <span className="font-medium text-copper">{editLang.toUpperCase()}</span> — wissel van taal bovenin de training editor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-ink/50">Slagingspercentage: {quiz.passingScore}%</span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-[2px] ${
              quiz.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {quiz.active ? "Actief" : "Inactief"}
          </span>
        </div>
      </div>

      {/* Questions list — displayed in active lang, fallback to NL */}
      <div className="space-y-3 mb-6">
        {questions.length === 0 ? (
          <p className="text-[14px] text-ink/30 py-6 text-center border border-dashed border-rule rounded-[2px]">
            Nog geen vragen.
          </p>
        ) : (
          questions.map((q, i) => {
            const qLangText = (q.question[editLang] as string | undefined) || q.question.nl;
            return (
              <div key={q._id} className="border border-rule rounded-[2px] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] text-ink/30 mb-1">
                      Vraag {i + 1} · {TYPE_LABELS[q.type as QuestionType]}
                    </p>
                    <p className="text-[14px] text-ink">{qLangText}</p>
                    {q.options && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((o, oi) => {
                          const optText = (o.text[editLang] as string | undefined) || o.text.nl;
                          return (
                            <p
                              key={oi}
                              className={`text-[13px] ${
                                o.correct ? "text-green-700 font-medium" : "text-ink/50"
                              }`}
                            >
                              {o.correct ? "✓" : "○"} {optText}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeQuestion({ id: q._id })}
                    className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer"
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add question form */}
      {showForm ? (
        <AddQuestionForm
          editLang={editLang}
          qType={qType}
          setQType={setQType}
          qText={qText}
          setQText={setQText}
          options={options}
          setOptions={setOptions}
          scaleMin={scaleMin}
          setScaleMin={setScaleMin}
          scaleMax={scaleMax}
          setScaleMax={setScaleMax}
          scaleLabels={scaleLabels}
          setScaleLabels={setScaleLabels}
          error={error}
          saving={saving}
          typeLabels={TYPE_LABELS}
          onSubmit={handleAddQuestion}
          onCancel={() => { resetQuestionForm(); setShowForm(false); }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-[12px] text-copper hover:text-copper-light cursor-pointer"
        >
          + Vraag toevoegen
        </button>
      )}
    </div>
  );
}

/* ─── Add question form (single active lang + AI translate) ─── */

function AddQuestionForm({
  editLang,
  qType,
  setQType,
  qText,
  setQText,
  options,
  setOptions,
  scaleMin,
  setScaleMin,
  scaleMax,
  setScaleMax,
  scaleLabels,
  setScaleLabels,
  error,
  saving,
  typeLabels,
  onSubmit,
  onCancel,
}: {
  editLang: Lang;
  qType: QuestionType;
  setQType: (v: QuestionType) => void;
  qText: MultilangString;
  setQText: (v: MultilangString) => void;
  options: OptionState[];
  setOptions: (v: OptionState[]) => void;
  scaleMin: number;
  setScaleMin: (v: number) => void;
  scaleMax: number;
  setScaleMax: (v: number) => void;
  scaleLabels: MultilangString;
  setScaleLabels: (v: MultilangString) => void;
  error: string;
  saving: boolean;
  typeLabels: Record<QuestionType, string>;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const translateField = useAction(api.aiTranslate.translateField);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const ALL: ("nl" | "en" | "de")[] = ["nl", "en", "de"];
  const sourceCandidates = ALL.filter((l) => {
    if (l === editLang) return false;
    if ((qText[l] ?? "").trim()) return true;
    if (options.some((o) => (o[l] ?? "").trim())) return true;
    if ((scaleLabels[l] ?? "").trim()) return true;
    return false;
  });
  const [sourceLang, setSourceLang] = useState<"nl" | "en" | "de">(sourceCandidates[0] ?? "nl");
  const effectiveSource = sourceCandidates.includes(sourceLang) ? sourceLang : (sourceCandidates[0] ?? "nl");
  const inputCls = "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  async function translate(text: string, src: "nl" | "en" | "de"): Promise<string> {
    if (src === editLang || !text.trim()) return "";
    return translateField({ text, targetLang: editLang, sourceLang: src });
  }

  async function translateAllFrom(src: "nl" | "en" | "de") {
    if (src === editLang) return;
    setTranslating(true);
    setTranslateError("");
    try {
      const next: MultilangString = { ...qText };
      if (qText[src]) next[editLang] = await translate(qText[src] ?? "", src);
      setQText(next);

      const nextOptions: OptionState[] = [];
      for (const o of options) {
        const translated = o[src] ? await translate(o[src] ?? "", src) : "";
        nextOptions.push({ ...o, [editLang]: translated });
      }
      setOptions(nextOptions);

      if (scaleLabels[src]) {
        setScaleLabels({ ...scaleLabels, [editLang]: await translate(scaleLabels[src] ?? "", src) });
      }
    } catch (err) {
      setTranslateError(err instanceof Error ? err.message : "Vertaling mislukt.");
    } finally {
      setTranslating(false);
    }
  }

  function updateOption(i: number, patch: Partial<OptionState>) {
    setOptions(options.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  }

  return (
    <div className="border border-copper/20 rounded-[2px] p-5 bg-copper/[0.02]">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h3 className="text-[13px] font-medium text-ink">Nieuwe vraag ({editLang.toUpperCase()})</h3>
        {sourceCandidates.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-ink/50">Vertaal vanuit</span>
            <select
              value={effectiveSource}
              onChange={(e) => setSourceLang(e.target.value as "nl" | "en" | "de")}
              disabled={translating}
              className="text-[11px] bg-paper border border-rule px-2 py-1 rounded-[2px] text-ink focus:border-copper focus:outline-none cursor-pointer"
            >
              {sourceCandidates.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => translateAllFrom(effectiveSource)}
              disabled={translating}
              className="text-[11px] text-copper hover:text-copper-light cursor-pointer disabled:opacity-40"
            >
              {translating ? "Vertalen..." : `Vertaal alles → ${editLang.toUpperCase()}`}
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-red-600 text-[13px] mb-3">{error}</p>}
      {translateError && <p className="text-[11px] text-red-500 mb-3">{translateError}</p>}

      <div className="mb-3">
        <label className="block text-[11px] text-ink/50 mb-1">Type</label>
        <select
          value={qType}
          onChange={(e) => setQType(e.target.value as QuestionType)}
          className={inputCls}
        >
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* NL source — always visible so the translator has something to translate from */}
      <div className="mb-3">
        <label className="block text-[11px] text-ink/50 mb-1">Vraag (NL — bron)</label>
        <textarea
          value={qText.nl}
          onChange={(e) => setQText({ ...qText, nl: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </div>

      {editLang !== "nl" && (
        <div className="mb-3">
          <label className="block text-[11px] text-ink/50 mb-1">Vraag ({editLang.toUpperCase()})</label>
          <textarea
            value={qText[editLang]}
            onChange={(e) => setQText({ ...qText, [editLang]: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </div>
      )}

      {(qType === "multiple_choice" || qType === "multiple_select") && (
        <div className="mb-3">
          <label className="block text-[11px] text-ink/50 mb-2">Opties</label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type={qType === "multiple_choice" ? "radio" : "checkbox"}
                checked={opt.correct}
                onChange={() => {
                  if (qType === "multiple_choice") {
                    setOptions(options.map((o, j) => ({ ...o, correct: j === i })));
                  } else {
                    updateOption(i, { correct: !opt.correct });
                  }
                }}
                className="cursor-pointer"
              />
              <input
                type="text"
                value={opt.nl}
                placeholder="NL"
                onChange={(e) => updateOption(i, { nl: e.target.value })}
                className="flex-1 bg-transparent border border-rule px-2 py-1.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
              {editLang !== "nl" && (
                <input
                  type="text"
                  value={opt[editLang]}
                  placeholder={editLang.toUpperCase()}
                  onChange={(e) => updateOption(i, { [editLang]: e.target.value })}
                  className="flex-1 bg-transparent border border-rule px-2 py-1.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
                />
              )}
              {options.length > 2 && (
                <button
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  className="text-[11px] text-red-400 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() =>
              setOptions([...options, { nl: "", en: "", de: "", correct: false }])
            }
            className="text-[12px] text-copper hover:text-copper-light cursor-pointer"
          >
            + Optie
          </button>
        </div>
      )}

      {qType === "scale" && (
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-[11px] text-ink/50 mb-1">Min</label>
            <input
              type="number"
              value={scaleMin}
              onChange={(e) => setScaleMin(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[11px] text-ink/50 mb-1">Max</label>
            <input
              type="number"
              value={scaleMax}
              onChange={(e) => setScaleMax(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[11px] text-ink/50 mb-1">Label (NL)</label>
            <input
              type="text"
              value={scaleLabels.nl}
              onChange={(e) => setScaleLabels({ ...scaleLabels, nl: e.target.value })}
              className={inputCls}
            />
          </div>
          {editLang !== "nl" && (
            <div>
              <label className="block text-[11px] text-ink/50 mb-1">Label ({editLang.toUpperCase()})</label>
              <input
                type="text"
                value={scaleLabels[editLang]}
                onChange={(e) => setScaleLabels({ ...scaleLabels, [editLang]: e.target.value })}
                className={inputCls}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          disabled={saving}
          className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Opslaan..." : "Vraag toevoegen"}
        </button>
        <button
          onClick={onCancel}
          className="text-[12px] text-ink/40 hover:text-ink cursor-pointer px-4 py-2.5"
        >
          Annuleer
        </button>
      </div>
    </div>
  );
}
