import type { GrowthKpiSnapshot } from "./growth-kpi.ts";

export interface GrowthKpiHistory {
  property: string;
  snapshots: Array<{
    id: string;
    generatedAt: string;
    property: string;
    windowLabel: string;
    snapshot: GrowthKpiSnapshot;
  }>;
}

export interface GrowthKpiStabilityThresholds {
  requiredCycles: number;
  minConversionVisitors: number;
  maxVisitorToSignupVolatilityPp: number;
  maxSignupUsersCv: number;
  maxDepthRateVolatilityPp: number;
}

export interface GrowthKpiCycleSummary {
  id: string;
  generatedAt: string;
  windowLabel: string;
  conversionVisitors: number;
  signupUsers: number;
  visitorToSignupCvr: number;
  articleToSignupCvr: number;
  welcomeProgressRate: number;
  returnReaderRate14d: number;
  depthRate: number;
}

export interface GrowthKpiStabilityAnalysis {
  property: string;
  status: "insufficient_data" | "stable" | "noisy";
  ready: boolean;
  requiredCycles: number;
  cyclesConsidered: number;
  thresholds: GrowthKpiStabilityThresholds;
  cycles: GrowthKpiCycleSummary[];
  volatility: {
    visitorToSignupCvrPp: number;
    articleToSignupCvrPp: number;
    welcomeProgressRatePp: number;
    returnReaderRate14dPp: number;
    depthRatePp: number;
    signupUsersCv: number;
    visitorToSignupDirectionFlips: number;
  };
  noiseFlags: string[];
  recommendations: string[];
}

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const percent = (ratio: number): number => round(ratio * 100, 2);

const clampRequiredCycles = (value?: number): number => {
  if (!Number.isFinite(value) || (value as number) <= 1) return 3;
  return Math.floor(value as number);
};

const asPositive = (value: number | undefined, fallback: number): number => {
  if (!Number.isFinite(value) || (value as number) <= 0) return fallback;
  return value as number;
};

const minMaxVolatility = (values: number[]): number => {
  if (values.length === 0) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return round(max - min, 4);
};

const stdDev = (values: number[]): number => {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, item) => sum + item, 0) / values.length;
  const variance =
    values.reduce((sum, item) => {
      const diff = item - mean;
      return sum + diff * diff;
    }, 0) / values.length;
  return Math.sqrt(Math.max(variance, 0));
};

const coefficientVariation = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, item) => sum + item, 0) / values.length;
  if (mean <= 0) return 0;
  return round(stdDev(values) / mean, 4);
};

const sign = (value: number): number => {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
};

const countDirectionFlips = (values: number[]): number => {
  if (values.length < 3) return 0;
  const deltas: number[] = [];
  for (let index = 1; index < values.length; index += 1) {
    deltas.push(values[index] - values[index - 1]);
  }

  let flips = 0;
  let previousSign = 0;
  for (const delta of deltas) {
    const currentSign = sign(delta);
    if (currentSign === 0) continue;
    if (previousSign !== 0 && currentSign !== previousSign) {
      flips += 1;
    }
    previousSign = currentSign;
  }

  return flips;
};

