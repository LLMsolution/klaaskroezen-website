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
  title: "Customer Success Training",
  description:
    "Maak van klanten fans. Leer hoe je vanuit klantcontact bijdraagt aan groei, retentie en ambassadeurschap — ontspannen en oprecht.",
};

export default function CustomerSuccessTrainingPage() {
  return (
    <>
      <JsonLd
        data={courseJsonLd({
          name: "Customer Success Training",
          description: "Maak van klanten fans. Leer hoe je vanuit klantcontact bijdraagt aan groei, retentie en ambassadeurschap.",
          url: "https://www.klaaskroezen.com/customer-success-training",
          price: "2250",
        })}
      />
      <TrainingHero
        eyebrow="Customer Success Training"
        titleLine1="Van klant"
        titleLine2="naar fan."
        description="Je hebt geen salesfunctie — maar jij bepaalt wél of een klant blijft, groeit en anderen aanbeveelt. Dat is commercieel goud."
        image="/images/hero/customer-success-group.jpg"
        imageAlt="Deelnemers van de Customer Success Training"
        imagePosition="center center"
        glassItems={[
          {
            label: "Geen salestraining",
            text: "Specifiek voor professionals in klantcontact, service en delivery. Geen verkooptechnieken maar verbindingsvaardigheden.",
          },
          {
            label: "Direct toepasbaar",
            text: "Praktische tools en frameworks die je morgen al kunt inzetten in elk klantgesprek.",
          },
          {
            label: "Resultaatgarantie",
            text: "10% beter in klanttevredenheid of geld terug. Gemeten via het Customer Experience Model.",
          },
        ]}
      />

      <PainPoints
        title="Je herkent dit."
        titleAccent="En je wilt het anders."
        eyebrow="Je doet geen sales. Maar je bent commercieel cruciaal."
        points={[
          "Klanten vertrekken zonder dat je weet waarom",
          "Onbenut potentieel in bestaand klantcontact",
          "Geen structuur in opvolging en relatiebeheer",
          "Continu brandjes blussen in plaats van proactief werken",
          "Moeite met het bespreekbaar maken van meerwaarde",
          "Je team is betrokken, maar mist de commerciële vaardigheden",
        ]}
      />

      <TransformationSlider
        items={[
          {
            label: "Retentie",
            before: "Klanten vertrekken zonder dat je weet waarom",
            after: "Je ziet signalen vroeg en handelt proactief",
          },
          {
            label: "Klantcontact",
            before: "Onbenut potentieel in bestaand klantcontact",
            after: "Elk gesprek draagt bij aan groei en retentie",
          },
          {
            label: "Proces",
            before: "Geen structuur in opvolging en relatiebeheer",
            after: "Een helder proces van onboarding tot ambassadeur",
          },
          {
            label: "Werkwijze",
            before: "Continu brandjes blussen in plaats van proactief werken",
            after: "Rust en overzicht — je werkt vooruit, niet achteruit",
          },
          {
            label: "Waarde",
            before: "Moeite met het bespreekbaar maken van meerwaarde",
            after: "Je bespreekt waarde op een natuurlijke, ontspannen manier",
          },
          {
            label: "Team",
            before: "Je team is betrokken, maar mist de commerciële vaardigheden",
            after: "Iedereen weet hoe klantcontact bijdraagt aan commercieel succes",
          },
        ]}
      />

      <ForWhom
        audiences={[
          "Customer Success Managers",
          "Supportteams",
          "Consultants",
          "Accountteams",
          "Delivery & service",
          "Projectmanagers",
        ]}
      />

      <ProgramSection
        price="€ 2.250"
        modules={[
          {
            number: "01",
            title: "Jouw Rol in het Commerciële Geheel",
            description:
              "Begrijp hoe jouw klantcontact direct invloed heeft op omzet, retentie en ambassadeurschap. Je bent geen verkoper — maar wél onmisbaar.",
          },
          {
            number: "02",
            title: "Oprechte Klantfocus",
            description:
              "Leer luisteren voorbij het oppervlak. Begrijp wat je klant écht nodig heeft en bouw relaties die verder gaan dan het project.",
          },
          {
            number: "03",
            title: "Signalen Herkennen",
            description:
              "Klanten geven continu signalen — over tevredenheid, kansen en risico's. Leer ze herkennen en er ontspannen op acteren.",
          },
          {
            number: "04",
            title: "Moeilijke Gesprekken Ontspannen Voeren",
            description:
              "Prijsverhogingen, verwachtingsmanagement, teleurstelling — leer hoe je lastige onderwerpen bespreekt zonder de relatie te beschadigen.",
          },
          {
            number: "05",
            title: "Kansen Zien Zonder \"Te Verkopen\"",
            description:
              "Herken natuurlijke momenten om meerwaarde te bieden. Geen upsell-trucjes, maar oprechte suggesties die je klant verder helpen.",
          },
          {
            number: "06",
            title: "Van Klant naar Ambassadeur",
            description:
              "Tevreden klanten zijn goed. Ambassadeurs zijn beter. Leer hoe je van klantcontact een groeimachine maakt voor je organisatie.",
          },
        ]}
      />

      <TrainingMethod />

      <LogoBar />

      <RadarModel />

      <TrainingReviews
        reviews={[
          {
            text: "Direct meer resultaat. Klaas maakt helder dat iedereen met klantcontact essentieel is voor commercieel succes — en geeft je de tools om dat waar te maken.",
            name: "Simon Kornblum",
            role: "Directeur Visma YouServe",
            avatar: "/images/reviews/simon-kornblum.jpg",
          },
          {
            text: "Echte sales begint bij wie je bént. Mindset, rust en oprechte intentie leiden tot verbinding. Een must voor wie klanten wil veranderen in fans.",
            name: "Michael Pilarczyk",
            role: "Oprichter MasterMind Academy",
            avatar: "/images/reviews/michael-pilarczyk.jpeg",
          },
          {
            text: "Dit boek gaat helemaal niet over sales. Het gaat over gedrag. Over hoe je oprechte verbinding maakt.",
            name: "Roderick Göttgens",
            role: "Oprichter Behavior Boost",
          },
        ]}
      />

      <PricingSection
        guarantee="10% beter in klanttevredenheid of geld terug — gemeten via het Customer Experience Model."
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
        title="Sales Excellence Training."
        titleAccent="Meer omzet, minder stress."
        description="Voor verkopers en salesteams die weten dat er meer in zit. Leer hoe je met oprechtheid en ontspanning structureel beter verkoopt."
        image="/images/hero/sales-excellence-group.jpeg"
        imageAlt="Deelnemers van de Sales Excellence Training met certificaten"
        href="/sales-excellence-training"
        ctaLabel="Bekijk training"
        dark
      />

      <Faq
        title="Nog vragen?"
        titleAccent="We helpen je graag."
        items={[
          {
            question: "Moet ik een salesachtergrond hebben?",
            answer: "Nee, juist niet. Deze training is specifiek ontworpen voor mensen zónder salesfunctie die wél klantcontact hebben: customer success managers, servicedesks, accountmanagers en consultants.",
          },
          {
            question: "Hoe lang duurt de training?",
            answer: "De online training bestaat uit 6 modules die je in je eigen tempo doorloopt. Gemiddeld ben je 6 tot 8 weken bezig. Bij de variant met coaching krijg je daarnaast persoonlijke begeleiding.",
          },
          {
            question: "Wat als het niet werkt voor mij?",
            answer: "We bieden een 10% resultaatgarantie. Als je na het volledig doorlopen van de training niet minimaal 10% verbetering ervaart in klanttevredenheid of retentie, krijg je je geld terug.",
          },
          {
            question: "Kan ik de training ook voor mijn team inkopen?",
            answer: "Ja, we bieden een incompany variant aan op maat. Met teamgerichte oefeningen, klantcasussen uit jullie praktijk en begeleiding tijdens implementatie. Neem contact op voor een voorstel.",
          },
          {
            question: "Krijg ik direct toegang na aankoop?",
            answer: "Ja, je ontvangt direct na betaling een e-mail met je inloggegevens. Je kunt meteen beginnen met de eerste module.",
          },
          {
            question: "Wat is het verschil met de Sales Excellence Training?",
            answer: "Sales Excellence is gericht op het binnenhalen van nieuwe klanten. Customer Success draait om het behouden en laten groeien van bestaande klanten. Samen vormen ze één methode voor commerciële groei.",
          },
        ]}
      />

      <TrainingCta
        title="Start vandaag."
        titleAccent="Oprecht & ontspannen."
        description="Hogere klanttevredenheid, meer retentie en klanten die ambassadeur worden. Zonder verkoopdruk."
        href="#pricing"
      />
    </>
  );
}
