import type { Metadata } from "next";
import { TrainingHero } from "@/components/sections/training/TrainingHero";
import { PainPoints } from "@/components/sections/training/PainPoints";
import { ForWhom } from "@/components/sections/training/ForWhom";
import { LogoBar } from "@/components/sections/LogoBar";
import { ProgramSection } from "@/components/sections/training/ProgramSection";
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
import { getCstContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const c = getCstContent(lang);
  return {
    title: c.meta.title,
    description: c.meta.description,
  };
}

export default async function CustomerSuccessTrainingPage() {
  const lang = await getLocale();
  const c = getCstContent(lang);

  return (
    <>
      <JsonLd data={courseJsonLd(c.jsonLd)} />
      <TrainingHero
        lang={lang}
        eyebrow={c.hero.eyebrow}
        titleLine1={c.hero.titleLine1}
        titleLine2={c.hero.titleLine2}
        description={c.hero.description}
        image={c.hero.image}
        imageAlt={c.hero.imageAlt}
        imagePosition={c.hero.imagePosition}
        glassItems={c.hero.glassItems}
      />

      <PainPoints
        lang={lang}
        title={c.painPoints.title}
        titleAccent={c.painPoints.titleAccent}
        eyebrow={c.painPoints.eyebrow}
        points={c.painPoints.points}
      />

      <TransformationSlider items={c.transformation} />

      <ForWhom lang={lang} audiences={c.audiences} />

      <ProgramSection
        lang={lang}
        price={c.program.price}
        modules={c.program.modules}
      />

      <TrainingMethod lang={lang} />

      <LogoBar />

      <RadarModel />

      <TrainingReviews reviews={c.reviews} />

      <PricingSection
        lang={lang}
        guarantee={c.pricing.guarantee}
        individual={c.pricing.individual}
        team={c.pricing.team}
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
        dark={c.crossLink.dark}
      />

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
      />
    </>
  );
}
