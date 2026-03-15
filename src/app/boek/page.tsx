import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import {
  ButtonExternal,
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
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-16 items-center">
            <div className="flex justify-center lg:justify-start">
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
              <ButtonExternal
                href="https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales"
                variant="copper"
                size="large"
              >
                <ButtonArrow>{c.hero.cta}</ButtonArrow>
              </ButtonExternal>
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

      <BookPricing lang={lang} />

      <Testimonials3D
        eyebrow={c.testimonials.eyebrow}
        title={c.testimonials.title}
        titleAccent={c.testimonials.titleAccent}
        reviews={c.testimonials.reviews}
      />

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
