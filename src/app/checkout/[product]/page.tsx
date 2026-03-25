import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { detectLang } from "@/lib/checkout-i18n";
import {
  ACTIVE_EXPERIMENTS,
  assignVariant,
  experimentCookieName,
} from "@/lib/ab-experiments";

interface Props {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ lang?: string; recover?: string; failed?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: slug } = await params;
  return {
    title: `Checkout — ${slug}`,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { product: slug } = await params;
  const sp = await searchParams;
  const lang = detectLang(sp);

  // Geo detection via Vercel headers
  const headersList = await headers();
  const geoCountry = headersList.get("x-vercel-ip-country") || undefined;

  const cookieStore = await cookies();

  // A/B test: resolve experiment for this product.
  // Priority: DB-driven experiment (admin-activatable) > static fallback.
  let experimentSlug: string | undefined;
  let experimentVariant: string | undefined;
  let needsCookieSet = false;

  // 1. Try DB-driven experiment (no deploy needed to activate)
  try {
    const dbExperiment = await fetchQuery(
      api.abtest.getActiveExperimentForProduct,
      { product: slug },
    );
    if (dbExperiment) {
      experimentSlug = dbExperiment.slug;
      const cookieName = experimentCookieName(dbExperiment.slug);
      const existing = cookieStore.get(cookieName)?.value;
      if (existing) {
        experimentVariant = existing;
      } else {
        experimentVariant = assignVariant(dbExperiment.weight);
        needsCookieSet = true;
      }
    }
  } catch {
    // Convex unavailable — fall through to static experiments
  }

  // 2. Fallback: static ACTIVE_EXPERIMENTS (assigned by middleware, or here)
  if (!experimentSlug) {
    const staticExp = ACTIVE_EXPERIMENTS.find(
      (e) => e.product === slug || e.product === "*",
    );
    if (staticExp) {
      experimentSlug = staticExp.slug;
      const cookieName = experimentCookieName(staticExp.slug);
      const existing = cookieStore.get(cookieName)?.value;
      if (existing) {
        experimentVariant = existing;
      } else {
        // Middleware should have set this, but assign as safety net
        experimentVariant = assignVariant(staticExp.weightB);
        needsCookieSet = true;
      }
    }
  }

  return (
    <main className="mx-auto max-w-[1080px] px-7 py-10 lg:py-14">
      <CheckoutClient
        productSlug={slug}
        lang={lang}
        recoveryOrderId={sp.recover}
        paymentFailed={sp.failed === "1"}
        initialCountry={geoCountry}
        experimentSlug={experimentSlug}
        experimentVariant={experimentVariant}
        experimentNeedsCookie={needsCookieSet}
      />
    </main>
  );
}
