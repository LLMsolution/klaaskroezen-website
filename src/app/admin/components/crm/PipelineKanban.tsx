"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { AssigneeBadge, ScoreBadge, formatPrice, formatRelative } from "./shared";
import { applyPipelineFilters, type PipelineFilterState } from "./PipelineFilters";

type StageWithLeads = {
  _id: Id<"pipelineStages">;
  name: string;
  color: string;
  order: number;
  count: number;
  totalValue: number;
  leads: Array<{
    _id: Id<"leads">;
    title: string;
    valueCents?: number;
    probability: number;
    assignedTo?: string;
    source?: string;
    nextAction?: string;
    nextActionAt?: number;
    createdAt: number;
    contact: {
      firstName: string;
      lastName?: string;
      email: string;
      company?: string;
      engagementScore: number;
      intentScore: number;
    } | null;
  }>;
};

type Props = {
  stages: StageWithLeads[];
  filters: PipelineFilterState;
  onSelectLead: (id: Id<"leads">) => void;
};

export function PipelineKanban({ stages, filters, onSelectLead }: Props) {
  const moveLead = useMutation(api.crmLeads.moveLead);
  const [dragOverStage, setDragOverStage] = useState<Id<"pipelineStages"> | null>(null);

  // Filter out won/lost stages from kanban (they're terminal)
  const activeStages = stages.filter((s) => s.order <= 4);

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, stageId: Id<"pipelineStages">) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  async function handleDrop(e: React.DragEvent, newStageId: Id<"pipelineStages">) {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData("text/plain") as Id<"leads">;
    if (leadId) {
      await moveLead({ leadId, newStageId });
    }
  }

  return (
    <div className="flex gap-4 pb-4 min-h-[500px]">
      {activeStages.map((stage) => {
        const filteredLeads = applyPipelineFilters(stage.leads, filters);

        return (
          <div
            key={stage._id}
            className={`flex-1 min-w-[200px] rounded-[2px] border transition-colors ${
              dragOverStage === stage._id ? "border-copper bg-copper/5" : "border-rule bg-paper"
            }`}
            onDragOver={(e) => handleDragOver(e, stage._id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage._id)}
          >
            {/* Column header */}
            <div className="px-4 py-3 border-b border-rule">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-[13px] font-medium">{stage.name}</span>
                </div>
                <span className="text-[11px] text-ink/40 font-medium">{filteredLeads.length}</span>
              </div>
              {stage.totalValue > 0 && (
                <p className="text-[11px] text-ink/40">{formatPrice(stage.totalValue)}</p>
              )}
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[100px]">
              {filteredLeads.map((lead) => (
                <div
                  key={lead._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead._id)}
                  onClick={() => onSelectLead(lead._id)}
                  className="bg-paper border border-rule rounded-[2px] p-3 cursor-pointer hover:border-copper/40 transition-colors"
                >
                  <p className="text-[13px] font-medium mb-1 truncate">{lead.title}</p>
                  {lead.contact && (
                    <p className="text-[11px] text-ink/50 mb-2 truncate">
                      {lead.contact.firstName} {lead.contact.lastName}
                      {lead.contact.company && ` — ${lead.contact.company}`}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {lead.valueCents ? (
                      <span className="text-[12px] font-medium text-copper">
                        {formatPrice(lead.valueCents)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <AssigneeBadge email={lead.assignedTo} />
                  </div>
                  {lead.contact && (lead.contact.intentScore > 0 || lead.contact.engagementScore > 0) && (
                    <div className="flex gap-1 mt-2">
                      {lead.contact.intentScore > 0 && (
                        <ScoreBadge label="I" score={lead.contact.intentScore} type="intent" />
                      )}
                      {lead.contact.engagementScore > 0 && (
                        <ScoreBadge label="E" score={lead.contact.engagementScore} type="engagement" />
                      )}
                    </div>
                  )}
                  {lead.nextAction && (
                    <p className="text-[10px] text-ink/40 mt-2 truncate">
                      Volgende: {lead.nextAction}
                      {lead.nextActionAt && ` — ${formatRelative(lead.nextActionAt)}`}
                    </p>
                  )}
                </div>
              ))}
              {filteredLeads.length === 0 && (
                <p className="text-[12px] text-ink/20 text-center py-6">Geen leads</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
