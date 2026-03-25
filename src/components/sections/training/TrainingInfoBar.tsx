import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { loadSiteImages } from "@/lib/site-images";

const LOGO_KEYS = [
  "logos/visma.png",
  "logos/heigo.png",
  "logos/leadinfo.png",
  "logos/gp-products.png",
  "logos/gradient.png",
  "logos/vasco.png",
  "logos/edison.png",
  "logos/mt-sprout.png",
  "logos/mom-in-balance.png",
  "logos/zigt.webp",
] as const;

const logoData = [
  { key: LOGO_KEYS[0], alt: "Visma", w: 80, h: 26 },
  { key: LOGO_KEYS[1], alt: "Heigo", w: 80, h: 26 },
  { key: LOGO_KEYS[2], alt: "Leadinfo", w: 90, h: 26 },
  { key: LOGO_KEYS[3], alt: "GP Products", w: 90, h: 26 },
  { key: LOGO_KEYS[4], alt: "Gradient", w: 80, h: 26 },
  { key: LOGO_KEYS[5], alt: "Vasco", w: 80, h: 26 },
  { key: LOGO_KEYS[6], alt: "Edison", w: 80, h: 26 },
  { key: LOGO_KEYS[7], alt: "MT Sprout", w: 100, h: 26 },
  { key: LOGO_KEYS[8], alt: "Mom in Balance", w: 100, h: 26 },
  { key: LOGO_KEYS[9], alt: "Zigt", w: 66, h: 26 },
] as const;

interface TrainingInfoBarProps {
  audiences: string[];
}

export async function TrainingInfoBar({ audiences }: TrainingInfoBarProps) {
  const img = await loadSiteImages([...LOGO_KEYS]);
  const logos = logoData.map((l) => ({ ...l, src: img[l.key].url }));
  return (
    <section
      aria-label="Klanten en doelgroep"
      className="bg-ink border-b border-paper/[0.07]"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-paper/[0.07]">
          {/* Logo's */}
          <div className="py-8 sm:py-10 pr-0 lg:pr-10">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-paper/35 block mb-4">
              Trainingen verzorgd voor
            </span>
            <div className="flex gap-6 sm:gap-8 items-center flex-wrap">
              {logos.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.w}
                  height={logo.h}
                  unoptimized
                  className="h-[20px] sm:h-[22px] w-auto object-contain brightness-0 invert opacity-40"
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          {/* Voor wie */}
          <div className="py-8 sm:py-10 pl-0 lg:pl-10">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-4">
              Voor wie
            </span>
            <div className="flex flex-wrap gap-2">
              {audiences.map((audience) => (
                <span
                  key={audience}
                  className="text-[13px] font-medium text-paper px-3.5 py-1.5 border border-paper/15 rounded-[2px]"
                >
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
