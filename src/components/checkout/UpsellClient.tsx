"use client";

import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import { formatPrice } from "@/lib/checkout-config";
import type { Lang } from "@/lib/checkout-i18n";

interface Props {
  email: string;
  purchasedSlug: string;
  lang: Lang;
}

export function UpsellClient({ email, purchasedSlug, lang }: Props) {
  const allProducts = useQuery(api.checkoutProducts.listActive);
  const createUpsellOrder = useMutation(api.checkout.createUpsellOrder);
  const createMolliePayment = useAction(api.mollie.createMolliePayment);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!allProducts) return null;

  // Build upsell suggestions from DB
  const candidateSlugs = purchasedSlug.startsWith("boek")
    ? ["boek-ebook", "boek-hardcopy", "boek-luisterboek"]
    : ["boek-ebook", "boek-luisterboek"];

  const upsells = candidateSlugs
    .filter((slug) => slug !== purchasedSlug)
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p);

  if (upsells.length === 0) return null;

  async function handleUpsell(slug: string) {
    setError("");
    setLoadingSlug(slug);
    try {
      const orderId = await createUpsellOrder({ email, product: slug, lang });
      const result = await createMolliePayment({ pendingOrderId: orderId, method: "ideal" });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setLoadingSlug(null);
    }
  }

  return (
    <div className="border-t border-rule pt-10">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
        {{ nl: "Eenmalig aanbod", en: "One-time offer", de: "Einmaliges Angebot" }[lang]}
      </p>
      <p className="text-[14px] text-ink/50 leading-[1.6] mb-5">
        {{ nl: "Voeg toe met één klik — we gebruiken je bestaande gegevens.", en: "Add with one click — we use your existing details.", de: "Mit einem Klick hinzufügen — wir verwenden Ihre vorhandenen Daten." }[lang]}
      </p>

      <div className="space-y-3">
        {upsells.map((upsell) => (
          <div key={upsell.slug} className="border-2 border-dashed border-copper/25 bg-copper/[0.02] rounded-[2px] p-4">
            <div className="flex items-center gap-4">
              {upsell.image && (
                <Image
                  src={upsell.image}
                  alt={upsell.shortName[lang] ?? upsell.shortName.nl}
                  width={48}
                  height={64}
                  className="object-contain drop-shadow-md shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-ink">{upsell.shortName[lang]}</p>
                <p className="text-[12px] text-ink/50 mt-0.5 leading-[1.5]">{upsell.description[lang]}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-[18px] font-bold text-ink">{formatPrice(upsell.priceCents, lang)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleUpsell(upsell.slug)}
              disabled={!!loadingSlug}
              className="w-full mt-3 bg-copper text-paper py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingSlug === upsell.slug ? (
                <>
                  <div className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                  {{ nl: "Verwerken...", en: "Processing...", de: "Wird verarbeitet..." }[lang]}
                </>
              ) : (
                <>
                  {{ nl: "Voeg toe", en: "Add", de: "Hinzufügen" }[lang]} — {formatPrice(upsell.priceCents, lang)}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-[13px] text-red-600 mt-3 text-center">{error}</p>}
    </div>
  );
}
