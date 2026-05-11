"use node";

import React from "react";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const COPPER = "#B5622A";
const INK = "#0E0C0A";
const INK_MUTED = "#8A847E";
const BORDER = "#E8E4DD";

const styles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 52,
    paddingHorizontal: 52,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.5,
    backgroundColor: "#FFFFFF",
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: COPPER,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  sellerBlock: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 4,
  },
  sellerDetail: {
    fontSize: 9,
    color: INK_MUTED,
    lineHeight: 1.6,
  },
  invoiceMetaBlock: {
    alignItems: "flex-end",
  },
  metaLabel: {
    fontSize: 8,
    color: INK_MUTED,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 10,
    color: INK,
    marginTop: 1,
    marginBottom: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: INK_MUTED,
    marginBottom: 6,
  },
  buyerName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 2,
  },
  buyerDetail: {
    fontSize: 9,
    color: INK_MUTED,
    lineHeight: 1.6,
  },
  buyerSection: {
    marginBottom: 28,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: INK,
    paddingBottom: 6,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: INK_MUTED,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingTop: 7,
    paddingBottom: 7,
  },
  colDescription: { flex: 3 },
  colQty: { width: 30, textAlign: "right" },
  colUnitPrice: { width: 70, textAlign: "right" },
  colBtw: { width: 40, textAlign: "right" },
  colTotal: { width: 70, textAlign: "right" },
  cellText: {
    fontSize: 10,
    color: INK,
  },
  cellTextMuted: {
    fontSize: 10,
    color: INK_MUTED,
  },
  totalsSection: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
    width: 200,
  },
  totalsLabel: {
    fontSize: 10,
    color: INK_MUTED,
    flex: 1,
  },
  totalsValue: {
    fontSize: 10,
    color: INK,
    textAlign: "right",
    width: 80,
  },
  totalsDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: INK,
    marginBottom: 6,
    width: 200,
    marginLeft: "auto",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: INK,
    flex: 1,
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "right",
    width: 80,
  },
  btwNote: {
    fontSize: 8,
    color: COPPER,
    textAlign: "right",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 52,
    right: 52,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: INK_MUTED,
    lineHeight: 1.6,
  },
});

function formatEuro(cents: number): string {
  const sign = cents < 0 ? "−" : "";
  const abs = Math.abs(cents) / 100;
  return `${sign}€ ${abs.toFixed(2).replace(".", ",")}`;
}

function formatDate(ts: number, lang: "nl" | "en" | "de"): string {
  const locale = lang === "nl" ? "nl-NL" : lang === "de" ? "de-DE" : "en-GB";
  return new Date(ts).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Seller = {
  sellerName: string;
  sellerAddress: string;
  sellerPostalCity: string;
  sellerKvk: string;
  sellerBtw: string;
  sellerIban: string;
  sellerEmail: string;
};

type LineItem = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  btwRate: number;
  btwCents: number;
  totalCents: number;
};

type Invoice = {
  invoiceNumber: string;
  paidAt: number;
  createdAt: number;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  buyerVatNumber?: string;
  buyerCountry: string;
  buyerIsBusiness: boolean;
  lineItems: LineItem[];
  subtotalCents: number;
  totalBtwCents: number;
  totalCents: number;
  btwReversed: boolean;
  noBtw: boolean;
  lang: "nl" | "en" | "de";
};

const T = {
  nl: {
    invoice: "FACTUUR",
    invoiceNumber: "Factuurnummer",
    invoiceDate: "Factuurdatum",
    billTo: "Factuuradres",
    description: "Omschrijving",
    qty: "Aant.",
    unitPrice: "Prijs excl.",
    btw: "BTW",
    total: "Totaal",
    subtotal: "Subtotaal excl. BTW",
    totalBtw: "BTW",
    grandTotal: "Totaal incl. BTW",
    btwReversed: "BTW verlegd",
    noBtw: "Geen BTW (buiten EU)",
    kvk: "KVK",
    iban: "IBAN",
  },
  en: {
    invoice: "INVOICE",
    invoiceNumber: "Invoice number",
    invoiceDate: "Invoice date",
    billTo: "Bill to",
    description: "Description",
    qty: "Qty",
    unitPrice: "Unit price excl.",
    btw: "VAT",
    total: "Total",
    subtotal: "Subtotal excl. VAT",
    totalBtw: "VAT",
    grandTotal: "Total incl. VAT",
    btwReversed: "VAT reverse charged",
    noBtw: "No VAT (outside EU)",
    kvk: "CoC",
    iban: "IBAN",
  },
  de: {
    invoice: "RECHNUNG",
    invoiceNumber: "Rechnungsnummer",
    invoiceDate: "Rechnungsdatum",
    billTo: "Rechnungsadresse",
    description: "Beschreibung",
    qty: "Anz.",
    unitPrice: "Preis exkl.",
    btw: "MwSt.",
    total: "Gesamt",
    subtotal: "Zwischensumme exkl. MwSt.",
    totalBtw: "MwSt.",
    grandTotal: "Gesamt inkl. MwSt.",
    btwReversed: "Steuerschuldumkehr",
    noBtw: "Keine MwSt. (außerhalb EU)",
    kvk: "HRB",
    iban: "IBAN",
  },
} as const;

