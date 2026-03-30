"use client";

import { useState } from "react";

type Order = {
  paidAt?: string;
  product: string;
  quantity: number;
  amount: number;
  company?: string;
  firstName: string;
  lastName: string;
  email: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  source: string;
};

export function ExportButtons({ orders }: { orders: Order[] }) {
  const [exporting, setExporting] = useState<string | null>(null);

  async function doExport(type: "excel" | "csv" | "pdf") {
    if (orders.length === 0) return;
    setExporting(type);
    try {
      let url: string;
      let body: string;

      if (type === "excel") {
        url = "/api/export/excel";
        body = JSON.stringify({
          orders: orders.map((o) => ({
            company: o.company ?? "",
            firstName: o.firstName,
            lastName: o.lastName,
            street: o.street ?? "",
            houseNumber: o.houseNumber ?? "",
            postalCode: o.postalCode ?? "",
            city: o.city ?? "",
            countryCode: o.countryCode ?? "NL",
            email: o.email,
            quantity: o.quantity,
          })),
        });
      } else if (type === "csv") {
        url = "/api/export/csv";
        body = JSON.stringify({
          orders: orders.map((o) => ({
            paidAt: o.paidAt ?? "",
            product: o.product,
            quantity: o.quantity,
            amount: o.amount,
            company: o.company ?? "",
            firstName: o.firstName,
            lastName: o.lastName,
            email: o.email,
            city: o.city ?? "",
            source: o.source,
          })),
        });
      } else {
        url = "/api/export/pdf";
        body = JSON.stringify({
          labels: orders.flatMap((o) =>
            Array.from({ length: o.quantity }, () => ({
              name: `${o.firstName} ${o.lastName}`,
              company: o.company ?? "",
              street: o.street ?? "",
              houseNumber: o.houseNumber ?? "",
              postalCode: o.postalCode ?? "",
              city: o.city ?? "",
              countryCode: o.countryCode ?? "NL",
            })),
          ),
        });
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Export mislukt");

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? `export.${type}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("Export mislukt. Probeer opnieuw.");
    } finally {
      setExporting(null);
    }
  }

  const btnClass = "text-[11px] px-3 py-1.5 border border-rule rounded-[2px] text-ink/50 hover:text-ink hover:border-ink/30 transition-colors cursor-pointer disabled:opacity-40";

  return (
    <div className="flex gap-2">
      <button onClick={() => doExport("excel")} disabled={!!exporting || orders.length === 0} className={btnClass}>
        {exporting === "excel" ? "..." : "Excel"}
      </button>
      <button onClick={() => doExport("csv")} disabled={!!exporting || orders.length === 0} className={btnClass}>
        {exporting === "csv" ? "..." : "CSV"}
      </button>
      <button onClick={() => doExport("pdf")} disabled={!!exporting || orders.length === 0} className={btnClass}>
        {exporting === "pdf" ? "..." : "PDF labels"}
      </button>
    </div>
  );
}
