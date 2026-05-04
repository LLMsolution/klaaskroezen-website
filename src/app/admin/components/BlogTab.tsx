"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading, EmptyState, formatDate } from "./shared";
import { AdminImageUpload } from "./AdminImageUpload";

/** Convert plain text with markdown-light syntax to HTML */
function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      // Headings
      if (block.startsWith("## ")) return `<h2>${formatInline(block.slice(3))}</h2>`;
      if (block.startsWith("### ")) return `<h3>${formatInline(block.slice(4))}</h3>`;
      // Regular paragraph — preserve single line breaks as <br>
      return `<p>${formatInline(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

/** Bold, italic, links */
function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

/** Convert HTML back to plain text for editing */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, "## $1")
    .replace(/<h3>(.*?)<\/h3>/g, "### $1")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<p>([\s\S]*?)<\/p>/g, "$1")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type View = "list" | "create" | "edit";

const CATEGORIES = [
  { key: "training", label: "Training" },
  { key: "boek", label: "Boek" },
  { key: "nieuws", label: "Nieuws" },
  { key: "persoonlijk", label: "Persoonlijk" },
];

const TIME_FILTERS = [
  { key: "3m", label: "3 maanden" },
  { key: "6m", label: "6 maanden" },
  { key: "12m", label: "12 maanden" },
  { key: "all", label: "Alles" },
];

export function BlogTab() {
  const posts = useQuery(api.blog.listAll);
  const createPost = useMutation(api.blog.createPost);
  const updatePost = useMutation(api.blog.updatePost);
  const deletePost = useMutation(api.blog.deletePost);
  const notifySubscribers = useMutation(api.blog.notifySubscribers);
  const [notifying, setNotifying] = useState<string | null>(null);

  const [view, setView] = useState<View>("list");
  const [editId, setEditId] = useState<Id<"blogPosts"> | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTime, setFilterTime] = useState("all");

  // Form state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const saveImage = useMutation(api.blog.saveImage);
  const removeImage = useMutation(api.blog.removeImage);
  const [videoUrl, setVideoUrl] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [category, setCategory] = useState("nieuws");
  const [lang, setLang] = useState<"nl" | "en" | "de">("nl");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  if (posts === undefined) return <Loading />;

  function resetForm() {
    setSlug("");
    setTitle("");
    setExcerpt("");
    setBody("");
    setImageUrl("");
    setVideoUrl("");
    setCtaText("");
    setCtaUrl("");
    setCategory("nieuws");
    setLang("nl");
    setPublished(true);
    setError("");
    setShowPreview(false);
  }

  function startEdit(post: NonNullable<typeof posts>[0]) {
    setEditId(post._id);
    setSlug(post.slug);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setBody(htmlToPlainText(post.body));
    setImageUrl(post.imageUrl || "");
    setVideoUrl(post.videoUrl || "");
    setCtaText(post.ctaText || "");
    setCtaUrl(post.ctaUrl || "");
    setCategory(post.category);
    setLang(((post as Record<string, unknown>).lang as "nl" | "en" | "de") ?? "nl");
    setPublished(post.published);
    setError("");
    setShowPreview(false);
    setView("edit");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const htmlBody = plainTextToHtml(body);
      if (view === "create") {
        await createPost({
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          title, excerpt, body: htmlBody,
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
          ctaText: ctaText || undefined,
          ctaUrl: ctaUrl || undefined,
          category, lang, published,
        });
      } else if (editId) {
        await updatePost({
          id: editId,
          title, excerpt, body: htmlBody,
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
          ctaText: ctaText || undefined,
          ctaUrl: ctaUrl || undefined,
          category, lang, published,
        });
      }
      // Only reset + close on create, keep edit view open so user can continue editing
      if (view === "create") {
        resetForm();
        setView("list");
        setEditId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"blogPosts">) {
    if (!confirm("Artikel verwijderen?")) return;
    await deletePost({ id });
  }

  const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
  const inputClass = "w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  // ── Form view ──
  if (view === "create" || view === "edit") {
    return (
      <div className="max-w-[700px] space-y-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
            {view === "create" ? "Nieuw artikel" : "Artikel bewerken"}
          </p>
          <button onClick={() => { setView("list"); resetForm(); setEditId(null); }} className="text-[12px] text-ink/40 hover:text-ink cursor-pointer">
            Annuleren
          </button>
        </div>

        <div>
          <label className={labelClass}>Titel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Titel van het artikel" />
        </div>

        {view === "create" && (
          <div>
            <label className={labelClass}>Slug (URL)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="wordt-automatisch-gegenereerd" />
            <p className="text-[11px] text-ink/30 mt-1">/nieuws/{slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "..."}</p>
          </div>
        )}

        <div>
          <label className={labelClass}>Samenvatting</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass + " resize-y"} placeholder="Korte samenvatting (zichtbaar in het overzicht)" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass + " mb-0"}>Inhoud</label>
            <button onClick={() => setShowPreview(!showPreview)} className="text-[11px] text-copper hover:text-copper-light cursor-pointer">
              {showPreview ? "Editor" : "Preview"}
            </button>
          </div>
          {showPreview ? (
            <div className="border border-rule rounded-[2px] p-5 bg-white min-h-[200px] prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: plainTextToHtml(body) }} />
          ) : (
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className={inputClass + " resize-y"} placeholder={"Schrijf je artikel hier...\n\nGebruik een lege regel voor een nieuwe paragraaf.\n\n## Kopje\n\nTekst met **vetgedrukt** en *cursief*."} />
          )}
          <p className="text-[10px] text-ink/25 mt-1">
            Lege regel = nieuwe paragraaf · ## = kopje · **vet** · *cursief*
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Afbeelding</label>
            {editId ? (
              <AdminImageUpload
                currentUrl={imageUrl || undefined}
                onUploaded={async (storageId) => {
                  setImageStorageId(storageId);
                  if (editId) {
                    await saveImage({ postId: editId, storageId });
                    // Refetch the updated post to get the resolved URL
                    const updated = posts?.find((p) => p._id === editId);
                    if (updated?.imageUrl) setImageUrl(updated.imageUrl);
                  }
                }}
                onRemoved={editId ? async () => {
                  setImageStorageId(null);
                  setImageUrl("");
                  if (editId) await removeImage({ postId: editId });
                } : undefined}
                alt="Blog afbeelding"
                imageKey="blog/post-image"
              />
            ) : (
              <AdminImageUpload
                onUploaded={(storageId) => setImageStorageId(storageId)}
                alt="Blog afbeelding"
                imageKey="blog/post-image"
              />
            )}
          </div>
          <div>
            <label className={labelClass}>Video URL (YouTube/Vimeo embed)</label>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputClass} placeholder="https://www.youtube.com/embed/..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>CTA knop tekst</label>
            <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputClass} placeholder="Bekijk de training" />
          </div>
          <div>
            <label className={labelClass}>CTA knop URL</label>
            <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className={inputClass} placeholder="/sales-excellence-training" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Categorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Taal</label>
            <div className="flex border border-rule rounded-[2px] overflow-hidden">
              {(["nl", "en", "de"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`flex-1 text-[12px] px-3 py-2.5 cursor-pointer transition-colors ${
                    lang === l ? "bg-copper text-paper" : "text-ink/50 hover:bg-warm/30"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <BlogTranslateButton
                title={title}
                excerpt={excerpt}
                body={body}
                sourceLang={lang}
                onTranslated={(t, target) => {
                  setTitle(t.title);
                  setExcerpt(t.excerpt);
                  setBody(t.body);
                  setLang(target);
                }}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <button onClick={() => setPublished(!published)} className={`text-[12px] font-medium px-4 py-2.5 rounded-[2px] cursor-pointer transition-colors ${published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-ink/5 text-ink/40 hover:bg-ink/10"}`}>
              {published ? "Gepubliceerd" : "Concept"}
            </button>
          </div>
        </div>

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <button onClick={handleSave} disabled={saving || !title || !excerpt || !body} className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40">
          {saving ? "Opslaan..." : view === "create" ? "Publiceren" : "Bijwerken"}
        </button>
      </div>
    );
  }

  // ── List view ──

  // Apply filters
  const filteredPosts = (posts ?? []).filter((post) => {
    if (filterCategory !== "all" && post.category !== filterCategory) return false;
    if (filterTime !== "all") {
      const months = { "3m": 3, "6m": 6, "12m": 12 }[filterTime] ?? 0;
      const cutoff = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
      if (post.publishedAt < cutoff) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          {filteredPosts.length} van {posts.length} artikelen
        </p>
        <button onClick={() => { resetForm(); setView("create"); }} className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer">
          + Nieuw artikel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterCategory("all")} className={`text-[11px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${filterCategory === "all" ? "bg-copper text-paper" : "border border-rule text-ink/40 hover:text-ink"}`}>Alles</button>
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setFilterCategory(c.key)} className={`text-[11px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${filterCategory === c.key ? "bg-copper text-paper" : "border border-rule text-ink/40 hover:text-ink"}`}>{c.label}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {TIME_FILTERS.map((tf) => (
            <button key={tf.key} onClick={() => setFilterTime(tf.key)} className={`text-[11px] px-3 py-1.5 rounded-[2px] cursor-pointer transition-colors ${filterTime === tf.key ? "bg-ink text-paper" : "text-ink/30 hover:text-ink/60"}`}>{tf.label}</button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState text="Geen artikelen gevonden met deze filters." />
      ) : (
        <div className="space-y-2">
          {filteredPosts.map((post) => (
            <div key={post._id} className="flex items-center justify-between border border-rule rounded-[2px] px-4 py-3 hover:bg-warm/20 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-[2px] font-medium ${post.published ? "bg-green-100 text-green-700" : "bg-ink/5 text-ink/40"}`}>
                    {post.published ? "Live" : "Concept"}
                  </span>
                  <span className="text-[10px] text-copper font-medium tracking-[0.1em] uppercase">{post.category}</span>
                  <span className="text-[10px] text-ink/30">{formatDate(post.publishedAt)}</span>
                </div>
                <p className="text-[14px] font-medium text-ink truncate">{post.title}</p>
                <p className="text-[12px] text-ink/40 truncate">{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {post.likes > 0 && (
                  <span className="text-[11px] text-ink/30">{post.likes} likes</span>
                )}
                <Link href={`/nieuws/${post.slug}`} target="_blank" className="text-[11px] text-ink/30 hover:text-copper cursor-pointer">
                  Bekijk
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm("E-mail sturen naar alle abonnees over dit artikel?")) return;
                    setNotifying(post._id);
                    try { await notifySubscribers({ postId: post._id as Id<"blogPosts"> }); } catch {}
                    setNotifying(null);
                  }}
                  disabled={notifying === post._id}
                  className="text-[11px] text-ink/30 hover:text-copper cursor-pointer disabled:opacity-50"
                >
                  {notifying === post._id ? "Verzenden..." : "Mailen"}
                </button>
                <button onClick={() => startEdit(post)} className="text-[11px] text-copper hover:text-copper-light cursor-pointer">
                  Bewerken
                </button>
                <button onClick={() => handleDelete(post._id)} className="text-[11px] text-ink/30 hover:text-red-500 cursor-pointer">
                  Verwijder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Blog translate button: translates title+excerpt+body to EN or DE ─── */

function BlogTranslateButton({ title, excerpt, body, sourceLang, onTranslated }: {
  title: string;
  excerpt: string;
  body: string;
  sourceLang: "nl" | "en" | "de";
  onTranslated: (fields: { title: string; excerpt: string; body: string }, lang: "nl" | "en" | "de") => void;
}) {
  const translateField = useAction(api.aiTranslate.translateField);
  const [loading, setLoading] = useState(false);
  const targetCandidates = (["nl", "en", "de"] as const).filter((l) => l !== sourceLang);
  const [targetLang, setTargetLang] = useState<"nl" | "en" | "de">(targetCandidates[0] ?? "en");

  // If sourceLang changes (user switched form lang), make sure target stays valid.
  if (targetLang === sourceLang) {
    const fallback = targetCandidates[0] ?? "en";
    if (fallback !== targetLang) setTargetLang(fallback);
  }

  async function handleTranslate() {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const [tTitle, tExcerpt, tBody] = await Promise.all([
        translateField({ text: title, targetLang, sourceLang, html: false }),
        translateField({ text: excerpt, targetLang, sourceLang, html: false }),
        translateField({ text: body, targetLang, sourceLang, html: true }),
      ]);
      onTranslated({ title: tTitle, excerpt: tExcerpt, body: tBody }, targetLang);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] text-ink/50">Vertaal {sourceLang.toUpperCase()} →</span>
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value as "nl" | "en" | "de")}
        disabled={loading}
        className="text-[11px] border border-rule rounded-[2px] px-2 py-1 bg-transparent text-ink/60 cursor-pointer"
      >
        {targetCandidates.map((l) => (
          <option key={l} value={l}>{l.toUpperCase()}</option>
        ))}
      </select>
      <button type="button" onClick={handleTranslate} disabled={loading || !title.trim()}
        className="text-[11px] text-copper hover:text-copper-light cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
        {loading ? "Vertalen..." : "Vertaal artikel"}
      </button>
    </div>
  );
}
