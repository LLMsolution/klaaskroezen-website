"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface Video {
  title: string;
  thumbnail: string;
  embedUrl: string;
  duration?: string;
}

interface VideoGridProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  videos: Video[];
  light?: boolean;
}

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 18"
      fill="none"
      className="ml-0.5"
    >
      <path d="M15 9L0.5 17.66V0.34L15 9Z" fill="currentColor" />
    </svg>
  );
}

function getVideoId(url: string): string {
  const embedMatch = url.match(/\/embed\/([^?&/]+)/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  return url;
}

/* ── YouTube IFrame API loader (singleton) ── */
let ytApiLoading = false;
let ytApiReady = false;
const ytReadyCallbacks: (() => void)[] = [];

function loadYTApi(cb: () => void) {
  if (ytApiReady) {
    cb();
    return;
  }
  ytReadyCallbacks.push(cb);
  if (ytApiLoading) return;
  ytApiLoading = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const prev = w.onYouTubeIframeAPIReady as (() => void) | undefined;

  w.onYouTubeIframeAPIReady = () => {
    prev?.();
    ytApiReady = true;
    ytReadyCallbacks.forEach((fn) => fn());
    ytReadyCallbacks.length = 0;
  };

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

/* ── Lightbox with YT IFrame API player ── */
function VideoLightbox({
  video,
  onClose,
}: {
  video: Video;
  onClose: () => void;
  light: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const videoId = getVideoId(video.embedUrl);

  // Escape to close + lock scroll
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Create YT player
  useEffect(() => {
    loadYTApi(() => {
      if (!containerRef.current || playerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady(e: YT.PlayerEvent) {
            try {
              const levels = e.target.getAvailableQualityLevels();
              if (levels.length) e.target.setPlaybackQuality(levels[0]);
            } catch {
              /* quality API may be unavailable */
            }
          },
          onStateChange(e: YT.OnStateChangeEvent) {
            // Re-attempt quality on play start
            if (e.data === YT.PlayerState.PLAYING) {
              try {
                const levels = e.target.getAvailableQualityLevels();
                if (levels.length) e.target.setPlaybackQuality(levels[0]);
              } catch {
                /* ignore */
              }
            }
          },
        },
      });
    });

    return () => {
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [videoId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/95 backdrop-blur-sm" />

      {/* Content — nearly full viewport for max quality */}
      <div
        className="relative w-full max-w-[1400px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 flex items-center gap-2 text-[12px] font-medium tracking-[0.12em] uppercase text-paper/60 hover:text-paper transition-colors cursor-pointer z-10"
        >
          Sluiten
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1 1L13 13M13 1L1 13" />
          </svg>
        </button>

        {/* Player container — CSS hides YT logo & info bar */}
        <div className="relative aspect-video overflow-hidden rounded-[2px] bg-ink yt-clean">
          <div ref={containerRef} className="absolute inset-0" />
        </div>

        {/* Title below */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[14px] text-paper/70">{video.title}</span>
          {video.duration && (
            <span className="text-[12px] text-paper/40 font-medium tracking-[0.08em]">
              {video.duration}
            </span>
          )}
        </div>
      </div>

      {/* CSS overrides for YouTube chrome */}
      <style>{`
        .yt-clean iframe {
          position: absolute;
          inset: -1px;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
        }
        .yt-clean .ytp-chrome-top,
        .yt-clean .ytp-show-cards-title,
        .yt-clean .ytp-watermark,
        .yt-clean .ytp-youtube-button,
        .yt-clean .ytp-impression-link {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export function VideoGrid({
  eyebrow,
  title,
  titleAccent,
  description,
  videos,
  light = false,
}: VideoGridProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const close = useCallback(() => setActiveVideo(null), []);

  return (
    <>
      <section
        id="videos"
        className={`py-16 sm:py-[110px] border-b ${
          light
            ? "bg-paper border-rule"
            : "bg-ink border-paper/[0.07]"
        }`}
      >
        <Container>
          <FadeIn className="text-center mb-10 sm:mb-14">
            {eyebrow && (
              <Label
                className={`mb-3 ${light ? "" : "text-copper-light"}`}
              >
                {eyebrow}
              </Label>
            )}
            <h2
              className={`font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em] ${
                light ? "text-ink" : "text-paper"
              }`}
            >
              {title}
              {titleAccent && (
                <>
                  <br />
                  <em
                    className={`italic font-normal ${
                      light ? "text-ink/40" : "text-paper/40"
                    }`}
                  >
                    {titleAccent}
                  </em>
                </>
              )}
            </h2>
            {description && (
              <p
                className={`text-[15px] sm:text-[16px] leading-[1.8] max-w-[520px] mx-auto mt-4 ${
                  light ? "text-ink/60" : "text-paper/60"
                }`}
              >
                {description}
              </p>
            )}
          </FadeIn>

          <div
            className={`grid gap-px ${
              light
                ? "bg-rule border border-rule"
                : "bg-paper/[0.07] border border-paper/[0.07]"
            } ${
              videos.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : videos.length >= 4
                  ? "grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {videos.map((video) => (
              <button
                key={video.title}
                type="button"
                onClick={() => setActiveVideo(video)}
                className={`relative overflow-hidden cursor-pointer text-left ${
                  light ? "bg-warm" : "bg-ink"
                }`}
              >
                <div className="relative aspect-video">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                   
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-paper/40 flex items-center justify-center text-paper/80">
                      <PlayIcon />
                    </div>
                  </div>
                  {/* Duration badge */}
                  {video.duration && (
                    <span className="absolute bottom-3 right-3 text-[11px] font-medium tracking-[0.05em] text-paper/80">
                      {video.duration}
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <span
                    className={`text-[13px] sm:text-[14px] leading-[1.5] font-medium ${
                      light ? "text-ink/70" : "text-paper/70"
                    }`}
                  >
                    {video.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Lightbox overlay */}
      {activeVideo && (
        <VideoLightbox
          video={activeVideo}
          onClose={close}
          light={light}
        />
      )}
    </>
  );
}
