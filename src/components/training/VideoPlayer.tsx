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
}

export function VideoPlayer({ vimeoVideoId, moduleId, trainingId, initialPosition }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const updateProgress = useMutation(api.trainingProgress.updateVideoProgress);
  const lastSave = useRef(0);
  const [loaded, setLoaded] = useState(false);

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

      setLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [vimeoVideoId, initialPosition, saveProgress]);

  return (
    <div className="mb-8">
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
      </div>
    </div>
  );
}
