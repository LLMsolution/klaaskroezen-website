"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { t, type Lang } from "@/lib/checkout-i18n";

interface Props {
  lang: Lang;
}

export function TrustBadges({ lang }: Props) {
  const i18n = t(lang);

  const dbContent = useQuery(api.siteContent.getPageContent, {
    slug: "checkout-shared",
    lang,
  });
  const badges = (dbContent?.["trust-badges"] ?? {}) as {
    guarantee?: string;
    guaranteeSub?: string;
    secureSsl?: string;
    securePayment?: string;
  };
  const guarantee = badges.guarantee?.trim() || i18n.guarantee;
  const guaranteeSub = badges.guaranteeSub?.trim() || i18n.guaranteeSub;
  const secureSsl = badges.secureSsl?.trim() || i18n.secureSsl;
  const securePayment = badges.securePayment?.trim() || i18n.securePayment;

  return (
    <div className="mt-8 space-y-4">
      {/* Guarantee */}
      <div className="flex items-start gap-3 p-4 bg-copper/5 border border-copper/15 rounded-[2px]">
        <div className="w-10 h-10 rounded-full bg-copper/10 flex items-center justify-center shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-copper"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-medium text-ink">{guarantee}</p>
          <p className="text-[12px] text-ink/50 mt-0.5 leading-[1.5]">
            {guaranteeSub}
          </p>
        </div>
      </div>

      {/* Security + Payment logos */}
      <div className="flex items-center justify-center gap-6 py-3">
        <div className="flex items-center gap-1.5 text-ink/30">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-[11px] tracking-[0.05em]">{secureSsl}</span>
        </div>
        <div className="w-px h-4 bg-rule" />
        <span className="text-[11px] text-ink/30 tracking-[0.05em]">
          {securePayment}
        </span>
      </div>

      {/* Payment method logos */}
      <div className="flex items-center justify-center gap-4 opacity-40">
        {/* iDEAL */}
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect width="28" height="20" rx="3" fill="#CC0066" />
          <text
            x="14"
            y="13"
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            iDEAL
          </text>
        </svg>
        {/* Visa */}
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect width="28" height="20" rx="3" fill="#1A1F71" />
          <text
            x="14"
            y="13"
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            VISA
          </text>
        </svg>
        {/* Mastercard */}
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect width="28" height="20" rx="3" fill="#EB001B" />
          <circle cx="11" cy="10" r="6" fill="#EB001B" />
          <circle cx="17" cy="10" r="6" fill="#F79E1B" opacity="0.8" />
        </svg>
        {/* Apple Pay */}
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect width="28" height="20" rx="3" fill="#000" />
          <text
            x="14"
            y="13"
            textAnchor="middle"
            fill="white"
            fontSize="6"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            Pay
          </text>
        </svg>
      </div>
    </div>
  );
}
