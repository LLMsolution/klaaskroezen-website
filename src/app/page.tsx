import { Hero } from "@/components/sections/Hero";
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

export default async function HomePage() {
  const lang = await getLocale();

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Hero lang={lang} />
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
