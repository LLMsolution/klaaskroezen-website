import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";
import { getLocale } from "@/lib/i18n/server";

// Re-run on every request so a language switch (cookie change + router.refresh)
// causes the server to pick up the new locale and pass it to the client.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mijn Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const lang = await getLocale();
  return <DashboardClient initialLang={lang} />;
}
