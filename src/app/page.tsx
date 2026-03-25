import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { StatsBand } from "@/components/sections/StatsBand";
import { LogoBar } from "@/components/sections/LogoBar";
import { TrainingCards } from "@/components/sections/TrainingCards";
import { TeamPhotos } from "@/components/sections/TeamPhotos";
import { ReviewGrid } from "@/components/sections/ReviewGrid";
import { AboutKlaas } from "@/components/sections/AboutKlaas";
import { BookTeaser } from "@/components/sections/BookTeaser";
import { FinaleCta } from "@/components/sections/FinaleCta";
import { BookPopup } from "@/components/ui/BookPopup";
import { JsonLd, websiteJsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { loadSiteImages } from "@/lib/site-images";
import { SLIDE_KEYS } from "@/components/sections/HeroSlideshow";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return {
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
  };
}

export default async function HomePage() {
  const lang = await getLocale();
  const img = await loadSiteImages([
    ...SLIDE_KEYS,
    "book/sales-oprecht-ontspannen-cover.png",
  ]);
  const slideImages: Record<string, string> = {};
  for (const key of SLIDE_KEYS) {
    slideImages[key] = img[key].url;
  }

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <BookPopup lang={lang} coverImage={img["book/sales-oprecht-ontspannen-cover.png"].url} />
      <Hero lang={lang} slideImages={slideImages} />
      <LogoBar />
      <TrainingCards lang={lang} />
      <StatsBand lang={lang} />
      <TeamPhotos />
      <ReviewGrid lang={lang} />
      <AboutKlaas lang={lang} />
      <BookTeaser lang={lang} />
      <FinaleCta lang={lang} />
    </>
  );
}
