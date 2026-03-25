"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";
import { CertificateButton } from "./CertificateButton";
import { AudiobookOverview } from "./AudiobookOverview";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] ?? obj.en;
}

const overviewI18n = {
  nl: { loading: "Laden...", notFound: "Training niet gevonden." },
  en: { loading: "Loading...", notFound: "Training not found." },
  de: { loading: "Laden...", notFound: "Training nicht gefunden." },
};

export function TrainingOverviewClient({ lang }: { lang: Lang }) {
  const { slug } = useParams<{ slug: string }>();
  const training = useQuery(api.trainings.getBySlug, { slug });
  const oi = overviewI18n[lang];

  if (training === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-ink/30 text-[14px]">{oi.loading}</div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-ink/50 text-[14px]">{oi.notFound}</div>
      </div>
    );
  }

  if (!training.hasAccess) {
    return <NoAccessState title={loc(training.title, lang)} slug={slug} lang={lang} />;
  }

  // Audiobook mode
  if (training.type === "audiobook") {
    return <AudiobookOverview training={training} slug={slug} lang={lang} />;
  }

  return <TrainingContent training={training} slug={slug} lang={lang} />;
}

const noAccessI18n = {
  nl: { label: "Geen toegang", body: "Je hebt nog geen toegang tot deze training. Koop de training om direct te starten met alle modules, quizzen en werkboeken.", cta: "Training bestellen", back: "Terug naar dashboard" },
  en: { label: "No access", body: "You don't have access to this training yet. Purchase the training to start immediately with all modules, quizzes and workbooks.", cta: "Order training", back: "Back to dashboard" },
  de: { label: "Kein Zugang", body: "Sie haben noch keinen Zugang zu diesem Training. Kaufen Sie das Training, um sofort mit allen Modulen, Quizzen und Arbeitsbuchern zu beginnen.", cta: "Training bestellen", back: "Zuruck zum Dashboard" },
};

function NoAccessState({ title, slug, lang }: { title: string; slug: string; lang: Lang }) {
  const checkoutSlug =
    slug === "sales-excellence-training" ? "set-online" :
    slug === "customer-success-training" ? "cst-online" :
    slug;
  const s = noAccessI18n[lang];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-7">
      <div className="max-w-[480px] text-center">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
          {s.label}
        </p>
        <h1 className="font-display text-[clamp(24px,3.5vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
          {title}
        </h1>
        <p className="text-[15px] text-ink/60 leading-[1.7] mb-8">
          {s.body}
        </p>
        <Link
          href={`/checkout/${checkoutSlug}`}
          className="inline-block bg-copper text-paper px-8 py-3.5 text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
        >
          {s.cta}
        </Link>
        <div className="mt-4">
          <Link
            href="/dashboard"
            className="text-[13px] text-ink/40 hover:text-ink transition-colors"
          >
            {s.back}
          </Link>
        </div>
      </div>
    </div>
  );
}

const lessonI18n = {
  nl: { reviewVideo: "Bekijk opnieuw", continueVideo: "Verder kijken", startVideo: "Start video", startModule: "Start module", videoProgress: "Voortgang video", quizPassed: "Quiz gehaald", quizNotPassed: "Quiz nog niet gehaald" },
  en: { reviewVideo: "Watch again", continueVideo: "Continue watching", startVideo: "Start video", startModule: "Start module", videoProgress: "Video progress", quizPassed: "Quiz passed", quizNotPassed: "Quiz not yet passed" },
  de: { reviewVideo: "Erneut ansehen", continueVideo: "Weiter ansehen", startVideo: "Video starten", startModule: "Modul starten", videoProgress: "Video-Fortschritt", quizPassed: "Quiz bestanden", quizNotPassed: "Quiz noch nicht bestanden" },
};

const trainingContentI18n = {
  nl: { label: "Training", videos: "video's", video: "video", completed: "afgerond", workbooks: "Werkboeken", workbookPdf: "Werkboek PDF" },
  en: { label: "Training", videos: "videos", video: "video", completed: "completed", workbooks: "Workbooks", workbookPdf: "Workbook PDF" },
  de: { label: "Training", videos: "Videos", video: "Video", completed: "abgeschlossen", workbooks: "Arbeitsbucher", workbookPdf: "Arbeitsbuch PDF" },
};

