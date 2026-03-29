"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Loading, EmptyState } from "../shared";
import { formatDate } from "./shared";

export function NurturingTab() {
  const sequences = useQuery(api.crmNurturing.getSequences);
  const createSequence = useMutation(api.crmNurturing.createSequence);
  const deleteSequence = useMutation(api.crmNurturing.deleteSequence);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedId, setSelectedId] = useState<Id<"nurturingSequences"> | null>(null);

  if (sequences === undefined) return <Loading />;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createSequence({
      name: newName,
      description: newDesc || undefined,
    });
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-ink/60">
          Email sequences voor lead nurturing. Contacten worden automatisch uitgeschreven bij aankoop.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
        >
          + Nieuwe sequence
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="border border-rule rounded-[2px] p-5 space-y-3">
          <input
            type="text"
            placeholder="Naam (bijv. 'Na event', 'Na contactformulier')"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
            required
          />
          <input
            type="text"
            placeholder="Beschrijving (optioneel)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-[12px] text-ink/50 cursor-pointer">Annuleren</button>
            <button type="submit" className="px-5 py-1.5 text-[12px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer">Aanmaken</button>
          </div>
        </form>
      )}

      {sequences.length === 0 ? (
        <EmptyState text="Nog geen nurturing sequences" />
      ) : (
        <div className="space-y-3">
          {sequences.map((seq) => (
            <div key={seq._id} className="border border-rule rounded-[2px] p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-medium">{seq.name}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[2px] ${seq.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {seq.active ? "Actief" : "Inactief"}
                    </span>
                  </div>
                  {seq.description && (
                    <p className="text-[12px] text-ink/50 mt-0.5">{seq.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedId(selectedId === seq._id ? null : seq._id)}
                    className="px-3 py-1 text-[11px] font-medium bg-warm rounded-[2px] hover:bg-warm/80 transition-colors cursor-pointer"
                  >
                    {selectedId === seq._id ? "Sluiten" : "Beheren"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Sequence verwijderen?")) deleteSequence({ sequenceId: seq._id });
                    }}
                    className="px-2 py-1 text-[11px] text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    Verwijder
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <MiniStat label="Stappen" value={String(seq.totalSteps)} />
                <MiniStat label="Ingeschreven" value={String(seq.enrolledCount)} />
                <MiniStat label="Voltooid" value={String(seq.completedCount)} />
                <MiniStat label="Aangemaakt" value={formatDate(seq.createdAt)} />
              </div>

              {/* Detail panel */}
              {selectedId === seq._id && (
                <SequenceDetail sequenceId={seq._id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">{label}</p>
      <p className="text-[14px] font-medium mt-0.5">{value}</p>
    </div>
  );
}

function SequenceDetail({ sequenceId }: { sequenceId: Id<"nurturingSequences"> }) {
  const detail = useQuery(api.crmNurturing.getSequenceById, { sequenceId });
  const enrollments = useQuery(api.crmNurturing.getEnrollments, { sequenceId });
  const templates = useQuery(api.admin.getEmailTemplates);
  const addStep = useMutation(api.crmNurturing.addStep);
  const removeStep = useMutation(api.crmNurturing.removeStep);
  const updateSequence = useMutation(api.crmNurturing.updateSequence);
  const cancelEnrollment = useMutation(api.crmNurturing.cancelEnrollment);

  const [newTemplateKey, setNewTemplateKey] = useState("");
  const [newDelayDays, setNewDelayDays] = useState("3");

  if (!detail) return <Loading />;

  const templateOptions = templates
    ? templates.filter((t) => t.active).map((t) => ({ key: t.templateKey, label: `${t.templateKey} — ${t.subjectNl}` }))
    : [];

  return (
    <div className="mt-4 pt-4 border-t border-rule space-y-5">
      {/* Toggle active */}
      <button
        onClick={() => updateSequence({ sequenceId, active: !detail.active })}
        className={`px-4 py-1.5 text-[12px] font-medium rounded-[2px] transition-colors cursor-pointer ${
          detail.active
            ? "bg-amber-50 text-amber-700"
            : "bg-green-50 text-green-700"
        }`}
      >
        {detail.active ? "Deactiveren" : "Activeren"}
      </button>

      {/* Steps */}
      <div>
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">Stappen</p>
        {detail.steps.length === 0 ? (
          <p className="text-[12px] text-ink/30">Nog geen stappen toegevoegd</p>
        ) : (
          <div className="space-y-2">
            {detail.steps.map((step, i) => (
              <div key={step._id} className="flex items-center justify-between bg-warm/50 rounded-[2px] px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-ink/30 font-mono w-5">{i + 1}.</span>
                  <span className="text-[13px]">{step.templateKey}</span>
                  <span className="text-[11px] text-ink/40">na {step.delayDays} dagen</span>
                </div>
                <button
                  onClick={() => removeStep({ stepId: step._id })}
                  className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          {templateOptions.length > 0 ? (
            <select
              value={newTemplateKey}
              onChange={(e) => setNewTemplateKey(e.target.value)}
              className="flex-1 px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent cursor-pointer"
            >
              <option value="">Kies een template...</option>
              {templateOptions.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Template key"
              value={newTemplateKey}
              onChange={(e) => setNewTemplateKey(e.target.value)}
              className="flex-1 px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
            />
          )}
          <input
            type="number"
            placeholder="Dagen"
            value={newDelayDays}
            onChange={(e) => setNewDelayDays(e.target.value)}
            className="w-[80px] px-2 py-1.5 text-[12px] border border-rule rounded-[2px] bg-transparent"
          />
          <button
            onClick={() => {
              if (newTemplateKey) {
                addStep({
                  sequenceId,
                  templateKey: newTemplateKey,
                  delayDays: parseInt(newDelayDays) || 3,
                });
                setNewTemplateKey("");
              }
            }}
            className="px-3 py-1.5 text-[11px] font-medium bg-copper text-paper rounded-[2px] cursor-pointer hover:bg-copper-light transition-colors"
          >
            + Stap
          </button>
        </div>
      </div>

      {/* Enroll contact */}
      <EnrollContactSection sequenceId={sequenceId} />

      {/* Enrollments */}
      {enrollments && enrollments.length > 0 && (
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
            Inschrijvingen ({enrollments.length})
          </p>
          <div className="space-y-1">
            {enrollments.slice(0, 20).map((e) => (
              <div key={e._id} className="flex items-center justify-between text-[12px] py-1.5 border-b border-rule/50 last:border-b-0">
                <span className="text-ink/70">
                  {e.contact?.firstName} {e.contact?.lastName} — {e.contact?.email}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[2px] ${
                    e.status === "active" ? "bg-blue-50 text-blue-700" :
                    e.status === "completed" ? "bg-green-50 text-green-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {e.status === "active" ? `Actief (stap ${e.currentStep + 1})` :
                     e.status === "completed" ? "Voltooid" :
                     "Geannuleerd"}
                  </span>
                  {e.status === "active" && (
                    <button
                      onClick={() => {
                        if (confirm("Inschrijving annuleren?")) {
                          cancelEnrollment({ enrollmentId: e._id, reason: "manual" });
                        }
                      }}
                      className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Annuleren
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Enroll contact section ── */
function EnrollContactSection({ sequenceId }: { sequenceId: Id<"nurturingSequences"> }) {
  const enrollContact = useMutation(api.crmNurturing.enrollContact);
  const [searchEmail, setSearchEmail] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Only search when we have a meaningful query (at least 3 chars)
  const shouldSearch = searchEmail.length >= 3;
  const searchResultsData = useQuery(
    api.crm.getContacts,
    shouldSearch ? { search: searchEmail, limit: 5 } : "skip",
  );
  const searchResults = searchResultsData?.contacts;

  async function handleEnroll(contactId: Id<"contacts">) {
    setEnrolling(true);
    setFeedback(null);
    try {
      await enrollContact({ sequenceId, contactId });
      setFeedback({ type: "success", text: "Contact ingeschreven" });
      setSearchEmail("");
    } catch (err) {
      setFeedback({ type: "error", text: err instanceof Error ? err.message : "Er ging iets mis" });
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">Contact inschrijven</p>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Zoek op email, naam of bedrijf..."
          value={searchEmail}
          onChange={(e) => { setSearchEmail(e.target.value); setFeedback(null); }}
          className="w-full px-3 py-2 text-[13px] border border-rule rounded-[2px] bg-transparent"
        />

        {/* Search results */}
        {shouldSearch && searchResults && searchResults.length > 0 && (
          <div className="border border-rule rounded-[2px] divide-y divide-rule/50">
            {searchResults.map((contact) => (
              <div key={contact._id} className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="text-[13px]">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-[11px] text-ink/40">{contact.email}</p>
                </div>
                <button
                  onClick={() => handleEnroll(contact._id)}
                  disabled={enrolling}
                  className="px-3 py-1 text-[11px] font-medium bg-copper text-paper rounded-[2px] hover:bg-copper-light transition-colors cursor-pointer disabled:opacity-50"
                >
                  Inschrijven
                </button>
              </div>
            ))}
          </div>
        )}

        {shouldSearch && searchResults && searchResults.length === 0 && (
          <p className="text-[12px] text-ink/30 py-1">Geen contacten gevonden</p>
        )}

        {/* Feedback */}
        {feedback && (
          <p className={`text-[12px] py-1 ${feedback.type === "success" ? "text-green-700" : "text-red-600"}`}>
            {feedback.text}
          </p>
        )}
      </div>
    </div>
  );
}
