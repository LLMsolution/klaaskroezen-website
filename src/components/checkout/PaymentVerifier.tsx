"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

interface Props {
  orderId?: string;
  productSlug: string;
  lang: Lang;
  onConfirmed?: () => void;
}

const TIMEOUT_MS = 30_000;

/**
 * Verifies payment succeeded by watching the pending order status.
 * Shows a spinner while checking, then calls onConfirmed when the order
 * converts (order === null). Redirects to checkout on timeout (30 s).
 */
export function PaymentVerifier({ orderId, productSlug, lang, onConfirmed }: Props) {
  const startedAt = useRef(Date.now());
  const confirmed = useRef(false);
  const timedOut = useRef(false);

  const order = useQuery(
    api.checkout.getPendingOrderForRecovery,
    orderId ? { orderId } : "skip",
  );

  // Time-based timeout — independent of how many reactive updates Convex sends.
  useEffect(() => {
    if (!orderId) return;
    const timer = setTimeout(() => {
      if (confirmed.current) return;
      timedOut.current = true;
      window.location.href = `/checkout/${productSlug}?failed=1&recover=${orderId}`;
    }, TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [orderId, productSlug]);

  useEffect(() => {
    if (!orderId || order === undefined || confirmed.current || timedOut.current) return;
    if (order === null) {
      // Order converted = payment succeeded
      confirmed.current = true;
      onConfirmed?.();
    }
    // order still exists → webhook not yet arrived; Convex will push when it changes
  }, [order, orderId, onConfirmed]);

  if (!orderId || order === null) return null;

  // orderId present and order still exists → show spinner
  return (
    <div className="text-center py-20">
      <div className="w-10 h-10 border-2 border-copper/30 border-t-copper rounded-full animate-spin mx-auto mb-4" />
      <p className="text-[14px] text-ink/50">
        {{ nl: "Betaling verwerken...", en: "Processing payment...", de: "Zahlung wird verarbeitet..." }[lang]}
      </p>
    </div>
  );
}
