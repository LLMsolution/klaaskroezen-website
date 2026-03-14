import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { StatsBand } from "@/components/sections/StatsBand";
import { TrainingCta } from "@/components/sections/training/TrainingCta";
import { FadeIn } from "@/components/ui/FadeIn";
import { JsonLd, personJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Over Ons",
  description:
    "Leer Klaas Kroezen en zijn team kennen. 25+ jaar ervaring in sales en customer success, nu volledig gericht op het begeleiden van teams naar meer omzet met minder stress.",
};

const team = [
  {
    name: "Tim Lind",
    role: "Rechterhand van Klaas",
    image: "/images/about/tim-lind.png",
    description:
      "Samen bouwen we de app, verbeteren we continu de trainingen, werkboeken, presentaties en video's.",
  },
  {
    name: "Joost Wammes",
    role: "Customer Success Manager",
    image: "/images/about/joost-wammes.png",
    description:
      "Zocht zelf een salestraining en was zó enthousiast dat hij nu deel uitmaakt van het team.",
  },
  {
    name: "Sanne Bakker",
    role: "Klantenservice & administratie",
    image: "/images/about/sanne-bakker.png",
    description:
      "Al meer dan 20 jaar werkzaam bij Klaas. Verzorgt de klantenservice en administratie.",
  },
];

const journey = [
  {
    period: "1997 – 2022",
    title: "Ondernemer & CEO",
    text: "25 jaar internationaal B2B. Tientallen miljoenen euro's omzet gerealiseerd in 21 landen. Verkocht aan Google, Samsung, Microsoft, Bol en ING.",
  },
  {
    period: "2022",
    title: "Bedrijf verkocht",
    text: "Na de verkoop van WUA besloot ik mijn ervaring in te zetten voor anderen. Niet als consultant, maar als trainer.",
  },
  {
    period: "2025",
    title: "Bestseller auteur",
    text: "Sales, Oprecht en Ontspannen werd #1 bij Managementboek. 2.500+ exemplaren verkocht in de eerste maanden.",
  },
  {
    period: "Nu",
    title: "Trainer & spreker",
    text: "Volledig gericht op het begeleiden van directies, teams en professionals. Omdat iedereen die klantcontact heeft, het verschil maakt.",
  },
];

