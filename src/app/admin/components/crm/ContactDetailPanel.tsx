"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loading } from "../shared";
import {
  StageBadge, LeadStatusBadge, ActivityIcon,
  formatPrice, formatDate, formatRelative,
} from "./shared";

type Props = {
  contactId: Id<"contacts">;
  onClose: () => void;
};

export function ContactDetailPanel({ contactId, onClose }: Props) {
  const contact = useQuery(api.crm.getContactById, { contactId });
  const timeline = useQuery(api.crm.getContactTimeline, { contactId, limit: 50 });
  const purchases = useQuery(api.crm.getContactPurchases, { contactId });
  const emails = useQuery(api.crm.getContactEmails, { contactId });
  const leads = useQuery(api.crmLeads.getLeadsForContact, { contactId });

  const updateContact = useMutation(api.crm.updateContact);
  const addTag = useMutation(api.crm.addTag);
  const removeTag = useMutation(api.crm.removeTag);

  const [newTag, setNewTag] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    firstName: "", lastName: "", phone: "", company: "", jobTitle: "",
  });

  if (contact === undefined) {
    return <SlideOver onClose={onClose}><Loading /></SlideOver>;
  }
  if (!contact) {
    return <SlideOver onClose={onClose}><p className="p-6 text-ink/40">Contact niet gevonden</p></SlideOver>;
  }

  function startEdit() {
    if (!contact) return;
    setEditFields({
      firstName: contact.firstName,
      lastName: contact.lastName ?? "",
      phone: contact.phone ?? "",
      company: contact.company ?? "",
      jobTitle: contact.jobTitle ?? "",
    });
    setEditMode(true);
  }

  async function saveEdit() {
    await updateContact({
      contactId,
      firstName: editFields.firstName || undefined,
      lastName: editFields.lastName || undefined,
      phone: editFields.phone || undefined,
      company: editFields.company || undefined,
      jobTitle: editFields.jobTitle || undefined,
    });
    setEditMode(false);
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTag.trim()) return;
    await addTag({ contactId, tag: newTag.trim() });
    setNewTag("");
  }

  return (
    <SlideOver onClose={onClose}>
      <div className="p-6 space-y-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-[22px] font-black tracking-[-0.02em]">
              {contact.firstName} {contact.lastName}
            </h2>
            <p className="text-[14px] text-ink/50">{contact.email}</p>
          </div>
          <button
            onClick={() => editMode ? saveEdit() : startEdit()}
            className="text-[12px] text-copper hover:text-copper-light transition-colors cursor-pointer"
          >
            {editMode ? "Opslaan" : "Bewerken"}
          </button>
        </div>

        {/* Edit form */}
        {editMode && (
          <div className="grid grid-cols-2 gap-3 border border-rule rounded-[2px] p-4">
            <input type="text" placeholder="Voornaam" value={editFields.firstName} onChange={(e) => setEditFields({ ...editFields, firstName: e.target.value })} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" />
            <input type="text" placeholder="Achternaam" value={editFields.lastName} onChange={(e) => setEditFields({ ...editFields, lastName: e.target.value })} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" />
            <input type="text" placeholder="Bedrijf" value={editFields.company} onChange={(e) => setEditFields({ ...editFields, company: e.target.value })} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" />
            <input type="text" placeholder="Functie" value={editFields.jobTitle} onChange={(e) => setEditFields({ ...editFields, jobTitle: e.target.value })} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent" />
            <input type="tel" placeholder="Telefoon" value={editFields.phone} onChange={(e) => setEditFields({ ...editFields, phone: e.target.value })} className="px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent col-span-2" />
          </div>
        )}

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-rule rounded-[2px] p-3">
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-1">Intent</p>
            <p className="font-display text-[24px] font-black">{contact.intentScore}</p>
          </div>
          <div className="border border-rule rounded-[2px] p-3">
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-1">Engagement</p>
            <p className="font-display text-[24px] font-black">{contact.engagementScore}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {contact.company && <InfoRow label="Bedrijf" value={contact.company} />}
          {contact.jobTitle && <InfoRow label="Functie" value={contact.jobTitle} />}
          {contact.phone && <InfoRow label="Telefoon" value={contact.phone} />}
          <InfoRow label="Bron" value={contact.source.replace("_", " ")} />
          <InfoRow label="Taal" value={contact.lang.toUpperCase()} />
          <InfoRow label="Aangemaakt" value={formatDate(contact.createdAt)} />
        </div>

        {/* Tags */}
        <div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {contact.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-warm rounded-[2px] text-ink/60">
                {tag}
                <button
                  onClick={() => removeTag({ contactId, tag })}
                  className="text-ink/30 hover:text-red-500 cursor-pointer"
                >
                  x
                </button>
              </span>
            ))}
            {contact.tags.length === 0 && <span className="text-[12px] text-ink/30">Geen tags</span>}
          </div>
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              placeholder="Nieuwe tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-2 py-1 text-[12px] border border-rule rounded-[2px] bg-transparent"
            />
            <button type="submit" className="px-2 py-1 text-[11px] bg-warm rounded-[2px] cursor-pointer">+</button>
          </form>
        </div>

        {/* Leads */}
        {leads && leads.length > 0 && (
          <div>
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-2">Leads</p>
            <div className="space-y-2">
              {leads.map((lead) => (
                <div key={lead._id} className="border border-rule rounded-[2px] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium">{lead.title}</p>
                    <div className="flex gap-2 mt-1">
                      <StageBadge name={lead.stageName} color={lead.stageColor} />
                      <LeadStatusBadge status={lead.status} />
                    </div>
                  </div>
                  {lead.valueCents && (
                    <span className="text-[13px] font-medium text-copper">{formatPrice(lead.valueCents)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchases */}
        {purchases && purchases.length > 0 && (
          <div>
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-2">Aankopen</p>
            <div className="space-y-2">
              {purchases.map((p) => (
                <div key={p._id} className="border border-rule rounded-[2px] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium">{p.product}</p>
                    <p className="text-[11px] text-ink/40">{p.paidAt ? formatDate(p.paidAt) : "Pending"}</p>
                  </div>
                  <span className="text-[13px] font-medium">{formatPrice(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent emails */}
        {emails && emails.length > 0 && (
          <div>
            <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-2">
              Emails ({emails.length})
            </p>
            <div className="space-y-1.5">
              {emails.slice(0, 10).map((email) => (
                <div key={email._id} className="flex items-center gap-2 text-[12px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${email.status === "sent" ? "bg-green-400" : "bg-red-400"}`} />
                  <span className="text-ink/60 truncate flex-1">{email.subject}</span>
                  <span className="text-ink/30 flex-shrink-0">{formatRelative(email.createdAt)}</span>
                  {(email.openCount ?? 0) > 0 && (
                    <span className="text-[10px] text-green-600">{email.openCount}x open</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-3">Timeline</p>
          {timeline && timeline.length > 0 ? (
            <div className="space-y-3">
              {timeline.map((activity) => (
                <div key={activity._id} className="flex gap-3">
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px]">{activity.title}</p>
                    {activity.description && (
                      <p className="text-[12px] text-ink/50 mt-0.5">{activity.description}</p>
                    )}
                    <span className="text-[11px] text-ink/30">{formatRelative(activity.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink/30">Nog geen activiteit</p>
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
      <div className="relative w-full max-w-[560px] bg-paper border-l border-rule h-full overflow-hidden">
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-ink/40">{label}</span>
      <span>{value}</span>
    </>
  );
}
