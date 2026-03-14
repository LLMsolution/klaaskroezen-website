"use client";

import React, { useRef } from "react";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  repeat?: number;
  duration?: string;
  gap?: string;
}

export function Marquee({
  className = "",
  reverse = false,
  pauseOnHover = true,
  children,
  repeat = 4,
  duration = "60s",
  gap = "1.5rem",
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={marqueeRef}
      className={`group flex overflow-hidden ${className}`}
      style={
        {
          "--marquee-duration": duration,
          "--marquee-gap": gap,
          gap: `var(--marquee-gap)`,
        } as React.CSSProperties
      }
      role="marquee"
      aria-live="off"
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={`flex shrink-0 animate-marquee ${
            pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
          } ${reverse ? "[animation-direction:reverse]" : ""}`}
          style={{ gap: `var(--marquee-gap)` }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
