"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

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

type FormState = {
  recipientEmail: string;
  imageStorageId?: Id<"_storage">;
  imageUrl?: string;
  introText: Localized;
  submitLabel: Localized;
  fields: FormField[];
  active: boolean;
};

const EMPTY_LOCALIZED: Localized = { nl: "", en: "", de: "" };

const DEFAULT_FORM: FormState = {
  recipientEmail: "klaas@klaaskroezen.com",
  introText: { nl: "Vul dit formulier in om verder te gaan.", en: "", de: "" },
  submitLabel: { nl: "Versturen", en: "Submit", de: "Absenden" },
  fields: [],
  active: true,
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Korte tekst",
  textarea: "Lange tekst",
  radio: "Multiple choice (1 antwoord)",
  checkbox: "Multiple choice (meerdere)",
  scale: "Schaal (1-10)",
};

function makeFieldId(): string {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface Props {
  moduleId: Id<"trainingModules">;
}

export function LessonFormEditor({ moduleId }: Props) {
  const existing = useQuery(api.lessonForms.getForModuleAdmin, { moduleId });
  const upsertForm = useMutation(api.lessonForms.upsertForm);
  const deleteForm = useMutation(api.lessonForms.deleteForm);
  const generateImageUploadUrl = useMutation(api.lessonForms.generateImageUploadUrl);

  const [enabled, setEnabled] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hydrate from server once
  useEffect(() => {
    if (existing === undefined) return;
    if (existing) {
      setEnabled(true);
      setForm({
        recipientEmail: existing.recipientEmail,
        imageStorageId: existing.imageStorageId,
        imageUrl: existing.imageUrl,
        introText: existing.introText,
        submitLabel: existing.submitLabel,
        fields: existing.fields as FormField[],
        active: existing.active,
      });
    } else {
      setEnabled(false);
    }
  }, [existing]);

  if (existing === undefined) {
    return <p className="text-[11px] text-ink/40">Laden…</p>;
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsertForm({
        moduleId,
        recipientEmail: form.recipientEmail,
        imageStorageId: form.imageStorageId,
        introText: form.introText,
        submitLabel: form.submitLabel,
        fields: form.fields,
        active: form.active,
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await generateImageUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      const next: FormState = {
        ...form,
        imageStorageId: storageId,
        imageUrl: URL.createObjectURL(file),
      };
      setForm(next);
      // Auto-save so the upload sticks without the user having to click Opslaan.
      await upsertForm({
        moduleId,
        recipientEmail: next.recipientEmail,
        imageStorageId: storageId,
        introText: next.introText,
        submitLabel: next.submitLabel,
        fields: next.fields,
        active: next.active,
      });
      setSavedAt(Date.now());
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleImageRemove() {
    const next: FormState = { ...form, imageStorageId: undefined, imageUrl: undefined };
    setForm(next);
    await upsertForm({
      moduleId,
      recipientEmail: next.recipientEmail,
      imageStorageId: undefined,
      introText: next.introText,
      submitLabel: next.submitLabel,
      fields: next.fields,
      active: next.active,
    });
    setSavedAt(Date.now());
  }

  async function handleDelete() {
    if (!confirm("Formulier verwijderen?")) return;
    await deleteForm({ moduleId });
    setEnabled(false);
    setForm(DEFAULT_FORM);
  }

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addField(type: FieldType) {
    const newField: FormField = {
      id: makeFieldId(),
      type,
      label: { ...EMPTY_LOCALIZED },
      required: true,
      options:
        type === "radio" || type === "checkbox"
          ? [
              { ...EMPTY_LOCALIZED },
              { ...EMPTY_LOCALIZED },
            ]
          : undefined,
      scaleMin: type === "scale" ? 1 : undefined,
      scaleMax: type === "scale" ? 10 : undefined,
    };
    patch("fields", [...form.fields, newField]);
  }

  function updateField(id: string, patcher: (f: FormField) => FormField) {
    patch(
      "fields",
      form.fields.map((f) => (f.id === id ? patcher(f) : f)),
    );
  }

  function removeField(id: string) {
    patch("fields", form.fields.filter((f) => f.id !== id));
  }

  function moveField(id: string, dir: -1 | 1) {
    const idx = form.fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const next = [...form.fields];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    patch("fields", next);
  }

  // Toggle: enable/disable the form for this lesson
  if (!enabled) {
    return (
      <div className="border border-rule rounded-[2px] p-4 bg-warm/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-1">
              Formulier
            </p>
            <p className="text-[12px] text-ink/50">
              Geen formulier gekoppeld aan deze les.
            </p>
          </div>
          <button
            onClick={() => setEnabled(true)}
            className="text-[12px] text-copper hover:text-copper-light cursor-pointer font-medium"
          >
            + Formulier toevoegen
          </button>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  return (
    <div className="border border-copper/30 rounded-[2px] p-4 bg-copper/[0.02] space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          Formulier
        </p>
        <div className="flex items-center gap-3">
          <label className="text-[11px] text-ink/60 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => patch("active", e.target.checked)}
              className="cursor-pointer"
            />
            Actief
          </label>
          {savedAt && Date.now() - savedAt < 3000 && (
            <span className="text-[11px] text-green-600">✓ Opgeslagen</span>
          )}
        </div>
      </div>

      <div>
        <label className="text-[11px] text-ink/50 mb-1 block">Ontvanger e-mailadres</label>
        <input
          type="email"
          value={form.recipientEmail}
          onChange={(e) => patch("recipientEmail", e.target.value)}
          placeholder="klaas@klaaskroezen.com"
          className={inputCls}
        />
      </div>

      {/* Image upload (shown between header and intro text in the cursist view) */}
      <div>
        <label className="text-[11px] text-ink/50 mb-1 block">Afbeelding (optioneel)</label>
        {form.imageUrl ? (
          <div className="flex items-start gap-3">
            <div className="relative w-[200px] aspect-[16/9] border border-rule rounded-[2px] overflow-hidden bg-warm/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imageUrl}
                alt="Formulier hero"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-copper hover:text-copper-light cursor-pointer">
                Vervangen
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button
                onClick={handleImageRemove}
                className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer text-left"
              >
                Verwijderen
              </button>
            </div>
          </div>
        ) : (
          <label className={`inline-block text-[11px] text-copper border border-copper/40 px-3 py-1.5 rounded-[2px] hover:bg-copper/10 transition-colors cursor-pointer ${uploadingImage ? "opacity-50" : ""}`}>
            {uploadingImage ? "Uploaden…" : "+ Afbeelding uploaden"}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
          </label>
        )}
      </div>

      <div>
        <label className="text-[11px] text-ink/50 mb-1 block">Inleidende tekst (NL)</label>
        <textarea
          value={form.introText.nl}
          onChange={(e) => patch("introText", { ...form.introText, nl: e.target.value })}
          rows={2}
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-[11px] text-ink/50 mb-1 block">Submit-knop label (NL)</label>
        <input
          type="text"
          value={form.submitLabel.nl}
          onChange={(e) => patch("submitLabel", { ...form.submitLabel, nl: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Fields */}
      <div>
        <p className="text-[11px] text-ink/50 mb-2">Velden ({form.fields.length})</p>
        <div className="space-y-3">
          {form.fields.map((field, idx) => (
            <FieldEditor
              key={field.id}
              field={field}
              index={idx}
              total={form.fields.length}
              onChange={(patcher) => updateField(field.id, patcher)}
              onRemove={() => removeField(field.id)}
              onMove={(dir) => moveField(field.id, dir)}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
            <button
              key={type}
              onClick={() => addField(type)}
              className="text-[11px] text-copper border border-copper/40 px-2.5 py-1 rounded-[2px] hover:bg-copper/10 transition-colors cursor-pointer"
            >
              + {FIELD_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-rule/50">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
        <button
          onClick={handleDelete}
          className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer"
        >
          Verwijder formulier
        </button>
      </div>
    </div>
  );
}

/* ─── Field editor (one field row) ─── */

function FieldEditor({
  field,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  field: FormField;
  index: number;
  total: number;
  onChange: (patcher: (f: FormField) => FormField) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const inputCls =
    "w-full bg-transparent border border-rule px-2 py-1.5 text-[12px] text-ink focus:border-copper focus:outline-none rounded-[2px]";
  return (
    <div className="border border-rule rounded-[2px] p-3 bg-paper">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-copper">
          {index + 1}. {FIELD_TYPE_LABELS[field.type]}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="text-[12px] text-ink/40 hover:text-ink disabled:opacity-30 cursor-pointer"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="text-[12px] text-ink/40 hover:text-ink disabled:opacity-30 cursor-pointer"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer"
          >
            Verwijder
          </button>
        </div>
      </div>

      <div className="mb-2">
        <label className="text-[10px] text-ink/50 mb-0.5 block">Vraag (NL)</label>
        <input
          type="text"
          value={field.label.nl}
          onChange={(e) =>
            onChange((f) => ({ ...f, label: { ...f.label, nl: e.target.value } }))
          }
          className={inputCls}
        />
      </div>

      {(field.type === "radio" || field.type === "checkbox") && (
        <div className="mb-2">
          <label className="text-[10px] text-ink/50 mb-1 block">Opties</label>
          <div className="space-y-1">
            {field.options?.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.nl}
                  placeholder={`Optie ${oi + 1} (NL)`}
                  onChange={(e) =>
                    onChange((f) => {
                      const next = [...(f.options ?? [])];
                      next[oi] = { ...next[oi], nl: e.target.value };
                      return { ...f, options: next };
                    })
                  }
                  className={inputCls}
                />
                {(field.options?.length ?? 0) > 2 && (
                  <button
                    onClick={() =>
                      onChange((f) => ({
                        ...f,
                        options: f.options?.filter((_, j) => j !== oi),
                      }))
                    }
                    className="text-[11px] text-red-400 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              onChange((f) => ({
                ...f,
                options: [...(f.options ?? []), { ...EMPTY_LOCALIZED }],
              }))
            }
            className="text-[11px] text-copper mt-1 cursor-pointer hover:text-copper-light"
          >
            + Optie
          </button>
        </div>
      )}

      {field.type === "scale" && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[10px] text-ink/50 mb-0.5 block">Min</label>
            <input
              type="number"
              value={field.scaleMin ?? 1}
              onChange={(e) =>
                onChange((f) => ({ ...f, scaleMin: Number(e.target.value) }))
              }
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[10px] text-ink/50 mb-0.5 block">Max</label>
            <input
              type="number"
              value={field.scaleMax ?? 10}
              onChange={(e) =>
                onChange((f) => ({ ...f, scaleMax: Number(e.target.value) }))
              }
              className={inputCls}
            />
          </div>
        </div>
      )}

      <label className="text-[11px] text-ink/60 flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) =>
            onChange((f) => ({ ...f, required: e.target.checked }))
          }
          className="cursor-pointer"
        />
        Verplicht veld
      </label>
    </div>
  );
}
