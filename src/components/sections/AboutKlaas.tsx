import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";
import { loadSiteImages, imgUrl } from "@/lib/site-images";

type AboutKlaasProps = {
  lang: Lang;
  content?: {
    image?: string;
    imageAlt?: string;
    label?: string;
    name?: string;
    subtitle?: string;
    bio1?: string;
    bio1Bold?: string;
    bio1End?: string;
    bio2?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    stats?: Array<{ value?: string; label?: string }>;
  };
};

export async function AboutKlaas({ lang, content }: AboutKlaasProps) {
  const img = await loadSiteImages(["about/klaas-kroezen-portrait.jpeg"]);
  const s = t(lang).aboutKlaas;

  const image = content?.image || imgUrl(img, "about/klaas-kroezen-portrait.jpeg");
  const imageAlt = content?.imageAlt || s.imageAlt;
  const label = content?.label || s.label;
  const name = content?.name || s.name;
  const subtitle = content?.subtitle || s.subtitle;
  const bio1 = content?.bio1 || s.bio1;
  const bio1Bold = content?.bio1Bold || s.bio1Bold;
  const bio1End = content?.bio1End || s.bio1End;
  const bio2 = content?.bio2 || s.bio2;
  const ctaPrimary = content?.ctaPrimary || s.ctaPrimary;
  const ctaSecondary = content?.ctaSecondary || s.ctaSecondary;

  const stats = content?.stats && content.stats.length > 0
    ? content.stats
        .filter((it) => (it.value || "").trim() || (it.label || "").trim())
        .map((it) => ({ number: it.value || "", label: it.label || "" }))
    : [
        { number: "25+", label: s.statExp },
        { number: "21", label: s.statCountries },
        { number: "9,1", label: s.statRating },
        { number: "#1", label: s.statBook },
      ];

  return (
    <section
      aria-labelledby="klaas-heading"
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] border-b border-rule"
    >
      <div className="relative overflow-hidden bg-warm lg:border-r lg:border-rule min-h-[300px] sm:min-h-[340px]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover object-[center_top]"
          sizes="(max-width: 1024px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
      <div className="py-12 sm:py-20 px-7 sm:px-[60px] flex flex-col justify-center">
        <FadeIn>
        <Label className="mb-3.5">{label}</Label>
        <h2
          id="klaas-heading"
          className="font-display text-[clamp(26px,3.2vw,46px)] font-black leading-[0.97] tracking-[-0.03em] mb-1"
        >
          {name}
          <em className="block italic font-normal text-ink/40 text-[0.82em]">
            {subtitle}
          </em>
        </h2>
        <p className="text-[15px] sm:text-[16.5px] text-ink/80 leading-[1.85] mt-4 mb-5 max-w-[440px]">
          {bio1}{" "}
          <strong className="font-semibold text-ink">
            {bio1Bold}
          </strong>{" "}
          {bio1End}
        </p>
        <p className="text-[15px] sm:text-[16.5px] text-ink/80 leading-[1.85] mb-6 max-w-[440px]">
          {bio2}
        </p>
        <div className="flex gap-2.5 flex-wrap mb-6">
          <ButtonLink
            href="/checkout/set-online"
            variant="copper"
          >
            <ButtonArrow>{ctaPrimary}</ButtonArrow>
          </ButtonLink>
          <ButtonLink href="/over-ons" variant="ghost">
            {ctaSecondary}
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
