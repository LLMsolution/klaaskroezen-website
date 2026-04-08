"use client";

import { useRef, useState, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface TransformationItem {
  label: string;
  before: string;
  after: string;
}

interface TransformationSliderProps {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  beforeLabel?: string;
  afterLabel?: string;
  items: TransformationItem[];
}

function ItemCard({
  label,
  text,
  variant,
}: {
  label: string;
  text: string;
  variant: "before" | "after";
}) {
  const isBefore = variant === "before";
  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-center h-full ${
        isBefore ? "bg-ink" : "bg-paper"
      }`}
      style={{ minHeight: "120px" }}
    >
      <span
        className={`text-[9px] sm:text-[10px] font-medium tracking-[0.2em] uppercase mb-1.5 sm:mb-2 ${
          isBefore ? "text-paper/30" : "text-copper"
        }`}
      >
        {label}
      </span>
      <p
        className={`text-[13px] sm:text-[14px] lg:text-[15px] leading-[1.55] sm:leading-[1.65] ${
          isBefore ? "text-paper/70" : "text-ink/80"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export function TransformationSlider({
  eyebrow = "De transformatie",
  title = "Klaar voor?",
  titleAccent = "Schuif en ontdek het verschil.",
  beforeLabel = "Voor de training",
  afterLabel = "Na de training",
  items,
}: TransformationSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <section className="py-16 sm:py-[110px] border-b border-rule overflow-hidden">
      <Container>
        <FadeIn className="text-center mb-8 sm:mb-14">
          <Label className="mb-3">{eyebrow}</Label>
          <h2 className="font-display text-[clamp(24px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
            {title}
            <br />
            <em className="italic font-normal text-ink/40">
              {titleAccent}
            </em>
          </h2>
        </FadeIn>

        {/* Labels above slider */}
        <div className="flex justify-between mb-2 sm:mb-3 px-1">
          <span className="text-[10px] sm:text-[12px] font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase text-ink/50">
            {beforeLabel}
          </span>
          <span className="text-[10px] sm:text-[12px] font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase text-copper">
            {afterLabel}
          </span>
        </div>

        {/* Before/After comparison — two clipped layers, no overlap */}
        <div
          ref={containerRef}
          className="relative select-none touch-none cursor-col-resize"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Before cards — always rendered, visible where after doesn't cover */}
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-ink/20 border border-ink/20">
              {items.map((item, i) => (
                <ItemCard
                  key={`before-${i}`}
                  label={item.label}
                  text={item.before}
                  variant="before"
                />
              ))}
            </div>
          </div>

          {/* After cards — reveals from left, boundary matches divider position */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule h-full">
              {items.map((item, i) => (
                <ItemCard
                  key={`after-${i}`}
                  label={item.label}
                  text={item.after}
                  variant="after"
                />
              ))}
            </div>
          </div>

          {/* Divider line + handle */}
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{ left: `${position}%` }}
          >
            <div className="absolute top-0 bottom-0 -translate-x-1/2 w-0.5 bg-copper" />
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-copper flex items-center justify-center shadow-lg pointer-events-auto cursor-col-resize">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="text-paper"
              >
                <path
                  d="M4.5 3L1 8L4.5 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.5 3L15 8L11.5 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
