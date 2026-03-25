"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

type Props = {
  onClose: () => void;
};

export function AddLeadForm({ onClose }: Props) {
  const stages = useQuery(api.crmPipeline.getStages);
  const contacts = useQuery(api.crm.getContacts, { limit: 500 });
  const createLead = useMutation(api.crmLeads.createLead);
  const createContact = useMutation(api.crm.createContact);

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [contactId, setContactId] = useState<Id<"contacts"> | "">("");
  const [stageId, setStageId] = useState<Id<"pipelineStages"> | "">("");
  const [title, setTitle] = useState("");
  const [valueCents, setValueCents] = useState("");
  const [source, setSource] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [contactSearch, setContactSearch] = useState("");

  // New contact fields
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredContacts = contacts?.filter((c) => {
    if (!contactSearch) return true;
    const q = contactSearch.toLowerCase();
    return (
      c.email.includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      (c.lastName?.toLowerCase().includes(q) ?? false) ||
      (c.company?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      let finalContactId: Id<"contacts">;

      if (mode === "new") {
        if (!newEmail.trim() || !newFirstName.trim()) return;
        finalContactId = await createContact({
          email: newEmail.trim(),
          firstName: newFirstName.trim(),
          lastName: newLastName.trim() || undefined,
          company: newCompany.trim() || undefined,
          phone: newPhone.trim() || undefined,
          source: "manual",
        });
      } else {
        if (!contactId) return;
        finalContactId = contactId as Id<"contacts">;
      }

      await createLead({
        contactId: finalContactId,
        title: title.trim(),
        valueCents: valueCents ? Math.round(parseFloat(valueCents) * 100) : undefined,
        source: source || undefined,
        assignedTo: assignedTo || undefined,
        stageId: stageId ? (stageId as Id<"pipelineStages">) : undefined,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div className="relative bg-paper border border-rule rounded-[2px] w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="font-display text-[20px] font-black tracking-[-0.02em] mb-6">
            Nieuwe lead
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact selection mode */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-[2px] transition-colors cursor-pointer ${
                  mode === "existing" ? "bg-copper text-paper" : "bg-warm text-ink/60"
                }`}
              >
                Bestaand contact
              </button>
              <button
                type="button"
                onClick={() => setMode("new")}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-[2px] transition-colors cursor-pointer ${
                  mode === "new" ? "bg-copper text-paper" : "bg-warm text-ink/60"
                }`}
              >
                Nieuw contact
              </button>
            </div>

            {mode === "existing" ? (
              <div>
                <label className="text-[11px] font-medium text-ink/50 block mb-1">Contact</label>
                <input
                  type="text"
                  placeholder="Zoek op naam of email..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent mb-2"
                />
                <div className="max-h-[150px] overflow-y-auto border border-rule rounded-[2px]">
                  {filteredContacts?.slice(0, 20).map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setContactId(c._id)}
                      className={`w-full text-left px-3 py-2 text-[13px] border-b border-rule last:border-b-0 cursor-pointer transition-colors ${
                        contactId === c._id ? "bg-copper/10 text-copper" : "hover:bg-warm"
                      }`}
                    >
                      <span className="font-medium">{c.firstName} {c.lastName}</span>
                      <span className="text-ink/40 ml-2">{c.email}</span>
                      {c.company && <span className="text-ink/30 ml-2">— {c.company}</span>}
                    </button>
                  ))}
                  {filteredContacts?.length === 0 && (
                    <p className="px-3 py-4 text-[12px] text-ink/30 text-center">Geen contacten gevonden</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-ink/50 block mb-1">Voornaam *</label>
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-ink/50 block mb-1">Achternaam</label>
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink/50 block mb-1">Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-ink/50 block mb-1">Bedrijf</label>
                    <input
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-ink/50 block mb-1">Telefoon</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Lead details */}
            <div>
              <label className="text-[11px] font-medium text-ink/50 block mb-1">Titel *</label>
              <input
                type="text"
                placeholder="Bijv. Sales Excellence Training — Bedrijf X"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-ink/50 block mb-1">Waarde (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={valueCents}
                  onChange={(e) => setValueCents(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink/50 block mb-1">Fase</label>
                <select
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value as Id<"pipelineStages"> | "")}
                  className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                >
                  <option value="">Standaard (Nieuw)</option>
                  {stages?.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-ink/50 block mb-1">Bron</label>
                <input
                  type="text"
                  placeholder="Bijv. website, event, LinkedIn"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink/50 block mb-1">Toegewezen aan</label>
                <input
                  type="email"
                  placeholder="email@voorbeeld.nl"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[12px] text-ink/50 hover:text-ink transition-colors cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-[12px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Bezig..." : "Lead aanmaken"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
