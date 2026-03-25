import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/Label";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { t, type Lang } from "@/lib/i18n";
import { loadSiteImages, imgUrl } from "@/lib/site-images";

interface Training {
  href: string;
  featured: boolean;
  image: string;
  imageAlt: string;
  tag: string;
  title: string;
  who: string;
  description: React.ReactNode;
  points: string[];
}

export async function TrainingCards({ lang }: { lang: Lang }) {
  const s = t(lang).trainingCards;

  const images = await loadSiteImages([
    "hero/sales-excellence-group.jpeg",
    "hero/customer-success-group.jpg",
  ]);

  const trainings: Training[] = [
    {
      href: "/sales-excellence-training",
      featured: true,
      image: imgUrl(images, "hero/sales-excellence-group.jpeg"),
      imageAlt: s.setImageAlt,
      tag: s.setTag,
      title: s.setTitle,
      who: s.setWho,
      description: (
        <>
          {s.setDesc1}{" "}
          <strong className="font-semibold text-ink">
            {s.setDescHighlight}
          </strong>{" "}
          {s.setDesc2}
        </>
      ),
      points: [s.setPoint1, s.setPoint2, s.setPoint3],
    },
    {
      href: "/customer-success-training",
      featured: false,
      image: imgUrl(images, "hero/customer-success-group.jpg"),
      imageAlt: s.cstImageAlt,
      tag: s.cstTag,
      title: s.cstTitle,
      who: s.cstWho,
      description: (
        <>
          {s.cstDesc1}{" "}
          <strong className="font-semibold text-ink">
            {s.cstDescHighlight}
          </strong>{" "}
          {s.cstDesc2}
        </>
      ),
      points: [s.cstPoint1, s.cstPoint2, s.cstPoint3],
    },
  ];

  return (
    <section
      aria-labelledby="trainingen-heading"
      className="py-16 sm:py-[110px] border-b border-rule"
    >
      <Container>
        <FadeIn className="mb-10 sm:mb-[60px]">
          <Label className="mb-3">{s.label}</Label>
          <h2
            id="trainingen-heading"
            className="font-display text-[clamp(32px,4.2vw,58px)] font-black leading-[0.97] tracking-[-0.03em]"
          >
            {s.heading1}
            <br />
            <em className="italic font-normal text-ink/40">
              {s.heading2}
            </em>
          </h2>
          <p className="text-[16px] sm:text-[17px] text-ink/80 max-w-[500px] mt-5 leading-[1.8]">
            <strong className="font-semibold text-ink">{s.intro}</strong>{" "}
            {s.introEnd}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {trainings.map((tr) => (
            <Link
              key={tr.href}
              href={tr.href}
              className="group bg-paper flex flex-col hover:bg-warm transition-colors duration-200 relative outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper border border-rule"
            >
              <div className="w-full aspect-video overflow-hidden bg-warm border-b border-rule shrink-0">
                <Image
                  src={tr.image}
                  alt={tr.imageAlt}
                  width={590}
                  height={332}
                  className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div className="p-6 sm:p-9 flex-1 flex flex-col">
                <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-copper mb-2.5">
                  {tr.tag}
                </span>
                <h3 className="font-display text-[22px] sm:text-[26px] font-black leading-[1.05] tracking-[-0.02em] mb-3">
                  {tr.title}
                </h3>
                <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium tracking-[0.1em] uppercase text-ink/50 mb-4 py-[7px] px-3 border border-rule w-fit">
                  {s.forWhoLabel}{" "}
                  <span className="text-ink">{tr.who}</span>
                </div>
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8] flex-1 mb-6">
                  {tr.description}
                </p>
                <ul className="list-none mb-7" aria-label={`Voordelen ${tr.title}`}>
                  {tr.points.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2.5 py-2.5 sm:py-[10px] border-b border-ink/[0.07] text-[14px] sm:text-[15px] text-ink/70"
                    >
                      <span className="text-copper shrink-0" aria-hidden="true">
                        &mdash;
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <span
                    className={`inline-flex items-center justify-center gap-[7px] font-body text-[12px] font-medium tracking-[0.09em] uppercase rounded-[2px] border transition-all duration-200 whitespace-nowrap px-5 py-3 ${
                      tr.featured
                        ? "bg-ink text-paper border-ink group-hover:bg-copper group-hover:border-copper"
                        : "bg-transparent text-ink border-rule group-hover:border-ink/35"
                    }`}
                  >
                    {s.viewTraining} <ArrowIcon />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8 sm:mt-10 text-[13px] sm:text-[14px] text-ink/60">
          {[s.trust1, s.trust2, s.trust3].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="text-copper" aria-hidden="true">&#10003;</span>
              {item}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
