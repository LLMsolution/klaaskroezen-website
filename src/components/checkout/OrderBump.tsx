"use client";

import Image from "next/image";
import { formatPrice, type BumpConfig } from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";

interface Props {
  bump: BumpConfig;
  lang: Lang;
  selected: boolean;
  onToggle: () => void;
}

function HeadphoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function BumpImage({ bump, lang }: { bump: BumpConfig; lang: Lang }) {
  if (!bump.image) return null;

  const icon =
    bump.mockupType === "audio" ? <HeadphoneIcon /> :
    bump.mockupType === "tablet" ? <GlobeIcon /> :
    null;

  return (
    <div className="relative w-[48px] shrink-0 self-center">
      <div className="relative w-[48px] h-[64px]">
        <Image
          src={bump.image}
          alt={bump.name[lang]}
          fill
          className="object-contain drop-shadow-md"
          sizes="48px"
        />
      </div>
      {icon && (
        <div className="absolute -bottom-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-copper flex items-center justify-center shadow-sm">
          {icon}
        </div>
      )}
    </div>
  );
}

export function OrderBump({ bump, lang, selected, onToggle }: Props) {
  const i18n = t(lang);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-[2px] p-4 cursor-pointer transition-all duration-200 ${
        selected
          ? "border-2 border-copper bg-copper/8 scale-[1.01] shadow-md shadow-copper/10"
          : "border-2 border-dashed border-copper/25 bg-copper/[0.02] hover:border-copper/50 hover:bg-copper/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded-[2px] border-2 flex items-center justify-center shrink-0 transition-colors ${
            selected ? "bg-copper border-copper" : "border-copper/30"
          }`}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M5 12l5 5L19 7" />
            </svg>
          )}
        </div>
        {bump.image && <BumpImage bump={bump} lang={lang} />}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-copper">
            {i18n.bumpCta} {formatPrice(bump.price, lang)}
          </p>
          <p className="text-[14px] font-bold text-ink mt-0.5">
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
