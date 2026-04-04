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

if ! node --experimental-strip-types scripts/run-seo-schema-smoke.ts >"$tmp_out" 2>"$tmp_err"; then
  cat "$tmp_err" >&2
  exit 1
fi

if ! jq -e . >/dev/null <"$tmp_out"; then
  cat "$tmp_out" >&2
  exit 1
fi

jq '.' "$tmp_out"
