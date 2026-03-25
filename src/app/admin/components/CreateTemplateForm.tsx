"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export function CreateTemplateForm({ onDone }: { onDone: () => void }) {
  const createTemplate = useMutation(api.emailAdmin.createTemplate);
  const [key, setKey] = useState("");
  const [seqType, setSeqType] = useState("training");
  const [stepIndex, setStepIndex] = useState("0");
  const [subjectNl, setSubjectNl] = useState("");
  const [subjectEn, setSubjectEn] = useState("");
  const [subjectDe, setSubjectDe] = useState("");
  const [delayDays, setDelayDays] = useState("2");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
  const inputClass = "w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createTemplate({
        templateKey: key,
        sequenceType: seqType,
        stepIndex: Number(stepIndex),
        subjectNl,
        subjectEn: subjectEn || subjectNl,
        subjectDe: subjectDe || undefined,
        htmlNl: "<p>Template inhoud hier.</p>",
        htmlEn: "<p>Template content here.</p>",
        htmlDe: subjectDe ? "<p>Template-Inhalt hier.</p>" : undefined,
        delayDays: Number(delayDays),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij aanmaken.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-copper/30 rounded-[2px] p-5">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">Nieuwe template</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Template key</label>
            <input value={key} onChange={(e) => setKey(e.target.value)} required placeholder="training-extra-tip" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sequence type</label>
            <select value={seqType} onChange={(e) => setSeqType(e.target.value)} className={inputClass}>
              <option value="training">Training</option>
              <option value="book">Boek</option>
              <option value="marketing">Marketing</option>
              <option value="transactional">Transactioneel</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Stap index</label>
            <input type="number" value={stepIndex} onChange={(e) => setStepIndex(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Vertraging (dagen)</label>
            <input type="number" value={delayDays} onChange={(e) => setDelayDays(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Onderwerp (NL)</label>
          <input value={subjectNl} onChange={(e) => setSubjectNl(e.target.value)} required placeholder="Welkom bij je training" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Subject (EN)</label>
          <input value={subjectEn} onChange={(e) => setSubjectEn(e.target.value)} placeholder="Welcome to your training" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Betreff (DE)</label>
          <input value={subjectDe} onChange={(e) => setSubjectDe(e.target.value)} placeholder="Willkommen bei Ihrem Training" className={inputClass} />
        </div>
        {error && <p className="text-[12px] text-red-500">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40">
            {saving ? "Aanmaken..." : "Template aanmaken"}
          </button>
          <button type="button" onClick={onDone} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
