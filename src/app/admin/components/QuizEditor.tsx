"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading } from "./shared";

type QuestionType = "multiple_choice" | "multiple_select" | "open" | "scale";

interface Props {
  moduleId: Id<"trainingModules">;
  onBack: () => void;
}

export function QuizEditor({ moduleId, onBack }: Props) {
  const quiz = useQuery(api.quizzes.getFullQuiz, { moduleId });
  const createQuiz = useMutation(api.quizzes.createQuiz);
  const updateQuiz = useMutation(api.quizzes.updateQuiz);
  const addQuestion = useMutation(api.quizzes.addQuestion);
  const updateQuestion = useMutation(api.quizzes.updateQuestion);
  const removeQuestion = useMutation(api.quizzes.removeQuestion);

  const [showForm, setShowForm] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Question form state
  const [qType, setQType] = useState<QuestionType>("multiple_choice");
  const [qNl, setQNl] = useState("");
  const [qEn, setQEn] = useState("");
  const [options, setOptions] = useState<{ nl: string; en: string; correct: boolean }[]>([
    { nl: "", en: "", correct: true },
    { nl: "", en: "", correct: false },
  ]);
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(10);
  const [scaleLabelNl, setScaleLabelNl] = useState("");
  const [scaleLabelEn, setScaleLabelEn] = useState("");

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
    setQNl("");
    setQEn("");
    setOptions([
      { nl: "", en: "", correct: true },
      { nl: "", en: "", correct: false },
    ]);
    setScaleMin(1);
    setScaleMax(10);
    setScaleLabelNl("");
    setScaleLabelEn("");
    setError("");
  }

  async function handleAddQuestion() {
    if (!qNl || !qEn) {
      setError("Vraag NL en EN zijn verplicht.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const args: Parameters<typeof addQuestion>[0] = {
        quizId: quiz!._id,
        type: qType,
        question: { nl: qNl, en: qEn },
      };
      if (qType === "multiple_choice" || qType === "multiple_select") {
        args.options = options.map((o) => ({
          text: { nl: o.nl, en: o.en },
          correct: o.correct,
        }));
      }
      if (qType === "scale") {
        args.scaleMin = scaleMin;
        args.scaleMax = scaleMax;
        if (scaleLabelNl || scaleLabelEn) {
          args.scaleLabels = { nl: scaleLabelNl, en: scaleLabelEn };
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
        <p className="text-[14px] text-ink/50 mb-4">
          Deze module heeft nog geen quiz.
        </p>
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
        <h2 className="font-display text-[20px] font-black tracking-[-0.02em]">
          Quiz bewerken
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-ink/50">
            Slagingspercentage: {quiz.passingScore}%
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-[2px] ${
              quiz.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {quiz.active ? "Actief" : "Inactief"}
          </span>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-3 mb-6">
        {questions.length === 0 ? (
          <p className="text-[14px] text-ink/30 py-6 text-center border border-dashed border-rule rounded-[2px]">
            Nog geen vragen.
          </p>
        ) : (
          questions.map((q, i) => (
            <div key={q._id} className="border border-rule rounded-[2px] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-ink/30 mb-1">
                    Vraag {i + 1} · {TYPE_LABELS[q.type as QuestionType]}
                  </p>
                  <p className="text-[14px] text-ink">{q.question.nl}</p>
                  {q.options && (
                    <div className="mt-2 space-y-1">
                      {q.options.map((o, oi) => (
                        <p key={oi} className={`text-[13px] ${o.correct ? "text-green-700 font-medium" : "text-ink/50"}`}>
                          {o.correct ? "✓" : "○"} {o.text.nl}
                        </p>
                      ))}
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
          ))
        )}
      </div>

      {/* Add question */}
      {showForm ? (
        <div className="border border-copper/20 rounded-[2px] p-5 bg-copper/[0.02]">
          <h3 className="text-[13px] font-medium text-ink mb-3">Nieuwe vraag</h3>
          {error && <p className="text-red-600 text-[13px] mb-3">{error}</p>}

          <div className="mb-3">
            <label className="block text-[11px] text-ink/50 mb-1">Type</label>
            <select
              value={qType}
              onChange={(e) => setQType(e.target.value as QuestionType)}
              className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] text-ink/50 mb-1">Vraag (NL)</label>
              <textarea value={qNl} onChange={(e) => setQNl(e.target.value)} rows={2}
                className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
            </div>
            <div>
              <label className="block text-[11px] text-ink/50 mb-1">Vraag (EN)</label>
              <textarea value={qEn} onChange={(e) => setQEn(e.target.value)} rows={2}
                className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
            </div>
          </div>

          {/* Options for choice types */}
          {(qType === "multiple_choice" || qType === "multiple_select") && (
            <div className="mb-3">
              <label className="block text-[11px] text-ink/50 mb-1">Opties</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input type={qType === "multiple_choice" ? "radio" : "checkbox"} checked={opt.correct}
                    onChange={() => {
                      if (qType === "multiple_choice") {
                        setOptions(options.map((o, j) => ({ ...o, correct: j === i })));
                      } else {
                        setOptions(options.map((o, j) => j === i ? { ...o, correct: !o.correct } : o));
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <input type="text" value={opt.nl} placeholder="NL" onChange={(e) => setOptions(options.map((o, j) => j === i ? { ...o, nl: e.target.value } : o))}
                    className="flex-1 bg-transparent border border-rule px-2 py-1.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
                  <input type="text" value={opt.en} placeholder="EN" onChange={(e) => setOptions(options.map((o, j) => j === i ? { ...o, en: e.target.value } : o))}
                    className="flex-1 bg-transparent border border-rule px-2 py-1.5 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
                  {options.length > 2 && (
                    <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-[11px] text-red-400 cursor-pointer">×</button>
                  )}
                </div>
              ))}
              <button onClick={() => setOptions([...options, { nl: "", en: "", correct: false }])}
                className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
                + Optie
              </button>
            </div>
          )}

          {/* Scale settings */}
          {qType === "scale" && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-ink/50 mb-1">Min</label>
                <input type="number" value={scaleMin} onChange={(e) => setScaleMin(Number(e.target.value))}
                  className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
              </div>
              <div>
                <label className="block text-[11px] text-ink/50 mb-1">Max</label>
                <input type="number" value={scaleMax} onChange={(e) => setScaleMax(Number(e.target.value))}
                  className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
              </div>
              <div>
                <label className="block text-[11px] text-ink/50 mb-1">Label (NL)</label>
                <input type="text" value={scaleLabelNl} onChange={(e) => setScaleLabelNl(e.target.value)}
                  className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
              </div>
              <div>
                <label className="block text-[11px] text-ink/50 mb-1">Label (EN)</label>
                <input type="text" value={scaleLabelEn} onChange={(e) => setScaleLabelEn(e.target.value)}
                  className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]" />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleAddQuestion} disabled={saving}
              className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer">
              {saving ? "Opslaan..." : "Vraag toevoegen"}
            </button>
            <button onClick={() => { resetQuestionForm(); setShowForm(false); }}
              className="text-[12px] text-ink/40 hover:text-ink cursor-pointer px-4 py-2.5">
              Annuleer
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
          + Vraag toevoegen
        </button>
      )}
    </div>
  );
}
