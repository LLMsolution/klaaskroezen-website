"use client";

import { formatPrice, getProduct, type CheckoutProduct } from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";

interface Props {
  product: CheckoutProduct;
  lang: Lang;
  selectedBumps: string[];
  totals: {
    productNet: number;
    productGross: number;
    totalGross: number;
    btwReversed: boolean;
    noBtw: boolean;
  };
}

export function OrderSummary({ product, lang, selectedBumps }: Props) {
  const i18n = t(lang);

  return (
    <div className="lg:sticky lg:top-8 space-y-8">
      {/* Product card */}
      <div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
          {i18n.orderSummary}
        </p>

        <div className="border border-rule rounded-[2px] overflow-hidden">
          {/* Product header */}
          <div className="p-6 border-b border-rule">
            <h2 className="font-display text-[20px] font-bold leading-[1.2] mb-2">
              {product.name[lang]}
            </h2>
            <p className="text-[14px] text-ink/60 leading-[1.6]">
              {product.description[lang]}
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-bold text-ink">
                {formatPrice(product.price, lang)}
              </span>
              <span className="text-[12px] text-ink/40">
                {product.priceInclBtw ? i18n.inclBtw : i18n.exBtw}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="p-6">
            <ul className="space-y-2.5">
              {product.features[lang].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[14px] text-ink/70">
                  <span className="text-copper mt-0.5 shrink-0">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Selected bumps */}
      {selectedBumps.length > 0 && (
        <div className="space-y-2">
          {selectedBumps.map((slug) => {
            const bump = getProduct(slug);
            if (!bump) return null;
            return (
              <div
                key={slug}
                className="flex items-center justify-between py-2 text-[13px] text-ink/60"
              >
                <span>+ {bump.shortName[lang]}</span>
                <span>{formatPrice(bump.price, lang)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Testimonial */}
      <div className="border-l-2 border-copper/30 pl-5">
        <p className="text-[14px] text-ink/70 leading-[1.7] italic">
          {lang === "nl"
            ? "\"Binnen 6 weken na de training hadden we 3 nieuwe enterprise-klanten gesloten. De ROI was duidelijk.\""
            : "\"Within 6 weeks of the training, we closed 3 new enterprise clients. The ROI was clear.\""}
        </p>
        <p className="text-[12px] text-ink/40 mt-2">
          — Mark de Vries, Sales Director
        </p>
      </div>

      {/* Social proof line */}
      <p className="text-[13px] text-ink/40 text-center">
        {lang === "nl"
          ? "340+ sales professionals getraind in 21 landen"
          : "340+ sales professionals trained across 21 countries"}
      </p>
    </div>
  );
}
