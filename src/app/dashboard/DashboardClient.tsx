"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { ProfileEditor } from "./ProfileEditor";
import { ProductCatalog } from "./ProductCatalog";
import { DownloadsSection } from "./DownloadsSection";

const COPY: Record<Lang, { welcome: string; login: string; loginBody: string; loginCta: string; profile: string }> = {
  nl: { welcome: "Welkom", login: "Log in om je dashboard te bekijken.", loginBody: "Bekijk je aankopen, download je bestanden en beheer je account.", loginCta: "Inloggen", profile: "Mijn gegevens" },
  en: { welcome: "Welcome", login: "Log in to view your dashboard.", loginBody: "View your purchases, download files and manage your account.", loginCta: "Log in", profile: "My details" },
  de: { welcome: "Willkommen", login: "Melden Sie sich an, um Ihr Dashboard zu sehen.", loginBody: "Sehen Sie Ihre Einkaufe, laden Sie Dateien herunter und verwalten Sie Ihr Konto.", loginCta: "Anmelden", profile: "Meine Daten" },
};

export function DashboardClient({ initialLang }: { initialLang: Lang }) {
  const user = useQuery(api.users.getCurrentUser);
  const invoices = useQuery(api.users.getMyInvoices);
  const downloads = useQuery(api.users.getMyDownloads, { lang: initialLang });
  const { signOut } = useAuthActions();

  const profile = useQuery(api.users.getMyProfile);
  const updateMyProfile = useMutation(api.users.updateMyProfile);
  const [profileOpen, setProfileOpen] = useState(false);

  // `initialLang` is read server-side from the cookie and refreshed on every
  // request (page.tsx is force-dynamic), so a language switch is reflected
  // immediately after router.refresh() without a full page reload.
  const lang = initialLang;
  const copy = COPY[lang];

  if (user === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-ink/30 text-[14px]">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-7">
        <div className="text-center max-w-[400px]">
          <h1 className="font-display text-[28px] font-black leading-[0.97] tracking-[-0.03em] mb-4">{copy.login}</h1>
          <p className="text-[15px] text-ink/60 leading-[1.7] mb-8">{copy.loginBody}</p>
          <Link href="/login" className="inline-block bg-copper text-paper px-8 py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]">
            {copy.loginCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] px-7 py-12 lg:py-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-2">Dashboard</p>
          <h1 className="font-display text-[clamp(26px,3.4vw,36px)] font-black leading-[0.97] tracking-[-0.03em]">
            {copy.welcome}{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {user.isAdmin && (
            <Link href="/admin" className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors">
              Admin
            </Link>
          )}
          <button onClick={() => signOut()} className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer">
            Uitloggen
          </button>
        </div>
      </div>

      <ProductCatalog lang={lang} />

      <DownloadsSection downloads={downloads} invoices={invoices} lang={lang} />

      {/* Profile / Account (collapsible) */}
      <section className="mb-12">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center justify-between w-full text-left cursor-pointer"
        >
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">{copy.profile}</h2>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-ink/30 transition-transform ${profileOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {profileOpen && (
          <ProfileEditor
            email={user.email}
            profile={profile}
            onSave={async (data) => { await updateMyProfile(data); }}
          />
        )}
      </section>
    </div>
  );
}
