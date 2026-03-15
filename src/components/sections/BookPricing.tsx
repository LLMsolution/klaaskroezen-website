import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { ButtonExternal, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";

export function BookPricing({ lang }: { lang: Lang }) {
  const s = t(lang).bookPricing;

  const formats = [
    {
      title: "E-book",
      price: "€ 22,50",
      priceNote: s.ebookNote,
      description: s.ebookDesc,
      features: [s.ebookFeature1, s.ebookFeature2],
      href: "https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales-1762786340",
      cta: s.ebookCta,
    },
    {
      title: "Hard Copy",
      price: "€ 32,50",
      priceNote: s.hardcopyNote,
      description: s.hardcopyDesc,
      features: [s.hardcopyFeature1, s.hardcopyFeature2, s.hardcopyFeature3],
      href: "https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales",
      cta: s.hardcopyCta,
      featured: true,
    },
    {
      title: lang === "nl" ? "Luisterboek" : "Audiobook",
      price: "€ 22,50",
      priceNote: s.audiobookNote,
      description: s.audiobookDesc,
      features: [s.audiobookFeature1, s.audiobookFeature2, s.audiobookFeature3],
      href: "https://klaaskroezen.plugandpay.com/checkout/oprecht-en-ontspannen-sales-luisterboek",
      cta: s.audiobookCta,
    },
  ];

  return (
    <section
      id="bestellen"
      className="py-16 sm:py-[110px] bg-warm border-b border-rule"
    >
      <Container>
        <FadeIn className="text-center mb-10 sm:mb-14">
          <Label className="mb-3">{s.label}</Label>
          <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
            {s.heading}
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
