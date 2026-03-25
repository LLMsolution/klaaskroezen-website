"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import type { Lang } from "@/lib/i18n";

const PAGES = [
  "/images/book/preview/page-5.png",
  "/images/book/preview/page-6.png",
  "/images/book/preview/page-7.png",
  "/images/book/preview/page-8.png",
  "/images/book/preview/page-9.png",
  "/images/book/preview/page-11.png",
  "/images/book/preview/page-14.png",
  "/images/book/preview/page-19.png",
  "/images/book/preview/page-21.png",
  "/images/book/preview/page-25.png",
  "/images/book/preview/page-27.png",
  "/images/book/preview/page-28.png",
  "/images/book/preview/page-31.png",
  "/images/book/preview/page-33.png",
  "/images/book/preview/page-35.png",
  "/images/book/preview/page-39.png",
  "/images/book/preview/page-132.png",
];

const content = {
  nl: {
    label: "Gratis voorproefje",
    title: "Blader door",
    titleAccent: "het boek.",
    description: "Lees een fragment uit Sales, Oprecht en Ontspannen.",
    cta: "Bestel het boek",
    page: "Pagina",
    of: "van",
    prev: "Vorige pagina",
    next: "Volgende pagina",
  },
  en: {
    label: "Free preview",
    title: "Browse through",
    titleAccent: "the book.",
    description: "Read a fragment of Sales, Honest & Relaxed.",
    cta: "Order the book",
    page: "Page",
    of: "of",
    prev: "Previous page",
    next: "Next page",
  },
  de: {
    label: "Kostenlose Vorschau",
    title: "Blättern Sie durch",
    titleAccent: "das Buch.",
    description: "Lesen Sie einen Auszug aus Sales, Ehrlich & Entspannt.",
    cta: "Buch bestellen",
    page: "Seite",
    of: "von",
    prev: "Vorherige Seite",
    next: "Nächste Seite",
  },
};

const SWIPE_THRESHOLD = 50;

export function BookPreview({ lang }: { lang: Lang }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const s = content[lang];

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? PAGES.length - 1 : c - 1));
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c === PAGES.length - 1 ? 0 : c + 1));
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > SWIPE_THRESHOLD) next();
    else if (diff < -SWIPE_THRESHOLD) prev();
  }

  return (
    <section className="border-b border-rule bg-warm/40">
      {/* Mobile: text first, then preview */}
      <div className="lg:hidden bg-warm px-7 pt-12 pb-6 sm:px-10">
        <FadeIn className="max-w-[440px]">
          <Label className="mb-3">{s.label}</Label>
          <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em] mb-3">
            {s.title}{" "}
            <em className="italic font-normal text-ink/40">{s.titleAccent}</em>
          </h2>
          <p className="text-[15px] text-ink/60 leading-[1.8] mb-5">
            {s.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#bestellen"
              className="inline-flex items-center gap-2 bg-copper text-paper px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
            >
              {{ nl: "Bestel het boek", en: "Order the Dutch book", de: "Das niederländische Buch bestellen" }[lang]}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 7h8M8 4l3 3-3 3" />
              </svg>
            </a>
            {(lang === "en" || lang === "de") && (
              <a
                href="/contact"
                className="inline-flex items-center gap-2 border border-ink/15 text-ink/70 px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-ink/30 hover:text-ink transition-colors rounded-[2px]"
              >
                {{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7h8M8 4l3 3-3 3" />
                </svg>
              </a>
            )}
          </div>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-screen">
        {/* Left: Book page viewer */}
        <div
          className="bg-warm flex items-center justify-center px-7 py-6 sm:p-12 lg:p-16"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex flex-col items-center w-full lg:w-auto">
            <div className="relative bg-white shadow-2xl rounded-[2px] overflow-hidden w-full lg:w-auto lg:h-[70vh] aspect-[448/683]">
              <Image
                src={PAGES[current]}
                alt={`${s.page} ${current + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 90vw, 40vw"
                priority={current === 0}
              />
            </div>

            {/* Controls — fixed width to prevent jumping */}
            <div className="flex items-center justify-center gap-6 mt-5 w-full max-w-[200px]">
              <button
                onClick={prev}
                className="text-ink/30 hover:text-ink/60 transition-colors cursor-pointer"
                aria-label={s.prev}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5l-5 5 5 5" />
                </svg>
              </button>

              <span className="text-[12px] text-ink/35 tabular-nums tracking-[0.05em] w-[50px] text-center">
                {current + 1} / {PAGES.length}
              </span>

              <button
                onClick={next}
                className="text-ink/30 hover:text-ink/60 transition-colors cursor-pointer"
                aria-label={s.next}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 5l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Copy + CTA (desktop only) */}
        <div className="hidden lg:flex flex-col justify-center px-16 py-20">
          <FadeIn className="max-w-[440px]">
            <div>
              <Label className="mb-3">{s.label}</Label>
              <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
                {s.title}
                <br />
                <em className="italic font-normal text-ink/40">{s.titleAccent}</em>
              </h2>
              <p className="text-[15px] sm:text-[16px] text-ink/60 leading-[1.8] mb-8">
                {s.description}
              </p>
            </div>

            {/* Book cover + CTA */}
            <div className="flex items-end gap-6 mb-6 lg:mb-8">
              <div className="shrink-0">
                <Image
                  src="/images/book/sales-oprecht-ontspannen-cover.png"
                  alt={s.label}
                  width={100}
                  height={150}
                  className="drop-shadow-lg"
                />
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="#bestellen"
                  className="inline-flex items-center gap-2 bg-copper text-paper px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
                >
                  {{ nl: "Bestel het boek", en: "Order the Dutch book", de: "Das niederländische Buch bestellen" }[lang]}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7h8M8 4l3 3-3 3" />
                  </svg>
                </a>
                {(lang === "en" || lang === "de") && (
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 border border-ink/15 text-ink/70 px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-ink/30 hover:text-ink transition-colors rounded-[2px]"
                  >
                    {{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 7h8M8 4l3 3-3 3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {PAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                    i === current ? "bg-copper" : "bg-ink/10 hover:bg-ink/20"
                  }`}
                  aria-label={`${s.page} ${i + 1}`}
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
