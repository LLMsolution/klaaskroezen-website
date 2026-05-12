"use client";

import { useState } from "react";
import { PaymentVerifier } from "./PaymentVerifier";
import type { Lang } from "@/lib/i18n";

interface Props {
  orderId?: string;
  productSlug: string;
  lang: Lang;
  email: string;
}

/**
 * Confirms the Mollie payment and shows a notice pointing the buyer at the
 * order confirmation email — which contains the one-click login CTA. No
 * separate magic-link email is sent from here; that role is fulfilled by the
 * `?t=…` token embedded in the confirmation mail.
 */
export function PostPurchaseFlow({ orderId, productSlug, lang, email }: Props) {
  const [confirmed, setConfirmed] = useState(false);

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
            {{ nl: "We hebben een bevestigingsmail gestuurd naar", en: "We've sent a confirmation email to", de: "Wir haben eine Bestätigungs-E-Mail gesendet an" }[lang]}{" "}
            <strong className="text-ink">{email}</strong>.
          </p>
          <p className="text-[12px] text-ink/40 mt-1">
            {{ nl: "Klik op de knop in die mail om direct ingelogd op je dashboard te komen.", en: "Click the button in that email to land directly on your dashboard, signed in.", de: "Klicken Sie auf die Schaltfläche in dieser E-Mail, um direkt eingeloggt zu Ihrem Dashboard zu gelangen." }[lang]}
          </p>
        </div>
      )}
    </>
  );
}
