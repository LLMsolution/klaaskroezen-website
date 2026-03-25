"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { formatPrice, formatDate, Th, Loading, EmptyState } from "./shared";

export function InvoicesTab() {
  const invoices = useQuery(api.admin.getInvoices, { limit: 100 });
  if (!invoices) return <Loading />;
  if (invoices.length === 0) return <EmptyState text="Nog geen facturen." />;

  return (
    <div className="border border-rule rounded-[2px] overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-rule bg-warm/30">
            <Th>Factuurnummer</Th>
            <Th>Klant</Th>
            <Th>Bedrag</Th>
            <Th>BTW</Th>
            <Th>Datum</Th>
            <Th>Actie</Th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
              <td className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{inv.invoiceNumber}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink">{inv.buyerName}</p>
                <p className="text-[11px] text-ink/40">{inv.buyerEmail}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink tabular-nums">{formatPrice(inv.totalCents)}</p>
              </td>
              <td className="px-4 py-3">
                {inv.btwReversed ? (
                  <span className="text-[11px] text-copper">Verlegd</span>
                ) : inv.noBtw ? (
                  <span className="text-[11px] text-ink/40">N.v.t.</span>
                ) : (
                  <span className="text-[12px] text-ink/50 tabular-nums">{formatPrice(inv.totalBtwCents)}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{formatDate(inv.paidAt)}</p>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/api/invoice/${inv.purchaseId}`}
                  target="_blank"
                  className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors"
                >
                  Bekijken
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
