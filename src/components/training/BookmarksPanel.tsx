"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

const COPY: Record<
  Lang,
  {
    addBookmark: string;
    bookmarkPlaceholder: string;
    save: string;
    cancel: string;
    edit: string;
    currentMoment: string;
  }
> = {
  nl: {
    addBookmark: "+ Bladwijzer op huidige tijd",
    bookmarkPlaceholder: "Waarom is dit moment belangrijk? (optioneel)",
    save: "Opslaan",
    cancel: "Annuleer",
    edit: "Bewerk",
    currentMoment: "huidig videomoment",
  },
  en: {
    addBookmark: "+ Bookmark current time",
    bookmarkPlaceholder: "Why does this moment matter? (optional)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    currentMoment: "current video time",
  },
  de: {
    addBookmark: "+ Lesezeichen zur aktuellen Zeit",
    bookmarkPlaceholder: "Warum ist dieser Moment wichtig? (optional)",
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    currentMoment: "aktueller Videozeitpunkt",
  },
};

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function getVimeoPlayer(): Promise<{
  getCurrentTime: () => Promise<number>;
  setCurrentTime: (sec: number) => Promise<void>;
  play: () => Promise<void>;
} | null> {
  const iframes = document.querySelectorAll("iframe[src*='vimeo']");
  const iframe = iframes[0] as HTMLIFrameElement | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Player = (window as { Vimeo?: { Player: any } }).Vimeo?.Player;
  if (!iframe || !Player) return null;
  return new Player(iframe);
}

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
}

export function BookmarksPanel({ moduleId, lang }: Props) {
  const bookmarks = useQuery(api.bookmarks.listForModule, { moduleId });
  const createBookmark = useMutation(api.bookmarks.create);
  const updateBookmark = useMutation(api.bookmarks.update);
  const removeBookmark = useMutation(api.bookmarks.remove);

  const [showForm, setShowForm] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<Id<"bookmarks"> | null>(null);
  const [editNote, setEditNote] = useState("");

  const copy = COPY[lang];

  async function handleAddClick() {
    const player = await getVimeoPlayer();
    if (!player) return;
    try {
      const t = await player.getCurrentTime();
      setPendingTimestamp(Math.round(t));
      setBookmarkNote("");
      setShowForm(true);
    } catch {
      /* player not ready */
    }
  }

  async function confirmBookmark() {
    if (pendingTimestamp === null) return;
    setSaving(true);
    try {
      await createBookmark({
        moduleId,
        videoTimestamp: pendingTimestamp,
        note: bookmarkNote.trim() || undefined,
      });
      setShowForm(false);
      setPendingTimestamp(null);
      setBookmarkNote("");
    } finally {
      setSaving(false);
    }
  }

  async function jumpTo(seconds: number) {
    const player = await getVimeoPlayer();
    if (!player) return;
    try {
      await player.setCurrentTime(seconds);
      await player.play();
    } catch {
      /* ignore */
    }
  }

  async function handleUpdateBookmark(id: Id<"bookmarks">) {
    await updateBookmark({ id, note: editNote.trim() || undefined });
    setEditId(null);
    setEditNote("");
  }

  const sorted = [...(bookmarks ?? [])].sort((a, b) => a.videoTimestamp - b.videoTimestamp);

  return (
    <div className="my-6 space-y-3">
      {/* Standalone copper button — no card chrome */}
      {!showForm && (
        <button
          onClick={handleAddClick}
          className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
        >
          {copy.addBookmark}
        </button>
      )}

      {showForm && pendingTimestamp !== null && (
        <div className="p-4 border border-copper/40 rounded-[2px] bg-copper/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-medium text-copper tabular-nums">
              {formatTimestamp(pendingTimestamp)}
            </span>
            <span className="text-[11px] text-ink/40">{copy.currentMoment}</span>
          </div>
          <input
            type="text"
            value={bookmarkNote}
            onChange={(e) => setBookmarkNote(e.target.value)}
            placeholder={copy.bookmarkPlaceholder}
            className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] mb-2"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") confirmBookmark(); }}
          />
          <div className="flex gap-2">
            <button
              onClick={confirmBookmark}
              disabled={saving}
              className="bg-copper text-paper px-4 py-1.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
            >
              {saving ? "…" : copy.save}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setPendingTimestamp(null);
                setBookmarkNote("");
              }}
              className="text-[12px] text-ink/40 hover:text-ink cursor-pointer px-3 py-1.5"
            >
              {copy.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Bookmark list — only when there are bookmarks */}
      {sorted.length > 0 && (
        <div className="space-y-1">
          {sorted.map((bm) => (
            <div
              key={bm._id}
              className="flex items-center gap-3 px-3 py-2 border border-rule/70 rounded-[2px] hover:border-copper/40 transition-colors group"
            >
              <button
                onClick={() => jumpTo(bm.videoTimestamp)}
                className="text-[13px] font-medium text-copper tabular-nums shrink-0 cursor-pointer hover:text-copper-light"
                title="Spring naar dit moment"
              >
                {formatTimestamp(bm.videoTimestamp)}
              </button>
              {editId === bm._id ? (
                <form
                  className="flex-1 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateBookmark(bm._id);
                  }}
                >
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="flex-1 bg-transparent border border-rule px-2 py-1 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
                    autoFocus
                  />
                  <button type="submit" className="text-[11px] text-copper cursor-pointer">
                    OK
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => jumpTo(bm.videoTimestamp)}
                  className="flex-1 text-left text-[13px] text-ink/60 truncate cursor-pointer"
                >
                  {bm.note || "—"}
                </button>
              )}
              <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-2 transition-opacity shrink-0">
                <button
                  onClick={() => {
                    setEditId(bm._id);
                    setEditNote(bm.note || "");
                  }}
                  className="text-[11px] text-ink/30 hover:text-ink cursor-pointer"
                >
                  {copy.edit}
                </button>
                <button
                  onClick={() => removeBookmark({ id: bm._id })}
                  className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
