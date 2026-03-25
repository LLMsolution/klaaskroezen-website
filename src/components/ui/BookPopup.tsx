"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Lang } from "@/lib/i18n";

const MIN_TIME_MS = 3000;
const SCROLL_THRESHOLD = 0.3;
const STORAGE_KEY = "book-popup-dismissed";

const EXCLUDED_PATHS = ["/boek", "/checkout", "/login", "/admin", "/dashboard", "/contact"];

const content = {
  nl: {
    label: "#1 Managementboek",
    title: "Sales, Oprecht",
    titleAccent: "en Ontspannen.",
    description:
      "De praktische gids voor iedereen die het traditionele, pushy salesgedoe spuugzat is.",
    features: [
      "Direct toepasbare aanpak",
      "2.500+ verkocht — 2e druk",
      "Gratis verzending binnen NL",
    ],
    cta: "Bestel nu",
    dismiss: "Nee bedankt",
    imageAlt: "Boek: Sales, Oprecht en Ontspannen",
  },
  en: {
    label: "#1 Management Book",
    title: "Sales, Honest",
    titleAccent: "& Relaxed.",
    description:
      "The practical guide for anyone who is fed up with traditional, pushy sales tactics.",
    features: [
      "Immediately applicable approach",
      "2,500+ sold — 2nd edition",
      "Free shipping within NL",
    ],
    cta: "Order now",
    dismiss: "No thanks",
    imageAlt: "Book: Sales, Honest & Relaxed",
  },
  de: {
    label: "#1 Managementbuch",
    title: "Sales, Ehrlich",
    titleAccent: "& Entspannt.",
    description:
      "Der praktische Leitfaden für alle, die die traditionellen, aufdringlichen Verkaufsmethoden satt haben.",
    features: [
      "Sofort anwendbarer Ansatz",
      "2.500+ verkauft — 2. Auflage",
      "Kostenloser Versand innerhalb NL",
    ],
    cta: "Jetzt bestellen",
    dismiss: "Nein danke",
    imageAlt: "Buch: Sales, Ehrlich & Entspannt",
  },
};

export function BookPopup({ lang, coverImage }: { lang: Lang; coverImage?: string }) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const s = content[lang];

  const dismiss = useCallback(() => {
    setShow(false);
    setTimeout(() => {
      setMounted(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }, 600);
  }, []);

  useEffect(() => {
    if (EXCLUDED_PATHS.some((p) => window.location.pathname.startsWith(p))) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {}

    const startTime = Date.now();
    let triggered = false;

    function checkScroll() {
      if (triggered) return;
      // Re-check path in case of client-side navigation
      if (EXCLUDED_PATHS.some((p) => window.location.pathname.startsWith(p))) return;
      const scrollRatio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const elapsed = Date.now() - startTime;
      if (scrollRatio >= SCROLL_THRESHOLD && elapsed >= MIN_TIME_MS) {
        triggered = true;
        setMounted(true);
        // Small delay so the DOM renders at opacity-0 first, then transition to opacity-100
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setShow(true));
        });
        window.removeEventListener("scroll", checkScroll);
      }
    }

    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mounted, dismiss]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 transition-opacity duration-700 ease-out ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={s.title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/30" />

      {/* Desktop: light frosted glass card */}
      <div className="hidden sm:block relative w-full max-w-[640px]">
        <div className="relative backdrop-blur-2xl bg-paper/80 border border-ink/[0.08] rounded-[3px] overflow-hidden shadow-2xl">
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-ink/30 hover:text-ink transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>

          <div className="grid grid-cols-[180px_1fr]">
            {/* Book cover */}
            <div className="flex items-center justify-center p-6 bg-warm/40 border-r border-ink/[0.06]">
              <Image
                src={coverImage ?? "/images/book/sales-oprecht-ontspannen-cover.png"}
                alt={s.imageAlt}
                width={140}
                height={210}
                unoptimized={!!coverImage}
                className="drop-shadow-lg"
              />
            </div>

            {/* Content */}
            <div className="p-7 pr-12">
              <span className="text-copper text-[10px] font-medium tracking-[0.2em] uppercase block mb-2">
                {s.label}
              </span>
              <h2 className="font-display text-[24px] font-black leading-[0.97] tracking-[-0.03em] text-ink mb-1.5">
                {s.title}
                <br />
                <em className="italic font-normal text-copper">{s.titleAccent}</em>
              </h2>
              <p className="text-[13px] text-ink/60 leading-[1.7] mb-4">
                {s.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 mb-5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-ink/70">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-copper shrink-0">
                      <path d="M3.5 7l2.5 2.5L10.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex flex-col gap-2">
                <a
                  href="/boek#bestellen"
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
                    className="inline-flex items-center gap-2 border border-ink/15 text-ink/60 px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-ink/25 hover:text-ink transition-colors rounded-[2px]"
                  >
                    {{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 7h8M8 4l3 3-3 3" />
                    </svg>
                  </a>
                )}
              </div>

              <button
                onClick={dismiss}
                className="block mt-3 text-[11px] text-ink/25 hover:text-ink/50 transition-colors cursor-pointer"
              >
                {s.dismiss}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: light frosted glass bottom sheet */}
      <div className={`sm:hidden fixed bottom-0 left-0 right-0 transition-transform duration-700 ease-out ${
        show ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="backdrop-blur-2xl bg-paper/85 border-t border-ink/[0.08] shadow-2xl px-5 pt-5 pb-8">
          {/* Handle + close */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-copper text-[10px] font-medium tracking-[0.2em] uppercase">
              {s.label}
            </span>
            <button
              onClick={dismiss}
              className="w-8 h-8 flex items-center justify-center text-ink/30 hover:text-ink transition-colors cursor-pointer"
              aria-label="Sluiten"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <Image
                src={coverImage ?? "/images/book/sales-oprecht-ontspannen-cover.png"}
                alt={s.imageAlt}
                width={72}
                height={108}
                unoptimized={!!coverImage}
                className="drop-shadow-md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-[18px] font-black leading-[1] tracking-[-0.02em] text-ink mb-1">
                {s.title} <em className="italic font-normal text-copper">{s.titleAccent}</em>
              </h2>
              <p className="text-[12px] text-ink/50 leading-[1.5] mb-3 line-clamp-2">
                {s.description}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {s.features.map((f) => (
                  <span key={f} className="flex items-center gap-1 text-[11px] text-ink/60">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="text-copper shrink-0">
                      <path d="M3.5 7l2.5 2.5L10.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <a
              href="/boek#bestellen"
              className="flex items-center justify-center gap-2 w-full bg-copper text-paper py-3.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
            >
              {{ nl: "Bestel het boek", en: "Order the Dutch book", de: "Das niederländische Buch bestellen" }[lang]}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 7h8M8 4l3 3-3 3" />
              </svg>
            </a>
            {(lang === "en" || lang === "de") && (
              <a
                href="/contact"
                className="flex items-center justify-center gap-2 w-full border border-ink/15 text-ink/60 py-3.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-ink/25 hover:text-ink transition-colors rounded-[2px]"
              >
                {{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7h8M8 4l3 3-3 3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
