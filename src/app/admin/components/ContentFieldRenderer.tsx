"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { FieldSchema } from "../../../../convex/siteSchemas";
import { AdminImageUpload } from "./AdminImageUpload";

type Props = {
  fields: FieldSchema[];
  data: Record<string, unknown>;
  displayData?: Record<string, unknown>; // Resolved URLs for image previews
  onChange: (data: Record<string, unknown>) => void;
  prefix?: string;
  pageSlug?: string;
  sectionId?: string;
};

const labelClass =
  "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5";
const inputClass =
  "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

export function ContentFieldRenderer({ fields, data, displayData, onChange, prefix = "", pageSlug, sectionId }: Props) {
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
          const displayValue = displayData?.[field.key] as string | undefined;
          return (
            <ContentImageField
              key={fieldKey}
              label={field.label}
              value={(value as string) ?? ""}
              resolvedUrl={displayValue}
              onChange={(v) => updateField(field.key, v)}
              fieldKey={field.key}
              pageSlug={pageSlug}
              sectionId={sectionId}
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
                displayData={displayData?.[field.key] as Record<string, unknown> | undefined}
                onChange={(newVal) => updateField(field.key, newVal)}
                prefix={fieldKey}
                pageSlug={pageSlug}
                sectionId={sectionId}
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
                            displayData={((displayData?.[field.key] as unknown[]) ?? [])[idx] as Record<string, unknown> | undefined}
                            onChange={(newItem) => {
                              const updated = [...items];
                              updated[idx] = newItem;
                              updateField(field.key, updated);
                            }}
                            prefix={`${fieldKey}[${idx}]`}
                            pageSlug={pageSlug}
                            sectionId={`${sectionId}-${field.key}`}
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
  resolvedUrl,
  onChange,
  fieldKey,
  pageSlug,
  sectionId,
}: {
  label: string;
  value: string;
  resolvedUrl?: string;
  onChange: (v: string) => void;
  fieldKey: string;
  pageSlug?: string;
  sectionId?: string;
}) {
  const registerImage = useMutation(api.siteImages.saveImage);
  const displayUrl = resolvedUrl || (value && !value.startsWith("convex:") ? value : undefined);
  const [showPreview, setShowPreview] = useState(false);

  // Derive a siteImages key from the context (e.g. "over-ons/team/image")
  const imageKey = pageSlug && sectionId
    ? `${pageSlug}/${sectionId}/${fieldKey}`
    : undefined;

  // Look up spec for this image (used for preview ratio)
  const spec = useQuery(
    api.imageSpecs.getSpecForKey,
    imageKey ? { imageKey } : "skip",
  );

  async function handleUploaded(storageId: string, width?: number, height?: number) {
    onChange(`convex:${storageId}`);
    if (imageKey) {
      try {
        const category = pageSlug || "content";
        await registerImage({ key: imageKey, storageId: storageId as Id<"_storage">, fileName: `${fieldKey}.webp`, category, alt: label, width, height });
      } catch { /* non-critical — image still works via convex: ref */ }
    }
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <AdminImageUpload
        currentUrl={displayUrl}
        onUploaded={handleUploaded}
        onRemoved={() => onChange("")}
        alt={label}
        imageKey={imageKey}
      />
      {displayUrl && (
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="text-[10px] text-copper hover:text-copper-light cursor-pointer mt-1"
        >
          Bekijk preview op ware grootte
        </button>
      )}
      {showPreview && displayUrl && (
        <ContentImagePreviewModal
          url={displayUrl}
          alt={label}
          imageKey={imageKey}
          spec={spec ?? undefined}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

/** Modal showing image at its actual display aspect ratio */
function ContentImagePreviewModal({ url, alt, imageKey, spec, onClose }: {
  url: string;
  alt: string;
  imageKey?: string;
  spec?: { displayWidth: number; displayHeight: number; aspectRatio: string; context: string };
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70"
      onClick={onClose}
    >
      <div
        className="bg-paper border border-rule rounded-[2px] max-w-[900px] w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-rule">
          <div>
            <p className="text-[13px] font-medium text-ink">{imageKey || alt}</p>
            {spec && (
              <p className="text-[11px] text-ink/40 mt-0.5">
                {spec.displayWidth}x{spec.displayHeight} · {spec.aspectRatio} · {spec.context}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[20px] text-ink/40 hover:text-ink cursor-pointer leading-none px-2"
          >
            &times;
          </button>
        </div>
        <div className="p-5 flex justify-center bg-warm/20">
          {spec ? (
            <div
              className="relative w-full overflow-hidden bg-warm/30 border border-rule rounded-[2px]"
              style={{
                maxWidth: `${Math.min(spec.displayWidth, 800)}px`,
                aspectRatio: `${spec.displayWidth} / ${spec.displayHeight}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={alt} className="w-full h-full object-cover" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={alt} className="max-h-[70vh] max-w-full object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}
