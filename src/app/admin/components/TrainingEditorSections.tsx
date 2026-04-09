"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AdminImageUpload } from "./AdminImageUpload";

/* ─── Section wrapper ─── */

export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 border border-rule rounded-[2px] p-5">
      <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2">{title}</h3>
      {subtitle && <p className="text-[12px] text-ink/40 mb-3">{subtitle}</p>}
      {children}
    </div>
  );
}

/* ─── Editable inline field ─── */

export function EditableField({ label, value, onSave, multiline }: {
  label: string; value: string; onSave: (v: string) => Promise<void>; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const cls = "w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  if (!editing) {
    return (
      <div>
        <p className="text-[11px] text-ink/50 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-ink flex-1">{value || <span className="text-ink/25">Niet ingesteld</span>}</p>
          <button onClick={() => { setVal(value); setEditing(true); }} className="text-[11px] text-copper hover:text-copper-light cursor-pointer">Wijzig</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] text-ink/50 mb-1">{label}</p>
      {multiline ? <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={2} className={cls} /> : <input value={val} onChange={(e) => setVal(e.target.value)} className={cls} />}
      <div className="flex gap-2 mt-1">
        <button onClick={async () => { await onSave(val); setEditing(false); }} className="text-[11px] text-copper cursor-pointer">Opslaan</button>
        <button onClick={() => setEditing(false)} className="text-[11px] text-ink/40 cursor-pointer">Annuleer</button>
      </div>
    </div>
  );
}

/* ─── Inline add form ─── */

export function InlineForm({ placeholder, value, onChange, saving, onSave, onCancel }: {
  placeholder: string; value: string; onChange: (v: string) => void; saving: boolean; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 mb-3">
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
        onKeyDown={(e) => { if (e.key === "Enter") onSave(); }} autoFocus />
      <button onClick={onSave} disabled={saving || !value.trim()} className="bg-copper text-paper px-4 py-2 text-[12px] font-medium hover:bg-copper-light rounded-[2px] cursor-pointer disabled:opacity-50">
        {saving ? "..." : "Toevoegen"}
      </button>
      <button onClick={onCancel} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">Annuleer</button>
    </div>
  );
}

/* ─── Werkboek section (per language) ─── */

type WorkbookLang = "nl" | "en" | "de";
type WorkbookData = { storageId: string; fileName: string; title?: string; description?: string } | undefined;

