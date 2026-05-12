import type { Metadata } from "next";
import { LegalPageBody } from "@/components/sections/LegalPageBody";
import { getLocale } from "@/lib/i18n/server";
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";
import { LegalFallback } from "./LegalFallback";

const SLUG = "privacy";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return await loadPageMeta(SLUG, lang, {
    title: "Privacystatement",
    description: "Privacystatement van Klaas Kroezen — hoe wij persoonsgegevens verwerken volgens de AVG.",
  });
}

type BodyContent = { label?: string; title?: string; noticeBadge?: string; body?: string };

export default async function PrivacyPage() {
  const lang = await getLocale();
  const db = await loadPageContent(SLUG, lang);
  const c = sectionOr<BodyContent>(db, "body", {});

  return (
    <LegalPageBody
      label={c.label || "Juridisch"}
      title={c.title || "Privacystatement"}
      noticeBadge={c.noticeBadge || "Concept — in afwachting van juridische review"}
      body={c.body || ""}
      fallback={<LegalFallback />}
    />
  );
}
