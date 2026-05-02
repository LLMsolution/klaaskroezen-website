"use client";

export { PRODUCT_NAMES, useProductNames } from "@/lib/product-names";

export function formatPrice(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="border border-rule rounded-[2px] p-5">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2">{label}</p>
      <p className={`font-display text-[26px] font-black tracking-[-0.02em] ${accent ? "text-copper" : "text-ink"}`}>{value}</p>
      {sub && <p className="text-[12px] text-ink/40 mt-1">{sub}</p>}
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">
      {children}
    </th>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-600",
    refunded: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-[2px] ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export function EmailStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    sent: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-600",
    queued: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-[2px] ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-ink/30 text-[14px]">Laden...</div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-rule rounded-[2px] p-10 text-center">
      <p className="text-[14px] text-ink/40">{text}</p>
    </div>
  );
}
