"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  PRODUCT_NAMES,
  formatDate,
  formatDateTime,
  StatCard,
  Th,
  EmailStatusBadge,
  Loading,
  EmptyState,
} from "./shared";

type SubTab = "emails" | "performance" | "ab-tests" | "sequences" | "unsubscribes";

export function EmailActivityTab() {
  const [subTab, setSubTab] = useState<SubTab>("emails");

  const tabs: { key: SubTab; label: string }[] = [
    { key: "emails", label: "Verzonden" },
    { key: "performance", label: "Prestaties" },
    { key: "ab-tests", label: "A/B testen" },
    { key: "sequences", label: "Sequenties" },
    { key: "unsubscribes", label: "Uitschrijvingen" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`text-[12px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${
              subTab === tab.key
                ? "bg-copper text-paper"
                : "border border-rule text-ink/50 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "emails" && <EmailsLog />}
      {subTab === "performance" && <PerformancePanel />}
      {subTab === "ab-tests" && <AbTestResultsPanel />}
      {subTab === "sequences" && <ActiveSequencesPanel />}
      {subTab === "unsubscribes" && <UnsubscribesPanel />}
    </div>
  );
}

/* ─── Emails Log (Verzonden) ─── */

function EmailsLog() {
  const emails = useQuery(api.admin.getEmailLogEnhanced, { limit: 100 });
  const [previewId, setPreviewId] = useState<Id<"emailLog"> | null>(null);
  const [filter, setFilter] = useState<"all" | "sent" | "failed" | "opened" | "clicked">("all");

  if (!emails) return <Loading />;
  if (emails.length === 0) return <EmptyState text="Nog geen e-mails verstuurd." />;

  const totalSent = emails.filter((e) => e.status === "sent").length;
  const totalOpened = emails.filter((e) => (e.openCount ?? 0) > 0).length;
  const totalClicked = emails.filter((e) => (e.clickCount ?? 0) > 0).length;
  const totalFailed = emails.filter((e) => e.status === "failed").length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  const filtered = emails.filter((e) => {
    if (filter === "sent") return e.status === "sent";
    if (filter === "failed") return e.status === "failed";
    if (filter === "opened") return (e.openCount ?? 0) > 0;
    if (filter === "clicked") return (e.clickCount ?? 0) > 0;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Verzonden" value={String(totalSent)} />
        <StatCard label="Geopend" value={String(totalOpened)} sub={`${openRate}% open rate`} />
        <StatCard label="Geklikt" value={String(totalClicked)} sub={`${clickRate}% click rate`} accent />
        <StatCard label="Mislukt" value={String(totalFailed)} />
        <StatCard label="Totaal" value={String(emails.length)} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "sent", "failed", "opened", "clicked"] as const).map((f) => {
          const labels = { all: "Alles", sent: "Verzonden", failed: "Mislukt", opened: "Geopend", clicked: "Geklikt" };
          const count = f === "all" ? emails.length : f === "sent" ? totalSent : f === "failed" ? totalFailed : f === "opened" ? totalOpened : totalClicked;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
                filter === f ? "bg-ink text-paper" : "text-ink/40 hover:text-ink"
              }`}
            >
              {labels[f]} ({count})
            </button>
          );
        })}
      </div>

      {previewId && <EmailPreviewPanel emailId={previewId} onClose={() => setPreviewId(null)} />}

      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-rule bg-warm/30">
              <Th>Aan</Th>
              <Th>Onderwerp</Th>
              <Th>Template</Th>
              <Th>Status</Th>
              <Th>Opens</Th>
              <Th>Clicks</Th>
              <Th>Datum</Th>
              <Th>Actie</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((email) => (
              <tr key={email._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-[13px] text-ink">{email.to}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[13px] text-ink/70 truncate max-w-[200px]">{email.subject}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-ink/40 font-mono">{email.template}</span>
                  {email.variant && (
                    <span className="ml-1 text-[9px] px-1 py-0.5 rounded-[2px] bg-purple-100 text-purple-700 font-medium">
                      {email.variant}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <EmailStatusBadge status={email.status} />
                </td>
                <td className="px-4 py-3">
                  <p className={`text-[12px] tabular-nums ${(email.openCount ?? 0) > 0 ? "text-green-600 font-medium" : "text-ink/20"}`}>
                    {email.openCount ?? 0}
                    {email.lastOpenedAt && (
                      <span className="text-[10px] text-ink/30 block">{formatDate(email.lastOpenedAt)}</span>
                    )}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className={`text-[12px] tabular-nums ${(email.clickCount ?? 0) > 0 ? "text-copper font-medium" : "text-ink/20"}`}>
                    {email.clickCount ?? 0}
                    {email.lastClickedAt && (
                      <span className="text-[10px] text-ink/30 block">{formatDate(email.lastClickedAt)}</span>
                    )}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] text-ink/50">{formatDateTime(email.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  {email.htmlBody && (
                    <button
                      onClick={() => setPreviewId(email._id)}
                      className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Email Preview Panel ─── */

function EmailPreviewPanel({ emailId, onClose }: { emailId: Id<"emailLog">; onClose: () => void }) {
  const preview = useQuery(api.admin.getEmailPreview, { emailId });

  return (
    <div className="border border-copper/30 rounded-[2px] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-warm/30 border-b border-rule">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">E-mail preview</p>
        <button onClick={onClose} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">
          Sluiten
        </button>
      </div>
      <div className="bg-white">
        {preview ? (
          <iframe
            srcDoc={preview}
            className="w-full min-h-[500px] border-0"
            title="Email preview"
            sandbox="allow-same-origin"
          />
        ) : (
          <div className="p-8 text-center text-[13px] text-ink/40">Laden...</div>
        )}
      </div>
    </div>
  );
}

/* ─── Performance Panel (per-template stats) ─── */

function PerformancePanel() {
  const performance = useQuery(api.emailAdmin.getTemplatePerformance);

  if (performance === undefined) return <Loading />;
  if (performance.length === 0) return <EmptyState text="Nog geen email data." />;

  return (
    <div>
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-4">
        Prestaties per template
      </p>
      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rule bg-warm/30">
              <Th>Template</Th>
              <th className="text-right px-4 py-3 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Verzonden</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Geopend</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Open %</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Geklikt</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Klik %</th>
            </tr>
          </thead>
          <tbody>
            {performance.map((p) => (
              <tr key={p.template} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                <td className="px-4 py-3 text-[13px] text-ink font-mono">{p.template}</td>
                <td className="px-4 py-3 text-[13px] text-ink/60 text-right tabular-nums">{p.sent}</td>
                <td className="px-4 py-3 text-[13px] text-ink/60 text-right tabular-nums">{p.opened}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[12px] font-medium tabular-nums ${p.openRate >= 40 ? "text-green-600" : p.openRate >= 20 ? "text-amber-600" : "text-red-500"}`}>
                    {p.openRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px] text-ink/60 text-right tabular-nums">{p.clicked}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[12px] font-medium tabular-nums ${p.clickRate >= 10 ? "text-green-600" : p.clickRate >= 5 ? "text-amber-600" : "text-ink/30"}`}>
                    {p.clickRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── A/B Test Results Panel ─── */

function AbTestResultsPanel() {
  const templates = useQuery(api.admin.getEmailTemplates);

  if (templates === undefined) return <Loading />;

  const abTemplates = templates.filter((t) => t.abTestActive || t.subjectNlB);
  if (abTemplates.length === 0) return <EmptyState text="Geen actieve A/B testen. Maak een A/B test aan bij E-mail templates." />;

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
        A/B test resultaten
      </p>
      {abTemplates.map((t) => (
        <AbTestResultCard key={t._id} templateKey={t.templateKey} active={t.abTestActive ?? false} subjectA={t.subjectNl} subjectB={t.subjectNlB} />
      ))}
    </div>
  );
}

function AbTestResultCard({ templateKey, active, subjectA, subjectB }: { templateKey: string; active: boolean; subjectA: string; subjectB?: string }) {
  const results = useQuery(api.emailAdmin.getAbTestResults, { templateKey });

  if (!results) return null;

  const hasData = results.A.sent > 0 || results.B.sent > 0;

  return (
    <div className="border border-rule rounded-[2px] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] text-ink/40 font-mono">{templateKey}</span>
          <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-[2px] font-medium ${active ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/40"}`}>
            {active ? "Actief" : "Inactief"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="text-[12px]"><span className="text-ink/40">A:</span> <span className="text-ink">{subjectA}</span></div>
        <div className="text-[12px]"><span className="text-ink/40">B:</span> <span className="text-ink">{subjectB || "—"}</span></div>
      </div>
      {hasData ? (
        <div className="grid grid-cols-2 gap-3">
          <VariantStats label="A" data={results.A} winning={results.A.openRate > results.B.openRate} />
          <VariantStats label="B" data={results.B} winning={results.B.openRate > results.A.openRate} />
        </div>
      ) : (
        <p className="text-[12px] text-ink/30">Nog geen data.</p>
      )}
    </div>
  );
}

function VariantStats({ label, data, winning }: { label: string; data: { sent: number; opened: number; clicked: number; openRate: number; clickRate: number }; winning: boolean }) {
  return (
    <div className={`p-3 rounded-[2px] ${winning && data.sent > 0 ? "bg-green-50/50 border border-green-200" : "bg-warm/20"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] font-medium text-ink">Variant {label}</span>
        {winning && data.sent > 0 && <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-green-600">Leidt</span>}
      </div>
      <div className="flex gap-4 text-[11px]">
        <span className="text-ink/50">{data.sent} verzonden</span>
        <span className={data.openRate >= 40 ? "text-green-600 font-medium" : "text-ink/40"}>{data.openRate}% open</span>
        <span className={data.clickRate >= 10 ? "text-green-600 font-medium" : "text-ink/40"}>{data.clickRate}% click</span>
      </div>
    </div>
  );
}

/* ─── Active Sequences Panel ─── */

function ActiveSequencesPanel() {
  const sequences = useQuery(api.admin.getSequences);
  const initTemplates = useMutation(api.admin.initEmailTemplates);
  const templates = useQuery(api.admin.getEmailTemplates);

  if (sequences === undefined || templates === undefined) return <Loading />;

  const activeSequences = sequences.filter((s) => !s.completedAt && !s.cancelledAt);
  const completedSequences = sequences.filter((s) => s.completedAt);

  return (
    <div className="space-y-4">
      {templates.length === 0 && (
        <div className="border border-dashed border-copper/40 rounded-[2px] p-6 text-center">
          <p className="text-[14px] text-ink/50 mb-4">
            E-mail templates zijn nog niet geinitialiseerd.
          </p>
          <button
            onClick={() => initTemplates({})}
            className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
          >
            Templates initialiseren
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Actief" value={String(activeSequences.length)} accent />
        <StatCard label="Afgerond" value={String(completedSequences.length)} />
        <StatCard label="Totaal" value={String(sequences.length)} />
      </div>

      {activeSequences.length === 0 ? (
        <EmptyState text="Geen actieve sequenties." />
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-rule bg-warm/30">
                <Th>Klant</Th>
                <Th>Product</Th>
                <Th>Voortgang</Th>
                <Th>Laatste verzending</Th>
                <Th>Gestart</Th>
              </tr>
            </thead>
            <tbody>
              {activeSequences.map((seq) => (
                <tr key={seq._id} className="border-b border-rule last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-ink">{seq.userName}</p>
                    <p className="text-[11px] text-ink/40">{seq.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">{PRODUCT_NAMES[seq.product] || seq.product}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-warm rounded-full overflow-hidden max-w-[80px]">
                        <div className="h-full bg-copper rounded-full" style={{ width: `${(seq.stepsSent / seq.totalSteps) * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-ink/40 tabular-nums">{seq.stepsSent}/{seq.totalSteps}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">{seq.lastSentAt ? formatDateTime(seq.lastSentAt) : "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">{formatDate(seq.createdAt)}</p>
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

/* ─── Unsubscribes Panel ─── */

function UnsubscribesPanel() {
  const unsubscribes = useQuery(api.emailAdmin.getUnsubscribes);
  const resubscribe = useMutation(api.emailAdmin.resubscribe);
  const [loading, setLoading] = useState<string | null>(null);

  if (unsubscribes === undefined) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          Uitgeschreven ({unsubscribes.length})
        </p>
      </div>
      {unsubscribes.length === 0 ? (
        <EmptyState text="Geen uitschrijvingen." />
      ) : (
        <div className="space-y-1">
          {unsubscribes.map((u) => (
            <div key={u._id} className="flex items-center justify-between py-2 px-3 border-b border-rule">
              <div>
                <p className="text-[13px] text-ink">{u.email}</p>
                <p className="text-[11px] text-ink/30">{formatDate(u.createdAt)}</p>
              </div>
              <button
                onClick={async () => {
                  setLoading(u._id);
                  await resubscribe({ email: u.email });
                  setLoading(null);
                }}
                disabled={loading === u._id}
                className="text-[11px] text-copper hover:text-copper-light transition-colors cursor-pointer disabled:opacity-50"
              >
                Herinschrijven
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
