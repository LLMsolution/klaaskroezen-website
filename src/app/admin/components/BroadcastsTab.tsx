"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { formatDateTime, Th, Loading, EmptyState } from "./shared";

function BroadcastStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-ink/5 text-ink/50",
    sending: "bg-yellow-100 text-yellow-700",
    sent: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    draft: "Concept",
    sending: "Wordt verzonden",
    sent: "Verzonden",
    failed: "Mislukt",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

export function BroadcastsTab() {
  const broadcasts = useQuery(api.admin.getBroadcasts);
  const segmentCount = useQuery(api.admin.previewSegmentCount, { segment: "all" });
  const saveBroadcast = useMutation(api.admin.saveBroadcast);
  const triggerBroadcast = useMutation(api.admin.triggerBroadcast);
  const deleteBroadcast = useMutation(api.admin.deleteBroadcast);

  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [segment, setSegment] = useState<"all" | "training-buyers" | "book-buyers" | "set-buyers" | "cst-buyers">("all");
  const [sending, setSending] = useState(false);
  const [showBroadcastPreview, setShowBroadcastPreview] = useState(false);
  const [abTest, setAbTest] = useState(false);
  const [subjectB, setSubjectB] = useState("");
  const [htmlBodyB, setHtmlBodyB] = useState("");

  if (!broadcasts) return <Loading />;

  const SEGMENT_LABELS: Record<string, string> = {
    all: "Alle kopers",
    "training-buyers": "Training-kopers",
    "book-buyers": "Boek-kopers",
    "set-buyers": "SET-kopers",
    "cst-buyers": "CST-kopers",
  };

  async function handleSave(sendNow: boolean) {
    if (!subject.trim() || !htmlBody.trim()) return;
    setSending(true);
    try {
      await saveBroadcast({
        subject, htmlBody, segment, sendNow,
        ...(abTest && subjectB.trim() && htmlBodyB.trim()
          ? { abTestActive: true, subjectB, htmlBodyB }
          : {}),
      });
      setSubject("");
      setHtmlBody("");
      setSubjectB("");
      setHtmlBodyB("");
      setAbTest(false);
      setSegment("all");
      setShowCompose(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          {broadcasts.length} broadcast{broadcasts.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors cursor-pointer"
        >
          {showCompose ? "Annuleren" : "+ Nieuwe broadcast"}
        </button>
      </div>

      {showCompose && (
        <div className="border border-copper/30 rounded-[2px] p-5 space-y-4">
          <div>
            <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">Onderwerp</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Onderwerp van de e-mail"
              className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50">
                HTML Body (plak Canva-export of schrijf HTML)
              </label>
              {htmlBody.trim() && (
                <button
                  onClick={() => setShowBroadcastPreview(!showBroadcastPreview)}
                  className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
                >
                  {showBroadcastPreview ? "Editor" : "Preview"}
                </button>
              )}
            </div>
            {showBroadcastPreview ? (
              <div
                className="border border-rule rounded-[2px] p-5 bg-white min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlBody }}
              />
            ) : (
              <textarea
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                rows={10}
                placeholder="<h1>Hallo!</h1><p>Jouw bericht hier...</p>"
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[13px] text-ink font-mono focus:border-copper focus:outline-none rounded-[2px] resize-y"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as typeof segment)}
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              >
                <option value="all">Alle kopers</option>
                <option value="training-buyers">Training-kopers</option>
                <option value="book-buyers">Boek-kopers</option>
                <option value="set-buyers">SET-kopers</option>
                <option value="cst-buyers">CST-kopers</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">Ontvangers</label>
              <p className="text-[14px] text-ink py-2.5">
                {segmentCount !== undefined ? `${segmentCount} unieke ontvangers` : "Laden..."}
              </p>
            </div>
          </div>
          {/* A/B Test toggle + variant B fields */}
          <div className="border-t border-rule pt-4">
            <button
              onClick={() => setAbTest(!abTest)}
              className={`text-[11px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${
                abTest ? "bg-purple-100 text-purple-700" : "border border-rule text-ink/40 hover:text-ink"
              }`}
            >
              {abTest ? "A/B test actief" : "+ A/B test toevoegen"}
            </button>
            {abTest && (
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-purple-200">
                <div>
                  <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5">
                    Onderwerp B
                  </label>
                  <input
                    type="text"
                    value={subjectB}
                    onChange={(e) => setSubjectB(e.target.value)}
                    placeholder="Alternatief onderwerp"
                    className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5">
                    HTML Body B
                  </label>
                  <textarea
                    value={htmlBodyB}
                    onChange={(e) => setHtmlBodyB(e.target.value)}
                    rows={6}
                    placeholder="Alternatieve HTML body"
                    className="w-full bg-transparent border border-rule px-3 py-2 text-[12px] text-ink font-mono focus:border-copper focus:outline-none rounded-[2px] resize-y"
                  />
                </div>
                <p className="text-[11px] text-ink/40">
                  Eerste helft ontvangt variant A, tweede helft variant B. Resultaten worden per variant gelogd.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={sending || !subject.trim() || !htmlBody.trim()}
              className="border border-copper text-copper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper/5 transition-colors rounded-[2px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Opslaan als concept
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={sending || !subject.trim() || !htmlBody.trim()}
              className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? "Verzenden..." : "Nu verzenden"}
            </button>
          </div>
        </div>
      )}

      {broadcasts.length === 0 ? (
        <EmptyState text="Nog geen broadcasts." />
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-rule bg-warm/30">
                <Th>Onderwerp</Th>
                <Th>Segment</Th>
                <Th>Status</Th>
                <Th>Verzonden</Th>
                <Th>Datum</Th>
                <Th>Actie</Th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((b) => (
                <tr key={b._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-ink">{b.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">{SEGMENT_LABELS[b.segment] || b.segment}</p>
                  </td>
                  <td className="px-4 py-3">
                    <BroadcastStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50 tabular-nums">
                      {b.sentCount} / {b.recipientCount || "--"}
                      {b.failedCount > 0 && (
                        <span className="text-red-500 ml-1">({b.failedCount} mislukt)</span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">
                      {b.sentAt ? formatDateTime(b.sentAt) : formatDateTime(b.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {b.status === "draft" && (
                      <>
                        <button
                          onClick={() => triggerBroadcast({ broadcastId: b._id as Id<"broadcasts"> })}
                          className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors cursor-pointer"
                        >
                          Verzenden
                        </button>
                        <button
                          onClick={() => deleteBroadcast({ broadcastId: b._id as Id<"broadcasts"> })}
                          className="text-[11px] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Verwijderen
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
