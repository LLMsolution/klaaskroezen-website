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
};

const COPY: Record<Lang, CopyKeys> = {
  nl: { trainings: "Trainingen", books: "Boeken", order: "Bestellen", owned: "Gekocht" },
  en: { trainings: "Trainings", books: "Books", order: "Order", owned: "Owned" },
  de: { trainings: "Trainings", books: "Bucher", order: "Bestellen", owned: "Gekauft" },
};

export function ProductCatalog({ lang }: { lang: Lang }) {
  const catalog = useQuery(api.accountCatalog.getForLangWithAccess, { lang });
  const copy = COPY[lang];

  if (catalog === undefined) return null; // loading
  if (catalog.length === 0) return null; // no catalog configured

  const trainings = catalog.filter((i) => i.category === "training");
  const books = catalog.filter((i) => i.category === "book");

  return (
    <>
      {trainings.length > 0 && (
        <CatalogGroup label={copy.trainings} items={trainings} lang={lang} copy={copy} />
      )}
      {books.length > 0 && (
        <CatalogGroup label={copy.books} items={books} lang={lang} copy={copy} />
      )}
    </>
  );
}

type CatalogItem = {
  slug: string;
  name: LocalizedStr;
  shortName: LocalizedStr;
  category: string;
  image?: string;
  priceCents: number;
  owned: boolean;
};

function CatalogGroup({
  label,
  items,
  lang,
  copy,
}: {
  label: string;
  items: CatalogItem[];
  lang: Lang;
  copy: CopyKeys;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
        {label}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <ProductCard key={item.slug} item={item} lang={lang} copy={copy} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  item,
  lang,
  copy,
}: {
  item: CatalogItem;
  lang: Lang;
  copy: CopyKeys;
}) {
  const name = loc(item.shortName, lang) || loc(item.name, lang);
  const price = `€ ${(item.priceCents / 100).toFixed(2).replace(".", ",")}`;

  // Owned → link to content. Training → /training/slug-without-suffix.
  // Not owned → link to checkout.
  const href = item.owned
    ? item.category === "training"
      ? `/training/${item.slug.replace(/-online$|-coaching$/, "")}`
      : "/dashboard"
    : `/checkout/${item.slug}`;

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-4 border rounded-[2px] transition-colors group ${
        item.owned
          ? "border-copper/30 bg-copper/[0.03]"
          : "border-rule hover:border-copper/40"
      }`}
    >
      {/* Product image or placeholder */}
      <div className="w-14 h-14 rounded-[2px] bg-warm shrink-0 overflow-hidden relative">
        {item.image ? (
          <Image
            src={item.image}
            alt={name}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/20">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-ink group-hover:text-copper transition-colors truncate">
          {name}
        </p>
        {!item.owned && (
          <p className="text-[12px] text-ink/40">{price}</p>
        )}
      </div>

      {/* Status: owned checkmark or locked padlock */}
      {item.owned ? (
        <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper">
            <path d="M3 8l3 3 7-7" />
          </svg>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-copper group-hover:text-copper-light transition-colors">
            {copy.order}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/30">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </div>
      )}
    </Link>
  );
}
