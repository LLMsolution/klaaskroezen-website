import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Container } from "@/components/ui/Container";
import { getLocale } from "@/lib/i18n/server";
import { BlogInteractions } from "./BlogInteractions";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchQuery(api.blog.getBySlug, { slug });
  if (!post) return { title: "Niet gevonden" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(ts: number, lang: string) {
  return new Date(ts).toLocaleDateString({ nl: "nl-NL", en: "en-GB", de: "de-DE" }[lang] ?? "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLocale();
  const post = await fetchQuery(api.blog.getBySlug, { slug });

  if (!post) {
    return (
      <section className="py-16 sm:py-[110px]">
        <Container>
          <div className="text-center py-20">
            <h1 className="font-display text-[28px] font-black mb-4">
              {{ nl: "Artikel niet gevonden", en: "Article not found", de: "Artikel nicht gefunden" }[lang]}
            </h1>
            <Link href="/nieuws" className="text-copper hover:text-copper-light transition-colors">
              {{ nl: "Terug naar nieuws", en: "Back to news", de: "Zurück zu Neuigkeiten" }[lang]}
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-[110px]">
      <Container>
        <article className="max-w-[680px] mx-auto">
          {/* Back link */}
          <Link
            href="/nieuws"
            className="inline-flex items-center gap-2 text-[13px] text-ink/40 hover:text-copper transition-colors mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 7H3M6 4L3 7l3 3" />
            </svg>
            {{ nl: "Terug naar nieuws", en: "Back to news", de: "Zurück zu Neuigkeiten" }[lang]}
          </Link>

          {/* Category + date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">
              {post.category}
            </span>
            <span className="text-[12px] text-ink/30">{formatDate(post.publishedAt, lang)}</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-[clamp(28px,3.4vw,42px)] font-black leading-[1.05] tracking-[-0.03em] mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-[17px] text-ink/60 leading-[1.8] mb-8 italic">
            {post.excerpt}
          </p>

          {/* Image */}
          {post.imageUrl && (
            <div className="relative aspect-[16/9] mb-8 rounded-[2px] overflow-hidden bg-warm">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                sizes="680px"
                priority
              />
            </div>
          )}

          {/* Video */}
          {post.videoUrl && (
            <div className="relative aspect-video mb-8 rounded-[2px] overflow-hidden">
              <iframe
                src={post.videoUrl}
                title={post.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}

          {/* Body — server-rendered HTML */}
          <div
            className="prose prose-lg max-w-none text-[16px] text-ink/75 leading-[1.85] mb-10"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* CTA button */}
          {post.ctaText && post.ctaUrl && (
            <div className="mb-10">
              <Link
                href={post.ctaUrl}
                className="inline-block bg-copper text-paper px-8 py-3.5 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px]"
              >
                {post.ctaText}
              </Link>
            </div>
          )}

          {/* Like + Share — client component */}
          <BlogInteractions postId={post._id} initialLikes={post.likes} title={post.title} lang={lang} />
        </article>
      </Container>
    </section>
  );
}
