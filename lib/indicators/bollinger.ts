import { KLineData } from "klinecharts";
import { BollingerInputs, BollingerBandData } from "@/lib/types";

function calculateStdDev(data: number[], mean: number): number {
  const n = data.length;
  if (n === 0) return 0;
  const variance = data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / n;
  return Math.sqrt(variance);
}

export function computeBollingerBands(
  data: KLineData[],
  options: BollingerInputs
): (BollingerBandData | null)[] {
  const { length, stdDev: stdDevMultiplier, source } = options;
  const results: (BollingerBandData | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < length - 1) {
      results.push(null);
      continue;
    }

    const slice = data.slice(i - length + 1, i + 1);
    const sourceData = slice.map(d => d[source]);

    const sum = sourceData.reduce((acc, val) => acc + val, 0);
    const basis = sum / length;

    const stdDevValue = calculateStdDev(sourceData, basis);

    const upper = basis + stdDevValue * stdDevMultiplier;
    const lower = basis - stdDevValue * stdDevMultiplier;

    // Use 'value' for the basis/middle band as required by the library's API
    results.push({ value: basis, upper: upper, lower: lower });
  }

  return results;
}