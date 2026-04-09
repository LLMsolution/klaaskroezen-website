"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

const COPY: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    placeholder: string;
    saving: string;
    saved: string;
    bookmarks: string;
    addBookmark: string;
    bookmarkPlaceholder: string;
    save: string;
    cancel: string;
    edit: string;
    noBookmarks: string;
  }
> = {
  nl: {
    title: "Mijn notities",
    subtitle: "Alleen jij ziet deze notities en bladwijzers. Worden automatisch opgeslagen.",
    placeholder: "Schrijf hier je notities, inzichten of vragen voor deze les…",
    saving: "Opslaan…",
    saved: "Opgeslagen",
    bookmarks: "Bladwijzers",
    addBookmark: "+ Bladwijzer op huidige tijd",
    bookmarkPlaceholder: "Waarom is dit moment belangrijk? (optioneel)",
    save: "Opslaan",
    cancel: "Annuleer",
    edit: "Bewerk",
    noBookmarks: "Nog geen bladwijzers — klik hierboven om er één toe te voegen op het huidige videomoment.",
  },
  en: {
    title: "My notes",
    subtitle: "Only you can see these notes and bookmarks. Auto-saved as you type.",
    placeholder: "Write your notes, insights, or questions for this lesson…",
    saving: "Saving…",
    saved: "Saved",
    bookmarks: "Bookmarks",
    addBookmark: "+ Bookmark current time",
    bookmarkPlaceholder: "Why does this moment matter? (optional)",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    noBookmarks: "No bookmarks yet — click above to save the current video moment.",
  },
  de: {
    title: "Meine Notizen",
    subtitle: "Nur Sie sehen diese Notizen und Lesezeichen. Wird automatisch gespeichert.",
    placeholder: "Schreiben Sie Ihre Notizen, Erkenntnisse oder Fragen zu dieser Lektion…",
    saving: "Speichern…",
    saved: "Gespeichert",
    bookmarks: "Lesezeichen",
    addBookmark: "+ Lesezeichen zur aktuellen Zeit",
    bookmarkPlaceholder: "Warum ist dieser Moment wichtig? (optional)",
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    noBookmarks: "Noch keine Lesezeichen — klicken Sie oben, um den aktuellen Moment zu speichern.",
  },
};

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
  /** When false, the bookmarks section is hidden (no video → no timestamps to bookmark). */
  hasVideo?: boolean;
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Access the first on-page Vimeo iframe as a Vimeo Player instance. */
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

export function NotesPanel({ moduleId, lang, hasVideo = true }: Props) {
  const note = useQuery(api.userNotes.getMyNote, { moduleId });
  const saveNote = useMutation(api.userNotes.saveNote);
  const bookmarks = useQuery(
    api.bookmarks.listForModule,
    hasVideo ? { moduleId } : "skip",
  );
  const createBookmark = useMutation(api.bookmarks.create);
  const updateBookmark = useMutation(api.bookmarks.update);
  const removeBookmark = useMutation(api.bookmarks.remove);

  const [noteValue, setNoteValue] = useState("");
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedNote = useRef(false);

  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [bookmarkNote, setBookmarkNote] = useState("");
  const [editId, setEditId] = useState<Id<"bookmarks"> | null>(null);
  const [editNote, setEditNote] = useState("");
  const [savingBookmark, setSavingBookmark] = useState(false);

  const copy = COPY[lang];

  // Hydrate note from server once.
  useEffect(() => {
    if (note !== undefined && !hasLoadedNote.current) {
      setNoteValue(note?.content ?? "");
      hasLoadedNote.current = true;
    }
  }, [note]);

  function handleNoteChange(next: string) {
    setNoteValue(next);
    setNoteStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveNote({ moduleId, content: next });
      setNoteStatus("saved");
    }, 700);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function handleAddBookmark() {
    const player = await getVimeoPlayer();
    if (!player) return;
    try {
      const t = await player.getCurrentTime();
      setPendingTimestamp(Math.round(t));
      setBookmarkNote("");
      setShowBookmarkForm(true);
    } catch {
      // player not ready
    }
  }

  async function confirmBookmark() {
    if (pendingTimestamp === null) return;
    setSavingBookmark(true);
    try {
      await createBookmark({
        moduleId,
        videoTimestamp: pendingTimestamp,
        note: bookmarkNote.trim() || undefined,
      });
      setShowBookmarkForm(false);
      setPendingTimestamp(null);
      setBookmarkNote("");
    } finally {
      setSavingBookmark(false);
    }
  }

  async function jumpTo(seconds: number) {
    const player = await getVimeoPlayer();
    if (!player) return;
    try {
      await player.setCurrentTime(seconds);
      await player.play();
    } catch {
      // ignore
    }
  }

  async function handleUpdateBookmark(id: Id<"bookmarks">) {
    await updateBookmark({ id, note: editNote.trim() || undefined });
    setEditId(null);
    setEditNote("");
  }

  const sortedBookmarks = [...(bookmarks ?? [])].sort(
    (a, b) => a.videoTimestamp - b.videoTimestamp,
  );

  return (
    <div className="my-8 border border-rule rounded-[2px] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
            {copy.title}
          </p>
          <p className="text-[12px] text-ink/40">{copy.subtitle}</p>
        </div>
        <div className="text-[11px] text-ink/40 tabular-nums min-w-[80px] text-right">
          {noteStatus === "saving" && copy.saving}
          {noteStatus === "saved" && (
            <span className="text-green-600">✓ {copy.saved}</span>
          )}
        </div>
      </div>

      {/* Bookmarks section (above notes) — only when the lesson has a video */}
      {hasVideo && (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
            {copy.bookmarks}
          </p>
          {!showBookmarkForm && (
            <button
              onClick={handleAddBookmark}
              className="text-[12px] text-copper hover:text-copper-light cursor-pointer font-medium"
            >
              {copy.addBookmark}
            </button>
          )}
        </div>

        {showBookmarkForm && pendingTimestamp !== null && (
          <div className="mb-3 p-3 border border-copper/40 rounded-[2px] bg-copper/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-medium text-copper tabular-nums">
                {formatTimestamp(pendingTimestamp)}
              </span>
              <span className="text-[11px] text-ink/40">huidig videomoment</span>
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
                disabled={savingBookmark}
                className="bg-copper text-paper px-4 py-1.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 cursor-pointer"
              >
                {savingBookmark ? "…" : copy.save}
              </button>
              <button
                onClick={() => {
                  setShowBookmarkForm(false);
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

        {sortedBookmarks.length === 0 && !showBookmarkForm && (
          <p className="text-[12px] text-ink/30">{copy.noBookmarks}</p>
        )}

        {sortedBookmarks.length > 0 && (
          <div className="space-y-1">
            {sortedBookmarks.map((bm) => (
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
                <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity shrink-0">
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
      )}

      {/* Notes textarea (below bookmarks, or alone when no video) */}
      <div className={hasVideo ? "pt-4 border-t border-rule/60" : ""}>
        <textarea
          value={noteValue}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder={copy.placeholder}
          rows={6}
          className="w-full bg-transparent border border-rule px-4 py-3 text-[14px] text-ink leading-[1.6] focus:border-copper focus:outline-none rounded-[2px] resize-y"
        />
      </div>
    </div>
  );
}
