"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Lang } from "@/lib/i18n";

type LocalizedStr = { nl: string; en: string; de?: string };
function loc(obj: LocalizedStr, lang: Lang): string {
  return obj[lang] ?? obj.en;
}

type CopyKeys = {
  trainings: string;
  books: string;
  order: string;
  owned: string;
  ordered: string;
  download: string;
  listen: string;
  open: string;
  ofModules: string;
  completed: string;
};

const COPY: Record<Lang, CopyKeys> = {
  nl: { trainings: "Trainingen", books: "Boeken", order: "Bestellen", owned: "Gekocht", ordered: "Besteld", download: "Download", listen: "Luisteren", open: "Openen", ofModules: "van", completed: "voltooid" },
  en: { trainings: "Trainings", books: "Books", order: "Order", owned: "Owned", ordered: "Ordered", download: "Download", listen: "Listen", open: "Open", ofModules: "of", completed: "completed" },
  de: { trainings: "Trainings", books: "Bucher", order: "Bestellen", owned: "Gekauft", ordered: "Bestellt", download: "Download", listen: "Anhoren", open: "Offnen", ofModules: "von", completed: "abgeschlossen" },
};

type CatalogItem = {
  slug: string;
  name: LocalizedStr;
  shortName: LocalizedStr;
  category: string;
  dashboardAction: "training" | "download" | "audiobook" | "physical";
  linkedTrainingSlug?: string;
  image?: string;
  priceCents: number;
  owned: boolean;
};

