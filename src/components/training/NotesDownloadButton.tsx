"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  button: string;
  working: string;
  emptyError: string;
  genericError: string;
};

const COPY: Record<Lang, Copy> = {
  nl: {
    eyebrow: "Mijn notities",
    title: "Download al je notities",
    description:
      "Exporteer al je aantekeningen en bladwijzers voor deze training als een PDF-werkdocument.",
    button: "Download notities",
    working: "Bezig met genereren...",
    emptyError: "Je hebt nog geen notities voor deze training.",
    genericError: "Er ging iets mis bij het genereren van de PDF.",
  },
  en: {
    eyebrow: "My notes",
    title: "Download all your notes",
    description:
      "Export all your notes and bookmarks for this training as a PDF study document.",
    button: "Download notes",
    working: "Generating...",
    emptyError: "You don't have any notes for this training yet.",
    genericError: "Something went wrong generating the PDF.",
  },
  de: {
    eyebrow: "Meine Notizen",
    title: "Alle Notizen herunterladen",
    description:
      "Exportieren Sie alle Notizen und Lesezeichen fur dieses Training als PDF-Studiendokument.",
    button: "Notizen herunterladen",
    working: "Wird generiert...",
    emptyError: "Sie haben noch keine Notizen fur dieses Training.",
    genericError: "Beim Generieren des PDFs ist etwas schiefgegangen.",
  },
};

export function NotesDownloadButton({
  trainingId,
  lang,
}: {
  trainingId: Id<"trainings">;
  lang: Lang;
}) {
  const copy = COPY[lang];
  const exportNotes = useAction(api.userNotesPdf.exportTrainingNotes);
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setStatus("working");
    try {
      const { url } = await exportNotes({ trainingId, lang });
      if (url) window.open(url, "_blank");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("EMPTY_NOTES") ? copy.emptyError : copy.genericError);
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="my-6 border border-rule rounded-[2px] p-6">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
        {copy.eyebrow}
      </p>
      <h3 className="font-display text-[20px] font-bold leading-[1.2] tracking-[-0.01em] text-ink mb-2">
        {copy.title}
      </h3>
      <p className="text-[13px] text-ink/60 leading-[1.6] mb-4">{copy.description}</p>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "working"}
        className="inline-block bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "working" ? copy.working : copy.button}
      </button>
      {error && (
        <p className="mt-3 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
