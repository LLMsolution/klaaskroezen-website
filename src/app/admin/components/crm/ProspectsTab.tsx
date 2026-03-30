"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loading } from "../shared";
import { ProspectsKanban } from "./ProspectsKanban";
import { LeadDetailPanel } from "./LeadDetailPanel";
import { formatPrice } from "./shared";

export function ProspectsTab() {
  const [selectedLeadId, setSelectedLeadId] = useState<Id<"leads"> | null>(null);
  const [filterAssignee, setFilterAssignee] = useState("");

  const months = useQuery(api.crmLeads.getLeadsByMonth);

  if (months === undefined) return <Loading />;

  // Aggregate stats
  const totalWeighted = months.reduce((sum, m) => sum + m.weightedValue, 0);
  const totalProspects = months.reduce((sum, m) => sum + m.count, 0);
  const allLeads = months.flatMap((m) => m.leads);
  const avgProbability = totalProspects > 0
    ? Math.round(allLeads.reduce((sum, l) => sum + l.probability, 0) / totalProspects)
    : 0;
  const highestValue = allLeads.length > 0
    ? Math.max(...allLeads.map((l) => l.valueCents ?? 0))
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMini label="Gewogen pipeline" value={formatPrice(totalWeighted)} accent />
        <StatMini label="Prospects" value={String(totalProspects)} />
        <StatMini label="Gem. kans" value={`${avgProbability}%`} />
        <StatMini label="Hoogste deal" value={highestValue > 0 ? formatPrice(highestValue) : "—"} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Filter op eigenaar..."
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-3 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent w-[200px]"
        />
      </div>

      {/* Kanban */}
      <ProspectsKanban
        months={months}
        filterAssignee={filterAssignee}
        onSelectLead={setSelectedLeadId}
      />

      {/* Lead detail slide-over */}
      {selectedLeadId && (
        <LeadDetailPanel
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}

function StatMini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-rule rounded-[2px] p-4">
      <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-1">{label}</p>
      <p className={`font-display text-[20px] font-black tracking-[-0.02em] ${accent ? "text-copper" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
