import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";

type Feature = { title: string; text: string };

interface TrainingMethodProps {
  lang: Lang;
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
  features?: Feature[];
}

export function TrainingMethod({
  lang,
  eyebrow,
  title,
  titleAccent,
  description,
  features,
}: TrainingMethodProps) {
  const s = t(lang).training;
  const resolvedEyebrow = eyebrow ?? s.methodEyebrow;
  const resolvedTitle = title ?? s.methodTitle;
  const resolvedTitleAccent = titleAccent ?? s.methodAccent;
  const resolvedDescription = description ?? s.methodDesc;
  const resolvedFeatures: Feature[] =
    features && features.length > 0
      ? features
      : [
          { title: s.methodFeature1Title, text: s.methodFeature1Text },
          { title: s.methodFeature2Title, text: s.methodFeature2Text },
          { title: s.methodFeature3Title, text: s.methodFeature3Text },
        ];

  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-px bg-rule border border-rule max-w-[900px] mx-auto">
          <div className="bg-paper p-8 sm:p-12 flex flex-col justify-center">
            <FadeIn>
              <Label className="mb-3">{resolvedEyebrow}</Label>
              <h2 className="font-display text-[clamp(24px,3vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
                {resolvedTitle}
                <br />
                <em className="italic font-normal text-ink/40">
                  {resolvedTitleAccent}
                </em>
              </h2>
              <p className="text-[15px] sm:text-[16px] text-ink/70 leading-[1.8] max-w-[420px]">
                {resolvedDescription}
              </p>
            </FadeIn>
          </div>
          <div className="bg-paper p-8 sm:p-12 flex flex-col justify-center gap-5">
            {resolvedFeatures.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-copper text-[14px] mt-0.5 shrink-0">
                  &#10003;
                </span>
                <div>
                  <span className="block text-[14px] sm:text-[15px] font-semibold text-ink leading-[1.3] mb-0.5">
                    {item.title}
                  </span>
                  <span className="block text-[13px] sm:text-[14px] text-ink/55 leading-[1.6]">
                    {item.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
