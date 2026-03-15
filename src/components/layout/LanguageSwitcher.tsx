"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

export function LanguageSwitcher({ lang }: { lang: Lang }) {
  const router = useRouter();

  function switchLang(target: Lang) {
    if (target === lang) return;
    document.cookie = `locale=${target};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 text-[12px] tracking-[0.05em]">
      <button
        type="button"
        onClick={() => switchLang("nl")}
        className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
          lang === "nl"
            ? "text-ink font-semibold"
            : "text-ink/30 hover:text-ink/60"
        }`}
      >
        NL
      </button>
      <span className="text-ink/15">|</span>
      <button
        type="button"
        onClick={() => switchLang("en")}
        className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
          lang === "en"
            ? "text-ink font-semibold"
            : "text-ink/30 hover:text-ink/60"
        }`}
      >
        EN
      </button>
    </div>
  );
}
