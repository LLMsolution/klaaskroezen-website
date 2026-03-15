import type { Metadata } from "next";
import { TrainingHero } from "@/components/sections/training/TrainingHero";
import { ContentBlock } from "@/components/sections/ContentBlock";
import { ForWhom } from "@/components/sections/training/ForWhom";
import { VideoGrid } from "@/components/sections/VideoGrid";
import { LogoBar } from "@/components/sections/LogoBar";
import { TrainingCta } from "@/components/sections/training/TrainingCta";
import { Faq } from "@/components/sections/Faq";
import { JsonLd, personJsonLd, speakerServiceJsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { getSprekerContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const c = getSprekerContent(lang);
  return {
    title: c.meta.title,
    description: c.meta.description,
  };
}

export default async function SprekerPage() {
  const lang = await getLocale();
  const c = getSprekerContent(lang);

  return (
    <>
      <JsonLd data={personJsonLd} />
      <JsonLd data={speakerServiceJsonLd} />
      <TrainingHero
        lang={lang}
        eyebrow={c.hero.eyebrow}
        titleLine1={c.hero.titleLine1}
        titleLine2={c.hero.titleLine2}
        description={c.hero.description}
        image={c.hero.image}
        imageAlt={c.hero.imageAlt}
        imagePosition={c.hero.imagePosition}
        ctaLabel={c.hero.ctaLabel}
        pricingAnchor={c.hero.pricingAnchor}
        programAnchor={c.hero.programAnchor}
        secondaryLabel={c.hero.secondaryLabel}
        glassItems={c.hero.glassItems}
      />

      <ForWhom lang={lang} audiences={c.audiences} />

      <ContentBlock
        eyebrow={c.contentBlock.eyebrow}
        title={c.contentBlock.title}
        titleAccent={c.contentBlock.titleAccent}
        image="/images/spreker/klaas-flipchart.jpeg"
        imageAlt={c.contentBlock.imageAlt}
        objectPosition="center top"
        imagePosition="right"
        paragraphs={c.contentBlock.paragraphs}
      />

      <section className="py-16 sm:py-[110px] border-b border-rule">
        <div className="mx-auto max-w-[1180px] px-14 max-lg:px-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {c.benefitsGrid.map((item) => (
              <div key={item.text} className="bg-paper p-6 sm:p-8">
                <span className="text-copper text-[18px] font-bold block mb-3">
                  {item.icon}
                </span>
                <p className="text-[14px] sm:text-[15px] text-ink/70 leading-[1.7]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VideoGrid
        eyebrow={c.videos.eyebrow}
        title={c.videos.title}
        titleAccent={c.videos.titleAccent}
        videos={c.videos.items}
      />

      <LogoBar label={c.logoBar.label} />

      {/* Coaching cards */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <div className="mx-auto max-w-[1180px] px-14 max-lg:px-7">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
              {c.coaching.sectionEyebrow}
            </span>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              {c.coaching.sectionTitle1}
              <br />
              <em className="italic font-normal text-ink/40">
                {c.coaching.sectionTitle2}
              </em>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-rule border border-rule">
            {/* 1-on-1 Coaching */}
            <div className="bg-paper p-8 sm:p-12 flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
                {c.coaching.individual.label}
              </span>
              <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-[1.1] tracking-[-0.02em] mb-3">
                {c.coaching.individual.title}
              </h3>
              <p className="text-[15px] text-ink/70 leading-[1.75] mb-6 max-w-[400px]">
                {c.coaching.individual.description}
              </p>
              <ul className="space-y-2.5 mb-8">
                {c.coaching.individual.features.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[14px] text-ink/65 leading-[1.6]"
                  >
                    <span className="text-copper text-[11px] mt-[3px] shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-rule flex items-center justify-between">
                <div>
                  <span className="font-display text-[20px] font-bold text-ink">
                    {c.coaching.individual.price}
                  </span>
                </div>
                <a
                  href="/contact"
                  className="text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
                >
                  {c.coaching.individual.cta}
                </a>
              </div>
            </div>

            {/* Team Coaching */}
            <div className="bg-paper p-8 sm:p-12 flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
                {c.coaching.team.label}
              </span>
              <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-[1.1] tracking-[-0.02em] mb-3">
                {c.coaching.team.title}
              </h3>
              <p className="text-[15px] text-ink/70 leading-[1.75] mb-6 max-w-[400px]">
                {c.coaching.team.description}
              </p>
              <ul className="space-y-2.5 mb-8">
                {c.coaching.team.features.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[14px] text-ink/65 leading-[1.6]"
                  >
                    <span className="text-copper text-[11px] mt-[3px] shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-rule flex items-center justify-between">
                <div>
                  <span className="font-display text-[20px] font-bold text-ink">
                    {c.coaching.team.price}
                  </span>
                </div>
                <a
                  href="/contact"
                  className="text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
                >
                  {c.coaching.team.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Faq
        title={c.faq.title}
        titleAccent={c.faq.titleAccent}
        items={c.faq.items}
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
