import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import {
  ButtonLink,
  ButtonArrow,
} from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

interface Module {
  number: string;
  title: string;
  description: string;
}

interface ProgramSectionProps {
  modules: Module[];
  price: string;
  pricingAnchor?: string;
  ctaLabel?: string;
}

export function ProgramSection({
  modules,
  price,
  pricingAnchor = "#pricing",
  ctaLabel = "Direct starten",
}: ProgramSectionProps) {
  return (
    <section
      id="programma"
      aria-labelledby="programma-heading"
      className="py-16 sm:py-[110px] border-b border-rule"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-16">
          {/* Modules */}
          <div>
            <FadeIn className="mb-10 sm:mb-14">
              <Label className="mb-3">Het programma</Label>
              <h2
                id="programma-heading"
                className="font-display text-[clamp(30px,3.8vw,48px)] font-black leading-[0.97] tracking-[-0.03em]"
              >
                Zes modules.
                <br />
                <em className="italic font-normal text-ink/40">
                  Eén transformatie.
                </em>
              </h2>
            </FadeIn>

            <div className="space-y-0">
              {modules.map((mod) => (
                <div
                  key={mod.number}
                  className="py-6 sm:py-8 border-b border-rule"
                >
                  <div className="flex items-baseline gap-4 sm:gap-6 mb-2">
                    <span className="font-display text-[32px] sm:text-[38px] font-black text-copper/30 leading-none tabular-nums">
                      {mod.number}
                    </span>
                    <h3 className="font-display text-[18px] sm:text-[20px] font-black leading-[1.15] tracking-[-0.01em]">
                      {mod.title}
                    </h3>
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-ink/65 leading-[1.7] pl-[52px] sm:pl-[62px]">
                    {mod.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-warm border border-rule rounded-[3px] p-7">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
                Vanaf
              </span>
              <div className="font-display text-[36px] font-black leading-none tracking-[-0.02em] mb-1">
                {price}
              </div>
              <p className="text-[13px] text-ink/50 mb-6">
                Excl. BTW &middot; Incl. bestseller boek
              </p>
              <ButtonLink
                href={pricingAnchor}
                variant="copper"
                size="large"
              >
                <ButtonArrow>{ctaLabel}</ButtonArrow>
              </ButtonLink>
              <ul className="mt-6 space-y-2.5">
                {[
                  "6 modules online training",
                  "Werkboek & templates",
                  "1 jaar toegang",
                  "Certificaat na afronding",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[13px] text-ink/60"
                  >
                    <span className="text-copper mt-0.5 shrink-0">
                      &#10003;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
