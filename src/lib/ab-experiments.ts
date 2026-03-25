/**
 * A/B experiment utilities.
 *
 * Two modes of operation:
 *
 * 1. **DB-driven (recommended)** — create + start an experiment in the admin
 *    panel. The checkout server component queries Convex for the active
 *    experiment and assigns a variant. No deploy needed.
 *
 * 2. **Static fallback** — add an entry to ACTIVE_EXPERIMENTS below.
 *    Middleware assigns variants via cookies on first visit. Requires deploy.
 *
 * DB-driven experiments take priority over static ones for the same product.
 */

export type ExperimentConfig = {
  slug: string;
  product: string; // product slug or "*" for all checkout pages
  weightB: number; // percentage for variant B (0-100)
};

/**
 * Static experiments processed by middleware (edge runtime).
 * Only needed when you can't use the admin panel.
 * DB-driven experiments (via admin) take priority over these.
 */
export const ACTIVE_EXPERIMENTS: ExperimentConfig[] = [
  // Example:
  // { slug: "checkout-set-v2", product: "set-online", weightB: 50 },
];

/** Assign a variant based on weight. Returns "A" or "B". */
export function assignVariant(weightB: number): string {
  return Math.random() * 100 < weightB ? "B" : "A";
}

/** Cookie name for an experiment slug. */
export function experimentCookieName(slug: string): string {
  return `ab-${slug}`;
}

/** Max-age for experiment cookies (30 days). */
export const EXPERIMENT_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
