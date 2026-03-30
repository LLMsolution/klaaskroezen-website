"use client";

import type { Id } from "../../../../../convex/_generated/dataModel";
import { Th } from "../shared";
import { StageBadge, AssigneeBadge, LeadStatusBadge, formatPrice, formatDate } from "./shared";
import { applyPipelineFilters, type PipelineFilterState } from "./PipelineFilters";

type StageWithLeads = {
  _id: Id<"pipelineStages">;
  name: string;
  color: string;
  leads: Array<{
    _id: Id<"leads">;
    title: string;
    valueCents?: number;
    probability: number;
    assignedTo?: string;
    source?: string;
    status: "open" | "won" | "lost";
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

export function PipelineList({ stages, filters, onSelectLead }: Props) {
  // Flatten all leads from all stages
  const allLeads = stages.flatMap((stage) =>
    stage.leads.map((lead) => ({
      ...lead,
      stageName: stage.name,
      stageColor: stage.color,
    })),
  );

  // Apply filters
  const filtered = applyPipelineFilters(allLeads, filters);

  // Sort by creation date desc
  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  if (sorted.length === 0) {
    return (
      <div className="border border-rule rounded-[2px] p-10 text-center">
        <p className="text-[14px] text-ink/40">Geen leads gevonden</p>
      </div>
    );
  }

  return (
    <div className="border border-rule rounded-[2px] overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-rule">
          <tr>
            <Th>Lead</Th>
            <Th>Contact</Th>
            <Th>Fase</Th>
            <Th>Waarde</Th>
            <Th>Eigenaar</Th>
            <Th>Status</Th>
            <Th>Datum</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((lead) => (
            <tr
              key={lead._id}
              onClick={() => onSelectLead(lead._id)}
              className="border-b border-rule last:border-b-0 hover:bg-warm/30 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <p className="text-[13px] font-medium">{lead.title}</p>
                {lead.nextAction && (
                  <p className="text-[11px] text-ink/40 mt-0.5">
                    Volgende: {lead.nextAction}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                {lead.contact ? (
                  <div>
                    <p className="text-[13px]">
                      {lead.contact.firstName} {lead.contact.lastName}
                    </p>
                    <p className="text-[11px] text-ink/40">
                      {lead.contact.company ?? lead.contact.email}
                    </p>
                  </div>
                ) : (
                  <span className="text-[12px] text-ink/30">--</span>
                )}
              </td>
              <td className="px-4 py-3">
                <StageBadge name={lead.stageName} color={lead.stageColor} />
              </td>
              <td className="px-4 py-3 text-[13px]">
                {lead.valueCents ? formatPrice(lead.valueCents) : "--"}
              </td>
              <td className="px-4 py-3">
                <AssigneeBadge email={lead.assignedTo} />
              </td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-[12px] text-ink/50">
                {formatDate(lead.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