export function ProductCatalog({ lang }: { lang: Lang }) {
  const catalog = useQuery(api.accountCatalog.getForLangWithAccess, { lang });
  const myTrainings = useQuery(api.trainingProgress.getMyTrainings);
  const myDownloads = useQuery(api.users.getMyDownloads, { lang });
  const copy = COPY[lang];

  if (catalog === undefined) return null;
  if (catalog.length === 0) return null;

  const trainingBySlug = new Map(
    (myTrainings ?? []).map((t) => [t.slug, t]),
  );
  const downloadsByProduct = new Map<string, { url: string; fileName: string }>();
  for (const d of myDownloads ?? []) {
    downloadsByProduct.set(d.product, { url: d.url, fileName: d.fileName });
  }

  const trainings = catalog.filter((i) => i.category === "training");
  const books = catalog.filter((i) => i.category === "book");

  function getTraining(item: CatalogItem) {
    if (!item.linkedTrainingSlug) return undefined;
    return trainingBySlug.get(item.linkedTrainingSlug);
  }

  return (
    <>
      {trainings.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">{copy.trainings}</h2>
          <div className="space-y-3">
            {trainings.map((item) => (
              <CatalogCard key={item.slug} item={item} lang={lang} copy={copy} training={getTraining(item)} download={downloadsByProduct.get(item.slug)} />
            ))}
          </div>
        </section>
      )}
      {books.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">{copy.books}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {books.map((item) => (
              <CatalogCard key={item.slug} item={item} lang={lang} copy={copy} training={getTraining(item)} download={downloadsByProduct.get(item.slug)} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

type TrainingInfo = {
  slug: string;
  title: LocalizedStr;
  overallProgress: number;
  completedModules: number;
  totalModules: number;
  lastModuleSlug?: string;
};

function CatalogCard({ item, lang, copy, training, download }: {
  item: CatalogItem; lang: Lang; copy: CopyKeys;
  training?: TrainingInfo; download?: { url: string; fileName: string };
}) {
  const name = loc(item.name, lang);

  if (item.owned) {
    return <OwnedCard item={item} name={name} lang={lang} copy={copy} training={training} download={download} />;
  }

  return (
    <Link href={`/checkout/${item.slug}`} className="flex items-center gap-4 p-4 border border-rule rounded-[2px] hover:border-copper/40 transition-colors group">
      <ProductImage image={item.image} name={name} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors truncate">{name}</p>
        <p className="text-[12px] text-ink/40">€ {(item.priceCents / 100).toFixed(2).replace(".", ",")}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-copper">{copy.order}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/30">
          <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
        </svg>
      </div>
    </Link>
  );
}

function OwnedCard({ item, name, lang, copy, training, download }: {
  item: CatalogItem; name: string; lang: Lang; copy: CopyKeys;
  training?: TrainingInfo; download?: { url: string; fileName: string };
}) {
  const action = item.dashboardAction;

  // Training → progress + link (fallback to linkedTrainingSlug if no progress record)
  if (action === "training") {
    const slug = training?.slug ?? item.linkedTrainingSlug;
    if (slug) {
      const href = training?.lastModuleSlug ? `/training/${slug}/${training.lastModuleSlug}` : `/training/${slug}`;
      return (
        <Link href={href} className="flex items-center gap-4 p-4 border border-copper/30 bg-copper/[0.03] rounded-[2px] hover:border-copper/50 transition-colors group">
          <ProductImage image={item.image} name={name} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors truncate">{name}</p>
            {training && (
              <p className="text-[12px] text-ink/40">{training.completedModules} {copy.ofModules} {training.totalModules} · {training.overallProgress}% {copy.completed}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {training && (
              <div className="w-16"><div className="h-1.5 bg-warm rounded-full overflow-hidden"><div className="h-full bg-copper rounded-full" style={{ width: `${training.overallProgress}%` }} /></div></div>
            )}
            <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-copper">{copy.open}</span>
          </div>
        </Link>
      );
    }
  }

  // Audiobook → link to training page (fallback to linkedTrainingSlug)
  if (action === "audiobook") {
    const slug = training?.slug ?? item.linkedTrainingSlug;
    if (slug) {
      return (
        <Link href={`/training/${slug}`} className="flex items-center gap-4 p-4 border border-copper/30 bg-copper/[0.03] rounded-[2px] hover:border-copper/50 transition-colors group">
          <ProductImage image={item.image} name={name} />
          <div className="flex-1 min-w-0"><p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors truncate">{name}</p></div>
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-copper shrink-0">{copy.listen}</span>
        </Link>
      );
    }
  }

  // Download → download link
  if (action === "download" && download) {
    return (
      <a href={download.url} download={download.fileName} className="flex items-center gap-4 p-4 border border-copper/30 bg-copper/[0.03] rounded-[2px] hover:border-copper/50 transition-colors group">
        <ProductImage image={item.image} name={name} />
        <div className="flex-1 min-w-0"><p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors truncate">{name}</p></div>
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-copper shrink-0">{copy.download}</span>
      </a>
    );
  }

  // Physical → "Besteld"
  if (action === "physical") {
    return (
      <div className="flex items-center gap-4 p-4 border border-copper/30 bg-copper/[0.03] rounded-[2px]">
        <ProductImage image={item.image} name={name} />
        <div className="flex-1 min-w-0"><p className="text-[14px] font-medium text-ink truncate">{name}</p></div>
        <div className="flex items-center gap-2 shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper"><path d="M3 8l3 3 7-7" /></svg>
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-copper">{copy.ordered}</span>
        </div>
      </div>
    );
  }

  // Fallback — owned but action not matched (e.g. training without linkedTrainingSlug, download without file)
  return (
    <div className="flex items-center gap-4 p-4 border border-copper/30 bg-copper/[0.03] rounded-[2px]">
      <ProductImage image={item.image} name={name} />
      <div className="flex-1 min-w-0"><p className="text-[14px] font-medium text-ink truncate">{name}</p></div>
      <div className="flex items-center gap-2 shrink-0">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper"><path d="M3 8l3 3 7-7" /></svg>
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-copper">{copy.owned}</span>
      </div>
    </div>
  );
}

function ProductImage({ image, name }: { image?: string; name: string }) {
  return (
    <div className="w-14 h-14 rounded-[2px] bg-warm shrink-0 overflow-hidden relative">
      {image ? (
        <Image src={image} alt={name} fill sizes="56px" className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/20">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
          </svg>
        </div>
      )}
    </div>
  );
}
