import type { Metadata } from "next";
import { LegalPageBody } from "@/components/sections/LegalPageBody";
import { getLocale } from "@/lib/i18n/server";
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";
import { LegalFallback } from "./LegalFallback";

const SLUG = "herroepingsformulier";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return await loadPageMeta(SLUG, lang, {
    title: "Modelformulier voor herroeping",
    description: "Standaard modelformulier voor herroeping van een bestelling bij Klaas Kroezen. Print of mail dit formulier om je herroepingsrecht uit te oefenen binnen 14 dagen.",
  });
}

type BodyContent = { label?: string; title?: string; noticeBadge?: string; body?: string };

export default async function HerroepingsformulierPage() {
  const lang = await getLocale();
  const db = await loadPageContent(SLUG, lang);
  const c = sectionOr<BodyContent>(db, "body", {});

  return (
    <LegalPageBody
      label={c.label || "Juridisch"}
      title={c.title || "Modelformulier voor herroeping"}
      noticeBadge={c.noticeBadge}
      body={c.body || ""}
      fallback={<LegalFallback />}
    />
  );
}
