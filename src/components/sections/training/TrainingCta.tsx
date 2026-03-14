import { Container } from "@/components/ui/Container";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

interface TrainingCtaProps {
  title: string;
  titleAccent: string;
  description: string;
  href: string;
  ctaLabel?: string;
}

export function TrainingCta({
  title,
  titleAccent,
  description,
  href,
  ctaLabel = "Training kopen",
}: TrainingCtaProps) {
  return (
    <section className="bg-ink py-20 sm:py-[130px] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(181,98,42,0.11),transparent_65%)]"
        aria-hidden="true"
      />
      <Container>
        <FadeIn className="relative max-w-[640px] mx-auto text-center">
          <h2 className="font-display text-[clamp(32px,4.2vw,58px)] font-black leading-[0.95] tracking-[-0.03em] text-paper mb-4">
            {title}
            <br />
            <em className="italic font-normal text-copper">
              {titleAccent}
            </em>
          </h2>
          <p className="text-paper/60 text-[15px] sm:text-[16px] leading-[1.75] mb-8">
            {description}
          </p>
          <ButtonLink href={href} variant="copper" size="large">
            <ButtonArrow>{ctaLabel}</ButtonArrow>
          </ButtonLink>
        </FadeIn>
      </Container>
    </section>
  );
}
