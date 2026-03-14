import type { Metadata } from "next";
import { TrainingHero } from "@/components/sections/training/TrainingHero";
import { ContentBlock } from "@/components/sections/ContentBlock";
import { ForWhom } from "@/components/sections/training/ForWhom";
import { VideoGrid } from "@/components/sections/VideoGrid";
import { LogoBar } from "@/components/sections/LogoBar";
import { TrainingCta } from "@/components/sections/training/TrainingCta";
import { Faq } from "@/components/sections/Faq";
import { JsonLd, personJsonLd, speakerServiceJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Spreker — Klaas Kroezen",
  description:
    "Boek Klaas Kroezen als spreker. Inspirerende keynotes en workshops over sales, klantgerichtheid en commerciële groei — oprecht en ontspannen.",
};

export default function SprekerPage() {
  return (
    <>
      <JsonLd data={personJsonLd} />
      <JsonLd data={speakerServiceJsonLd} />
      <TrainingHero
        eyebrow="Spreker & Keynote"
        titleLine1="Inspireer"
        titleLine2="je team."
        description="Een inspiratiesessie waarin ik teams laat ervaren hoe je met minder spanning meer klanten verandert in fans. Geen theorie, maar energie en inzichten die blijven hangen."
        image="/images/spreker/klaas-hero.jpeg"
        imageAlt="Klaas Kroezen als spreker op het podium"
        imagePosition="center 25%"
        ctaLabel="Neem contact op"
        pricingAnchor="/contact"
        programAnchor="#videos"
        secondaryLabel="Bekijk fragmenten"
        glassItems={[
          {
            label: "Keynotes & workshops",
            text: "Van 30 minuten inspiratie tot een volledige dagvullende workshop. Op maat voor jouw event of teamdag.",
          },
          {
            label: "25+ jaar ervaring",
            text: "Internationaal B2B bij Google, Samsung, Microsoft, ING en Vodafone. Eigen bedrijf verkocht in 2022.",
          },
          {
            label: "Bewezen impact",
            text: "Teams gaan naar huis met energie, inzichten en een concrete aanpak die ze direct kunnen toepassen.",
          },
        ]}
      />

      <ForWhom
        audiences={[
          "Salesteams",
          "Kick-offs",
          "Teamdagen",
          "Conferenties",
          "Management events",
          "Klantevents",
        ]}
      />

      <ContentBlock
        eyebrow="Over de sessie"
        title="Sales gaat vaak mis door prestatiedruk."
        titleAccent="Het kan ook anders."
        image="/images/spreker/klaas-flipchart.jpeg"
        imageAlt="Klaas Kroezen geeft een workshop bij een flipchart"
        objectPosition="center top"
        imagePosition="right"
        paragraphs={[
          "Door targets, cijfers en verwachtingen wordt verkoop krampachtig. Mensen raken gespannen, twijfelen, verliezen zichzelf — en het resultaat gaat juist omlaag. Dat kost energie, frustraties, vertrouwen én geld.",
          "Met 25 jaar ervaring in sales en klantbeleving, van scale-up tot boardroom, help ik teams groeien vanuit oprechte verbinding. Niet vanuit trucjes.",
          "Ik stond zelf jarenlang aan de frontlinie als CEO en eigenaar van een internationaal marktonderzoeksbureau. Ik weet hoe het voelt als sales voelt als trekken aan een dood paard. En ik weet hoe het wél werkt.",
        ]}
      />

      <section className="py-16 sm:py-[110px] border-b border-rule">
        <div className="mx-auto max-w-[1180px] px-14 max-lg:px-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {[
              {
                icon: "✓",
                text: "Energie en inspiratie die je meeneemt in je werk",
              },
              {
                icon: "✓",
                text: "Heldere inzichten voor duurzame commerciële groei",
              },
              {
                icon: "✓",
                text: "Verhalen en oefeningen die mensen in beweging zetten",
              },
              {
                icon: "✓",
                text: "Geen trucs. Geen scripts. Oprecht en ontspannen sales.",
              },
            ].map((item) => (
              <div key={item.text} className="bg-paper p-6 sm:p-8">
                <span className="text-copper text-[18px] font-bold block mb-3">
                  {item.icon}
                </span>
                <p className="text-[14px] sm:text-[15px] text-ink/70 leading-[1.7]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VideoGrid
        eyebrow="Op het podium"
        title="Bekijk fragmenten."
        titleAccent="Oprecht en ontspannen in actie."
        videos={[
          {
            title: "Speech op de boekpresentatie",
            thumbnail: "/images/spreker/video-thumb-speech.jpg",
            embedUrl: "https://www.youtube.com/embed/F6io8l_VYww",
            duration: "3:35",
          },
          {
            title: "Sales- en klantgerichte mindset in je team",
            thumbnail: "/images/spreker/video-thumb-mindset.jpg",
            embedUrl: "https://www.youtube.com/embed/placeholder-mindset",
            duration: "1:46",
          },
        ]}
      />

      <LogoBar label="Gewerkt met onder andere" />

      {/* Coaching cards */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <div className="mx-auto max-w-[1180px] px-14 max-lg:px-7">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
              Coaching & Begeleiding
            </span>
            <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-black leading-[0.97] tracking-[-0.03em]">
              Persoonlijk of
              <br />
              <em className="italic font-normal text-ink/40">als team.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-rule border border-rule">
            {/* 1-op-1 Coaching */}
            <div className="bg-paper p-8 sm:p-12 flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
                Individueel
              </span>
              <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-[1.1] tracking-[-0.02em] mb-3">
                1-op-1 Coaching
              </h3>
              <p className="text-[15px] text-ink/70 leading-[1.75] mb-6 max-w-[400px]">
                Persoonlijke begeleiding voor sales professionals en leidinggevenden die willen groeien. Op jouw tempo, afgestemd op jouw uitdagingen.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Individueel traject op maat",
                  "Persoonlijke sparring & feedback",
                  "Focus op jouw specifieke uitdagingen",
                  "Flexibel in te plannen",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[14px] text-ink/65 leading-[1.6]"
                  >
                    <span className="text-copper text-[11px] mt-[3px] shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-rule flex items-center justify-between">
                <div>
                  <span className="font-display text-[20px] font-bold text-ink">
                    Op aanvraag
                  </span>
                </div>
                <a
                  href="/contact"
                  className="text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
                >
                  Neem contact op →
                </a>
              </div>
            </div>

            {/* Team Coaching */}
            <div className="bg-paper p-8 sm:p-12 flex flex-col">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
                Teams
              </span>
              <h3 className="font-display text-[22px] sm:text-[26px] font-bold leading-[1.1] tracking-[-0.02em] mb-3">
                Coaching voor Teams
              </h3>
              <p className="text-[15px] text-ink/70 leading-[1.75] mb-6 max-w-[400px]">
                Begeleid je team naar een gezamenlijke commerciële mindset. Van bewustwording tot implementatie — samen groeien in klantgerichtheid.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Gezamenlijke kick-off op locatie",
                  "Teamgerichte oefeningen & casussen",
                  "Begeleiding tijdens implementatie",
                  "Meetbare resultaten per deelnemer",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[14px] text-ink/65 leading-[1.6]"
                  >
                    <span className="text-copper text-[11px] mt-[3px] shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-rule flex items-center justify-between">
                <div>
                  <span className="font-display text-[20px] font-bold text-ink">
                    Op aanvraag
                  </span>
                </div>
                <a
                  href="/contact"
                  className="text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
                >
                  Plan een gesprek →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Faq
        title="Praktische info."
        titleAccent="Voor organisatoren."
        items={[
          {
            question: "Hoe lang duurt een keynote of workshop?",
            answer: "Een keynote duurt 30 tot 60 minuten. Een workshop kan een halve of hele dag beslaan. Alles is op maat samen te stellen, afhankelijk van je programma en doelstelling.",
          },
          {
            question: "Waar geeft Klaas zijn sessies?",
            answer: "Overal in Nederland en België, op jullie locatie. Internationaal is ook mogelijk — Klaas heeft ervaring in 21 landen en geeft sessies in het Nederlands en Engels.",
          },
          {
            question: "Wat kost een keynote of workshop?",
            answer: "De investering hangt af van de duur, locatie en het aantal deelnemers. Neem contact op voor een vrijblijvend voorstel op maat.",
          },
          {
            question: "Voor welk publiek is Klaas geschikt?",
            answer: "Salesteams, management, klantenservice, kick-offs, conferenties en klantevents. Van 10 tot 500 deelnemers. De boodschap is altijd: oprecht en ontspannen commercieel groeien.",
          },
          {
            question: "Kan de sessie gecombineerd worden met coaching?",
            answer: "Ja, een keynote of workshop kan uitgebreid worden met 1-op-1 coaching of teambegeleiding. Zo blijft de impact niet beperkt tot de dag zelf.",
          },
        ]}
      />

      <TrainingCta
        title="Boek Klaas."
        titleAccent="Voor jouw event."
        description="Een inspirerende sessie die teams in beweging zet. Neem contact op om de mogelijkheden te bespreken."
        href="/contact"
        ctaLabel="Neem contact op"
      />
    </>
  );
}
