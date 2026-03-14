import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/Label";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

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

const trainings: Training[] = [
  {
    href: "/sales-excellence-training",
    featured: true,
    image: "/images/hero/sales-excellence-group.jpeg",
    imageAlt: "Deelnemers van de Sales Excellence Training met certificaten",
    tag: "Voor verkopers",
    title: "Sales Excellence Training",
    who: "accountmanagers, ondernemers, salesteams",
    description: (
      <>
        Meer omzet met minder druk. Je leert hoe je met{" "}
        <strong className="font-semibold text-ink">
          oprechtheid en ontspanning
        </strong>{" "}
        structureel beter verkoopt&nbsp;&mdash; van eerste gesprek tot deal. Niet
        met trucjes, maar met een aanpak die bij jou past.
      </>
    ),
    points: [
      "Meer omzet, minder weerstand",
      "Klanten die jou aanbevelen",
      "Zelfvertrouwen in elk verkoopgesprek",
    ],
  },
  {
    href: "/customer-success-training",
    featured: false,
    image: "/images/hero/customer-success-group.jpg",
    imageAlt: "Deelnemers van de Customer Success Training",
    tag: "Voor klantcontact",
    title: "Customer Success Training",
    who: "CS, support, accountteams, service",
    description: (
      <>
        Maak van klanten fans. Je hebt geen salesfunctie&nbsp;&mdash; maar jij
        bepaalt wél of een klant blijft, groeit en anderen aanbeveelt.{" "}
        <strong className="font-semibold text-ink">
          Dat is commercieel goud.
        </strong>{" "}
        Deze training leert je hoe je dat bewust en ontspannen doet.
      </>
    ),
    points: [
      "Hogere klanttevredenheid en retentie",
      "Klanten die ambassadeurs worden",
      "Meer plezier in klantcontact",
    ],
  },
];

export function TrainingCards() {
  return (
    <section
      aria-labelledby="trainingen-heading"
      className="py-16 sm:py-[110px] border-b border-rule"
    >
      <Container>
        <FadeIn className="mb-10 sm:mb-[60px]">
          <Label className="mb-3">Het aanbod</Label>
          <h2
            id="trainingen-heading"
            className="font-display text-[clamp(32px,4.2vw,58px)] font-black leading-[0.97] tracking-[-0.03em]"
          >
            Eén methode.
            <br />
            <em className="italic font-normal text-ink/40">
              Twee doelgroepen.
            </em>
          </h2>
          <p className="text-[16px] sm:text-[17px] text-ink/80 max-w-[500px] mt-5 leading-[1.8]">
            <strong className="font-semibold text-ink">Dezelfde filosofie</strong>{" "}
            &mdash; oprecht en ontspannen &mdash; voor twee werelden die allebei
            essentieel zijn voor het succes van je organisatie.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {trainings.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group bg-paper flex flex-col hover:bg-warm transition-colors duration-200 relative outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper border border-rule"
            >
              <div className="w-full aspect-video overflow-hidden bg-warm border-b border-rule shrink-0">
                <Image
                  src={t.image}
                  alt={t.imageAlt}
                  width={590}
                  height={332}
                  className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div className="p-6 sm:p-9 flex-1 flex flex-col">
                <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-copper mb-2.5">
                  {t.tag}
                </span>
                <h3 className="font-display text-[22px] sm:text-[26px] font-black leading-[1.05] tracking-[-0.02em] mb-3">
                  {t.title}
                </h3>
                <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium tracking-[0.1em] uppercase text-ink/50 mb-4 py-[7px] px-3 border border-rule w-fit">
                  Voor wie:{" "}
                  <span className="text-ink">{t.who}</span>
                </div>
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8] flex-1 mb-6">
                  {t.description}
                </p>
                <ul className="list-none mb-7" aria-label={`Voordelen ${t.title}`}>
                  {t.points.map((p) => (
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
                      t.featured
                        ? "bg-ink text-paper border-ink group-hover:bg-copper group-hover:border-copper"
                        : "bg-transparent text-ink border-rule group-hover:border-ink/35"
                    }`}
                  >
                    Bekijk training <ArrowIcon />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8 sm:mt-10 text-[13px] sm:text-[14px] text-ink/60">
          {[
            "Direct online toegang",
            "10% resultaat of geld terug",
            "25+ jaar ervaring",
          ].map((item) => (
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
