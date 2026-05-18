import type { Metadata } from "next";
import { UpsellClient } from "@/components/checkout/UpsellClient";
import { PostPurchaseFlow } from "@/components/checkout/PostPurchaseFlow";
import type { Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Bedankt voor je bestelling",
  robots: { index: false, follow: false },
};

const STEPS: Record<Lang, string[]> = {
  nl: [
    "Je aankoop staat klaar in je persoonlijke dashboard",
    "Log in met één klik via de knop hieronder",
    "Vind al je producten — boeken, trainingen, downloads — onder één account",
  ],
  en: [
    "Your purchase is ready in your personal dashboard",
    "Log in with one click via the button below",
    "Find all your products — books, trainings, downloads — in one account",
  ],
  de: [
    "Ihre Bestellung steht in Ihrem persönlichen Dashboard bereit",
    "Melden Sie sich mit einem Klick über die Schaltfläche unten an",
    "Finden Sie alle Ihre Produkte — Bücher, Trainings, Downloads — in einem Konto",
  ],
};

const CTA_LABEL: Record<Lang, string> = {
  nl: "Bekijk mijn aankoop",
  en: "View my purchase",
  de: "Meine Bestellung ansehen",
};

const TITLE: Record<Lang, string> = {
  nl: "Bedankt voor je bestelling!",
  en: "Thank you for your order!",
  de: "Vielen Dank für Ihre Bestellung!",
};

const MAIL_SENT: Record<Lang, string> = {
  nl: "We hebben een bevestigingsmail gestuurd naar",
  en: "We've sent a confirmation email to",
  de: "Wir haben eine Bestätigungs-E-Mail gesendet an",
};

const NEXT_STEPS: Record<Lang, string> = {
  nl: "Volgende stappen",
  en: "Next steps",
  de: "Nächste Schritte",
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; product?: string; lang?: string; orderId?: string }>;
}) {
  const sp = await searchParams;
  const email = sp.email || "";
  const productSlug = sp.product || "";
  const orderId = sp.orderId;
  const lang: Lang = sp.lang === "en" ? "en" : sp.lang === "de" ? "de" : "nl";

  return (
    <main className="mx-auto max-w-[520px] px-7 py-16 lg:py-24">
      {/* Success */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        <h1 className="font-display text-[clamp(26px,3.4vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
          {TITLE[lang]}
        </h1>

        {email && (
          <p className="text-[15px] text-ink/60 leading-[1.8] mb-8">
            {MAIL_SENT[lang]} <strong className="text-ink font-medium">{email}</strong>
          </p>
        )}
      </div>

      {/* Next steps */}
      <div className="space-y-3 mb-10">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          {NEXT_STEPS[lang]}
        </p>
        {STEPS[lang].map((text, i) => (
          <div key={i} className="flex items-start gap-3 p-4 border border-rule rounded-[2px]">
            <span className="text-[12px] font-medium text-copper shrink-0 mt-0.5 w-5 text-center">{i + 1}</span>
            <p className="text-[14px] text-ink/70 leading-[1.6]">{text}</p>
          </div>
        ))}
      </div>

      {/* Verify payment + render direct-login CTA once paid */}
      <PostPurchaseFlow
        orderId={orderId}
        productSlug={productSlug}
        lang={lang}
        email={email}
        ctaNext="/dashboard"
        ctaLabel={CTA_LABEL[lang]}
      />

      {/* One-click upsell */}
      {email && productSlug && (
        <UpsellClient email={email} purchasedSlug={productSlug} lang={lang} />
      )}
    </main>
  );
}
