"use client";

import { useState } from "react";
import { formatPrice, resolveUnitPrice, type QuantityTier } from "@/lib/checkout-config";
import type { Lang } from "@/lib/checkout-i18n";

interface Props {
  tiers: QuantityTier[];
  selected: number;
  onChange: (quantity: number) => void;
  lang: Lang;
  allowFreeQuantity?: boolean;
  defaultPriceCents: number;
}

const COPY = {
  nl: { aantal: "Aantal", populair: "Populair", bespaar: (p: number) => `Je bespaart ${p}%`, vanaf: "vanaf", of: "Of vul zelf een aantal in", placeholder: "bv. 75", totaal: "Totaal" },
  en: { aantal: "Quantity", populair: "Popular", bespaar: (p: number) => `Save ${p}%`, vanaf: "from", of: "Or enter your own quantity", placeholder: "e.g. 75", totaal: "Total" },
  de: { aantal: "Anzahl", populair: "Beliebt", bespaar: (p: number) => `Sie sparen ${p}%`, vanaf: "ab", of: "Oder eigene Anzahl eingeben", placeholder: "z.B. 75", totaal: "Gesamt" },
} as const;

export function QuantitySelector({ tiers, selected, onChange, lang, allowFreeQuantity, defaultPriceCents }: Props) {
  const c = COPY[lang];
  const presetQuantities = new Set(tiers.filter((t) => !t.isMinimum).map((t) => t.quantity));
  const isCustom = allowFreeQuantity && !presetQuantities.has(selected);
  const [customInput, setCustomInput] = useState<string>(isCustom ? String(selected) : "");

  function handleCustomChange(value: string) {
    setCustomInput(value);
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) onChange(n);
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 mb-2">
        {c.aantal}
      </p>
      <div className="grid gap-2">
        {tiers.map((tier) => {
          const isSelected = !isCustom && selected === tier.quantity;
          const isBest = tier.savingsPercent > 0 && tier.savingsPercent < 15;
          const displayQty = tier.isMinimum ? `${c.vanaf} ${tier.quantity}` : `${tier.quantity}x`;
          const total = tier.unitPriceCents * tier.quantity;

          return (
            <button
              key={`${tier.quantity}-${tier.isMinimum ? "min" : "exact"}`}
              type="button"
              onClick={() => { setCustomInput(""); onChange(tier.quantity); }}
              className={`relative flex items-center justify-between w-full border py-3 px-4 transition-colors rounded-[2px] cursor-pointer ${
                isSelected ? "border-copper bg-copper/5" : "border-rule hover:border-ink/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-copper" : "border-ink/20"}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-copper" />}
                </div>
                <div className="text-left">
                  <span className="text-[14px] text-ink">
                    {displayQty} {formatPrice(tier.unitPriceCents, lang)}
                  </span>
                  {isBest && (
                    <span className="ml-2 text-[10px] font-medium tracking-[0.1em] uppercase text-copper">
                      {c.populair}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {!tier.isMinimum && tier.quantity > 1 && (
                  <div>
                    <span className="text-[15px] font-medium text-ink">{formatPrice(total, lang)}</span>
                    {tier.savingsPercent > 0 && (
                      <span className="block text-[11px] text-copper font-medium">{c.bespaar(tier.savingsPercent)}</span>
                    )}
                  </div>
                )}
                {tier.isMinimum && tier.savingsPercent > 0 && (
                  <span className="block text-[11px] text-copper font-medium">{c.bespaar(tier.savingsPercent)}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {allowFreeQuantity && (
        <div className={`mt-2 border py-3 px-4 transition-colors rounded-[2px] ${isCustom ? "border-copper bg-copper/5" : "border-rule"}`}>
          <label className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isCustom ? "border-copper" : "border-ink/20"}`}>
              {isCustom && <div className="w-2 h-2 rounded-full bg-copper" />}
            </div>
            <span className="text-[13px] text-ink/70 shrink-0">{c.of}:</span>
            <input
              type="number"
              min={1}
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder={c.placeholder}
              className="w-20 bg-transparent border border-rule px-2 py-1 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
            {isCustom && selected > 0 && (
              <span className="ml-auto text-[13px] text-ink/70">
                {selected} × {formatPrice(resolveUnitPrice(tiers, selected, defaultPriceCents), lang)} =
                <strong className="ml-1 text-ink">{formatPrice(resolveUnitPrice(tiers, selected, defaultPriceCents) * selected, lang)}</strong>
              </span>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
