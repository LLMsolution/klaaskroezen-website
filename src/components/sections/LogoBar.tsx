import Image from "next/image";
import { loadSiteImages, imgUrl } from "@/lib/site-images";

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

interface LogoBarProps {
  label?: string;
}

export async function LogoBar({ label = "Trainingen verzorgd voor" }: LogoBarProps) {
  const img = await loadSiteImages([...LOGO_KEYS]);
  const logos = logoData.map((l) => ({ ...l, src: imgUrl(img, l.key) }));
  return (
    <section
      aria-label="Klanten"
      className="bg-warm border-b border-rule py-7 sm:py-9 px-7 sm:px-14"
    >
      <div className="max-w-[1180px] mx-auto flex flex-col items-center gap-5">
        <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-ink/40">
          {label}
        </span>
        <div className="flex gap-8 sm:gap-12 items-center justify-center flex-wrap">
          {logos.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={logo.w}
              height={logo.h}
              unoptimized
              className="h-[22px] sm:h-[26px] w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-200"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
