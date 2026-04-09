"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

type FieldType = "text" | "textarea" | "radio" | "checkbox" | "scale";
type Localized = { nl: string; en: string; de?: string };
type FormField = {
  id: string;
  type: FieldType;
  label: Localized;
  required: boolean;
  options?: Localized[];
  scaleMin?: number;
  scaleMax?: number;
};

function loc(obj: Localized, lang: Lang): string {
  return obj[lang] || obj.nl || obj.en || "";
}

const COPY: Record<Lang, { title: string; success: string; resubmit: string; submitting: string }> = {
  nl: {
    title: "Formulier",
    success: "Bedankt — je antwoorden zijn verstuurd.",
    resubmit: "Opnieuw invullen",
    submitting: "Versturen…",
  },
  en: {
    title: "Form",
    success: "Thanks — your answers have been sent.",
    resubmit: "Submit again",
    submitting: "Sending…",
  },
  de: {
    title: "Formular",
    success: "Danke — Ihre Antworten wurden gesendet.",
    resubmit: "Erneut absenden",
    submitting: "Senden…",
  },
};

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
}

export function LessonFormSection({ moduleId, lang }: Props) {
  const form = useQuery(api.lessonForms.getForModule, { moduleId });
  const previousSubmission = useQuery(api.lessonForms.getMySubmission, { moduleId });
  const submit = useMutation(api.lessonForms.submit);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const copy = COPY[lang];

  if (form === undefined) return null;
  if (!form) return null;

  const hasPreviousSubmission = !!previousSubmission && !justSubmitted;
  const showSuccess = justSubmitted;

  if (hasPreviousSubmission && !showForm) {
    return (
      <div className="my-8 border border-copper/30 rounded-[2px] p-5 bg-copper/[0.03]">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
          {copy.title}
        </p>
        <p className="text-[14px] text-ink/70 mb-3">
          ✓ {copy.success}
        </p>
        <button
          onClick={() => {
            setShowForm(true);
            setAnswers({});
          }}
          className="text-[12px] text-copper hover:text-copper-light cursor-pointer"
        >
          {copy.resubmit}
        </button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="my-8 border border-copper/30 rounded-[2px] p-5 bg-copper/[0.03]">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
          {copy.title}
        </p>
        <p className="text-[14px] text-ink/70">✓ {copy.success}</p>
      </div>
    );
  }

  function setAnswer(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function toggleCheckbox(fieldId: string, idx: number) {
    setAnswers((prev) => {
      const current = prev[fieldId] ? (JSON.parse(prev[fieldId]) as number[]) : [];
      const next = current.includes(idx)
        ? current.filter((i) => i !== idx)
        : [...current, idx];
      return { ...prev, [fieldId]: JSON.stringify(next) };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = (form?.fields ?? []).map((f) => ({
        fieldId: f.id,
        value: answers[f.id] ?? "",
      }));
      await submit({ moduleId, answers: payload });
      setJustSubmitted(true);
      setShowForm(false);
      setAnswers({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="my-8 border border-rule rounded-[2px] p-5 space-y-5">
      <div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
          {copy.title}
        </p>
        {loc(form.introText, lang) && (
          <p className="text-[14px] text-ink/60 leading-[1.6]">
            {loc(form.introText, lang)}
          </p>
        )}
      </div>

      {(form.fields as FormField[]).map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          lang={lang}
          value={answers[field.id] ?? ""}
          onChange={(v) => setAnswer(field.id, v)}
          onToggleCheckbox={(idx) => toggleCheckbox(field.id, idx)}
        />
      ))}

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-copper text-paper px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
      >
        {submitting ? copy.submitting : loc(form.submitLabel, lang)}
      </button>
    </form>
  );
}

/* ─── Single field render ─── */

function FieldRenderer({
  field,
  lang,
  value,
  onChange,
  onToggleCheckbox,
}: {
  field: FormField;
  lang: Lang;
  value: string;
  onChange: (v: string) => void;
  onToggleCheckbox: (idx: number) => void;
}) {
  const inputCls =
    "w-full bg-transparent border border-rule px-4 py-2.5 text-[14px] text-ink leading-[1.6] focus:border-copper focus:outline-none rounded-[2px]";

  const label = (
    <label className="block text-[13px] font-medium text-ink mb-2">
      {loc(field.label, lang)}
      {field.required && <span className="text-copper ml-1">*</span>}
    </label>
  );

  if (field.type === "text") {
    return (
      <div>
        {label}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputCls}
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          rows={4}
          className={`${inputCls} resize-y`}
        />
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div>
        {label}
        <div className="space-y-2">
          {field.options?.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 text-[13px] text-ink/70 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                checked={value === String(idx)}
                onChange={() => onChange(String(idx))}
                required={field.required && idx === 0}
                className="cursor-pointer"
              />
              {loc(opt, lang)}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const selected: number[] = value ? (JSON.parse(value) as number[]) : [];
    return (
      <div>
        {label}
        <div className="space-y-2">
          {field.options?.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 text-[13px] text-ink/70 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(idx)}
                onChange={() => onToggleCheckbox(idx)}
                className="cursor-pointer"
              />
              {loc(opt, lang)}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "scale") {
    const min = field.scaleMin ?? 1;
    const max = field.scaleMax ?? 10;
    const items: number[] = [];
    for (let i = min; i <= max; i++) items.push(i);
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-2">
          {items.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={`w-9 h-9 text-[13px] font-medium rounded-[2px] border transition-colors cursor-pointer ${
                value === String(n)
                  ? "bg-copper text-paper border-copper"
                  : "border-rule text-ink/60 hover:border-copper"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
