"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/checkout-i18n";

interface Props {
  email: string;
  name: string;
  lang: Lang;
}

export function ReferralClient({ email, name, lang }: Props) {
  const existingCode = useQuery(api.checkout.getReferralCode, { email });
  const createCode = useMutation(api.checkout.createReferralCode);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayCode = existingCode?.code || code;

  async function handleGenerate() {
    setLoading(true);
    const result = await createCode({ email, name });
    setCode(result);
    setLoading(false);
  }

  function handleCopy() {
    if (!displayCode) return;
    const url = `${window.location.origin}?ref=${displayCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border-t border-rule pt-10">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
        {{ nl: "Deel en verdien", en: "Share and earn", de: "Teilen und verdienen" }[lang]}
      </p>

      {displayCode ? (
        <div className="border border-copper/20 bg-copper/[0.03] rounded-[2px] p-5">
          <p className="text-[14px] text-ink leading-[1.6] mb-4">
            {{ nl: "Deel je persoonlijke link met een collega. Jullie krijgen allebei 10% korting!", en: "Share your personal link with a colleague. You both get 10% off!", de: "Teilen Sie Ihren persönlichen Link mit einem Kollegen. Sie beide erhalten 10% Rabatt!" }[lang]}
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-warm border border-rule rounded-[2px] px-3 py-2.5 text-[13px] text-ink font-mono truncate">
              {typeof window !== "undefined" ? `${window.location.origin}?ref=${displayCode}` : displayCode}
            </div>
            <button
              onClick={handleCopy}
              className="bg-copper text-paper px-4 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer shrink-0"
            >
              {copied
                ? { nl: "Gekopieerd!", en: "Copied!", de: "Kopiert!" }[lang]
                : { nl: "Kopieer", en: "Copy", de: "Kopieren" }[lang]}
            </button>
          </div>
          <p className="text-[11px] text-ink/35 mt-3">
            {{ nl: `Je code: ${displayCode} — ook direct te gebruiken als kortingscode bij het afrekenen.`, en: `Your code: ${displayCode} — can also be used directly as a discount code at checkout.`, de: `Ihr Code: ${displayCode} — kann auch direkt als Rabattcode an der Kasse verwendet werden.` }[lang]}
          </p>
        </div>
      ) : (
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[14px] text-ink/60 leading-[1.6] mb-4">
            {{ nl: "Genereer een persoonlijke link. Als iemand via jouw link koopt, krijgen jullie allebei 10% korting.", en: "Generate a personal link. When someone buys via your link, you both get 10% off.", de: "Erstellen Sie einen persönlichen Link. Wenn jemand über Ihren Link kauft, erhalten Sie beide 10% Rabatt." }[lang]}
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-copper text-paper px-5 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50"
          >
            {loading
              ? { nl: "Genereren...", en: "Generating...", de: "Wird erstellt..." }[lang]
              : { nl: "Genereer mijn link", en: "Generate my link", de: "Meinen Link erstellen" }[lang]}
          </button>
        </div>
      )}
    </div>
  );
}
