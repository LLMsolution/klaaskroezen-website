"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type Props = {
  leadId: Id<"leads">;
  onDone: () => void;
};

export function AddNoteForm({ leadId, onDone }: Props) {
  const [type, setType] = useState<"note" | "call" | "meeting">("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const addNote = useMutation(api.crmLeads.addNote);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await addNote({
      leadId,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border border-rule rounded-[2px] p-4">
      {/* Type selector */}
      <div className="flex gap-2">
        {(["note", "call", "meeting"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-[2px] transition-colors cursor-pointer ${
              type === t ? "bg-copper text-paper" : "bg-warm text-ink/60 hover:text-ink"
            }`}
          >
            {t === "note" ? "Notitie" : t === "call" ? "Gesprek" : "Meeting"}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Titel..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
        required
      />

      <textarea
        placeholder="Beschrijving (optioneel)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent resize-none h-[80px]"
      />

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 text-[12px] text-ink/50 hover:text-ink transition-colors cursor-pointer"
        >
          Annuleren
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-[12px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer"
        >
          Opslaan
        </button>
      </div>
    </form>
  );
}
