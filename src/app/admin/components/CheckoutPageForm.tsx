"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ImageUpload } from "./ImageUpload";
import { TranslateFromButton } from "./TranslateFromButton";

type ProductType = "training" | "book";
type ProductSubType = "training" | "book" | "event";
type ProductVariant = "ebook" | "audiobook" | "hardcopy" | "online-course" | "coaching" | "event";
type MockupType = "tablet" | "phone" | "audio";
type BumpOverride = { bumpSlug: string; priceCents: number };
type QtyTier = { quantity: number; unitPriceCents: number; savingsPercent: number };

const VARIANT_LABELS: Record<ProductVariant, string> = {
  ebook: "E-book",
  audiobook: "Luisterboek",
  hardcopy: "Hardcopy boek",
  "online-course": "Online cursus",
  coaching: "Coaching / live training",
  event: "Event",
};

interface ProductData {
  _id: Id<"checkoutProducts">;
  slug: string;
  active: boolean;
  sortOrder: number;
  name: { nl: string; en: string; de?: string };
  shortName: { nl: string; en: string; de?: string };
  description: { nl: string; en: string; de?: string };
  type: ProductType;
  productType: ProductSubType;
  priceCents: number;
  priceInclBtw: boolean;
  btwRate: number;
  features: { nl: string[]; en: string[] };
  image?: string;
  imageStorageId?: Id<"_storage">;
  bumps: string[];
  bumpPriceOverrides?: BumpOverride[];
  installments?: { count: number; amountPerTermCents: number };
  quantityTiers?: QtyTier[];
  requiresShipping: boolean;
  purchaseTag?: string;
  accessDurationDays?: number;
  mockupType?: MockupType;
  availableBookLanguages?: ("nl" | "en" | "de")[];
  productVariant?: ProductVariant;
}

interface Props {
  product?: ProductData;
  onBack: () => void;
}

const L = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1";
const I = "w-full bg-transparent border border-rule px-3 py-2 text-[14px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-colors rounded-[2px]";

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-rule rounded-[2px]">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-warm/30 transition-colors">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">{title}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className={`text-ink/30 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-rule pt-3">{children}</div>}
    </div>
  );
}

