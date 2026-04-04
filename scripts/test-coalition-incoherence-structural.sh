#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

./scripts/test-create-content.sh \
  --filter '{
    opening: (.writerOutput.bodyMarkdown | split("\n")[0]),
    closing: (.styleShaper.revisedText | split("\n\n") | last),
    retry: .retry,
    firstPassViolations: ((.firstPassBrandGuardian.violations // []) | map(.rule) | join(", "))
  }' -- \
  --topic "Why founders lose strategic clarity" \
  --type insight \
  --audience founders \
  --locale en-us \
  --goal "Explain why organizations structurally produce strategic incoherence even when every subunit is performing well, without reducing it to poor communication, cultural misalignment, or insufficient leadership presence" \
  --thesisHint "Organizations are coalitions of subunits with conflicting goal functions and misaligned temporal cadences — strategic incoherence is the structural default, not the exception, and the founder is the last to see it because they approved every decision individually" \
  --notes "Cyert and March's Behavioral Theory of the Firm explains this structurally: organizations are coalitions of subunits with conflicting goals, not unified rational actors — strategy drift is not a failure of intent, it is the default output of that coalition dynamic. REF: Cyert, R. M., & March, J. G. (1963). A Behavioral Theory of the Firm. Prentice-Hall. ISBN: 978-0-631-17451-6" \
  --notes "The organizational structure itself is the strategy execution mechanism — when structure is misaligned with strategic intent, subunit cadences diverge: product on quarterly shipping cycles, sales on monthly quota cycles, marketing on campaign cycles — these temporal mismatches produce goal interference even when every team is performing well. REF: Cyert, R. M., & March, J. G. (1963). A Behavioral Theory of the Firm. Prentice-Hall. ISBN: 978-0-631-17451-6" \
  --notes "Strategic drift is not caused by bad decisions — it is caused by an accumulation of locally rational, incrementally sensible decisions that slowly decouple the organization from its original strategic intent without any single moment of failure. REF: Johnson, G. (1988). Processes of Managing Strategic Change. Management Research News, 11(4–5), 43–46. https://doi.org/10.1108/eb027990" \
  --notes "Bounded rationality means that no executive, including the founder, can hold the full decision landscape in mind — the organization therefore decomposes problems into subunit-sized pieces, each subunit optimizes its piece, and the resulting aggregate is incoherent by construction. REF: Simon, H. A. (1955). A Behavioral Model of Rational Choice. The Quarterly Journal of Economics, 69(1), 99–118. https://doi.org/10.2307/1884852" \
  --examples "Marketing optimizes for top-of-funnel volume to hit MQL targets; sales optimizes for deal size to hit ARR targets; the resulting pipeline is high in quantity, low in close rate, and the root cause — ICP misalignment — is invisible in either team's metrics" \
  --examples "Product ships a self-serve onboarding flow optimized for SMB activation; simultaneously, sales closes an enterprise deal requiring white-glove implementation — both decisions are correct locally, but together they fracture the ICP and split engineering capacity permanently" \
  --sourceMode notes \
  --seo-primary "strategic clarity founders" \
  --seo-secondary "organizational misalignment startups" \
  --seo-secondary "strategy execution failure" \
  --seo-intent informational
