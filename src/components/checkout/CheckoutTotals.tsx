"use client";

import { formatPrice, type BumpConfig } from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";

interface TotalsData {
  productNet: number;
  productBtw: number;
  productGross: number;
  bumpsNet: number;
  bumpsBtw: number;
  bumpsGross: number;
  totalNet: number;
  totalBtw: number;
  totalGross: number;
  btwReversed: boolean;
  noBtw: boolean;
}

interface Props {
  totals: TotalsData;
  productShortName: Record<string, string>;
  selectedBumps: string[];
  bumps: BumpConfig[];
  discountStatus: "idle" | "valid" | "invalid" | "expired" | "maxed" | "wrong_product";
  discountValue: { type: "percentage" | "fixed"; value: number } | null;
  lang: Lang;
  payingMethod: string | null;
  showDirectAccess: boolean;
  error: string;
}

export function CheckoutTotals({
  totals, productShortName, selectedBumps, bumps,
  discountStatus, discountValue,
  lang, payingMethod, showDirectAccess, error,
}: Props) {
  const i18n = t(lang);

  return (
    <>
      {/* Live total */}
      <div className="border-t border-rule pt-4 space-y-2">
        <div className="flex justify-between text-[13px]">
          <span className="text-ink/50">{productShortName[lang]}</span>
          <span className="text-ink">{formatPrice(totals.productGross, lang)}</span>
        </div>
        {selectedBumps.map((slug) => {
          const bump = bumps.find((b) => b.slug === slug);
          if (!bump) return null;
          return (
            <div key={slug} className="flex justify-between text-[13px]">
              <span className="text-ink/50">+ {bump.name[lang]}</span>
              <span className="text-ink">{formatPrice(bump.price, lang)}</span>
            </div>
          );
        })}
        {discountStatus === "valid" && discountValue && (
          <div className="flex justify-between text-[13px]">
            <span className="text-green-600">{{ nl: "Korting", en: "Discount", de: "Rabatt" }[lang]}</span>
            <span className="text-green-600">-{discountValue.type === "percentage" ? `${discountValue.value}%` : formatPrice(discountValue.value, lang)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-rule">
          <span className="text-[14px] font-medium text-ink">{i18n.total}</span>
          <span className="font-display text-[20px] font-bold text-ink">{formatPrice(totals.totalGross, lang)}</span>
        </div>
        {totals.btwReversed && <p className="text-[11px] text-copper text-right">{i18n.btwReversed}</p>}
        {!totals.btwReversed && !totals.noBtw && (
          <p className="text-[11px] text-ink/30 text-right">
            {{ nl: "Waarvan", en: "Including", de: "Davon" }[lang]} {formatPrice(totals.totalBtw, lang)} {i18n.btw}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!!payingMethod}
        className="w-full bg-copper text-paper py-4 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-3"
      >
        {payingMethod ? (
          <>
            <div className="w-5 h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
            {i18n.processing}
          </>
        ) : (
          `${i18n.payNow} — ${formatPrice(totals.totalGross, lang)}`
        )}
      </button>

      {showDirectAccess && (
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink/35">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          {i18n.directAccess}
        </p>
      )}

      {error && <p className="text-[13px] text-red-600 text-center">{error}</p>}
    </>
  );
}
