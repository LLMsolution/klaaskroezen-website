"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";
import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";
import { QuizSection } from "./QuizSection";
import { DiscussionSection } from "./DiscussionSection";
import { NotesEditor } from "./NotesEditor";
import { LessonFormSection } from "./LessonFormSection";
import { ModuleSidebar, type SidebarLesson } from "./ModuleSidebar";
import { WorkbookCard } from "./WorkbookCard";
import { LessonBackButton } from "./LessonBackButton";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] || obj.nl || obj.en || "";
}

const modulePageI18n = {
  nl: {
    loading: "Laden...",
    notFound: "Module niet gevonden of geen toegang.",
    backToTraining: "Terug naar training",
    noAccess: "Geen toegang",
    noAccessMsg: "Je hebt geen toegang tot deze module.",
    viewTraining: "Bekijk training",
    module: "Module",
    workbook: "Werkboek",
    prev: "Vorige les",
    next: "Volgende les",
  },
  en: {
    loading: "Loading...",
    notFound: "Module not found or no access.",
    backToTraining: "Back to training",
    noAccess: "No access",
    noAccessMsg: "You don't have access to this module.",
    viewTraining: "View training",
    module: "Module",
    workbook: "Workbook",
    prev: "Previous lesson",
    next: "Next lesson",
  },
  de: {
    loading: "Laden...",
    notFound: "Modul nicht gefunden oder kein Zugang.",
    backToTraining: "Zuruck zum Training",
    noAccess: "Kein Zugang",
    noAccessMsg: "Sie haben keinen Zugang zu diesem Modul.",
    viewTraining: "Training ansehen",
    module: "Modul",
    workbook: "Arbeitsbuch",
    prev: "Vorherige Lektion",
    next: "Nachste Lektion",
  },
};

