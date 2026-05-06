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
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";
import { loadSiteImages, imgUrl } from "@/lib/site-images";
import { getSprekerContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const c = getSprekerContent(lang);
  return await loadPageMeta("spreker", lang, {
    title: c.meta.title,
    description: c.meta.description,
  });
}

export default async function SprekerPage() {
  const lang = await getLocale();
  const db = await loadPageContent("spreker", lang);
  const img = await loadSiteImages([
    "spreker/klaas-flipchart.jpeg",
    "spreker/klaas-hero.jpeg",
    "spreker/video-thumb-speech.jpg",
    "spreker/video-thumb-mindset.jpg",
  ]);
  const imageUrls: Record<string, string> = {};
  for (const key of Object.keys(img)) {
    imageUrls[key] = imgUrl(img, key);
  }
  const fallback = getSprekerContent(lang, imageUrls);

  const hero = sectionOr(db, "hero", fallback.hero);
  const audiences = sectionOr(db, "audiences", { items: fallback.audiences });
  const contentBlock = sectionOr(db, "content-block", fallback.contentBlock);
  const benefitsGrid = sectionOr(db, "benefits-grid", { items: fallback.benefitsGrid });
  const videos = sectionOr(db, "videos", fallback.videos);
  const logoBar = sectionOr(db, "logo-bar", fallback.logoBar);
  const coaching = sectionOr(db, "coaching", fallback.coaching);
  const faq = sectionOr(db, "faq", fallback.faq);
  const cta = sectionOr(db, "cta", fallback.cta);

  return (
    <>
      <JsonLd data={personJsonLd} />
      <JsonLd data={speakerServiceJsonLd} />
      <TrainingHero
        lang={lang}
        eyebrow={hero.eyebrow}
        titleLine1={hero.titleLine1}
        titleLine2={hero.titleLine2}
        description={hero.description}
        image={hero.image}
        imageAlt={hero.imageAlt}
        ctaLabel={hero.ctaLabel}
        pricingAnchor={hero.pricingAnchor}
        programAnchor={hero.programAnchor}
        secondaryLabel={hero.secondaryLabel}
        glassItems={hero.glassItems}
      />

      <ForWhom lang={lang} audiences={audiences.items} />

      <ContentBlock
        eyebrow={contentBlock.eyebrow}
        title={contentBlock.title}
        titleAccent={contentBlock.titleAccent}
        image={(contentBlock as { image?: string }).image || imgUrl(img, "spreker/klaas-flipchart.jpeg")}
        imageAlt={contentBlock.imageAlt}
        objectPosition="center top"
        imagePosition="right"
        paragraphs={contentBlock.paragraphs}
      />

      <section className="py-16 sm:py-[110px] border-b border-rule">
        <div className="mx-auto max-w-[1180px] px-14 max-lg:px-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {(benefitsGrid.items ?? []).map((item: { icon: string; text: string }) => (
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
        eyebrow={videos.eyebrow}
        title={videos.title}
        titleAccent={videos.titleAccent}
        videos={videos.items}
      />

      <LogoBar label={logoBar.label} content={logoBar} />

      {/* Coaching cards */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <div className="mx-auto max-w-[1180px] px-14 max-lg:px-7">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
              {coaching.sectionEyebrow}
            </span>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              {coaching.sectionTitle1}
              <br />
              <em className="italic font-normal text-ink/40">
                {coaching.sectionTitle2}
              </em>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-rule border border-rule">
            {/* 1-on-1 Coaching */}
            <div className="bg-paper p-8 sm:p-12 flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
                {coaching.individual.label}
              </span>
              <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-[1.1] tracking-[-0.02em] mb-3">
                {coaching.individual.title}
              </h3>
              <p className="text-[15px] text-ink/70 leading-[1.75] mb-6 max-w-[400px]">
                {coaching.individual.description}
              </p>
              <ul className="space-y-2.5 mb-8">
                {(coaching.individual.features ?? []).map((item: string) => (
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
                    {coaching.individual.price}
                  </span>
                </div>
                <a
                  href="/contact"
                  className="text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
                >
                  {coaching.individual.cta}
                </a>
              </div>
            </div>

            {/* Team Coaching */}
            <div className="bg-paper p-8 sm:p-12 flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
                {coaching.team.label}
              </span>
              <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-[1.1] tracking-[-0.02em] mb-3">
                {coaching.team.title}
              </h3>
              <p className="text-[15px] text-ink/70 leading-[1.75] mb-6 max-w-[400px]">
                {coaching.team.description}
              </p>
              <ul className="space-y-2.5 mb-8">
                {(coaching.team.features ?? []).map((item: string) => (
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
                    {coaching.team.price}
                  </span>
                </div>
                <a
                  href="/contact"
                  className="text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
                >
                  {coaching.team.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Faq
        title={faq.title}
        titleAccent={faq.titleAccent}
        items={faq.items}
      />

      <TrainingCta
        title={cta.title}
        titleAccent={cta.titleAccent}
        description={cta.description}
        href={cta.href}
        ctaLabel={cta.ctaLabel}
      />
    </>
  );
}
