"use client";

import type { Lang } from "@/lib/i18n";

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  button: string;
  soon: string;
};

const COPY: Record<Lang, Copy> = {
  nl: {
    eyebrow: "Mijn notities",
    title: "Download al je notities",
    description: "Exporteer al je aantekeningen en bladwijzers voor deze training als een PDF-werkdocument.",
    button: "Download notities",
    soon: "Binnenkort beschikbaar",
  },
  en: {
    eyebrow: "My notes",
    title: "Download all your notes",
    description: "Export all your notes and bookmarks for this training as a PDF study document.",
    button: "Download notes",
    soon: "Coming soon",
  },
  de: {
    eyebrow: "Meine Notizen",
    title: "Alle Notizen herunterladen",
    description: "Exportieren Sie alle Notizen und Lesezeichen fur dieses Training als PDF-Studiendokument.",
    button: "Notizen herunterladen",
    soon: "Bald verfugbar",
  },
};

export function NotesDownloadButton({ lang }: { lang: Lang }) {
  const copy = COPY[lang];

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
        disabled
        className="inline-block bg-copper/30 text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] cursor-not-allowed"
        aria-label={copy.soon}
      >
        {copy.button} &middot; {copy.soon}
      </button>
    </div>
  );
}
