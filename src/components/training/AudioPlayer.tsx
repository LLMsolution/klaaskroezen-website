"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

type AudioPlayerProps = {
  src: string;
  initialPosition?: number;
  onProgress?: (percent: number, positionSeconds: number) => void;
  lang?: Lang;
};

const ARIA_COPY: Record<Lang, {
  back15: string;
  forward15: string;
  play: string;
  pause: string;
  speed: string;
}> = {
  nl: { back15: "15 seconden terug", forward15: "15 seconden vooruit", play: "Afspelen", pause: "Pauzeren", speed: "Snelheid" },
  en: { back15: "Back 15 seconds", forward15: "Forward 15 seconds", play: "Play", pause: "Pause", speed: "Speed" },
  de: { back15: "15 Sekunden zurück", forward15: "15 Sekunden vorwärts", play: "Abspielen", pause: "Pausieren", speed: "Geschwindigkeit" },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export function AudioPlayer({ src, initialPosition = 0, onProgress, lang = "nl" }: AudioPlayerProps) {
  const aria = ARIA_COPY[lang];
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastSave = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);

  // Debounced progress callback every 10 seconds
  const reportProgress = useCallback(
    (time: number, dur: number) => {
      if (!onProgress || dur <= 0) return;
      const now = Date.now();
      if (now - lastSave.current < 10_000) return;
      lastSave.current = now;
      const percent = Math.round((time / dur) * 100);
      onProgress(percent, time);
    },
    [onProgress],
  );

  // Set initial position once loaded
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (initialPosition > 0 && audio.currentTime === 0) {
      audio.currentTime = initialPosition;
    }
  }, [initialPosition, ready]);

  // Time update handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      if (!audio) return;
      setCurrentTime(audio.currentTime);
      reportProgress(audio.currentTime, audio.duration);
    }
    function onLoadedMetadata() {
      if (!audio) return;
      setDuration(audio.duration);
      setReady(true);
    }
    function onEnded() {
      setPlaying(false);
      if (onProgress && audio) {
        onProgress(100, audio.duration);
      }
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [reportProgress, onProgress]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  }

  function setPlaybackSpeed(s: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = s;
    setSpeed(s);
    setSpeedOpen(false);
  }

  // Progress bar seek (click + drag)
  const seekToPosition = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      audio.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration],
  );

  // Mouse events for progress bar
  useEffect(() => {
    if (!dragging) return;

    function onMouseMove(e: MouseEvent) {
      seekToPosition(e.clientX);
    }
    function onMouseUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, seekToPosition]);

  // Touch events for progress bar
  useEffect(() => {
    if (!dragging) return;

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      if (touch) seekToPosition(touch.clientX);
    }
    function onTouchEnd() {
      setDragging(false);
    }
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging, seekToPosition]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-warm border border-rule rounded-[2px] p-5">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Controls row */}
      <div className="flex items-center gap-4">
        {/* Skip back 15s */}
        <button
          type="button"
          onClick={() => skip(-15)}
          className="w-9 h-9 flex items-center justify-center text-ink/50 hover:text-ink transition-colors cursor-pointer shrink-0"
          aria-label={aria.back15}
        >
          <SkipBackIcon />
        </button>

        {/* Play/Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-copper flex items-center justify-center text-paper hover:bg-copper-light transition-colors cursor-pointer shrink-0"
          aria-label={playing ? aria.pause : aria.play}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Skip forward 15s */}
        <button
          type="button"
          onClick={() => skip(15)}
          className="w-9 h-9 flex items-center justify-center text-ink/50 hover:text-ink transition-colors cursor-pointer shrink-0"
          aria-label={aria.forward15}
        >
          <SkipForwardIcon />
        </button>

        {/* Progress bar */}
        <div className="flex-1 min-w-0">
          <div
            ref={progressBarRef}
            className="relative h-6 flex items-center cursor-pointer group"
            onMouseDown={(e) => {
              setDragging(true);
              seekToPosition(e.clientX);
            }}
            onTouchStart={(e) => {
              setDragging(true);
              const touch = e.touches[0];
              if (touch) seekToPosition(touch.clientX);
            }}
          >
            <div className="absolute w-full h-1.5 bg-ink/10 rounded-full">
              <div
                className="h-full bg-copper rounded-full transition-[width] duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Thumb */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-copper border-2 border-paper shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />
          </div>
        </div>

        {/* Time display */}
        <div className="text-[12px] text-ink/50 tabular-nums shrink-0 hidden sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Speed selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setSpeedOpen(!speedOpen)}
            className="text-[12px] font-medium text-ink/60 hover:text-copper transition-colors cursor-pointer px-2 py-1 rounded-[2px] border border-rule bg-paper"
          >
            {speed}x
          </button>
          {speedOpen && (
            <div className="absolute bottom-full right-0 mb-1 bg-paper border border-rule rounded-[2px] shadow-lg z-10 py-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPlaybackSpeed(s)}
                  className={`block w-full text-left px-4 py-1.5 text-[12px] cursor-pointer transition-colors ${
                    s === speed
                      ? "text-copper font-medium bg-copper/5"
                      : "text-ink/60 hover:text-ink hover:bg-warm/50"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile time display */}
      <div className="text-[12px] text-ink/50 tabular-nums mt-2 sm:hidden text-center">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}

/* ─── Icons ─── */

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <span className="relative inline-flex items-center justify-center w-[18px] h-[18px]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
      <span className="absolute text-[7px] font-semibold" style={{ top: "6px" }}>15</span>
    </span>
  );
}

function SkipForwardIcon() {
  return (
    <span className="relative inline-flex items-center justify-center w-[18px] h-[18px]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 4v6h-6" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      <span className="absolute text-[7px] font-semibold" style={{ top: "6px" }}>15</span>
    </span>
  );
}
