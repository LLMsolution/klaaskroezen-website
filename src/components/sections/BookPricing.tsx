import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { ButtonExternal, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

const formats = [
  {
    title: "E-book",
    price: "€ 22,50",
    priceNote: "Direct toegang",
    description: "Direct lezen op je computer, tablet of telefoon.",
    features: ["Begin vandaag nog", "Direct toegang na betaling"],
    href: "https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales",
    cta: "Bestel e-book",
  },
  {
    title: "Hard Copy",
    price: "€ 32,50",
    priceNote: "Incl. BTW · gratis verzending",
    description:
      "Het fysieke boek, thuis binnen één werkdag. De meest gekozen optie.",
    features: [
      "Levering binnen één werkdag",
      "Gratis verzending",
      "Inclusief BTW",
    ],
    href: "https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales",
    cta: "Bestel boek",
    featured: true,
  },
  {
    title: "Luisterboek",
    price: "€ 22,50",
    priceNote: "Voorgelezen door Klaas",
    description: "Luister onderweg, tijdens het sporten of thuis op de bank.",
    features: [
      "Direct luisteren",
      "Voorgelezen door de auteur",
      "Ideaal voor onderweg",
    ],
    href: "https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales",
    cta: "Bestel luisterboek",
  },
];

export function BookPricing() {
  return (
    <section
      id="bestellen"
      className="py-16 sm:py-[110px] bg-warm border-b border-rule"
    >
      <Container>
        <FadeIn className="text-center mb-10 sm:mb-14">
          <Label className="mb-3">Bestellen</Label>
          <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
            Kies jouw formaat.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule border border-rule max-w-[960px] mx-auto">
          {formats.map((f) => (
            <div
              key={f.title}
              className={`flex flex-col p-7 sm:p-9 ${f.featured ? "bg-ink" : "bg-paper"}`}
            >
              <h3
                className={`font-display text-[18px] sm:text-[20px] font-black leading-[1.1] tracking-[-0.01em] mb-2 ${f.featured ? "text-paper" : "text-ink"}`}
              >
                {f.title}
              </h3>
              <div className="mb-1">
                <span
                  className={`font-display text-[34px] sm:text-[40px] font-black leading-none tracking-[-0.02em] ${f.featured ? "text-paper" : "text-ink"}`}
                >
                  {f.price}
                </span>
              </div>
              {f.priceNote && (
                <span
                  className={`text-[12px] mb-5 ${f.featured ? "text-paper/40" : "text-ink/40"}`}
                >
                  {f.priceNote}
                </span>
              )}
              <p
                className={`text-[14px] sm:text-[15px] leading-[1.65] mb-6 ${f.featured ? "text-paper/65" : "text-ink/65"}`}
              >
                {f.description}
              </p>
              <ul className="flex-1 mb-8 space-y-3">
                {f.features.map((feat) => (
                  <li
                    key={feat}
                    className={`flex items-start gap-2.5 text-[13px] sm:text-[14px] leading-[1.5] ${f.featured ? "text-paper/70" : "text-ink/70"}`}
                  >
                    <span
                      className={`shrink-0 mt-0.5 ${f.featured ? "text-copper-light" : "text-copper"}`}
                    >
                      &#10003;
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <ButtonExternal
                  href={f.href}
                  variant={f.featured ? "copper" : "ghost"}
                  size="large"
                >
                  <ButtonArrow>{f.cta}</ButtonArrow>
                </ButtonExternal>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
