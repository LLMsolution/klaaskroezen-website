"use client";

import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { useProductNames } from "@/lib/product-names";

function formatPrice(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" });
}

type Purchase = {
  _id: string;
  product: string;
  amount: number;
  status: string;
  paidAt?: number;
  createdAt: number;
};

const COPY: Record<Lang, { title: string; product: string; date: string; amount: string; status: string; empty: string; cta: string }> = {
  nl: { title: "Bestellingen", product: "Product", date: "Datum", amount: "Bedrag", status: "Status", empty: "Je hebt nog geen bestellingen.", cta: "Bekijk de trainingen →" },
  en: { title: "Orders", product: "Product", date: "Date", amount: "Amount", status: "Status", empty: "You don't have any orders yet.", cta: "View trainings →" },
  de: { title: "Bestellungen", product: "Produkt", date: "Datum", amount: "Betrag", status: "Status", empty: "Sie haben noch keine Bestellungen.", cta: "Trainings ansehen →" },
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-ink/5 text-ink/50",
  };
  const labels: Record<string, string> = { paid: "Betaald", pending: "In afwachting", failed: "Mislukt", refunded: "Terugbetaald" };
  return (
    <span className={`inline-block text-[11px] font-medium tracking-[0.05em] px-2.5 py-1 rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

export function PurchasesSection({ purchases, lang }: { purchases: Purchase[] | undefined; lang: Lang }) {
  const copy = COPY[lang];
  const PRODUCT_NAMES = useProductNames(lang, "name");
  const hasPurchases = purchases && purchases.length > 0;

  return (
    <section className="mb-12">
      <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">{copy.title}</h2>
      {hasPurchases ? (
        <div className="border border-rule rounded-[2px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-rule">
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3">{copy.product}</th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3 hidden sm:table-cell">{copy.date}</th>
                <th className="text-right text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3">{copy.amount}</th>
                <th className="text-right text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3">{copy.status}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p._id} className="border-b border-rule last:border-b-0">
                  <td className="px-4 py-3.5"><p className="text-[14px] text-ink">{PRODUCT_NAMES[p.product] || p.product}</p></td>
                  <td className="px-4 py-3.5 hidden sm:table-cell"><p className="text-[13px] text-ink/50">{p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}</p></td>
                  <td className="px-4 py-3.5 text-right"><p className="text-[14px] text-ink tabular-nums">{formatPrice(p.amount)}</p></td>
                  <td className="px-4 py-3.5 text-right"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-rule rounded-[2px] p-8 text-center">
          <p className="text-[14px] text-ink/40 mb-4">{copy.empty}</p>
          <Link href="/sales-excellence-training" className="text-[13px] text-copper hover:text-copper-light transition-colors">{copy.cta}</Link>
        </div>
      )}
    </section>
  );
}
