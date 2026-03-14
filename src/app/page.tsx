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

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Hero />
      <LogoBar />
      <TrainingCards />
      <StatsBand />
      <TeamPhotos />
      <ReviewGrid />
      <AboutKlaas />
      <BookTeaser />
      <FinaleCta />
    </>
  );
}
