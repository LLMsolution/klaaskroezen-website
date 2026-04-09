"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

const COPY: Record<Lang, { title: string; subtitle: string; placeholder: string; saving: string; saved: string }> = {
  nl: {
    title: "Mijn notities",
    subtitle: "Alleen jij ziet deze notitie. Wordt automatisch opgeslagen.",
    placeholder: "Schrijf hier je notities, inzichten of vragen voor deze les…",
    saving: "Opslaan…",
    saved: "Opgeslagen",
  },
  en: {
    title: "My notes",
    subtitle: "Only you can see this note. Auto-saved as you type.",
    placeholder: "Write your notes, insights, or questions for this lesson…",
    saving: "Saving…",
    saved: "Saved",
  },
  de: {
    title: "Meine Notizen",
    subtitle: "Nur Sie sehen diese Notiz. Wird automatisch gespeichert.",
    placeholder: "Schreiben Sie Ihre Notizen, Erkenntnisse oder Fragen zu dieser Lektion…",
    saving: "Speichern…",
    saved: "Gespeichert",
  },
};

interface Props {
  moduleId: Id<"trainingModules">;
  lang: Lang;
}

export function NotesPanel({ moduleId, lang }: Props) {
  const note = useQuery(api.userNotes.getMyNote, { moduleId });
  const saveNote = useMutation(api.userNotes.saveNote);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoaded = useRef(false);
  const copy = COPY[lang];

  // Hydrate once when the server note arrives.
  useEffect(() => {
    if (note !== undefined && !hasLoaded.current) {
      setValue(note?.content ?? "");
      hasLoaded.current = true;
    }
  }, [note]);

  function handleChange(next: string) {
    setValue(next);
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveNote({ moduleId, content: next });
      setStatus("saved");
    }, 700);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

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
          {status === "saving" && copy.saving}
          {status === "saved" && (
            <span className="text-green-600">✓ {copy.saved}</span>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={copy.placeholder}
        rows={6}
        className="w-full bg-transparent border border-rule px-4 py-3 text-[14px] text-ink leading-[1.6] focus:border-copper focus:outline-none rounded-[2px] resize-y"
      />
    </div>
  );
}