export const analyzeGrowthKpiStability = (
  history: GrowthKpiHistory,
  options?: Partial<GrowthKpiStabilityThresholds> & { property?: string },
): GrowthKpiStabilityAnalysis => {
  const property = (options?.property || history.property || "").trim() || "unknown";
  const thresholds: GrowthKpiStabilityThresholds = {
    requiredCycles: clampRequiredCycles(options?.requiredCycles),
    minConversionVisitors: asPositive(options?.minConversionVisitors, 60),
    maxVisitorToSignupVolatilityPp: asPositive(options?.maxVisitorToSignupVolatilityPp, 2),
    maxSignupUsersCv: asPositive(options?.maxSignupUsersCv, 0.35),
    maxDepthRateVolatilityPp: asPositive(options?.maxDepthRateVolatilityPp, 12),
  };

  const samePropertySnapshots = history.snapshots
    .filter((item) => (item.property || history.property) === property)
    .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt))
    .slice(-thresholds.requiredCycles);

  const cycles: GrowthKpiCycleSummary[] = samePropertySnapshots.map((entry) => ({
    id: entry.id,
    generatedAt: entry.generatedAt,
    windowLabel: entry.windowLabel,
    conversionVisitors: entry.snapshot.counters.conversionVisitors,
    signupUsers: entry.snapshot.counters.signupUsers,
    visitorToSignupCvr: entry.snapshot.kpis.visitorToSignupCvr,
    articleToSignupCvr: entry.snapshot.kpis.articleToSignupCvr,
    welcomeProgressRate: entry.snapshot.kpis.welcomeProgressRate,
    returnReaderRate14d: entry.snapshot.kpis.returnReaderRate14d,
    depthRate: entry.snapshot.kpis.depthRate,
  }));

  const visitorCvrs = cycles.map((item) => item.visitorToSignupCvr);
  const articleCvrs = cycles.map((item) => item.articleToSignupCvr);
  const welcomeRates = cycles.map((item) => item.welcomeProgressRate);
  const returnRates = cycles.map((item) => item.returnReaderRate14d);
  const depthRates = cycles.map((item) => item.depthRate);
  const signupUsersSeries = cycles.map((item) => item.signupUsers);

  const volatility = {
    visitorToSignupCvrPp: percent(minMaxVolatility(visitorCvrs)),
    articleToSignupCvrPp: percent(minMaxVolatility(articleCvrs)),
    welcomeProgressRatePp: percent(minMaxVolatility(welcomeRates)),
    returnReaderRate14dPp: percent(minMaxVolatility(returnRates)),
    depthRatePp: percent(minMaxVolatility(depthRates)),
    signupUsersCv: coefficientVariation(signupUsersSeries),
    visitorToSignupDirectionFlips: countDirectionFlips(visitorCvrs),
  };

  const noiseFlags: string[] = [];
  if (cycles.length < thresholds.requiredCycles) {
    noiseFlags.push("insufficient_cycles");
  }
  if (cycles.some((item) => item.conversionVisitors < thresholds.minConversionVisitors)) {
    noiseFlags.push("low_conversion_volume");
  }
  if (volatility.visitorToSignupCvrPp > thresholds.maxVisitorToSignupVolatilityPp) {
    noiseFlags.push("high_visitor_to_signup_volatility");
  }
  if (volatility.signupUsersCv > thresholds.maxSignupUsersCv) {
    noiseFlags.push("unstable_signup_volume");
  }
  if (volatility.depthRatePp > thresholds.maxDepthRateVolatilityPp) {
    noiseFlags.push("high_depth_rate_volatility");
  }
  if (volatility.visitorToSignupDirectionFlips > 1) {
    noiseFlags.push("oscillating_conversion_direction");
  }

  const recommendations: string[] = [];
  if (noiseFlags.includes("insufficient_cycles")) {
    recommendations.push(
      `Collect at least ${thresholds.requiredCycles} weekly snapshots before making KPI stability decisions.`,
    );
  }
  if (noiseFlags.includes("low_conversion_volume")) {
    recommendations.push(
      `Increase signal quality first (more traffic or longer window) before judging conversion changes.`,
    );
  }
  if (noiseFlags.includes("high_visitor_to_signup_volatility")) {
    recommendations.push(
      "Freeze conversion-surface experiments for one cycle and verify event quality/tagging consistency.",
    );
  }
  if (noiseFlags.includes("unstable_signup_volume")) {
    recommendations.push(
      "Check campaign/source mix and form failure classes before attributing movement to product changes.",
    );
  }
  if (noiseFlags.includes("high_depth_rate_volatility")) {
    recommendations.push("Review engagement instrumentation thresholds and article scroll/read tracking behavior.");
  }
  if (noiseFlags.includes("oscillating_conversion_direction")) {
    recommendations.push("Avoid fast back-and-forth UI changes; hold one variant for a full window.");
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Stability looks acceptable. Continue with one controlled experiment at a time and monitor guardrails.",
    );
  }

  const status: GrowthKpiStabilityAnalysis["status"] = noiseFlags.includes("insufficient_cycles")
    ? "insufficient_data"
    : noiseFlags.length > 0
      ? "noisy"
      : "stable";

  return {
    property,
    status,
    ready: status !== "insufficient_data",
    requiredCycles: thresholds.requiredCycles,
    cyclesConsidered: cycles.length,
    thresholds,
    cycles,
    volatility,
    noiseFlags,
    recommendations,
  };
};

export const buildGrowthKpiStabilityReportText = (analysis: GrowthKpiStabilityAnalysis): string => {
  const lines: string[] = [];
  lines.push(`Growth KPI stabilization check (${analysis.property})`);
  lines.push(`Status: ${analysis.status}`);
  lines.push(`Cycles: ${analysis.cyclesConsidered}/${analysis.requiredCycles}`);
  lines.push("");

  if (analysis.cycles.length > 0) {
    lines.push("Cycles considered:");
    for (const cycle of analysis.cycles) {
      lines.push(
        `- ${cycle.generatedAt} (${cycle.id}): CVR ${percent(cycle.visitorToSignupCvr)} | visitors ${cycle.conversionVisitors} | signups ${cycle.signupUsers}`,
      );
    }
    lines.push("");
  }

  lines.push("Volatility:");
  lines.push(`- Visitor -> signup CVR: ${analysis.volatility.visitorToSignupCvrPp}pp`);
  lines.push(`- Article -> signup CVR: ${analysis.volatility.articleToSignupCvrPp}pp`);
  lines.push(`- Welcome progress: ${analysis.volatility.welcomeProgressRatePp}pp`);
  lines.push(`- Return reader rate (14d): ${analysis.volatility.returnReaderRate14dPp}pp`);
  lines.push(`- Depth rate: ${analysis.volatility.depthRatePp}pp`);
  lines.push(`- Signup users CV: ${round(analysis.volatility.signupUsersCv, 4)}`);
  lines.push(`- Visitor->signup direction flips: ${analysis.volatility.visitorToSignupDirectionFlips}`);
  lines.push("");

  lines.push(
    `Thresholds: min visitors ${analysis.thresholds.minConversionVisitors}, max CVR volatility ${analysis.thresholds.maxVisitorToSignupVolatilityPp}pp, max signup CV ${analysis.thresholds.maxSignupUsersCv}, max depth volatility ${analysis.thresholds.maxDepthRateVolatilityPp}pp`,
  );
  lines.push("");

  if (analysis.noiseFlags.length > 0) {
    lines.push(`Noise flags: ${analysis.noiseFlags.join(", ")}`);
  } else {
    lines.push("Noise flags: none");
  }
  lines.push("");
  lines.push("Recommendations:");
  for (const item of analysis.recommendations) {
    lines.push(`- ${item}`);
  }

  return `${lines.join("\n")}\n`;
};
