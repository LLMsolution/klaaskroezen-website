"use client";

import { useCallback, useRef, useState } from "react";
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
  /** Previous lesson in chapter-ordered flow (may be in another chapter). */
  prev?: SidebarLesson | null;
  /** Next lesson in chapter-ordered flow (may be in another chapter). */
  next?: SidebarLesson | null;
  lang: Lang;
}

const COPY: Record<Lang, { moduleLabel: string; progress: string; completed: string; prev: string; next: string }> = {
  nl: { moduleLabel: "Module", progress: "voltooid", completed: "Afgerond", prev: "Vorige", next: "Volgende" },
  en: { moduleLabel: "Module", progress: "completed", completed: "Completed", prev: "Previous", next: "Next" },
  de: { moduleLabel: "Modul", progress: "abgeschlossen", completed: "Abgeschlossen", prev: "Vorherige", next: "Nachste" },
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
  prev,
  next,
  lang,
}: Props) {
  const copy = COPY[lang];
  const moduleLabel = moduleDisplayNumber || String(moduleIndex + 1).padStart(2, "0");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  // Check on mount via ref callback
  const setScrollRef = useCallback((el: HTMLDivElement | null) => {
    (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (el) {
      setCanScrollUp(el.scrollTop > 4);
      setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    }
  }, []);

  const completedCount = siblingLessons.filter((l) => completedMap[l._id]).length;
  const progressPct =
    siblingLessons.length > 0
      ? Math.round((completedCount / siblingLessons.length) * 100)
      : 0;

  return (
    <div className="lg:sticky lg:top-6 flex flex-col gap-4">
    <aside className="border border-rule rounded-[2px] bg-paper overflow-hidden">
      {/* Module header */}
      <div className="pb-4 border-b border-rule px-5 pt-5">
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

      {/* Lesson list — ~6 visible, fade edges hint at more */}
      <div className="relative">
      <div ref={setScrollRef} onScroll={updateScrollState} className="max-h-[340px] overflow-y-auto scrollbar-hide">
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
              className={`flex items-start gap-2.5 px-5 py-2.5 transition-colors ${
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
      {canScrollUp && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-5" style={{ background: "linear-gradient(to bottom, rgba(14,12,10,0.08), transparent)" }} />
      )}
      {canScrollDown && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8" style={{ background: "linear-gradient(to top, rgba(14,12,10,0.12), transparent)" }} />
      )}
      </div>

    </aside>

    {/* Prev / Next — pushed towards the bottom of the sidebar column */}
    {(prev || next) && (
      <div className="flex flex-col gap-2 mt-auto">
        {next && (
          <Link
            href={`/training/${trainingSlug}/${next.slug}`}
            className="group flex items-center gap-3 px-1 py-1 min-w-0"
            aria-label={`${copy.next}: ${loc(next.title, lang)}`}
          >
            <span className="text-copper text-[16px] leading-none shrink-0 group-hover:text-copper-light transition-colors">
              &rarr;
            </span>
            <span className="min-w-0">
              <span className="block text-[9px] font-medium tracking-[0.15em] uppercase text-copper leading-none mb-0.5">
                {copy.next}
              </span>
              <span className="block text-[12px] text-ink/70 group-hover:text-ink truncate">
                {loc(next.title, lang)}
              </span>
            </span>
          </Link>
        )}
        {prev && (
          <Link
            href={`/training/${trainingSlug}/${prev.slug}`}
            className="group flex items-center gap-3 px-1 py-1 min-w-0"
            aria-label={`${copy.prev}: ${loc(prev.title, lang)}`}
          >
            <span className="text-copper text-[16px] leading-none shrink-0 group-hover:text-copper-light transition-colors">
              &larr;
            </span>
            <span className="min-w-0">
              <span className="block text-[9px] font-medium tracking-[0.15em] uppercase text-copper leading-none mb-0.5">
                {copy.prev}
              </span>
              <span className="block text-[12px] text-ink/70 group-hover:text-ink truncate">
                {loc(prev.title, lang)}
              </span>
            </span>
          </Link>
        )}
      </div>
    )}
    </div>
  );
}
