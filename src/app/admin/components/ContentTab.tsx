"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loading, EmptyState } from "./shared";
import { ContentFieldRenderer } from "./ContentFieldRenderer";
import type { FieldSchema } from "../../../../convex/siteSchemas";
import type { Lang } from "@/lib/i18n";

export function ContentTab() {
  const pages = useQuery(api.siteContent.listPages);
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  if (pages === undefined) return <Loading />;
  if (pages.length === 0) return <EmptyState text="Geen pagina's gevonden. Draai de seed eerst." />;

  const slug = selectedSlug || pages[0].slug;

  return (
    <div className="space-y-6">
      {/* Page selector */}
      <div className="flex items-center gap-4">
        <label className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          Pagina
        </label>
        <select
          value={slug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px] cursor-pointer"
        >
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title.nl}
            </option>
          ))}
        </select>
        <a
          href={`/${slug === "home" ? "" : slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-ink/30 hover:text-ink transition-colors"
        >
          Bekijk pagina
        </a>
      </div>

      {/* Section editor */}
      <PageSections slug={slug} />
    </div>
  );
}

function PageSections({ slug }: { slug: string }) {
  const page = useQuery(api.siteContent.getPage, { slug });
  const contentEntries = useQuery(api.siteContent.getPageContentAdmin, { slug });
  const updateSection = useMutation(api.siteContent.updateSection);
  const toggleSection = useMutation(api.siteContent.toggleSection);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("nl");
  const [editData, setEditData] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (page === undefined || contentEntries === undefined) return <Loading />;
  if (!page) return <EmptyState text="Pagina niet gevonden." />;

  const sortedSections = [...page.sections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  function getEntry(sectionId: string, lang: Lang) {
    return contentEntries?.find(
      (e) => e.sectionId === sectionId && e.lang === lang,
    );
  }

  function handleExpand(sectionId: string) {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
      setEditData(null);
      return;
    }
    setExpandedSection(sectionId);
    setError("");
    setSaved(null);
    const entry = getEntry(sectionId, activeLang);
    setEditData(entry?.parsedContent ?? {});
  }

  function handleLangSwitch(lang: Lang) {
    setActiveLang(lang);
    if (expandedSection) {
      const entry = getEntry(expandedSection, lang);
      setEditData(entry?.parsedContent ?? {});
    }
    setSaved(null);
    setError("");
  }

  async function handleSave(sectionId: string) {
    if (!editData) return;
    setSaving(true);
    setError("");
    setSaved(null);
    try {
      await updateSection({
        pageSlug: slug,
        sectionId,
        lang: activeLang,
        content: JSON.stringify(editData),
      });
      setSaved(sectionId);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(sectionId: string) {
    try {
      await toggleSection({ pageSlug: slug, sectionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij toggle.");
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
        {sortedSections.length} secties
      </p>

      {sortedSections.map((section) => {
        const isExpanded = expandedSection === section.id;
        const entry = getEntry(section.id, activeLang);
        const schema = entry?.parsedSchema as { label?: string; fields?: FieldSchema[] } | undefined;

        return (
          <div
            key={section.id}
            className="border border-rule rounded-[2px] overflow-hidden"
          >
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-3 hover:bg-warm/20 transition-colors">
              <button
                onClick={() => handleExpand(section.id)}
                className="flex items-center gap-3 flex-1 cursor-pointer text-left"
              >
                <span className="text-[10px] text-ink/30">
                  {isExpanded ? "▼" : "▶"}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    {schema?.label ?? section.type}
                  </p>
                  <p className="text-[11px] text-ink/30">
                    {section.id} · {section.type}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(section.id)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-[2px] cursor-pointer transition-colors ${
                    section.active
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-ink/5 text-ink/30 hover:bg-ink/10"
                  }`}
                >
                  {section.active ? "Actief" : "Uit"}
                </button>
              </div>
            </div>

            {/* Expanded content editor */}
            {isExpanded && entry && editData && (
              <div className="border-t border-rule px-4 py-5 bg-warm/10">
                {/* Lang toggle */}
                <div className="flex items-center gap-2 mb-5">
                  {(["nl", "en", "de"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLangSwitch(lang)}
                      className={`text-[11px] font-medium px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${
                        activeLang === lang
                          ? "bg-copper text-paper"
                          : "bg-ink/5 text-ink/40 hover:bg-ink/10"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Form fields */}
                {schema?.fields && (
                  <ContentFieldRenderer
                    fields={schema.fields}
                    data={editData as Record<string, unknown>}
                    displayData={(entry as { displayContent?: Record<string, unknown> }).displayContent}
                    onChange={setEditData}
                    pageSlug={slug}
                    sectionId={section.id}
                  />
                )}

                {/* Error */}
                {error && (
                  <p className="text-[12px] text-red-500 mt-3">{error}</p>
                )}

                {/* Save button */}
                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={() => handleSave(section.id)}
                    disabled={saving}
                    className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
                  >
                    {saving ? "Opslaan..." : "Opslaan"}
                  </button>
                  {saved === section.id && (
                    <span className="text-[12px] text-green-600">Opgeslagen</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
