"use client";

import { useState, useCallback } from "react";
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

const LOAD_MORE = { nl: "Meer laden", en: "Load more", de: "Mehr laden" };
const NO_ARTICLES = { nl: "Geen artikelen gevonden.", en: "No articles found.", de: "Keine Artikel gefunden." };

function formatDate(ts: number, lang: Lang) {
  return new Date(ts).toLocaleDateString({ nl: "nl-NL", en: "en-GB", de: "de-DE" }[lang], {
    year: "numeric", month: "long", day: "numeric",
  });
}

type Post = { _id: string; slug: string; title: string; excerpt: string; imageUrl?: string; videoUrl?: string; category: string; publishedAt: number; likes: number; autoTranslated?: boolean };

export function BlogList({ lang }: { lang: Lang }) {
  const [category, setCategory] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loadedInitial, setLoadedInitial] = useState(false);

  const result = useQuery(api.blog.listPublished, {
    category: category === "all" ? undefined : category,
    lang,
    cursor,
    limit: 12,
  });

  // Append new posts when result changes
  const processResult = useCallback(() => {
    if (!result) return;
    if (!loadedInitial) {
      setAllPosts(result.posts as Post[]);
      setLoadedInitial(true);
    } else if (cursor && result.posts.length > 0) {
      setAllPosts((prev) => {
        const ids = new Set(prev.map((p) => p._id));
        const newPosts = (result.posts as Post[]).filter((p) => !ids.has(p._id));
        return [...prev, ...newPosts];
      });
    }
  }, [result, cursor, loadedInitial]);
  if (result && !loadedInitial) processResult();

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    setCursor(undefined);
    setAllPosts([]);
    setLoadedInitial(false);
  }

  function handleLoadMore() {
    if (result?.nextCursor) {
      setCursor(result.nextCursor);
      // Will trigger new query, append results
      const ids = new Set(allPosts.map((p) => p._id));
      if (result.posts.length > 0) {
        const newPosts = (result.posts as Post[]).filter((p) => !ids.has(p._id));
        if (newPosts.length === 0 && result.nextCursor) {
          // Already have these, use the cursor
        }
      }
    }
  }

  // Use result.posts for display after initial load is handled
  const displayPosts = loadedInitial ? allPosts : [];
  const isLoading = result === undefined;
  const hasMore = result?.nextCursor != null;

  return (
    <div>
      {/* Category filter */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
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

      {/* Skeleton loading */}
      {isLoading && <SkeletonGrid />}

      {/* Empty state */}
      {!isLoading && displayPosts.length === 0 && (
        <div className="text-center py-20 text-ink/30 text-[14px]">{NO_ARTICLES[lang]}</div>
      )}

      {/* Posts grid */}
      {displayPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
          {displayPosts.map((post, idx) => (
            <Link
              key={post._id}
              href={`/nieuws/${post.slug}`}
              className="bg-paper p-6 hover:bg-warm/30 transition-colors group block"
            >
              {post.imageUrl && (
                <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-[2px] bg-warm">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    loading={idx < 3 ? "eager" : "lazy"}
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
              <h2 className="font-display text-[17px] font-bold leading-[1.3] tracking-[-0.01em] mb-2 group-hover:text-copper transition-colors">
                {post.title}
              </h2>
              <p className="text-[13px] text-ink/55 leading-[1.65] line-clamp-2">{post.excerpt}</p>
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

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            className="border border-rule px-8 py-3 text-[13px] font-medium text-ink/60 hover:text-ink hover:border-ink/30 transition-colors rounded-[2px] cursor-pointer"
          >
            {LOAD_MORE[lang]}
          </button>
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-paper p-6">
          <div className="aspect-[16/10] mb-4 rounded-[2px] bg-warm animate-pulse" />
          <div className="h-3 w-20 bg-warm animate-pulse rounded-[2px] mb-3" />
          <div className="h-5 w-4/5 bg-warm animate-pulse rounded-[2px] mb-2" />
          <div className="h-4 w-full bg-warm/60 animate-pulse rounded-[2px] mb-1" />
          <div className="h-4 w-3/4 bg-warm/60 animate-pulse rounded-[2px]" />
        </div>
      ))}
    </div>
  );
}
