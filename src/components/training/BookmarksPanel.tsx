"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

const COPY: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    addBookmark: string;
    bookmarkPlaceholder: string;
    save: string;
    cancel: string;
    edit: string;
    noBookmarks: string;
    currentMoment: string;
  }
> = {
  nl: {
    title: "Bladwijzers",
    subtitle: "Markeer een moment in de video en vind het later snel terug.",
    addBookmark: "+ Bladwijzer op huidige tijd",
    bookmarkPlaceholder: "Waarom is dit moment belangrijk? (optioneel)",
    save: "Opslaan",
    cancel: "Annuleer",
    edit: "Bewerk",
    noBookmarks: "Nog geen bladwijzers — klik op de knop om er één toe te voegen op het huidige videomoment.",
    currentMoment: "huidig videomoment",
  },
  en: {
    title: "Bookmarks",
    subtitle: "Mark a moment in the video and jump back later.",
    addBookmark: "+ Bookmark current time",
    bookmarkPlaceholder: "Why does this moment matter? (optional)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    noBookmarks: "No bookmarks yet — click the button to save the current video moment.",
    currentMoment: "current video time",
  },
  de: {
    title: "Lesezeichen",
    subtitle: "Markieren Sie einen Moment im Video und finden Sie ihn spater schnell wieder.",
    addBookmark: "+ Lesezeichen zur aktuellen Zeit",
    bookmarkPlaceholder: "Warum ist dieser Moment wichtig? (optional)",
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    noBookmarks: "Noch keine Lesezeichen — klicken Sie auf die Schaltflache, um den aktuellen Moment zu speichern.",
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
    <div className="my-6 border border-rule rounded-[2px] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
            {copy.title}
          </p>
          <p className="text-[12px] text-ink/50">{copy.subtitle}</p>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="shrink-0 bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer w-full sm:w-auto"
          >
            {copy.addBookmark}
          </button>
        )}
      </div>

      {showForm && pendingTimestamp !== null && (
        <div className="mb-4 p-3 border border-copper/40 rounded-[2px] bg-copper/[0.04]">
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

      {sorted.length === 0 && !showForm && (
        <p className="text-[12px] text-ink/30">{copy.noBookmarks}</p>
      )}

      {sorted.length > 0 && (
        <div className="space-y-1">
          {sorted.map((bm) => (
            <div
              key={bm._id}
              className="flex items-center gap-3 p-2.5 border border-rule rounded-[2px] hover:border-copper/30 transition-colors group"
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
