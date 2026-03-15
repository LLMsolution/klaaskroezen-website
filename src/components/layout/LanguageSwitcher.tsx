"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

function NlFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-[1px]">
      <rect width="20" height="4.67" fill="#AE1C28" />
      <rect y="4.67" width="20" height="4.67" fill="#FFF" />
      <rect y="9.33" width="20" height="4.67" fill="#21468B" />
    </svg>
  );
}

function EnFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-[1px]">
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0L20 14M20 0L0 14" stroke="#FFF" strokeWidth="2.5" />
      <path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M10 0V14M0 7H20" stroke="#FFF" strokeWidth="4" />
      <path d="M10 0V14M0 7H20" stroke="#C8102E" strokeWidth="2.5" />
    </svg>
  );
}

const flags: Record<Lang, React.ReactNode> = {
  nl: <NlFlag />,
  en: <EnFlag />,
};

const labels: Record<Lang, string> = {
  nl: "Nederlands",
  en: "English",
};

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  function switchLang(target: Lang) {
    if (target === lang) {
      setOpen(false);
      return;
    }
    document.cookie = `locale=${target};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    router.refresh();
  }

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const other: Lang = lang === "nl" ? "en" : "nl";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1.5 rounded-[2px] transition-opacity cursor-pointer hover:opacity-80"
        aria-label={labels[lang]}
        aria-expanded={open}
      >
        {flags[lang]}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-paper/50 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4L5 6.5L7.5 4" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-ink border border-paper/[0.1] rounded-[2px] shadow-xl overflow-hidden min-w-[140px]">
          <button
            type="button"
            onClick={() => switchLang("nl")}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-[13px] transition-colors cursor-pointer ${
              lang === "nl"
                ? "text-paper bg-paper/[0.06]"
                : "text-paper/60 hover:text-paper hover:bg-paper/[0.04]"
            }`}
          >
            <NlFlag />
            Nederlands
          </button>
          <button
            type="button"
            onClick={() => switchLang("en")}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-[13px] transition-colors cursor-pointer ${
              lang === "en"
                ? "text-paper bg-paper/[0.06]"
                : "text-paper/60 hover:text-paper hover:bg-paper/[0.04]"
            }`}
          >
            <EnFlag />
            English
          </button>
        </div>
      )}
    </div>
  );
}
