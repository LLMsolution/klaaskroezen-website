/**
 * Statistical significance calculation for A/B tests.
 * Uses a two-proportion z-test at 95% confidence level.
 */

type AbData = {
  impressionsA: number;
  impressionsB: number;
  conversionsA: number;
  conversionsB: number;
};

export type SignificanceResult = {
  significant: boolean;
  confidence: number; // 0-100
  zScore: number;
  pValue: number;
  winner: "A" | "B" | null;
  convRateA: number;
  convRateB: number;
  lift: number; // percentage improvement of B over A
};

export function calculateSignificance(data: AbData): SignificanceResult {
  const { impressionsA: nA, impressionsB: nB, conversionsA: cA, conversionsB: cB } = data;

  const pA = nA > 0 ? cA / nA : 0;
  const pB = nB > 0 ? cB / nB : 0;
  const lift = pA > 0 ? ((pB - pA) / pA) * 100 : 0;

  // Need minimum sample size
  if (nA < 10 || nB < 10) {
    return { significant: false, confidence: 0, zScore: 0, pValue: 1, winner: null, convRateA: pA, convRateB: pB, lift };
  }

  const pPool = (cA + cB) / (nA + nB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / nA + 1 / nB));

  if (se === 0) {
    return { significant: false, confidence: 0, zScore: 0, pValue: 1, winner: null, convRateA: pA, convRateB: pB, lift };
  }

  const z = (pB - pA) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z))); // two-tailed
  const confidence = Math.round((1 - pValue) * 100);
  const significant = pValue < 0.05;
  const winner = significant ? (pB > pA ? "B" : "A") : null;

  return { significant, confidence, zScore: z, pValue, winner, convRateA: pA, convRateB: pB, lift };
}

/** Standard normal CDF approximation (Abramowitz & Stegun) */
function normalCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}
