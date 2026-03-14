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

export const metadata: Metadata = {
  title: "Sales Excellence Training",
  description:
    "Meer omzet met minder druk. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt. Voor verkopers, accountmanagers en salesteams.",
};

export default function SalesExcellenceTrainingPage() {
  return (
    <>
      <JsonLd
        data={courseJsonLd({
          name: "Sales Excellence Training",
          description: "Meer omzet met minder druk. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt.",
          url: "https://www.klaaskroezen.com/sales-excellence-training",
          price: "2250",
        })}
      />
      <TrainingHero
        eyebrow="Sales Excellence Training"
        titleLine1="Meer omzet."
        titleLine2="Minder stress."
        description="Voor teams en professionals die weten dat er meer in zit. Geen trucjes, maar een bewezen aanpak die past bij wie je bent."
        image="/images/training/visma-youserve-session.jpg"
        imageAlt="Klaas Kroezen geeft de Sales Excellence Training aan een groep professionals"
        imagePosition="center 25%"
        glassItems={[
          {
            label: "Gemiddelde beoordeling",
            text: "9.1 — op basis van honderden deelnemers uit het bedrijfsleven.",
          },
          {
            label: "25+ jaar ervaring",
            text: "Internationaal B2B bij Google, Samsung, Microsoft, ING en Vodafone. Bedrijf verkocht in 2022.",
          },
          {
            label: "Resultaatgarantie",
            text: "10% beter in sales of geld terug. Gemeten via het Customer Experience Model.",
          },
        ]}
      />

      <PainPoints
        title="Je herkent dit."
        titleAccent="En je wilt het anders."
        points={[
          "Sales loopt achter op target — en de druk neemt toe",
          "Klantgesprekken voelen als duwen in plaats van verbinden",
          "Bestaande klanten blijven niet, nieuwe komen moeilijk binnen",
          "Je team werkt hard, maar zonder structuur of energie",
          "Korting geven is de standaard geworden om deals te sluiten",
          "Motivatie is wisselend — de ene maand goed, de volgende niet",
        ]}
      />

      <TransformationSlider
        items={[
          {
            label: "Targets",
            before: "Sales loopt achter op target — de druk neemt toe",
            after: "Omzet groeit structureel en voorspelbaar",
          },
          {
            label: "Gesprekken",
            before: "Klantgesprekken voelen als duwen in plaats van verbinden",
            after: "Gesprekken voelen als oprechte verbinding",
          },
          {
            label: "Deals",
            before: "Korting geven is de standaard om deals te sluiten",
            after: "Klanten kiezen voor jou op basis van waarde",
          },
          {
            label: "Team",
            before: "Je team werkt hard, maar zonder structuur of energie",
            after: "Energie en trots in het team — iedereen weet wat werkt",
          },
          {
            label: "Klanten",
            before: "Bestaande klanten blijven niet, nieuwe komen moeilijk binnen",
            after: "Klanten blijven langer en bevelen je actief aan",
          },
          {
            label: "Resultaat",
            before: "Motivatie is wisselend — de ene maand goed, de volgende niet",
            after: "Consistente resultaten door een bewezen aanpak",
          },
        ]}
      />

      <ForWhom
        audiences={[
          "Accountmanagers",
          "Salesteams",
          "Ondernemers",
          "Directeuren",
          "Junior verkopers",
          "Senior verkopers",
        ]}
      />

      <ProgramSection
        price="€ 2.250"
        modules={[
          {
            number: "01",
            title: "Mindset & Identiteit",
            description:
              "Ontdek hoe je overtuigingen je verkoopresultaat bepalen. Werk aan de mindset die past bij duurzaam succes — zonder masker, zonder druk.",
          },
          {
            number: "02",
            title: "Oprechte Verbinding",
            description:
              "Leer hoe je vanaf het eerste moment vertrouwen opbouwt. Niet met scripts, maar door écht te luisteren en je te verdiepen in de ander.",
          },
          {
            number: "03",
            title: "De Klantvraag Achter de Vraag",
            description:
              "Klanten vertellen zelden meteen wat ze echt nodig hebben. Leer hoe je de werkelijke behoefte boven tafel krijgt — respectvol en trefzeker.",
          },
          {
            number: "04",
            title: "Ontspannen Presenteren & Pitchen",
            description:
              "Presenteer je aanbod vanuit rust en overtuiging. Geen verkooppraatjes, maar een verhaal dat resoneert en blijft hangen.",
          },
          {
            number: "05",
            title: "Bezwaren & Onderhandelen",
            description:
              "Bezwaren zijn geen afwijzing — ze zijn een uitnodiging. Leer hoe je er ontspannen mee omgaat en betere deals sluit zonder korting te geven.",
          },
          {
            number: "06",
            title: "Klanten die Fans Worden",
            description:
              "Een deal sluiten is het begin, niet het einde. Bouw relaties die leiden tot herhaalaankopen, aanbevelingen en klanten die ambassadeur worden.",
          },
        ]}
      />

      <TrainingMethod />

      <LogoBar />

      <RadarModel />

      <TrainingReviews
        reviews={[
          {
            text: "Direct meer resultaat. Klaas heeft ons salesteam fundamenteel veranderd — niet met trucjes maar met een aanpak die écht werkt en blijft hangen.",
            name: "Simon Kornblum",
            role: "Directeur Visma YouServe",
            avatar: "/images/reviews/simon-kornblum.jpg",
          },
          {
            text: "Van 10 leads werden 1 tot 2 klant. Nu zijn dat er 7 tot 8. Niet door harder te pushen, maar door oprecht geïnteresseerd te zijn.",
            name: "Max de Weijer",
            role: "Ondernemer",
          },
          {
            text: "Klaas laat zien dat verkopen niet gaat over trucjes maar over écht contact maken. Een aanpak die werkt — ook als je jezelf geen verkoper vindt.",
            name: "Mark Tigchelaar",
            role: "Psycholoog · Focus AAN/UIT",
            avatar: "/images/reviews/mark-tigchelaar.jpeg",
          },
        ]}
      />

      <PricingSection
        guarantee="10% beter in sales of geld terug — gemeten via het Customer Experience Model."
        individual={{
          tiers: [
            {
              label: "Zelf studeren",
              title: "Online",
              price: "€ 2.250",
              priceNote: "Excl. BTW",
              description:
                "Flexibel en in eigen tempo. Start direct met de volledige online training.",
              features: [
                "6 modules online training",
                "Digitaal werkboek met opdrachten",
                "1 jaar toegang",
                "Inclusief bestseller boek",
                "Certificaat na afronding",
              ],
              cta: "Direct starten",
              href: "#",
            },
            {
              label: "Meest gekozen",
              title: "Training + Coaching",
              price: "€ 3.750",
              priceNote: "Excl. BTW",
              description:
                "Alles van Online plus persoonlijke begeleiding van kick-off tot afronding.",
              features: [
                "Alles van Online",
                "Fysiek werkboek met opdrachten",
                "Persoonlijke kick-off sessie",
                "Presentatie met feedback van Klaas",
                "Actieplan op maat",
              ],
              cta: "Training kopen",
              href: "#",
              featured: true,
            },
          ],
        }}
        team={{
          tiers: [
            {
              label: "Kleine teams",
              title: "Team Training",
              price: "€ 2.250",
              priceNote: "Per deelnemer · Excl. BTW · Vanaf 3 personen",
              description:
                "Dezelfde training, maar samen met je team. Inclusief gezamenlijke kick-off en teamgerichte oefeningen.",
              features: [
                "Alles van Training + Coaching",
                "Fysiek werkboek per deelnemer",
                "Gezamenlijke kick-off op locatie",
                "Groepspresentaties met live feedback",
                "Certificaat per deelnemer",
              ],
              cta: "Neem contact op",
              href: "/contact",
              featured: true,
            },
            {
              label: "Maatwerk",
              title: "Enterprise",
              price: "Op aanvraag",
              description:
                "Voor grotere organisaties. Volledig op maat, inclusief team-implementatie en persoonlijke coaching.",
              features: [
                "Alles van Team Training",
                "Op locatie of hybride",
                "Volledige team-implementatie",
                "Op maat voor jouw organisatie",
                "Persoonlijke coaching per deelnemer",
                "Managementrapportage",
              ],
              cta: "Plan een gesprek",
              href: "/contact",
            },
          ],
        }}
      />

      <CrossLink
        eyebrow="Ook interessant"
        title="Customer Success Training."
        titleAccent="Van klant naar fan."
        description="Geen salesfunctie, maar wél commercieel cruciaal. Leer hoe je vanuit klantcontact bijdraagt aan groei, retentie en ambassadeurschap."
        image="/images/hero/customer-success-group.jpg"
        imageAlt="Deelnemers van de Customer Success Training"
        href="/customer-success-training"
        ctaLabel="Bekijk training"
      />

      <Faq
        title="Nog vragen?"
        titleAccent="We helpen je graag."
        items={[
          {
            question: "Voor wie is deze training bedoeld?",
            answer: "Voor iedereen met een commerciële rol: sales professionals, accountmanagers, business developers en salesmanagers. Of je nu 2 of 20 jaar ervaring hebt — de methode past zich aan op jouw niveau.",
          },
          {
            question: "Hoe lang duurt de training?",
            answer: "De online training bestaat uit 6 modules die je in je eigen tempo doorloopt. Gemiddeld ben je 6 tot 8 weken bezig. Bij de variant met coaching krijg je daarnaast persoonlijke begeleiding.",
          },
          {
            question: "Wat als het niet werkt voor mij?",
            answer: "We bieden een 10% resultaatgarantie. Als je na het volledig doorlopen van de training niet minimaal 10% verbetering ervaart, krijg je je geld terug. Geen kleine lettertjes.",
          },
          {
            question: "Kan ik de training ook voor mijn team inkopen?",
            answer: "Ja, we bieden een incompany variant aan op maat. Met groepsoefeningen, teamgerichte casussen en begeleiding op de werkvloer. Neem contact op voor een voorstel.",
          },
          {
            question: "Krijg ik direct toegang na aankoop?",
            answer: "Ja, je ontvangt direct na betaling een e-mail met je inloggegevens. Je kunt meteen beginnen met de eerste module.",
          },
          {
            question: "Wat maakt deze training anders dan andere salestrainingen?",
            answer: "Geen scripts, geen trucjes, geen NLP. We werken vanuit oprechte verbinding en ontspanning. Het resultaat: meer omzet die ook nog eens goed voelt. Gebaseerd op 25+ jaar praktijkervaring.",
          },
        ]}
      />

      <TrainingCta
        title="Start vandaag."
        titleAccent="Oprecht & ontspannen."
        description="Meer omzet, minder stress. Zonder trucjes, zonder druk. Ontdek een aanpak die bij je past — en die blijft werken."
        href="#pricing"
      />
    </>
  );
}
