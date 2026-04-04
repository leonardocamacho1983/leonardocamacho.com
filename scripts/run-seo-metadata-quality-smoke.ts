import assert from "node:assert/strict";

import { generateMetadata } from "../ops/publishing/finalize/generateMetadata.ts";

interface Fixture {
  name: string;
  input: {
    topic: string;
    contentType: string;
    audience: string;
    draftText: string;
  };
}

const fixtures: Fixture[] = [
  {
    name: "insight_founders",
    input: {
      topic: "Why harmless approval rules create strategic delay",
      contentType: "insight",
      audience: "founders",
      draftText:
        "Approval loops do not usually fail because people are careless. They fail because each layer adds a small hold condition that no single owner can clear quickly. The delay is structural long before it feels personal.",
    },
  },
  {
    name: "research_operators",
    input: {
      topic: "Weak-signal thresholds and structural adaptation lag",
      contentType: "research",
      audience: "operators",
      draftText:
        "Organizations can detect risk earlier than they can justify response. The bottleneck is usually authority design, not signal quality. This matters when the cost curve steepens before consensus catches up.",
    },
  },
  {
    name: "note_teams",
    input: {
      topic: "Postmortems that hide threshold design flaws",
      contentType: "note",
      audience: "teams",
      draftText:
        "Most postmortems isolate visible mistakes and miss the threshold logic that delayed action. The useful question is who needed to agree before the team could move.",
    },
  },
];

const hasWordBoundary = (value: string): boolean => /\s/.test(value);

const main = (): void => {
  const outputs = fixtures.map((fixture) => ({
    name: fixture.name,
    metadata: generateMetadata(fixture.input),
  }));

  for (const { name, metadata } of outputs) {
    assert.ok(metadata.title.length > 20, `[${name}] title is too short`);
    assert.ok(metadata.title.length <= 110, `[${name}] title exceeds 110 chars`);
    assert.ok(metadata.description.length >= 80, `[${name}] description is too short`);
    assert.ok(metadata.description.length <= 160, `[${name}] description exceeds 160 chars`);
    assert.ok(metadata.excerpt.length >= 40, `[${name}] excerpt is too short`);
    assert.ok(metadata.slug.length > 8, `[${name}] slug is too short`);
    assert.match(metadata.slug, /^[a-z0-9-]+$/, `[${name}] slug has invalid chars`);
    assert.ok(!metadata.slug.includes("--"), `[${name}] slug has repeated hyphens`);
    assert.ok(hasWordBoundary(metadata.title), `[${name}] title should contain multiple words`);
    assert.ok(!/built for .*strategic execution/i.test(metadata.description), `[${name}] old generic description leaked`);
    assert.ok(!/: \w+ for \w+/i.test(metadata.title), `[${name}] old templated title leaked`);
    assert.ok(!/for founders$/i.test(metadata.title), `[${name}] title still audience-templated`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: outputs.map(({ name }) => name),
      },
      null,
      2,
    ),
  );
};

main();
