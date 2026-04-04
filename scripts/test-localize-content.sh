#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

tmp_out="$(mktemp)"
tmp_err="$(mktemp)"
cleanup() {
  rm -f "$tmp_out" "$tmp_err"
}
trap cleanup EXIT

jq_filter='{
  ok,
  dryRun,
  sourcePostId,
  sourceLocale,
  locales: [
    .locales[] | {
      targetLocale,
      ok,
      saved,
      draftId,
      qaWarnings,
      error
    }
  ]
}'

forwarded_args=()
while [ "$#" -gt 0 ]; do
  case "$1" in
    --filter)
      jq_filter="$2"
      shift 2
      ;;
    --)
      shift
      while [ "$#" -gt 0 ]; do
        forwarded_args+=("$1")
        shift
      done
      ;;
    *)
      forwarded_args+=("$1")
      shift
      ;;
  esac
done

if [ "${#forwarded_args[@]}" -eq 0 ]; then
  cat >&2 <<'EOF'
Usage:
  ./scripts/test-localize-content.sh [--filter 'jq filter'] -- <run-localize-content args>

Example:
  ./scripts/test-localize-content.sh -- \
    --slug patterns-founders-lose-clarity \
    --all
EOF
  exit 1
fi

cmd=(npx tsx scripts/run-localize-content.ts "${forwarded_args[@]}")

if ! "${cmd[@]}" >"$tmp_out" 2>"$tmp_err"; then
  cat "$tmp_err" >&2
  exit 1
fi

if ! jq -e . >/dev/null <"$tmp_out"; then
  cat "$tmp_out" >&2
  exit 1
fi

jq "$jq_filter" "$tmp_out"
