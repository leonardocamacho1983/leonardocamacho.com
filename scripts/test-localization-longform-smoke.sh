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
  fixture,
  locales: [
    .locales[] | {
      targetLocale,
      ok,
      attemptsUsed,
      qaWarnings,
      error
    }
  ]
}'

while [ "$#" -gt 0 ]; do
  case "$1" in
    --filter)
      jq_filter="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if ! npx tsx scripts/run-localization-longform-smoke.ts >"$tmp_out" 2>"$tmp_err"; then
  cat "$tmp_err" >&2
  exit 1
fi

if ! jq -e . >/dev/null <"$tmp_out"; then
  cat "$tmp_out" >&2
  exit 1
fi

jq "$jq_filter" "$tmp_out"
