import type { Metadata } from "next";
import { LegalPageBody } from "@/components/sections/LegalPageBody";
import { getLocale } from "@/lib/i18n/server";
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";
import { LegalFallback } from "./LegalFallback";

const SLUG = "algemene-voorwaarden";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return await loadPageMeta(SLUG, lang, {
    title: "Algemene Voorwaarden",
    description: "Algemene voorwaarden van Klaas Kroezen — trainingen, coaching, boek (digitaal en fysiek) en keynotes.",
  });
}

type BodyContent = { label?: string; title?: string; noticeBadge?: string; body?: string };

export default async function AlgemeneVoorwaardenPage() {
  const lang = await getLocale();
  const db = await loadPageContent(SLUG, lang);
  const c = sectionOr<BodyContent>(db, "body", {});

  return (
    <LegalPageBody
      label={c.label || "Juridisch"}
      title={c.title || "Algemene Voorwaarden"}
      noticeBadge={c.noticeBadge || "Concept — in afwachting van juridische review"}
      body={c.body || ""}
      fallback={<LegalFallback />}
    />
  );
}
