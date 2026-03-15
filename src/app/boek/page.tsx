import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import {
  ButtonLink,
  ButtonArrow,
} from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Testimonials3D } from "@/components/sections/Testimonials3D";
import { ProgramSection } from "@/components/sections/training/ProgramSection";
import { VideoGrid } from "@/components/sections/VideoGrid";
import { CrossLink } from "@/components/sections/training/CrossLink";
import { TrainingCta } from "@/components/sections/training/TrainingCta";
import { BookPricing } from "@/components/sections/BookPricing";
import { Faq } from "@/components/sections/Faq";
import { BookPreview } from "@/components/sections/BookPreview";
import { JsonLd, bookJsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { getBoekContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const c = getBoekContent(lang);
  return {
    title: c.meta.title,
    description: c.meta.description,
  };
}

export default async function BoekPage() {
  const lang = await getLocale();
  const c = getBoekContent(lang);

  return (
    <>
      <JsonLd data={bookJsonLd} />
      {/* Book Hero */}
      <section className="py-16 sm:py-[110px] border-b border-rule bg-paper">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-16 items-center">
            <div className="flex justify-center lg:justify-start pb-4">
              <div className="relative w-[260px] sm:w-[320px] lg:w-[380px]">
                <Image
                  src="/images/book/sales-oprecht-ontspannen-cover.png"
                  alt={c.hero.imageAlt}
                  width={380}
                  height={570}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            <FadeIn>
              <Label className="mb-3">{c.hero.label}</Label>
              <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
                {c.hero.titleLine1}
                <br />
                <em className="italic font-normal text-copper">
                  {c.hero.titleAccent}
                </em>
              </h1>
              <div className="space-y-4 mb-8 max-w-[520px]">
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                  {c.hero.paragraphs[0]}
                </p>
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                  {c.hero.paragraphs[1]}{" "}
                  <strong className="font-semibold text-ink">
                    {c.hero.boldText}
                  </strong>
                  {c.hero.afterBold}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                {c.hero.badges.map((badge) => (
                  <span
                    key={badge}
                    className="text-[12px] font-medium text-ink/70 px-3.5 py-1.5 border border-rule rounded-[2px]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <ButtonLink
                href="#bestellen"
                variant="copper"
                size="large"
              >
                <ButtonArrow>{c.hero.cta}</ButtonArrow>
              </ButtonLink>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* What's inside */}
      <ProgramSection
        lang={lang}
        price={c.program.price}
        pricingAnchor={c.program.pricingAnchor}
        ctaLabel={c.program.ctaLabel}
        modules={c.program.modules}
      />

      <BookPreview lang={lang} />

      <BookPricing lang={lang} />

      <Testimonials3D
        eyebrow={c.testimonials.eyebrow}
        title={c.testimonials.title}
        titleAccent={c.testimonials.titleAccent}
        reviews={c.testimonials.reviews}
      />

      {/* Interview — Managementboek.nl */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <Container>
          <FadeIn className="mb-10 sm:mb-14 max-w-[520px]">
            <Label className="mb-3">{c.interview.eyebrow}</Label>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              {c.interview.title}
              <br />
              <em className="italic font-normal text-ink/40">
                {c.interview.titleAccent}
              </em>
            </h2>
            <p className="text-[15px] text-ink/60 leading-[1.8] mt-4">
              {c.interview.intro}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-rule border border-rule">
            {c.interview.quotes.map((q) => (
              <div key={q.question} className="bg-paper/80 backdrop-blur-sm p-6 sm:p-8">
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
                  {q.question}
                </span>
                <p className="text-[14px] sm:text-[15px] text-ink/70 leading-[1.75] italic">
                  &ldquo;{q.answer}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <FadeIn className="mt-6">
            <a
              href={c.interview.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
            >
              {c.interview.linkText}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 7h8M8 4l3 3-3 3" />
              </svg>
            </a>
          </FadeIn>
        </Container>
      </section>

      <Faq
        title={c.faq.title}
        titleAccent={c.faq.titleAccent}
        items={c.faq.items}
      />

      <VideoGrid
        eyebrow={c.videos.eyebrow}
        title={c.videos.title}
        description={c.videos.description}
        videos={c.videos.items}
      />

      <CrossLink
        eyebrow={c.crossLink.eyebrow}
        title={c.crossLink.title}
        titleAccent={c.crossLink.titleAccent}
        description={c.crossLink.description}
        image={c.crossLink.image}
        imageAlt={c.crossLink.imageAlt}
        href={c.crossLink.href}
        ctaLabel={c.crossLink.ctaLabel}
      />

      <TrainingCta
        title={c.cta.title}
        titleAccent={c.cta.titleAccent}
        description={c.cta.description}
        href={c.cta.href}
        ctaLabel={c.cta.ctaLabel}
      />
    </>
  );
}
