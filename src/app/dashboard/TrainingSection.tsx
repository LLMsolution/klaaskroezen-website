"use client";

import Link from "next/link";
import type { Lang } from "@/lib/i18n";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] ?? obj.en;
}

type Training = {
  _id: string;
  slug: string;
  title: LocalizedStr;
  type?: string;
  overallProgress: number;
  completedModules: number;
  totalModules: number;
  lastModuleSlug?: string;
};

const COPY: Record<Lang, { trainings: string; audiobooks: string; ofModules: string; completed: string; ofChapters: string; listened: string }> = {
  nl: { trainings: "Mijn trainingen", audiobooks: "Mijn luisterboeken", ofModules: "van", completed: "voltooid", ofChapters: "van", listened: "beluisterd" },
  en: { trainings: "My trainings", audiobooks: "My audiobooks", ofModules: "of", completed: "completed", ofChapters: "of", listened: "listened" },
  de: { trainings: "Meine Trainings", audiobooks: "Meine Hörbucher", ofModules: "von", completed: "abgeschlossen", ofChapters: "von", listened: "gehort" },
};

export function TrainingSection({ trainings, lang }: { trainings: Training[]; lang: Lang }) {
  const copy = COPY[lang];
  const regular = trainings.filter((t) => t.type !== "audiobook");
  const audiobooks = trainings.filter((t) => t.type === "audiobook");

  return (
    <>
      {regular.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">{copy.trainings}</h2>
          <div className="space-y-3">
            {regular.map((t) => (
              <Link
                key={t._id}
                href={t.lastModuleSlug ? `/training/${t.slug}/${t.lastModuleSlug}` : `/training/${t.slug}`}
                className="block border border-rule rounded-[2px] p-5 hover:border-copper/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[2px] bg-copper/10 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-ink group-hover:text-copper transition-colors">{loc(t.title, lang)}</p>
                    <p className="text-[12px] text-ink/40">{t.completedModules} {copy.ofModules} {t.totalModules} modules · {t.overallProgress}% {copy.completed}</p>
                  </div>
                  <div className="shrink-0 w-16">
                    <div className="h-1.5 bg-warm rounded-full overflow-hidden">
                      <div className="h-full bg-copper rounded-full transition-all" style={{ width: `${t.overallProgress}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {audiobooks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">{copy.audiobooks}</h2>
          <div className="space-y-3">
            {audiobooks.map((t) => (
              <Link
                key={t._id}
                href={`/training/${t.slug}`}
                className="block border border-rule rounded-[2px] p-5 hover:border-copper/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[2px] bg-copper/10 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-ink group-hover:text-copper transition-colors">{loc(t.title, lang)}</p>
                    <p className="text-[12px] text-ink/40">{t.completedModules} {copy.ofChapters} {t.totalModules} · {t.overallProgress}% {copy.listened}</p>
                  </div>
                  <div className="shrink-0 w-16">
                    <div className="h-1.5 bg-warm rounded-full overflow-hidden">
                      <div className="h-full bg-copper rounded-full transition-all" style={{ width: `${t.overallProgress}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
