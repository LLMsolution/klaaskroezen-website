"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatPrice, StatCard, Loading } from "./shared";
import { RevenueChart } from "./dashboard/RevenueChart";
import { SourceBreakdown } from "./dashboard/SourceBreakdown";

export function DashboardTab() {
  const stats = useQuery(api.admin.getStats);
  const bolStats = useQuery(api.bolOrders.getStats);
  const adSummary = useQuery(api.adSpend.getSpendSummary);
  const [chartDays, setChartDays] = useState(30);
  const dailyRevenue = useQuery(api.admin.getDailyRevenue, { days: chartDays });
  const breakdown = useQuery(api.admin.getRevenueBreakdown);

  if (!stats) return <Loading />;

  const bolRevenue = bolStats?.totalRevenue ?? 0;
  const combinedRevenue = stats.totalRevenue + bolRevenue;
  const adSpendMonth = adSummary?.combined.thisMonth ?? 0;

  return (
    <div className="space-y-8">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Totale omzet" value={formatPrice(combinedRevenue)} sub={`Mollie: ${formatPrice(stats.totalRevenue)} · Bol.com: ${formatPrice(bolRevenue)}`} />
        <StatCard label="Deze maand" value={formatPrice(stats.monthRevenue + (bolStats?.monthRevenue ?? 0))} sub={`${stats.monthOrders + (bolStats?.monthOrders ?? 0)} bestellingen`} />
        <StatCard label="Ad spend (maand)" value={formatPrice(adSpendMonth)} sub={adSummary ? `LinkedIn: ${formatPrice(adSummary.linkedin.thisMonth)} · Meta: ${formatPrice(adSummary.meta.thisMonth)}` : undefined} />
        <StatCard label="Open winkelmandjes" value={String(stats.pendingCarts)} accent />
      </div>

      {/* Revenue by product type */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-1">Trainingen</p>
          <p className="font-display text-[22px] font-bold">{formatPrice(stats.trainingRevenue)}</p>
        </div>
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-1">Boeken</p>
          <p className="font-display text-[22px] font-bold">{formatPrice(stats.bookRevenue + bolRevenue)}</p>
        </div>
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-1">Netto (na ads)</p>
          <p className="font-display text-[22px] font-bold text-copper">{formatPrice(combinedRevenue - (adSummary?.combined.total ?? 0))}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {([7, 14, 30, 90] as const).map((d) => (
            <button key={d} onClick={() => setChartDays(d)}
              className={`text-[11px] px-2.5 py-1 rounded-[2px] cursor-pointer ${chartDays === d ? "bg-copper text-paper" : "text-ink/40 hover:text-ink"}`}>
              {d}d
            </button>
          ))}
        </div>
        {dailyRevenue && (
          <RevenueChart
            data={dailyRevenue.map((d: { date: string; total: number }) => ({ date: d.date, amount: d.total }))}
            label={`Omzet per dag (${chartDays} dagen)`}
          />
        )}
      </div>

      {/* Source breakdown */}
      {breakdown && (
        <div className="grid sm:grid-cols-2 gap-4">
          <SourceBreakdown data={breakdown.bySource} />
          <SourceBreakdown data={breakdown.byType} />
        </div>
      )}
    </div>
  );
}
