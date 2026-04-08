import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";

type FinaleCtaContent = {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  guarantees?: string[];
};

export function FinaleCta({ lang, content }: { lang: Lang; content?: FinaleCtaContent }) {
  const s = t(lang).finaleCta;
  const eyebrow = content?.eyebrow || s.eyebrow;
  const heading1 = content?.title || s.heading1;
  const heading2 = content?.titleAccent || s.heading2;
  const description = content?.description || s.description;
  const ctaPrimary = content?.ctaPrimary || s.ctaPrimary;
  const ctaSecondary = content?.ctaSecondary || s.ctaSecondary;
  const guarantees = content?.guarantees && content.guarantees.length > 0
    ? content.guarantees
    : [s.guarantee1, s.guarantee2, s.guarantee3];

  return (
    <section
      aria-labelledby="cta-heading"
      className="py-20 sm:py-[130px] px-7 sm:px-14 bg-ink text-center relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(181,98,42,0.18), transparent 65%)" }}
        aria-hidden="true"
      />
      <FadeIn className="relative max-w-[640px] mx-auto">
        <p className="font-body text-[11px] font-medium tracking-[0.22em] uppercase text-paper/50 mb-6 sm:mb-[26px]">
          {eyebrow}
        </p>
        <h2
          id="cta-heading"
          className="font-display text-[clamp(32px,4.2vw,58px)] font-black leading-[0.95] tracking-[-0.03em] text-paper mb-1"
        >
          {heading1}
        </h2>
        <span className="font-display italic font-normal text-[clamp(28px,3.8vw,52px)] tracking-[-0.03em] text-copper block mb-2">
          {heading2}
        </span>
        <p className="text-[16px] sm:text-[17px] text-paper/70 leading-[1.8] mt-6 mb-8 sm:mb-9">
          {description}
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <ButtonLink href="/sales-excellence-training" variant="copper">
            <ButtonArrow>{ctaPrimary}</ButtonArrow>
          </ButtonLink>
          <ButtonLink href="/customer-success-training" variant="paper">
            {ctaSecondary}
          </ButtonLink>
        </div>
        <ul
          className="flex items-center justify-center gap-4 sm:gap-[18px] flex-wrap mt-5 list-none"
          aria-label={s.guaranteeLabel}
        >
          {guarantees.map((text) => (
            <li
              key={text}
              className="flex items-center gap-[6px] text-[12px] sm:text-[13px] text-paper/55"
            >
              <span className="text-copper/80 text-[11px]" aria-hidden="true">
                ✓
              </span>
              {text}
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  );
}
