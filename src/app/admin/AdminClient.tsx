"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

const PRODUCT_NAMES: Record<string, string> = {
  "set-online": "SET Online",
  "set-coaching": "SET Coaching",
  "cst-online": "CST Online",
  "cst-coaching": "CST Coaching",
  "boek-ebook": "E-book",
  "boek-hardcopy": "Hard Copy",
  "boek-luisterboek": "Luisterboek",
};

function formatPrice(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Tab = "overview" | "orders" | "invoices" | "contacts" | "carts" | "sequences" | "broadcasts" | "discounts" | "emails";

export function AdminClient() {
  const user = useQuery(api.users.getCurrentUser);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { signOut } = useAuthActions();

  if (user === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-ink/30 text-[14px]">Laden...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-7">
        <div className="text-center max-w-[400px]">
          <h1 className="font-display text-[28px] font-black leading-[0.97] tracking-[-0.03em] mb-4">
            Geen toegang.
          </h1>
          <p className="text-[15px] text-ink/60 leading-[1.7] mb-8">
            Dit gedeelte is alleen beschikbaar voor beheerders.
          </p>
          <Link
            href="/login"
            className="inline-block bg-copper text-paper px-8 py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
          >
            Inloggen
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overzicht" },
    { key: "orders", label: "Bestellingen" },
    { key: "contacts", label: "Contacten" },
    { key: "invoices", label: "Facturen" },
    { key: "carts", label: "Winkelmandjes" },
    { key: "sequences", label: "Sequenties" },
    { key: "broadcasts", label: "Broadcasts" },
    { key: "emails", label: "E-mails" },
    { key: "discounts", label: "Kortingscodes" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-7 py-12 lg:py-20 min-h-[calc(100dvh-64px)]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
            Admin
          </p>
          <h1 className="font-display text-[clamp(26px,3.4vw,36px)] font-black leading-[0.97] tracking-[-0.03em]">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[12px] text-ink/40 hover:text-ink transition-colors">
            Mijn account
          </Link>
          <button onClick={() => signOut()} className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer">
            Uitloggen
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <div
          className="flex gap-1 overflow-x-auto border-b border-rule scrollbar-none"
        >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-[12px] font-medium tracking-[0.1em] uppercase px-4 py-3 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? "text-copper border-b-2 border-copper -mb-px"
                : "text-ink/40 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent" />
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "contacts" && <ContactsTab />}
      {activeTab === "invoices" && <InvoicesTab />}
      {activeTab === "carts" && <CartsTab />}
      {activeTab === "sequences" && <SequencesTab />}
      {activeTab === "broadcasts" && <BroadcastsTab />}
      {activeTab === "emails" && <EmailsTab />}
      {activeTab === "discounts" && <DiscountsTab />}
    </div>
  );
}

/* ─── Overview Tab ─── */

function OverviewTab() {
  const stats = useQuery(api.admin.getStats);
  if (!stats) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Totale omzet" value={formatPrice(stats.totalRevenue)} />
        <StatCard label="Deze maand" value={formatPrice(stats.monthRevenue)} sub={`${stats.monthOrders} bestellingen`} />
        <StatCard label="Deze week" value={formatPrice(stats.weekRevenue)} sub={`${stats.weekOrders} bestellingen`} />
        <StatCard label="Open winkelmandjes" value={String(stats.pendingCarts)} accent />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">Trainingen</p>
          <p className="font-display text-[24px] font-bold">{formatPrice(stats.trainingRevenue)}</p>
        </div>
        <div className="border border-rule rounded-[2px] p-5">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">Boeken</p>
          <p className="font-display text-[24px] font-bold">{formatPrice(stats.bookRevenue)}</p>
        </div>
      </div>
      <div className="border border-rule rounded-[2px] p-5">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">Totalen</p>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="font-display text-[28px] font-bold text-ink">{stats.totalOrders}</p>
            <p className="text-[12px] text-ink/40">Bestellingen</p>
          </div>
          <div>
            <p className="font-display text-[28px] font-bold text-ink">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-[12px] text-ink/40">Omzet</p>
          </div>
          <div>
            <p className="font-display text-[28px] font-bold text-copper">{stats.pendingCarts}</p>
            <p className="text-[12px] text-ink/40">Open winkelmandjes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="border border-rule rounded-[2px] p-5">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-2">{label}</p>
      <p className={`font-display text-[22px] font-bold ${accent ? "text-copper" : "text-ink"}`}>{value}</p>
      {sub && <p className="text-[12px] text-ink/40 mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Orders Tab ─── */

function OrdersTab() {
  const orders = useQuery(api.admin.getOrders, { limit: 100 });
  if (!orders) return <Loading />;
  if (orders.length === 0) return <EmptyState text="Nog geen bestellingen." />;

  return (
    <div className="border border-rule rounded-[2px] overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-rule bg-warm/30">
            <Th>Klant</Th>
            <Th>Product</Th>
            <Th>Bedrag</Th>
            <Th>Status</Th>
            <Th>Factuur</Th>
            <Th>Datum</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
              <td className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{order.userName}</p>
                <p className="text-[11px] text-ink/40">{order.userEmail}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink">{PRODUCT_NAMES[order.product] || order.product}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink tabular-nums">{formatPrice(order.amount)}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                {order.invoiceNumber ? (
                  <Link
                    href={`/api/invoice/${order._id}`}
                    target="_blank"
                    className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors"
                  >
                    {order.invoiceNumber}
                  </Link>
                ) : (
                  <span className="text-[11px] text-ink/30">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{order.paidAt ? formatDateTime(order.paidAt) : formatDateTime(order.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Contacts Tab (Mailing List) ─── */

function ContactsTab() {
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

/* ─── Invoices Tab ─── */

function InvoicesTab() {
  const invoices = useQuery(api.admin.getInvoices, { limit: 100 });
  if (!invoices) return <Loading />;
  if (invoices.length === 0) return <EmptyState text="Nog geen facturen." />;

  return (
    <div className="border border-rule rounded-[2px] overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-rule bg-warm/30">
            <Th>Factuurnummer</Th>
            <Th>Klant</Th>
            <Th>Bedrag</Th>
            <Th>BTW</Th>
            <Th>Datum</Th>
            <Th>Actie</Th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
              <td className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{inv.invoiceNumber}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink">{inv.buyerName}</p>
                <p className="text-[11px] text-ink/40">{inv.buyerEmail}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink tabular-nums">{formatPrice(inv.totalCents)}</p>
              </td>
              <td className="px-4 py-3">
                {inv.btwReversed ? (
                  <span className="text-[11px] text-copper">Verlegd</span>
                ) : inv.noBtw ? (
                  <span className="text-[11px] text-ink/40">N.v.t.</span>
                ) : (
                  <span className="text-[12px] text-ink/50 tabular-nums">{formatPrice(inv.totalBtwCents)}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{formatDate(inv.paidAt)}</p>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/api/invoice/${inv.purchaseId}`}
                  target="_blank"
                  className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors"
                >
                  Bekijken
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Carts Tab ─── */

function CartsTab() {
  const carts = useQuery(api.admin.getPendingCarts, { limit: 100 });
  if (!carts) return <Loading />;
  if (carts.length === 0) return <EmptyState text="Geen open winkelmandjes." />;

  return (
    <div className="border border-rule rounded-[2px] overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-rule bg-warm/30">
            <Th>Klant</Th>
            <Th>Product</Th>
            <Th>Reminders</Th>
            <Th>Aangemaakt</Th>
          </tr>
        </thead>
        <tbody>
          {carts.map((cart) => (
            <tr key={cart._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
              <td className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{cart.firstName} {cart.lastName}</p>
                <p className="text-[11px] text-ink/40">{cart.email}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[13px] text-ink">{PRODUCT_NAMES[cart.product] || cart.product}</p>
                {cart.bumps.length > 0 && (
                  <p className="text-[11px] text-ink/40">+ {cart.bumps.map((b) => PRODUCT_NAMES[b] || b).join(", ")}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{cart.remindersSent} / 3</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[12px] text-ink/50">{formatDateTime(cart.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Sequences Tab (Template Editor) ─── */

function SequencesTab() {
  const templates = useQuery(api.admin.getEmailTemplates);
  const sequences = useQuery(api.admin.getSequences);
  const initTemplates = useMutation(api.admin.initEmailTemplates);
  const updateTemplate = useMutation(api.admin.updateEmailTemplate);

  const [editingId, setEditingId] = useState<Id<"emailTemplates"> | null>(null);
  const [editSubjectNl, setEditSubjectNl] = useState("");
  const [editSubjectEn, setEditSubjectEn] = useState("");
  const [editHtmlNl, setEditHtmlNl] = useState("");
  const [editHtmlEn, setEditHtmlEn] = useState("");
  const [editDelayDays, setEditDelayDays] = useState("");
  const [editLang, setEditLang] = useState<"nl" | "en">("nl");
  const [showPreview, setShowPreview] = useState(false);
  const [showSequences, setShowSequences] = useState(false);
  const [saving, setSaving] = useState(false);

  if (templates === undefined || sequences === undefined) return <Loading />;

  const trainingTemplates = templates.filter((t) => t.sequenceType === "training").sort((a, b) => a.stepIndex - b.stepIndex);
  const bookTemplates = templates.filter((t) => t.sequenceType === "book").sort((a, b) => a.stepIndex - b.stepIndex);
  const activeSequences = sequences.filter((s) => !s.completedAt && !s.cancelledAt);

  function startEdit(t: NonNullable<typeof templates>[0]) {
    setEditingId(t._id);
    setEditSubjectNl(t.subjectNl);
    setEditSubjectEn(t.subjectEn);
    setEditHtmlNl(t.htmlNl);
    setEditHtmlEn(t.htmlEn);
    setEditDelayDays(String(t.delayDays));
    setEditLang("nl");
    setShowPreview(false);
  }

  async function handleSave() {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateTemplate({
        id: editingId,
        subjectNl: editSubjectNl,
        subjectEn: editSubjectEn,
        htmlNl: editHtmlNl,
        htmlEn: editHtmlEn,
        delayDays: Number(editDelayDays),
      });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Init button if no templates */}
      {templates.length === 0 && (
        <div className="border border-dashed border-copper/40 rounded-[2px] p-6 text-center">
          <p className="text-[14px] text-ink/50 mb-4">
            E-mail templates zijn nog niet geïnitialiseerd. Klik om de standaard templates te laden.
          </p>
          <button
            onClick={() => initTemplates({})}
            className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
          >
            Templates initialiseren
          </button>
        </div>
      )}

      {/* Template editor panel */}
      {editingId && (
        <div className="border border-copper/30 rounded-[2px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">Template bewerken</p>
            <button onClick={() => setEditingId(null)} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">
              Annuleren
            </button>
          </div>

          {/* Language toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditLang("nl")}
              className={`text-[12px] px-3 py-1.5 rounded-[2px] cursor-pointer ${editLang === "nl" ? "bg-copper text-paper" : "border border-rule text-ink/50"}`}
            >
              Nederlands
            </button>
            <button
              onClick={() => setEditLang("en")}
              className={`text-[12px] px-3 py-1.5 rounded-[2px] cursor-pointer ${editLang === "en" ? "bg-copper text-paper" : "border border-rule text-ink/50"}`}
            >
              English
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
                Onderwerp ({editLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={editLang === "nl" ? editSubjectNl : editSubjectEn}
                onChange={(e) => editLang === "nl" ? setEditSubjectNl(e.target.value) : setEditSubjectEn(e.target.value)}
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">Vertraging (dagen)</label>
              <input
                type="number"
                value={editDelayDays}
                onChange={(e) => setEditDelayDays(e.target.value)}
                className="w-24 bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50">
                HTML Body ({editLang.toUpperCase()})
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
              >
                {showPreview ? "Editor" : "Preview"}
              </button>
            </div>
            {showPreview ? (
              <div
                className="border border-rule rounded-[2px] p-5 bg-white min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: editLang === "nl" ? editHtmlNl : editHtmlEn }}
              />
            ) : (
              <textarea
                value={editLang === "nl" ? editHtmlNl : editHtmlEn}
                onChange={(e) => editLang === "nl" ? setEditHtmlNl(e.target.value) : setEditHtmlEn(e.target.value)}
                rows={12}
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[13px] text-ink font-mono focus:border-copper focus:outline-none rounded-[2px] resize-y"
              />
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      )}

      {/* Training sequence templates */}
      {trainingTemplates.length > 0 && (
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
            Training Sequentie ({trainingTemplates.length} stappen)
          </p>
          <div className="space-y-2">
            {trainingTemplates.map((t, i) => (
              <TemplateRow
                key={t._id}
                step={i + 1}
                template={t}
                onEdit={() => startEdit(t)}
                onToggle={() => updateTemplate({ id: t._id, active: !t.active })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Book sequence templates */}
      {bookTemplates.length > 0 && (
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
            Boek Sequentie ({bookTemplates.length} stappen)
          </p>
          <div className="space-y-2">
            {bookTemplates.map((t, i) => (
              <TemplateRow
                key={t._id}
                step={i + 1}
                template={t}
                onEdit={() => startEdit(t)}
                onToggle={() => updateTemplate({ id: t._id, active: !t.active })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active sequences */}
      <div>
        <button
          onClick={() => setShowSequences(!showSequences)}
          className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 cursor-pointer hover:text-ink transition-colors"
        >
          Actieve sequenties ({activeSequences.length}) {showSequences ? "▲" : "▼"}
        </button>
        {showSequences && (
          <div className="mt-3 border border-rule rounded-[2px] overflow-x-auto">
            {activeSequences.length === 0 ? (
              <div className="p-4 text-[13px] text-ink/40">Geen actieve sequenties.</div>
            ) : (
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
                            <div
                              className="h-full bg-copper rounded-full"
                              style={{ width: `${(seq.stepsSent / seq.totalSteps) * 100}%` }}
                            />
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateRow({
  step,
  template,
  onEdit,
  onToggle,
}: {
  step: number;
  template: {
    _id: Id<"emailTemplates">;
    subjectNl: string;
    subjectEn: string;
    delayDays: number;
    active: boolean;
    templateKey: string;
    updatedAt: number;
  };
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={`border rounded-[2px] p-4 flex items-center justify-between gap-4 ${template.active ? "border-rule" : "border-rule/50 opacity-50"}`}>
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center shrink-0">
          <span className="text-[12px] font-bold text-copper">{step}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink truncate">{template.subjectNl}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-ink/40 font-mono">{template.templateKey}</span>
            <span className="text-[11px] text-ink/40">dag {template.delayDays}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggle}
          className={`text-[10px] px-2 py-1 rounded-[2px] cursor-pointer ${template.active ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/40"}`}
        >
          {template.active ? "Actief" : "Uit"}
        </button>
        <button
          onClick={onEdit}
          className="text-[11px] text-copper font-medium hover:text-copper-light transition-colors cursor-pointer"
        >
          Bewerken
        </button>
      </div>
    </div>
  );
}

/* ─── Broadcasts Tab ─── */

function BroadcastsTab() {
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
      await saveBroadcast({ subject, htmlBody, segment, sendNow });
      setSubject("");
      setHtmlBody("");
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
                      {b.sentCount} / {b.recipientCount || "—"}
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

/* ─── Emails Tab (Enhanced with tracking) ─── */

function EmailsTab() {
  const emails = useQuery(api.admin.getEmailLogEnhanced, { limit: 100 });
  const [previewId, setPreviewId] = useState<Id<"emailLog"> | null>(null);

  if (!emails) return <Loading />;
  if (emails.length === 0) return <EmptyState text="Nog geen e-mails verstuurd." />;

  // Calculate stats
  const totalSent = emails.filter((e) => e.status === "sent").length;
  const totalOpened = emails.filter((e) => (e.openCount ?? 0) > 0).length;
  const totalClicked = emails.filter((e) => (e.clickCount ?? 0) > 0).length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Email stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Verzonden" value={String(totalSent)} />
        <StatCard label="Geopend" value={String(totalOpened)} sub={`${openRate}% open rate`} />
        <StatCard label="Geklikt" value={String(totalClicked)} sub={`${clickRate}% click rate`} accent />
        <StatCard label="Mislukt" value={String(emails.filter((e) => e.status === "failed").length)} />
        <StatCard label="In wachtrij" value={String(emails.filter((e) => e.status === "queued").length)} />
      </div>

      {/* Preview panel */}
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
            {emails.map((email) => (
              <tr key={email._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-[13px] text-ink">{email.to}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[13px] text-ink/70 truncate max-w-[200px]">{email.subject}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-ink/40 font-mono">{email.template}</span>
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

/* ─── Discounts Tab ─── */

function DiscountsTab() {
  const codes = useQuery(api.admin.getDiscountCodes);
  const createCode = useMutation(api.admin.createDiscountCode);
  const deleteCode = useMutation(api.admin.deleteDiscountCode);

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");

  if (!codes) return <Loading />;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createCode({
      code,
      type,
      value: type === "percentage" ? Number(value) : Number(value) * 100,
      maxUses: maxUses ? Number(maxUses) : undefined,
    });
    setCode("");
    setValue("");
    setMaxUses("");
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          {codes.length} code{codes.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors cursor-pointer"
        >
          {showForm ? "Annuleren" : "+ Nieuwe code"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-copper/30 rounded-[2px] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ZOMER25"
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Vast bedrag (€)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">
                Waarde {type === "percentage" ? "(%)" : "(€)"}
              </label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percentage" ? "25" : "50"}
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2">Max. gebruik (optioneel)</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Onbeperkt"
                className="w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
          >
            Aanmaken
          </button>
        </form>
      )}

      {codes.length === 0 ? (
        <EmptyState text="Nog geen kortingscodes." />
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-rule bg-warm/30">
                <Th>Code</Th>
                <Th>Type</Th>
                <Th>Waarde</Th>
                <Th>Gebruikt</Th>
                <Th>Actie</Th>
              </tr>
            </thead>
            <tbody>
              {codes.map((dc) => (
                <tr key={dc._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-mono font-medium text-ink bg-warm px-2 py-0.5 rounded-[2px]">
                      {dc.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">{dc.type === "percentage" ? "Percentage" : "Vast bedrag"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-ink">
                      {dc.type === "percentage" ? `${dc.value}%` : formatPrice(dc.value)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">
                      {dc.currentUses}{dc.maxUses !== undefined ? ` / ${dc.maxUses}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteCode({ id: dc._id as Id<"discountCodes"> })}
                      className="text-[11px] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Verwijderen
                    </button>
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

/* ─── Shared components ─── */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3">
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-ink/5 text-ink/50",
  };
  const labels: Record<string, string> = {
    paid: "Betaald",
    pending: "In afwachting",
    failed: "Mislukt",
    refunded: "Terugbetaald",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function EmailStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    sent: "bg-green-100 text-green-700",
    queued: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.queued}`}>
      {status}
    </span>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-ink/30 text-[14px]">Laden...</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-rule rounded-[2px] p-8 text-center">
      <p className="text-[14px] text-ink/40">{text}</p>
    </div>
  );
}
