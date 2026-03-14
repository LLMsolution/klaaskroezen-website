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

export const metadata: Metadata = {
  title: "Boek — Sales, Oprecht en Ontspannen",
  description:
    "Bestseller van Klaas Kroezen. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt. Beschikbaar als hardcopy, e-book en luisterboek.",
};

export default function BoekPage() {
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
                  alt="Boek: Sales, Oprecht en Ontspannen door Klaas Kroezen"
                  width={380}
                  height={570}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            <FadeIn>
              <Label className="mb-3">Bestseller</Label>
              <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
                Sales, Oprecht
                <br />
                <em className="italic font-normal text-copper">
                  en Ontspannen.
                </em>
              </h1>
              <div className="space-y-4 mb-8 max-w-[520px]">
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                  Waarom voelt sales zo vaak ongemakkelijk en geforceerd? Omdat
                  we geconditioneerd zijn om te overtuigen in plaats van oprecht
                  te helpen.
                </p>
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                  Dit boek is een praktische gids voor iedereen die dat
                  traditionele, pushy salesgedoe spuugzat is en verlangt naar
                  iets wat{" "}
                  <strong className="font-semibold text-ink">
                    oprecht werkt
                  </strong>
                  : het creëren van ware fans.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  "Bestseller",
                  "2e druk · 2.500+",
                  "#1 Managementboek",
                ].map((badge) => (
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
                <ButtonArrow>Direct bestellen</ButtonArrow>
              </ButtonExternal>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* What's inside */}
      <ProgramSection
        price="€ 32,50"
        pricingAnchor="#bestellen"
        ctaLabel="Bestel het boek"
        modules={[
          {
            number: "01",
            title: "Mindset & Overtuigingen",
            description:
              "Ontdek hoe je eigen overtuigingen je verkoopresultaat bepalen. Werk aan de mindset die past bij duurzaam succes.",
          },
          {
            number: "02",
            title: "Oprechte Verbinding",
            description:
              "Leer hoe je vanaf het eerste moment vertrouwen opbouwt. Niet met scripts, maar door écht te luisteren.",
          },
          {
            number: "03",
            title: "De Vraag Achter de Vraag",
            description:
              "Klanten vertellen zelden meteen wat ze echt nodig hebben. Leer de werkelijke behoefte boven tafel te krijgen.",
          },
          {
            number: "04",
            title: "Ontspannen Presenteren",
            description:
              "Presenteer je aanbod vanuit rust en overtuiging. Geen verkooppraatjes, maar een verhaal dat resoneert.",
          },
          {
            number: "05",
            title: "Bezwaren & Onderhandelen",
            description:
              "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging. Leer er ontspannen mee omgaan.",
          },
          {
            number: "06",
            title: "Van Klant naar Fan",
            description:
              "Een deal sluiten is het begin. Bouw relaties die leiden tot herhaalaankopen en aanbevelingen.",
          },
        ]}
      />

      <BookPricing />

      <Testimonials3D
        eyebrow="Wat lezers zeggen"
        title="Bewezen resultaat."
        titleAccent="Van LinkedIn tot Managementboek."
        reviews={[
          {
            text: "Dit boek laat zien dat echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. Een must-read voor wie klanten wil veranderen in fans.",
            name: "Michael Pilarczyk",
            role: "Oprichter MasterMind Academy",
          },
          {
            text: "In dit boek spat de oprechtheid er vanaf. Sales zoals het bedoeld is: met pure intentie de verbinding maken tussen de échte klantbehoefte en wat je vertegenwoordigt.",
            name: "Simon Kornblum",
            role: "Directeur Visma YouServe",
          },
          {
            text: "Verkopen gaat niet over trucjes, maar over écht contact maken. Een manier van sales die past bij wie je bent — ook als je jezelf geen verkoper vindt.",
            name: "Mark Tigchelaar",
            role: "Psycholoog · Focus AAN/UIT",
          },
          {
            text: "Ik gun je een Klaas! Hij is al jaren de motor achter mijn succesvolle bedrijf.",
            name: "Tijn Touber",
            role: "Oprichter Lois Lane · schrijver en inspirator",
          },
          {
            text: "Dit boek gaat helemaal niet over sales. Het gaat over gedrag. In één ruk uitgelezen. En ik ben helemaal energiek om sales te gaan doen.",
            name: "Roderick Göttgens",
            role: "Oprichter Behavior Boost",
            source: "LinkedIn",
          },
          {
            text: "Sales kan ook rustig. Oprecht. En ijzersterk. Dit boek brengt het vak terug naar de basis: vertrouwen, vakmanschap en relaties die blijven.",
            name: "Hendrika Willemse-Vreugdenhil",
            role: "Speaker & auteur",
            source: "LinkedIn",
          },
          {
            text: "Topboek! Leest vlot en op zo'n manier geschreven dat je er vertrouwen in krijgt dat je dit morgen kan toepassen.",
            name: "M. de Schipper",
            role: "Lezer",
            source: "Managementboek",
          },
          {
            text: "Dit boek raakt de essentie en nodigt je uit om actief naar je eigen overtuigingen te kijken. Super praktisch toepasbaar.",
            name: "M. te Woerd",
            role: "Lezer",
            source: "Managementboek",
          },
          {
            text: "Sales gaat niet over verkopen aan iemand, maar over het helpen van iemand. Met die insteek voelt sales nu al anders.",
            name: "Y. Kruger",
            role: "Lezer",
            source: "Managementboek",
          },
          {
            text: "Echt een super goed boek. Maakt sales oprecht, menselijk en ontspannen, vol praktische tips die ik gelijk kan toepassen.",
            name: "E. Verheijen",
            role: "Lezer",
            source: "Managementboek",
          },
        ]}
      />

      <Faq
        title="Over het boek."
        titleAccent="Veelgestelde vragen."
        items={[
          {
            question: "Voor wie is dit boek geschreven?",
            answer: "Voor iedereen die commercieel actief is: sales professionals, ondernemers, accountmanagers en managers. Maar ook voor mensen die 'iets met klanten doen' en daar beter in willen worden — zonder zich anders voor te doen.",
          },
          {
            question: "Hoe snel wordt het boek bezorgd?",
            answer: "De hardcopy wordt binnen één werkdag verzonden met gratis verzending binnen Nederland. Het e-book en luisterboek zijn direct na betaling beschikbaar.",
          },
          {
            question: "Wie leest het luisterboek in?",
            answer: "Klaas zelf. Zo hoor je de verhalen en inzichten precies zoals ze bedoeld zijn — met de energie en overtuiging van de auteur.",
          },
          {
            question: "Kan ik het boek in bulk bestellen voor mijn team?",
            answer: "Ja, neem contact op voor een aantrekkelijk groepstarief. Veel bedrijven bestellen het boek als cadeau bij een training of kick-off.",
          },
          {
            question: "Is het boek ook als training beschikbaar?",
            answer: "Ja, de Sales Excellence Training en Customer Success Training zijn gebaseerd op dezelfde methode als het boek, maar dan als verdiepend programma met oefeningen, video's en persoonlijke begeleiding.",
          },
        ]}
      />

      <VideoGrid
        eyebrow="Bekijk"
        title="Speech op de boeklancering."
        description="Waar komt mijn drive vandaan? Waarom Sales, oprecht en ontspannen?"
        videos={[
          {
            title: "Speech op de boeklancering",
            thumbnail: "/images/spreker/video-thumb-speech.jpg",
            embedUrl: "https://www.youtube.com/embed/F6io8l_VYww",
            duration: "3:35",
          },
          {
            title: "Aftermovie boeklancering",
            thumbnail: "/images/book/boeklancering.jpeg",
            embedUrl: "https://www.youtube.com/embed/o7ajUmwEWpI",
            duration: "1:08",
          },
        ]}
      />

      <CrossLink
        eyebrow="Verder leren"
        title="Sales Excellence Training."
        titleAccent="Van boek naar praktijk."
        description="Het boek gelezen? Ga verder met de training. Dezelfde filosofie, maar dan met persoonlijke begeleiding en praktijkoefeningen."
        image="/images/hero/sales-excellence-group.jpeg"
        imageAlt="Deelnemers van de Sales Excellence Training"
        href="/sales-excellence-training"
        ctaLabel="Bekijk training"
      />

      <TrainingCta
        title="Bestel het boek."
        titleAccent="Oprecht & ontspannen."
        description="Beschikbaar als hardcopy, e-book en luisterboek. Start vandaag met een aanpak die werkt — en die bij je past."
        href="#bestellen"
        ctaLabel="Bekijk opties"
      />
    </>
  );
}
