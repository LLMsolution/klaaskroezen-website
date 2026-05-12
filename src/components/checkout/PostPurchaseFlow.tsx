"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { PaymentVerifier } from "./PaymentVerifier";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

interface Props {
  orderId?: string;
  productSlug: string;
  lang: Lang;
  email: string;
  /** Final destination once authenticated — typically /dashboard or /dashboard#downloads. */
  ctaNext: string;
  ctaLabel: string;
}

/**
 * Verifies Mollie payment, issues a single-use login token, and renders the
 * primary "Naar dashboard" CTA so a single click signs the buyer in and lands
 * them on the dashboard. No separate magic-link email is required.
 */
export function PostPurchaseFlow({ orderId, productSlug, lang, email, ctaNext, ctaLabel }: Props) {
  const issueToken = useMutation(api.purchaseLoginTokens.issueTokenForPaidOrder);
  const [confirmed, setConfirmed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!confirmed || !orderId || token || tokenError) return;
    issueToken({ orderId })
      .then((t) => {
        if (t) setToken(t);
        else setTokenError(true);
      })
      .catch(() => setTokenError(true));
  }, [confirmed, orderId, token, tokenError, issueToken]);

  // CTA target: with token → one-click sign-in; without → fallback to magic-link
  // request page which auto-sends a fresh link.
  const ctaHref = (() => {
    const emailParam = encodeURIComponent(email);
    const nextParam = encodeURIComponent(ctaNext);
    if (token) {
      return `/login/kopen?email=${emailParam}&t=${encodeURIComponent(token)}&next=${nextParam}`;
    }
    return `/login/kopen?email=${emailParam}&next=${nextParam}`;
  })();

  return (
    <>
      <PaymentVerifier
        orderId={orderId}
        productSlug={productSlug}
        lang={lang}
        onConfirmed={() => setConfirmed(true)}
      />

      {confirmed && email && (
        <div className="mb-8 p-4 bg-copper/5 border border-copper/20 rounded-[2px] text-center">
          <p className="text-[13px] text-ink/70">
            {{ nl: "Klik op de knop hieronder om naar je dashboard te gaan — je wordt direct ingelogd.", en: "Click the button below to go to your dashboard — you'll be signed in automatically.", de: "Klicken Sie auf die Schaltfläche unten, um zu Ihrem Dashboard zu gelangen — Sie werden automatisch angemeldet." }[lang]}
          </p>
        </div>
      )}

      {confirmed && email && (
        <div className="space-y-3 mb-12">
          <Link
            href={ctaHref}
            className="block w-full bg-copper text-paper py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] text-center"
          >
            {ctaLabel}
          </Link>
          <Link
            href="/"
            className="block w-full text-[13px] text-ink/50 hover:text-ink transition-colors py-2 text-center"
          >
            {{ nl: "Terug naar de website", en: "Back to the website", de: "Zurück zur Website" }[lang]}
          </Link>
        </div>
      )}
    </>
  );
}
