"use client";

import { formatPrice, type BumpConfig } from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";

interface Props {
  bump: BumpConfig;
  lang: Lang;
  selected: boolean;
  onToggle: () => void;
}

export function OrderBump({ bump, lang, selected, onToggle }: Props) {
  const i18n = t(lang);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left border-2 rounded-[2px] p-4 transition-all cursor-pointer ${
        selected
          ? "border-copper bg-copper/5"
          : "border-dashed border-rule hover:border-copper/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded-[2px] border-2 flex items-center justify-center shrink-0 transition-colors ${
            selected ? "bg-copper border-copper" : "border-ink/20"
          }`}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M5 12l5 5L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-ink">
            {i18n.bumpCta} {formatPrice(bump.price, lang)}
          </p>
          <p className="text-[14px] font-medium text-ink mt-0.5">
            {bump.name[lang]}
          </p>
          <p className="text-[12px] text-ink/50 mt-1 leading-[1.5]">
            {bump.description[lang]}
          </p>
        </div>
      </div>
    </button>
  );
}
