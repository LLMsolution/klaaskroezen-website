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
      className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.15em] uppercase text-copper hover:text-copper-light transition-colors mb-4"
    >
      <span className="text-[14px] leading-none">&larr;</span>
      {COPY[lang]}
    </Link>
  );
}