export default function OverOnsPage() {
  return (
    <>
      <JsonLd data={personJsonLd} />
      {/* Klaas — prominent hero */}
      <section className="border-b border-rule">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-96px)]">
          <div className="relative aspect-[3/4] lg:aspect-auto overflow-hidden bg-warm">
            <Image
              src="/images/about/klaas-over-mij.jpeg"
              alt="Klaas Kroezen"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-16 lg:py-20">
            <FadeIn>
            <Label className="mb-3">Over Klaas</Label>
            <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
              Oprecht en ontspannen
              <br />
              <em className="italic font-normal text-ink/40">
                is geen slogan.
              </em>
            </h1>
            <div className="space-y-4 max-w-[480px] mb-8">
              <p className="text-[16px] sm:text-[17px] text-ink/80 leading-[1.8]">
                Ik stond 25 jaar aan de frontlinie als ondernemer en CEO. Ik weet
                hoe het voelt als sales voelt als trekken aan een dood paard. En
                ik weet hoe het wél werkt.
              </p>
              <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                Niet met trucjes of scripts, maar met een aanpak die past bij
                mensen. Na de verkoop van mijn bedrijf in 2022 richt ik mij
                volledig op het begeleiden van teams naar meer omzet met minder
                stress.
              </p>
            </div>

            {/* Inline credentials */}
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-[400px]">
              {[
                { label: "Ervaring", value: "25+ jaar" },
                { label: "Landen", value: "21" },
                { label: "Beoordeling", value: "9,1" },
                { label: "Boek", value: "#1 Bestseller" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-[22px] font-black leading-none tracking-[-0.02em]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Journey / Timeline */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <Container>
          <FadeIn className="mb-10 sm:mb-14 max-w-[520px]">
            <Label className="mb-3">Het pad</Label>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              Van ondernemer
              <br />
              <em className="italic font-normal text-ink/40">naar trainer.</em>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {journey.map((step, i) => (
              <div key={step.period} className="bg-paper p-6 sm:p-8 flex flex-col">
                <span className="font-display text-[42px] sm:text-[52px] font-black leading-none tracking-[-0.03em] text-ink/[0.06] mb-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-copper mb-2">
                  {step.period}
                </span>
                <h3 className="font-display text-[18px] sm:text-[20px] font-black leading-[1.1] tracking-[-0.01em] mb-3">
                  {step.title}
                </h3>
                <p className="text-[14px] text-ink/65 leading-[1.7] flex-1">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Mission — full width dark */}
      <section className="bg-ink border-b border-paper/[0.07]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center py-16 sm:py-[110px] px-7 sm:px-10 lg:pl-[max(3.5rem,calc((100vw-1180px)/2+3.5rem))] lg:pr-16">
            <FadeIn>
            <Label className="mb-3 text-copper-light">De missie</Label>
            <h2 className="font-display text-[clamp(28px,3.8vw,48px)] font-black leading-[0.97] tracking-[-0.03em] text-paper mb-6">
              Eén taal.
              <br />
              <em className="italic font-normal text-paper/40">
                Eén aanpak.
              </em>
            </h2>
            <div className="space-y-4 max-w-[480px]">
              <p className="text-[15px] sm:text-[16px] text-paper/70 leading-[1.8]">
                Wanneer sales achterblijft en klanttevredenheid daalt, is
                versnippering funest. Daarom werk ik met twee trainingen voor
                iedereen die contact heeft met klanten.
              </p>
              <p className="text-[15px] sm:text-[16px] text-paper/70 leading-[1.8]">
                Verkopen hoort niet ongemakkelijk te voelen. Het zou iets
                moeten zijn dat je met plezier en trots doet. Omdat het helpt.
                Omdat het klopt.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <ButtonLink href="/sales-excellence-training" variant="copper">
                <ButtonArrow>Sales Excellence</ButtonArrow>
              </ButtonLink>
              <ButtonLink href="/customer-success-training" variant="paper">
                <ButtonArrow>Customer Success</ButtonArrow>
              </ButtonLink>
            </div>
            </FadeIn>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[560px] overflow-hidden">
            <Image
              src="/images/about/klaas-kroezen-portrait-2.jpeg"
              alt="Klaas Kroezen geeft een training"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Team — Klaas is separate, team is supporting */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <Container>
          <FadeIn className="mb-10 sm:mb-14">
            <Label className="mb-3">Het team</Label>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              Klein team.
              <br />
              <em className="italic font-normal text-ink/40">Groot bereik.</em>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-rule border border-rule">
            {team.map((member) => (
              <div key={member.name} className="bg-paper">
                <div className="relative aspect-square overflow-hidden bg-warm">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-1.5">
                    {member.role}
                  </span>
                  <h3 className="font-display text-[18px] font-black leading-[1.1] tracking-[-0.01em] mb-2">
                    {member.name}
                  </h3>
                  <p className="text-[13px] sm:text-[14px] text-ink/65 leading-[1.65]">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Kantoor */}
      <section className="border-b border-rule">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-video lg:aspect-auto lg:min-h-[480px] overflow-hidden">
            <Image
              src="/images/about/kantoor-administratie.jpg"
              alt="Het Oude Administratiegebouw in Castricum"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center py-10 sm:py-16 lg:py-20 px-7 sm:px-10 lg:pl-16 lg:pr-[max(3.5rem,calc((100vw-1180px)/2+3.5rem))]">
            <FadeIn className="max-w-[480px]">
              <Label className="mb-3">Ons kantoor</Label>
              <h2 className="font-display text-[clamp(24px,2.8vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
                Het Oude
                <br />
                Administratiegebouw.
              </h2>
              <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8] mb-2">
                Een karakteristiek monumentaal pand in Castricum, aan de rand van
                het Noord-Hollands Duinreservaat. De fijne sfeer en de dynamiek
                van ondernemers om ons heen maken dit de perfecte plek.
              </p>
              <p className="text-[13px] text-ink/50 leading-[1.7] mt-3">
                Oude Parklaan 111, Castricum · Kamer 0.11
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <TrainingCta
        title="Klaar om het anders te doen?"
        titleAccent="Neem contact op."
        description="Samen brengen we in beeld waar je nu staat, waar kansen liggen, en welke aanpak jou of je team het meeste oplevert."
        href="/contact"
        ctaLabel="Neem contact op"
      />
    </>
  );
}
