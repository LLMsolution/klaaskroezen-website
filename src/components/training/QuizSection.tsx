"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] ?? obj.en;
}

const quizI18n = {
  nl: { passingScore: "Slagingspercentage", passed: "Gehaald", congrats: "Gefeliciteerd! Je scoorde", need: "Je hebt", needed: "nodig", retry: "Opnieuw proberen", submit: "Antwoorden indienen", submitting: "Controleren...", previousAttempts: "Eerdere pogingen:", placeholder: "Je antwoord..." },
  en: { passingScore: "Passing score", passed: "Passed", congrats: "Congratulations! You scored", need: "You scored", needed: "needed", retry: "Try again", submit: "Submit answers", submitting: "Checking...", previousAttempts: "Previous attempts:", placeholder: "Your answer..." },
  de: { passingScore: "Bestehensquote", passed: "Bestanden", congrats: "Herzlichen Gluckwunsch! Sie erzielten", need: "Sie erzielten", needed: "benotigt", retry: "Erneut versuchen", submit: "Antworten einreichen", submitting: "Prufen...", previousAttempts: "Fruhere Versuche:", placeholder: "Ihre Antwort..." },
};

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
}

export function QuizSection({ moduleId, lang }: Props) {
  const quiz = useQuery(api.quizzes.getForModule, { moduleId });
  const attempts = useQuery(api.quizzes.getMyAttempts, { moduleId });
  const submitAttempt = useMutation(api.quizzes.submitAttempt);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const qi = quizI18n[lang];

  if (quiz === undefined) return null;
  if (!quiz) return null;

  const hasPassed = attempts?.some((a) => a.passed);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    if (!quiz) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitAttempt({
        quizId: quiz._id,
        answers: quiz.questions.map((q) => ({
          questionId: q._id,
          answer: answers[q._id] ?? "",
        })),
      });
      setResult({ score: res.score, passed: res.passed });
    } catch {
      // Handle error silently
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="my-10 border border-rule rounded-[2px]">
      <div className="border-b border-rule px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
              Quiz
            </p>
            <p className="text-[14px] text-ink/50">
              {qi.passingScore}: {quiz.passingScore}%
            </p>
          </div>
          {hasPassed && (
            <span className="text-[12px] font-medium text-green-700 bg-green-50 px-3 py-1 rounded-[2px]">
              {qi.passed}
            </span>
          )}
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div
          className={`px-6 py-4 border-b border-rule ${
            result.passed ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <p className={`text-[15px] font-medium ${result.passed ? "text-green-700" : "text-red-600"}`}>
            {result.passed
              ? `${qi.congrats} ${result.score}%.`
              : `${qi.need} ${result.score}%. ${quiz.passingScore}% ${qi.needed}.`}
          </p>
          {!result.passed && (
            <button
              onClick={handleRetry}
              className="mt-2 text-[12px] text-copper hover:text-copper-light cursor-pointer"
            >
              {qi.retry}
            </button>
          )}
        </div>
      )}

      {/* Questions */}
      {!result && (
        <div className="p-6 space-y-6">
          {quiz.questions
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((q, i) => (
              <div key={q._id}>
                <p className="text-[14px] font-medium text-ink mb-3">
                  {i + 1}. {loc(q.question, lang)}
                </p>
                <QuestionInput
                  question={q}
                  value={answers[q._id] ?? ""}
                  onChange={(v) => setAnswer(q._id, v)}
                  lang={lang}
                />
              </div>
            ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-copper text-paper px-6 py-3 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? qi.submitting : qi.submit}
          </button>
        </div>
      )}

      {/* Previous attempts */}
      {attempts && attempts.length > 0 && (
        <div className="border-t border-rule px-6 py-4">
          <p className="text-[11px] text-ink/40 mb-2">{qi.previousAttempts}</p>
          <div className="flex gap-2 flex-wrap">
            {attempts.map((a) => (
              <span
                key={a._id}
                className={`text-[12px] px-2 py-0.5 rounded-[2px] ${
                  a.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}
              >
                {a.score}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
  lang,
}: {
  question: {
    _id: Id<"quizQuestions">;
    type: string;
    options?: { text: LocalizedStr }[];
    scaleMin?: number;
    scaleMax?: number;
    scaleLabels?: LocalizedStr;
  };
  value: string;
  onChange: (v: string) => void;
  lang: Lang;
}) {
  if (question.type === "multiple_choice" && question.options) {
    return (
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <label
            key={i}
            className="flex items-center gap-3 p-3 border border-rule rounded-[2px] cursor-pointer hover:border-copper/30 transition-colors"
          >
            <input
              type="radio"
              name={question._id}
              checked={value === String(i)}
              onChange={() => onChange(String(i))}
              className="cursor-pointer"
            />
            <span className="text-[14px] text-ink">{loc(opt.text, lang)}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "multiple_select" && question.options) {
    const selected: number[] = value ? JSON.parse(value) : [];
    return (
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <label
            key={i}
            className="flex items-center gap-3 p-3 border border-rule rounded-[2px] cursor-pointer hover:border-copper/30 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(i)}
              onChange={() => {
                const next = selected.includes(i)
                  ? selected.filter((s) => s !== i)
                  : [...selected, i];
                onChange(JSON.stringify(next));
              }}
              className="cursor-pointer"
            />
            <span className="text-[14px] text-ink">{loc(opt.text, lang)}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "scale") {
    const min = question.scaleMin ?? 1;
    const max = question.scaleMax ?? 10;
    const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
      <div>
        {question.scaleLabels && (
          <p className="text-[12px] text-ink/40 mb-2">{loc(question.scaleLabels, lang)}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          {steps.map((n) => (
            <button
              key={n}
              onClick={() => onChange(String(n))}
              className={`w-10 h-10 rounded-[2px] text-[14px] font-medium border transition-colors cursor-pointer ${
                value === String(n)
                  ? "bg-copper text-paper border-copper"
                  : "border-rule text-ink/50 hover:border-copper/30"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Open question
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder={quizI18n[lang].placeholder}
      className="w-full bg-transparent border border-rule px-4 py-3 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
    />
  );
}
