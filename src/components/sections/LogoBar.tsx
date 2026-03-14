import Image from "next/image";

const logos = [
  { src: "/images/logos/visma.png", alt: "Visma", w: 80, h: 26 },
  { src: "/images/logos/heigo.png", alt: "Heigo", w: 80, h: 26 },
  { src: "/images/logos/leadinfo.png", alt: "Leadinfo", w: 90, h: 26 },
  { src: "/images/logos/gp-products.png", alt: "GP Products", w: 90, h: 26 },
  { src: "/images/logos/gradient.png", alt: "Gradient", w: 80, h: 26 },
  { src: "/images/logos/vasco.png", alt: "Vasco", w: 80, h: 26 },
  { src: "/images/logos/edison.png", alt: "Edison", w: 80, h: 26 },
  { src: "/images/logos/mt-sprout.png", alt: "MT Sprout", w: 100, h: 26 },
  { src: "/images/logos/mom-in-balance.png", alt: "Mom in Balance", w: 100, h: 26 },
  { src: "/images/logos/zigt.webp", alt: "Zigt", w: 66, h: 26 },
] as const;

interface LogoBarProps {
  label?: string;
}

export function LogoBar({ label = "Trainingen verzorgd voor" }: LogoBarProps) {
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
              className="h-[22px] sm:h-[26px] w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-200"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
