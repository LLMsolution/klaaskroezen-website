"use client";

type Section = "inzichten" | "crm" | "beheren";
type Tab =
  | "dashboard"
  | "orders"
  | "contacts"
  | "invoices"
  | "email-activity"
  | "crm-pipeline"
  | "crm-contacts"
  | "crm-automations"
  | "crm-nurturing"
  | "crm-reports"
  | "trainings"
  | "checkout-pages"
  | "email-templates"
  | "broadcasts"
  | "experiments"
  | "discounts"
  | "content"
  | "blog"
  | "images"
  | "layout-editor"
  | "settings";

export type AdminTab = Tab;

interface NavItem {
  key: Tab;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: { key: Section; label: string; items: NavItem[] }[] = [
  {
    key: "inzichten",
    label: "Inzichten",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="2" width="5" height="5" rx="1" />
            <rect x="9" y="2" width="5" height="5" rx="1" />
            <rect x="2" y="9" width="5" height="5" rx="1" />
            <rect x="9" y="9" width="5" height="5" rx="1" />
          </svg>
        ),
      },
      {
        key: "orders",
        label: "Bestellingen",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M2 4l6-2 6 2v8l-6 2-6-2V4z" />
            <path d="M2 4l6 2 6-2" />
            <path d="M8 6v8" />
          </svg>
        ),
      },
      {
        key: "contacts",
        label: "Contacten",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="8" cy="5" r="3" />
            <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
          </svg>
        ),
      },
      {
        key: "invoices",
        label: "Facturen",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M4 2h8v12H4z" />
            <path d="M6 5h4M6 7.5h4M6 10h2" />
          </svg>
        ),
      },
      {
        key: "email-activity",
        label: "E-mail activiteit",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="3" width="12" height="10" rx="1" />
            <path d="M2 4l6 4 6-4" />
          </svg>
        ),
      },
    ],
  },
  {
    key: "crm",
    label: "CRM",
    items: [
      {
        key: "crm-pipeline",
        label: "Pipeline",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M2 3h3v10H2zM6.5 5h3v8h-3zM11 7h3v6h-3z" />
          </svg>
        ),
      },
      {
        key: "crm-contacts",
        label: "CRM Contacten",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="6" cy="5" r="2.5" />
            <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
            <circle cx="11.5" cy="5.5" r="2" />
            <path d="M10 13c0-1.7 1-3.1 2.5-3.7" />
          </svg>
        ),
      },
      {
        key: "crm-automations",
        label: "Automations",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M4 2v4l4 2-4 2v4" />
            <path d="M10 6h4M10 10h4" />
          </svg>
        ),
      },
      {
        key: "crm-nurturing",
        label: "Nurturing",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M2 4h12v8H2zM2 4l6 4 6-4" />
            <path d="M8 8v4" />
          </svg>
        ),
      },
      {
        key: "crm-reports",
        label: "Rapportages",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M3 13V7M7 13V4M11 13V2" />
            <path d="M2 14h12" />
          </svg>
        ),
      },
    ],
  },
  {
    key: "beheren",
    label: "Beheren",
    items: [
      {
        key: "content",
        label: "Content",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M3 2h10v12H3z" />
            <path d="M6 5h4M6 7h4M6 9h2" />
            <path d="M10 10l2 2" />
          </svg>
        ),
      },
      {
        key: "trainings",
        label: "Trainingen",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <polygon points="4 3 13 8 4 13 4 3" />
          </svg>
        ),
      },
      {
        key: "checkout-pages",
        label: "Betaalpagina's",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <path d="M2 6h12" />
            <path d="M6 6v8" />
          </svg>
        ),
      },
      {
        key: "email-templates",
        label: "E-mail templates",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <path d="M2 6h12" />
            <path d="M5 9h6M5 11h4" />
          </svg>
        ),
      },
      {
        key: "broadcasts",
        label: "Broadcasts",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="8" cy="8" r="2" />
            <path d="M4.5 4.5a5 5 0 0 1 7 0" />
            <path d="M2.5 2.5a8 8 0 0 1 11 0" />
          </svg>
        ),
      },
      {
        key: "experiments",
        label: "Experimenten",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M6 2v5l-3 5h10l-3-5V2" />
            <path d="M5 2h6" />
          </svg>
        ),
      },
      {
        key: "discounts",
        label: "Kortingscodes",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M4 12l8-8" />
            <circle cx="5" cy="5" r="1.5" />
            <circle cx="11" cy="11" r="1.5" />
          </svg>
        ),
      },
      {
        key: "blog",
        label: "Blog / Nieuws",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M3 2h10v12H3z" />
            <path d="M5 5h6M5 7.5h6M5 10h3" />
          </svg>
        ),
      },
      {
        key: "images",
        label: "Afbeeldingen",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <circle cx="6" cy="6" r="1.5" />
            <path d="M2 11l4-4 2 2 4-4" />
          </svg>
        ),
      },
      {
        key: "layout-editor",
        label: "Layout Editor",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M2 12l3-3 2 2 4-4 3 3" />
            <rect x="2" y="2" width="12" height="12" rx="1" />
          </svg>
        ),
      },
      {
        key: "settings",
        label: "Instellingen",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.8 3.8l1.4 1.4M10.8 10.8l1.4 1.4M3.8 12.2l1.4-1.4M10.8 5.2l1.4-1.4" />
          </svg>
        ),
      },
    ],
  },
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
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/30 z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-50 lg:z-auto h-[calc(100dvh-64px)] w-[240px] bg-paper border-r border-rule overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="py-6">
          {SECTIONS.map((section) => (
            <div key={section.key} className="mb-6">
              <p className="px-5 text-[10px] font-medium tracking-[0.2em] uppercase text-ink/30 mb-2">
                {section.label}
              </p>
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onTabChange(item.key);
                    onMobileClose();
                  }}
                  className={`flex items-center gap-3 w-full px-5 py-2.5 text-[13px] transition-colors cursor-pointer ${
                    activeTab === item.key
                      ? "text-copper bg-copper/[0.06] border-r-2 border-copper"
                      : "text-ink/60 hover:text-ink hover:bg-warm/50"
                  }`}
                >
                  <span className={activeTab === item.key ? "text-copper" : "text-ink/35"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
