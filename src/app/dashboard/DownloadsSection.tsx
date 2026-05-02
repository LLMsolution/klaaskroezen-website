"use client";

import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { useProductNames } from "@/lib/product-names";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" });
}

function formatPrice(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

type Download = { url: string; fileName: string; product: string; fileType: string; format?: "epub" | "pdf" };
type Invoice = { _id: string; invoiceNumber: string; paidAt: number; totalCents: number; purchaseId: string };

const COPY: Record<Lang, { downloads: string; invoices: string; view: string }> = {
  nl: { downloads: "Downloads", invoices: "Facturen", view: "Bekijken" },
  en: { downloads: "Downloads", invoices: "Invoices", view: "View" },
  de: { downloads: "Downloads", invoices: "Rechnungen", view: "Ansehen" },
};

export function DownloadsSection({
  downloads,
  invoices,
  lang,
}: {
  downloads: Download[] | undefined;
  invoices: Invoice[] | undefined;
  lang: Lang;
}) {
  const copy = COPY[lang];
  const PRODUCT_NAMES = useProductNames(lang, "name");
  const hasDownloads = downloads && downloads.length > 0;
  const hasInvoices = invoices && invoices.length > 0;

  return (
    <>
      {hasDownloads && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">{copy.downloads}</h2>
          <div className="space-y-2">
            {downloads.map((file) => (
              <a
                key={file.url}
                href={file.url}
                download={file.fileName}
                className="flex items-center justify-between p-4 border border-rule rounded-[2px] hover:border-copper/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[2px] bg-copper/10 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors">{file.fileName}</p>
                      {file.format && (
                        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-copper/80 border border-copper/30 px-1.5 py-0.5 rounded-[2px]">
                          {file.format}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-ink/40">{PRODUCT_NAMES[file.product] || file.product}</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/30 group-hover:text-copper transition-colors">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      )}

      {hasInvoices && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">{copy.invoices}</h2>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice._id} className="flex items-center justify-between p-4 border border-rule rounded-[2px]">
                <div>
                  <p className="text-[14px] font-medium text-ink">{invoice.invoiceNumber}</p>
                  <p className="text-[12px] text-ink/40">{formatDate(invoice.paidAt)} · {formatPrice(invoice.totalCents)}</p>
                </div>
                <Link
                  href={`/api/invoice/${invoice.purchaseId}`}
                  target="_blank"
                  className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors"
                >
                  {copy.view}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
