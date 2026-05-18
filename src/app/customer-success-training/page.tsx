import type { Metadata } from "next";
import { TrainingHero } from "@/components/sections/training/TrainingHero";
import { PainPoints } from "@/components/sections/training/PainPoints";
import { ForWhom } from "@/components/sections/training/ForWhom";
import { LogoBar } from "@/components/sections/LogoBar";
import { ProgramSection } from "@/components/sections/training/ProgramSection";
import { ProgramVideo } from "@/components/sections/training/ProgramVideo";
import { TrainingReviews } from "@/components/sections/training/TrainingReviews";
import { PricingSection } from "@/components/sections/training/PricingSection";
import { CrossLink } from "@/components/sections/training/CrossLink";
import { TrainingCta } from "@/components/sections/training/TrainingCta";
import { TransformationSlider } from "@/components/sections/training/TransformationSlider";
import { RadarModel } from "@/components/sections/training/RadarModel";
import { TrainingMethod } from "@/components/sections/training/TrainingMethod";
import { Faq } from "@/components/sections/Faq";
import { JsonLd, courseJsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";
import { loadSiteImages } from "@/lib/site-images";
import { getCstContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const c = getCstContent(lang);
  return await loadPageMeta("customer-success-training", lang, {
    title: c.meta.title,
    description: c.meta.description,
  });
}

export default async function CustomerSuccessTrainingPage() {
  const lang = await getLocale();
  const img = await loadSiteImages([
    "hero/customer-success-group.jpg",
    "hero/sales-excellence-group.jpeg",
    "reviews/simon-kornblum.jpg",
    "reviews/michael-pilarczyk.jpeg",
  ]);
  const imageUrls: Record<string, string> = {};
  for (const [key, val] of Object.entries(img)) {
    imageUrls[key] = val.url;
  }
  const fallback = getCstContent(lang, imageUrls);
  const db = await loadPageContent("customer-success-training", lang);

  const hero = sectionOr(db, "hero", fallback.hero);
  const painPoints = sectionOr(db, "pain-points", fallback.painPoints);
  const transformation = sectionOr(db, "transformation", { items: fallback.transformation });
  const audiences = sectionOr(db, "audiences", { items: fallback.audiences });
  const program = sectionOr(db, "program", fallback.program);
  const programVideo = sectionOr<{ eyebrow?: string; vimeoUrl?: string }>(db, "program-video", {});
  const trainingMethod = sectionOr<{
    eyebrow?: string;
    title?: string;
    titleAccent?: string;
    description?: string;
    features?: { title: string; text: string }[];
  }>(db, "training-method", {});
  const logos = sectionOr<{ label?: string; items?: Array<{ image?: string; alt?: string; width?: number; height?: number }> }>(db, "logos", {});
  const reviews = sectionOr(db, "reviews", { items: fallback.reviews });
  const pricing = sectionOr(db, "pricing", fallback.pricing);
  const crossLink = sectionOr(db, "cross-link", fallback.crossLink);
  const faq = sectionOr(db, "faq", fallback.faq);
  const cta = sectionOr(db, "cta", fallback.cta);

  return (
    <>
      <JsonLd data={courseJsonLd(fallback.jsonLd)} />
      <TrainingHero
        lang={lang}
        eyebrow={hero.eyebrow}
        titleLine1={hero.titleLine1}
        titleLine2={hero.titleLine2}
        description={hero.description}
        image={hero.image}
        imageAlt={hero.imageAlt}
        ctaLabel={hero.ctaLabel}
        secondaryLabel={hero.secondaryLabel}
        pricingAnchor={hero.pricingAnchor}
        programAnchor={hero.programAnchor}
        glassItems={hero.glassItems}
      />

      <PainPoints
        lang={lang}
        title={painPoints.title}
        titleAccent={painPoints.titleAccent}
        eyebrow={painPoints.eyebrow}
        points={painPoints.points}
      />

      <TransformationSlider items={transformation.items} lang={lang} />

      <ForWhom lang={lang} audiences={audiences.items} />

      <ProgramSection
        lang={lang}
        price={program.price}
        modules={program.modules}
        ctaLabel={program.ctaLabel}
        pricingAnchor={program.pricingAnchor}
      />

      <ProgramVideo eyebrow={programVideo.eyebrow} vimeoUrl={programVideo.vimeoUrl} />

      <TrainingMethod
        lang={lang}
        eyebrow={trainingMethod.eyebrow}
        title={trainingMethod.title}
        titleAccent={trainingMethod.titleAccent}
        description={trainingMethod.description}
        features={trainingMethod.features}
      />

      <LogoBar content={logos} />

      <RadarModel lang={lang} />

      <TrainingReviews reviews={reviews.items} />

      <PricingSection
        lang={lang}
        guarantee={pricing.guarantee}
        individual={pricing.individual}
        team={pricing.team}
      />

      <CrossLink
        eyebrow={crossLink.eyebrow}
        title={crossLink.title}
        titleAccent={crossLink.titleAccent}
        description={crossLink.description}
        image={crossLink.image}
        imageAlt={crossLink.imageAlt}
        href={crossLink.href}
        ctaLabel={crossLink.ctaLabel}
        dark={crossLink.dark}
      />

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
      />
    </>
  );
}
