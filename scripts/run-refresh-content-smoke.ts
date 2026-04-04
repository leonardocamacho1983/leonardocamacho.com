import assert from "node:assert/strict";

import type { PostDetailDTO } from "../src/lib/types.ts";
import { parseRefreshArgsFromArgv } from "./lib/refresh-content-cli-args.ts";
import {
  buildRefreshPlannerInput,
  resolveRefreshSourceSelection,
} from "../ops/publishing/workflows/refreshContentHelpers.ts";

const argv = (...flags: string[]): string[] => ["node", "scripts/run-refresh-content.ts", ...flags];

const mockSourcePost: PostDetailDTO = {
  id: "post-refresh-smoke-en-us",
  locale: "en-us",
  translationKey: "refresh-smoke",
  title: "Why early signal audits fail",
  titleEmphasis: "signal audits",
  slug: "why-early-signal-audits-fail",
  excerpt: "A compact diagnostic lens for signal-to-authority failure points.",
  coverImage: undefined,
  category: {
    id: "category-note-en-us",
    locale: "en-us",
    translationKey: "note",
    title: "Notes",
    slug: "notes",
    color: "#000000",
    order: 1,
  },
  publishedAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-02T00:00:00.000Z",
  readTimeMinutes: 5,
  featuredOnHome: false,
  featuredInArchive: false,
  body: [],
  seoTitle: "Why early signal audits fail",
  seoDescription: "Signal-to-authority handoff failures.",
  seoImage: undefined,
  translations: [{ locale: "en-us", slug: "why-early-signal-audits-fail" }],
};

const main = (): void => {
  const parsed = parseRefreshArgsFromArgv(
    argv(
      "--postId",
      "post-refresh-smoke-en-us",
      "--source",
      "draft",
      "--notes",
      "Preserve the practical diagnostic frame.",
      "--save",
    ),
  );

  assert.equal(parsed.postId, "post-refresh-smoke-en-us", "[parser] postId mismatch");
  assert.equal(parsed.source, "draft", "[parser] source mismatch");
  assert.equal(parsed.dryRun, false, "[parser] save flag mismatch");

  const planner = buildRefreshPlannerInput({
    source: mockSourcePost,
    sourceMarkdown:
      "Weak signals rarely die at detection.\n\nThey usually lose force between escalation and authority.\n\nRun one signal path and find where decision weight drops.",
    goal: "Refresh for stronger operator relevance in the first paragraph.",
    extraNotes: ["Keep it compact."],
  });

  assert.equal(planner.goal, "Refresh for stronger operator relevance in the first paragraph.");
  assert.ok(planner.notes.length >= 4, "[planner] expected compact notes from source + extras");
  assert.ok(planner.notes.some((item) => item.includes("Current title")), "[planner] title context missing");
  assert.ok(planner.notes.includes("Keep it compact."), "[planner] extra note not carried");
  assert.equal(planner.sourceMode, "mixed", "[planner] sourceMode mismatch");

  const publishedFallback = resolveRefreshSourceSelection("draft", {
    draft: null,
    published: {
      presentedId: "post-refresh-smoke-en-us",
    },
  });

  assert.equal(publishedFallback.resolved, "published", "[selection] expected published fallback");
  assert.equal(
    publishedFallback.fallbackReason,
    "requested_draft_unavailable_using_published",
    "[selection] fallback reason mismatch",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "parser-refresh-args",
          "planner-input-derived-from-source",
          "source-selection-fallback",
        ],
      },
      null,
      2,
    ),
  );
};

main();
