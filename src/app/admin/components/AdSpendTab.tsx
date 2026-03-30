"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loading } from "./shared";

function formatEur(cents: number): string {
  return `\u20AC ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatCpc(spendCents: number, clicks: number): string {
  if (clicks === 0) return "—";
  return formatEur(Math.round(spendCents / clicks));
}

export function AdSpendTab() {
  const [days, setDays] = useState(30);
  const [platform, setPlatform] = useState<"all" | "linkedin" | "meta">("all");
  const summary = useQuery(api.adSpend.getSpendSummary);
  const daily = useQuery(api.adSpend.getDailySpend, { days, platform });

  if (!summary || !daily) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="LinkedIn deze maand" value={formatEur(summary.linkedin.thisMonth)} sub={`Vorige maand: ${formatEur(summary.linkedin.lastMonth)}`} />
        <Card label="Meta deze maand" value={formatEur(summary.meta.thisMonth)} sub={`Vorige maand: ${formatEur(summary.meta.lastMonth)}`} />
        <Card label="Totaal deze maand" value={formatEur(summary.combined.thisMonth)} sub={`Vorige maand: ${formatEur(summary.combined.lastMonth)}`} accent />
        <Card label="CPC gemiddeld" value={formatCpc(summary.linkedin.total + summary.meta.total, summary.linkedin.clicks + summary.meta.clicks)} sub={`LinkedIn: ${formatCpc(summary.linkedin.total, summary.linkedin.clicks)} · Meta: ${formatCpc(summary.meta.total, summary.meta.clicks)}`} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {([7, 14, 30, 90] as const).map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`text-[11px] px-2.5 py-1 rounded-[2px] cursor-pointer ${days === d ? "bg-copper text-paper" : "text-ink/40 hover:text-ink"}`}>
              {d}d
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "linkedin", "meta"] as const).map((p) => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`text-[11px] px-2.5 py-1 rounded-[2px] cursor-pointer ${platform === p ? "bg-ink text-paper" : "text-ink/40 hover:text-ink"}`}>
              {p === "all" ? "Alle" : p === "linkedin" ? "LinkedIn" : "Meta"}
            </button>
          ))}
        </div>
      </div>

      {/* Daily table */}
      {daily.length === 0 ? (
        <div className="border border-dashed border-rule rounded-[2px] p-8 text-center">
          <p className="text-[14px] text-ink/40">Geen ad spend data. Stel de API tokens in via Convex env vars.</p>
          <p className="text-[12px] text-ink/30 mt-2">LINKEDIN_ACCESS_TOKEN, LINKEDIN_AD_ACCOUNT_ID, META_ACCESS_TOKEN, META_AD_ACCOUNT_ID</p>
        </div>
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full min-w-[600px] text-[13px]">
            <thead className="border-b border-rule bg-warm/30">
              <tr>
                <Th>Datum</Th>
                <Th>Platform</Th>
                <Th align="right">Spend</Th>
                <Th align="right">Impressies</Th>
                <Th align="right">Clicks</Th>
                <Th align="right">CPC</Th>
                <Th align="right">CTR</Th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((row) => (
                <tr key={`${row.platform}-${row.date}`} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                  <td className="px-4 py-2.5 text-ink/70">{row.date}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[2px] ${row.platform === "linkedin" ? "bg-blue-50 text-blue-700" : "bg-indigo-50 text-indigo-700"}`}>
                      {row.platform === "linkedin" ? "LinkedIn" : "Meta"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatEur(row.spend)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink/50">{row.impressions.toLocaleString("nl-NL")}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink/50">{row.clicks.toLocaleString("nl-NL")}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink/50">{formatCpc(row.spend, row.clicks)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink/50">
                    {row.impressions > 0 ? `${((row.clicks / row.impressions) * 100).toFixed(2)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`border rounded-[2px] p-4 ${accent ? "border-copper bg-copper/5" : "border-rule"}`}>
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">{label}</p>
      <p className={`text-[20px] font-bold tabular-nums ${accent ? "text-copper" : "text-ink"}`}>{value}</p>
      {sub && <p className="text-[11px] text-ink/40 mt-1">{sub}</p>}
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return <th className={`px-4 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 ${align === "right" ? "text-right" : "text-left"}`}>{children}</th>;
}
