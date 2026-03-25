import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { getLocale } from "@/lib/i18n/server";
import { BlogList } from "./BlogList";

export const metadata: Metadata = {
  title: "Nieuws & Blog",
  description: "Het laatste nieuws, trainingen en inzichten van Klaas Kroezen.",
};

export default async function NieuwsPage() {
  const lang = await getLocale();

  return (
    <section className="py-16 sm:py-[110px]">
      <Container>
        <FadeIn className="mb-12 sm:mb-16 max-w-[600px]">
          <Label className="mb-3">
            {{ nl: "Nieuws & Blog", en: "News & Blog", de: "Neuigkeiten & Blog" }[lang]}
          </Label>
          <h1 className="font-display text-[clamp(32px,4vw,52px)] font-black leading-[0.97] tracking-[-0.03em]">
            {{ nl: "Verhalen uit de praktijk.", en: "Stories from the field.", de: "Geschichten aus der Praxis." }[lang]}
          </h1>
          <p className="text-[16px] text-ink/60 leading-[1.8] mt-4">
            {{ nl: "Trainingen, boeknieuws, inzichten en persoonlijke verhalen.", en: "Trainings, book news, insights and personal stories.", de: "Trainings, Buchneuigkeiten, Einblicke und persönliche Geschichten." }[lang]}
          </p>
        </FadeIn>

        <BlogList lang={lang} />
      </Container>
    </section>
  );
}
