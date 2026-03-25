"use client";

import { formatPrice, type QuantityTier } from "@/lib/checkout-config";
import type { Lang } from "@/lib/checkout-i18n";

interface Props {
  tiers: QuantityTier[];
  selected: number;
  onChange: (quantity: number) => void;
  lang: Lang;
}

export function QuantitySelector({ tiers, selected, onChange, lang }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 mb-2">
        {{ nl: "Aantal", en: "Quantity", de: "Anzahl" }[lang]}
      </p>
      <div className="grid gap-2">
        {tiers.map((tier) => {
          const isSelected = selected === tier.quantity;
          const total = tier.unitPriceCents * tier.quantity;
          const isBest = tier.savingsPercent > 0 && tier.savingsPercent < 15;

          return (
            <button
              key={tier.quantity}
              type="button"
              onClick={() => onChange(tier.quantity)}
              className={`relative flex items-center justify-between w-full border py-3 px-4 transition-colors rounded-[2px] cursor-pointer ${
                isSelected
                  ? "border-copper bg-copper/5"
                  : "border-rule hover:border-ink/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? "border-copper" : "border-ink/20"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-copper" />
                  )}
                </div>
                <div className="text-left">
                  <span className="text-[14px] text-ink">
                    {tier.quantity}x {formatPrice(tier.unitPriceCents, lang)}
                  </span>
                  {isBest && (
                    <span className="ml-2 text-[10px] font-medium tracking-[0.1em] uppercase text-copper">
                      {{ nl: "Populair", en: "Popular", de: "Beliebt" }[lang]}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {tier.quantity > 1 && (
                  <div>
                    <span className="text-[15px] font-medium text-ink">
                      {formatPrice(total, lang)}
                    </span>
                    <span className="block text-[11px] text-copper font-medium">
                      {{ nl: `Je bespaart ${tier.savingsPercent}%`, en: `Save ${tier.savingsPercent}%`, de: `Sie sparen ${tier.savingsPercent}%` }[lang]}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
