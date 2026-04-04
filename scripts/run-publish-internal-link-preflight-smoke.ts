import assert from "node:assert/strict";

import { validateDraftInternalLinkPreflight } from "../ops/shared/cms/internalLinking";

const main = (): void => {
  const supportMissingTargets = validateDraftInternalLinkPreflight({
    editorialPlan: {
      clusterRole: "support",
      mustLinkTo: [],
      internalLinkPlan: [],
    },
    body: [],
  });
  assert.equal(supportMissingTargets.ok, false, "support role must fail without valid targets");
  assert.equal(supportMissingTargets.required, true, "support role should require internal targets");

  const bridgeInvalidTarget = validateDraftInternalLinkPreflight({
    editorialPlan: {
      clusterRole: "bridge",
      internalLinkPlan: [{ target: "AI", kind: "post", purpose: "bridge", anchorHint: "ai" }],
    },
    body: [],
  });
  assert.equal(bridgeInvalidTarget.ok, false, "bridge role must fail with invalid targets");

  const supportCorePage = validateDraftInternalLinkPreflight({
    editorialPlan: {
      clusterRole: "support",
      internalLinkPlan: [
        { target: "about", kind: "core-page", purpose: "reinforce", anchorHint: "about page" },
      ],
    },
    body: [],
  });
  assert.equal(supportCorePage.ok, true, "support role should pass with a valid core-page target");

  const bridgePostPath = validateDraftInternalLinkPreflight({
    editorialPlan: {
      clusterRole: "bridge",
      internalLinkPlan: [
        {
          target: "/en-us/writing/why-harmless-approval-rules-create-strategic-delay-20260327",
          kind: "post",
          purpose: "bridge",
          anchorHint: "approval delay trap",
        },
      ],
    },
    body: [],
  });
  assert.equal(bridgePostPath.ok, true, "bridge role should pass with a valid post target");

  const supportBodyHrefFallback = validateDraftInternalLinkPreflight({
    editorialPlan: {
      clusterRole: "support",
      mustLinkTo: [],
      internalLinkPlan: [],
    },
    body: [
      {
        _type: "block",
        markDefs: [
          {
            _type: "link",
            href: "/en-us/writing/operating-clarity-compounds",
          },
        ],
      },
    ],
  });
  assert.equal(supportBodyHrefFallback.ok, true, "support role should accept valid internal links from body markDefs");

  const pillarNoTargets = validateDraftInternalLinkPreflight({
    editorialPlan: {
      clusterRole: "pillar",
      mustLinkTo: [],
      internalLinkPlan: [],
    },
    body: [],
  });
  assert.equal(pillarNoTargets.ok, true, "pillar role should not require internal targets");
  assert.equal(pillarNoTargets.required, false, "pillar role should not trigger required preflight");

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "support-requires-target",
          "bridge-invalid-target-rejected",
          "support-core-page-target",
          "bridge-post-target",
          "body-link-fallback",
          "pillar-not-required",
        ],
      },
      null,
      2,
    ),
  );
};

main();

