import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";

interface PainPointsProps {
  lang: Lang;
  eyebrow?: string;
  title: string;
  titleAccent: string;
  points: string[];
}

export function PainPoints({
  lang,
  eyebrow = t(lang).training.painEyebrow,
  title,
  titleAccent,
  points,
}: PainPointsProps) {
  return (
    <section className="py-16 sm:py-[100px] border-b border-rule">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <FadeIn>
            <Label className="mb-3">{eyebrow}</Label>
            <h2 className="font-display text-[clamp(30px,3.8vw,48px)] font-black leading-[0.97] tracking-[-0.03em]">
              {title}
              <br />
              <em className="italic font-normal text-ink/40">
                {titleAccent}
              </em>
            </h2>
          </FadeIn>

          <ul className="list-none">
            {points.map((point) => (
              <li
                key={point}
                className="flex gap-4 py-4 sm:py-[18px] border-b border-rule text-[15px] sm:text-[16px] text-ink/75 leading-[1.6]"
              >
                <span
                  className="text-copper shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  &mdash;
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