export function WorkbookSection({ trainingId }: { trainingId: Id<"trainings"> }) {
  const trainingData = useQuery(api.trainings.listAll);
  const [activeLang, setActiveLang] = useState<WorkbookLang>("nl");

  const t = trainingData?.find((tr) => tr._id === trainingId);
  const tRec = t as Record<string, unknown> | undefined;

  const workbookByLang: Record<WorkbookLang, WorkbookData> = {
    nl: tRec?.workbookNl as WorkbookData,
    en: tRec?.workbookEn as WorkbookData,
    de: tRec?.workbookDe as WorkbookData,
  };

  return (
    <Section title="Werkboek (per taal)" subtitle="Upload per taal een eigen PDF werkboek met titel en beschrijving. De afbeelding wordt gedeeld over alle talen.">
      {/* Language tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["nl", "en", "de"] as const).map((lang) => {
          const hasFile = !!workbookByLang[lang];
          return (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`text-[11px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors flex items-center gap-2 ${
                activeLang === lang
                  ? "bg-copper text-paper"
                  : "border border-rule text-ink/50 hover:text-ink"
              }`}
            >
              {lang.toUpperCase()}
              {hasFile && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          );
        })}
      </div>

      <WorkbookLangPanel
        key={activeLang}
        trainingId={trainingId}
        lang={activeLang}
        existing={workbookByLang[activeLang]}
      />

      <WorkbookImageSection trainingId={trainingId} />
    </Section>
  );
}

function WorkbookLangPanel({
  trainingId,
  lang,
  existing,
}: {
  trainingId: Id<"trainings">;
  lang: WorkbookLang;
  existing: WorkbookData;
}) {
  const generateUploadUrl = useMutation(api.trainings.generateUploadUrl);
  const saveWorkbook = useMutation(api.trainings.saveWorkbook);
  const removeWorkbook = useMutation(api.trainings.removeWorkbook);
  const updateMeta = useMutation(api.trainings.updateWorkbookMeta);
  const [uploading, setUploading] = useState(false);

  const wbTitle = existing?.title ?? "";
  const wbDesc = existing?.description ?? "";
  const wbFile = existing?.fileName ?? "";

  async function handleUploadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await saveWorkbook({
        trainingId,
        lang,
        storageId,
        fileName: file.name,
        title: wbTitle || file.name,
        description: wbDesc,
      });
    } finally {
      setUploading(false);
    }
  }

  if (!existing) {
    return (
      <label className={`inline-block bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer ${uploading ? "opacity-50" : ""}`}>
        {uploading ? "Uploaden..." : `PDF uploaden (${lang.toUpperCase()})`}
        <input type="file" accept=".pdf" onChange={handleUploadPdf} disabled={uploading} className="hidden" />
      </label>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
          </svg>
          <span className="text-[13px] text-ink">{wbFile}</span>
        </div>
        <div className="flex gap-3">
          <label className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
            Vervangen <input type="file" accept=".pdf" onChange={handleUploadPdf} className="hidden" />
          </label>
          <button onClick={() => removeWorkbook({ trainingId, lang })} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">
            Verwijderen
          </button>
        </div>
      </div>
      <EditableField
        label={`Titel (${lang.toUpperCase()})`}
        value={wbTitle}
        onSave={async (v) => { await updateMeta({ trainingId, lang, title: v, description: wbDesc }); }}
      />
      <EditableField
        label={`Beschrijving (${lang.toUpperCase()})`}
        value={wbDesc}
        onSave={async (v) => { await updateMeta({ trainingId, lang, title: wbTitle, description: v }); }}
        multiline
      />
    </div>
  );
}

function WorkbookImageSection({ trainingId }: { trainingId: Id<"trainings"> }) {
  const saveImage = useMutation(api.trainings.saveWorkbookImage);
  return (
    <div className="mt-4 pt-4 border-t border-rule/60">
      <p className="text-[11px] text-ink/50 mb-2">Afbeelding (gedeeld over alle talen)</p>
      <AdminImageUpload
        onUploaded={async (storageId) => { await saveImage({ trainingId, storageId }); }}
        alt="Werkboek cover"
      />
    </div>
  );
}

/* ─── Cover image section (audiobooks) ─── */

export function CoverImageSection({ trainingId }: { trainingId: Id<"trainings"> }) {
  const trainingData = useQuery(api.trainings.listAll);
  const genUrl = useMutation(api.trainings.generateUploadUrl);
  const saveCover = useMutation(api.trainings.saveCoverImage);
  const removeCover = useMutation(api.trainings.removeCoverImage);
  const [uploading, setUploading] = useState(false);

  const t = trainingData?.find((tr) => tr._id === trainingId);
  const coverStorageId = (t as Record<string, unknown> | undefined)?.coverImageStorageId as Id<"_storage"> | undefined;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await genUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await saveCover({ trainingId, storageId });
    } finally { setUploading(false); }
  }

  return (
    <Section title="Cover afbeelding" subtitle="Albumhoes van het luisterboek.">
      <div className="flex items-center gap-4">
        <AdminImageUpload
          currentUrl={coverStorageId ? `convex:${coverStorageId}` : undefined}
          onUploaded={async (storageId) => { await saveCover({ trainingId, storageId }); }}
          onRemoved={() => removeCover({ trainingId })}
          alt="Luisterboek cover"
        />
        {uploading && <span className="text-[12px] text-ink/40">Uploaden...</span>}
        {!coverStorageId && (
          <label className={`inline-block bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light rounded-[2px] cursor-pointer ${uploading ? "opacity-50" : ""}`}>
            {uploading ? "Uploaden..." : "Afbeelding uploaden"}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        )}
      </div>
    </Section>
  );
}

