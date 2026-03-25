"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/i18n";

const MIN_TIME_MS = 3000;
const SCROLL_THRESHOLD = 0.3;
const STORAGE_KEY = "popup-dismissed";

const EXCLUDED_PATHS = ["/checkout", "/login", "/admin", "/dashboard"];

const fallbackContent = {
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

export function BookPopup({ lang }: { lang: Lang }) {
  const config = useQuery(api.settings.getPopupConfig);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  // Determine if popup should be shown on this page
  const isExcludedPath = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
  const configPages = config?.pages ?? [];
  const isAllowedPage =
    !isExcludedPath &&
    (configPages.length === 0 || configPages.some((p) => pathname === p || pathname.startsWith(p + "/")));

  // Use DB values or fallback
  const dbLabel = config?.label?.[lang] ?? config?.label?.nl;
  const dbTitle = config?.title?.[lang] ?? config?.title?.nl;
  const dbDescription = config?.description?.[lang] ?? config?.description?.nl;
  const dbCta = config?.cta?.[lang] ?? config?.cta?.nl;
  const dbImageUrl = config?.imageUrl;
  const s = fallbackContent[lang];

  const popupLabel = dbLabel || s.label;
  const popupTitle = dbTitle || s.title;
  const popupDescription = dbDescription || s.description;
  const popupCta = dbCta || s.cta;
  const popupImage = dbImageUrl || "/images/book/sales-oprecht-ontspannen-cover.png";

  const dismiss = useCallback(() => {
    setShow(false);
    setTimeout(() => {
      setMounted(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch { /* noop */ }
    }, 600);
  }, []);

  useEffect(() => {
    // Never show if config not loaded yet, disabled, or already dismissed
    if (config === undefined) return;
    if (!config || !config.enabled) return;
    if (!isAllowedPage) return;

    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch { /* noop */ }

    const startTime = Date.now();
    let triggered = false;

    function checkScroll() {
      if (triggered) return;
      const scrollRatio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      const elapsed = Date.now() - startTime;
      if (scrollRatio >= SCROLL_THRESHOLD && elapsed >= MIN_TIME_MS) {
        triggered = true;
        setMounted(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setShow(true));
        });
        window.removeEventListener("scroll", checkScroll);
      }
    }

    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [config, isAllowedPage]);

  useEffect(() => {
    if (!mounted) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mounted, dismiss]);

  // Don't render if config is disabled or not loaded
  if (!config?.enabled) return null;
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
      aria-label={popupTitle}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/30" />

      {/* Desktop */}
      <DesktopPopup
        lang={lang}
        label={popupLabel}
        title={popupTitle}
        description={popupDescription}
        ctaText={popupCta}
        image={popupImage}
        imageAlt={s.imageAlt}
        dismiss={dismiss}
        dismissText={s.dismiss}
      />

      {/* Mobile */}
      <MobilePopup
        lang={lang}
        show={show}
        label={popupLabel}
        title={popupTitle}
        description={popupDescription}
        ctaText={popupCta}
        image={popupImage}
        imageAlt={s.imageAlt}
        dismiss={dismiss}
        dismissText={s.dismiss}
      />
    </div>
  );
}

/* ─── Desktop Card ─── */

function DesktopPopup({
  lang,
  label,
  title,
  description,
  ctaText,
  image,
  imageAlt,
  dismiss,
  dismissText,
}: {
  lang: Lang;
  label: string;
  title: string;
  description: string;
  ctaText: string;
  image: string;
  imageAlt: string;
  dismiss: () => void;
  dismissText: string;
}) {
  return (
    <div className="hidden sm:block relative w-full max-w-[640px]">
      <div className="relative backdrop-blur-2xl bg-paper/80 border border-ink/[0.08] rounded-[3px] overflow-hidden shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-ink/30 hover:text-ink transition-colors cursor-pointer"
          aria-label="Sluiten"
        >
          <CloseIcon />
        </button>

        <div className="grid grid-cols-[180px_1fr]">
          <div className="flex items-center justify-center p-6 bg-warm/40 border-r border-ink/[0.06]">
            <Image src={image} alt={imageAlt} width={140} height={210} className="drop-shadow-lg" />
          </div>

          <div className="p-7 pr-12">
            <span className="text-copper text-[10px] font-medium tracking-[0.2em] uppercase block mb-2">
              {label}
            </span>
            <h2 className="font-display text-[24px] font-black leading-[0.97] tracking-[-0.03em] text-ink mb-3">
              {title}
            </h2>
            <p className="text-[13px] text-ink/60 leading-[1.7] mb-5">{description}</p>

            <div className="flex flex-col gap-2">
              <a
                href="/boek#bestellen"
                className="inline-flex items-center gap-2 bg-copper text-paper px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
              >
                {ctaText}
                <ArrowIcon />
              </a>
              {(lang === "en" || lang === "de") && (
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-ink/15 text-ink/60 px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-ink/25 hover:text-ink transition-colors rounded-[2px]"
                >
                  {{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}
                  <ArrowIcon />
                </a>
              )}
            </div>

            <button
              onClick={dismiss}
              className="block mt-3 text-[11px] text-ink/25 hover:text-ink/50 transition-colors cursor-pointer"
            >
              {dismissText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile Bottom Sheet ─── */

function MobilePopup({
  lang,
  show,
  label,
  title,
  description,
  ctaText,
  image,
  imageAlt,
  dismiss,
  dismissText,
}: {
  lang: Lang;
  show: boolean;
  label: string;
  title: string;
  description: string;
  ctaText: string;
  image: string;
  imageAlt: string;
  dismiss: () => void;
  dismissText: string;
}) {
  return (
    <div className={`sm:hidden fixed bottom-0 left-0 right-0 transition-transform duration-700 ease-out ${
      show ? "translate-y-0" : "translate-y-full"
    }`}>
      <div className="backdrop-blur-2xl bg-paper/85 border-t border-ink/[0.08] shadow-2xl px-5 pt-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-copper text-[10px] font-medium tracking-[0.2em] uppercase">
            {label}
          </span>
          <button
            onClick={dismiss}
            className="w-8 h-8 flex items-center justify-center text-ink/30 hover:text-ink transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="shrink-0">
            <Image src={image} alt={imageAlt} width={72} height={108} className="drop-shadow-md" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-[18px] font-black leading-[1] tracking-[-0.02em] text-ink mb-1">
              {title}
            </h2>
            <p className="text-[12px] text-ink/50 leading-[1.5] mb-3 line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <a
            href="/boek#bestellen"
            className="flex items-center justify-center gap-2 w-full bg-copper text-paper py-3.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
          >
            {ctaText}
            <ArrowIcon />
          </a>
          {(lang === "en" || lang === "de") && (
            <a
              href="/contact"
              className="flex items-center justify-center gap-2 w-full border border-ink/15 text-ink/60 py-3.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:border-ink/25 hover:text-ink transition-colors rounded-[2px]"
            >
              {{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}
              <ArrowIcon />
            </a>
          )}
        </div>

        <button
          onClick={dismiss}
          className="block mt-3 mx-auto text-[11px] text-ink/25 hover:text-ink/50 transition-colors cursor-pointer"
        >
          {dismissText}
        </button>
      </div>
    </div>
  );
}

/* ─── Icons ─── */

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7h8M8 4l3 3-3 3" />
    </svg>
  );
}
