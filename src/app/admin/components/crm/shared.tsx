"use client";

export function ScoreBadge({ label, score, type }: { label: string; score: number; type: "engagement" | "intent" }) {
  const color = type === "intent"
    ? score >= 50 ? "bg-green-50 text-green-700" : score >= 20 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
    : score >= 30 ? "bg-blue-50 text-blue-700" : score >= 10 ? "bg-sky-50 text-sky-600" : "bg-gray-100 text-gray-500";

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[2px] ${color}`}>
      {label}: {score}
    </span>
  );
}

export function StageBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-[2px]"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

export function AssigneeBadge({ email }: { email?: string | null }) {
  if (!email) return <span className="text-[12px] text-ink/30">Niet toegewezen</span>;
  const name = email.split("@")[0];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[2px] bg-warm text-ink/70">
      {name}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: "open" | "won" | "lost" }) {
  const styles = {
    open: "bg-blue-50 text-blue-700",
    won: "bg-green-50 text-green-700",
    lost: "bg-red-50 text-red-600",
  };
  const labels = { open: "Open", won: "Gewonnen", lost: "Verloren" };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-[2px] ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function formatPrice(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Zojuist";
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d geleden`;
  return formatDate(ts);
}

export function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, { bg: string; icon: string }> = {
    note: { bg: "bg-gray-100", icon: "M4 3h8v10H4z M6 5.5h4 M6 7.5h4" },
    call: { bg: "bg-green-50", icon: "M3 2l2 3-1.5 1.5c1 2 2.5 3.5 4.5 4.5L9.5 9.5l3 2-1 3c-4 0-8.5-4.5-8.5-8.5z" },
    meeting: { bg: "bg-blue-50", icon: "M6 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM4 12c0-2.2 1.8-4 4-4s4 1.8 4 4" },
    email_sent: { bg: "bg-purple-50", icon: "M2 4h12v8H2zM2 4l6 4 6-4" },
    email_opened: { bg: "bg-purple-50", icon: "M2 4h12v8H2zM2 4l6 4 6-4" },
    email_clicked: { bg: "bg-purple-50", icon: "M2 4h12v8H2zM2 4l6 4 6-4" },
    stage_change: { bg: "bg-amber-50", icon: "M3 6h4l2-3 2 3h4v4l-3 2 3 2v4H3V6z" },
    contact_form: { bg: "bg-cyan-50", icon: "M3 2h10v12H3zM5 5h6M5 7.5h6M5 10h3" },
    checkout_started: { bg: "bg-orange-50", icon: "M3 3h2l1 7h6l1.5-5H5" },
    checkout_abandoned: { bg: "bg-red-50", icon: "M3 3h2l1 7h6l1.5-5H5" },
    purchase: { bg: "bg-green-50", icon: "M4 8l2.5 3L12 4" },
    lead_created: { bg: "bg-blue-50", icon: "M8 3v10M3 8h10" },
    lead_won: { bg: "bg-green-50", icon: "M4 8l2.5 3L12 4" },
    lead_lost: { bg: "bg-red-50", icon: "M4 4l8 8M12 4l-8 8" },
    tag_added: { bg: "bg-indigo-50", icon: "M3 3h5l6 6-5 5-6-6V3z" },
    tag_removed: { bg: "bg-gray-100", icon: "M3 3h5l6 6-5 5-6-6V3z" },
    score_change: { bg: "bg-yellow-50", icon: "M8 2l2 4h4l-3 3 1 5-4-2.5L4 14l1-5-3-3h4z" },
  };

  const config = iconMap[type] ?? { bg: "bg-gray-100", icon: "M8 4v8M4 8h8" };

  return (
    <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d={config.icon} />
      </svg>
    </div>
  );
}
