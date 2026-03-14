import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { FadeIn } from "@/components/ui/FadeIn";
import { ContactForm } from "@/components/sections/ContactForm";
import { JsonLd, contactPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Neem contact op met Klaas Kroezen. Voor vragen over trainingen, sprekersopdrachten of samenwerking.",
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactPageJsonLd} />
      {/* Hero — photo + heading */}
      <section className="border-b border-rule">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px] overflow-hidden bg-warm">
            <Image
              src="/images/about/klaas-kroezen-portrait-2.jpeg"
              alt="Klaas Kroezen"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center py-12 sm:py-16 lg:py-20 px-7 sm:px-10 lg:px-16">
            <FadeIn>
              <Label className="mb-3">Contact</Label>
              <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
                Laten we
                <br />
                <em className="italic font-normal text-ink/40">
                  kennismaken.
                </em>
              </h1>
              <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8] max-w-[440px]">
                Benieuwd wat we voor jou of je team kunnen betekenen? Vul het
                formulier in en we reageren binnen één werkdag.
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
            <ContactForm />

            {/* Sidebar — contact details */}
            <FadeIn className="lg:pt-2">
              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-2">
                    E-mail
                  </span>
                  <a
                    href="mailto:info@klaaskroezen.com"
                    className="text-[15px] text-ink/80 hover:text-ink transition-colors"
                  >
                    info@klaaskroezen.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-2">
                    Telefoon
                  </span>
                  <a
                    href="tel:+31618098906"
                    className="text-[15px] text-ink/80 hover:text-ink transition-colors"
                  >
                    +31 6 1809 8906
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-2">
                    Kantoor
                  </span>
                  <p className="text-[15px] text-ink/80 leading-[1.7]">
                    Het Oude Administratiegebouw
                    <br />
                    Oude Parklaan 111, Kamer 0.11
                    <br />
                    Castricum
                  </p>
                </div>

                <div className="pt-4 border-t border-rule">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
                    Direct contact
                  </span>
                  <div className="space-y-2.5">
                    <a
                      href="https://calendly.com/klaaskroezen"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-[14px] text-ink/65 hover:text-ink transition-colors"
                    >
                      <span className="text-copper text-[11px]">→</span>
                      Plan een videogesprek
                    </a>
                    <a
                      href="https://www.linkedin.com/in/klaaskroezen/"
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