function buildInvoiceDoc(invoice: Invoice, seller: Seller): React.ReactElement {
  const lang = invoice.lang ?? "nl";
  const t = T[lang];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Eyebrow */}
        <Text style={styles.eyebrow}>{t.invoice}</Text>

        {/* Header: seller (left) + invoice meta (right) */}
        <View style={styles.headerRow}>
          <View style={styles.sellerBlock}>
            <Text style={styles.sellerName}>{seller.sellerName || "Klaas Kroezen"}</Text>
            {seller.sellerAddress ? <Text style={styles.sellerDetail}>{seller.sellerAddress}</Text> : null}
            {seller.sellerPostalCity ? <Text style={styles.sellerDetail}>{seller.sellerPostalCity}</Text> : null}
            {seller.sellerEmail ? <Text style={styles.sellerDetail}>{seller.sellerEmail}</Text> : null}
          </View>
          <View style={styles.invoiceMetaBlock}>
            <Text style={styles.metaLabel}>{t.invoiceNumber}</Text>
            <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            <Text style={styles.metaLabel}>{t.invoiceDate}</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.paidAt, lang)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill to */}
        <View style={styles.buyerSection}>
          <Text style={styles.sectionLabel}>{t.billTo}</Text>
          <Text style={styles.buyerName}>{invoice.buyerName}</Text>
          {invoice.buyerCompany ? <Text style={styles.buyerDetail}>{invoice.buyerCompany}</Text> : null}
          <Text style={styles.buyerDetail}>{invoice.buyerEmail}</Text>
          <Text style={styles.buyerDetail}>{invoice.buyerCountry}</Text>
          {invoice.buyerVatNumber ? <Text style={styles.buyerDetail}>BTW: {invoice.buyerVatNumber}</Text> : null}
        </View>

        {/* Line items table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>{t.description}</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>{t.qty}</Text>
          <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>{t.unitPrice}</Text>
          <Text style={[styles.tableHeaderText, styles.colBtw]}>{t.btw} %</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>{t.total}</Text>
        </View>

        {invoice.lineItems.map((item, i) => {
          const isDiscount = item.totalCents < 0;
          return (
            <View key={i} style={styles.tableRow}>
              <Text style={[isDiscount ? styles.cellTextMuted : styles.cellText, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cellText, styles.colUnitPrice]}>{formatEuro(item.unitPriceCents)}</Text>
              <Text style={[styles.cellText, styles.colBtw]}>{item.btwRate > 0 ? `${item.btwRate}%` : "—"}</Text>
              <Text style={[isDiscount ? styles.cellTextMuted : styles.cellText, styles.colTotal]}>{formatEuro(item.totalCents)}</Text>
            </View>
          );
        })}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{t.subtotal}</Text>
            <Text style={styles.totalsValue}>{formatEuro(invoice.subtotalCents)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              {invoice.btwReversed ? t.btwReversed : invoice.noBtw ? t.noBtw : t.totalBtw}
            </Text>
            <Text style={styles.totalsValue}>
              {invoice.btwReversed || invoice.noBtw ? "—" : formatEuro(invoice.totalBtwCents)}
            </Text>
          </View>
          <View style={styles.totalsDivider} />
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>{t.grandTotal}</Text>
            <Text style={styles.grandTotalValue}>{formatEuro(invoice.totalCents)}</Text>
          </View>
          {invoice.btwReversed && (
            <Text style={styles.btwNote}>{t.btwReversed}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            {seller.sellerKvk ? <Text style={styles.footerText}>{t.kvk}: {seller.sellerKvk}</Text> : null}
            {seller.sellerBtw ? <Text style={styles.footerText}>BTW: {seller.sellerBtw}</Text> : null}
          </View>
          {seller.sellerIban ? (
            <Text style={styles.footerText}>{t.iban}: {seller.sellerIban}</Text>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

export const generateAndAttachInvoicePdf = internalAction({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, { invoiceId }): Promise<{ storageId: string }> => {
    const [invoice, seller] = await Promise.all([
      ctx.runQuery(internal.invoices.getInvoice, { invoiceId }),
      ctx.runQuery(internal.settings.getSellerInfo, {}),
    ]);

    if (!invoice) throw new Error("Invoice not found");

    const lang: "nl" | "en" | "de" =
      invoice.lang === "nl" || invoice.lang === "de" ? invoice.lang : "en";

    const doc = buildInvoiceDoc({ ...invoice, lang }, seller);
    const buffer = await renderToBuffer(doc);
    const blob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(internal.invoices.attachPdf, { invoiceId, pdfStorageId: storageId });

    return { storageId: storageId as string };
  },
});
