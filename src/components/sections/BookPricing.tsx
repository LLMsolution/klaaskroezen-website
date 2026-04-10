import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { ButtonLink, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";

type FormatItem = {
  title: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  href: string;
  cta: string;
  featured?: boolean | string;
};

type BookPricingContent = {
  label?: string;
  heading?: string;
  formats?: FormatItem[];
};

export function BookPricing({ lang, content }: { lang: Lang; content?: BookPricingContent }) {
  const s = t(lang).bookPricing;

  // Use DB content if available, otherwise fall back to i18n
  const label = content?.label || s.label;
  const heading = content?.heading || s.heading;

  const defaultFormats: FormatItem[] = [
    {
      title: "E-book",
      price: "€ 22,50",
      priceNote: s.ebookNote,
      description: s.ebookDesc,
      features: [s.ebookFeature1, s.ebookFeature2],
      href: "/checkout/boek-ebook",
      cta: s.ebookCta,
    },
    {
      title: "Hard Copy",
      price: "€ 32,50",
      priceNote: s.hardcopyNote,
      description: s.hardcopyDesc,
      features: [s.hardcopyFeature1, s.hardcopyFeature2, s.hardcopyFeature3],
      href: "/checkout/boek-hardcopy",
      cta: s.hardcopyCta,
      featured: true,
    },
    {
      title: { nl: "Luisterboek", en: "Audiobook", de: "Hörbuch" }[lang],
      price: "€ 22,50",
      priceNote: s.audiobookNote,
      description: s.audiobookDesc,
      features: [s.audiobookFeature1, s.audiobookFeature2, s.audiobookFeature3],
      href: "/checkout/boek-luisterboek",
      cta: s.audiobookCta,
    },
  ];

  const formats = content?.formats?.length ? content.formats : defaultFormats;

  return (
    <section
      id="bestellen"
      className="py-16 sm:py-[110px] bg-warm border-b border-rule"
    >
      <Container>
        <FadeIn className="text-center mb-10 sm:mb-14">
          <Label className="mb-3">{label}</Label>
          <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
            {heading}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule border border-rule max-w-[960px] mx-auto">
          {formats.map((f) => {
            const isFeatured = f.featured === true || f.featured === "true";
            return (
              <div
                key={f.title}
                className={`flex flex-col p-7 sm:p-9 ${isFeatured ? "bg-ink" : "bg-paper"}`}
              >
                <h3
                  className={`font-display text-[18px] sm:text-[20px] font-black leading-[1.1] tracking-[-0.01em] mb-2 ${isFeatured ? "text-paper" : "text-ink"}`}
                >
                  {f.title}
                </h3>
                <div className="mb-1">
                  <span
                    className={`font-display text-[34px] sm:text-[40px] font-black leading-none tracking-[-0.02em] ${isFeatured ? "text-paper" : "text-ink"}`}
                  >
                    {f.price}
                  </span>
                </div>
                {f.priceNote && (
                  <span
                    className={`text-[12px] mb-5 ${isFeatured ? "text-paper/40" : "text-ink/40"}`}
                  >
                    {f.priceNote}
                  </span>
                )}
                <p
                  className={`text-[14px] sm:text-[15px] leading-[1.65] mb-6 ${isFeatured ? "text-paper/65" : "text-ink/65"}`}
                >
                  {f.description}
                </p>
                <ul className="flex-1 mb-8 space-y-3">
                  {(f.features ?? []).map((feat) => (
                    <li
                      key={typeof feat === "string" ? feat : JSON.stringify(feat)}
                      className={`flex items-start gap-2.5 text-[13px] sm:text-[14px] leading-[1.5] ${isFeatured ? "text-paper/70" : "text-ink/70"}`}
                    >
                      <span
                        className={`shrink-0 mt-0.5 ${isFeatured ? "text-copper-light" : "text-copper"}`}
                      >
                        &#10003;
                      </span>
                      {typeof feat === "string" ? feat : (feat as { value?: string }).value ?? ""}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <ButtonLink
                    href={f.href}
                    variant={isFeatured ? "copper" : "ghost"}
                    size="large"
                  >
                    <ButtonArrow>{f.cta}</ButtonArrow>
                  </ButtonLink>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
