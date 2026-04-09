"use client";

import Link from "next/link";
import type { Lang } from "@/lib/i18n";

const COPY: Record<Lang, string> = {
  nl: "Terug naar overzicht",
  en: "Back to overview",
  de: "Zuruck zur Ubersicht",
};

export function LessonBackButton({ trainingSlug, lang }: { trainingSlug: string; lang: Lang }) {
  return (
    <Link
      href={`/training/${trainingSlug}`}
      className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-copper hover:text-copper-light transition-colors mb-4"
    >
      <span className="w-6 h-6 rounded-[2px] border border-copper/40 flex items-center justify-center group-hover:border-copper">
        &larr;
      </span>
      {COPY[lang]}
    </Link>
  );
}
