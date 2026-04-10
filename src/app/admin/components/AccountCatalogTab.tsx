"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type Lang = "nl" | "en" | "de";
type CatalogItem = {
  checkoutProductId: Id<"checkoutProducts">;
  category: "training" | "book";
  sortOrder: number;
};

const LANG_LABELS: Record<Lang, string> = { nl: "Nederlands", en: "English", de: "Deutsch" };

export function AccountCatalogTab() {
  const [editLang, setEditLang] = useState<Lang>("nl");

  return (
    <div>
      <p className="text-[13px] text-ink/50 mb-6">
        Stel per taal in welke producten op het &quot;Mijn account&quot; dashboard verschijnen. Cursisten zien elk product met een slotje als ze het nog niet bezitten.
      </p>

      {/* Language selector */}
      <div className="flex gap-2 mb-6">
        {(["nl", "en", "de"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setEditLang(l)}
            className={`px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] border transition-colors cursor-pointer ${
              editLang === l
                ? "bg-copper text-paper border-copper"
                : "bg-transparent text-ink/60 border-rule hover:border-copper/40"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      <CatalogEditor key={editLang} lang={editLang} />
    </div>
  );
}

function CatalogEditor({ lang }: { lang: Lang }) {
  const allProducts = useQuery(api.checkoutProducts.listAll);
  const currentItems = useQuery(api.accountCatalog.adminGet, { lang });
  const saveCatalog = useMutation(api.accountCatalog.adminSave);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (allProducts === undefined || currentItems === undefined) {
    return <div className="text-[13px] text-ink/30">Laden...</div>;
  }

  const activeProducts = allProducts.filter((p) => p.active);
  const selectedIds = new Set(currentItems.map((i) => i.checkoutProductId));

  async function toggle(productId: Id<"checkoutProducts">, productType: string) {
    const category = productType === "training" ? "training" : "book";
    let newItems: CatalogItem[];

    if (selectedIds.has(productId)) {
      newItems = currentItems!
        .filter((i) => i.checkoutProductId !== productId)
        .map((i, idx) => ({ ...i, sortOrder: idx }));
    } else {
      newItems = [
        ...currentItems!,
        { checkoutProductId: productId, category: category as "training" | "book", sortOrder: currentItems!.length },
      ];
    }

    setSaving(true);
    setSaved(false);
    await saveCatalog({ lang, items: newItems });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const trainings = activeProducts.filter((p) => p.productType === "training");
  const books = activeProducts.filter((p) => p.productType !== "training");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-[11px] text-ink/40">
        {saving && "Opslaan..."}
        {saved && <span className="text-green-600">Opgeslagen</span>}
      </div>

      {trainings.length > 0 && (
        <ProductGroup
          label="Trainingen"
          products={trainings}
          selectedIds={selectedIds}
          lang={lang}
          onToggle={toggle}
        />
      )}

      {books.length > 0 && (
        <ProductGroup
          label="Boeken"
          products={books}
          selectedIds={selectedIds}
          lang={lang}
          onToggle={toggle}
        />
      )}

      {activeProducts.length === 0 && (
        <p className="text-[13px] text-ink/40">
          Geen actieve betaalpagina&apos;s gevonden. Maak eerst producten aan.
        </p>
      )}
    </div>
  );
}

type Product = {
  _id: Id<"checkoutProducts">;
  slug: string;
  name: { nl: string; en: string; de?: string };
  shortName: { nl: string; en: string; de?: string };
  productType: string;
  priceCents: number;
};

function ProductGroup({
  label,
  products,
  selectedIds,
  lang,
  onToggle,
}: {
  label: string;
  products: Product[];
  selectedIds: Set<Id<"checkoutProducts">>;
  lang: string;
  onToggle: (id: Id<"checkoutProducts">, productType: string) => void;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
        {label}
      </h3>
      <div className="space-y-2">
        {products.map((p) => {
          const selected = selectedIds.has(p._id);
          const name = (p.name as Record<string, string>)[lang] || p.name.nl || p.name.en;
          const price = `€ ${(p.priceCents / 100).toFixed(2).replace(".", ",")}`;

          return (
            <button
              key={p._id}
              onClick={() => onToggle(p._id, p.productType)}
              className={`w-full flex items-center gap-4 p-4 border rounded-[2px] text-left transition-colors cursor-pointer ${
                selected
                  ? "border-copper bg-copper/5"
                  : "border-rule hover:border-copper/30"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded-[2px] border flex items-center justify-center shrink-0 transition-colors ${
                  selected
                    ? "bg-copper border-copper"
                    : "bg-transparent border-ink/20"
                }`}
              >
                {selected && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-paper">
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-ink truncate">{name}</p>
                <p className="text-[12px] text-ink/40">{p.slug} · {price}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