function TrainingContent({
  training,
  slug,
  lang,
}: {
  training: { _id: Id<"trainings">; title: LocalizedStr; description: LocalizedStr; type?: string; thumbnailUrl?: string; coverImageUrl?: string; hasAccess: boolean };
  slug: string;
  lang: Lang;
}) {
  const tcI18n = trainingContentI18n[lang];
  const trainingId = training._id;
  const modules = useQuery(api.trainings.getModulesForTraining, { trainingId });
  const progress = useQuery(api.trainingProgress.getMyTrainingProgress, { trainingId });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allActive = (modules ?? [])
    .filter((m) => m.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Separate chapters (no parent) and lessons (with parent)
  const chapters = allActive.filter((m) => !m.parentModuleId);
  const lessonsByParent = new Map<string, typeof allActive>();
  for (const m of allActive) {
    if (m.parentModuleId) {
      const list = lessonsByParent.get(m.parentModuleId) ?? [];
      list.push(m);
      lessonsByParent.set(m.parentModuleId, list);
    }
  }

  // If no chapters exist, treat all modules as flat (backward compat)
  const isFlat = chapters.length === 0 || (chapters.length === allActive.length);
  const displayItems = isFlat ? allActive : chapters;

  // Only count lessons (items with video) for progress
  const lessons = isFlat ? allActive : allActive.filter((m) => m.parentModuleId);

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.moduleId, p]),
  );

  const completedCount = lessons.filter(
    (m) => progressMap.get(m._id)?.completedAt,
  ).length;
  const overallPercent =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;

  const hasWorkbooks = allActive.some((m) => m.workbookStorageId);

  return (
    <div className="mx-auto max-w-[1180px] px-7 lg:px-14 py-12 lg:py-20">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
          {tcI18n.label}
        </p>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
          {loc(training.title, lang)}
        </h1>
        <p className="text-[15px] text-ink/60 leading-[1.7] max-w-[600px]">
          {loc(training.description, lang)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] text-ink/40">
            {completedCount} / {lessons.length} {lessons.length !== 1 ? tcI18n.videos : tcI18n.video} {tcI18n.completed}
          </p>
          <p className="text-[12px] font-medium text-copper">{overallPercent}%</p>
        </div>
        <div className="h-1.5 bg-warm rounded-full overflow-hidden">
          <div
            className="h-full bg-copper transition-all duration-500 rounded-full"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Workbook downloads */}
      {hasWorkbooks && (
        <div className="mb-10 border border-rule rounded-[2px] p-5">
          <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
            {tcI18n.workbooks}
          </h3>
          <div className="space-y-2">
            {allActive
              .filter((m) => m.workbookStorageId)
              .map((m) => (
                <WorkbookDownload key={m._id} moduleId={m._id} title={loc(m.title, lang)} pdfLabel={tcI18n.workbookPdf} />
              ))}
          </div>
        </div>
      )}

      {/* Certificate */}
      <CertificateButton trainingId={training._id} trainingTitle={loc(training.title, lang)} />

      {/* Modules — hierarchical or flat */}
      <div className="space-y-3">
        {displayItems.map((chapter, chapterIdx) => {
          const chapterLessons = isFlat ? [] : (lessonsByParent.get(chapter._id) ?? []);
          const isChapter = !isFlat && chapterLessons.length > 0;
          const isExpanded = expandedId === chapter._id;

          // For flat mode or chapters without lessons: same as before
          if (!isChapter) {
            const p = progressMap.get(chapter._id);
            const vp = p?.videoProgress ?? 0;
            const done = !!p?.completedAt;
            return (
              <div key={chapter._id} className="border border-rule rounded-[2px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : chapter._id)}
                  className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-warm/30 transition-colors"
                >
                  <ModuleBadge index={chapterIdx} done={done} inProgress={vp > 0} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-ink">{loc(chapter.title, lang)}</p>
                    <p className="text-[13px] text-ink/40 truncate">{loc(chapter.description, lang)}</p>
                  </div>
                  {vp > 0 && !done && <span className="text-[12px] text-ink/30 shrink-0 mr-2">{vp}%</span>}
                  <ChevronIcon open={isExpanded} />
                </button>
                {isExpanded && (
                  <LessonDetail mod={chapter} slug={slug} progress={p} lang={lang} />
                )}
              </div>
            );
          }

          // Chapter with nested lessons
          const chapterDone = chapterLessons.every((l) => progressMap.get(l._id)?.completedAt);
          const chapterStarted = chapterLessons.some((l) => (progressMap.get(l._id)?.videoProgress ?? 0) > 0);
          const completedInChapter = chapterLessons.filter((l) => progressMap.get(l._id)?.completedAt).length;

          return (
            <div key={chapter._id} className="border border-rule rounded-[2px] overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : chapter._id)}
                className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-warm/30 transition-colors"
              >
                <ModuleBadge index={chapterIdx} done={chapterDone} inProgress={chapterStarted} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-ink">{loc(chapter.title, lang)}</p>
                  <p className="text-[13px] text-ink/40">
                    {completedInChapter}/{chapterLessons.length} {chapterLessons.length !== 1 ? tcI18n.videos : tcI18n.video}
                    {loc(chapter.description, lang) ? ` — ${loc(chapter.description, lang)}` : ""}
                  </p>
                </div>
                <ChevronIcon open={isExpanded} />
              </button>

              {isExpanded && (
                <div className="border-t border-rule">
                  {loc(chapter.description, lang) && (
                    <p className="text-[14px] text-ink/60 leading-[1.7] px-5 pt-4">
                      {loc(chapter.description, lang)}
                    </p>
                  )}
                  <div className="divide-y divide-rule">
                    {chapterLessons.map((lesson, lessonIdx) => {
                      const lp = progressMap.get(lesson._id);
                      const vp = lp?.videoProgress ?? 0;
                      const done = !!lp?.completedAt;
                      return (
                        <div key={lesson._id} className="px-5 py-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[12px] font-medium w-8 ${done ? "text-copper" : "text-ink/25"}`}>
                              {chapterIdx + 1}.{lessonIdx + 1}
                            </span>
                            <p className="text-[14px] font-medium text-ink flex-1">{loc(lesson.title, lang)}</p>
                            {done && <span className="text-[11px] text-copper">{tcI18n.completed}</span>}
                            {!done && vp > 0 && <span className="text-[11px] text-ink/30">{vp}%</span>}
                          </div>
                          <div className="pl-11">
                            {loc(lesson.description, lang) && (
                              <p className="text-[13px] text-ink/40 mb-3">{loc(lesson.description, lang)}</p>
                            )}
                            <Link
                              href={`/training/${slug}/${lesson.slug}`}
                              className="inline-flex items-center gap-2 text-[12px] font-medium text-copper hover:text-copper-light transition-colors"
                            >
                              {done ? lessonI18n[lang].reviewVideo : vp > 0 ? lessonI18n[lang].continueVideo : lessonI18n[lang].startVideo}
                              <ArrowIcon />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModuleBadge({ index, done, inProgress }: { index: number; done: boolean; inProgress: boolean }) {
  return (
    <div
      className={`w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0 text-[14px] font-medium ${
        done
          ? "bg-copper text-paper"
          : inProgress
            ? "bg-copper/10 text-copper"
            : "bg-warm text-ink/30"
      }`}
    >
      {done ? <CheckIcon /> : String(index + 1).padStart(2, "0")}
    </div>
  );
}

function LessonDetail({ mod, slug, progress, lang }: {
  mod: { _id: string; title: LocalizedStr; description: LocalizedStr; vimeoVideoId?: string; quizRequired: boolean; slug: string };
  slug: string;
  progress?: { videoProgress?: number; completedAt?: number; quizPassed?: boolean };
  lang: Lang;
}) {
  const vp = progress?.videoProgress ?? 0;
  const done = !!progress?.completedAt;
  const li = lessonI18n[lang];

  return (
    <div className="border-t border-rule px-5 pb-5 pt-4 space-y-4">
      {loc(mod.description, lang) && (
        <p className="text-[14px] text-ink/60 leading-[1.7]">{loc(mod.description, lang)}</p>
      )}
      {mod.vimeoVideoId && (
        <div className="relative w-full rounded-[2px] overflow-hidden bg-ink/5" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://player.vimeo.com/video/${mod.vimeoVideoId}?badge=0&autopause=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            className="absolute inset-0 w-full h-full"
            title={loc(mod.title, lang)}
          />
        </div>
      )}
      {vp > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-ink/40">{li.videoProgress}</span>
            <span className="text-[11px] font-medium text-copper">{vp}%</span>
          </div>
          <div className="h-1 bg-warm rounded-full overflow-hidden">
            <div className="h-full bg-copper rounded-full" style={{ width: `${vp}%` }} />
          </div>
        </div>
      )}
      {mod.quizRequired && (
        <div className="flex items-center gap-2 text-[13px]">
          {progress?.quizPassed ? (
            <>
              <span className="w-5 h-5 rounded-full bg-copper flex items-center justify-center"><CheckIcon /></span>
              <span className="text-ink/60">{li.quizPassed}</span>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full bg-warm flex items-center justify-center text-ink/30"><QuizIcon /></span>
              <span className="text-ink/40">{li.quizNotPassed}</span>
            </>
          )}
        </div>
      )}
      <Link
        href={`/training/${slug}/${mod.slug}`}
        className="inline-flex items-center gap-2 bg-copper text-paper px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
      >
        {done ? li.reviewVideo : vp > 0 ? li.continueVideo : li.startModule}
        <ArrowIcon />
      </Link>
    </div>
  );
}

function WorkbookDownload({ moduleId, title, pdfLabel }: { moduleId: Id<"trainingModules">; title: string; pdfLabel: string }) {
  const data = useQuery(api.trainingModules.getWithProgress, { moduleId });
  if (!data?.workbookUrl) return null;

  return (
    <a
      href={data.workbookUrl}
      download
      className="flex items-center gap-3 p-3 border border-rule rounded-[2px] hover:border-copper/30 transition-colors group"
    >
      <div className="w-9 h-9 rounded-[2px] bg-copper/10 flex items-center justify-center shrink-0">
        <PdfIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors truncate">
          {title}
        </p>
        <p className="text-[11px] text-ink/40">{pdfLabel}</p>
      </div>
      <DownloadIcon />
    </a>
  );
}

/* ─── Icons ─── */

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-paper">
      <path d="M3 8l3 3 7-7" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`text-ink/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/30">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M10 13h4M10 17h4M8 9h2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/30 group-hover:text-copper transition-colors">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}
