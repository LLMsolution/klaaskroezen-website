"use client";

import type { Editor } from "@tiptap/react";
import type { Lang } from "@/lib/i18n";
import { getVimeoPlayer } from "./tiptap/vimeoPlayer";

type Copy = {
  title: string;
  bullets: string;
  numbers: string;
  bookmark: string;
};

const COPY: Record<Lang, Copy> = {
  nl: { title: "Titel", bullets: "Lijst", numbers: "Nummers", bookmark: "Bladwijzer" },
  en: { title: "Title", bullets: "Bullets", numbers: "Numbers", bookmark: "Bookmark" },
  de: { title: "Titel", bullets: "Liste", numbers: "Nummern", bookmark: "Lesezeichen" },
};

type BtnProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
};

function ToolbarButton({ label, active, onClick, disabled }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] uppercase rounded-[2px] border transition-colors ${
        active
          ? "bg-copper text-paper border-copper"
          : "bg-transparent text-ink/60 border-rule hover:border-copper/60 hover:text-ink"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

export function NotesEditorToolbar({ editor, lang }: { editor: Editor | null; lang: Lang }) {
  if (!editor) return null;
  const copy = COPY[lang];

  async function insertTimestamp() {
    if (!editor) return;
    const player = await getVimeoPlayer();
    if (!player) return;
    try {
      const t = await player.getCurrentTime();
      editor
        .chain()
        .focus()
        .insertContent({ type: "timestamp", attrs: { seconds: Math.round(t) } })
        .insertContent(" ")
        .run();
    } catch {
      /* player not ready */
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      <ToolbarButton
        label={copy.title}
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label={copy.bullets}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label={copy.numbers}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label={`+ ${copy.bookmark}`}
        active={false}
        onClick={insertTimestamp}
      />
    </div>
  );
}
