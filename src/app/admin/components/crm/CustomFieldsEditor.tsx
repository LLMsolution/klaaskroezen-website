"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type CustomField = { key: string; value: string };

type Props = {
  contactId: Id<"contacts">;
  fields: CustomField[];
};

export function CustomFieldsEditor({ contactId, fields }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [localFields, setLocalFields] = useState<CustomField[]>(fields);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateCustomFields = useMutation(api.crm.updateCustomFields);

  // Sync with external prop changes
  useEffect(() => {
    setLocalFields(fields);
    setDirty(false);
  }, [fields]);

  function handleFieldChange(index: number, part: "key" | "value", val: string) {
    const updated = [...localFields];
    updated[index] = { ...updated[index], [part]: val };
    setLocalFields(updated);
    setDirty(true);
  }

  function handleRemove(index: number) {
    setLocalFields(localFields.filter((_, i) => i !== index));
    setDirty(true);
  }

  function handleAdd() {
    setLocalFields([...localFields, { key: "", value: "" }]);
    setDirty(true);
  }

  async function handleSave() {
    // Filter out empty keys
    const cleaned = localFields.filter((f) => f.key.trim() !== "");
    setSaving(true);
    try {
      await updateCustomFields({ contactId, customFields: cleaned });
      setLocalFields(cleaned);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 hover:text-ink/60 transition-colors cursor-pointer"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="M3 1l4 4-4 4" />
        </svg>
        Extra velden ({localFields.length})
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {localFields.map((field, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Veldnaam"
                value={field.key}
                onChange={(e) => handleFieldChange(i, "key", e.target.value)}
                className="flex-1 px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
              />
              <input
                type="text"
                placeholder="Waarde"
                value={field.value}
                onChange={(e) => handleFieldChange(i, "value", e.target.value)}
                className="flex-1 px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
              />
              <button
                onClick={() => handleRemove(i)}
                className="text-[13px] text-ink/30 hover:text-red-500 transition-colors cursor-pointer px-1"
              >
                x
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="text-[12px] text-copper hover:text-copper-light transition-colors cursor-pointer"
            >
              + Veld toevoegen
            </button>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-[11px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
