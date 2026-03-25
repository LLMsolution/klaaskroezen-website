"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

interface Props {
  orderId?: string;
  productSlug: string;
  lang: Lang;
}

export function PaymentVerifier({ orderId, productSlug, lang }: Props) {
  const [checking, setChecking] = useState(!!orderId);

  const order = useQuery(
    api.checkout.getPendingOrderForRecovery,
    orderId ? { orderId } : "skip",
  );

  useEffect(() => {
    if (!orderId || order === undefined) return;

    // If order still exists (not converted), payment failed
    if (order !== null) {
      // Redirect back to checkout with failed flag
      window.location.href = `/checkout/${productSlug}?failed=1&recover=${orderId}`;
    } else {
      // Order converted = payment succeeded
      setChecking(false);
    }
  }, [order, orderId, productSlug]);

  if (checking) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-2 border-copper/30 border-t-copper rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[14px] text-ink/50">
          {{ nl: "Betaling verwerken...", en: "Processing payment...", de: "Zahlung wird verarbeitet..." }[lang]}
        </p>
      </div>
    );
  }

  return null;
}
