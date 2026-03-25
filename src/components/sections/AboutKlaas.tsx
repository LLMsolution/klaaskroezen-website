import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";
import { loadSiteImages } from "@/lib/site-images";

export async function AboutKlaas({ lang }: { lang: Lang }) {
  const img = await loadSiteImages(["about/klaas-kroezen-portrait.jpeg"]);
  const s = t(lang).aboutKlaas;

  const stats = [
    { number: "25+", label: s.statExp },
    { number: "21", label: s.statCountries },
    { number: "9,1", label: s.statRating },
    { number: "#1", label: s.statBook },
  ] as const;

  return (
    <section
      aria-labelledby="klaas-heading"
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] border-b border-rule"
    >
      <div className="relative overflow-hidden bg-warm lg:border-r lg:border-rule min-h-[300px] sm:min-h-[340px]">
        <Image
          src={img["about/klaas-kroezen-portrait.jpeg"].url}
          unoptimized
          alt={s.imageAlt}
          fill
          className="object-cover object-[center_top]"
          sizes="(max-width: 1024px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
      <div className="py-12 sm:py-20 px-7 sm:px-[60px] flex flex-col justify-center">
        <FadeIn>
        <Label className="mb-3.5">{s.label}</Label>
        <h2
          id="klaas-heading"
          className="font-display text-[clamp(26px,3.2vw,46px)] font-black leading-[0.97] tracking-[-0.03em] mb-1"
        >
          {s.name}
          <em className="block italic font-normal text-ink/40 text-[0.82em]">
            {s.subtitle}
          </em>
        </h2>
        <p className="text-[15px] sm:text-[16.5px] text-ink/80 leading-[1.85] mt-4 mb-5 max-w-[440px]">
          {s.bio1}{" "}
          <strong className="font-semibold text-ink">
            {s.bio1Bold}
          </strong>{" "}
          {s.bio1End}
        </p>
        <p className="text-[15px] sm:text-[16.5px] text-ink/80 leading-[1.85] mb-6 max-w-[440px]">
          {s.bio2}
        </p>
        <div className="flex gap-2.5 flex-wrap mb-6">
          <ButtonLink
            href="/checkout/set-online"
            variant="copper"
          >
            <ButtonArrow>{s.ctaPrimary}</ButtonArrow>
          </ButtonLink>
          <ButtonLink href="/over-ons" variant="ghost">
            {s.ctaSecondary}
          </ButtonLink>
        </div>
        <dl
          className="flex gap-6 sm:gap-7 flex-wrap pt-5 border-t border-rule"
          aria-label={s.statsLabel}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-[24px] sm:text-[28px] font-black tracking-[-0.025em] leading-none mb-[3px] tabular-nums">
                {stat.number}
              </dd>
              <dt className="text-[10px] sm:text-[10.5px] font-medium tracking-[0.12em] uppercase text-ink/50">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
        </FadeIn>
      </div>
    </section>
  );
}
