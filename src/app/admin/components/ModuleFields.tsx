"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export function ModuleVideoField({
  currentVideoId,
  onSave,
}: {
  moduleId: Id<"trainingModules">;
  currentVideoId?: string;
  onSave: (videoId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentVideoId ?? "");
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <div>
        <p className="text-[11px] text-ink/50 mb-1">Vimeo Video ID</p>
        <div className="flex items-center gap-3">
          <p className="text-[13px] text-ink">
            {currentVideoId || <span className="text-ink/30">Niet ingesteld</span>}
          </p>
          <button onClick={() => { setValue(currentVideoId ?? ""); setEditing(true); }} className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
            {currentVideoId ? "Wijzig" : "Instellen"}
          </button>
        </div>
        {currentVideoId && (
          <div className="mt-2 relative w-full max-w-[400px] rounded-[2px] overflow-hidden bg-ink/5" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://player.vimeo.com/video/${currentVideoId}?badge=0`}
              allow="fullscreen"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] text-ink/50 mb-1">Vimeo Video ID</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="123456789"
          className="bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] w-48"
        />
        <button
          onClick={async () => {
            setSaving(true);
            await onSave(value.trim());
            setSaving(false);
            setEditing(false);
          }}
          disabled={saving}
          className="text-[12px] text-copper hover:text-copper-light cursor-pointer disabled:opacity-50"
        >
          {saving ? "..." : "Opslaan"}
        </button>
        <button onClick={() => setEditing(false)} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">
          Annuleer
        </button>
      </div>
      <p className="text-[11px] text-ink/30 mt-1">
        Plak alleen het nummer uit de Vimeo URL, bijv. 123456789
      </p>
    </div>
  );
}

export function ModuleWorkbookField({
  hasWorkbook,
  fileName,
  onUpload,
  onRemove,
}: {
  moduleId: Id<"trainingModules">;
  hasWorkbook: boolean;
  fileName?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="text-[11px] text-ink/50 mb-1">Werkboek PDF</p>
      {hasWorkbook ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <span className="text-[13px] text-ink">{fileName || "werkboek.pdf"}</span>
          </div>
          <label className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
            Vervangen
            <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
          </label>
          <button onClick={onRemove} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">
            Verwijderen
          </button>
        </div>
      ) : (
        <label className={`inline-flex items-center gap-2 text-[12px] text-copper hover:text-copper-light cursor-pointer ${uploading ? "opacity-50" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          {uploading ? "Uploaden..." : "PDF uploaden"}
          <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      )}
    </div>
  );
}

export function ModuleAudioField({
  hasAudio,
  fileName,
  onUpload,
  onRemove,
}: {
  moduleId: Id<"trainingModules">;
  hasAudio: boolean;
  fileName?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="text-[11px] text-ink/50 mb-1">Audio (MP3)</p>
      {hasAudio ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="text-[13px] text-ink">{fileName || "audio.mp3"}</span>
          </div>
          <label className="text-[12px] text-copper hover:text-copper-light cursor-pointer">
            Vervangen
            <input type="file" accept=".mp3,audio/mpeg" onChange={handleUpload} className="hidden" />
          </label>
          <button onClick={onRemove} className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer">
            Verwijderen
          </button>
        </div>
      ) : (
        <label className={`inline-flex items-center gap-2 text-[12px] text-copper hover:text-copper-light cursor-pointer ${uploading ? "opacity-50" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          {uploading ? "Uploaden..." : "MP3 uploaden"}
          <input type="file" accept=".mp3,audio/mpeg" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      )}
    </div>
  );
}

export function AddVideoToChapter({
  trainingId,
  parentModuleId,
  chapterIndex,
  nextIndex,
}: {
  trainingId: Id<"trainings">;
  parentModuleId: Id<"trainingModules">;
  chapterIndex: number;
  nextIndex: number;
}) {
  const createModule = useMutation(api.trainingModules.createModule);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="text-[12px] text-copper hover:text-copper-light cursor-pointer"
      >
        + Video toevoegen aan hoofdstuk {chapterIndex}
      </button>
    );
  }

  return (
    <div className="border border-copper/20 rounded-[2px] p-3 bg-copper/[0.02]">
      <p className="text-[11px] text-ink/50 mb-2">Nieuwe video {chapterIndex}.{nextIndex}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel van de video"
          className="flex-1 bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
        />
        <button
          onClick={async () => {
            if (!title.trim()) return;
            setSaving(true);
            const slug = `${chapterIndex}-${nextIndex}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
            await createModule({
              trainingId,
              parentModuleId,
              slug,
              title: { nl: title, en: title, de: "" },
              description: { nl: "", en: "", de: "" },
              discussionEnabled: false,
              quizRequired: false,
              active: true,
            });
            setTitle("");
            setAdding(false);
            setSaving(false);
          }}
          disabled={saving || !title.trim()}
          className="bg-copper text-paper px-4 py-2 text-[12px] font-medium hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50"
        >
          {saving ? "..." : "Toevoegen"}
        </button>
        <button onClick={() => { setAdding(false); setTitle(""); }} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer px-2">
          Annuleer
        </button>
      </div>
    </div>
  );
}
