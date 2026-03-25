"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

const CATEGORIES = [
  { key: "all", nl: "Alles", en: "All", de: "Alle" },
  { key: "training", nl: "Training", en: "Training", de: "Training" },
  { key: "boek", nl: "Boek", en: "Book", de: "Buch" },
  { key: "nieuws", nl: "Nieuws", en: "News", de: "Neuigkeiten" },
  { key: "persoonlijk", nl: "Persoonlijk", en: "Personal", de: "Persönlich" },
];

function formatDate(ts: number, lang: Lang) {
  return new Date(ts).toLocaleDateString({ nl: "nl-NL", en: "en-GB", de: "de-DE" }[lang], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogList({ lang }: { lang: Lang }) {
  const [category, setCategory] = useState("all");
  const posts = useQuery(api.blog.listPublished, {
    category: category === "all" ? undefined : category,
    lang,
  });

  return (
    <div>
      {/* Category filter */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`text-[12px] px-4 py-2 rounded-[2px] cursor-pointer transition-colors ${
              category === cat.key
                ? "bg-copper text-paper"
                : "border border-rule text-ink/50 hover:text-ink hover:border-ink/30"
            }`}
          >
            {cat[lang]}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {posts === undefined ? (
        <div className="text-center py-20 text-ink/30 text-[14px]">Laden...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-ink/30 text-[14px]">
          {{ nl: "Geen artikelen gevonden.", en: "No articles found.", de: "Keine Artikel gefunden." }[lang]}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/nieuws/${post.slug}`}
              className="bg-paper p-6 hover:bg-warm/30 transition-colors group block"
            >
              {/* Image or video thumbnail */}
              {post.imageUrl && (
                <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-[2px] bg-warm">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              {!post.imageUrl && post.videoUrl && (
                <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-[2px] bg-ink flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="white" opacity={0.7}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}

              {/* Category + date + auto-translated badge */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
                  {CATEGORIES.find((c) => c.key === post.category)?.[lang] ?? post.category}
                </span>
                <span className="text-[11px] text-ink/30">{formatDate(post.publishedAt, lang)}</span>
                {post.autoTranslated && (
                  <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-ink/30 border border-rule px-1.5 py-0.5 rounded-[2px]">
                    {{ nl: "Automatisch vertaald", en: "Auto-translated", de: "Automatisch übersetzt" }[lang]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-display text-[17px] font-bold leading-[1.3] tracking-[-0.01em] mb-2 group-hover:text-copper transition-colors">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-[13px] text-ink/55 leading-[1.65] line-clamp-2">
                {post.excerpt}
              </p>

              {/* Likes */}
              {post.likes > 0 && (
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-ink/30">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  {post.likes}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
