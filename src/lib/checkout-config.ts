/**
 * Checkout types and utility functions.
 * Product data now lives in Convex DB (checkoutProducts table).
 */

export interface CheckoutProduct {
  _id: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  name: Record<string, string>;
  shortName: Record<string, string>;
  type: "training" | "book";
  productType: "training" | "book" | "event";
  priceCents: number;
  priceInclBtw: boolean;
  btwRate: number;
  description: Record<string, string>;
  features: Record<string, string[]>;
  image?: string;
  bumps: string[];
  bumpPriceOverrides?: Array<{ bumpSlug: string; priceCents: number }>;
  installments?: { count: number; amountPerTermCents: number };
  quantityTiers?: QuantityTier[];
  requiresShipping: boolean;
  mockupType?: "tablet" | "phone" | "audio";
}

export interface BumpConfig {
  slug: string;
  name: Record<string, string>;
  price: number;
  priceInclBtw: boolean;
  btwRate: number;
  description: Record<string, string>;
  image?: string;
  mockupType?: "tablet" | "phone" | "audio";
}

export interface QuantityTier {
  quantity: number;
  unitPriceCents: number;
  savingsPercent: number;
}

/** Format price from cents to display string */
export function formatPrice(cents: number, locale: "nl" | "en" | "de" = "nl"): string {
  const euros = cents / 100;
  if (locale === "en") {
    return `€${euros.toFixed(2).replace(".", ",")}`;
  }
  return `€ ${euros.toFixed(2).replace(".", ",")}`;
}

/** Calculate BTW amount from price in cents */
export function calculateBtw(
  priceCents: number,
  btwRate: number,
  priceInclBtw: boolean,
): { net: number; btw: number; gross: number } {
  if (priceInclBtw) {
    const net = Math.round(priceCents / (1 + btwRate / 100));
    const btw = priceCents - net;
    return { net, btw, gross: priceCents };
  }
  const btw = Math.round(priceCents * (btwRate / 100));
  return { net: priceCents, btw, gross: priceCents + btw };
}

/** EU country codes for BTW logic */
export const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

export type EuCountry = (typeof EU_COUNTRIES)[number];

export function isEuCountry(code: string): boolean {
  return EU_COUNTRIES.includes(code as EuCountry);
}
