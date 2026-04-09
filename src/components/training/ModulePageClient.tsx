"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";
import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";
import { QuizSection } from "./QuizSection";
import { DiscussionSection } from "./DiscussionSection";
import { NotesPanel } from "./NotesPanel";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] ?? obj.en;
}

const modulePageI18n = {
  nl: { loading: "Laden...", notFound: "Module niet gevonden of geen toegang.", backToTraining: "Terug naar training", noAccess: "Geen toegang", noAccessMsg: "Je hebt geen toegang tot deze module.", viewTraining: "Bekijk training", module: "Module", workbook: "Werkboek" },
  en: { loading: "Loading...", notFound: "Module not found or no access.", backToTraining: "Back to training", noAccess: "No access", noAccessMsg: "You don't have access to this module.", viewTraining: "View training", module: "Module", workbook: "Workbook" },
  de: { loading: "Laden...", notFound: "Modul nicht gefunden oder kein Zugang.", backToTraining: "Zuruck zum Training", noAccess: "Kein Zugang", noAccessMsg: "Sie haben keinen Zugang zu diesem Modul.", viewTraining: "Training ansehen", module: "Modul", workbook: "Arbeitsbuch" },
};

export function ModulePageClient({ lang }: { lang: Lang }) {
  const { slug, module: moduleSlug } = useParams<{ slug: string; module: string }>();
  const training = useQuery(api.trainings.getBySlug, { slug });
  const mod = useQuery(api.trainingModules.getBySlug, { slug: moduleSlug });
  const moduleId = mod?._id;
  const moduleWithProgress = useQuery(
    api.trainingModules.getWithProgress,
    moduleId ? { moduleId } : "skip",
  );

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
      } catch { /* silently fail */ }
    },
    [mod, updateProgress],
  );

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

  // If training exists but user has no access, redirect to overview (which shows NoAccess)
  if (!training.hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-7">
        <div className="text-center">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
            {s.noAccess}
          </p>
          <p className="text-ink/50 text-[15px] mb-6">
            {s.noAccessMsg}
          </p>
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
    <div className="mx-auto max-w-[1180px] px-7 lg:px-14 py-8 lg:py-14">
      {/* Back link */}
      <Link
        href={`/training/${slug}`}
        className="inline-block text-[12px] text-ink/40 hover:text-ink transition-colors mb-6"
      >
        &larr; {loc(training.title, lang)}
      </Link>

      {/* Module title */}
      <div className="mb-8">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
          {s.module} {String(mod.sortOrder + 1).padStart(2, "0")}
        </p>
        <h1 className="font-display text-[clamp(24px,3.2vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-3">
          {loc(mod.title, lang)}
        </h1>
        <p className="text-[15px] text-ink/60 leading-[1.7]">
          {loc(mod.description, lang)}
        </p>
      </div>

      {/* Video player */}
      {mod.vimeoVideoId && (
        <VideoPlayer
          vimeoVideoId={mod.vimeoVideoId}
          moduleId={mod._id}
          trainingId={mod.trainingId}
          initialPosition={moduleWithProgress?.progress?.videoPosition ?? 0}
        />
      )}

      {/* Audio player (for audiobook chapters without video) */}
      {hasAudio && moduleWithProgress?.audioUrl && (
        <div className="mb-8">
          <AudioPlayer
            src={moduleWithProgress.audioUrl}
            initialPosition={moduleWithProgress?.progress?.videoPosition ?? 0}
            onProgress={handleAudioProgress}
          />
        </div>
      )}

      {/* Personal notes + bookmarks (unified panel) */}
      <NotesPanel moduleId={mod._id} lang={lang} />

      {/* Workbook download */}
      {moduleWithProgress?.workbookUrl && (
        <div className="my-8 border border-rule rounded-[2px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-1">
                {s.workbook}
              </p>
              <p className="text-[14px] text-ink">{mod.workbookFileName}</p>
            </div>
            <a
              href={moduleWithProgress.workbookUrl}
              download={mod.workbookFileName}
              className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
            >
              Download
            </a>
          </div>
        </div>
      )}

      {/* Quiz */}
      {mod.quizRequired && <QuizSection moduleId={mod._id} lang={lang} />}

      {/* Discussion */}
      {mod.discussionEnabled && <DiscussionSection moduleId={mod._id} lang={lang} />}
    </div>
  );
}
