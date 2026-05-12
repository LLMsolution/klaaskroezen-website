import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { UpsellClient } from "@/components/checkout/UpsellClient";
import { PostPurchaseFlow } from "@/components/checkout/PostPurchaseFlow";
import type { Lang } from "@/lib/i18n";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Bedankt voor je bestelling",
  robots: { index: false, follow: false },
};

type StepVariant = "training" | "ebook" | "audiobook" | "hardcopy";

const DEFAULT_STEPS: Record<StepVariant, Record<Lang, string[]>> = {
  training: {
    nl: ["Check je inbox voor de bevestigingsmail met toegangsgegevens", "Open je digitale werkboek en maak kennis met de eerste module", "Plan je eerste sessie in — het beste moment is nu"],
    en: ["Check your inbox for the confirmation email with access details", "Open your digital workbook and explore the first module", "Schedule your first session — the best time is now"],
    de: ["Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail mit Zugangsdaten", "Öffnen Sie Ihr digitales Arbeitsbuch und entdecken Sie das erste Modul", "Planen Sie Ihre erste Sitzung — der beste Zeitpunkt ist jetzt"],
  },
  ebook: {
    nl: ["Check je inbox voor de bevestigingsmail met je downloadlink", "Je e-book staat klaar in je dashboard onder Downloads", "Begin bij hoofdstuk 1 — daar zit de basis"],
    en: ["Check your inbox for the confirmation email with your download link", "Your e-book is ready in your dashboard under Downloads", "Start with chapter 1 — that's where the foundation is"],
    de: ["Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail mit Ihrem Download-Link", "Ihr E-Book steht in Ihrem Dashboard unter Downloads bereit", "Beginnen Sie mit Kapitel 1 — dort liegt das Fundament"],
  },
  audiobook: {
    nl: ["Check je inbox voor de bevestigingsmail", "Je luisterboek staat klaar in je dashboard onder Trainingen", "Luister onderweg, tijdens het sporten of thuis op de bank"],
    en: ["Check your inbox for the confirmation email", "Your audiobook is ready in your dashboard under Trainings", "Listen on the go, while exercising, or relaxing at home"],
    de: ["Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail", "Ihr Hörbuch steht in Ihrem Dashboard unter Trainings bereit", "Hören Sie unterwegs, beim Sport oder zu Hause auf dem Sofa"],
  },
  hardcopy: {
    nl: ["Check je inbox voor de bevestigingsmail met je orderdetails", "Je boek wordt binnen 2 werkdagen verzonden naar je adres", "Zodra je hem hebt: begin bij hoofdstuk 1 — daar zit de basis"],
    en: ["Check your inbox for the confirmation email with your order details", "Your book ships within 2 business days to your address", "Once you have it: start with chapter 1 — that's where the foundation is"],
    de: ["Prüfen Sie Ihren Posteingang für die Bestätigungs-E-Mail mit Ihren Bestelldetails", "Ihr Buch wird innerhalb von 2 Werktagen an Ihre Adresse versandt", "Wenn Sie es haben: beginnen Sie mit Kapitel 1 — dort liegt das Fundament"],
  },
};

type ProductConfig = {
  variant: StepVariant;
  thankYouPage?: {
    steps: { nl: string; en: string; de?: string }[];
    ctaLabel: { nl: string; en: string; de?: string };
    ctaHref: string;
  };
};

async function resolveProduct(productSlug: string): Promise<ProductConfig> {
  if (!productSlug) return { variant: "training" };
  try {
    const product = await fetchQuery(api.checkoutProducts.getBySlug, { slug: productSlug });
    const v = product?.productVariant;
    const variant: StepVariant =
      v === "ebook" ? "ebook" :
      v === "audiobook" ? "audiobook" :
      v === "hardcopy" ? "hardcopy" :
      "training";
    return { variant, thankYouPage: product?.thankYouPage ?? undefined };
  } catch {
    // fall through to slug-based fallback
  }
  // Fallback for products without productVariant set yet.
  const variant: StepVariant =
    productSlug === "boek-ebook" ? "ebook" :
    productSlug === "boek-luisterboek" ? "audiobook" :
    productSlug.startsWith("boek") ? "hardcopy" :
    "training";
  return { variant };
}

const DEFAULT_CTA: Record<StepVariant, { href: string; label: Record<Lang, string> }> = {
  training: { href: "/dashboard", label: { nl: "Ga naar mijn dashboard", en: "Go to my dashboard", de: "Zu meinem Dashboard" } },
  ebook: { href: "/dashboard#downloads", label: { nl: "Download je e-book", en: "Download your e-book", de: "E-Book herunterladen" } },
  audiobook: { href: "/dashboard", label: { nl: "Naar je luisterboek", en: "Go to your audiobook", de: "Zu Ihrem Hörbuch" } },
  hardcopy: { href: "/dashboard", label: { nl: "Ga naar mijn dashboard", en: "Go to my dashboard", de: "Zu meinem Dashboard" } },
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
  const { variant, thankYouPage } = await resolveProduct(productSlug);

  const steps: string[] = thankYouPage?.steps.length
    ? thankYouPage.steps.map((s) => s[lang] ?? s.nl)
    : DEFAULT_STEPS[variant][lang];

  const ctaNext = thankYouPage?.ctaHref || DEFAULT_CTA[variant].href;
  const ctaLabel = thankYouPage
    ? (thankYouPage.ctaLabel[lang] ?? thankYouPage.ctaLabel.nl)
    : DEFAULT_CTA[variant].label[lang];

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
        {steps.map((text, i) => (
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
        ctaNext={ctaNext}
        ctaLabel={ctaLabel}
      />

      {/* One-click upsell */}
      {email && productSlug && (
        <UpsellClient email={email} purchasedSlug={productSlug} lang={lang} />
      )}

    </main>
  );
}
