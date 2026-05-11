"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { PaymentVerifier } from "./PaymentVerifier";
import type { Lang } from "@/lib/i18n";

interface Props {
  orderId?: string;
  productSlug: string;
  lang: Lang;
  email: string;
}

export function PostPurchaseFlow({ orderId, productSlug, lang, email }: Props) {
  const { signIn } = useAuthActions();
  const [confirmed, setConfirmed] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    if (!confirmed || !email || linkSent) return;
    setLinkSent(true);
    signIn("resend", { email, redirectTo: "/dashboard" }).catch(() => {});
  }, [confirmed, email, linkSent, signIn]);

  return (
    <>
      <PaymentVerifier
        orderId={orderId}
        productSlug={productSlug}
        lang={lang}
        onConfirmed={() => setConfirmed(true)}
      />
      {confirmed && linkSent && email && (
        <div className="mb-8 p-4 bg-copper/5 border border-copper/20 rounded-[2px] text-center">
          <p className="text-[13px] text-ink/70">
            {{ nl: "We hebben een inlog-link gestuurd naar", en: "We've sent a login link to", de: "Wir haben einen Anmeldelink gesendet an" }[lang]}{" "}
            <strong className="text-ink">{email}</strong>
          </p>
          <p className="text-[12px] text-ink/40 mt-1">
            {{ nl: "Klik op de link in je inbox om direct in te loggen en je aankopen te bekijken.", en: "Click the link in your inbox to log in and view your purchases.", de: "Klicken Sie auf den Link in Ihrem Posteingang, um sich anzumelden und Ihre Käufe anzusehen." }[lang]}
          </p>
        </div>
      )}
    </>
  );
}
