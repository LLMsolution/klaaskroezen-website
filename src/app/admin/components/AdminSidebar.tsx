"use client";

type Tab =
  | "dashboard"
  | "trainings"
  | "audiobooks"
  | "checkout-pages"
  | "discounts"
  | "digital-files"
  | "orders"
  | "invoices"
  | "experiments"
  | "content"
  | "blog"
  | "popup"
  | "layout-editor"
  | "email-templates"
  | "broadcasts"
  | "email-activity"
  | "crm-workflows"
  | "ad-spend"
  | "crm-pipeline"
  | "crm-prospects"
  | "crm-contacts"
  | "crm-reports"
  | "account-catalog"
  | "translation-glossary"
  | "settings";

export type AdminTab = Tab;

interface NavItem {
  key: Tab;
  label: string;
  icon: React.ReactNode;
}

type SectionOrItem =
  | { type: "item"; item: NavItem }
  | { type: "section"; label: string; items: NavItem[] };

const I = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d={d} />
  </svg>
);

const NAV: SectionOrItem[] = [
  // Dashboard — standalone
  { type: "item", item: { key: "dashboard", label: "Dashboard", icon: I("M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z") } },

  // PRODUCTEN
  { type: "section", label: "Producten", items: [
    { key: "trainings", label: "Trainingen", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><polygon points="4 3 13 8 4 13 4 3" /></svg>
    )},
    { key: "audiobooks", label: "Luisterboeken", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 12V6a4 4 0 018 0v6" /><path d="M4 10v2a1 1 0 01-1 1H2v-4h1a1 1 0 011 1zM12 10v2a1 1 0 001 1h1v-4h-1a1 1 0 00-1 1z" /></svg>
    )},
    { key: "checkout-pages", label: "Betaalpagina's", icon: I("M2 2h12v12H2zM2 6h12M6 6v8") },
    { key: "digital-files", label: "Digitale bestanden", icon: I("M3 2h7l3 3v9H3zM10 2v3h3M5 8h6M5 11h6") },
    { key: "account-catalog", label: "Mijn account", icon: I("M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-2.2 2.7-4 6-4s6 1.8 6 4") },
    { key: "discounts", label: "Kortingscodes", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 12l8-8" /><circle cx="5" cy="5" r="1.5" /><circle cx="11" cy="11" r="1.5" /></svg>
    )},
  ]},

  // VERKOOP
  { type: "section", label: "Verkoop", items: [
    { key: "orders", label: "Bestellingen", icon: I("M2 4l6-2 6 2v8l-6 2-6-2V4zM2 4l6 2 6-2M8 6v8") },
    { key: "invoices", label: "Facturen", icon: I("M4 2h8v12H4zM6 5h4M6 7.5h4M6 10h2") },
    { key: "experiments", label: "Experimenten", icon: I("M6 2v5l-3 5h10l-3-5V2M5 2h6") },
  ]},

  // CONTENT
  { type: "section", label: "Content", items: [
    { key: "content", label: "Pagina's", icon: I("M3 2h10v12H3zM6 5h4M6 7h4M6 9h2M10 10l2 2") },
    { key: "blog", label: "Blog / Nieuws", icon: I("M3 2h10v12H3zM5 5h6M5 7.5h6M5 10h3") },
    { key: "popup", label: "Popup", icon: I("M3 3h10v10H3zM3 7h10M7 7v6") },
    { key: "layout-editor", label: "Layout Editor", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2 12l3-3 2 2 4-4 3 3" /><rect x="2" y="2" width="12" height="12" rx="1" /></svg>
    )},
  ]},

  // MARKETING
  { type: "section", label: "Marketing", items: [
    { key: "email-templates", label: "E-mail templates", icon: I("M2 2h12v12H2zM2 6h12M5 9h6M5 11h4") },
    { key: "broadcasts", label: "Broadcasts", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="2" /><path d="M4.5 4.5a5 5 0 017 0" /><path d="M2.5 2.5a8 8 0 0111 0" /></svg>
    )},
    { key: "email-activity", label: "E-mail activiteit", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="3" width="12" height="10" rx="1" /><path d="M2 4l6 4 6-4" /></svg>
    )},
    { key: "crm-workflows", label: "Workflows", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 2v4l4 2 4-2V2" /><path d="M8 8v6" /><circle cx="4" cy="2" r="1" /><circle cx="12" cy="2" r="1" /><circle cx="8" cy="14" r="1" /></svg>
    )},
    { key: "ad-spend", label: "Ad Spend", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><polyline points="2 12 5 8 8 10 14 4" /><polyline points="10 4 14 4 14 8" /></svg>
    )},
  ]},

  // CRM
  { type: "section", label: "CRM", items: [
    { key: "crm-pipeline", label: "Pipeline", icon: I("M2 3h3v10H2zM6.5 5h3v8h-3zM11 7h3v6h-3z") },
    { key: "crm-prospects", label: "Prospects", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><polyline points="2 12 5 8 8 10 14 4" /><polyline points="10 4 14 4 14 8" /></svg>
    )},
    { key: "crm-contacts", label: "Contacten", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="5" r="2.5" /><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" /><circle cx="11.5" cy="5.5" r="2" /><path d="M10 13c0-1.7 1-3.1 2.5-3.7" /></svg>
    )},
    { key: "crm-reports", label: "Rapportages", icon: I("M3 13V7M7 13V4M11 13V2M2 14h12") },
  ]},

  // INSTELLINGEN
  { type: "section", label: "Instellingen", items: [
    { key: "translation-glossary", label: "Vertaalwoordenboek", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 2h7a3 3 0 013 3v9H6a3 3 0 01-3-3z" /><path d="M3 11a3 3 0 003 3" /><path d="M6 5h4M6 8h3" /></svg>
    )},
    { key: "settings", label: "Algemeen", icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="2.5" /><path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4" /></svg>
    )},
  ]},
];

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ activeTab, onTabChange, mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-ink/30 z-40" onClick={onMobileClose} />
      )}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-50 lg:z-auto h-[calc(100dvh-64px)] w-[220px] bg-paper border-r border-rule overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="py-4">
          {NAV.map((entry, idx) => {
            if (entry.type === "item") {
              return (
                <NavButton key={entry.item.key} item={entry.item} active={activeTab === entry.item.key}
                  onClick={() => { onTabChange(entry.item.key); onMobileClose(); }} />
              );
            }
            return (
              <div key={entry.label} className={idx > 0 ? "mt-5" : ""}>
                <p className="px-5 text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1.5">
                  {entry.label}
                </p>
                {entry.items.map((item) => (
                  <NavButton key={item.key} item={item} active={activeTab === item.key}
                    onClick={() => { onTabChange(item.key); onMobileClose(); }} />
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-5 py-2 text-[13px] transition-colors cursor-pointer ${
        active ? "text-copper bg-copper/[0.06] border-r-2 border-copper" : "text-ink/55 hover:text-ink hover:bg-warm/50"
      }`}
    >
      <span className={active ? "text-copper" : "text-ink/30"}>{item.icon}</span>
      {item.label}
    </button>
  );
}
