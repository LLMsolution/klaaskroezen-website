import Image from "next/image";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";

export function BookTeaser({ lang }: { lang: Lang }) {
  const s = t(lang).bookTeaser;

  const badges = [s.badge1, s.badge2, s.badge3];

  return (
    <section
      aria-labelledby="book-heading"
      className="bg-warm grid grid-cols-1 lg:grid-cols-2 min-h-[320px] border-b border-rule"
    >
      {/* Book visual */}
      <div className="flex items-center justify-center p-10 sm:p-[52px] min-h-[250px] lg:border-r lg:border-rule relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 60%, rgba(181,98,42,0.10), transparent 65%)" }}
          aria-hidden="true"
        />
        <div className="relative z-10 w-[min(160px,45%)] sm:w-[min(180px,52%)]">
          <Image
            src="/images/book/sales-oprecht-ontspannen-cover.png"
            alt={s.imageAlt}
            width={340}
            height={480}
            className="drop-shadow-[_-10px_20px_36px_rgba(0,0,0,0.25)] -rotate-2 hover:rotate-0 hover:scale-105 transition-transform duration-[600ms] ease-out"
            loading="lazy"
          />
        </div>
      </div>

      {/* Book copy */}
      <div className="p-7 sm:p-[52px_60px] flex flex-col justify-center">
        <FadeIn>
        <span className="block font-body text-[11px] font-medium tracking-[0.22em] uppercase text-ink/45 mb-3">
          {s.eyebrow}
        </span>
        <h2
          id="book-heading"
          className="font-display text-[clamp(22px,2.8vw,38px)] font-black leading-none tracking-[-0.025em] text-ink mb-1"
        >
          {s.title1}
          <em className="block italic font-normal text-copper">
            {s.title2}
          </em>
        </h2>
        <p className="text-[15px] sm:text-[16px] text-ink/75 leading-[1.8] max-w-[360px] mt-4 mb-5">
          {s.description}
        </p>
        <ul className="flex gap-3 flex-wrap mb-5 list-none" aria-label={s.awardsLabel}>
          {badges.map((badge) => (
            <li
              key={badge}
              className="text-[10px] font-medium tracking-[0.14em] uppercase py-[5px] px-2.5 border border-rule text-ink/50"
            >
              {badge}
            </li>
          ))}
        </ul>
        <div className="flex gap-2.5 flex-wrap">
          <ButtonLink
            href="/boek#bestellen"
            variant="copper"
          >
            <ButtonArrow>{{ nl: "Bestel het boek", en: "Order the Dutch book", de: "Das niederländische Buch bestellen" }[lang]}</ButtonArrow>
          </ButtonLink>
          {(lang === "en" || lang === "de") && (
            <ButtonLink href="/contact" variant="ghost">
              <ButtonArrow>{{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}</ButtonArrow>
            </ButtonLink>
          )}
          {lang === "nl" && (
            <ButtonLink href="/boek" variant="ghost">
              {s.ctaSecondary}
            </ButtonLink>
          )}
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
