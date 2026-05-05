"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatPrice, type CheckoutProduct } from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold tracking-wider shrink-0 bg-ink/[0.06] text-ink/50">
      {initials}
    </div>
  );
}

interface SummaryProps {
  product: CheckoutProduct;
  lang: Lang;
}

export function OrderSummary({ product, lang }: SummaryProps) {
  const i18n = t(lang);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
          {i18n.orderSummary}
        </p>

        <div className="border border-rule rounded-[2px] overflow-hidden">
          {product.image && (
            product.type === "book" ? (
              <div className="bg-warm p-8 flex items-center justify-center">
                <Image
                  src={product.image}
                  alt={product.name[lang]}
                  width={200}
                  height={280}
                  className="object-contain drop-shadow-xl"
                  sizes="200px"
                  priority
                />
              </div>
            ) : (
              <div className="relative aspect-[16/9] bg-warm">
                <Image
                  src={product.image}
                  alt={product.name[lang]}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
              </div>
            )
          )}

          <div className="p-6 border-b border-rule">
            <h2 className="font-display text-[20px] font-bold leading-[1.2] mb-2">
              {product.name[lang]}
            </h2>
            <p className="text-[14px] text-ink/60 leading-[1.6]">
              {product.description[lang]}
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-[28px] font-bold text-ink">
                {formatPrice(product.priceCents, lang)}
              </span>
              <span className="text-[12px] text-ink/40">
                {product.priceInclBtw ? i18n.inclBtw : i18n.exBtw}
              </span>
            </div>
          </div>

          <div className="p-6">
            <ul className="space-y-2.5">
              {product.features[lang].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[14px] text-ink/70">
                  <span className="text-copper mt-0.5 shrink-0">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TRUST_LOGOS = [
  { src: "/images/logos/visma.png", alt: "Visma", w: 64 },
  { src: "/images/logos/vasco.png", alt: "Vasco", w: 56 },
  { src: "/images/logos/mt-sprout.png", alt: "MT/Sprout", w: 56 },
  { src: "/images/logos/mom-in-balance.png", alt: "Mom in Balance", w: 56 },
];

interface ReviewsProps {
  productType: "training" | "book";
  productSlug: string;
  lang: Lang;
  logos?: Array<{ src: string; alt: string; w: number }>;
}

export function CheckoutReviews({ productType, productSlug, lang, logos }: ReviewsProps) {
  const reviews = useQuery(api.checkoutReviews.listForProduct, {
    productType,
    productSlug,
  });

  // Admin-editable copy (siteContent page "checkout-shared")
  const dbContent = useQuery(api.siteContent.getPageContent, {
    slug: "checkout-shared",
    lang,
  });
  const stats = (dbContent?.["trust-stats"] ?? {}) as {
    ratingValue?: string;
    ratingLabel?: string;
    trainedText?: string;
    soldText?: string;
  };
  const trustedBy = (dbContent?.["trusted-by"] ?? {}) as {
    label?: string;
    logos?: Array<{ image?: string; alt?: string; width?: number }>;
  };

  const ratingValue = stats.ratingValue?.trim() || "9.1";
  const ratingLabel =
    stats.ratingLabel?.trim() ||
    { nl: "Gemiddelde beoordeling", en: "Average rating", de: "Durchschnittsbewertung" }[lang];
  const productStat =
    productType === "training"
      ? stats.trainedText?.trim() ||
        { nl: "340+ sales professionals getraind in 21 landen", en: "340+ sales professionals trained across 21 countries", de: "340+ Vertriebsprofis in 21 Ländern geschult" }[lang]
      : stats.soldText?.trim() || "";
  const trustedByLabel =
    trustedBy.label?.trim() ||
    { nl: "Vertrouwd door", en: "Trusted by", de: "Vertraut von" }[lang];
  const dbLogos = (trustedBy.logos ?? [])
    .filter((l) => l.image && l.alt)
    .map((l) => ({ src: l.image as string, alt: l.alt as string, w: l.width ?? 56 }));
  const finalLogos = logos ?? (dbLogos.length > 0 ? dbLogos : DEFAULT_TRUST_LOGOS);

  return (
    <div className="space-y-8">
      {/* Video testimonial */}
      <div className="border border-rule rounded-[2px] overflow-hidden">
        <div className="relative aspect-video">
          <iframe
            src="https://www.youtube.com/embed/F6io8l_VYww"
            title={{ nl: "Klaas Kroezen — Boeklancering", en: "Klaas Kroezen — Book launch", de: "Klaas Kroezen — Buchvorstellung" }[lang]}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <p className="px-4 py-2.5 text-[11px] text-ink/40">
          {{ nl: "Klaas over zijn aanpak — 3 min", en: "Klaas on his approach — 3 min", de: "Klaas über seinen Ansatz — 3 Min." }[lang]}
        </p>
      </div>

      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            {{ nl: "Wat anderen zeggen", en: "What others say", de: "Was andere sagen" }[lang]}
          </p>
          {reviews.map((review) => (
            <div key={review._id} className="border border-rule rounded-[2px] p-5">
              <div className="flex gap-1 text-copper text-[10px] mb-3">
                {"★".repeat(review.rating).split("").map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <blockquote className="text-[14px] text-ink/70 leading-[1.7] italic mb-4">
                &ldquo;{review.text[lang]}&rdquo;
              </blockquote>
              <footer className="flex items-center gap-2.5">
                {review.avatar ? (
                  <Image
                    src={review.avatar}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover bg-warm shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <InitialsAvatar name={review.name} />
                )}
                <div>
                  <cite className="text-[13px] font-medium not-italic text-ink block">
                    {review.name}
                  </cite>
                  <span className="text-[11px] text-ink/40">
                    {review.role[lang]}
                  </span>
                </div>
              </footer>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 py-4 border border-rule rounded-[2px] bg-warm/30">
        <span className="font-display text-[24px] font-bold text-copper">{ratingValue}</span>
        <div>
          <div className="flex gap-0.5 text-copper text-[10px]">
            {"★★★★★".split("").map((star, i) => (
              <span key={i}>{star}</span>
            ))}
          </div>
          <p className="text-[11px] text-ink/40 mt-0.5">{ratingLabel}</p>
        </div>
      </div>

      {productStat && (
        <p className="text-[13px] text-ink/40 text-center">{productStat}</p>
      )}

      {productType === "training" && (
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/30 text-center mb-4">
            {trustedByLabel}
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap opacity-40 grayscale">
            {finalLogos.map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={logo.w}
                height={28}
                className="object-contain h-6"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
