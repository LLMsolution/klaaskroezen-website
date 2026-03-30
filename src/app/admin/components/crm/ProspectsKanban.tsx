"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { AssigneeBadge, formatPrice } from "./shared";

type MonthColumn = {
  key: string;
  label: string;
  start: number;
  weightedValue: number;
  count: number;
  leads: Array<{
    _id: Id<"leads">;
    title: string;
    valueCents?: number;
    probability: number;
    assignedTo?: string;
    expectedCloseAt?: number;
    contact: {
      firstName: string;
      lastName?: string;
      email: string;
      company?: string;
    } | null;
    stageName: string;
    stageColor: string;
  }>;
};

type Props = {
  months: MonthColumn[];
  filterAssignee: string;
  onSelectLead: (id: Id<"leads">) => void;
};

export function ProspectsKanban({ months, filterAssignee, onSelectLead }: Props) {
  const moveLeadToMonth = useMutation(api.crmLeads.moveLeadToMonth);
  const [dragOverMonth, setDragOverMonth] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, monthKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverMonth(monthKey);
  }

  function handleDragLeave() {
    setDragOverMonth(null);
  }

  async function handleDrop(e: React.DragEvent, month: MonthColumn) {
    e.preventDefault();
    setDragOverMonth(null);
    const leadId = e.dataTransfer.getData("text/plain") as Id<"leads">;
    if (leadId) {
      await moveLeadToMonth({ leadId, expectedCloseAt: month.start });
    }
  }

  return (
    <div className="flex gap-4 pb-4 min-h-[500px]">
      {months.map((month) => {
        const filteredLeads = filterAssignee
          ? month.leads.filter((l) =>
              l.assignedTo?.toLowerCase().includes(filterAssignee.toLowerCase()),
            )
          : month.leads;

        const filteredWeighted = filteredLeads.reduce(
          (sum, l) => sum + Math.round((l.valueCents ?? 0) * l.probability / 100),
          0,
        );

        return (
          <div
            key={month.key}
            className={`flex-1 min-w-[200px] rounded-[2px] border transition-colors ${
              dragOverMonth === month.key ? "border-copper bg-copper/5" : "border-rule bg-paper"
            }`}
            onDragOver={(e) => handleDragOver(e, month.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, month)}
          >
            {/* Column header */}
            <div className="px-4 py-3 border-b border-rule">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium capitalize">{month.label}</span>
                <span className="text-[11px] text-ink/40 font-medium">{filteredLeads.length}</span>
              </div>
              <p className="text-[12px] font-medium text-copper">
                {formatPrice(filteredWeighted)}
              </p>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[100px]">
              {filteredLeads.map((lead) => {
                const weighted = Math.round((lead.valueCents ?? 0) * lead.probability / 100);
                return (
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
                      <div className="flex items-center gap-2">
                        {lead.valueCents ? (
                          <span className="text-[12px] text-ink/40">
                            {formatPrice(lead.valueCents)}
                          </span>
                        ) : null}
                        <span className="text-[12px] font-medium text-copper">
                          {formatPrice(weighted)}
                        </span>
                      </div>
                      <AssigneeBadge email={lead.assignedTo} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-[2px]"
                        style={{ backgroundColor: `${lead.stageColor}15`, color: lead.stageColor }}
                      >
                        {lead.stageName}
                      </span>
                      <span className="text-[11px] text-ink/40">{lead.probability}%</span>
                    </div>
                  </div>
                );
              })}
              {filteredLeads.length === 0 && (
                <p className="text-[12px] text-ink/20 text-center py-6">Geen prospects</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
