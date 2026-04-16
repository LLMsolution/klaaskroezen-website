"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Lang } from "@/lib/i18n";

interface Props {
  vimeoVideoId: string;
  moduleId: Id<"trainingModules">;
  trainingId: Id<"trainings">;
  initialPosition: number;
  /** Optional — fired when the video reaches the end. Enables auto-next navigation. */
  onEnded?: () => void;
  /** Title of the next lesson to show in the end-of-video overlay. */
  nextLessonTitle?: string;
  /** Language for UI overlays. Defaults to NL. */
  lang?: Lang;
}

const COUNTDOWN_SECONDS = 10;

const COPY: Record<Lang, {
  videoLoading: string;
  nextLesson: string;
  autoStartPrefix: string;
  secondSingular: string;
  secondPlural: string;
  startNow: string;
  cancel: string;
}> = {
  nl: {
    videoLoading: "Video laden...",
    nextLesson: "Volgende les",
    autoStartPrefix: "Start automatisch over",
    secondSingular: "seconde",
    secondPlural: "seconden",
    startNow: "Nu starten",
    cancel: "Annuleer",
  },
  en: {
    videoLoading: "Loading video...",
    nextLesson: "Next lesson",
    autoStartPrefix: "Starts automatically in",
    secondSingular: "second",
    secondPlural: "seconds",
    startNow: "Start now",
    cancel: "Cancel",
  },
  de: {
    videoLoading: "Video lädt...",
    nextLesson: "Nächste Lektion",
    autoStartPrefix: "Startet automatisch in",
    secondSingular: "Sekunde",
    secondPlural: "Sekunden",
    startNow: "Jetzt starten",
    cancel: "Abbrechen",
  },
};

export function VideoPlayer({
  vimeoVideoId,
  moduleId,
  trainingId,
  initialPosition,
  onEnded,
  nextLessonTitle,
  lang = "nl",
}: Props) {
  const copy = COPY[lang];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const updateProgress = useMutation(api.trainingProgress.updateVideoProgress);
  const lastSave = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  // Capture initialPosition once on mount — later updates of this prop (from
  // re-queries of saved progress) must NOT re-mount the Vimeo player, otherwise
  // the iframe reloads mid-playback and the video visually jumps back.
  const initialPositionRef = useRef(initialPosition);

  // Keep a stable ref to saveProgress so the mount effect below only runs once.
  const saveProgressRef = useRef<(progress: number, position: number) => void>(() => {});
  saveProgressRef.current = async (progress: number, position: number) => {
    const now = Date.now();
    if (now - lastSave.current < 10_000) return; // Debounce: max every 10 seconds
    lastSave.current = now;
    try {
      await updateProgress({
        moduleId,
        trainingId,
        videoProgress: Math.round(progress),
        videoPosition: Math.round(position),
      });
    } catch {
      // Silently fail on progress save
    }
  };

  useEffect(() => {
    // Load Vimeo Player SDK
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = () => {
      if (!iframeRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Player = (window as any).Vimeo?.Player;
      if (!Player) return;

      const player = new Player(iframeRef.current);

      // Set initial position (from captured ref — prop changes are ignored)
      const start = initialPositionRef.current;
      if (start > 0) {
        player.setCurrentTime(start).catch(() => {});
      }

      // Track progress — use stable ref so we don't retrigger this effect.
      player.on("timeupdate", (data: { seconds: number; percent: number; duration: number }) => {
        saveProgressRef.current(data.percent * 100, data.seconds);
      });

      // Auto-next overlay on video end
      player.on("ended", async () => {
        if (!onEndedRef.current) return;
        // Vimeo fullscreens the iframe itself, so our React overlay would
        // sit behind the fullscreen layer. Exit fullscreen first so the
        // user sees the countdown overlay inside the normal page layout.
        try {
          await player.exitFullscreen?.();
        } catch {
          /* ignore */
        }
        if (typeof document !== "undefined" && document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch {
            /* ignore */
          }
        }
        setShowEndOverlay(true);
        setCountdown(COUNTDOWN_SECONDS);
        if (countdownTimer.current) clearInterval(countdownTimer.current);
        countdownTimer.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownTimer.current) clearInterval(countdownTimer.current);
              onEndedRef.current?.();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      });

      setLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
    // Intentionally only react to vimeoVideoId changes. `initialPosition` is
    // captured via ref to avoid remounting the player every time progress is
    // saved (which would cause the video to visually jump back a second).
  }, [vimeoVideoId]);

  function cancelAutoNext() {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setShowEndOverlay(false);
  }

  function goNextNow() {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setShowEndOverlay(false);
    onEndedRef.current?.();
  }

  return (
    <div className="mb-6">
      <div className="relative bg-ink/5 rounded-[2px] overflow-hidden" style={{ paddingTop: "56.25%" }}>
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoVideoId}?byline=0&portrait=0&title=0&badge=0&autopause=0&transparent=0&dnt=1&pip=0&color=B5622A`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-ink/30 text-[14px]">{copy.videoLoading}</div>
          </div>
        )}

        {showEndOverlay && nextLessonTitle && (
          <div className="absolute inset-0 bg-ink/85 flex items-center justify-center p-8">
            <div className="text-center max-w-[480px]">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
                {copy.nextLesson}
              </p>
              <h3 className="font-display text-[24px] font-black text-paper mb-2 leading-[1.1]">
                {nextLessonTitle}
              </h3>
              <p className="text-[13px] text-paper/60 mb-6">
                {copy.autoStartPrefix}{" "}
                <span className="font-medium text-copper tabular-nums">{countdown}</span>{" "}
                {countdown !== 1 ? copy.secondPlural : copy.secondSingular}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={goNextNow}
                  className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
                >
                  {copy.startNow}
                </button>
                <button
                  onClick={cancelAutoNext}
                  className="border border-paper/30 text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-paper/60 transition-colors rounded-[2px] cursor-pointer"
                >
                  {copy.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
