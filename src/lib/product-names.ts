"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Static fallback labels — used while the DB query is loading and as
 * default for slugs not yet in checkoutProducts. Tight admin-style names.
 */
export const PRODUCT_NAMES: Record<string, string> = {
  "set-online": "SET Online",
  "set-coaching": "SET Coaching",
  "cst-online": "CST Online",
  "cst-coaching": "CST Coaching",
  "boek-ebook": "E-book",
  "boek-hardcopy": "Hard Copy",
  "boek-luisterboek": "Luisterboek",
};

/**
 * Verbose dashboard labels — used by user-facing dashboard sections that
 * display the full product title rather than the short admin tag.
 */
export const PRODUCT_NAMES_FULL: Record<string, string> = {
  "set-online": "Sales Excellence Training — Online",
  "set-coaching": "Sales Excellence Training — Coaching",
  "cst-online": "Customer Success Training — Online",
  "cst-coaching": "Customer Success Training — Coaching",
  "boek-ebook": "Sales, Oprecht & Ontspannen — E-book",
  "boek-hardcopy": "Sales, Oprecht & Ontspannen — Hard Copy",
  "boek-luisterboek": "Sales, Oprecht & Ontspannen — Luisterboek",
};

/**
 * Returns slug → label from the DB. Overlays a fallback map so unknown or
 * not-yet-loaded slugs still render reasonably.
 */
export function useProductNames(
  lang: "nl" | "en" | "de" = "nl",
  variant: "name" | "shortName" = "shortName",
): Record<string, string> {
  const products = useQuery(api.checkoutProducts.listAll);
  const fallback = variant === "name" ? PRODUCT_NAMES_FULL : PRODUCT_NAMES;
  if (!products) return fallback;
  const map: Record<string, string> = { ...fallback };
  for (const p of products) {
    const obj = (p[variant] as Record<string, string | undefined>) ?? {};
    map[p.slug] = obj[lang] ?? obj.nl ?? p.slug;
  }
  return map;
}
