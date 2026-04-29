/**
 * Shared formatting helpers for orders, shipping labels and Excel export.
 * Mirrors klaas-boekorders/lib/utils/format.ts so the verzendformaat is
 * compatible with the existing PostNL workflow.
 */

/** First letter of firstname + "." (e.g. "Tim" → "T.", "Jan-Willem" → "J."). */
export function formatInitials(firstname: string | undefined): string {
  const trimmed = firstname?.trim() ?? "";
  if (!trimmed) return "";
  return `${trimmed[0].toUpperCase()}.`;
}

/** Parse a quantity-like value, defaulting to 1 if invalid. */
export function parseQuantity(value: unknown): number {
  if (value === null || value === undefined) return 1;
  const num = parseInt(String(value), 10);
  return isNaN(num) || num < 1 ? 1 : num;
}

/**
 * Split a free-form house number into its numeric and suffix parts.
 * Examples: "12" → {number:"12", suffix:""}, "12A" → {number:"12", suffix:"A"},
 * "12-2" → {number:"12", suffix:"-2"}, "12.0" → {number:"12", suffix:""}.
 */
export function splitHouseNumber(raw: string | undefined): { number: string; suffix: string } {
  const value = (raw ?? "").trim();
  if (!value) return { number: "", suffix: "" };
  const match = value.match(/^(\d+)\s*[\.,]?\s*0*\s*([A-Za-z0-9\-\/\s]*)$/);
  if (!match) return { number: value, suffix: "" };
  return {
    number: match[1],
    suffix: (match[2] ?? "").trim(),
  };
}

/**
 * Resolve the final house number string to print on a label.
 * Strips any ".0" floats and prefers an explicit suffix over an embedded one.
 */
export function formatHouseNumber(rawNumber: string | undefined, explicitSuffix?: string): string {
  const split = splitHouseNumber(rawNumber);
  const suffix = (explicitSuffix?.trim() || split.suffix).trim();
  return suffix ? `${split.number}${suffix}` : split.number;
}

/** Dutch currency (€ 1.234,56). Returns "€ 0,00" for invalid input. */
export function formatDutchCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "€ 0,00";
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

/** Dutch date+time (DD-MM-YYYY HH:MM). */
export function formatDutchDateTime(value: number | string | undefined): string {
  if (!value) return "";
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Dutch date only (DD-MM-YYYY). */
export function formatDutchDateShort(value: number | string | undefined): string {
  if (!value) return "";
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Convert a checkout product slug to a human checkout-page label. */
export function checkoutLabel(productSlug: string): string {
  return productSlug
    .replace(/^checkout\//, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
