import Image from "next/image";
import { Label } from "@/components/ui/Label";
import { ButtonLink, ButtonExternal, ButtonArrow } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

const stats = [
  { number: "25+", label: "Jaar ervaring" },
  { number: "21", label: "Landen" },
  { number: "9,1", label: "Beoordeling" },
  { number: "#1", label: "Managementboek" },
] as const;

export function AboutKlaas() {
  return (
    <section
      aria-labelledby="klaas-heading"
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] border-b border-rule"
    >
      <div className="relative overflow-hidden bg-warm lg:border-r lg:border-rule min-h-[300px] sm:min-h-[340px]">
        <Image
          src="/images/about/klaas-kroezen-portrait.jpeg"
          alt="Portretfoto van Klaas Kroezen, sales trainer en auteur"
          fill
          className="object-cover object-[center_top]"
          sizes="(max-width: 1024px) 100vw, 50vw"
          loading="lazy"
        />
      </div>
      <div className="py-12 sm:py-20 px-7 sm:px-[60px] flex flex-col justify-center">
        <FadeIn>
        <Label className="mb-3.5">De trainer</Label>
        <h2
          id="klaas-heading"
          className="font-display text-[clamp(26px,3.2vw,46px)] font-black leading-[0.97] tracking-[-0.03em] mb-1"
        >
          Klaas Kroezen.
          <em className="block italic font-normal text-ink/40 text-[0.82em]">
            Ondernemer. Trainer. Auteur.
          </em>
        </h2>
        <p className="text-[15px] sm:text-[16.5px] text-ink/80 leading-[1.85] mt-4 mb-5 max-w-[440px]">
          Met{" "}
          <strong className="font-semibold text-ink">
            25&nbsp;jaar internationale ervaring
          </strong>{" "}
          in sales en ondernemerschap realiseerde Klaas tientallen miljoenen
          euro&rsquo;s omzet&nbsp;&mdash; in 21&nbsp;landen, voor klanten als
          Google, Microsoft, ING en Samsung.
        </p>
        <p className="text-[15px] sm:text-[16.5px] text-ink/80 leading-[1.85] mb-6 max-w-[440px]">
          Na de verkoop van WUA richt hij zich volledig op het trainen van
          salesprofessionals én iedereen met klantcontact. Eén methode. Twee
          werelden. Eén resultaat: fans.
        </p>
        <div className="flex gap-2.5 flex-wrap mb-6">
          <ButtonExternal
            href="https://klaaskroezen.plugandpay.com/checkout/checkout-online-sales-training"
            variant="copper"
          >
            <ButtonArrow>Training kopen</ButtonArrow>
          </ButtonExternal>
          <ButtonLink href="/over-ons" variant="ghost">
            Meer over Klaas
          </ButtonLink>
        </div>
        <dl
          className="flex gap-6 sm:gap-7 flex-wrap pt-5 border-t border-rule"
          aria-label="Kerncijfers Klaas Kroezen"
        >
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[24px] sm:text-[28px] font-black tracking-[-0.025em] leading-none mb-[3px] tabular-nums">
                {s.number}
              </dd>
              <dt className="text-[10px] sm:text-[10.5px] font-medium tracking-[0.12em] uppercase text-ink/50">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
        </FadeIn>
      </div>
    </section>
  );
}
