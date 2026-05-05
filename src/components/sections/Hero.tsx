import Link from "next/link";
import { HeroSlideshow } from "./HeroSlideshow";
import { t, type Lang } from "@/lib/i18n";

type SlideInput = {
  image?: string;
  alt?: string;
  objectPosition?: string;
  quote?: string;
  author?: string;
  role?: string;
  detail?: string;
};

type HeroContent = {
  eyebrow?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  intro?: string;
  introHighlight?: string;
  introEnd?: string;
  forSales?: string;
  setSalesTitle?: string;
  forCS?: string;
  cstTitle?: string;
  guarantees?: string[];
};

export function Hero({
  lang,
  slideImages,
  slides,
  content,
}: {
  lang: Lang;
  slideImages?: Record<string, string>;
  slides?: SlideInput[];
  content?: HeroContent;
}) {
  const s = t(lang).hero;
  const eyebrow = content?.eyebrow || s.headline1;
  const line1 = content?.line1 || s.line1;
  const line2 = content?.line2 || s.line2;
  const line3 = content?.line3 || s.line3;
  const intro = content?.intro || s.intro;
  const introHighlight = content?.introHighlight || s.introHighlight;
  const introEnd = content?.introEnd || s.introEnd;
  const forSales = content?.forSales || s.forSales;
  const setSalesTitle = content?.setSalesTitle || s.setSalesTitle;
  const forCS = content?.forCS || s.forCS;
  const cstTitle = content?.cstTitle || s.cstTitle;
  const benefits = content?.guarantees && content.guarantees.length > 0
    ? content.guarantees
    : [s.benefit1, s.benefit2, s.benefit3];

  return (
    <section
      aria-label={s.ariaLabel}
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100dvh-64px)]"
    >
      <HeroSlideshow images={slideImages} slides={slides} />

      {/* Right: Copy */}
      <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-16 lg:py-20 relative order-2">
        <p className="font-body text-[11px] font-medium tracking-[0.22em] uppercase text-copper mb-6 sm:mb-7 mt-4 animate-fade-up">
          {eyebrow}
        </p>
        <h1 className="animate-fade-up delay-100">
          <span className="font-display text-[clamp(36px,4.6vw,64px)] font-black leading-[0.97] tracking-[-0.03em] block">
            {line1}
          </span>
          <span className="font-display italic font-normal text-[clamp(30px,4vw,54px)] tracking-[-0.025em] text-copper block my-1">
            {line2}
          </span>
          <span className="font-display text-[clamp(36px,4.6vw,64px)] font-black leading-[0.97] tracking-[-0.03em] block">
            {line3}
          </span>
        </h1>
        <p className="text-[16px] sm:text-[17px] text-ink/80 leading-[1.8] max-w-[410px] mt-5 mb-7 animate-fade-up delay-200">
          {intro}{" "}
          <strong className="font-semibold text-ink">
            {introHighlight}
          </strong>{" "}
          {introEnd}
        </p>

        {/* Choice cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule border border-rule mb-5 animate-fade-up delay-300"
          role="list"
          aria-label={s.chooseTraining}
        >
          <Link
            href="/sales-excellence-training"
            role="listitem"
            className="group/card bg-paper p-5 flex items-center justify-between gap-4 hover:bg-warm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper"
          >
            <div>
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-1">
                {forSales}
              </span>
              <span className="font-display text-[15px] font-bold leading-tight text-ink">
                {setSalesTitle}
              </span>
            </div>
            <span className="text-copper shrink-0 transition-transform duration-200 group-hover/card:translate-x-0.5" aria-hidden="true">
              &rarr;
            </span>
          </Link>
          <Link
            href="/customer-success-training"
            role="listitem"
            className="group/card bg-paper p-5 flex items-center justify-between gap-4 hover:bg-warm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper"
          >
            <div>
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-1">
                {forCS}
              </span>
              <span className="font-display text-[15px] font-bold leading-tight text-ink">
                {cstTitle}
              </span>
            </div>
            <span className="text-copper shrink-0 transition-transform duration-200 group-hover/card:translate-x-0.5" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>

        {/* Trust indicators */}
        <ul
          className="flex gap-4 sm:gap-[18px] flex-wrap animate-fade-up delay-400 list-none"
          aria-label={s.benefits}
        >
          {benefits.map((text) => (
            <li
              key={text}
              className="flex items-center gap-[6px] text-[12px] sm:text-[13px] text-ink/70"
            >
              <span className="text-copper text-[11px]" aria-hidden="true">
                ✓
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
