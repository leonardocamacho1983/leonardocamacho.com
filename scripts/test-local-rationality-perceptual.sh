#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

./scripts/test-create-content.sh -- \
  --topic "Why founders lose strategic clarity" \
  --type insight \
  --audience founders \
  --locale en-us \
  --goal "Explain how strategic clarity erodes through individually rational decisions made across the organization, without reducing the phenomenon to distraction, poor prioritization, or weak leadership" \
  --thesisHint "Strategic clarity is not lost through distraction or weak leadership — it is structurally destroyed by the accumulation of locally rational decisions made by well-functioning subunits operating on misaligned goal functions and temporal cadences" \
  --notes "Founders misattribute strategic fog to distraction or poor prioritization — the standard diagnosis is wrong because it locates the problem in the individual rather than in organizational structure. REF: Simon, H. A. (1955). A Behavioral Model of Rational Choice. The Quarterly Journal of Economics, 69(1), 99–118. https://doi.org/10.2307/1884852" \
  --notes "The real mechanism is local optimization: each team satisfices within its own goal function, producing decisions that are rational from inside the subunit but destructive to global coherence. REF: Simon, H. A. (1955). A Behavioral Model of Rational Choice. The Quarterly Journal of Economics, 69(1), 99–118. https://doi.org/10.2307/1884852" \
  --notes "Good decisions compound into bad strategy: each individual call made by product, sales, or engineering can be locally optimal and well-reasoned, yet the sequence of those decisions produces emergent strategy that no one chose and no one owns. REF: Mintzberg, H., & Waters, J. A. (1985). Of Strategies, Deliberate and Emergent. Strategic Management Journal, 6(3), 257–272. https://doi.org/10.1002/smj.4250060306" \
  --notes "Founders confuse activity coherence with strategic coherence — high output, clear OKRs, and fast execution can coexist with complete strategic drift; performance metrics at the subunit level are systematically blind to global incoherence. REF: Johnson, G. (1987). Strategic Change and the Management Process. Basil Blackwell. ISBN: 978-0-631-15995-7" \
  --examples "Product ships a self-serve onboarding flow optimized for SMB activation; simultaneously, sales closes an enterprise deal requiring white-glove implementation — both decisions are correct locally, but together they fracture the ICP and split engineering capacity permanently" \
  --examples "A founder approves 12 reasonable product requests from 12 different enterprise customers across 6 months — each approval was rational; the aggregate outcome is a roadmap owned by no strategic vision" \
  --sourceMode notes \
  --seo-primary "strategic clarity founders" \
  --seo-secondary "why founders lose focus" \
  --seo-secondary "strategic drift startups" \
  --seo-intent informational
