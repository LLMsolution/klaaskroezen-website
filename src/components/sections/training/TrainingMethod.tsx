import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";

interface TrainingMethodProps {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
}

export function TrainingMethod({
  eyebrow = "Zo werkt het",
  title = "Meer dan theorie.",
  titleAccent = "Je brengt het in de praktijk.",
  description = "Bij de training hoort een werkboek met opdrachten die naadloos aansluiten bij elke module. Geen losse theorie — je past het geleerde direct toe in je eigen werk en klantgesprekken.",
}: TrainingMethodProps) {
  return (
    <section className="py-16 sm:py-[110px] border-b border-rule">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-px bg-rule border border-rule max-w-[900px] mx-auto">
          <div className="bg-paper p-8 sm:p-12 flex flex-col justify-center">
            <FadeIn>
              <Label className="mb-3">{eyebrow}</Label>
              <h2 className="font-display text-[clamp(24px,3vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
                {title}
                <br />
                <em className="italic font-normal text-ink/40">
                  {titleAccent}
                </em>
              </h2>
              <p className="text-[15px] sm:text-[16px] text-ink/70 leading-[1.8] max-w-[420px]">
                {description}
              </p>
            </FadeIn>
          </div>
          <div className="bg-paper p-8 sm:p-12 flex flex-col justify-center gap-5">
            {[
              {
                title: "Werkboek met opdrachten",
                text: "Opdrachten die aansluiten bij elke module, zodat je het geleerde direct toepast.",
              },
              {
                title: "Geen filmpjes kijken",
                text: "Je oefent met je eigen situaties, klanten en gesprekken.",
              },
              {
                title: "Resultaat dat blijft",
                text: "Doordat je het in de praktijk brengt, beklijft het. Geen theorie die je na een week vergeet.",
              },
            ].map((item) => (
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
