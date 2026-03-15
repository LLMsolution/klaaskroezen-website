import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";

interface ForWhomProps {
  lang: Lang;
  audiences: string[];
}

export function ForWhom({ lang, audiences }: ForWhomProps) {
  return (
    <section className="bg-ink py-10 sm:py-12 border-b border-paper/[0.07]">
      <Container>
        <FadeIn className="flex flex-col items-center gap-4">
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-copper">
            {t(lang).training.forWhomLabel}
          </span>
          <div className="flex flex-wrap justify-center gap-2.5">
            {audiences.map((audience) => (
              <span
                key={audience}
                className="text-[13px] sm:text-[14px] font-medium text-paper px-4 py-2 border border-paper/20 rounded-[2px]"
              >
                {audience}
              </span>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
