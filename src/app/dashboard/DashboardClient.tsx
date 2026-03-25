"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Lang } from "@/lib/i18n";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] ?? obj.en;
}

function getClientLocale(): Lang {
  if (typeof document === "undefined") return "nl";
  const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
  return match?.[1] === "en" ? "en" : match?.[1] === "de" ? "de" : "nl";
}

const PRODUCT_NAMES: Record<string, string> = {
  "set-online": "Sales Excellence Training — Online",
  "set-coaching": "Sales Excellence Training — Coaching",
  "cst-online": "Customer Success Training — Online",
  "cst-coaching": "Customer Success Training — Coaching",
  "boek-ebook": "Sales, Oprecht & Ontspannen — E-book",
  "boek-hardcopy": "Sales, Oprecht & Ontspannen — Hard Copy",
  "boek-luisterboek": "Sales, Oprecht & Ontspannen — Luisterboek",
};

function formatPrice(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DashboardClient() {
  const user = useQuery(api.users.getCurrentUser);
  const purchases = useQuery(api.users.getMyPurchases);
  const invoices = useQuery(api.users.getMyInvoices);
  const downloads = useQuery(api.users.getMyDownloads);
  const myTrainings = useQuery(api.trainingProgress.getMyTrainings);
  const { signOut } = useAuthActions();

  const updateProfile = useMutation(api.users.updateProfile);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [lang, setLang] = useState<Lang>("nl");

  useEffect(() => {
    setLang(getClientLocale());
  }, []);

  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-ink/30 text-[14px]">Laden...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-7">
        <div className="text-center max-w-[400px]">
          <h1 className="font-display text-[28px] font-black leading-[0.97] tracking-[-0.03em] mb-4">
            Log in om je dashboard te bekijken.
          </h1>
          <p className="text-[15px] text-ink/60 leading-[1.7] mb-8">
            Bekijk je aankopen, download je bestanden en beheer je account.
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

  const hasPurchases = purchases && purchases.length > 0;
  const hasDownloads = downloads && downloads.length > 0;
  const hasInvoices = invoices && invoices.length > 0;

  return (
    <div className="mx-auto max-w-[960px] px-7 py-12 lg:py-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">
            Dashboard
          </p>
          <h1 className="font-display text-[clamp(26px,3.4vw,36px)] font-black leading-[0.97] tracking-[-0.03em]">
            Welkom{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user.isAdmin && (
            <Link
              href="/admin"
              className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer"
          >
            Uitloggen
          </button>
        </div>
      </div>

      {/* Account info */}
      <section className="mb-12 border border-rule rounded-[2px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50">
            Account
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[12px] text-ink/40 mb-1">Naam</p>
            {editingName ? (
              <form
                className="flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateProfile({ name: nameValue });
                  setEditingName(false);
                }}
              >
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="flex-1 bg-transparent border border-rule px-3 py-1.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="text-[12px] text-copper font-medium cursor-pointer"
                >
                  Opslaan
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-[15px] text-ink">{user.name || "—"}</p>
                <button
                  onClick={() => {
                    setNameValue(user.name || "");
                    setEditingName(true);
                  }}
                  className="text-[11px] text-ink/30 hover:text-copper transition-colors cursor-pointer"
                >
                  Wijzig
                </button>
              </div>
            )}
          </div>
          <div>
            <p className="text-[12px] text-ink/40 mb-1">E-mail</p>
            <p className="text-[15px] text-ink">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Mijn trainingen */}
      {myTrainings && myTrainings.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
            Mijn trainingen
          </h2>
          <div className="space-y-3">
            {myTrainings.map((t) => (
              <Link
                key={t._id}
                href={t.lastModuleSlug ? `/training/${t.slug}/${t.lastModuleSlug}` : `/training/${t.slug}`}
                className="block border border-rule rounded-[2px] p-5 hover:border-copper/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[2px] bg-copper/10 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-ink group-hover:text-copper transition-colors">
                      {loc(t.title, lang)}
                    </p>
                    <p className="text-[12px] text-ink/40">
                      {t.completedModules} van {t.totalModules} modules · {t.overallProgress}% voltooid
                    </p>
                  </div>
                  <div className="shrink-0 w-16">
                    <div className="h-1.5 bg-warm rounded-full overflow-hidden">
                      <div
                        className="h-full bg-copper rounded-full transition-all"
                        style={{ width: `${t.overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Downloads */}
      {hasDownloads && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
            Downloads
          </h2>
          <div className="space-y-2">
            {downloads.map((file) => (
              <a
                key={file.url}
                href={file.url}
                download={file.fileName}
                className="flex items-center justify-between p-4 border border-rule rounded-[2px] hover:border-copper/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[2px] bg-copper/10 flex items-center justify-center shrink-0">
                    {file.fileType === "pdf" ? (
                      <FileIcon />
                    ) : file.fileType === "mp3" ? (
                      <AudioIcon />
                    ) : (
                      <FileIcon />
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors">
                      {file.fileName}
                    </p>
                    <p className="text-[12px] text-ink/40">
                      {PRODUCT_NAMES[file.product] || file.product}
                    </p>
                  </div>
                </div>
                <DownloadIcon />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Purchases */}
      <section className="mb-12">
        <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
          Bestellingen
        </h2>
        {hasPurchases ? (
          <div className="border border-rule rounded-[2px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rule">
                  <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3">
                    Product
                  </th>
                  <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3 hidden sm:table-cell">
                    Datum
                  </th>
                  <th className="text-right text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3">
                    Bedrag
                  </th>
                  <th className="text-right text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase._id}
                    className="border-b border-rule last:border-b-0"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-[14px] text-ink">
                        {PRODUCT_NAMES[purchase.product] || purchase.product}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-[13px] text-ink/50">
                        {purchase.paidAt
                          ? formatDate(purchase.paidAt)
                          : formatDate(purchase.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="text-[14px] text-ink tabular-nums">
                        {formatPrice(purchase.amount)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <StatusBadge status={purchase.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-rule rounded-[2px] p-8 text-center">
            <p className="text-[14px] text-ink/40 mb-4">
              Je hebt nog geen bestellingen.
            </p>
            <Link
              href="/sales-excellence-training"
              className="text-[13px] text-copper hover:text-copper-light transition-colors"
            >
              Bekijk de trainingen →
            </Link>
          </div>
        )}
      </section>

      {/* Invoices */}
      {hasInvoices && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
            Facturen
          </h2>
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between p-4 border border-rule rounded-[2px]"
              >
                <div>
                  <p className="text-[14px] font-medium text-ink">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-[12px] text-ink/40">
                    {formatDate(invoice.paidAt)} · {formatPrice(invoice.totalCents)}
                  </p>
                </div>
                <Link
                  href={`/api/invoice/${invoice.purchaseId}`}
                  target="_blank"
                  className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors"
                >
                  Bekijken
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── Small components ─── */

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
    <span
      className={`inline-block text-[11px] font-medium tracking-[0.05em] px-2.5 py-1 rounded-full ${styles[status] || styles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-copper">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/30 group-hover:text-copper transition-colors">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
