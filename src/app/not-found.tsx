"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { t, type Lang } from "@/lib/i18n";

function getClientLocale(): Lang {
  if (typeof document === "undefined") return "nl";
  const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
  return match?.[1] === "en" ? "en" : "nl";
}

export default function NotFound() {
  const [lang, setLang] = useState<Lang>("nl");

  useEffect(() => {
    setLang(getClientLocale());
  }, []);

  const s = t(lang).notFound;

  return (
    <section className="min-h-[60vh] flex items-center justify-center px-7 sm:px-14 py-20">
      <div className="text-center max-w-md">
        <p className="font-body text-[10.5px] font-medium tracking-[0.22em] uppercase text-copper mb-4">
          {s.heading}
        </p>
        <h1 className="font-display text-[clamp(48px,8vw,96px)] font-black leading-[0.9] tracking-[-0.04em] mb-4">
          404
        </h1>
        <p className="text-[15px] font-light text-ink/50 leading-[1.85] mb-8">
          {s.body}
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-[7px] font-body text-[11.5px] font-medium tracking-[0.09em] uppercase rounded-[2px] border transition-all duration-200 whitespace-nowrap px-[22px] py-[13px] bg-copper text-paper border-copper hover:bg-copper-light hover:border-copper-light outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2"
          >
            {s.homeCta}
          </Link>
          <Link
            href="/sales-excellence-training"
            className="group inline-flex items-center justify-center gap-[7px] font-body text-[11.5px] font-medium tracking-[0.09em] uppercase rounded-[2px] border transition-all duration-200 whitespace-nowrap px-[22px] py-[13px] bg-transparent text-ink border-rule hover:border-ink/35 outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            {s.trainingCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
