"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loading } from "../shared";
import {
  StageBadge, AssigneeBadge, LeadStatusBadge, ScoreBadge,
  formatPrice, formatDate, formatDateTime, formatRelative, ActivityIcon,
} from "./shared";
import { AddNoteForm } from "./AddNoteForm";

type Props = {
  leadId: Id<"leads">;
  onClose: () => void;
};

export function LeadDetailPanel({ leadId, onClose }: Props) {
  const lead = useQuery(api.crmLeads.getLeadById, { leadId });
  const stages = useQuery(api.crmPipeline.getStages);
  const moveLead = useMutation(api.crmLeads.moveLead);
  const winLead = useMutation(api.crmLeads.winLead);
  const loseLead = useMutation(api.crmLeads.loseLead);
  const updateLead = useMutation(api.crmLeads.updateLead);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [nextAction, setNextAction] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [showLostForm, setShowLostForm] = useState(false);

  if (lead === undefined || stages === undefined) {
    return <SlideOver onClose={onClose}><Loading /></SlideOver>;
  }

  if (!lead) {
    return <SlideOver onClose={onClose}><p className="text-ink/40 p-6">Lead niet gevonden</p></SlideOver>;
  }

  const openStages = stages.filter((s) => s.slug !== "gewonnen" && s.slug !== "verloren");

  return (
    <SlideOver onClose={onClose}>
      <div className="p-6 space-y-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-[22px] font-black tracking-[-0.02em]">
              {lead.title}
            </h2>
            {lead.contact && (
              <p className="text-[14px] text-ink/60 mt-1">
                {lead.contact.firstName} {lead.contact.lastName}
                {lead.contact.company && ` — ${lead.contact.company}`}
              </p>
            )}
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="Fase">
            {lead.stage && <StageBadge name={lead.stage.name} color={lead.stage.color} />}
          </InfoItem>
          <InfoItem label="Waarde">
            <span className="text-[14px] font-medium">
              {lead.valueCents ? formatPrice(lead.valueCents) : "—"}
            </span>
          </InfoItem>
          <InfoItem label="Eigenaar">
            <AssigneeBadge email={lead.assignedTo} />
          </InfoItem>
          <InfoItem label="Kans">
            <span className="text-[14px]">{lead.probability}%</span>
          </InfoItem>
          {lead.contact && (
            <>
              <InfoItem label="Intent score">
                <ScoreBadge label="Intent" score={lead.contact.intentScore} type="intent" />
              </InfoItem>
              <InfoItem label="Engagement">
                <ScoreBadge label="Engagement" score={lead.contact.engagementScore} type="engagement" />
              </InfoItem>
            </>
          )}
          <InfoItem label="Aangemaakt">{formatDate(lead.createdAt)}</InfoItem>
          {lead.nextAction && (
            <InfoItem label="Volgende actie">
              <span className="text-[13px]">{lead.nextAction}</span>
            </InfoItem>
          )}
        </div>

        {/* Contact info */}
        {lead.contact && (
          <div className="border border-rule rounded-[2px] p-4">
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-2">Contact</p>
            <p className="text-[13px]">{lead.contact.email}</p>
            {lead.contact.phone && <p className="text-[13px] text-ink/60">{lead.contact.phone}</p>}
          </div>
        )}

        {/* Actions */}
        {lead.status === "open" && (
          <div className="space-y-3">
            {/* Move stage */}
            <div>
              <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 block mb-1">
                Verplaats naar fase
              </label>
              <div className="flex flex-wrap gap-1.5">
                {openStages.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => moveLead({ leadId, newStageId: s._id })}
                    disabled={s._id === lead.stageId}
                    className={`px-2.5 py-1 text-[11px] rounded-[2px] border transition-colors cursor-pointer ${
                      s._id === lead.stageId
                        ? "border-copper bg-copper/10 text-copper"
                        : "border-rule hover:border-copper/40"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Next action */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Volgende actie..."
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="flex-1 px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
              />
              <button
                onClick={() => {
                  if (nextAction.trim()) {
                    updateLead({
                      leadId,
                      nextAction: nextAction.trim(),
                      nextActionAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                    });
                    setNextAction("");
                  }
                }}
                className="px-3 py-2 text-[12px] bg-warm hover:bg-warm/80 rounded-[2px] transition-colors cursor-pointer"
              >
                Opslaan
              </button>
            </div>

            {/* Win / Lose buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => winLead({ leadId })}
                className="flex-1 px-3 py-2 text-[12px] font-medium bg-green-50 text-green-700 rounded-[2px] hover:bg-green-100 transition-colors cursor-pointer"
              >
                Gewonnen
              </button>
              <button
                onClick={() => setShowLostForm(!showLostForm)}
                className="flex-1 px-3 py-2 text-[12px] font-medium bg-red-50 text-red-600 rounded-[2px] hover:bg-red-100 transition-colors cursor-pointer"
              >
                Verloren
              </button>
            </div>

            {showLostForm && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Reden (optioneel)..."
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="flex-1 px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                />
                <button
                  onClick={() => {
                    loseLead({ leadId, reason: lostReason || undefined });
                    setShowLostForm(false);
                  }}
                  className="px-3 py-2 text-[12px] bg-red-600 text-white rounded-[2px] hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Bevestig
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add note */}
        <div>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="text-[12px] font-medium text-copper hover:text-copper-light transition-colors cursor-pointer"
          >
            + Notitie toevoegen
          </button>
          {showNoteForm && (
            <AddNoteForm leadId={leadId} onDone={() => setShowNoteForm(false)} />
          )}
        </div>

        {/* Timeline */}
        <div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-3">
            Timeline
          </p>
          {lead.activities.length === 0 ? (
            <p className="text-[13px] text-ink/30">Nog geen activiteit</p>
          ) : (
            <div className="space-y-3">
              {lead.activities.map((activity) => (
                <div key={activity._id} className="flex gap-3">
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px]">{activity.title}</p>
                    {activity.description && (
                      <p className="text-[12px] text-ink/50 mt-0.5">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-ink/30">{formatRelative(activity.createdAt)}</span>
                      {activity.performedBy && (
                        <span className="text-[11px] text-ink/30">
                          door {activity.performedBy.split("@")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SlideOver>
  );
}

function SlideOver({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-paper border-l border-rule h-full overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-ink/40 hover:text-ink transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-0.5">{label}</p>
      {children}
    </div>
  );
}
