"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Loading, EmptyState } from "./shared";
import { AdminImageUpload } from "./AdminImageUpload";
import { DeepLButton } from "./DeepLButton";

type ReviewType = "training" | "book";

interface ReviewForm {
  productType: ReviewType;
  productSlug: string;
  textNl: string;
  textEn: string;
  textDe: string;
  name: string;
  roleNl: string;
  roleEn: string;
  roleDe: string;
  avatar: string;
  rating: number;
  active: boolean;
  sortOrder: number;
}

const emptyForm: ReviewForm = {
  productType: "training",
  productSlug: "",
  textNl: "",
  textEn: "",
  textDe: "",
  name: "",
  roleNl: "",
  roleEn: "",
  roleDe: "",
  avatar: "",
  rating: 5,
  active: true,
  sortOrder: 0,
};

const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-1.5";
const inputClass = "w-full bg-transparent border border-rule px-3 py-2 text-[14px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-colors rounded-[2px]";

interface Props {
  onBack: () => void;
}

export function CheckoutReviewsPanel({ onBack }: Props) {
  const reviews = useQuery(api.checkoutReviews.listAll);
  const createReview = useMutation(api.checkoutReviews.createReview);
  const updateReview = useMutation(api.checkoutReviews.updateReview);
  const deleteReview = useMutation(api.checkoutReviews.deleteReview);

  const [editId, setEditId] = useState<Id<"checkoutReviews"> | null>(null);
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  if (reviews === undefined) return <Loading />;

  function startEdit(review: NonNullable<typeof reviews>[0]) {
    setEditId(review._id);
    setForm({
      productType: review.productType,
      productSlug: review.productSlug ?? "",
      textNl: review.text.nl,
      textEn: review.text.en,
      textDe: (review.text as { de?: string }).de ?? "",
      name: review.name,
      roleNl: review.role.nl,
      roleEn: review.role.en,
      roleDe: (review.role as { de?: string }).de ?? "",
      avatar: review.avatar ?? "",
      rating: review.rating,
      active: review.active,
      sortOrder: review.sortOrder,
    });
    setShowForm(true);
  }

  function startCreate() {
    setEditId(null);
    setForm({ ...emptyForm, sortOrder: reviews?.length ?? 0 });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      productType: form.productType,
      productSlug: form.productSlug || undefined,
      text: { nl: form.textNl, en: form.textEn, de: form.textDe || undefined },
      name: form.name,
      role: { nl: form.roleNl, en: form.roleEn, de: form.roleDe || undefined },
      avatar: form.avatar || undefined,
      rating: form.rating,
      active: form.active,
      sortOrder: form.sortOrder,
    };

    try {
      if (editId) {
        await updateReview({ id: editId, ...data });
      } else {
        await createReview(data);
      }
      setShowForm(false);
      setEditId(null);
    } catch {
      // Error silently handled
    } finally {
      setSaving(false);
    }
  }

  if (showForm) {
    return (
      <div className="max-w-[600px] space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowForm(false)} className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer">
            &larr; Terug naar reviews
          </button>
          <button onClick={handleSave} disabled={saving || !form.name || !form.textNl} className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50">
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value as ReviewType })} className={inputClass}>
                <option value="training">Training</option>
                <option value="book">Boek</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Product slug (optioneel)</label>
              <input value={form.productSlug} onChange={(e) => setForm({ ...form, productSlug: e.target.value })} placeholder="set-online" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Naam</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jan Jansen" className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Rol (NL)</label>
                <DeepLButton sourceText={form.roleNl} onTranslated={(t) => setForm({ ...form, roleEn: t.en ?? form.roleEn, roleDe: t.de ?? form.roleDe })} />
              </div>
              <input value={form.roleNl} onChange={(e) => setForm({ ...form, roleNl: e.target.value })} placeholder="Directeur Bedrijf X" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Rol (EN)</label>
              <input value={form.roleEn} onChange={(e) => setForm({ ...form, roleEn: e.target.value })} placeholder="Director Company X" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Rolle (DE)</label>
              <input value={form.roleDe} onChange={(e) => setForm({ ...form, roleDe: e.target.value })} placeholder="Direktor Firma X" className={inputClass} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Review tekst (NL)</label>
              <DeepLButton sourceText={form.textNl} onTranslated={(t) => setForm({ ...form, textEn: t.en ?? form.textEn, textDe: t.de ?? form.textDe })} />
            </div>
            <textarea value={form.textNl} onChange={(e) => setForm({ ...form, textNl: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Review tekst (EN)</label>
            <textarea value={form.textEn} onChange={(e) => setForm({ ...form, textEn: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Review-Text (DE)</label>
            <textarea value={form.textDe} onChange={(e) => setForm({ ...form, textDe: e.target.value })} rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Avatar</label>
              <AdminImageUpload
                currentUrl={form.avatar || undefined}
                onUploaded={(storageId) => {
                  setForm({ ...form, avatar: `convex:${storageId}` });
                }}
                onRemoved={() => setForm({ ...form, avatar: "" })}
                compact
                alt="Avatar"
              />
            </div>
            <div>
              <label className={labelClass}>Rating (1-5)</label>
              <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Volgorde</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-copper" />
            <span className="text-[13px] text-ink/60">Actief</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[12px] text-ink/40 hover:text-ink transition-colors cursor-pointer">
          &larr; Terug naar producten
        </button>
        <button onClick={startCreate} className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer">
          + Nieuwe review
        </button>
      </div>

      {reviews.length === 0 ? (
        <EmptyState text="Nog geen reviews." />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="border border-rule rounded-[2px] p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[2px] ${
                    review.productType === "training" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                  }`}>
                    {review.productType}
                  </span>
                  {!review.active && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[2px] bg-gray-100 text-gray-500">
                      Inactief
                    </span>
                  )}
                  <span className="text-[10px] text-copper">
                    {"★".repeat(review.rating)}
                  </span>
                </div>
                <p className="text-[14px] font-medium text-ink">{review.name}</p>
                <p className="text-[12px] text-ink/50">{review.role.nl}</p>
                <p className="text-[13px] text-ink/60 mt-1 line-clamp-2 italic">
                  &ldquo;{review.text.nl}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(review)} className="text-[11px] text-copper hover:text-copper-light cursor-pointer">
                  Bewerken
                </button>
                <button
                  onClick={() => {
                    if (confirm("Review verwijderen?")) {
                      deleteReview({ id: review._id });
                    }
                  }}
                  className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
                >
                  Verwijder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