export function ModulePageClient({ lang }: { lang: Lang }) {
  const { slug, module: moduleSlug } = useParams<{ slug: string; module: string }>();
  const router = useRouter();
  const training = useQuery(api.trainings.getBySlug, { slug });
  const mod = useQuery(api.trainingModules.getBySlug, { slug: moduleSlug });
  const moduleId = mod?._id;
  const moduleWithProgress = useQuery(
    api.trainingModules.getWithProgress,
    moduleId ? { moduleId } : "skip",
  );

  const trainingId = training?._id;
  const allModules = useQuery(
    api.trainings.getModulesForTraining,
    trainingId ? { trainingId } : "skip",
  );
  const trainingProgress = useQuery(
    api.trainingProgress.getMyTrainingProgress,
    trainingId ? { trainingId } : "skip",
  );
  const bookmarkCounts = useQuery(
    api.bookmarks.countsForTraining,
    trainingId ? { trainingId } : "skip",
  );
  const lessonForm = useQuery(
    api.lessonForms.getForModule,
    moduleId ? { moduleId } : "skip",
  );
  const hasForm = !!lessonForm;

  const s = modulePageI18n[lang];
  const updateProgress = useMutation(api.trainingProgress.updateVideoProgress);

  const hasAudio = !!moduleWithProgress?.audioUrl && !mod?.vimeoVideoId;
  const handleAudioProgress = useCallback(
    async (percent: number, positionSeconds: number) => {
      if (!mod) return;
      try {
        await updateProgress({
          moduleId: mod._id,
          trainingId: mod.trainingId,
          videoProgress: percent,
          videoPosition: Math.round(positionSeconds),
        });
      } catch {
        /* silently fail */
      }
    },
    [mod, updateProgress],
  );

  // Derive sibling lessons, current index, prev/next, parent chapter, maps.
  const nav = useMemo(() => {
    if (!mod || !allModules) return null;

    const active = [...allModules]
      .filter((m) => m.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const chapters = active.filter((m) => !m.parentModuleId);
    const isFlat =
      chapters.length === 0 || chapters.length === active.length;

    const parentId = mod.parentModuleId;
    const parent = parentId ? active.find((m) => m._id === parentId) : null;

    // Siblings = lessons under the same parent, or flat list if no hierarchy.
    const siblings = isFlat
      ? active
      : active
          .filter((m) => m.parentModuleId === parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder);

    const currentIdx = siblings.findIndex((m) => m._id === mod._id);

    // First attempt: stay within the current chapter.
    let prev = currentIdx > 0 ? siblings[currentIdx - 1] : null;
    let next =
      currentIdx >= 0 && currentIdx < siblings.length - 1
        ? siblings[currentIdx + 1]
        : null;

    // Cross-chapter fallback: when we are at the last sibling of a chapter,
    // continue to the first lesson of the next chapter that has lessons.
    if (!isFlat) {
      const currentChapterIdx = parent
        ? chapters.findIndex((c) => c._id === parent._id)
        : -1;

      if (!next && currentChapterIdx >= 0) {
        for (let i = currentChapterIdx + 1; i < chapters.length; i++) {
          const nextChapter = chapters[i];
          const lessonsOfNext = active
            .filter((m) => m.parentModuleId === nextChapter._id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          if (lessonsOfNext.length > 0) {
            next = lessonsOfNext[0];
            break;
          }
        }
      }

      if (!prev && currentChapterIdx > 0) {
        for (let i = currentChapterIdx - 1; i >= 0; i--) {
          const prevChapter = chapters[i];
          const lessonsOfPrev = active
            .filter((m) => m.parentModuleId === prevChapter._id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          if (lessonsOfPrev.length > 0) {
            prev = lessonsOfPrev[lessonsOfPrev.length - 1];
            break;
          }
        }
      }
    }

    const chapterIndex = parent
      ? chapters.findIndex((c) => c._id === parent._id)
      : currentIdx;

    return {
      siblings: siblings as unknown as SidebarLesson[],
      currentIdx,
      prev,
      next,
      parent,
      chapterIndex,
      isFlat,
    };
  }, [mod, allModules]);

  const completedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const p of trainingProgress ?? []) {
      if (p.completedAt) map[p.moduleId] = true;
    }
    return map;
  }, [trainingProgress]);

  const progressPctMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of trainingProgress ?? []) {
      map[p.moduleId] = p.videoProgress ?? 0;
    }
    return map;
  }, [trainingProgress]);

  const handleVideoEnded = useCallback(() => {
    if (nav?.next) {
      router.push(`/training/${slug}/${nav.next.slug}`);
    }
  }, [nav, router, slug]);

  // Keyboard navigation: ArrowRight = next lesson, ArrowLeft = previous lesson.
  // Ignored when the user is typing in an input/textarea/contentEditable field.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          t.isContentEditable
        ) {
          return;
        }
      }
      if (e.key === "ArrowRight" && nav?.next) {
        e.preventDefault();
        router.push(`/training/${slug}/${nav.next.slug}`);
      } else if (e.key === "ArrowLeft" && nav?.prev) {
        e.preventDefault();
        router.push(`/training/${slug}/${nav.prev.slug}`);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nav, router, slug]);

  if (training === undefined || mod === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-ink/30 text-[14px]">{s.loading}</div>
      </div>
    );
  }

  if (!training || !mod) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-7">
        <div className="text-center">
          <p className="text-ink/50 text-[14px] mb-4">{s.notFound}</p>
          <Link
            href={`/training/${slug}`}
            className="text-[13px] text-copper hover:text-copper-light transition-colors"
          >
            {s.backToTraining}
          </Link>
        </div>
      </div>
    );
  }

  if (!training.hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-7">
        <div className="text-center">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
            {s.noAccess}
          </p>
          <p className="text-ink/50 text-[15px] mb-6">{s.noAccessMsg}</p>
          <Link
            href={`/training/${slug}`}
            className="inline-block bg-copper text-paper px-6 py-3 text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
          >
            {s.viewTraining}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-7 lg:px-14 py-6 lg:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 lg:items-start">
        {/* Main column */}
        <div className="min-w-0">
          <LessonBackButton trainingSlug={slug} lang={lang} />
          {/* Lesson title */}
          <div className="mb-5">
            <h1 className="font-display text-[clamp(22px,2.8vw,32px)] font-black leading-[1.05] tracking-[-0.02em] mb-2">
              {loc(mod.title, lang)}
            </h1>
            {loc(mod.description, lang) && (
              <p className="text-[14px] text-ink/60 leading-[1.7]">
                {loc(mod.description, lang)}
              </p>
            )}
          </div>

          {/* Video player */}
          {mod.vimeoVideoId && (
            <VideoPlayer
              vimeoVideoId={mod.vimeoVideoId}
              moduleId={mod._id}
              trainingId={mod.trainingId}
              initialPosition={moduleWithProgress?.progress?.videoPosition ?? 0}
              onEnded={nav?.next ? handleVideoEnded : undefined}
              nextLessonTitle={nav?.next ? loc(nav.next.title, lang) : undefined}
              lang={lang}
            />
          )}

          {/* Audio player */}
          {hasAudio && moduleWithProgress?.audioUrl && (
            <div className="mb-6">
              <AudioPlayer
                src={moduleWithProgress.audioUrl}
                initialPosition={moduleWithProgress?.progress?.videoPosition ?? 0}
                onProgress={handleAudioProgress}
                lang={lang}
              />
            </div>
          )}

          {/* Workbook (training-level) */}
          <WorkbookCard trainingId={training._id} lang={lang} />

          {/* Quiz */}
          {mod.quizRequired && <QuizSection moduleId={mod._id} lang={lang} />}

          {/* Lesson form (questionnaire) */}
          <LessonFormSection moduleId={mod._id} lang={lang} />

          {/* Discussion */}
          {mod.discussionEnabled && <DiscussionSection moduleId={mod._id} lang={lang} />}
        </div>

        {/* Right sidebar */}
        {nav && !nav.isFlat && nav.parent && (
          <ModuleSidebar
            trainingSlug={slug}
            moduleTitle={nav.parent.title}
            moduleDisplayNumber={nav.parent.displayNumber}
            moduleIndex={nav.chapterIndex}
            siblingLessons={nav.siblings}
            currentLessonId={mod._id}
            completedMap={completedMap}
            progressMap={progressPctMap}
            bookmarkCounts={bookmarkCounts ?? {}}
            prev={nav.prev}
            next={nav.next}
            lang={lang}
          />
        )}
      </div>

      {/* Notes editor — full width below the grid */}
      {!hasForm && <NotesEditor moduleId={mod._id} lang={lang} />}
    </div>
  );
}
