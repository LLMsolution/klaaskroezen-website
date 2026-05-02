"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading, EmptyState } from "./shared";
import { TranslationTester } from "./TranslationTester";

type Mode = "preserve" | "translate";

type Entry = {
  _id: Id<"translationGlossary">;
  termNl: string;
  mode: Mode;
  en?: string;
  de?: string;
  caseSensitive: boolean;
  notes?: string;
};

const EMPTY_DRAFT: Omit<Entry, "_id"> = {
  termNl: "",
  mode: "preserve",
  en: "",
  de: "",
  caseSensitive: false,
  notes: "",
};

export function TranslationGlossaryTab() {
  const entries = useQuery(api.translationGlossary.listAll);
  const createEntry = useMutation(api.translationGlossary.createEntry);
  const updateEntry = useMutation(api.translationGlossary.updateEntry);
  const deleteEntry = useMutation(api.translationGlossary.deleteEntry);

  const [editingId, setEditingId] = useState<Id<"translationGlossary"> | "new" | null>(null);
  const [draft, setDraft] = useState<Omit<Entry, "_id">>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (entries === undefined) return <Loading />;

  function startNew() {
    setEditingId("new");
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  function startEdit(entry: Entry) {
    setEditingId(entry._id);
    setDraft({
      termNl: entry.termNl,
      mode: entry.mode,
      en: entry.en ?? "",
      de: entry.de ?? "",
      caseSensitive: entry.caseSensitive,
      notes: entry.notes ?? "",
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  async function save() {
    setError(null);
    if (!draft.termNl.trim()) {
      setError("Vul een Nederlandse term in.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        termNl: draft.termNl,
        mode: draft.mode,
        en: draft.mode === "translate" ? draft.en?.trim() || undefined : undefined,
        de: draft.mode === "translate" ? draft.de?.trim() || undefined : undefined,
        caseSensitive: draft.caseSensitive,
        notes: draft.notes?.trim() || undefined,
      };
      if (editingId === "new") {
        await createEntry(payload);
      } else if (editingId) {
        await updateEntry({ id: editingId, ...payload });
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: Id<"translationGlossary">) {
    if (!confirm("Term verwijderen uit het woordenboek?")) return;
    await deleteEntry({ id });
    if (editingId === id) cancelEdit();
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[14px] text-ink/60 max-w-[640px]">
          Het AI-vertaalmodel ziet dit woordenboek bij elke vertaling. Termen op
          &quot;Niet vertalen&quot; blijven in het Nederlands staan. Bij &quot;Specifieke
          vertaling&quot; wordt altijd jouw EN/DE-waarde gebruikt.
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[20px] font-bold">Termen ({entries.length})</h2>
          {editingId !== "new" && (
            <button
              onClick={startNew}
              className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer"
            >
              Toevoegen
            </button>
          )}
        </div>

        {editingId === "new" && (
          <EntryForm
            draft={draft}
            setDraft={setDraft}
            onSave={save}
            onCancel={cancelEdit}
            saving={saving}
            error={error}
          />
        )}

        {entries.length === 0 ? (
          <EmptyState text="Nog geen termen. Voeg er één toe — bijvoorbeeld &quot;Klaas Kroezen&quot; (niet vertalen) of een specifieke EN/DE-term." />
        ) : (
          <div className="space-y-2">
            {entries.map((e) =>
              editingId === e._id ? (
                <EntryForm
                  key={e._id}
                  draft={draft}
                  setDraft={setDraft}
                  onSave={save}
                  onCancel={cancelEdit}
                  saving={saving}
                  error={error}
                />
              ) : (
                <EntryRow key={e._id} entry={e} onEdit={() => startEdit(e)} onDelete={() => remove(e._id)} />
              ),
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-[20px] font-bold mb-3">Live tester</h2>
        <p className="text-[13px] text-ink/50 mb-4 max-w-[640px]">
          Plak een Nederlandse zin en zie hoe het model met de huidige glossary vertaalt.
        </p>
        <TranslationTester />
      </section>
    </div>
  );
}

function EntryRow({ entry, onEdit, onDelete }: { entry: Entry; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="border border-rule rounded-[2px] p-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[15px] font-medium text-ink">{entry.termNl}</p>
          <span
            className={`text-[10px] font-medium tracking-[0.15em] uppercase px-2 py-0.5 rounded-[2px] ${
              entry.mode === "preserve" ? "bg-warm text-ink/60" : "bg-copper/10 text-copper"
            }`}
          >
            {entry.mode === "preserve" ? "Niet vertalen" : "Specifieke vertaling"}
          </span>
          {entry.caseSensitive && (
            <span className="text-[10px] text-ink/40 tracking-[0.15em] uppercase">hoofdlettergevoelig</span>
          )}
        </div>
        {entry.mode === "translate" && (
          <p className="text-[13px] text-ink/55 mt-1">
            EN: <span className="text-ink/80">{entry.en || "—"}</span>
            <span className="mx-3 text-ink/20">·</span>
            DE: <span className="text-ink/80">{entry.de || "—"}</span>
          </p>
        )}
        {entry.notes && <p className="text-[12px] text-ink/40 mt-1">{entry.notes}</p>}
      </div>
      <div className="flex gap-3 text-[12px] shrink-0">
        <button onClick={onEdit} className="text-copper hover:text-copper-light cursor-pointer">
          Bewerken
        </button>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 cursor-pointer">
          Verwijderen
        </button>
      </div>
    </div>
  );
}

function EntryForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  error,
}: {
  draft: Omit<Entry, "_id">;
  setDraft: (d: Omit<Entry, "_id">) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="border border-copper/40 bg-copper/[0.04] rounded-[2px] p-5 space-y-4">
      <div>
        <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-1.5">
          Nederlandse term
        </label>
        <input
          type="text"
          value={draft.termNl}
          onChange={(e) => setDraft({ ...draft, termNl: e.target.value })}
          placeholder="Bijv. Sales Excellence Training"
          className="w-full bg-paper border border-rule px-3 py-2 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
          autoFocus
        />
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-2">Modus</p>
        <div className="flex flex-wrap gap-3">
          <ModeRadio
            label="Niet vertalen"
            checked={draft.mode === "preserve"}
            onChange={() => setDraft({ ...draft, mode: "preserve" })}
          />
          <ModeRadio
            label="Specifieke vertaling"
            checked={draft.mode === "translate"}
            onChange={() => setDraft({ ...draft, mode: "translate" })}
          />
        </div>
      </div>

      {draft.mode === "translate" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-1.5">
              English
            </label>
            <input
              type="text"
              value={draft.en ?? ""}
              onChange={(e) => setDraft({ ...draft, en: e.target.value })}
              placeholder="Bijv. relaxed"
              className="w-full bg-paper border border-rule px-3 py-2 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-1.5">
              Deutsch
            </label>
            <input
              type="text"
              value={draft.de ?? ""}
              onChange={(e) => setDraft({ ...draft, de: e.target.value })}
              placeholder="Bijv. entspannt"
              className="w-full bg-paper border border-rule px-3 py-2 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="caseSensitive"
          type="checkbox"
          checked={draft.caseSensitive}
          onChange={(e) => setDraft({ ...draft, caseSensitive: e.target.checked })}
          className="cursor-pointer"
        />
        <label htmlFor="caseSensitive" className="text-[13px] text-ink/70 cursor-pointer">
          Hoofdlettergevoelig (alleen bij namen / productnamen aanzetten)
        </label>
      </div>

      <div>
        <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-ink/60 mb-1.5">
          Notitie (optioneel)
        </label>
        <textarea
          value={draft.notes ?? ""}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          rows={2}
          className="w-full bg-paper border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
        />
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="border border-rule px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] hover:border-ink/40 transition-colors cursor-pointer"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}

function ModeRadio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-2 px-4 py-2 text-[13px] rounded-[2px] border transition-colors cursor-pointer ${
        checked ? "bg-copper text-paper border-copper" : "bg-transparent text-ink/60 border-rule hover:border-copper/40"
      }`}
    >
      <span
        className={`w-3 h-3 rounded-full border ${checked ? "bg-paper border-paper" : "border-ink/30"}`}
      />
      {label}
    </button>
  );
}
