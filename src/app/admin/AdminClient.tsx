"use client";

import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { AdminSidebar, type AdminTab } from "./components/AdminSidebar";
import { DashboardTab } from "./components/DashboardTab";
import { OrdersTab } from "./components/OrdersTab";
import { ContactsTab } from "./components/ContactsTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { EmailActivityTab } from "./components/EmailActivityTab";
import { EmailTemplatesTab } from "./components/EmailTemplatesTab";
import { BroadcastsTab } from "./components/BroadcastsTab";
import { ExperimentsTab } from "./components/ExperimentsTab";
import { DiscountsTab } from "./components/DiscountsTab";
import { SettingsTab } from "./components/SettingsTab";
import { BlogTab } from "./components/BlogTab";
import { CheckoutPagesTab } from "./components/CheckoutPagesTab";
import { ContentTab } from "./components/ContentTab";
import { TrainingsTab } from "./components/TrainingsTab";
import { PipelineTab } from "./components/crm/PipelineTab";
import { CrmContactsTab } from "./components/crm/CrmContactsTab";
import { AutomationsTab } from "./components/crm/AutomationsTab";
import { NurturingTab } from "./components/crm/NurturingTab";
import { CrmReportsTab } from "./components/crm/CrmReportsTab";
import { WorkflowsTab } from "./components/WorkflowsTab";
import { LayoutEditorTab } from "./components/LayoutEditorTab";
import { ImagesTab } from "./components/ImagesTab";

export function AdminClient() {
  const user = useQuery(api.users.getCurrentUser);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const TAB_LABELS: Record<AdminTab, string> = {
    dashboard: "Dashboard",
    orders: "Bestellingen",
    contacts: "Contacten",
    invoices: "Facturen",
    "email-activity": "E-mail activiteit",
    "crm-pipeline": "Pipeline",
    "crm-contacts": "CRM Contacten",
    "crm-automations": "Automations (legacy)",
    "crm-nurturing": "Nurturing (legacy)",
    "crm-workflows": "Workflows",
    "crm-reports": "Rapportages",
    content: "Content",
    trainings: "Trainingen",
    "checkout-pages": "Betaalpagina's",
    "email-templates": "E-mail templates",
    broadcasts: "Broadcasts",
    experiments: "Experimenten",
    discounts: "Kortingscodes",
    blog: "Blog / Nieuws",
    images: "Afbeeldingen",
    "layout-editor": "Layout Editor",
    settings: "Instellingen",
  };

  return (
    <div className="flex min-h-[calc(100dvh-64px)]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-16 z-30 bg-paper border-b border-rule px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-ink/40 hover:text-ink transition-colors cursor-pointer"
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5h12M3 9h12M3 13h12" />
              </svg>
            </button>
            <div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">Admin</p>
              <h1 className="font-display text-[20px] font-black tracking-[-0.02em]">
                {TAB_LABELS[activeTab]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-[12px] text-ink/40 hover:text-ink transition-colors"
            >
              Mijn account
            </Link>
            <button
              onClick={() => signOut()}
              className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer"
            >
              Uitloggen
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="px-6 lg:px-10 py-8">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "contacts" && <ContactsTab />}
          {activeTab === "invoices" && <InvoicesTab />}
          {activeTab === "email-activity" && <EmailActivityTab />}
          {activeTab === "crm-pipeline" && <PipelineTab />}
          {activeTab === "crm-contacts" && <CrmContactsTab />}
          {activeTab === "crm-automations" && <AutomationsTab />}
          {activeTab === "crm-nurturing" && <NurturingTab />}
          {activeTab === "crm-workflows" && <WorkflowsTab />}
          {activeTab === "crm-reports" && <CrmReportsTab />}
          {activeTab === "content" && <ContentTab />}
          {activeTab === "trainings" && <TrainingsTab />}
          {activeTab === "checkout-pages" && <CheckoutPagesTab />}
          {activeTab === "email-templates" && <EmailTemplatesTab />}
          {activeTab === "broadcasts" && <BroadcastsTab />}
          {activeTab === "experiments" && <ExperimentsTab />}
          {activeTab === "discounts" && <DiscountsTab />}
          {activeTab === "blog" && <BlogTab />}
          {activeTab === "images" && <ImagesTab />}
          {activeTab === "layout-editor" && <LayoutEditorTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
