"use client";

import { useQuery } from "convex/react";
import { useState, useCallback } from "react";
import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";
import { AudioPlayer } from "./AudioPlayer";
import { useMutation } from "convex/react";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] ?? obj.en;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const audiobookI18n = {
  nl: {
    label: "Luisterboek",
    chapters: "hoofdstukken",
    chapter: "hoofdstuk",
    totalTime: "Totale luistertijd",
    nowPlaying: "Nu aan het luisteren",
    completed: "afgerond",
    play: "Afspelen",
  },
  en: {
    label: "Audiobook",
    chapters: "chapters",
    chapter: "chapter",
    totalTime: "Total listening time",
    nowPlaying: "Now playing",
    completed: "completed",
    play: "Play",
  },
  de: {
    label: "Horbuch",
    chapters: "Kapitel",
    chapter: "Kapitel",
    totalTime: "Gesamte Horzeit",
    nowPlaying: "Wird abgespielt",
    completed: "abgeschlossen",
    play: "Abspielen",
  },
};

type TrainingData = {
  _id: Id<"trainings">;
  title: LocalizedStr;
  description: LocalizedStr;
  coverImageUrl?: string;
  hasAccess: boolean;
};

export function AudiobookOverview({
  training,
  lang,
}: {
  training: TrainingData;
  slug?: string;
  lang: Lang;
}) {
  const s = audiobookI18n[lang];
  const trainingId = training._id;
  const modules = useQuery(api.trainings.getModulesForTraining, { trainingId });
  const progress = useQuery(api.trainingProgress.getMyTrainingProgress, { trainingId });
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const allActive = (modules ?? [])
    .filter((m) => m.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.moduleId, p]),
  );

  const completedCount = allActive.filter(
    (m) => progressMap.get(m._id)?.completedAt,
  ).length;
  const overallPercent =
    allActive.length > 0 ? Math.round((completedCount / allActive.length) * 100) : 0;

  const totalDurationSeconds = allActive.reduce(
    (sum, m) => sum + (m.audioDurationSeconds ?? 0),
    0,
  );

  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const totalTimeStr =
    totalHours > 0
      ? `${totalHours}u ${totalMinutes}m`
      : `${totalMinutes} min`;

  return (
    <div className="mx-auto max-w-[1180px] px-7 lg:px-14 py-12 lg:py-20">
      {/* Header with cover image */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-10">
        {training.coverImageUrl && (
          <div className="shrink-0 mx-auto lg:mx-0">
            <div className="w-[200px] h-[200px] lg:w-[240px] lg:h-[240px] relative rounded-[2px] overflow-hidden shadow-lg">
              <Image
                src={training.coverImageUrl}
                alt={loc(training.title, lang)}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
            {s.label}
          </p>
          <h1 className="font-display text-[clamp(28px,4vw,42px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
            {loc(training.title, lang)}
          </h1>
          <p className="text-[15px] text-ink/60 leading-[1.7] max-w-[600px] mb-4">
            {loc(training.description, lang)}
          </p>
          <div className="flex items-center gap-6 text-[13px] text-ink/50">
            <span>
              {allActive.length} {allActive.length !== 1 ? s.chapters : s.chapter}
            </span>
            {totalDurationSeconds > 0 && (
              <span>{s.totalTime}: {totalTimeStr}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] text-ink/40">
            {completedCount} / {allActive.length} {allActive.length !== 1 ? s.chapters : s.chapter} {s.completed}
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

      {/* Chapter list */}
      <div className="space-y-2">
        {allActive.map((chapter, idx) => {
          const isActive = activeChapterId === chapter._id;
          const p = progressMap.get(chapter._id);
          const done = !!p?.completedAt;

          return (
            <ChapterRow
              key={chapter._id}
              chapter={chapter}
              index={idx}
              isActive={isActive}
              isDone={done}
              progress={p}
              lang={lang}
              i18n={s}
              onPlay={() => setActiveChapterId(isActive ? null : chapter._id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Chapter row with inline audio player ─── */

type ChapterModule = {
  _id: Id<"trainingModules">;
  trainingId: Id<"trainings">;
  title: LocalizedStr;
  description: LocalizedStr;
  audioStorageId?: Id<"_storage">;
  audioDurationSeconds?: number;
  audioFileName?: string;
};

function ChapterRow({
  chapter,
  index,
  isActive,
  isDone,
  progress,
  lang,
  i18n,
  onPlay,
}: {
  chapter: ChapterModule;
  index: number;
  isActive: boolean;
  isDone: boolean;
  progress?: { videoProgress?: number; videoPosition?: number; completedAt?: number };
  lang: Lang;
  i18n: { nowPlaying: string; play: string; completed: string };
  onPlay: () => void;
}) {
  const moduleWithProgress = useQuery(
    api.trainingModules.getWithProgress,
    isActive ? { moduleId: chapter._id } : "skip",
  );
  const updateProgress = useMutation(api.trainingProgress.updateVideoProgress);

  const handleProgress = useCallback(
    async (percent: number, positionSeconds: number) => {
      try {
        await updateProgress({
          moduleId: chapter._id,
          trainingId: chapter.trainingId,
          videoProgress: percent,
          videoPosition: Math.round(positionSeconds),
        });
      } catch {
        // Silently fail
      }
    },
    [chapter._id, chapter.trainingId, updateProgress],
  );

  const durationStr = chapter.audioDurationSeconds
    ? formatDuration(chapter.audioDurationSeconds)
    : "--:--";

  return (
    <div
      className={`border rounded-[2px] overflow-hidden transition-colors ${
        isActive ? "border-copper/40 bg-warm/30" : "border-rule"
      }`}
    >
      <button
        type="button"
        onClick={onPlay}
        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer hover:bg-warm/20 transition-colors"
      >
        {/* Number badge */}
        <div
          className={`w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0 text-[14px] font-medium ${
            isDone
              ? "bg-copper text-paper"
              : isActive
                ? "bg-copper/10 text-copper"
                : "bg-warm text-ink/30"
          }`}
        >
          {isDone ? <CheckIcon /> : String(index + 1).padStart(2, "0")}
        </div>

        {/* Title + info */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-ink">{loc(chapter.title, lang)}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[12px] text-ink/40 tabular-nums">{durationStr}</span>
            {isActive && (
              <span className="text-[11px] text-copper font-medium">{i18n.nowPlaying}</span>
            )}
            {isDone && !isActive && (
              <span className="text-[11px] text-copper">{i18n.completed}</span>
            )}
          </div>
        </div>

        {/* Play button indicator */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            isActive ? "bg-copper text-paper" : "bg-copper/10 text-copper"
          }`}
        >
          {isActive ? <PauseSmallIcon /> : <PlaySmallIcon />}
        </div>
      </button>

      {/* Inline audio player */}
      {isActive && moduleWithProgress?.audioUrl && (
        <div className="px-4 pb-4">
          <AudioPlayer
            src={moduleWithProgress.audioUrl}
            initialPosition={progress?.videoPosition ?? 0}
            onProgress={handleProgress}
          />
        </div>
      )}
    </div>
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

function PlaySmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
