"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AdminImageUpload } from "./AdminImageUpload";
import { Loading } from "./shared";
import { TranslateButton } from "./TranslateButton";

type I18nField = { nl: string; en: string; de: string };

const LABEL = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1";
const INPUT = "w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-colors rounded-[2px]";
const LANG_LABEL = "text-[10px] font-medium tracking-[0.15em] uppercase text-ink/30 mb-1 block";

function emptyI18n(): I18nField {
  return { nl: "", en: "", de: "" };
}

function parseI18n(val: { nl: string; en: string; de?: string } | undefined): I18nField {
  if (!val) return emptyI18n();
  return { nl: val.nl ?? "", en: val.en ?? "", de: val.de ?? "" };
}

export function PopupTab() {
  const config = useQuery(api.settings.getPopupConfig);
  const products = useQuery(api.checkoutProducts.listAll);
  const update = useMutation(api.settings.updatePopupConfig);

  const [initialized, setInitialized] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [product, setProduct] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [label, setLabel] = useState<I18nField>(emptyI18n());
  const [title, setTitle] = useState<I18nField>(emptyI18n());
  const [description, setDescription] = useState<I18nField>(emptyI18n());
  const [cta, setCta] = useState<I18nField>(emptyI18n());
  const [price, setPrice] = useState("");
  const [pages, setPages] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Sync from query on first load
  if (config !== undefined && !initialized) {
    setEnabled(config?.enabled ?? false);
    setProduct(config?.product ?? "");
    setImageUrl(config?.imageUrl ?? null);
    setLabel(parseI18n(config?.label));
    setTitle(parseI18n(config?.title));
    setDescription(parseI18n(config?.description));
    setCta(parseI18n(config?.cta));
    setPrice(config?.price ?? "");
    setPages((config?.pages ?? []).join(", "));
    setInitialized(true);
  }

  if (config === undefined) return <Loading />;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const pagesArray = pages
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      await update({
        enabled,
        product: product || undefined,
        imageStorageId: imageStorageId ?? undefined,
        label: { nl: label.nl, en: label.en, de: label.de },
        title: { nl: title.nl, en: title.en, de: title.de },
        description: { nl: description.nl, en: description.en, de: description.de },
        cta: { nl: cta.nl, en: cta.en, de: cta.de },
        price: price || undefined,
        pages: pagesArray.length > 0 ? pagesArray : undefined,
      });
      setSaved(true);
      globalThis.setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header + Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-1">
            Site Popup
          </p>
          <p className="text-[13px] text-ink/50">
            Beheer de popup die bezoekers te zien krijgen na scrollen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? "bg-copper" : "bg-ink/20"
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`pointer-events-none inline-block h-5.5 w-5.5 rounded-full bg-paper shadow-md ring-0 transition-transform duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            } mt-[1px]`}
          />
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-[2px] px-4 py-3">
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      {/* Product + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Product</label>
          {products ? (
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className={`${INPUT} cursor-pointer`}
            >
              <option value="">-- Geen product --</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name.nl} ({p.slug})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="product-slug"
              className={INPUT}
            />
          )}
        </div>
        <div>
          <label className={LABEL}>Prijs (tekst)</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="€32,50"
            className={INPUT}
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <label className={LABEL}>Afbeelding</label>
        <AdminImageUpload
          currentUrl={imageUrl ?? undefined}
          onUploaded={(id) => setImageStorageId(id)}
          onRemoved={() => {
            setImageStorageId(null);
            setImageUrl(null);
          }}
          alt="Popup afbeelding"
        />
      </div>

      {/* I18n fields */}
      <I18nFieldGroup label="Label" value={label} onChange={setLabel} placeholder={{ nl: "#1 Managementboek", en: "#1 Management Book", de: "#1 Managementbuch" }} />
      <I18nFieldGroup label="Titel" value={title} onChange={setTitle} placeholder={{ nl: "Sales, Oprecht en Ontspannen", en: "Sales, Honest & Relaxed", de: "Sales, Ehrlich & Entspannt" }} />
      <I18nFieldGroup label="Beschrijving" value={description} onChange={setDescription} multiline placeholder={{ nl: "Korte beschrijving...", en: "Short description...", de: "Kurze Beschreibung..." }} />
      <I18nFieldGroup label="CTA tekst" value={cta} onChange={setCta} placeholder={{ nl: "Bestel nu", en: "Order now", de: "Jetzt bestellen" }} />

      {/* Pages */}
      <div>
        <label className={LABEL}>Pagina&apos;s (kommagescheiden paden)</label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="/, /spreker, /over-ons"
          className={INPUT}
        />
        <p className="text-[11px] text-ink/30 mt-1">
          Laat leeg om de popup op alle pagina&apos;s te tonen (behalve checkout, admin, login).
        </p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-40"
      >
        {saving ? "Opslaan..." : saved ? "Opgeslagen!" : "Popup opslaan"}
      </button>
    </div>
  );
}

/* ─── Reusable NL/EN/DE field group ─── */

function I18nFieldGroup({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: I18nField;
  onChange: (v: I18nField) => void;
  placeholder?: I18nField;
  multiline?: boolean;
}) {
  const langs: Array<{ key: keyof I18nField; label: string }> = [
    { key: "nl", label: "NL" },
    { key: "en", label: "EN" },
    { key: "de", label: "DE" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className={LABEL}>{label}</label>
        <TranslateButton
          sourceText={value.nl}
          onTranslated={(t) => onChange({ ...value, en: t.en ?? value.en, de: t.de ?? value.de })}
          html={multiline}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {langs.map(({ key, label: langLabel }) => (
          <div key={key}>
            <span className={LANG_LABEL}>{langLabel}</span>
            {multiline ? (
              <textarea
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                placeholder={placeholder?.[key] ?? ""}
                rows={3}
                className={`${INPUT} resize-none`}
              />
            ) : (
              <input
                type="text"
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                placeholder={placeholder?.[key] ?? ""}
                className={INPUT}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
