"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface Props {
  vimeoVideoId: string;
  moduleId: Id<"trainingModules">;
  trainingId: Id<"trainings">;
  initialPosition: number;
  /** Optional — fired when the video reaches the end. Enables auto-next navigation. */
  onEnded?: () => void;
  /** Title of the next lesson to show in the end-of-video overlay. */
  nextLessonTitle?: string;
}

const COUNTDOWN_SECONDS = 5;

export function VideoPlayer({
  vimeoVideoId,
  moduleId,
  trainingId,
  initialPosition,
  onEnded,
  nextLessonTitle,
}: Props) {
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

  const saveProgress = useCallback(
    async (progress: number, position: number) => {
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
    },
    [moduleId, trainingId, updateProgress],
  );

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

      // Set initial position
      if (initialPosition > 0) {
        player.setCurrentTime(initialPosition).catch(() => {});
      }

      // Track progress
      player.on("timeupdate", (data: { seconds: number; percent: number; duration: number }) => {
        saveProgress(data.percent * 100, data.seconds);
      });

      // Auto-next overlay on video end
      player.on("ended", () => {
        if (!onEndedRef.current) return;
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
  }, [vimeoVideoId, initialPosition, saveProgress]);

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
          src={`https://player.vimeo.com/video/${vimeoVideoId}?byline=0&portrait=0&title=0&badge=0&autopause=0&transparent=0&dnt=1&pip=0`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-ink/30 text-[14px]">Video laden...</div>
          </div>
        )}

        {showEndOverlay && nextLessonTitle && (
          <div className="absolute inset-0 bg-ink/85 flex items-center justify-center p-8">
            <div className="text-center max-w-[480px]">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
                Volgende les
              </p>
              <h3 className="font-display text-[24px] font-black text-paper mb-2 leading-[1.1]">
                {nextLessonTitle}
              </h3>
              <p className="text-[13px] text-paper/60 mb-6">
                Start automatisch over{" "}
                <span className="font-medium text-copper tabular-nums">{countdown}</span>{" "}
                seconde{countdown !== 1 ? "n" : ""}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={goNextNow}
                  className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
                >
                  Nu starten
                </button>
                <button
                  onClick={cancelAutoNext}
                  className="border border-paper/30 text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-paper/60 transition-colors rounded-[2px] cursor-pointer"
                >
                  Annuleer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
