"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { formatPrice, Loading, EmptyState, Th } from "./shared";
import { CheckoutPageForm } from "./CheckoutPageForm";
import { CheckoutReviewsPanel } from "./CheckoutReviewsPanel";

type View = "list" | "edit" | "create" | "reviews";

export function CheckoutPagesTab() {
  const products = useQuery(api.checkoutProducts.listAll);
  const deactivate = useMutation(api.checkoutProducts.deactivateProduct);
  const duplicate = useMutation(api.checkoutProducts.duplicateProduct);

  const [view, setView] = useState<View>("list");
  const [editId, setEditId] = useState<Id<"checkoutProducts"> | null>(null);

  if (products === undefined) return <Loading />;

  if (view === "edit" && editId) {
    const product = products.find((p) => p._id === editId);
    if (!product) return <EmptyState text="Product niet gevonden." />;
    return (
      <CheckoutPageForm
        product={product}
        onBack={() => { setView("list"); setEditId(null); }}
      />
    );
  }

  if (view === "create") {
    return (
      <CheckoutPageForm
        onBack={() => setView("list")}
      />
    );
  }

  if (view === "reviews") {
    return (
      <CheckoutReviewsPanel
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink/50">
          {products.length} producten
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("reviews")}
            className="text-[12px] text-ink/50 hover:text-copper transition-colors cursor-pointer"
          >
            Reviews beheren
          </button>
          <button
            onClick={() => setView("create")}
            className="bg-copper text-paper px-4 py-2 text-[12px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer"
          >
            + Nieuw product
          </button>
        </div>
      </div>

      {/* Products table */}
      {products.length === 0 ? (
        <EmptyState text="Nog geen producten. Voer eerst de seed uit." />
      ) : (
        <div className="border border-rule rounded-[2px] overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-rule bg-warm/30">
              <tr>
                <Th>Product</Th>
                <Th>Slug</Th>
                <Th>Type</Th>
                <Th>Prijs</Th>
                <Th>Bumps</Th>
                <Th>Status</Th>
                <Th>Acties</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-rule last:border-b-0 hover:bg-warm/20">
                  <td className="px-4 py-3 font-medium">
                    {product.shortName.nl}
                  </td>
                  <td className="px-4 py-3 text-ink/50 font-mono text-[11px]">
                    {product.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[2px] ${
                      product.type === "training"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-green-50 text-green-700"
                    }`}>
                      {product.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatPrice(product.priceCents)}
                    <span className="text-[10px] text-ink/30 ml-1">
                      {product.priceInclBtw ? "incl" : "excl"} BTW
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/50">
                    {product.bumps.length > 0 ? product.bumps.length : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[2px] ${
                      product.active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {product.active ? "Actief" : "Inactief"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditId(product._id); setView("edit"); }}
                        className="text-[11px] text-copper hover:text-copper-light cursor-pointer"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => duplicate({ id: product._id })}
                        className="text-[11px] text-ink/40 hover:text-ink cursor-pointer"
                      >
                        Kloon
                      </button>
                      {product.active && (
                        <button
                          onClick={() => {
                            if (confirm("Product deactiveren? Bestaande orders blijven werken.")) {
                              deactivate({ id: product._id });
                            }
                          }}
                          className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Deactiveer
                        </button>
                      )}
                    </div>
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
