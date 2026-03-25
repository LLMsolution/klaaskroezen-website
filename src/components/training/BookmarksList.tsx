"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

const bookmarksI18n = {
  nl: { title: "Bladwijzers", cancel: "Annuleer", addBookmark: "+ Bladwijzer", notePlaceholder: "Notitie (optioneel)", save: "Opslaan", edit: "Bewerk" },
  en: { title: "Bookmarks", cancel: "Cancel", addBookmark: "+ Bookmark", notePlaceholder: "Note (optional)", save: "Save", edit: "Edit" },
  de: { title: "Lesezeichen", cancel: "Abbrechen", addBookmark: "+ Lesezeichen", notePlaceholder: "Notiz (optional)", save: "Speichern", edit: "Bearbeiten" },
};

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
}

export function BookmarksList({ moduleId, lang }: Props) {
  const bookmarks = useQuery(api.bookmarks.listForModule, { moduleId });
  const createBookmark = useMutation(api.bookmarks.create);
  const updateBookmark = useMutation(api.bookmarks.update);
  const removeBookmark = useMutation(api.bookmarks.remove);

  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");
  const [editId, setEditId] = useState<Id<"bookmarks"> | null>(null);
  const [editNote, setEditNote] = useState("");
  const bi = bookmarksI18n[lang];

  if (!bookmarks || bookmarks.length === 0) {
    if (!showForm) return null;
  }

  function formatTimestamp(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function handleAdd() {
    // Get current video position from Vimeo player
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const iframes = document.querySelectorAll("iframe[src*='vimeo']");
    const iframe = iframes[0] as HTMLIFrameElement | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Player = (window as any).Vimeo?.Player;
    if (!iframe || !Player) return;

    const player = new Player(iframe);
    const currentTime = await player.getCurrentTime();

    await createBookmark({
      moduleId,
      videoTimestamp: Math.round(currentTime),
      note: note.trim() || undefined,
    });
    setNote("");
    setShowForm(false);
  }

  async function handleUpdate(id: Id<"bookmarks">) {
    await updateBookmark({ id, note: editNote.trim() || undefined });
    setEditId(null);
    setEditNote("");
  }

  async function jumpToTimestamp(seconds: number) {
    const iframes = document.querySelectorAll("iframe[src*='vimeo']");
    const iframe = iframes[0] as HTMLIFrameElement | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Player = (window as any).Vimeo?.Player;
    if (!iframe || !Player) return;

    const player = new Player(iframe);
    await player.setCurrentTime(seconds);
    await player.play();
  }

  const sorted = [...(bookmarks ?? [])].sort((a, b) => a.videoTimestamp - b.videoTimestamp);

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          {bi.title}
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[12px] text-copper hover:text-copper-light cursor-pointer"
        >
          {showForm ? bi.cancel : bi.addBookmark}
        </button>
      </div>

      {showForm && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={bi.notePlaceholder}
            className="flex-1 bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
          />
          <button
            onClick={handleAdd}
            className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
          >
            {bi.save}
          </button>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="space-y-1">
          {sorted.map((bm) => (
            <div
              key={bm._id}
              className="flex items-center gap-3 p-2.5 border border-rule rounded-[2px] hover:border-copper/30 transition-colors group"
            >
              <button
                onClick={() => jumpToTimestamp(bm.videoTimestamp)}
                className="text-[13px] font-medium text-copper tabular-nums shrink-0 cursor-pointer"
              >
                {formatTimestamp(bm.videoTimestamp)}
              </button>
              {editId === bm._id ? (
                <form
                  className="flex-1 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(bm._id);
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
                <p className="flex-1 text-[13px] text-ink/60 truncate">
                  {bm.note || "—"}
                </p>
              )}
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button
                  onClick={() => {
                    setEditId(bm._id);
                    setEditNote(bm.note || "");
                  }}
                  className="text-[11px] text-ink/30 hover:text-ink cursor-pointer"
                >
                  {bi.edit}
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
