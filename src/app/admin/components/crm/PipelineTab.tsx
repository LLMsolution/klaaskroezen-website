"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loading } from "../shared";
import { PipelineKanban } from "./PipelineKanban";
import { PipelineList } from "./PipelineList";
import { LeadDetailPanel } from "./LeadDetailPanel";
import { AddLeadForm } from "./AddLeadForm";
import { PipelineFilters, defaultFilters, type PipelineFilterState } from "./PipelineFilters";

export function PipelineTab() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [selectedLeadId, setSelectedLeadId] = useState<Id<"leads"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState<PipelineFilterState>(defaultFilters);

  const stages = useQuery(api.crmLeads.getLeadsByStage);
  const stats = useQuery(api.crmPipeline.getPipelineStats);
  const seedStages = useMutation(api.crmPipeline.seedDefaultStages);

  if (stages === undefined || stats === undefined) return <Loading />;

  // No stages yet — show seed button
  if (stages.length === 0) {
    return (
      <div className="border border-rule rounded-[2px] p-10 text-center">
        <p className="text-[15px] text-ink/60 mb-4">
          Geen pipeline stages gevonden. Maak de standaard pipeline aan om te beginnen.
        </p>
        <button
          onClick={() => seedStages()}
          className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
        >
          Pipeline aanmaken
        </button>
      </div>
    );
  }

  // Format values for display
  const fmtPrice = (cents: number) => `€ ${(cents / 100).toLocaleString("nl-NL", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatMini label="Open leads" value={String(stats.totalOpenLeads)} />
        <StatMini label="Pipeline waarde" value={fmtPrice(stats.totalPipelineValue)} />
        <StatMini label="Gewogen waarde" value={fmtPrice(stats.weightedPipelineValue)} accent />
        <StatMini label="Gewonnen (30d)" value={fmtPrice(stats.wonRevenue30d)} />
        <StatMini label="Win rate (30d)" value={`${stats.winRate}%`} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[2px] transition-colors cursor-pointer ${
              view === "kanban" ? "bg-copper text-paper" : "bg-warm text-ink/60 hover:text-ink"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[2px] transition-colors cursor-pointer ${
              view === "list" ? "bg-copper text-paper" : "bg-warm text-ink/60 hover:text-ink"
            }`}
          >
            Lijst
          </button>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
        >
          + Nieuwe lead
        </button>
      </div>

      {/* Filters */}
      <PipelineFilters filters={filters} onChange={setFilters} />

      {/* Content */}
      {view === "kanban" ? (
        <PipelineKanban
          stages={stages}
          filters={filters}
          onSelectLead={setSelectedLeadId}
        />
      ) : (
        <PipelineList
          stages={stages}
          filters={filters}
          onSelectLead={setSelectedLeadId}
        />
      )}

      {/* Lead detail slide-over */}
      {selectedLeadId && (
        <LeadDetailPanel
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}

      {/* Add lead form */}
      {showAddForm && (
        <AddLeadForm onClose={() => setShowAddForm(false)} />
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
