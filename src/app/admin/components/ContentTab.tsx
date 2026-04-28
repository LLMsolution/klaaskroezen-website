"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loading, EmptyState } from "./shared";
import { ContentFieldRenderer } from "./ContentFieldRenderer";
import type { FieldSchema } from "../../../../convex/siteSchemas";
import type { Lang } from "@/lib/i18n";

function isImageRef(val: unknown): val is string {
  return typeof val === "string" && (val.startsWith("convex:") || val.startsWith("/images/"));
}

/** Walk `nl` and copy every image-ref into `target` at the same path if target is empty there. */
function mergeImagesRecursive(target: unknown, nl: unknown): void {
  if (!nl || typeof nl !== "object") return;
  if (Array.isArray(nl)) {
    if (!Array.isArray(target)) return;
    for (let i = 0; i < Math.min(target.length, nl.length); i++) {
      const nlItem = nl[i];
      if (isImageRef(nlItem)) {
        if (!target[i] || target[i] === "") target[i] = nlItem;
      } else {
        mergeImagesRecursive(target[i], nlItem);
      }
    }
    return;
  }
  if (typeof target !== "object" || target === null) return;
  const tgt = target as Record<string, unknown>;
  for (const [key, val] of Object.entries(nl as Record<string, unknown>)) {
    if (isImageRef(val)) {
      if (!tgt[key] || tgt[key] === "") tgt[key] = val;
    } else if (val && typeof val === "object") {
      if (tgt[key] === undefined) continue;
      mergeImagesRecursive(tgt[key], val);
    }
  }
}

export function ContentTab() {
  const pages = useQuery(api.siteContent.listPages);
  const [selectedSlug, setSelectedSlug] = useState<string>("");

  if (pages === undefined) return <Loading />;
  if (pages.length === 0) return <EmptyState text="Geen pagina's gevonden. Draai de seed eerst." />;

  const PAGE_ORDER = [
    "home",
    "sales-excellence-training",
    "customer-success-training",
    "spreker",
    "boek",
    "over-ons",
    "contact",
  ];
  const sortedPages = [...pages].sort((a, b) => {
    const ai = PAGE_ORDER.indexOf(a.slug);
    const bi = PAGE_ORDER.indexOf(b.slug);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.title.nl.localeCompare(b.title.nl);
  });

  const slug = selectedSlug || sortedPages[0].slug;

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
          {sortedPages.map((p) => (
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
      <PageSections key={slug} slug={slug} />
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

  // Refs for scrolling to sections
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = useCallback((id: string, el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  // Scroll to section after expand — wait for DOM to render expanded content
  const pendingScrollRef = useRef<string | null>(null);
  useEffect(() => {
    if (pendingScrollRef.current) {
      const id = pendingScrollRef.current;
      pendingScrollRef.current = null;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = sectionRefs.current[id];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }
  });

  if (page === undefined || contentEntries === undefined) return <Loading />;
  if (!page) return <EmptyState text="Pagina niet gevonden." />;

  const sortedSections = [...page.sections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  function getEntry(sectionId: string, lang: Lang) {
    const direct = contentEntries?.find(
      (e) => e.sectionId === sectionId && e.lang === lang,
    );
    if (direct) return direct;
    return contentEntries?.find(
      (e) => e.sectionId === sectionId && e.lang === "nl",
    );
  }

  /**
   * For non-NL languages, fill empty image fields with NL values — recursively,
   * so nested items[].image (team-photos, slideshow, cards, logos) also inherit.
   */
  function withNlImageFallback(sectionId: string, lang: Lang, data: Record<string, unknown>): Record<string, unknown> {
    if (lang === "nl") return data;
    const nlEntry = contentEntries?.find((e) => e.sectionId === sectionId && e.lang === "nl");
    if (!nlEntry?.parsedContent) return data;
    const nlContent = nlEntry.parsedContent as Record<string, unknown>;
    const result = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    mergeImagesRecursive(result, nlContent);
    return result;
  }

  function handleExpand(sectionId: string) {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
      setEditData(null);
      return;
    }
    // Close current, open new, scroll to it
    setExpandedSection(sectionId);
    setError("");
    setSaved(null);
    const entry = getEntry(sectionId, activeLang);
    const data = entry?.parsedContent ?? {};
    setEditData(withNlImageFallback(sectionId, activeLang, data));
    pendingScrollRef.current = sectionId;
  }

  function handleLangSwitch(lang: Lang) {
    setActiveLang(lang);
    if (expandedSection) {
      const entry = getEntry(expandedSection, lang);
      const data = entry?.parsedContent ?? {};
      setEditData(withNlImageFallback(expandedSection, lang, data));
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
            ref={(el) => setSectionRef(section.id, el)}
            className="border border-rule rounded-[2px] overflow-hidden scroll-mt-[150px]"
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
                {/* Lang toggle + translate button */}
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
                  {activeLang !== "nl" && (
                    <button
                      onClick={() => {
                        const nlEntry = contentEntries?.find(
                          (e) => e.sectionId === section.id && e.lang === "nl",
                        );
                        if (nlEntry?.parsedContent) {
                          setEditData({ ...(nlEntry.parsedContent as Record<string, unknown>) });
                        }
                      }}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-[2px] cursor-pointer bg-copper/10 text-copper hover:bg-copper/20 transition-colors ml-auto"
                      title="Kopieer NL content om als basis voor vertaling te gebruiken"
                    >
                      ← Kopieer NL
                    </button>
                  )}
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
              </div>
            )}
          </div>
        );
      })}

      {/* Floating save button — visible when a section is expanded */}
      {expandedSection && editData && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {error && (
            <span className="text-[12px] text-red-500 bg-paper border border-red-200 px-3 py-2 rounded-[2px] shadow-lg">
              {error}
            </span>
          )}
          {saved && (
            <span className="text-[12px] text-green-600 bg-paper border border-green-200 px-3 py-2 rounded-[2px] shadow-lg">
              Opgeslagen
            </span>
          )}
          <button
            onClick={() => handleSave(expandedSection)}
            disabled={saving}
            className="bg-copper text-paper px-6 py-3 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40 shadow-lg"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      )}
    </div>
  );
}
