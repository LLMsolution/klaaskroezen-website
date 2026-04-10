"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type Lang = "nl" | "en" | "de";
type DashboardAction = "training" | "download" | "audiobook" | "physical";
type CatalogItem = {
  checkoutProductId: Id<"checkoutProducts">;
  category: "training" | "book";
  dashboardAction: DashboardAction;
  linkedTrainingSlug?: string;
  sortOrder: number;
};

const LANG_LABELS: Record<Lang, string> = { nl: "Nederlands", en: "English", de: "Deutsch" };

const ACTION_LABELS: Record<DashboardAction, string> = {
  training: "Training (voortgang + openen)",
  download: "Download (PDF / EPUB)",
  audiobook: "Luisterboek (openen)",
  physical: "Fysiek product (besteld)",
};

export function AccountCatalogTab() {
  const [editLang, setEditLang] = useState<Lang>("nl");

  return (
    <div>
      <p className="text-[13px] text-ink/50 mb-6">
        Stel per taal in welke producten op het &quot;Mijn account&quot; dashboard verschijnen en wat er gebeurt als een cursist het product bezit.
      </p>

      <div className="flex gap-2 mb-6">
        {(["nl", "en", "de"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setEditLang(l)}
            className={`px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase rounded-[2px] border transition-colors cursor-pointer ${
              editLang === l ? "bg-copper text-paper border-copper" : "bg-transparent text-ink/60 border-rule hover:border-copper/40"
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
  const allTrainings = useQuery(api.trainings.listAll);
  const saveCatalog = useMutation(api.accountCatalog.adminSave);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (allProducts === undefined || currentItems === undefined || allTrainings === undefined) {
    return <div className="text-[13px] text-ink/30">Laden...</div>;
  }

  const activeProducts = allProducts.filter((p) => p.active);
  const itemMap = new Map(currentItems.map((i) => [i.checkoutProductId as string, i]));

  async function saveItems(newItems: CatalogItem[]) {
    setSaving(true);
    setSaved(false);
    await saveCatalog({ lang, items: newItems });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleProduct(productId: Id<"checkoutProducts">, productType: string) {
    const category = productType === "training" ? "training" : "book";
    let newItems: CatalogItem[];

    if (itemMap.has(productId as string)) {
      newItems = currentItems!
        .filter((i) => i.checkoutProductId !== productId)
        .map((i, idx) => ({ ...i, sortOrder: idx }));
    } else {
      const defaultAction: DashboardAction = category === "training" ? "training" : "download";
      newItems = [
        ...currentItems!,
        {
          checkoutProductId: productId,
          category: category as "training" | "book",
          dashboardAction: defaultAction,
          sortOrder: currentItems!.length,
        },
      ];
    }
    saveItems(newItems);
  }

  function updateAction(productId: Id<"checkoutProducts">, action: DashboardAction) {
    const newItems = currentItems!.map((i) =>
      i.checkoutProductId === productId ? { ...i, dashboardAction: action } : i,
    );
    saveItems(newItems);
  }

  function updateLinkedTraining(productId: Id<"checkoutProducts">, slug: string) {
    const newItems = currentItems!.map((i) =>
      i.checkoutProductId === productId
        ? { ...i, linkedTrainingSlug: slug || undefined }
        : i,
    );
    saveItems(newItems);
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
          itemMap={itemMap}
          allTrainings={allTrainings}
          lang={lang}
          onToggle={toggleProduct}
          onActionChange={updateAction}
          onTrainingLink={updateLinkedTraining}
        />
      )}

      {books.length > 0 && (
        <ProductGroup
          label="Boeken"
          products={books}
          itemMap={itemMap}
          allTrainings={allTrainings}
          lang={lang}
          onToggle={toggleProduct}
          onActionChange={updateAction}
          onTrainingLink={updateLinkedTraining}
        />
      )}
    </div>
  );
}

type Product = {
  _id: Id<"checkoutProducts">;
  slug: string;
  name: { nl: string; en: string; de?: string };
  productType: string;
  priceCents: number;
};

type Training = {
  _id: Id<"trainings">;
  slug: string;
  title: { nl: string; en: string; de?: string };
  type?: string;
};

function ProductGroup({
  label,
  products,
  itemMap,
  allTrainings,
  lang,
  onToggle,
  onActionChange,
  onTrainingLink,
}: {
  label: string;
  products: Product[];
  itemMap: Map<string, CatalogItem>;
  allTrainings: Training[];
  lang: string;
  onToggle: (id: Id<"checkoutProducts">, productType: string) => void;
  onActionChange: (id: Id<"checkoutProducts">, action: DashboardAction) => void;
  onTrainingLink: (id: Id<"checkoutProducts">, slug: string) => void;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">{label}</h3>
      <div className="space-y-2">
        {products.map((p) => {
          const selected = itemMap.has(p._id as string);
          const item = itemMap.get(p._id as string);
          const name = (p.name as Record<string, string>)[lang] || p.name.nl || p.name.en;
          const price = `€ ${(p.priceCents / 100).toFixed(2).replace(".", ",")}`;
          const needsTrainingLink = item && (item.dashboardAction === "training" || item.dashboardAction === "audiobook");

          return (
            <div key={p._id} className={`border rounded-[2px] transition-colors ${selected ? "border-copper bg-copper/5" : "border-rule"}`}>
              <button
                onClick={() => onToggle(p._id, p.productType)}
                className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-[2px] border flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-copper border-copper" : "bg-transparent border-ink/20"}`}>
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

              {/* Config panel — visible when selected */}
              {selected && item && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-rule/50 mt-0 pt-3">
                  <div>
                    <p className="text-[11px] text-ink/50 mb-1.5">Actie bij eigendom</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.entries(ACTION_LABELS) as [DashboardAction, string][]).map(([action, actionLabel]) => (
                        <button
                          key={action}
                          onClick={() => onActionChange(p._id, action)}
                          className={`px-3 py-1.5 text-[11px] font-medium rounded-[2px] border transition-colors cursor-pointer ${
                            item.dashboardAction === action
                              ? "bg-copper text-paper border-copper"
                              : "bg-transparent text-ink/60 border-rule hover:border-copper/40"
                          }`}
                        >
                          {actionLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {needsTrainingLink && (
                    <div>
                      <p className="text-[11px] text-ink/50 mb-1.5">Koppel aan training</p>
                      <select
                        value={item.linkedTrainingSlug ?? ""}
                        onChange={(e) => onTrainingLink(p._id, e.target.value)}
                        className="w-full bg-transparent border border-rule px-3 py-2 text-[13px] text-ink focus:border-copper focus:outline-none rounded-[2px]"
                      >
                        <option value="">— Selecteer een training —</option>
                        {allTrainings.map((t) => {
                          const tName = (t.title as Record<string, string>)[lang] || t.title.nl;
                          return (
                            <option key={t._id} value={t.slug}>
                              {tName} ({t.slug})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
