"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatPrice, StatCard, Loading } from "./shared";

export function DashboardTab() {
  const stats = useQuery(api.admin.getStats);
  if (!stats) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Totale omzet" value={formatPrice(stats.totalRevenue)} />
        <StatCard label="Deze maand" value={formatPrice(stats.monthRevenue)} sub={`${stats.monthOrders} bestellingen`} />
        <StatCard label="Deze week" value={formatPrice(stats.weekRevenue)} sub={`${stats.weekOrders} bestellingen`} />
        <StatCard label="Open winkelmandjes" value={String(stats.pendingCarts)} accent />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">Trainingen</p>
          <p className="font-display text-[24px] font-bold">{formatPrice(stats.trainingRevenue)}</p>
        </div>
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">Boeken</p>
          <p className="font-display text-[24px] font-bold">{formatPrice(stats.bookRevenue)}</p>
        </div>
      </div>
      <div className="border border-rule rounded-[2px] p-5">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">Totalen</p>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="font-display text-[28px] font-bold text-ink">{stats.totalOrders}</p>
            <p className="text-[12px] text-ink/40">Bestellingen</p>
          </div>
          <div>
            <p className="font-display text-[28px] font-bold text-ink">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-[12px] text-ink/40">Omzet</p>
          </div>
          <div>
            <p className="font-display text-[28px] font-bold text-copper">{stats.pendingCarts}</p>
            <p className="text-[12px] text-ink/40">Open winkelmandjes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
