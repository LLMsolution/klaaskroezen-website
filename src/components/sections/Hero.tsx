import Link from "next/link";
import { HeroSlideshow } from "./HeroSlideshow";
import { t, type Lang } from "@/lib/i18n";

export function Hero({ lang, slideImages }: { lang: Lang; slideImages?: Record<string, string> }) {
  const s = t(lang).hero;

  return (
    <section
      aria-label={s.ariaLabel}
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100dvh-64px)]"
    >
      <HeroSlideshow images={slideImages} />

      {/* Right: Copy */}
      <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-16 lg:py-20 relative order-2">
        <p className="font-body text-[11px] font-medium tracking-[0.22em] uppercase text-copper mb-6 sm:mb-7 mt-4 animate-fade-up">
          {s.headline1}
        </p>
        <h1 className="animate-fade-up delay-100">
          <span className="font-display text-[clamp(36px,4.6vw,64px)] font-black leading-[0.97] tracking-[-0.03em] block">
            {s.line1}
          </span>
          <span className="font-display italic font-normal text-[clamp(30px,4vw,54px)] tracking-[-0.025em] text-copper block my-1">
            {s.line2}
          </span>
          <span className="font-display text-[clamp(36px,4.6vw,64px)] font-black leading-[0.97] tracking-[-0.03em] block">
            {s.line3}
          </span>
        </h1>
        <p className="text-[16px] sm:text-[17px] text-ink/80 leading-[1.8] max-w-[410px] mt-5 mb-7 animate-fade-up delay-200">
          {s.intro}{" "}
          <strong className="font-semibold text-ink">
            {s.introHighlight}
          </strong>{" "}
          {s.introEnd}
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
                {s.forSales}
              </span>
              <span className="font-display text-[15px] font-bold leading-tight text-ink">
                {s.setSalesTitle}
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
                {s.forCS}
              </span>
              <span className="font-display text-[15px] font-bold leading-tight text-ink">
                {s.cstTitle}
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
          {[s.benefit1, s.benefit2, s.benefit3].map((text) => (
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
