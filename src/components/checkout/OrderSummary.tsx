"use client";

import Image from "next/image";
import { formatPrice, getProduct, type CheckoutProduct } from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";

interface Review {
  text: { nl: string; en: string };
  name: string;
  role: { nl: string; en: string };
  avatar?: string;
}

const TRAINING_REVIEWS: Review[] = [
  {
    text: {
      nl: "Direct meer resultaat. Klaas heeft ons salesteam fundamenteel veranderd — niet met trucjes maar met een aanpak die écht werkt en blijft hangen.",
      en: "Immediate results. Klaas fundamentally changed our sales team — not with tricks but with an approach that truly works and sticks.",
    },
    name: "Simon Kornblum",
    role: { nl: "Directeur Visma YouServe", en: "Director Visma YouServe" },
    avatar: "/images/reviews/simon-kornblum.jpg",
  },
  {
    text: {
      nl: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.",
      en: "Out of 10 leads, 1 or 2 became clients. Now it's 7 or 8. Not by pushing harder, but by being genuinely interested.",
    },
    name: "Max de Weijer",
    role: { nl: "Ondernemer", en: "Entrepreneur" },
  },
  {
    text: {
      nl: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken. Een aanpak die werkt — ook als je jezelf geen verkoper vindt.",
      en: "Klaas shows that selling isn't about tricks but about making real connections. An approach that works — even if you don't see yourself as a salesperson.",
    },
    name: "Mark Tigchelaar",
    role: { nl: "Psycholoog · Focus AAN/UIT", en: "Psychologist · Focus ON/OFF" },
    avatar: "/images/reviews/mark-tigchelaar.jpeg",
  },
];

const BOOK_REVIEWS: Review[] = [
  {
    text: {
      nl: "Een verfrissend boek dat laat zien dat je geen typische verkoper hoeft te zijn om succesvol te verkopen.",
      en: "A refreshing book that shows you don't need to be a typical salesperson to sell successfully.",
    },
    name: "Michael Pilarczyk",
    role: { nl: "Bestsellerauteur · Ondernemer", en: "Bestselling author · Entrepreneur" },
    avatar: "/images/reviews/michael-pilarczyk.jpeg",
  },
  {
    text: {
      nl: "Dit boek verandert hoe je naar sales kijkt. Oprecht, praktisch en direct toepasbaar.",
      en: "This book changes how you look at sales. Honest, practical and immediately applicable.",
    },
    name: "Tijn Touber",
    role: { nl: "Auteur · Spreker", en: "Author · Speaker" },
    avatar: "/images/reviews/tijn-touber.jpg",
  },
];

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
  const reviews = product.type === "book" ? BOOK_REVIEWS : TRAINING_REVIEWS;

  return (
    <div className="lg:sticky lg:top-8 space-y-8">
      {/* Product card */}
      <div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
          {i18n.orderSummary}
        </p>

        <div className="border border-rule rounded-[2px] overflow-hidden">
          {/* Product image */}
          {product.image && (
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
          )}

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

      {/* Reviews */}
      <div className="space-y-4">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          {lang === "nl" ? "Wat anderen zeggen" : "What others say"}
        </p>
        {reviews.map((review) => (
          <div key={review.name} className="border border-rule rounded-[2px] p-5">
            <div className="flex gap-1 text-copper text-[10px] mb-3">
              {"★★★★★".split("").map((star, i) => (
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

      {/* Rating badge */}
      <div className="flex items-center justify-center gap-3 py-4 border border-rule rounded-[2px] bg-warm/30">
        <span className="font-display text-[24px] font-bold text-copper">9.1</span>
        <div>
          <div className="flex gap-0.5 text-copper text-[10px]">
            {"★★★★★".split("").map((star, i) => (
              <span key={i}>{star}</span>
            ))}
          </div>
          <p className="text-[11px] text-ink/40 mt-0.5">
            {lang === "nl"
              ? "Gemiddelde beoordeling"
              : "Average rating"}
          </p>
        </div>
      </div>

      {/* Social proof line */}
      <p className="text-[13px] text-ink/40 text-center">
        {lang === "nl"
          ? "340+ sales professionals getraind in 21 landen"
          : "340+ sales professionals trained across 21 countries"}
      </p>

      {/* Client logos — trust strip */}
      {product.type === "training" && (
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/30 text-center mb-4">
            {lang === "nl" ? "Vertrouwd door" : "Trusted by"}
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap opacity-40 grayscale">
            {[
              { src: "/images/logos/visma.png", alt: "Visma", w: 64 },
              { src: "/images/logos/vasco.png", alt: "Vasco", w: 56 },
              { src: "/images/logos/mt-sprout.png", alt: "MT/Sprout", w: 56 },
              { src: "/images/logos/mom-in-balance.png", alt: "Mom in Balance", w: 56 },
            ].map((logo) => (
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
