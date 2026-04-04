import assert from "node:assert/strict";

import { parseArgsFromArgv } from "./lib/create-content-cli-args.ts";

const argv = (...flags: string[]): string[] => ["node", "scripts/run-create-content.ts", ...flags];

const expectThrows = (label: string, fn: () => unknown, pattern: RegExp): void => {
  try {
    fn();
    throw new Error(`[${label}] expected parser to throw`);
  } catch (error) {
    assert.ok(error instanceof Error, `[${label}] expected Error`);
    assert.match(error.message, pattern, `[${label}] unexpected error message`);
  }
};

const main = (): void => {
  const baseline = parseArgsFromArgv(
    argv(
      "--topic",
      "Why harmless approval rules create strategic delay",
      "--type",
      "insight",
      "--audience",
      "founders",
      "--locale",
      "en-us",
      "--goal",
      "Explain why layered approvals increase strategic latency.",
      "--notes",
      "Each approval layer adds a hold condition.",
      "--sourceMode",
      "notes",
    ),
  );

  assert.equal(baseline.plannerInput.seoOpportunity, undefined, "[baseline] seoOpportunity should be optional");

  expectThrows(
    "incomplete-seo-opportunity",
    () =>
      parseArgsFromArgv(
        argv(
          "--topic",
          "Why harmless approval rules create strategic delay",
          "--type",
          "insight",
          "--audience",
          "founders",
          "--locale",
          "en-us",
          "--goal",
          "Explain why layered approvals increase strategic latency.",
          "--notes",
          "Each approval layer adds a hold condition.",
          "--sourceMode",
          "notes",
          "--seo-opportunity-topic",
          "approval loop delay",
        ),
      ),
    /Incomplete SEO opportunity model/,
  );

  expectThrows(
    "invalid-seo-opportunity-intent",
    () =>
      parseArgsFromArgv(
        argv(
          "--topic",
          "Why harmless approval rules create strategic delay",
          "--type",
          "insight",
          "--audience",
          "founders",
          "--locale",
          "en-us",
          "--goal",
          "Explain why layered approvals increase strategic latency.",
          "--notes",
          "Each approval layer adds a hold condition.",
          "--sourceMode",
          "notes",
          "--seo-opportunity-topic",
          "approval loop delay",
          "--seo-opportunity-cluster",
          "governance-latency",
          "--seo-opportunity-intent",
          "transactional",
        ),
      ),
    /Invalid --seo-opportunity-intent/,
  );

  const valid = parseArgsFromArgv(
    argv(
      "--topic",
      "Why harmless approval rules create strategic delay",
      "--type",
      "insight",
      "--audience",
      "founders",
      "--locale",
      "en-us",
      "--goal",
      "Explain why layered approvals increase strategic latency.",
      "--notes",
      "Each approval layer adds a hold condition.",
      "--sourceMode",
      "notes",
      "--seo-opportunity-topic",
      "approval loop delay",
      "--seo-opportunity-cluster",
      "governance-latency",
      "--seo-opportunity-intent",
      "informational",
    ),
  );

  assert.deepEqual(
    valid.plannerInput.seoOpportunity,
    {
      topic: "approval loop delay",
      cluster: "governance-latency",
      intent: "informational",
    },
    "[valid] seoOpportunity mapping mismatch",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "baseline-without-opportunity",
          "incomplete-opportunity-rejected",
          "invalid-opportunity-intent-rejected",
          "valid-opportunity-accepted",
        ],
      },
      null,
      2,
    ),
  );
};

main();
