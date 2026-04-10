"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";
import { TimestampNode } from "./tiptap/TimestampNode";
import { NotesEditorToolbar } from "./NotesEditorToolbar";
import { getVimeoPlayer } from "./tiptap/vimeoPlayer";

type Copy = {
  title: string;
  subtitle: string;
  placeholder: string;
  saving: string;
  saved: string;
  addBookmark: string;
};

const COPY: Record<Lang, Copy> = {
  nl: {
    title: "Mijn notities",
    subtitle: "Alleen jij ziet deze notities. Worden automatisch opgeslagen.",
    placeholder: "Schrijf hier je notities, inzichten of vragen voor deze les...",
    saving: "Opslaan...",
    saved: "Opgeslagen",
    addBookmark: "+ Bladwijzer op huidige tijd",
  },
  en: {
    title: "My notes",
    subtitle: "Only you can see these notes. Auto-saved as you type.",
    placeholder: "Write your notes, insights, or questions for this lesson...",
    saving: "Saving...",
    saved: "Saved",
    addBookmark: "+ Bookmark current time",
  },
  de: {
    title: "Meine Notizen",
    subtitle: "Nur Sie sehen diese Notizen. Wird automatisch gespeichert.",
    placeholder: "Schreiben Sie Ihre Notizen, Erkenntnisse oder Fragen zu dieser Lektion...",
    saving: "Speichern...",
    saved: "Gespeichert",
    addBookmark: "+ Lesezeichen zur aktuellen Zeit",
  },
};

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
}

/**
 * Convert a legacy plain-text note into a Tiptap JSON document.
 * Splits on blank lines → paragraphs, preserves single line breaks as <br>.
 */
function plainTextToJson(text: string): JSONContent {
  if (!text.trim()) return { type: "doc", content: [{ type: "paragraph" }] };
  const paragraphs = text.split(/\n{2,}/).map((para) => {
    const lines = para.split("\n");
    const content: JSONContent[] = [];
    lines.forEach((line, idx) => {
      if (idx > 0) content.push({ type: "hardBreak" });
      if (line) content.push({ type: "text", text: line });
    });
    return { type: "paragraph", content: content.length > 0 ? content : undefined };
  });
  return { type: "doc", content: paragraphs };
}

/** Walk a Tiptap JSON doc and extract plain text for the legacy `content` field. */
function jsonToPlainText(doc: JSONContent | null | undefined): string {
  if (!doc) return "";
  const out: string[] = [];
  function walk(node: JSONContent) {
    if (node.type === "text" && typeof node.text === "string") {
      out.push(node.text);
    } else if (node.type === "timestamp") {
      const s = (node.attrs?.seconds as number) ?? 0;
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      out.push(`[${m}:${String(sec).padStart(2, "0")}]`);
    } else if (node.type === "hardBreak") {
      out.push("\n");
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
    if (node.type === "paragraph" || node.type?.startsWith("heading") || node.type?.endsWith("Item")) {
      out.push("\n");
    }
  }
  walk(doc);
  return out.join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function NotesEditor({ moduleId, lang }: Props) {
  const note = useQuery(api.userNotes.getMyNote, { moduleId });
  const saveNote = useMutation(api.userNotes.saveNote);
  const copy = COPY[lang];

  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoaded = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      TimestampNode,
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap-notes w-full min-h-[160px] bg-transparent text-[14px] text-ink leading-[1.6] focus:outline-none max-w-none",
        "data-placeholder": copy.placeholder,
      },
    },
    content: { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!hasLoaded.current) return;
      setStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const json = editor.getJSON();
        const plain = jsonToPlainText(json);
        await saveNote({ moduleId, content: plain, contentJson: json });
        setStatus("saved");
      }, 1500);
    },
  });

  // Hydrate once the note query resolves.
  useEffect(() => {
    if (!editor || note === undefined || hasLoaded.current) return;
    const json = (note?.contentJson as JSONContent | null | undefined) ?? null;
    if (json && typeof json === "object") {
      editor.commands.setContent(json, { emitUpdate: false });
    } else if (note?.content) {
      editor.commands.setContent(plainTextToJson(note.content), { emitUpdate: false });
    }
    hasLoaded.current = true;
  }, [editor, note]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function handleBookmark() {
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
    <>
      {/* Prominent bookmark action — lives directly below the video, outside
          the notes card. Inserts a [m:ss] chip at the editor cursor. */}
      <button
        type="button"
        onClick={handleBookmark}
        disabled={!editor}
        className="mt-4 inline-flex items-center gap-2 bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50"
      >
        {copy.addBookmark}
      </button>

      <div className="my-6 notes-card-border p-5 sm:p-6">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
              {copy.title}
            </p>
            <p className="text-[12px] text-ink/50">{copy.subtitle}</p>
          </div>
          <div className="text-[11px] text-ink/40 tabular-nums min-w-[80px] text-right shrink-0">
            {status === "saving" && copy.saving}
            {status === "saved" && <span className="text-green-600">{copy.saved}</span>}
          </div>
        </div>
        <NotesEditorToolbar editor={editor} lang={lang} />
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
