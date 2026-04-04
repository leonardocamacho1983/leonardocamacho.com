import assert from "node:assert/strict";

import { inspectPostByIdWithClients } from "../ops/shared/cms/read";
import { hasSanityConfig, sanityEnvironment } from "../src/lib/sanity/client";

const main = async (): Promise<void> => {
  const draftId = "drafts.post-review-detection-smoke-en-us";
  const publishedId = "post-review-detection-smoke-en-us";

  const publishedClient = {
    fetch: async <T>(_query: string, params?: Record<string, unknown>): Promise<T> => {
      assert.deepEqual(params, { publishedId }, "[published] params mismatch");
      return null as T;
    },
  };

  const previewClient = {
    fetch: async <T>(query: string, params?: Record<string, unknown>): Promise<T> => {
      assert.match(query, /_originalId == \$draftId/, "[preview] draft query must include _originalId fallback");
      assert.deepEqual(params, { draftId }, "[preview] params mismatch");
      return {
        storageId: "post-review-detection-smoke-en-us",
        presentedId: "post-review-detection-smoke-en-us",
        originalId: draftId,
        locale: "en-us",
        translationKey: "review-detection-smoke",
        title: "Review Detection Smoke",
        slug: "review-detection-smoke",
        excerpt: "Smoke draft.",
        publishedAt: "2026-03-28T00:00:00.000Z",
        readTimeMinutes: 3,
        featuredOnHome: false,
        featuredInArchive: false,
        category: null,
      } as T;
    },
  };

  const inspection = await inspectPostByIdWithClients(
    { publishedId, draftId },
    {
      publishedClient,
      previewClient,
    },
  );

  assert.equal(inspection.published, null, "[inspection] published must be null");
  assert.ok(inspection.draft, "[inspection] draft must exist");
  assert.equal(inspection.draft?.originalId, draftId, "[inspection] originalId mismatch");

  const previousProject = process.env.PUBLIC_SANITY_PROJECT_ID;
  const previousDataset = process.env.PUBLIC_SANITY_DATASET;
  try {
    delete process.env.PUBLIC_SANITY_PROJECT_ID;
    delete process.env.PUBLIC_SANITY_DATASET;
    assert.equal(hasSanityConfig(), false, "[client] hasSanityConfig should be false without env");

    process.env.PUBLIC_SANITY_PROJECT_ID = "demo1234";
    process.env.PUBLIC_SANITY_DATASET = "production";
    assert.equal(hasSanityConfig(), true, "[client] hasSanityConfig should be true with env");
    assert.equal(sanityEnvironment.projectId, "demo1234", "[client] projectId getter should read latest env");
    assert.equal(sanityEnvironment.dataset, "production", "[client] dataset getter should read latest env");
  } finally {
    if (typeof previousProject === "undefined") {
      delete process.env.PUBLIC_SANITY_PROJECT_ID;
    } else {
      process.env.PUBLIC_SANITY_PROJECT_ID = previousProject;
    }

    if (typeof previousDataset === "undefined") {
      delete process.env.PUBLIC_SANITY_DATASET;
    } else {
      process.env.PUBLIC_SANITY_DATASET = previousDataset;
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "review-draft-query-has-original-id-fallback",
          "review-draft-detected-from-preview-result",
          "sanity-client-runtime-env-detection",
        ],
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(
    "[run-publish-review-draft-detection-smoke] Failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});

