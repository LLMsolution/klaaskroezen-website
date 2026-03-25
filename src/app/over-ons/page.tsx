import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { TrainingCta } from "@/components/sections/training/TrainingCta";
import { FadeIn } from "@/components/ui/FadeIn";
import { JsonLd, personJsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { loadPageContent, sectionOr } from "@/lib/site-content-loader";
import { loadSiteImages, imgUrl } from "@/lib/site-images";
import { getOverOnsContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const c = getOverOnsContent(lang);
  return {
    title: c.meta.title,
    description: c.meta.description,
  };
}

export default async function OverOnsPage() {
  const lang = await getLocale();
  const db = await loadPageContent("over-ons", lang);
  const img = await loadSiteImages([
    "about/klaas-over-mij.jpeg",
    "about/klaas-kroezen-portrait-2.jpeg",
    "about/kantoor-administratie.jpg",
    "about/tim-lind.png",
    "about/joost-wammes.png",
    "about/sanne-bakker.png",
  ]);
  const imageUrls: Record<string, string> = {};
  for (const key of Object.keys(img)) {
    imageUrls[key] = imgUrl(img, key);
  }
  const fallback = getOverOnsContent(lang, imageUrls);

  const hero = sectionOr(db, "hero", fallback.hero);
  const journey = sectionOr(db, "journey", fallback.journey);
  const mission = sectionOr(db, "mission", fallback.mission);
  const team = sectionOr(db, "team", fallback.team);
  const office = sectionOr(db, "office", fallback.office);
  const cta = sectionOr(db, "cta", fallback.cta);

  return (
    <>
      <JsonLd data={personJsonLd} />
      {/* Klaas — prominent hero */}
      <section className="border-b border-rule">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-96px)]">
          <div className="relative aspect-[3/4] lg:aspect-auto overflow-hidden bg-warm">
            <Image
              src={imgUrl(img, "about/klaas-over-mij.jpeg")}
              alt={hero.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-16 lg:py-20">
            <FadeIn>
            <Label className="mb-3">{hero.label}</Label>
            <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
              {hero.title}
              <br />
              <em className="italic font-normal text-ink/40">
                {hero.titleAccent}
              </em>
            </h1>
            <div className="space-y-4 max-w-[480px] mb-8">
              <p className="text-[16px] sm:text-[17px] text-ink/80 leading-[1.8]">
                {hero.bio?.[0]}
              </p>
              <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                {hero.bio?.[1]}
              </p>
            </div>

            {/* Inline credentials */}
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-[400px]">
              {(hero.stats ?? []).map((stat: { label: string; value: string }) => (
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
            <Label className="mb-3">{journey.label}</Label>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              {journey.title}
              <br />
              <em className="italic font-normal text-ink/40">{journey.titleAccent}</em>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {(journey.items ?? []).map((step: { period: string; title: string; text: string }, i: number) => (
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
            <Label className="mb-3 text-copper-light">{mission.label}</Label>
            <h2 className="font-display text-[clamp(28px,3.8vw,48px)] font-black leading-[0.97] tracking-[-0.03em] text-paper mb-6">
              {mission.title}
              <br />
              <em className="italic font-normal text-paper/40">
                {mission.titleAccent}
              </em>
            </h2>
            <div className="space-y-4 max-w-[480px]">
              <p className="text-[15px] sm:text-[16px] text-paper/70 leading-[1.8]">
                {mission.paragraphs?.[0]}
              </p>
              <p className="text-[15px] sm:text-[16px] text-paper/70 leading-[1.8]">
                {mission.paragraphs?.[1]}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <ButtonLink href="/sales-excellence-training" variant="copper">
                <ButtonArrow>{mission.ctaSales}</ButtonArrow>
              </ButtonLink>
              <ButtonLink href="/customer-success-training" variant="paper">
                <ButtonArrow>{mission.ctaSuccess}</ButtonArrow>
              </ButtonLink>
            </div>
            </FadeIn>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[560px] overflow-hidden">
            <Image
              src={imgUrl(img, "about/klaas-kroezen-portrait-2.jpeg")}
              alt={mission.imageAlt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <Container>
          <FadeIn className="mb-10 sm:mb-14">
            <Label className="mb-3">{team.label}</Label>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              {team.title}
              <br />
              <em className="italic font-normal text-ink/40">{team.titleAccent}</em>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-rule border border-rule">
            {(team.members ?? []).map((member: { name: string; role: string; image: string; description: string }) => (
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
              src={imgUrl(img, "about/kantoor-administratie.jpg")}
              alt={office.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center py-10 sm:py-16 lg:py-20 px-7 sm:px-10 lg:pl-16 lg:pr-[max(3.5rem,calc((100vw-1180px)/2+3.5rem))]">
            <FadeIn className="max-w-[480px]">
              <Label className="mb-3">{office.label}</Label>
              <h2 className="font-display text-[clamp(24px,2.8vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
                {office.title}
                <br />
                {office.titleLine2}
              </h2>
              <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8] mb-2">
                {office.description}
              </p>
              <p className="text-[13px] text-ink/50 leading-[1.7] mt-3">
                {office.address}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <TrainingCta
        title={cta.title}
        titleAccent={cta.titleAccent}
        description={cta.description}
        href={cta.href}
        ctaLabel={cta.ctaLabel}
      />
    </>
  );
}
