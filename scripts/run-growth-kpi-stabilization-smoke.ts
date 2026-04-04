import assert from "node:assert/strict";
import {
  analyzeGrowthKpiStability,
  type GrowthKpiHistory,
} from "./lib/growth-kpi-stability.ts";
import type { GrowthKpiSnapshot } from "./lib/growth-kpi.ts";

const makeSnapshot = (input: {
  generatedAt: string;
  visitorToSignupCvr: number;
  articleToSignupCvr: number;
  welcomeProgressRate: number;
  returnReaderRate14d: number;
  depthRate: number;
  conversionVisitors: number;
  signupUsers: number;
}): GrowthKpiSnapshot => ({
  generatedAt: input.generatedAt,
  property: "example.com",
  windowLabel: "last-28-days",
  windowDays: 28,
  windowStart: "2026-03-01T00:00:00.000Z",
  windowEnd: input.generatedAt,
  domainBreakdown: { growth: 120, editorial: 20, other: 0, untagged: 0 },
  totals: { records: 140, recordsInWindow: 140, uniqueUsers: 80 },
  funnel: { welcomeViews: 20, confirmedViews: 16 },
  kpis: {
    visitorToSignupCvr: input.visitorToSignupCvr,
    articleToSignupCvr: input.articleToSignupCvr,
    welcomeProgressRate: input.welcomeProgressRate,
    returnReaderRate14d: input.returnReaderRate14d,
    depthRate: input.depthRate,
  },
  counters: {
    conversionVisitors: input.conversionVisitors,
    signupUsers: input.signupUsers,
    articleReaders: 50,
    articleSignupUsers: 8,
    returnReaders14d: 12,
    totalContentReaders: 24,
    sessionsWith2PlusContentEvents: 10,
    totalContentSessions: 20,
  },
  locales: [],
  topConvertingArticles: [],
  eventCounts: {},
});

const makeHistory = (snapshots: GrowthKpiSnapshot[]): GrowthKpiHistory => ({
  property: "example.com",
  snapshots: snapshots.map((snapshot, index) => ({
    id: `cycle-${index + 1}`,
    generatedAt: snapshot.generatedAt,
    property: "example.com",
    windowLabel: "last-28-days",
    snapshot,
  })),
});

const main = (): void => {
  const stableHistory = makeHistory([
    makeSnapshot({
      generatedAt: "2026-03-10T00:00:00.000Z",
      visitorToSignupCvr: 0.08,
      articleToSignupCvr: 0.1,
      welcomeProgressRate: 0.8,
      returnReaderRate14d: 0.38,
      depthRate: 0.33,
      conversionVisitors: 180,
      signupUsers: 14,
    }),
    makeSnapshot({
      generatedAt: "2026-03-17T00:00:00.000Z",
      visitorToSignupCvr: 0.081,
      articleToSignupCvr: 0.102,
      welcomeProgressRate: 0.81,
      returnReaderRate14d: 0.39,
      depthRate: 0.34,
      conversionVisitors: 190,
      signupUsers: 15,
    }),
    makeSnapshot({
      generatedAt: "2026-03-24T00:00:00.000Z",
      visitorToSignupCvr: 0.079,
      articleToSignupCvr: 0.101,
      welcomeProgressRate: 0.8,
      returnReaderRate14d: 0.4,
      depthRate: 0.35,
      conversionVisitors: 200,
      signupUsers: 16,
    }),
  ]);

  const noisyHistory = makeHistory([
    makeSnapshot({
      generatedAt: "2026-03-10T00:00:00.000Z",
      visitorToSignupCvr: 0.03,
      articleToSignupCvr: 0.04,
      welcomeProgressRate: 0.6,
      returnReaderRate14d: 0.2,
      depthRate: 0.22,
      conversionVisitors: 25,
      signupUsers: 1,
    }),
    makeSnapshot({
      generatedAt: "2026-03-17T00:00:00.000Z",
      visitorToSignupCvr: 0.13,
      articleToSignupCvr: 0.11,
      welcomeProgressRate: 0.75,
      returnReaderRate14d: 0.31,
      depthRate: 0.49,
      conversionVisitors: 40,
      signupUsers: 5,
    }),
    makeSnapshot({
      generatedAt: "2026-03-24T00:00:00.000Z",
      visitorToSignupCvr: 0.05,
      articleToSignupCvr: 0.06,
      welcomeProgressRate: 0.65,
      returnReaderRate14d: 0.26,
      depthRate: 0.29,
      conversionVisitors: 35,
      signupUsers: 2,
    }),
  ]);

  const stable = analyzeGrowthKpiStability(stableHistory, {
    requiredCycles: 3,
    minConversionVisitors: 60,
  });
  assert.equal(stable.status, "stable", "expected stable history to be classified as stable");
  assert.equal(stable.ready, true, "expected stable analysis to be ready");
  assert.equal(stable.noiseFlags.length, 0, "expected no noise flags for stable history");

  const noisy = analyzeGrowthKpiStability(noisyHistory, {
    requiredCycles: 3,
    minConversionVisitors: 60,
  });
  assert.equal(noisy.status, "noisy", "expected noisy history to be classified as noisy");
  assert.ok(
    noisy.noiseFlags.includes("low_conversion_volume"),
    "expected noisy history to include low volume flag",
  );
  assert.ok(
    noisy.noiseFlags.includes("high_visitor_to_signup_volatility"),
    "expected noisy history to include CVR volatility flag",
  );

  const insufficient = analyzeGrowthKpiStability(stableHistory, { requiredCycles: 4 });
  assert.equal(
    insufficient.status,
    "insufficient_data",
    "expected insufficient cycles to be classified as insufficient_data",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: ["stable-classification", "noisy-classification", "insufficient-data-classification"],
      },
      null,
      2,
    ),
  );
};

main();
