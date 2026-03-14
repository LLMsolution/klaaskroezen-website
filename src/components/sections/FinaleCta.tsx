import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

export function FinaleCta() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="py-20 sm:py-[130px] px-7 sm:px-14 bg-ink text-center relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(181,98,42,0.11),transparent_65%)]"
        aria-hidden="true"
      />
      <FadeIn className="relative max-w-[640px] mx-auto">
        <p className="font-body text-[11px] font-medium tracking-[0.22em] uppercase text-paper/50 mb-6 sm:mb-[26px]">
          Klaar om te beginnen?
        </p>
        <h2
          id="cta-heading"
          className="font-display text-[clamp(38px,6.5vw,90px)] font-black leading-[0.94] tracking-[-0.035em] text-paper mb-1"
        >
          Start vandaag.
        </h2>
        <span className="font-display italic font-normal text-[clamp(32px,5.5vw,76px)] tracking-[-0.03em] text-copper block mb-2">
          Oprecht &amp;&nbsp;Ontspannen.
        </span>
        <p className="text-[16px] sm:text-[17px] text-paper/70 leading-[1.8] mt-6 mb-8 sm:mb-9">
          Eén methode, twee doelgroepen. Kies de training die bij jouw rol past.
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <ButtonLink href="/sales-excellence-training" variant="copper">
            <ButtonArrow>Sales Excellence Training</ButtonArrow>
          </ButtonLink>
          <ButtonLink href="/customer-success-training" variant="paper">
            Customer Success Training
          </ButtonLink>
        </div>
        <ul
          className="flex items-center justify-center gap-4 sm:gap-[18px] flex-wrap mt-5 list-none"
          aria-label="Garanties"
        >
          {[
            "Direct online toegang",
            "10% resultaat of geld terug",
            "25+ jaar ervaring",
          ].map((text) => (
            <li
              key={text}
              className="flex items-center gap-[6px] text-[12px] sm:text-[13px] text-paper/55"
            >
              <span className="text-copper/80 text-[11px]" aria-hidden="true">
                ✓
              </span>
              {text}
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  );
}
