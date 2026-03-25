"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { t, type Lang } from "@/lib/checkout-i18n";

const COUNTRY_REGIONS: Record<string, { nl: string; en: string; de: string }> = {
  NL: { nl: "Nederland", en: "the Netherlands", de: "den Niederlanden" },
  BE: { nl: "Belgi\u00EB", en: "Belgium", de: "Belgien" },
  DE: { nl: "Duitsland", en: "Germany", de: "Deutschland" },
};

interface Props {
  productSlug: string;
  lang: Lang;
  country?: string;
}

export function SocialProof({ productSlug, lang, country }: Props) {
  const i18n = t(lang);
  const sessionRef = useRef<string>("");

  // Generate stable session ID
  useEffect(() => {
    sessionRef.current =
      sessionStorage.getItem("kk-session") ||
      Math.random().toString(36).slice(2);
    sessionStorage.setItem("kk-session", sessionRef.current);
  }, []);

  // Presence tracking
  const heartbeat = useMutation(api.presence.heartbeat);
  const leave = useMutation(api.presence.leave);
  const activeCount = useQuery(api.presence.getActiveCount, {
    page: `checkout-${productSlug}`,
  });

  useEffect(() => {
    if (!sessionRef.current) return;

    const page = `checkout-${productSlug}`;
    // Initial heartbeat
    heartbeat({ sessionId: sessionRef.current, page });

    // Heartbeat every 15 seconds
    const interval = setInterval(() => {
      heartbeat({ sessionId: sessionRef.current, page });
    }, 15000);

    // Leave on unmount
    return () => {
      clearInterval(interval);
      leave({ sessionId: sessionRef.current });
    };
  }, [productSlug, heartbeat, leave]);

  // Recent purchases
  const recentPurchases = useQuery(api.checkout.getRecentPurchases, {
    product: productSlug,
  });

  // Recent purchase toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastIndex, setToastIndex] = useState(0);

  useEffect(() => {
    if (!recentPurchases || recentPurchases.length === 0) return;

    // Show first toast after 8 seconds
    const timeout = setTimeout(() => {
      setToastVisible(true);
      // Hide after 5 seconds
      setTimeout(() => setToastVisible(false), 5000);
    }, 8000);

    // Rotate through purchases every 30 seconds
    const interval = setInterval(() => {
      setToastIndex((prev) => (prev + 1) % recentPurchases.length);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 5000);
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [recentPurchases]);

  const currentPurchase = recentPurchases?.[toastIndex];

  function timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (hours > 0) return `${hours} ${i18n.hoursAgo}`;
    if (minutes > 0) return `${minutes} ${i18n.minutesAgo}`;
    return { nl: "zojuist", en: "just now", de: "gerade eben" }[lang];
  }

  return (
    <>
      {/* Live visitors count — bottom of page, subtle */}
      {activeCount !== undefined && activeCount >= 5 && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-paper border border-rule shadow-lg px-4 py-2.5 rounded-[2px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-copper opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-copper" />
          </span>
          <span className="text-[12px] text-ink/60">
            {activeCount} {i18n.peopleViewing}
          </span>
        </div>
      )}

      {/* Recent purchase toast — bottom right */}
      {toastVisible && currentPurchase && (
        <div className="fixed bottom-4 right-4 z-40 bg-paper border border-rule shadow-lg px-4 py-3 rounded-[2px] max-w-[280px] animate-[slideUp_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-copper"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-ink/70">
                {country && COUNTRY_REGIONS[country]
                  ? { nl: `Iemand uit ${COUNTRY_REGIONS[country].nl} heeft dit gekocht`, en: `Someone from ${COUNTRY_REGIONS[country].en} purchased this`, de: `Jemand aus ${COUNTRY_REGIONS[country].de} hat dies gekauft` }[lang]
                  : { nl: "Iemand heeft dit gekocht", en: "Someone purchased this", de: "Jemand hat dies gekauft" }[lang]}
              </p>
              <p className="text-[11px] text-ink/40 mt-0.5">
                {timeAgo(currentPurchase.paidAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
