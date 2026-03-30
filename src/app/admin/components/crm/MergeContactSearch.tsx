"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type Props = {
  currentContactId: Id<"contacts">;
  currentName: string;
  onMerged: () => void;
  onCancel: () => void;
};

export function MergeContactSearch({ currentContactId, currentName, onMerged, onCancel }: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<Id<"contacts"> | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");

  const mergeContacts = useMutation(api.crm.mergeContacts);

  const results = useQuery(
    api.crm.getContacts,
    search.length >= 2 ? { search, limit: 10 } : "skip",
  );

  const contacts = results?.contacts?.filter((c) => c._id !== currentContactId) ?? [];

  function handleSelect(id: Id<"contacts">, name: string) {
    setSelectedId(id);
    setSelectedName(name);
    setShowConfirm(true);
  }

  async function handleMerge() {
    if (!selectedId) return;
    setMerging(true);
    setError("");
    try {
      await mergeContacts({ keepId: currentContactId, mergeId: selectedId });
      onMerged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Samenvoegen mislukt");
      setMerging(false);
    }
  }

  if (showConfirm && selectedId) {
    return (
      <div className="border border-rule rounded-[2px] p-4 space-y-3">
        <p className="text-[13px]">
          Contact <strong>{selectedName}</strong> samenvoegen met <strong>{currentName}</strong>?
        </p>
        <p className="text-[11px] text-ink/50">
          Alle leads, activiteiten en tags worden overgenomen. Het duplicaat wordt verwijderd.
        </p>
        {error && <p className="text-[12px] text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleMerge}
            disabled={merging}
            className="px-3 py-1.5 text-[12px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer disabled:opacity-50"
          >
            {merging ? "Bezig..." : "Bevestig samenvoegen"}
          </button>
          <button
            onClick={() => { setShowConfirm(false); setSelectedId(null); }}
            className="px-3 py-1.5 text-[12px] text-ink/50 cursor-pointer"
          >
            Annuleren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-rule rounded-[2px] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">
          Duplicaat zoeken
        </p>
        <button
          onClick={onCancel}
          className="text-[11px] text-ink/40 hover:text-ink transition-colors cursor-pointer"
        >
          Sluiten
        </button>
      </div>
      <input
        type="text"
        placeholder="Zoek op naam of email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
        autoFocus
      />
      {search.length >= 2 && contacts.length === 0 && results !== undefined && (
        <p className="text-[12px] text-ink/30">Geen contacten gevonden</p>
      )}
      {contacts.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {contacts.map((c) => (
            <button
              key={c._id}
              onClick={() => handleSelect(c._id, `${c.firstName} ${c.lastName ?? ""}`)}
              className="w-full text-left px-3 py-2 rounded-[2px] hover:bg-warm transition-colors cursor-pointer"
            >
              <p className="text-[13px] font-medium">{c.firstName} {c.lastName}</p>
              <p className="text-[11px] text-ink/50">{c.email}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
