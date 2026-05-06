import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { ContactForm } from "@/components/sections/ContactForm";
import { JsonLd, contactPageJsonLd } from "@/components/seo/JsonLd";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { loadSiteImages, imgUrl } from "@/lib/site-images";
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const s = t(lang).contact;
  return await loadPageMeta("contact", lang, {
    title: s.label,
    description: s.intro,
  });
}

export default async function ContactPage() {
  const lang = await getLocale();
  const s = t(lang).contact;
  const img = await loadSiteImages([
    "about/klaas-kroezen-portrait-2.jpeg",
  ]);
  const db = await loadPageContent("contact", lang);
  const hero = sectionOr(db, "hero", { image: "", imageAlt: s.imageAlt }) as { image?: string; imageAlt?: string };
  const info = sectionOr<{
    emailLabel?: string;
    email?: string;
    phoneLabel?: string;
    phone?: string;
    phoneHref?: string;
    officeLabel?: string;
    officeName?: string;
    officeAddress1?: string;
    officeAddress2?: string;
    directContactLabel?: string;
    planCallLabel?: string;
    planCallUrl?: string;
    linkedinUrl?: string;
  }>(db, "contact-info", {});

  const emailLabel = info.emailLabel ?? s.emailLabel;
  const email = info.email ?? "klaas@klaaskroezen.com";
  const phoneLabel = info.phoneLabel ?? s.phoneLabel;
  const phone = info.phone ?? "+31 6 1809 8906";
  const phoneHref = info.phoneHref ?? "+31618098906";
  const officeLabel = info.officeLabel ?? s.officeLabel;
  const officeName = info.officeName ?? s.officeName;
  const officeAddress1 = info.officeAddress1 ?? s.officeAddress1;
  const officeAddress2 = info.officeAddress2 ?? s.officeAddress2;
  const directContactLabel = info.directContactLabel ?? s.directContact;
  const planCallLabel = info.planCallLabel ?? s.planCall;
  const planCallUrl = info.planCallUrl ?? "https://calendly.com/klaaskroezen";
  const linkedinUrl = info.linkedinUrl ?? "https://www.linkedin.com/in/klaaskroezen/";

  return (
    <>
      <JsonLd data={contactPageJsonLd} />
      {/* Hero — photo + heading */}
      <section className="border-b border-rule">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-[16/9] overflow-hidden bg-warm">
            <Image
              src={hero.image || imgUrl(img, "about/klaas-kroezen-portrait-2.jpeg")}
              alt={hero.imageAlt || s.imageAlt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center py-12 sm:py-16 lg:py-20 px-7 sm:px-10 lg:px-16">
            <FadeIn>
              <Label className="mb-3">{s.label}</Label>
              <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
                {s.heading1}
                <br />
                <em className="italic font-normal text-ink/40">
                  {s.heading2}
                </em>
              </h1>
              <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8] max-w-[440px]">
                {s.intro}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Form + contact info */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-14 lg:gap-20">
            {/* Form */}
            <ContactForm lang={lang} />

            {/* Sidebar — contact details */}
            <FadeIn className="lg:pt-2">
              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-2">
                    {emailLabel}
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="text-[15px] text-ink/80 hover:text-ink transition-colors"
                  >
                    {email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-2">
                    {phoneLabel}
                  </span>
                  <a
                    href={`tel:${phoneHref}`}
                    className="text-[15px] text-ink/80 hover:text-ink transition-colors"
                  >
                    {phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-2">
                    {officeLabel}
                  </span>
                  <p className="text-[15px] text-ink/80 leading-[1.7]">
                    {officeName}
                    <br />
                    {officeAddress1}
                    <br />
                    {officeAddress2}
                  </p>
                </div>

                <div className="pt-4 border-t border-rule">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
                    {directContactLabel}
                  </span>
                  <div className="space-y-2.5">
                    <a
                      href={planCallUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-[14px] text-ink/65 hover:text-ink transition-colors"
                    >
                      <span className="text-copper text-[11px]">→</span>
                      {planCallLabel}
                    </a>
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-[14px] text-ink/65 hover:text-ink transition-colors"
                    >
                      <span className="text-copper text-[11px]">→</span>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
