"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  PRODUCT_NAMES,
  formatPrice,
  formatDate,
  formatDateTime,
  StatCard,
  Th,
  EmailStatusBadge,
  Loading,
  EmptyState,
} from "./shared";

export function ContactsTab() {
  const contacts = useQuery(api.admin.getMailingList);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!contacts) return <Loading />;
  if (contacts.length === 0) return <EmptyState text="Geen contacten gevonden." />;

  const totalContacts = contacts.length;
  const buyerCount = contacts.filter((c) => c.purchaseCount > 0).length;
  const totalOpens = contacts.reduce((s, c) => s + c.totalOpens, 0);
  const totalClicks = contacts.reduce((s, c) => s + c.totalClicks, 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Totaal contacten" value={String(totalContacts)} />
        <StatCard label="Kopers" value={String(buyerCount)} />
        <StatCard label="Totaal opens" value={String(totalOpens)} />
        <StatCard label="Totaal clicks" value={String(totalClicks)} accent />
      </div>

      {/* Contact detail panel */}
      {selectedEmail && (
        <ContactDetailPanel email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}

      {/* Contact list */}
      <div className="border border-rule rounded-[2px] overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-rule bg-warm/30">
              <Th>Contact</Th>
              <Th>Producten</Th>
              <Th>Besteed</Th>
              <Th>E-mails</Th>
              <Th>Opens</Th>
              <Th>Clicks</Th>
              <Th>Laatste activiteit</Th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                key={contact.email}
                onClick={() => setSelectedEmail(contact.email)}
                className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <p className="text-[13px] font-medium text-ink">{contact.name}</p>
                  <p className="text-[11px] text-ink/40">{contact.email}</p>
                </td>
                <td className="px-4 py-3">
                  {contact.products.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(contact.products)].map((p) => (
                        <span key={p} className="text-[10px] bg-warm px-1.5 py-0.5 rounded-[2px] text-ink/60">
                          {PRODUCT_NAMES[p] || p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-ink/30">Geen aankopen</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-[13px] text-ink tabular-nums">
                    {contact.totalSpent > 0 ? formatPrice(contact.totalSpent) : "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] text-ink/50 tabular-nums">{contact.emailsSent}</p>
                </td>
                <td className="px-4 py-3">
                  <p className={`text-[12px] tabular-nums ${contact.totalOpens > 0 ? "text-green-600 font-medium" : "text-ink/30"}`}>
                    {contact.totalOpens}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className={`text-[12px] tabular-nums ${contact.totalClicks > 0 ? "text-copper font-medium" : "text-ink/30"}`}>
                    {contact.totalClicks}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] text-ink/50">
                    {contact.lastPurchaseAt ? formatDate(contact.lastPurchaseAt)
                      : contact.lastEmailAt ? formatDate(contact.lastEmailAt)
                      : "—"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactDetailPanel({ email, onClose }: { email: string; onClose: () => void }) {
  const emails = useQuery(api.admin.getContactEmails, { email });

  return (
    <div className="border border-copper/30 rounded-[2px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">E-mail historie</p>
          <p className="text-[15px] font-medium text-ink">{email}</p>
        </div>
        <button onClick={onClose} className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer">
          Sluiten
        </button>
      </div>

      {!emails ? (
        <div className="text-[13px] text-ink/30">Laden...</div>
      ) : emails.length === 0 ? (
        <div className="text-[13px] text-ink/40">Geen e-mails gevonden voor dit contact.</div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {emails.map((e) => (
            <div key={e._id} className="border border-rule rounded-[2px] p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink truncate">{e.subject}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-ink/40 font-mono">{e.template}</span>
                    <EmailStatusBadge status={e.status} />
                    <span className="text-[11px] text-ink/40">{formatDateTime(e.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className={`text-[14px] font-bold tabular-nums ${(e.openCount ?? 0) > 0 ? "text-green-600" : "text-ink/20"}`}>
                      {e.openCount ?? 0}
                    </p>
                    <p className="text-[9px] text-ink/40 uppercase tracking-wider">opens</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-[14px] font-bold tabular-nums ${(e.clickCount ?? 0) > 0 ? "text-copper" : "text-ink/20"}`}>
                      {e.clickCount ?? 0}
                    </p>
                    <p className="text-[9px] text-ink/40 uppercase tracking-wider">clicks</p>
                  </div>
                </div>
              </div>
              {/* Event timeline */}
              {e.events && e.events.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rule">
                  <div className="flex flex-wrap gap-1.5">
                    {e.events.slice(0, 10).map((ev) => (
                      <span
                        key={ev._id}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          ev.type === "open" ? "bg-green-100 text-green-700" : "bg-copper/10 text-copper"
                        }`}
                      >
                        {ev.type === "open" ? "Geopend" : "Klik"} {formatDateTime(ev.createdAt)}
                        {ev.url && (
                          <span className="ml-1 text-[9px] opacity-60">
                            {new URL(ev.url).pathname.slice(0, 20)}
                          </span>
                        )}
                      </span>
                    ))}
                    {e.events.length > 10 && (
                      <span className="text-[10px] text-ink/40">+{e.events.length - 10} meer</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
