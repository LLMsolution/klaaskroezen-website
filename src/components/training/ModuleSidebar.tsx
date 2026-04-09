"use client";

import Link from "next/link";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] || obj.nl || obj.en || "";
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type SidebarLesson = {
  _id: Id<"trainingModules">;
  slug: string;
  title: LocalizedStr;
  sortOrder: number;
  displayNumber?: string;
  durationSeconds?: number;
};

interface Props {
  trainingSlug: string;
  moduleTitle: LocalizedStr;
  moduleDisplayNumber?: string;
  moduleIndex: number;
  /** Siblings in the same chapter, sorted by sortOrder. Includes the current lesson. */
  siblingLessons: SidebarLesson[];
  currentLessonId: Id<"trainingModules">;
  /** Map of moduleId → true when that lesson is completed. */
  completedMap: Record<string, boolean>;
  /** Map of moduleId → video progress percent (0-100). */
  progressMap: Record<string, number>;
  /** Map of moduleId → bookmark count. */
  bookmarkCounts: Record<string, number>;
  lang: Lang;
}

const COPY: Record<Lang, { moduleLabel: string; progress: string; completed: string }> = {
  nl: { moduleLabel: "Module", progress: "voltooid", completed: "Afgerond" },
  en: { moduleLabel: "Module", progress: "completed", completed: "Completed" },
  de: { moduleLabel: "Modul", progress: "abgeschlossen", completed: "Abgeschlossen" },
};

export function ModuleSidebar({
  trainingSlug,
  moduleTitle,
  moduleDisplayNumber,
  moduleIndex,
  siblingLessons,
  currentLessonId,
  completedMap,
  progressMap,
  bookmarkCounts,
  lang,
}: Props) {
  const copy = COPY[lang];
  const moduleLabel = moduleDisplayNumber || String(moduleIndex + 1).padStart(2, "0");

  const completedCount = siblingLessons.filter((l) => completedMap[l._id]).length;
  const progressPct =
    siblingLessons.length > 0
      ? Math.round((completedCount / siblingLessons.length) * 100)
      : 0;

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start border border-rule rounded-[2px] p-5 bg-paper">
      {/* Module header */}
      <div className="mb-4 pb-4 border-b border-rule">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1.5">
          {copy.moduleLabel} {moduleLabel}
        </p>
        <h3 className="font-display text-[18px] font-black tracking-[-0.01em] leading-[1.15] text-ink mb-3">
          {loc(moduleTitle, lang)}
        </h3>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-ink/40 tabular-nums">
            {completedCount} / {siblingLessons.length} {copy.progress}
          </span>
          <span className="text-[11px] font-medium text-copper tabular-nums">
            {progressPct}%
          </span>
        </div>
        <div className="h-1 bg-warm rounded-full overflow-hidden">
          <div
            className="h-full bg-copper rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <div className="space-y-0.5">
        {siblingLessons.map((lesson, idx) => {
          const isCurrent = lesson._id === currentLessonId;
          const isDone = !!completedMap[lesson._id];
          const vp = progressMap[lesson._id] ?? 0;
          const bmCount = bookmarkCounts[lesson._id] ?? 0;
          const label =
            lesson.displayNumber?.trim() ||
            `${moduleIndex + 1}.${idx + 1}`;

          return (
            <Link
              key={lesson._id}
              href={`/training/${trainingSlug}/${lesson.slug}`}
              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-[2px] transition-colors ${
                isCurrent
                  ? "bg-copper/10 border-l-2 border-copper"
                  : "hover:bg-warm/40 border-l-2 border-transparent"
              }`}
            >
              {/* Status dot */}
              <div className="shrink-0 pt-0.5">
                {isDone ? (
                  <div className="w-4 h-4 rounded-full bg-copper flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-paper">
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-copper" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-ink/20" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-[11px] font-medium tabular-nums shrink-0 ${
                      isCurrent ? "text-copper" : "text-ink/30"
                    }`}
                  >
                    {label}
                  </span>
                  <p
                    className={`text-[12px] leading-[1.35] line-clamp-2 ${
                      isCurrent ? "text-ink font-medium" : "text-ink/70"
                    }`}
                  >
                    {loc(lesson.title, lang)}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {lesson.durationSeconds !== undefined && lesson.durationSeconds > 0 && (
                    <span className="text-[10px] text-ink/30 tabular-nums">
                      {formatDuration(lesson.durationSeconds)}
                    </span>
                  )}
                  {!isDone && vp > 0 && (
                    <span className="text-[10px] text-copper tabular-nums">{vp}%</span>
                  )}
                  {bmCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-copper">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 2v13l4-3 4 3V2z" />
                      </svg>
                      {bmCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