export function CheckoutPageForm({ product, onBack }: Props) {
  const createProduct = useMutation(api.checkoutProducts.createProduct);
  const updateProduct = useMutation(api.checkoutProducts.updateProduct);
  const allProducts = useQuery(api.checkoutProducts.listAll);

  const isEdit = !!product;

  // Form state
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [sortOrder, setSortOrder] = useState(product?.sortOrder ?? (allProducts?.length ?? 0));
  const [nameNl, setNameNl] = useState(product?.name.nl ?? "");
  const [nameEn, setNameEn] = useState(product?.name.en ?? "");
  const [nameDe, setNameDe] = useState(product?.name.de ?? "");
  const [shortNameNl, setShortNameNl] = useState(product?.shortName.nl ?? "");
  const [shortNameEn, setShortNameEn] = useState(product?.shortName.en ?? "");
  const [shortNameDe, setShortNameDe] = useState(product?.shortName.de ?? "");
  const [descNl, setDescNl] = useState(product?.description.nl ?? "");
  const [descEn, setDescEn] = useState(product?.description.en ?? "");
  const [descDe, setDescDe] = useState(product?.description.de ?? "");
  const [type, setType] = useState<ProductType>(product?.type ?? "training");
  const [productType, setProductType] = useState<ProductSubType>(product?.productType ?? "training");
  const [priceCents, setPriceCents] = useState(product?.priceCents ?? 0);
  const [priceInclBtw, setPriceInclBtw] = useState(product?.priceInclBtw ?? false);
  const [btwRate, setBtwRate] = useState(product?.btwRate ?? 21);
  const [featuresNl, setFeaturesNl] = useState<string[]>(product?.features.nl ?? [""]);
  const [featuresEn, setFeaturesEn] = useState<string[]>(product?.features.en ?? [""]);
  const [featuresDe, setFeaturesDe] = useState<string[]>((product?.features as { de?: string[] })?.de ?? [""]);
  const [image] = useState(product?.image ?? "");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | undefined>(product?.imageStorageId);
  const [bumps, setBumps] = useState<string[]>(product?.bumps ?? []);
  const [bumpOverrides, setBumpOverrides] = useState<BumpOverride[]>(product?.bumpPriceOverrides ?? []);
  const [requiresShipping, setRequiresShipping] = useState(product?.requiresShipping ?? false);
  const [purchaseTag, setPurchaseTag] = useState(product?.purchaseTag ?? "");
  const [accessDurationDays, setAccessDurationDays] = useState(product?.accessDurationDays?.toString() ?? "");
  const [mockupType, setMockupType] = useState<MockupType | "">(product?.mockupType ?? "");
  const [hasInstallments, setHasInstallments] = useState(!!product?.installments);
  const [instCount, setInstCount] = useState(product?.installments?.count ?? 3);
  const [instAmount, setInstAmount] = useState(product?.installments?.amountPerTermCents ?? 0);
  const [hasTiers, setHasTiers] = useState(!!product?.quantityTiers?.length);
  const [tiers, setTiers] = useState<QtyTier[]>(product?.quantityTiers ?? [{ quantity: 1, unitPriceCents: 0, savingsPercent: 0 }]);
  const [bookLanguages, setBookLanguages] = useState<("nl" | "en" | "de")[]>(product?.availableBookLanguages ?? ["nl"]);
  const [productVariant, setProductVariant] = useState<ProductVariant | "">(product?.productVariant ?? "");

  // Section visibility
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basis: true, prijs: true, content: false, bumps: false, tiers: false, boektalen: false, overig: false,
  });
  const toggle = (key: string) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    setSaving(true);
    const data = {
      slug, active, sortOrder,
      name: { nl: nameNl, en: nameEn, de: nameDe || undefined },
      shortName: { nl: shortNameNl, en: shortNameEn, de: shortNameDe || undefined },
      description: { nl: descNl, en: descEn, de: descDe || undefined },
      type, productType, priceCents, priceInclBtw, btwRate,
      features: { nl: featuresNl.filter((f) => f.trim()), en: featuresEn.filter((f) => f.trim()), de: featuresDe.filter((f) => f.trim()) },
      image: image || undefined,
      imageStorageId: imageStorageId ?? undefined,
      bumps,
      bumpPriceOverrides: bumpOverrides.length > 0 ? bumpOverrides : undefined,
      installments: hasInstallments ? { count: instCount, amountPerTermCents: instAmount } : undefined,
      quantityTiers: hasTiers ? tiers.filter((t) => t.quantity > 0) : undefined,
      requiresShipping,
      purchaseTag: purchaseTag || undefined,
      accessDurationDays: accessDurationDays ? Number(accessDurationDays) : undefined,
      mockupType: mockupType || undefined,
      availableBookLanguages: type === "book" ? bookLanguages : undefined,
      productVariant: productVariant || undefined,
    };
    try {
      if (isEdit) {
        await updateProduct({ id: product._id, ...data });
      } else {
        await createProduct(data);
      }
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setSaving(false);
    }
  }

  const otherProducts = (allProducts ?? []).filter((p) => p.slug !== slug);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer">&larr; Terug</button>
        <div className="flex items-center gap-3">
          {isEdit && slug && (
            <a
              href={`/checkout/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-ink/40 hover:text-copper transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Preview
            </a>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-3.5 h-3.5 accent-copper" />
            <span className="text-[12px] text-ink/50">Actief</span>
          </label>
          <button onClick={handleSave} disabled={saving || !slug || !nameNl} className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50">
            {saving ? "Opslaan..." : isEdit ? "Opslaan" : "Aanmaken"}
          </button>
        </div>
      </div>

      {error && <p className="text-[13px] text-red-600 p-3 bg-red-50 border border-red-200 rounded-[2px]">{error}</p>}

      {/* Top row: image + basic info side by side */}
      <div className="grid grid-cols-[180px_1fr] gap-4">
        <div>
          <p className={L}>Afbeelding</p>
          <ImageUpload productId={isEdit ? product._id : undefined} currentImageUrl={image || undefined} onUploaded={(id) => setImageStorageId(id)} />
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_80px] gap-3">
            <div>
              <label className={L}>Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="set-online" className={I} />
            </div>
            <div>
              <label className={L}>Volgorde</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={I} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className={L}>Korte naam NL</label>
                <TranslateFromButton
                  targetLang="nl"
                  sourcesAvailable={{ en: shortNameEn, de: shortNameDe }}
                  onTranslated={setShortNameNl}
                  compact
                />
              </div>
              <input value={shortNameNl} onChange={(e) => setShortNameNl(e.target.value)} placeholder="SET Online" className={I} />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className={L}>Korte naam EN</label>
                <TranslateFromButton
                  targetLang="en"
                  sourcesAvailable={{ nl: shortNameNl, de: shortNameDe }}
                  onTranslated={setShortNameEn}
                  compact
                />
              </div>
              <input value={shortNameEn} onChange={(e) => setShortNameEn(e.target.value)} placeholder="SET Online" className={I} />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className={L}>Korte naam DE</label>
                <TranslateFromButton
                  targetLang="de"
                  sourcesAvailable={{ nl: shortNameNl, en: shortNameEn }}
                  onTranslated={setShortNameDe}
                  compact
                />
              </div>
              <input value={shortNameDe} onChange={(e) => setShortNameDe(e.target.value)} placeholder="SET Online" className={I} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={L}>Type</label>
              <select value={type} onChange={(e) => { setType(e.target.value as ProductType); setProductType(e.target.value as ProductSubType); }} className={I}>
                <option value="training">Training</option>
                <option value="book">Boek</option>
              </select>
            </div>
            <div>
              <label className={L}>Variant</label>
              <select value={productVariant} onChange={(e) => setProductVariant(e.target.value as ProductVariant | "")} className={I}>
                <option value="">— (geen variant)</option>
                {(Object.keys(VARIANT_LABELS) as ProductVariant[]).map((v) => (
                  <option key={v} value={v}>{VARIANT_LABELS[v]}</option>
                ))}
              </select>
              <p className="text-[10px] text-ink/30 mt-1">Stuurt e-mails, downloads en bedankpagina aan</p>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-[12px] text-ink/50">
                <input type="checkbox" checked={requiresShipping} onChange={(e) => setRequiresShipping(e.target.checked)} className="w-3.5 h-3.5 accent-copper" />
                Verzending
              </label>
              <div className="flex-1">
                <label className={L}>Mockup</label>
                <select value={mockupType} onChange={(e) => setMockupType(e.target.value as MockupType | "")} className={I}>
                  <option value="">—</option>
                  <option value="tablet">Tablet</option>
                  <option value="phone">Phone</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={L}>CRM tag bij aankoop</label>
                <input type="text" value={purchaseTag} onChange={(e) => setPurchaseTag(e.target.value)} placeholder="Leeg = geen pipeline lead" className={I} />
                <p className="text-[10px] text-ink/30 mt-1">Bijv. &quot;boek&quot; of &quot;training-set&quot;</p>
              </div>
              <div>
                <label className={L}>Toegangsduur (dagen)</label>
                <input type="number" value={accessDurationDays} onChange={(e) => setAccessDurationDays(e.target.value)} placeholder="Leeg = onbeperkt" className={I} />
                <p className="text-[10px] text-ink/30 mt-1">Bijv. 365 = 1 jaar toegang</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basis — full-width names */}
      <Section title="Naam & Beschrijving" open={openSections.basis} onToggle={() => toggle("basis")}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className={L}>Volledige naam NL</label>
              <TranslateFromButton
                targetLang="nl"
                sourcesAvailable={{ en: nameEn, de: nameDe }}
                onTranslated={setNameNl}
                compact
              />
            </div>
            <input value={nameNl} onChange={(e) => setNameNl(e.target.value)} className={I} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className={L}>Volledige naam EN</label>
              <TranslateFromButton
                targetLang="en"
                sourcesAvailable={{ nl: nameNl, de: nameDe }}
                onTranslated={setNameEn}
                compact
              />
            </div>
            <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={I} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className={L}>Volledige naam DE</label>
              <TranslateFromButton
                targetLang="de"
                sourcesAvailable={{ nl: nameNl, en: nameEn }}
                onTranslated={setNameDe}
                compact
              />
            </div>
            <input value={nameDe} onChange={(e) => setNameDe(e.target.value)} className={I} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className={L}>Beschrijving NL</label>
              <TranslateFromButton
                targetLang="nl"
                sourcesAvailable={{ en: descEn, de: descDe }}
                onTranslated={setDescNl}
                compact
              />
            </div>
            <textarea value={descNl} onChange={(e) => setDescNl(e.target.value)} rows={2} className={I} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className={L}>Beschrijving EN</label>
              <TranslateFromButton
                targetLang="en"
                sourcesAvailable={{ nl: descNl, de: descDe }}
                onTranslated={setDescEn}
                compact
              />
            </div>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className={I} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className={L}>Beschrijving DE</label>
              <TranslateFromButton
                targetLang="de"
                sourcesAvailable={{ nl: descNl, en: descEn }}
                onTranslated={setDescDe}
                compact
              />
            </div>
            <textarea value={descDe} onChange={(e) => setDescDe(e.target.value)} rows={2} className={I} />
          </div>
        </div>
      </Section>

      {/* Prijs */}
      <Section title="Prijs & Betaling" open={openSections.prijs} onToggle={() => toggle("prijs")}>
        <div className="grid grid-cols-[1fr_100px_auto] gap-3 items-start">
          <div>
            <label className={L}>Prijs (centen)</label>
            <input type="number" value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} className={I} />
            <span className="text-[11px] text-ink/30">&euro; {(priceCents / 100).toFixed(2).replace(".", ",")}</span>
          </div>
          <div>
            <label className={L}>BTW</label>
            <select value={btwRate} onChange={(e) => setBtwRate(Number(e.target.value))} className={I}>
              <option value={21}>21%</option>
              <option value={9}>9%</option>
              <option value={0}>0%</option>
            </select>
          </div>
          <div>
            <label className={`${L} invisible`}>.</label>
            <label className="flex items-center gap-2 cursor-pointer text-[12px] text-ink/50 h-[38px]">
              <input type="checkbox" checked={priceInclBtw} onChange={(e) => setPriceInclBtw(e.target.checked)} className="w-3.5 h-3.5 accent-copper" />
              Incl. BTW
            </label>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-[12px] text-ink/60">
            <input type="checkbox" checked={hasInstallments} onChange={(e) => setHasInstallments(e.target.checked)} className="w-3.5 h-3.5 accent-copper" />
            Termijnbetaling
          </label>
          {hasInstallments && (
            <div className="flex items-center gap-2">
              <input type="number" value={instCount} onChange={(e) => setInstCount(Number(e.target.value))} className={`${I} w-16`} />
              <span className="text-[12px] text-ink/40">x</span>
              <input type="number" value={instAmount} onChange={(e) => setInstAmount(Number(e.target.value))} className={`${I} w-28`} />
              <span className="text-[11px] text-ink/30">ct</span>
            </div>
          )}
        </div>
      </Section>

      {/* Features / Content */}
      <Section title="Features" open={openSections.content} onToggle={() => toggle("content")}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className={L}>NL</p>
              <TranslateFromButton
                targetLang="nl"
                sourcesAvailable={{
                  en: featuresEn.filter(f => f.trim()).join("\n---\n"),
                  de: featuresDe.filter(f => f.trim()).join("\n---\n"),
                }}
                onTranslated={(text) => setFeaturesNl(text.split("\n---\n").map(s => s.trim()).filter(Boolean))}
                compact
              />
            </div>
            {featuresNl.map((f, i) => (
              <div key={i} className="flex gap-1 mb-1.5">
                <input value={f} onChange={(e) => { const n = [...featuresNl]; n[i] = e.target.value; setFeaturesNl(n); }} className={I} placeholder={`Feature ${i + 1}`} />
                <button type="button" onClick={() => setFeaturesNl(featuresNl.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 cursor-pointer px-1 shrink-0">&#215;</button>
              </div>
            ))}
            <button type="button" onClick={() => setFeaturesNl([...featuresNl, ""])} className="text-[11px] text-copper cursor-pointer">+ toevoegen</button>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className={L}>EN</p>
              <TranslateFromButton
                targetLang="en"
                sourcesAvailable={{
                  nl: featuresNl.filter(f => f.trim()).join("\n---\n"),
                  de: featuresDe.filter(f => f.trim()).join("\n---\n"),
                }}
                onTranslated={(text) => setFeaturesEn(text.split("\n---\n").map(s => s.trim()).filter(Boolean))}
                compact
              />
            </div>
            {featuresEn.map((f, i) => (
              <div key={i} className="flex gap-1 mb-1.5">
                <input value={f} onChange={(e) => { const n = [...featuresEn]; n[i] = e.target.value; setFeaturesEn(n); }} className={I} placeholder={`Feature ${i + 1}`} />
                <button type="button" onClick={() => setFeaturesEn(featuresEn.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 cursor-pointer px-1 shrink-0">&#215;</button>
              </div>
            ))}
            <button type="button" onClick={() => setFeaturesEn([...featuresEn, ""])} className="text-[11px] text-copper cursor-pointer">+ toevoegen</button>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className={L}>DE</p>
              <TranslateFromButton
                targetLang="de"
                sourcesAvailable={{
                  nl: featuresNl.filter(f => f.trim()).join("\n---\n"),
                  en: featuresEn.filter(f => f.trim()).join("\n---\n"),
                }}
                onTranslated={(text) => setFeaturesDe(text.split("\n---\n").map(s => s.trim()).filter(Boolean))}
                compact
              />
            </div>
            {featuresDe.map((f, i) => (
              <div key={i} className="flex gap-1 mb-1.5">
                <input value={f} onChange={(e) => { const n = [...featuresDe]; n[i] = e.target.value; setFeaturesDe(n); }} className={I} placeholder={`Feature ${i + 1}`} />
                <button type="button" onClick={() => setFeaturesDe(featuresDe.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 cursor-pointer px-1 shrink-0">&#215;</button>
              </div>
            ))}
            <button type="button" onClick={() => setFeaturesDe([...featuresDe, ""])} className="text-[11px] text-copper cursor-pointer">+ toevoegen</button>
          </div>
        </div>
      </Section>

      {/* Bumps */}
      <Section title={`Order Bumps (${bumps.length})`} open={openSections.bumps} onToggle={() => toggle("bumps")}>
        <div className="space-y-1.5">
          {otherProducts.map((p) => {
            const selected = bumps.includes(p.slug);
            const override = bumpOverrides.find((o) => o.bumpSlug === p.slug);
            return (
              <div key={p.slug} className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                  <input type="checkbox" checked={selected} onChange={(e) => {
                    if (e.target.checked) { setBumps([...bumps, p.slug]); }
                    else { setBumps(bumps.filter((s) => s !== p.slug)); setBumpOverrides(bumpOverrides.filter((o) => o.bumpSlug !== p.slug)); }
                  }} className="w-3.5 h-3.5 accent-copper" />
                  <span className="text-[13px] text-ink/70 truncate">{p.shortName.nl}</span>
                  <span className="text-[11px] text-ink/30">{p.slug}</span>
                </label>
                {selected && (
                  <div className="flex items-center gap-1 shrink-0">
                    <input type="number" value={override?.priceCents ?? ""} onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      if (val === null) { setBumpOverrides(bumpOverrides.filter((o) => o.bumpSlug !== p.slug)); }
                      else if (override) { setBumpOverrides(bumpOverrides.map((o) => o.bumpSlug === p.slug ? { ...o, priceCents: val } : o)); }
                      else { setBumpOverrides([...bumpOverrides, { bumpSlug: p.slug, priceCents: val }]); }
                    }} placeholder="std." className={`${I} w-24 text-[12px]`} />
                    <span className="text-[10px] text-ink/25">ct</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Staffelprijzen */}
      <Section title={`Staffelprijzen${hasTiers ? ` (${tiers.length})` : ""}`} open={openSections.tiers} onToggle={() => toggle("tiers")}>
        <label className="flex items-center gap-2 cursor-pointer text-[12px] text-ink/60">
          <input type="checkbox" checked={hasTiers} onChange={(e) => setHasTiers(e.target.checked)} className="w-3.5 h-3.5 accent-copper" />
          Staffelprijzen inschakelen
        </label>
        {hasTiers && (
          <div>
            <div className="grid grid-cols-[60px_1fr_60px_24px] gap-2 mb-1">
              <span className={L}>Aantal</span><span className={L}>Stuksprijs (ct)</span><span className={L}>Besp%</span><span />
            </div>
            {tiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_60px_24px] gap-2 mb-1.5">
                <input type="number" value={tier.quantity} onChange={(e) => { const n = [...tiers]; n[i] = { ...tier, quantity: Number(e.target.value) }; setTiers(n); }} className={I} />
                <input type="number" value={tier.unitPriceCents} onChange={(e) => { const n = [...tiers]; n[i] = { ...tier, unitPriceCents: Number(e.target.value) }; setTiers(n); }} className={I} />
                <input type="number" value={tier.savingsPercent} onChange={(e) => { const n = [...tiers]; n[i] = { ...tier, savingsPercent: Number(e.target.value) }; setTiers(n); }} className={I} />
                <button type="button" onClick={() => setTiers(tiers.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 cursor-pointer text-[14px]">&#215;</button>
              </div>
            ))}
            <button type="button" onClick={() => setTiers([...tiers, { quantity: 0, unitPriceCents: 0, savingsPercent: 0 }])} className="text-[11px] text-copper cursor-pointer">+ Staffel</button>
          </div>
        )}
      </Section>

      {/* Boektalen — only for book products */}
      {type === "book" && (
        <Section title="Beschikbare boektalen" open={openSections.boektalen} onToggle={() => toggle("boektalen")}>
          <p className="text-[12px] text-ink/40 mb-3">
            Welke taaledities zijn beschikbaar voor dit boek? Bezoekers in een taal zonder editie zien een melding dat het boek (nog) alleen in het Nederlands beschikbaar is.
          </p>
          {(["nl", "en", "de"] as const).map((lang) => {
            const checked = bookLanguages.includes(lang);
            const label = { nl: "Nederlands", en: "Engels", de: "Duits" }[lang];
            return (
              <label key={lang} className="flex items-center gap-3 cursor-pointer py-1.5">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={lang === "nl"}
                  onChange={(e) => {
                    if (e.target.checked) setBookLanguages([...bookLanguages, lang]);
                    else setBookLanguages(bookLanguages.filter((l) => l !== lang));
                  }}
                  className="w-4 h-4 accent-copper"
                />
                <span className="text-[13px] text-ink">{label}</span>
                {lang === "nl" && <span className="text-[11px] text-ink/30">altijd beschikbaar</span>}
                {lang !== "nl" && !checked && <span className="text-[11px] text-ink/30">binnenkort</span>}
              </label>
            );
          })}
        </Section>
      )}

      {/* Bottom save */}
      <div className="flex items-center justify-end pt-2">
        <button onClick={handleSave} disabled={saving || !slug || !nameNl} className="bg-copper text-paper px-5 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50">
          {saving ? "Opslaan..." : isEdit ? "Opslaan" : "Aanmaken"}
        </button>
      </div>
    </div>
  );
}
