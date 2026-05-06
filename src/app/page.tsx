import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { StatsBand } from "@/components/sections/StatsBand";
import { LogoBar } from "@/components/sections/LogoBar";
import { TrainingCards } from "@/components/sections/TrainingCards";
import { TeamPhotos } from "@/components/sections/TeamPhotos";
import { ReviewGrid } from "@/components/sections/ReviewGrid";
import { AboutKlaas } from "@/components/sections/AboutKlaas";
import { BookTeaser } from "@/components/sections/BookTeaser";
import { FinaleCta } from "@/components/sections/FinaleCta";
import { JsonLd, websiteJsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return await loadPageMeta("home", lang, {
    title: {
      nl: "Klaas Kroezen — Meer omzet, minder stress",
      en: "Klaas Kroezen — More revenue, less stress",
      de: "Klaas Kroezen — Mehr Umsatz, weniger Stress",
    }[lang],
    description: {
      nl: "Sales- en Customer Success trainingen van Klaas Kroezen. Oprecht en ontspannen verkopen. 25+ jaar ervaring, 21 landen, 9.1 beoordeling.",
      en: "Sales and Customer Success trainings by Klaas Kroezen. Honest and relaxed selling. 25+ years of experience across 21 countries, 9.1 rating.",
      de: "Sales- und Customer-Success-Trainings von Klaas Kroezen. Ehrlich und entspannt verkaufen. 25+ Jahre Erfahrung in 21 Landern, 9.1 Bewertung.",
    }[lang],
  });
}

type Section = Record<string, unknown>;

export default async function HomePage() {
  const lang = await getLocale();
  const db = await loadPageContent("home", lang);

  const hero = sectionOr(db, "hero", {} as Section) as {
    eyebrow?: string;
    line1?: string;
    line2?: string;
    line3?: string;
    intro?: string;
    introHighlight?: string;
    introEnd?: string;
    forSales?: string;
    setSalesTitle?: string;
    forCS?: string;
    cstTitle?: string;
    benefits?: string[];
  };
  const slideshow = sectionOr(db, "slideshow", {} as Section) as { slides?: Array<{ image?: string; alt?: string; objectPosition?: string; quote?: string; author?: string; role?: string; detail?: string }> };
  const logos = sectionOr(db, "logos", {} as Section) as { label?: string; items?: Array<{ image?: string; alt?: string; width?: number; height?: number }> };
  const trainingCards = sectionOr(db, "training-cards", {} as Section) as { eyebrow?: string; title?: string; titleAccent?: string; introBold?: string; introEnd?: string; items?: Array<{ image?: string; imageAlt?: string; label?: string; title?: string; who?: string; description?: string; descriptionHighlight?: string; descriptionEnd?: string; points?: string[]; href?: string; ctaLabel?: string }> };
  const finaleCta = sectionOr(db, "finale-cta", {} as Section) as { eyebrow?: string; title?: string; titleAccent?: string; description?: string; ctaPrimary?: string; ctaSecondary?: string; guarantees?: string[] };
  const stats = sectionOr(db, "stats", {} as Section) as { items?: Array<{ value?: string; label?: string }> };
  const teamPhotos = sectionOr(db, "team-photos", {} as Section) as { eyebrow?: string; title?: string; titleAccent?: string; items?: Array<{ image?: string; caption?: string; featured?: string }> };
  const reviews = sectionOr(db, "reviews", {} as Section) as { eyebrow?: string; title?: string; titleAccent?: string; items?: Array<{ text?: string; name?: string; role?: string; avatar?: string; source?: string }> };
  const aboutKlaas = sectionOr(db, "about-klaas", {} as Section) as {
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
  };
  const bookTeaser = sectionOr(db, "book-teaser", {} as Section) as {
    image?: string;
    imageAlt?: string;
    label?: string;
    title?: string;
    titleAccent?: string;
    description?: string;
    badges?: string[];
    ctaLabel?: string;
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Hero lang={lang} slides={slideshow.slides} content={hero} />
      <LogoBar content={logos} />
      <TrainingCards lang={lang} content={trainingCards} />
      <StatsBand lang={lang} content={stats} />
      <TeamPhotos content={teamPhotos} />
      <ReviewGrid lang={lang} content={reviews} />
      <AboutKlaas lang={lang} content={aboutKlaas} />
      <BookTeaser lang={lang} content={bookTeaser} />
      <FinaleCta lang={lang} content={finaleCta} />
    </>
  );
}
