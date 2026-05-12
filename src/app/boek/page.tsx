import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import {
  ButtonLink,
  ButtonArrow,
} from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Testimonials3D } from "@/components/sections/Testimonials3D";
import { VideoGrid } from "@/components/sections/VideoGrid";
import { CrossLink } from "@/components/sections/training/CrossLink";
import { TrainingCta } from "@/components/sections/training/TrainingCta";
import { BookPricing } from "@/components/sections/BookPricing";
import { Faq } from "@/components/sections/Faq";
import { BookPreview } from "@/components/sections/BookPreview";
import { JsonLd, bookJsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { loadPageContent, loadPageMeta, sectionOr } from "@/lib/site-content-loader";
import { loadSiteImages, imgUrl } from "@/lib/site-images";
import { getBoekContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  const c = getBoekContent(lang);
  return await loadPageMeta("boek", lang, {
    title: c.meta.title,
    description: c.meta.description,
  });
}

export default async function BoekPage() {
  const lang = await getLocale();
  const fallback = getBoekContent(lang);
  const db = await loadPageContent("boek", lang);

  const hero = sectionOr(db, "hero", fallback.hero);
  const dbReviews = db["reviews"] as Record<string, unknown> | undefined;
  const reviews = {
    eyebrow: (dbReviews?.eyebrow as string) ?? fallback.testimonials.eyebrow,
    title: (dbReviews?.title as string) ?? fallback.testimonials.title,
    titleAccent: (dbReviews?.titleAccent as string) ?? fallback.testimonials.titleAccent,
    reviews: (dbReviews?.items as typeof fallback.testimonials.reviews) ?? fallback.testimonials.reviews,
  };
  const bestellen = sectionOr(db, "bestellen", {});
  const videos = sectionOr(db, "videos", fallback.videos);
  const interview = sectionOr(db, "interview", fallback.interview);
  const crossLink = sectionOr(db, "cross-link", fallback.crossLink);
  const faq = sectionOr(db, "faq", fallback.faq);
  const cta = sectionOr(db, "cta", fallback.cta);

  // Load only cover + first 2 preview pages server-side (rest lazy-loaded client-side)
  const previewKeys = [
    "book/preview/page-5.png",
    "book/preview/page-6.png",
    "book/preview/page-7.png",
    "book/preview/page-8.png",
    "book/preview/page-9.png",
    "book/preview/page-11.png",
    "book/preview/page-14.png",
    "book/preview/page-19.png",
    "book/preview/page-21.png",
    "book/preview/page-25.png",
    "book/preview/page-27.png",
    "book/preview/page-28.png",
    "book/preview/page-31.png",
    "book/preview/page-33.png",
    "book/preview/page-35.png",
    "book/preview/page-39.png",
    "book/preview/page-132.png",
  ];
  const coverKey = "book/sales-oprecht-ontspannen-cover.png";
  // Fetch cover + first 2 pages server-side, rest use static paths (preloaded client-side)
  const initialKeys = [coverKey, ...previewKeys.slice(0, 2)];
  const bookImages = await loadSiteImages(initialKeys);
  const previewPages = previewKeys.map((k, i) =>
    i < 2 ? imgUrl(bookImages, k) : `/images/${k}`,
  );
  const coverUrl = imgUrl(bookImages, coverKey);

  return (
    <>
      <JsonLd data={bookJsonLd} />
      {/* Book Hero */}
      <section className="py-16 sm:py-[110px] border-b border-rule bg-paper">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-16 items-center">
            <div className="flex justify-center lg:justify-start pb-4">
              <div className="relative w-[260px] sm:w-[320px] lg:w-[380px]">
                <Image
                  src={(hero as { image?: string }).image || coverUrl}
                  alt={hero.imageAlt}
                  width={380}
                  height={570}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            <FadeIn>
              <Label className="mb-3">{hero.label}</Label>
              <h1 className="font-display text-[clamp(32px,4.2vw,54px)] font-black leading-[0.97] tracking-[-0.03em] mb-5">
                {hero.titleLine1}
                <br />
                <em className="italic font-normal text-copper">
                  {hero.titleAccent}
                </em>
              </h1>
              <div className="space-y-4 mb-8 max-w-[520px]">
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                  {hero.paragraphs?.[0]}
                </p>
                <p className="text-[15px] sm:text-[16px] text-ink/80 leading-[1.8]">
                  {hero.paragraphs?.[1]}{" "}
                  <strong className="font-semibold text-ink">
                    {hero.boldText}
                  </strong>
                  {hero.afterBold}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                {(hero.badges ?? []).map((badge: string) => (
                  <span
                    key={badge}
                    className="text-[12px] font-medium text-ink/70 px-3.5 py-1.5 border border-rule rounded-[2px]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink
                  href="#bestellen"
                  variant="copper"
                  size="large"
                >
                  <ButtonArrow>{{ nl: "Bestel het boek", en: "Order the Dutch book", de: "Das niederländische Buch bestellen" }[lang]}</ButtonArrow>
                </ButtonLink>
                {(lang === "en" || lang === "de") && (
                  <ButtonLink
                    href="/contact"
                    variant="ghost"
                    size="large"
                  >
                    <ButtonArrow>{{ en: "Pre-order the English version", de: "Englische Version vorbestellen" }[lang === "de" ? "de" : "en"]}</ButtonArrow>
                  </ButtonLink>
                )}
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      <BookPreview lang={lang} pages={previewPages} coverImage={coverUrl} />

      <BookPricing lang={lang} content={bestellen} />

      <Testimonials3D
        eyebrow={reviews.eyebrow}
        title={reviews.title}
        titleAccent={reviews.titleAccent}
        reviews={reviews.reviews}
      />

      {/* Interview — Managementboek.nl */}
      <section className="py-16 sm:py-[110px] border-b border-rule">
        <Container>
          {/* Hero: image + text overlay style */}
          <FadeIn className="mb-10 sm:mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border border-rule rounded-[2px] overflow-hidden">
              {/* Photo — 2 cols on desktop */}
              <div className="lg:col-span-2 relative aspect-square lg:aspect-auto">
                <Image
                  src={interview.image}
                  alt={interview.imageAlt}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              {/* Text — 3 cols on desktop */}
              <div className="lg:col-span-3 bg-warm/40 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
                <Label className="mb-4">{interview.eyebrow}</Label>
                <h2 className="font-display text-[clamp(26px,3vw,40px)] font-black leading-[0.97] tracking-[-0.03em] mb-4">
                  {interview.title}
                  <br />
                  <em className="italic font-normal text-ink/40">
                    {interview.titleAccent}
                  </em>
                </h2>
                <p className="text-[15px] text-ink/60 leading-[1.8] mb-6">
                  {interview.intro}
                </p>
                <a
                  href={interview.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase text-copper hover:text-copper-light transition-colors"
                >
                  {interview.linkText}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7h8M8 4l3 3-3 3" />
                  </svg>
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Quotes grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-rule border border-rule rounded-[2px] overflow-hidden">
            {(interview.quotes ?? []).map((q: { question: string; answer: string }) => (
              <div key={q.question} className="bg-paper p-6 sm:p-8">
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper block mb-3">
                  {q.question}
                </span>
                <p className="text-[14px] sm:text-[15px] text-ink/70 leading-[1.75] italic">
                  &ldquo;{q.answer}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Faq
        title={faq.title}
        titleAccent={faq.titleAccent}
        items={faq.items}
      />

      <VideoGrid
        eyebrow={videos.eyebrow}
        title={videos.title}
        description={videos.description}
        videos={videos.items}
      />

      <CrossLink
        eyebrow={crossLink.eyebrow}
        title={crossLink.title}
        titleAccent={crossLink.titleAccent}
        description={crossLink.description}
        image={crossLink.image}
        imageAlt={crossLink.imageAlt}
        href={crossLink.href}
        ctaLabel={crossLink.ctaLabel}
      />

      <TrainingCta
        title={cta.title}
        titleAccent={cta.titleAccent}
        description={cta.description}
        href={cta.href}
        ctaLabel={cta.ctaLabel}
      />
    </>
  );
}
