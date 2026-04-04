#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/content-workflow.sh <command> [args...]

Commands:
  review-source        Dry-run source generation with compact review output.
  generate-source      Run source generation and print full JSON.
  generate-source-save Run source generation and save the source draft to Sanity.
  inspect-content      Inspect one draft/post or a full translation set with explicit workflow status.
  review-localization  Dry-run localization and print compact locale results.
  localize-save        Localize a saved source draft and save locale drafts to Sanity.
  review-refresh       Dry-run refresh of an existing post and print full JSON.
  refresh-save         Refresh an existing post and save/update the draft in Sanity.
  validate-system      Run LLM hardening, SEO acceptance, editorial benchmarks, and localization regression gates.
  review-publish       Dry-run publish inspection with compact human-readable output.
  publish-draft        Dry-run publish for one draft or all drafts in a translation set.
  publish-draft-save   Publish one draft or all drafts in a translation set.
  seo-track            Ingest Search Console exports and write SEO tracking artifacts.
  growth-kpi           Ingest growth event exports and write KPI summary artifacts.
  growth-stability     Evaluate growth KPI stability across recent weekly cycles.

Examples:
  bash scripts/content-workflow.sh review-source -- \
    --topic "Why startups confuse responsiveness with strategy" \
    --type insight \
    --audience founders \
    --locale en-us \
    --goal "Explain why reactive responsiveness erodes strategy" \
    --notes "Inbound requests masquerade as market truth" \
    --notes "Sales pressure can outrun thesis discipline" \
    --thesisHint "Responsiveness is not strategy." \
    --sourceMode notes

  bash scripts/content-workflow.sh generate-source-save -- \
    --topic "Why startups confuse responsiveness with strategy" \
    --type insight \
    --audience founders \
    --locale en-us \
    --goal "Explain why reactive responsiveness erodes strategy" \
    --notes "Inbound requests masquerade as market truth" \
    --notes "Sales pressure can outrun thesis discipline" \
    --thesisHint "Responsiveness is not strategy." \
    --sourceMode notes

  bash scripts/content-workflow.sh review-localization -- --postId drafts.post-translation-key-en-us --all
  bash scripts/content-workflow.sh inspect-content -- --postId drafts.post-translation-key-en-us
  bash scripts/content-workflow.sh inspect-content -- --translationKey comp-os-some-slug-123456789012
  bash scripts/content-workflow.sh localize-save -- --postId drafts.post-translation-key-en-us --all
  bash scripts/content-workflow.sh review-publish -- --translationKey comp-os-some-slug-123456789012 --all
  bash scripts/content-workflow.sh publish-draft -- --postId drafts.post-translation-key-en-us
  bash scripts/content-workflow.sh publish-draft-save -- --translationKey comp-os-some-slug-123456789012 --all
  bash scripts/content-workflow.sh review-refresh -- --slug why-harmless-approval-rules-create-strategic-delay-20260327 --locale en-us
  bash scripts/content-workflow.sh seo-track -- --csv /path/performance.csv --indexing-csv /path/indexing.csv
  bash scripts/content-workflow.sh growth-kpi -- --events /path/posthog-export.ndjson
  bash scripts/content-workflow.sh growth-stability -- --required-cycles 3
EOF
}

command_name="${1:-}"
if [ -z "$command_name" ]; then
  usage >&2
  exit 1
fi
shift || true

case "$command_name" in
  review-source)
    exec ./scripts/test-create-content.sh "$@"
    ;;
  generate-source)
    exec npx tsx scripts/run-create-content.ts "$@"
    ;;
  generate-source-save)
    exec npx tsx scripts/run-create-content.ts "$@" --save
    ;;
  inspect-content)
    exec npx tsx scripts/run-inspect-content.ts "$@"
    ;;
  review-localization)
    exec ./scripts/test-localize-content.sh "$@"
    ;;
  localize-save)
    exec npx tsx scripts/run-localize-content.ts "$@" --save
    ;;
  review-refresh)
    exec npx tsx scripts/run-refresh-content.ts "$@"
    ;;
  refresh-save)
    exec npx tsx scripts/run-refresh-content.ts "$@" --save
    ;;
  validate-system)
    npm run test:system:validation
    ;;
  review-publish)
    exec npx tsx scripts/run-publish.ts "$@" --review
    ;;
  publish-draft)
    exec npx tsx scripts/run-publish.ts "$@"
    ;;
  publish-draft-save)
    exec npx tsx scripts/run-publish.ts "$@" --save
    ;;
  seo-track)
    exec node --experimental-strip-types scripts/run-seo-tracking.ts "$@"
    ;;
  growth-kpi)
    exec node --experimental-strip-types scripts/run-growth-kpi-summary.ts "$@"
    ;;
  growth-stability)
    exec node --experimental-strip-types scripts/run-growth-kpi-stabilization.ts "$@"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: $command_name" >&2
    usage >&2
    exit 1
    ;;
esac
