import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import {
  ButtonLink,
  ButtonArrow,
} from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

interface GlassItem {
  label: string;
  text: string;
}

interface TrainingHeroProps {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  glassItems: GlassItem[];
  pricingAnchor?: string;
  programAnchor?: string;
  ctaLabel?: string;
  secondaryLabel?: string;
}

export function TrainingHero({
  eyebrow,
  titleLine1,
  titleLine2,
  description,
  image,
  imageAlt,
  imagePosition = "center 30%",
  glassItems,
  pricingAnchor = "#pricing",
  programAnchor = "#programma",
  ctaLabel = "Training kopen",
  secondaryLabel = "Bekijk programma",
}: TrainingHeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-end bg-ink overflow-hidden">
      <Image
        src={image}
        alt={imageAlt}
        fill
        className="object-cover"
        style={{ objectPosition: imagePosition, opacity: 0.5 }}
        priority
        sizes="100vw"
      />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent"
        aria-hidden="true"
      />

      <Container className="relative z-10 pb-14 sm:pb-20 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-end">
          {/* Left: Copy */}
          <FadeIn>
            <Label className="mb-4 text-copper">{eyebrow}</Label>
            <h1 className="font-display text-[clamp(42px,5.5vw,76px)] font-black leading-[0.93] tracking-[-0.03em] text-paper">
              {titleLine1}
              <br />
              <em className="italic font-normal text-copper">
                {titleLine2}
              </em>
            </h1>
            <p className="text-paper/70 text-[16px] sm:text-[17px] leading-[1.75] mt-6 max-w-[480px]">
              {description}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <ButtonLink href={pricingAnchor} variant="copper" size="large">
                <ButtonArrow>{ctaLabel}</ButtonArrow>
              </ButtonLink>
              <ButtonLink href={programAnchor} variant="paper">
                {secondaryLabel}
              </ButtonLink>
            </div>
          </FadeIn>

          {/* Right: Glass card */}
          <div className="backdrop-blur-xl bg-paper/[0.05] border border-paper/[0.08] rounded-[3px] divide-y divide-paper/[0.08]">
            {glassItems.map((item) => (
              <div key={item.label} className="px-7 py-5 sm:px-8 sm:py-6">
                <span className="text-copper text-[10px] font-medium tracking-[0.2em] uppercase block mb-1.5">
                  {item.label}
                </span>
                <p className="text-paper/80 text-[14px] sm:text-[15px] leading-[1.6]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
