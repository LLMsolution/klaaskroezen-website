import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

/**
 * GET /api/invoice/[id]
 * Returns an HTML invoice that can be printed/saved as PDF via the browser.
 * In the future, this can generate a proper PDF with @react-pdf/renderer.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const invoice = await fetchQuery(api.invoices.getInvoiceByPurchase, {
      purchaseId: id as Id<"purchases">,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 },
      );
    }

    const isNl = invoice.lang === "nl";
    const html = buildInvoiceHtml(invoice, isNl);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 },
    );
  }
}

function formatEuro(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(timestamp: number, isNl: boolean): string {
  return new Date(timestamp).toLocaleDateString(isNl ? "nl-NL" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface InvoiceData {
  invoiceNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerCountry: string;
  buyerIsBusiness: boolean;
  buyerCompany?: string;
  buyerVatNumber?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    btwRate: number;
    btwCents: number;
    totalCents: number;
  }>;
  subtotalCents: number;
  totalBtwCents: number;
  totalCents: number;
  btwReversed: boolean;
  noBtw: boolean;
  paidAt: number;
  createdAt: number;
}

function buildInvoiceHtml(invoice: InvoiceData, isNl: boolean): string {
  const lineItemRows = invoice.lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E2;">${item.description}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E2; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E2; text-align: right;">${formatEuro(item.unitPriceCents)}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E2; text-align: right;">${item.btwRate}%</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E2; text-align: right;">${formatEuro(item.totalCents)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${isNl ? "nl" : "en"}">
<head>
  <meta charset="utf-8">
  <title>${isNl ? "Factuur" : "Invoice"} ${invoice.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
      color: #0E0C0A;
      background: #fff;
      font-size: 14px;
      line-height: 1.6;
      padding: 48px;
      max-width: 800px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
    h1 { font-family: 'Playfair Display', Georgia, serif; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(14,12,10,0.4); padding-bottom: 8px; border-bottom: 2px solid #0E0C0A; }
    th:nth-child(2), th:nth-child(4) { text-align: center; }
    th:nth-child(3), th:nth-child(5) { text-align: right; }
  </style>
</head>
<body>
  <!-- Print button -->
  <div class="no-print" style="margin-bottom: 24px;">
    <button onclick="window.print()" style="background: #A05824; color: #F7F4EF; border: none; padding: 10px 24px; font-size: 13px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;">
      ${isNl ? "Print / Download PDF" : "Print / Download PDF"}
    </button>
  </div>

  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px;">
    <div>
      <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 4px;">
        ${isNl ? "Factuur" : "Invoice"}
      </h1>
      <p style="font-size: 15px; color: rgba(14,12,10,0.5);">${invoice.invoiceNumber}</p>
    </div>
    <div style="text-align: right; font-size: 13px; color: rgba(14,12,10,0.6);">
      <p style="font-weight: 600; color: #0E0C0A;">Klaas Kroezen B.V.</p>
      <p>info@klaaskroezen.com</p>
      <p>KVK: 92622909</p>
      <p>BTW: NL866276498B01</p>
    </div>
  </div>

  <!-- Dates & buyer info -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 40px; gap: 40px;">
    <div style="font-size: 13px;">
      <p style="font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(14,12,10,0.4); margin-bottom: 8px;">
        ${isNl ? "Factuurdatum" : "Invoice date"}
      </p>
      <p>${formatDate(invoice.paidAt, isNl)}</p>
    </div>
    <div style="font-size: 13px; text-align: right;">
      <p style="font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(14,12,10,0.4); margin-bottom: 8px;">
        ${isNl ? "Aan" : "Bill to"}
      </p>
      <p style="font-weight: 500;">${invoice.buyerName}</p>
      ${invoice.buyerIsBusiness && invoice.buyerCompany ? `<p>${invoice.buyerCompany}</p>` : ""}
      <p>${invoice.buyerEmail}</p>
      ${invoice.buyerVatNumber ? `<p>${isNl ? "BTW" : "VAT"}: ${invoice.buyerVatNumber}</p>` : ""}
    </div>
  </div>

  <!-- Line items -->
  <table style="margin-bottom: 24px;">
    <thead>
      <tr>
        <th>${isNl ? "Omschrijving" : "Description"}</th>
        <th>${isNl ? "Aantal" : "Qty"}</th>
        <th>${isNl ? "Prijs" : "Price"}</th>
        <th>${isNl ? "BTW" : "VAT"}</th>
        <th>${isNl ? "Totaal" : "Total"}</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="display: flex; justify-content: flex-end;">
    <div style="width: 280px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: rgba(14,12,10,0.6);">
        <span>${isNl ? "Subtotaal" : "Subtotal"}</span>
        <span>${formatEuro(invoice.subtotalCents)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: rgba(14,12,10,0.6); border-bottom: 1px solid #EDE9E2;">
        <span>${isNl ? "BTW" : "VAT"}</span>
        <span>${invoice.btwReversed ? (isNl ? "Verlegd" : "Reverse charged") : invoice.noBtw ? (isNl ? "N.v.t." : "N/A") : formatEuro(invoice.totalBtwCents)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; font-weight: 600;">
        <span>${isNl ? "Totaal" : "Total"}</span>
        <span>${formatEuro(invoice.totalCents)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: rgba(14,12,10,0.4);">
        <span>${isNl ? "Status" : "Status"}</span>
        <span style="color: #16a34a; font-weight: 500;">${isNl ? "Betaald" : "Paid"}</span>
      </div>
    </div>
  </div>

  ${invoice.btwReversed ? `
  <div style="margin-top: 32px; padding: 16px; background: #F7F4EF; font-size: 12px; color: rgba(14,12,10,0.5);">
    ${isNl ? "BTW verlegd conform artikel 196 EU BTW-richtlijn." : "VAT reverse charged under article 196 EU VAT Directive."}
  </div>
  ` : ""}

  <!-- Footer -->
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #EDE9E2; font-size: 11px; color: rgba(14,12,10,0.35); text-align: center;">
    <p>Klaas Kroezen B.V. · KVK 92622909 · BTW NL866276498B01</p>
    <p>www.klaaskroezen.nl · info@klaaskroezen.com</p>
  </div>
</body>
</html>`;
}
