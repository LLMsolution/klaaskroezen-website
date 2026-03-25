"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

interface Props {
  orderId?: string;
  productSlug: string;
  lang: Lang;
}

/**
 * Verifies payment succeeded by polling the pending order status.
 * Waits up to 30 seconds for the Mollie webhook to process before redirecting.
 */
export function PaymentVerifier({ orderId, productSlug, lang }: Props) {
  const [checking, setChecking] = useState(!!orderId);
  const retryCount = useRef(0);
  const maxRetries = 6; // 6 × 5s = 30s max wait

  const order = useQuery(
    api.checkout.getPendingOrderForRecovery,
    orderId ? { orderId } : "skip",
  );

  useEffect(() => {
    if (!orderId || order === undefined) return;

    if (order === null) {
      // Order converted = payment succeeded
      setChecking(false);
      return;
    }

    // Order still exists — webhook might not have arrived yet
    retryCount.current += 1;

    if (retryCount.current >= maxRetries) {
      // After 30s, assume payment failed
      window.location.href = `/checkout/${productSlug}?failed=1&recover=${orderId}`;
    }
    // Otherwise, Convex reactive query will auto-retry when data changes
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
