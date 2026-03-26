"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { formatPrice, Th, Loading, EmptyState } from "./shared";

export function DiscountsTab() {
  const codes = useQuery(api.admin.getDiscountCodes);
  const products = useQuery(api.checkoutProducts.listAll);
  const createCode = useMutation(api.admin.createDiscountCode);
  const deleteCode = useMutation(api.admin.deleteDiscountCode);

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState(true);
  const [validDate, setValidDate] = useState("");
  const [validTime, setValidTime] = useState("23:59");

  if (!codes) return <Loading />;

  function resetForm() {
    setCode(""); setValue(""); setMaxUses("");
    setSelectedProducts([]); setAllProducts(true);
    setValidDate(""); setValidTime("23:59");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validUntil = validDate
      ? new Date(`${validDate}T${validTime || "23:59"}:00`).getTime()
      : undefined;

    await createCode({
      code,
      type,
      value: type === "percentage" ? Number(value) : Number(value) * 100,
      maxUses: maxUses ? Number(maxUses) : undefined,
      products: allProducts ? undefined : selectedProducts.length > 0 ? selectedProducts : undefined,
      validUntil,
    });
    resetForm();
    setShowForm(false);
  }

  function toggleProduct(slug: string) {
    setSelectedProducts((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const L = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
  const I = "w-full bg-transparent border border-rule px-3 py-2.5 text-[14px] text-ink focus:border-copper focus:outline-none rounded-[2px]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40">
          {codes.length} code{codes.length !== 1 ? "s" : ""}
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="text-[12px] text-copper font-medium tracking-[0.1em] uppercase hover:text-copper-light transition-colors cursor-pointer">
          {showForm ? "Annuleren" : "+ Nieuwe code"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-copper/30 rounded-[2px] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={L}>Code</label>
              <input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ZOMER25" className={I} />
            </div>
            <div>
              <label className={L}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as "percentage" | "fixed")} className={I}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Vast bedrag (EUR)</option>
              </select>
            </div>
            <div>
              <label className={L}>Waarde {type === "percentage" ? "(%)" : "(EUR)"}</label>
              <input type="number" required value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "percentage" ? "25" : "50"} className={I} />
            </div>
            <div>
              <label className={L}>Max. gebruik (optioneel)</label>
              <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Onbeperkt" className={I} />
            </div>
          </div>

          {/* Geldigheid */}
          <div>
            <label className={L}>Geldig tot (optioneel)</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={validDate} onChange={(e) => setValidDate(e.target.value)} className={I} />
              <input type="time" value={validTime} onChange={(e) => setValidTime(e.target.value)} className={I} />
            </div>
            <p className="text-[11px] text-ink/30 mt-1">Laat leeg voor onbeperkt geldig</p>
          </div>

          {/* Producten */}
          <div>
            <label className={L}>Geldig voor producten</label>
            <div className="flex gap-3 mb-3">
              <label className="flex items-center gap-2 text-[13px] text-ink/70 cursor-pointer">
                <input type="radio" checked={allProducts} onChange={() => { setAllProducts(true); setSelectedProducts([]); }} className="accent-copper" />
                Alle producten
              </label>
              <label className="flex items-center gap-2 text-[13px] text-ink/70 cursor-pointer">
                <input type="radio" checked={!allProducts} onChange={() => setAllProducts(false)} className="accent-copper" />
                Specifieke producten
              </label>
            </div>
            {!allProducts && products && (
              <div className="flex flex-wrap gap-2">
                {products.map((p) => {
                  const selected = selectedProducts.includes(p.slug);
                  return (
                    <button key={p._id} type="button" onClick={() => toggleProduct(p.slug)}
                      className={`text-[12px] px-3 py-1.5 rounded-[2px] border cursor-pointer transition-colors ${
                        selected ? "border-copper bg-copper/10 text-copper font-medium" : "border-rule text-ink/40 hover:border-copper/30"
                      }`}>
                      {p.name.nl}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" className="bg-copper text-paper px-6 py-2.5 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer">
            Aanmaken
          </button>
        </form>
      )}

      {codes.length === 0 ? (
        <EmptyState text="Nog geen kortingscodes." />
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-rule bg-warm/30">
                <Th>Code</Th>
                <Th>Type</Th>
                <Th>Waarde</Th>
                <Th>Producten</Th>
                <Th>Geldig tot</Th>
                <Th>Gebruikt</Th>
                <Th>Actie</Th>
              </tr>
            </thead>
            <tbody>
              {codes.map((dc) => (
                <tr key={dc._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-mono font-medium text-ink bg-warm px-2 py-0.5 rounded-[2px]">{dc.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">{dc.type === "percentage" ? "%" : "EUR"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-ink">{dc.type === "percentage" ? `${dc.value}%` : formatPrice(dc.value)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-ink/50">
                      {dc.products && dc.products.length > 0 ? dc.products.join(", ") : "Alle"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-ink/50">
                      {dc.validUntil
                        ? new Date(dc.validUntil).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })
                        : "Onbeperkt"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] text-ink/50">{dc.currentUses}{dc.maxUses !== undefined ? ` / ${dc.maxUses}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteCode({ id: dc._id as Id<"discountCodes"> })}
                      className="text-[11px] text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
