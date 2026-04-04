import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  buildGrowthKpiSnapshot,
  compareGrowthKpiSnapshots,
  type GrowthEventRecord,
  parseGrowthEventsNdjson,
} from "./lib/growth-kpi.ts";

const readFixture = (name: string): string =>
  readFileSync(path.resolve(process.cwd(), "scripts/fixtures/growth-kpi", name), "utf8");

const main = (): void => {
  const previousRecords = parseGrowthEventsNdjson(readFixture("events-previous.ndjson"));
  const currentRecords = parseGrowthEventsNdjson(readFixture("events-current.ndjson"));
  const baselineCurrent = buildGrowthKpiSnapshot({
    generatedAt: "2026-03-30T00:00:00.000Z",
    property: "example.com",
    windowLabel: "last-28-days",
    windowDays: 28,
    records: currentRecords,
    topN: 10,
    sessionGapMinutes: 30,
  });
  const noisyEditorialEvent: GrowthEventRecord = {
    ...(currentRecords[0] as GrowthEventRecord),
    timestamp: "2026-03-25T10:00:00.000Z",
    event: "newsletter_subscribe_success",
    distinctId: "noise-editorial-user",
    locale: "en-us",
    path: "/en-us",
    source: "home",
    surfaceType: "home",
    postSlug: null,
    translationKey: null,
    properties: {
      ...(currentRecords[0]?.properties || {}),
      analytics_domain: "editorial",
    },
  };
  const noisyCurrentRecords = [...currentRecords, noisyEditorialEvent];

  const previous = buildGrowthKpiSnapshot({
    generatedAt: "2026-03-20T00:00:00.000Z",
    property: "example.com",
    windowLabel: "last-28-days",
    windowDays: 28,
    records: previousRecords,
    topN: 10,
    sessionGapMinutes: 30,
  });
  const current = buildGrowthKpiSnapshot({
    generatedAt: "2026-03-30T00:00:00.000Z",
    property: "example.com",
    windowLabel: "last-28-days",
    windowDays: 28,
    records: noisyCurrentRecords,
    topN: 10,
    sessionGapMinutes: 30,
  });

  const movement = compareGrowthKpiSnapshots({
    current,
    previous,
  });

  assert.equal(movement.compared, true, "expected compared=true when previous exists");
  assert.ok(
    current.kpis.visitorToSignupCvr > previous.kpis.visitorToSignupCvr,
    "expected visitor->signup CVR improvement in current fixture",
  );
  assert.ok(
    movement.summary.signupUsersDelta > 0,
    "expected signup users to increase in current fixture",
  );
  assert.ok(
    current.topConvertingArticles.some((item) => item.slug === "approval-delay-trap"),
    "expected top converting article slug to be present",
  );
  assert.ok(
    current.locales.some((item) => item.locale === "en-us"),
    "expected locale breakdown to include en-us",
  );
  assert.equal(
    current.counters.signupUsers,
    baselineCurrent.counters.signupUsers,
    "expected non-growth tagged events to be excluded from growth KPIs",
  );
  assert.ok(
    current.domainBreakdown.editorial > 0,
    "expected domain breakdown to capture editorial-tagged events",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "parse-growth-events-ndjson",
          "build-growth-kpi-snapshot",
          "compare-growth-kpi-snapshot",
          "top-converting-articles",
          "locale-breakdown",
          "analytics-domain-filter",
        ],
      },
      null,
      2,
    ),
  );
};

main();
