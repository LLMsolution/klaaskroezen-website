import type { Metadata } from "next";
import Link from "next/link";
import { UpsellClient } from "@/components/checkout/UpsellClient";
import { PaymentVerifier } from "@/components/checkout/PaymentVerifier";
import type { Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Bedankt voor je bestelling",
  robots: { index: false, follow: false },
};

type StepVariant = "training" | "boek-ebook" | "boek-luisterboek" | "boek-hardcopy";

const NEXT_STEPS: Record<StepVariant, Record<Lang, { icon: string; text: string }[]>> = {
  training: {
    nl: [
      { icon: "📧", text: "Check je inbox voor de bevestigingsmail met toegangsgegevens" },
      { icon: "📖", text: "Open je digitale werkboek en maak kennis met de eerste module" },
      { icon: "🎯", text: "Plan je eerste sessie in — het beste moment is nu" },
    ],
    en: [
      { icon: "📧", text: "Check your inbox for the confirmation email with access details" },
      { icon: "📖", text: "Open your digital workbook and explore the first module" },
      { icon: "🎯", text: "Schedule your first session — the best time is now" },
    ],
    de: [
      { icon: "📧", text: "Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail mit Zugangsdaten" },
      { icon: "📖", text: "Öffnen Sie Ihr digitales Arbeitsbuch und entdecken Sie das erste Modul" },
      { icon: "🎯", text: "Planen Sie Ihre erste Sitzung — der beste Zeitpunkt ist jetzt" },
    ],
  },
  "boek-ebook": {
    nl: [
      { icon: "📧", text: "Check je inbox voor de bevestigingsmail met je downloadlink" },
      { icon: "📥", text: "Je e-book staat klaar in je dashboard onder Downloads" },
      { icon: "💡", text: "Begin bij hoofdstuk 1 — daar zit de basis" },
    ],
    en: [
      { icon: "📧", text: "Check your inbox for the confirmation email with your download link" },
      { icon: "📥", text: "Your e-book is ready in your dashboard under Downloads" },
      { icon: "💡", text: "Start with chapter 1 — that's where the foundation is" },
    ],
    de: [
      { icon: "📧", text: "Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail mit Ihrem Download-Link" },
      { icon: "📥", text: "Ihr E-Book steht in Ihrem Dashboard unter Downloads bereit" },
      { icon: "💡", text: "Beginnen Sie mit Kapitel 1 — dort liegt das Fundament" },
    ],
  },
  "boek-luisterboek": {
    nl: [
      { icon: "📧", text: "Check je inbox voor de bevestigingsmail" },
      { icon: "🎧", text: "Je luisterboek staat klaar in je dashboard onder Trainingen" },
      { icon: "💡", text: "Luister onderweg, tijdens het sporten of thuis op de bank" },
    ],
    en: [
      { icon: "📧", text: "Check your inbox for the confirmation email" },
      { icon: "🎧", text: "Your audiobook is ready in your dashboard under Trainings" },
      { icon: "💡", text: "Listen on the go, while exercising, or relaxing at home" },
    ],
    de: [
      { icon: "📧", text: "Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail" },
      { icon: "🎧", text: "Ihr Hörbuch steht in Ihrem Dashboard unter Trainings bereit" },
      { icon: "💡", text: "Hören Sie unterwegs, beim Sport oder zu Hause auf dem Sofa" },
    ],
  },
  "boek-hardcopy": {
    nl: [
      { icon: "📧", text: "Check je inbox voor de bevestigingsmail met je orderdetails" },
      { icon: "📦", text: "Je boek wordt binnen 2 werkdagen verzonden naar je adres" },
      { icon: "💡", text: "Zodra je hem hebt: begin bij hoofdstuk 1 — daar zit de basis" },
    ],
    en: [
      { icon: "📧", text: "Check your inbox for the confirmation email with your order details" },
      { icon: "📦", text: "Your book ships within 2 business days to your address" },
      { icon: "💡", text: "Once you have it: start with chapter 1 — that's where the foundation is" },
    ],
    de: [
      { icon: "📧", text: "Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail mit Ihren Bestelldetails" },
      { icon: "📦", text: "Ihr Buch wird innerhalb von 2 Werktagen an Ihre Adresse versandt" },
      { icon: "💡", text: "Wenn Sie es haben: beginnen Sie mit Kapitel 1 — dort liegt das Fundament" },
    ],
  },
};

function resolveVariant(productSlug: string): StepVariant {
  if (productSlug === "boek-ebook") return "boek-ebook";
  if (productSlug === "boek-luisterboek") return "boek-luisterboek";
  if (productSlug === "boek-hardcopy" || productSlug.startsWith("boek")) return "boek-hardcopy";
  return "training";
}

const PRIMARY_CTA: Record<StepVariant, { href: string; label: Record<Lang, string> }> = {
  training: {
    href: "/dashboard",
    label: { nl: "Ga naar mijn dashboard", en: "Go to my dashboard", de: "Zu meinem Dashboard" },
  },
  "boek-ebook": {
    href: "/dashboard#downloads",
    label: { nl: "Download je e-book", en: "Download your e-book", de: "E-Book herunterladen" },
  },
  "boek-luisterboek": {
    href: "/dashboard",
    label: { nl: "Naar je luisterboek", en: "Go to your audiobook", de: "Zu Ihrem Hörbuch" },
  },
  "boek-hardcopy": {
    href: "/dashboard",
    label: { nl: "Ga naar mijn dashboard", en: "Go to my dashboard", de: "Zu meinem Dashboard" },
  },
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
  const variant = resolveVariant(productSlug);
  const steps = NEXT_STEPS[variant][lang];
  const primaryCta = PRIMARY_CTA[variant];

  return (
    <main className="mx-auto max-w-[520px] px-7 py-16 lg:py-24">
      {/* Feature 7: Verify payment succeeded, redirect if failed */}
      <PaymentVerifier orderId={orderId} productSlug={productSlug} lang={lang} />

      {/* Success */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        <h1 className="font-display text-[clamp(26px,3.4vw,36px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
          {{ nl: "Bedankt voor je bestelling!", en: "Thank you for your order!", de: "Vielen Dank für Ihre Bestellung!" }[lang]}
        </h1>

        {email && (
          <p className="text-[15px] text-ink/60 leading-[1.8] mb-8">
            {{ nl: "We hebben een bevestigingsmail gestuurd naar", en: "We've sent a confirmation email to", de: "Wir haben eine Bestätigungs-E-Mail gesendet an" }[lang]}{" "}
            <strong className="text-ink font-medium">{email}</strong>
          </p>
        )}
      </div>

      {/* Next steps */}
      <div className="space-y-3 mb-10">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
          {{ nl: "Volgende stappen", en: "Next steps", de: "Nächste Schritte" }[lang]}
        </p>
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 p-4 border border-rule rounded-[2px]">
            <span className="text-[18px] shrink-0 mt-0.5">{step.icon}</span>
            <p className="text-[14px] text-ink/70 leading-[1.6]">{step.text}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-12">
        <Link
          href={primaryCta.href}
          className="block w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] text-center"
        >
          {primaryCta.label[lang]}
        </Link>
        <Link
          href="/"
          className="block w-full text-[13px] text-ink/50 hover:text-ink transition-colors py-2 text-center"
        >
          {{ nl: "Terug naar de website", en: "Back to the website", de: "Zurück zur Website" }[lang]}
        </Link>
      </div>

      {/* One-click upsell */}
      {email && productSlug && (
        <UpsellClient email={email} purchasedSlug={productSlug} lang={lang} />
      )}

    </main>
  );
}
