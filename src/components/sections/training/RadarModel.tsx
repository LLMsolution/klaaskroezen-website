"use client";

import { useRef, useState, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface RadarAxis {
  label: string;
  score: number;
}

interface RadarModelProps {
  axes?: RadarAxis[];
  lang?: "nl" | "en" | "de";
}

type RadarI18n = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  scoresLabel: string;
  scoresText: string;
  growLabel: string;
  growText: string;
  growSuffix: string;
  planLabel: string;
  planText: string;
  axes: RadarAxis[];
};

const RADAR_I18N: Record<"nl" | "en" | "de", RadarI18n> = {
  nl: {
    eyebrow: "Customer Experience Model",
    title: "Van onzeker",
    titleAccent: "naar inzicht.",
    description: "Vooraf weet je niet precies waar je staat. Na de training heb je een helder beeld\u00a0\u2014 met scores op zes gebieden en een persoonlijk actieplan.",
    scoresLabel: "Jouw scores",
    scoresText: "Inzicht in zes gebieden van klantcontact",
    growLabel: "Groeigebied",
    growText: "Focus op",
    growSuffix: "\u00a0— daar zit de meeste winst",
    planLabel: "Actieplan",
    planText: "Concrete stappen die je direct kunt toepassen",
    axes: [
      { label: "Oprecht", score: 8 },
      { label: "Ontspannen", score: 6 },
      { label: "Overtuigingen", score: 5 },
      { label: "Vorm", score: 7 },
      { label: "Inhoud", score: 7 },
      { label: "Proces", score: 4 },
    ],
  },
  en: {
    eyebrow: "Customer Experience Model",
    title: "From uncertain",
    titleAccent: "to insight.",
    description: "Before the training you don't know exactly where you stand. Afterwards you have a clear picture\u00a0\u2014 with scores on six areas and a personal action plan.",
    scoresLabel: "Your scores",
    scoresText: "Insight into six areas of customer contact",
    growLabel: "Growth area",
    growText: "Focus on",
    growSuffix: "\u00a0— that's where the biggest gain is",
    planLabel: "Action plan",
    planText: "Concrete steps you can apply immediately",
    axes: [
      { label: "Genuine", score: 8 },
      { label: "Relaxed", score: 6 },
      { label: "Beliefs", score: 5 },
      { label: "Form", score: 7 },
      { label: "Content", score: 7 },
      { label: "Process", score: 4 },
    ],
  },
  de: {
    eyebrow: "Customer Experience Model",
    title: "Von unsicher",
    titleAccent: "zu Einsicht.",
    description: "Vorher weißt du nicht genau, wo du stehst. Nach dem Training hast du ein klares Bild\u00a0\u2014 mit Scores in sechs Bereichen und einem persönlichen Aktionsplan.",
    scoresLabel: "Deine Scores",
    scoresText: "Einblick in sechs Bereiche des Kundenkontakts",
    growLabel: "Wachstumsbereich",
    growText: "Fokus auf",
    growSuffix: "\u00a0— da liegt der größte Gewinn",
    planLabel: "Aktionsplan",
    planText: "Konkrete Schritte, die du sofort anwenden kannst",
    axes: [
      { label: "Ehrlich", score: 8 },
      { label: "Entspannt", score: 6 },
      { label: "Überzeugungen", score: 5 },
      { label: "Form", score: 7 },
      { label: "Inhalt", score: 7 },
      { label: "Prozess", score: 4 },
    ],
  },
};

const CX = 250;
const CY = 250;
const R = 135;
const BANDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SECTOR_GAP = 0.04;

function cellPoints(axisIdx: number, band: number, total: number): string {
  const sector = (2 * Math.PI) / total;
  const base = axisIdx * sector - Math.PI / 2;
  const half = sector / 2 - SECTOR_GAP;
  const r0 = ((band - 1) / 10) * R;
  const r1 = (band / 10) * R;
  const aL = base - half;
  const aR = base + half;

  if (band === 1) {
    return `${CX},${CY} ${CX + r1 * Math.cos(aL)},${CY + r1 * Math.sin(aL)} ${CX + r1 * Math.cos(aR)},${CY + r1 * Math.sin(aR)}`;
  }
  return `${CX + r0 * Math.cos(aL)},${CY + r0 * Math.sin(aL)} ${CX + r1 * Math.cos(aL)},${CY + r1 * Math.sin(aL)} ${CX + r1 * Math.cos(aR)},${CY + r1 * Math.sin(aR)} ${CX + r0 * Math.cos(aR)},${CY + r0 * Math.sin(aR)}`;
}

function polarToCart(axisIdx: number, value: number, total: number) {
  const angle = (axisIdx * 2 * Math.PI) / total - Math.PI / 2;
  const dist = (value / 10) * R;
  return { x: CX + dist * Math.cos(angle), y: CY + dist * Math.sin(angle) };
}

function AxisLabels({ axes }: { axes: RadarAxis[] }) {
  const total = axes.length;
  return (
    <>
      {axes.map((axis, i) => {
        const p = polarToCart(i, 11.8, total);
        const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const anchor =
          Math.abs(cosA) < 0.3 ? "middle" : cosA > 0 ? "start" : "end";
        const dy = sinA < -0.5 ? "-0.2em" : sinA > 0.5 ? "1em" : "0.35em";
        return (
          <text
            key={`label-${i}`}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dy={dy}
            fill="var(--color-ink)"
            fillOpacity="0.35"
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {axis.label}
          </text>
        );
      })}
    </>
  );
}

