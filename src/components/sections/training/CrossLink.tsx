import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

interface CrossLinkProps {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  dark?: boolean;
}

export function CrossLink({
  eyebrow,
  title,
  titleAccent,
  description,
  image,
  imageAlt,
  href,
  ctaLabel,
  dark = false,
}: CrossLinkProps) {
  return (
    <section
      className={`py-16 sm:py-[100px] border-b border-rule ${
        dark ? "bg-ink" : "bg-warm"
      }`}
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          <div className="overflow-hidden rounded-[3px] border border-rule">
            <Image
              src={image}
              alt={imageAlt}
              width={590}
              height={332}
              unoptimized={image.startsWith("https://")}
              className="w-full h-auto object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          </div>
          <FadeIn>
            <Label
              className={`mb-3 ${dark ? "text-copper-light" : ""}`}
            >
              {eyebrow}
            </Label>
            <h2
              className={`font-display text-[clamp(28px,3.5vw,42px)] font-black leading-[0.97] tracking-[-0.03em] mb-4 ${
                dark ? "text-paper" : "text-ink"
              }`}
            >
              {title}
              <br />
              <em
                className={`italic font-normal ${
                  dark ? "text-paper/40" : "text-ink/40"
                }`}
              >
                {titleAccent}
              </em>
            </h2>
            <p
              className={`text-[15px] sm:text-[16px] leading-[1.75] mb-7 max-w-[440px] ${
                dark ? "text-paper/65" : "text-ink/70"
              }`}
            >
              {description}
            </p>
            <ButtonLink
              href={href}
              variant={dark ? "paper" : "ghost"}
            >
              <ButtonArrow>{ctaLabel}</ButtonArrow>
            </ButtonLink>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
