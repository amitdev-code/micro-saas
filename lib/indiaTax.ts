/**
 * Simplified India income tax estimates (illustrative only — not tax advice).
 * Assumes individual resident < 60, FY 2024–25 style slabs + 4% Health & education cess.
 */

const CESS = 0.04;

/** Old regime: slabs in ₹, rates as decimal */
export function taxOldRegime(annualTaxable: number): number {
  if (annualTaxable <= 0) return 0;
  const x = Math.floor(annualTaxable);
  let t = 0;
  if (x <= 250_000) t = 0;
  else if (x <= 500_000) t = (x - 250_000) * 0.05;
  else if (x <= 1_000_000) t = 12_500 + (x - 500_000) * 0.2;
  else t = 12_500 + 100_000 + (x - 1_000_000) * 0.3;
  return t * (1 + CESS);
}

/**
 * New (concessional) regime: slabs 0-3, 3-6, 6-9, 9-12, 12-15, 15+ (simplified, no 87A in engine).
 */
export function taxNewRegime(annualTaxable: number): number {
  if (annualTaxable <= 0) return 0;
  const x = Math.floor(annualTaxable);
  let t = 0;
  if (x <= 300_000) t = 0;
  else if (x <= 600_000) t = (x - 300_000) * 0.05;
  else if (x <= 900_000) t = 15_000 + (x - 600_000) * 0.1;
  else if (x <= 1_200_000) t = 15_000 + 30_000 + (x - 900_000) * 0.15;
  else if (x <= 1_500_000) t = 15_000 + 30_000 + 45_000 + (x - 1_200_000) * 0.2;
  else t = 15_000 + 30_000 + 45_000 + 60_000 + (x - 1_500_000) * 0.3;
  return t * (1 + CESS);
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}
