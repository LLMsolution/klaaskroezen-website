"use client";

import { useState } from "react";
import type { FieldSchema } from "../../../../convex/siteSchemas";
import { AdminImageUpload } from "./AdminImageUpload";

type Props = {
  fields: FieldSchema[];
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  prefix?: string;
};

const labelClass =
  "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5";
const inputClass =
  "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

export function ContentFieldRenderer({ fields, data, onChange, prefix = "" }: Props) {
  function updateField(key: string, value: unknown) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const fieldKey = prefix ? `${prefix}.${field.key}` : field.key;
        const value = data[field.key];

        // ── Text ──
        if (field.type === "text") {
          return (
            <div key={fieldKey}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="text"
                value={(value as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                className={inputClass}
              />
            </div>
          );
        }

        // ── Image path with upload + preview ──
        if (field.type === "image-path") {
          return (
            <ContentImageField
              key={fieldKey}
              label={field.label}
              value={(value as string) ?? ""}
              onChange={(v) => updateField(field.key, v)}
            />
          );
        }

        // ── Textarea / Richtext ──
        if (field.type === "textarea" || field.type === "richtext") {
          return (
            <div key={fieldKey}>
              <label className={labelClass}>{field.label}</label>
              <textarea
                value={(value as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                rows={field.type === "richtext" ? 6 : 3}
                className={`${inputClass} resize-y ${field.type === "richtext" ? "font-mono text-[12px]" : ""}`}
              />
            </div>
          );
        }

        // ── Number ──
        if (field.type === "number") {
          return (
            <div key={fieldKey}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="number"
                value={(value as number) ?? 0}
                onChange={(e) => updateField(field.key, Number(e.target.value))}
                className={inputClass}
              />
            </div>
          );
        }

        // ── Object ──
        if (field.type === "object" && field.fields) {
          return (
            <div key={fieldKey} className="border border-rule rounded-[2px] p-4">
              <p className={labelClass}>{field.label}</p>
              <ContentFieldRenderer
                fields={field.fields}
                data={(value as Record<string, unknown>) ?? {}}
                onChange={(newVal) => updateField(field.key, newVal)}
                prefix={fieldKey}
              />
            </div>
          );
        }

        // ── Array ──
        if (field.type === "array" && field.itemFields) {
          const items = (value as unknown[]) ?? [];
          const isSimple =
            field.itemFields.length === 1 && field.itemFields[0].key === "value";

          return (
            <div key={fieldKey} className="border border-rule rounded-[2px] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className={labelClass + " mb-0"}>{field.label}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (isSimple) {
                      updateField(field.key, [...items, ""]);
                    } else {
                      const empty: Record<string, string> = {};
                      for (const f of field.itemFields!) {
                        empty[f.key] = "";
                      }
                      updateField(field.key, [...items, empty]);
                    }
                  }}
                  className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
                >
                  + Item
                </button>
              </div>

              {items.length === 0 && (
                <p className="text-[12px] text-ink/30">Geen items.</p>
              )}

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start group"
                  >
                    <div className="flex-1">
                      {isSimple ? (
                        <input
                          type="text"
                          value={(item as string) ?? ""}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx] = e.target.value;
                            updateField(field.key, updated);
                          }}
                          className={inputClass}
                          placeholder={field.itemFields![0].label}
                        />
                      ) : (
                        <div className="border border-rule/50 rounded-[2px] p-3 space-y-2">
                          <ContentFieldRenderer
                            fields={field.itemFields!}
                            data={(item as Record<string, unknown>) ?? {}}
                            onChange={(newItem) => {
                              const updated = [...items];
                              updated[idx] = newItem;
                              updateField(field.key, updated);
                            }}
                            prefix={`${fieldKey}[${idx}]`}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...items];
                            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                            updateField(field.key, updated);
                          }}
                          className="text-[10px] text-ink/30 hover:text-ink cursor-pointer"
                          title="Omhoog"
                        >
                          ▲
                        </button>
                      )}
                      {idx < items.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...items];
                            [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                            updateField(field.key, updated);
                          }}
                          className="text-[10px] text-ink/30 hover:text-ink cursor-pointer"
                          title="Omlaag"
                        >
                          ▼
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = items.filter((_, i) => i !== idx);
                          updateField(field.key, updated);
                        }}
                        className="text-[10px] text-ink/30 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Verwijderen"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/** Image field: drag-drop upload to Convex with auto-resizing */
function ContentImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Resolve display URL: static paths stay as-is, convex:storageId needs resolution
  const displayUrl = value && !value.startsWith("convex:") ? value : undefined;

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <AdminImageUpload
        currentUrl={displayUrl}
        onUploaded={(storageId) => onChange(`convex:${storageId}`)}
        onRemoved={() => onChange("")}
        alt={label}
      />
    </div>
  );
}
