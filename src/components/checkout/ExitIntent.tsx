"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { t, type Lang } from "@/lib/checkout-i18n";

interface Props {
  lang: Lang;
  show: boolean;
}

export function ExitIntent({ lang, show }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const i18n = t(lang);

  // Admin-editable copy (siteContent page "checkout-shared", section "exit-intent")
  // Falls back to checkout-i18n constants while DB content is loading or empty.
  const dbContent = useQuery(api.siteContent.getPageContent, {
    slug: "checkout-shared",
    lang,
  });
  const exitData = (dbContent?.["exit-intent"] ?? {}) as {
    title?: string;
    body?: string;
    cta?: string;
    dismiss?: string;
  };
  const exitTitle = exitData.title?.trim() || i18n.exitTitle;
  const exitBody = exitData.body?.trim() || i18n.exitBody;
  const exitCta = exitData.cta?.trim() || i18n.exitCta;
  const exitDismiss = exitData.dismiss?.trim() || i18n.exitDismiss;

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 0 && show && !dismissed) {
        setVisible(true);
      }
    },
    [show, dismissed],
  );

  useEffect(() => {
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-7">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 animate-[fadeIn_0.2s_ease-out]"
        onClick={() => {
          setVisible(false);
          setDismissed(true);
        }}
      />

      {/* Modal */}
      <div className="relative bg-paper max-w-[420px] w-full p-8 rounded-[2px] shadow-2xl animate-[slideUp_0.3s_ease-out]">
        {/* Close button */}
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-ink/30 hover:text-ink transition-colors cursor-pointer"
          aria-label="Sluiten"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Shield icon */}
        <div className="w-14 h-14 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-copper"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>

        <h3 className="font-display text-[22px] font-bold text-center leading-[1.2] mb-2">
          {exitTitle}
        </h3>
        <p className="text-[15px] text-ink/60 text-center leading-[1.7] mb-6">
          {exitBody}
        </p>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer mb-3"
        >
          {exitCta}
        </button>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="w-full text-[13px] text-ink/40 hover:text-ink/60 transition-colors cursor-pointer text-center"
        >
          {exitDismiss}
        </button>
      </div>
    </div>
  );
}