function QuestionMarkSvg() {
  return (
    <div className="bg-paper">
      <svg viewBox="0 0 500 500" className="w-full" overflow="visible">
        <rect x="0" y="0" width="500" height="500" fill="var(--color-paper)" />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dy="0.35em"
          fill="var(--color-ink)"
          fillOpacity="0.08"
          style={{
            fontSize: "180px",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
          }}
        >
          ?
        </text>
      </svg>
      <div className="grid grid-cols-3 gap-px bg-rule border-t border-rule">
        {[
          { title: "Sterke punten", sub: "Niet inzichtelijk" },
          { title: "Zwakke punten", sub: "Lastig te zeggen" },
          { title: "Hoe verbeteren", sub: "Geen idee" },
        ].map((item) => (
          <div key={item.title} className="bg-paper p-4 sm:p-5">
            <span className="block text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-1.5">
              {item.title}
            </span>
            <span className="block text-[12px] sm:text-[13px] text-ink/35 leading-[1.5]">
              {item.sub}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarSvg({ axes, t }: { axes: RadarAxis[]; t: RadarI18n }) {
  const total = axes.length;
  const lowest = axes.reduce(
    (min, a, i) => (a.score < min.score ? { ...a, idx: i } : min),
    { ...axes[0], idx: 0 }
  );
  return (
    <div className="bg-paper">
      <svg viewBox="0 0 500 500" className="w-full" overflow="visible">
        <rect x="0" y="0" width="500" height="500" fill="var(--color-paper)" />
        {axes.map((axis, ai) =>
          BANDS.map((band) => {
            const filled = axis.score >= band;
            return (
              <polygon
                key={`n-${ai}-${band}`}
                points={cellPoints(ai, band, total)}
                fill={filled ? "var(--color-copper)" : "none"}
                fillOpacity={filled ? "0.22" : "0"}
                stroke={filled ? "var(--color-copper)" : "var(--color-ink)"}
                strokeOpacity={filled ? "0.35" : "0.08"}
                strokeWidth="0.5"
              />
            );
          })
        )}
        <AxisLabels axes={axes} />
      </svg>
      <div className="grid grid-cols-3 gap-px bg-rule border-t border-rule">
        <div className="bg-paper p-4 sm:p-5">
          <span className="block text-[10px] font-medium tracking-[0.15em] uppercase text-copper mb-1.5">
            {t.scoresLabel}
          </span>
          <span className="block text-[12px] sm:text-[13px] text-ink/70 leading-[1.5]">
            {t.scoresText}
          </span>
        </div>
        <div className="bg-paper p-4 sm:p-5">
          <span className="block text-[10px] font-medium tracking-[0.15em] uppercase text-copper mb-1.5">
            {t.growLabel}
          </span>
          <span className="block text-[12px] sm:text-[13px] text-ink/70 leading-[1.5]">
            {t.growText} <strong className="font-semibold text-ink">{lowest.label}</strong>{t.growSuffix}
          </span>
        </div>
        <div className="bg-paper p-4 sm:p-5">
          <span className="block text-[10px] font-medium tracking-[0.15em] uppercase text-copper mb-1.5">
            {t.planLabel}
          </span>
          <span className="block text-[12px] sm:text-[13px] text-ink/70 leading-[1.5]">
            {t.planText}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RadarModel({
  axes,
  lang = "nl",
}: RadarModelProps) {
  const i18n = RADAR_I18N[lang];
  const { eyebrow, title, titleAccent, description } = i18n;
  const actualAxes = axes || i18n.axes;
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition(
      Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    );
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as Element).setPointerCapture(e.pointerId);
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
        <FadeIn className="text-center mb-8 sm:mb-12">
          <Label className="mb-3">{eyebrow}</Label>
          <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
            {title}
            <br />
            <em className="italic font-normal text-ink/40">{titleAccent}</em>
          </h2>
          <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8] max-w-[480px] mx-auto mt-5">
            {description}
          </p>
        </FadeIn>

        <div
          ref={containerRef}
          className="relative select-none touch-none cursor-col-resize max-w-[640px] mx-auto"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Labels */}
          <div className="flex justify-between mb-2 sm:mb-3 px-1">
            <span className="text-[10px] sm:text-[12px] font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase text-ink/50">
              {lang === "en" ? "Before training" : lang === "de" ? "Vor dem Training" : "Voor de training"}
            </span>
            <span className="text-[10px] sm:text-[12px] font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase text-copper">
              {lang === "en" ? "After training" : lang === "de" ? "Nach dem Training" : "Na de training"}
            </span>
          </div>

          {/* "?" base + radar overlay that wipes in from the right */}
          <div className="relative">
            {/* "?" — always rendered, visible where radar doesn't cover */}
            <div>
              <QuestionMarkSvg />
            </div>

            {/* Radar — reveals from left, boundary matches divider position */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <RadarSvg axes={actualAxes} t={i18n} />
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
        </div>
      </Container>
    </section>
  );
}
