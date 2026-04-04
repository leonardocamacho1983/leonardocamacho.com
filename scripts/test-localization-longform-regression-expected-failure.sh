#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fixture_name=""
expected_reason=""
artifact_args=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --fixture)
      fixture_name="$2"
      shift 2
      ;;
    --expected-reason)
      expected_reason="$2"
      shift 2
      ;;
    --artifact-root)
      artifact_args+=("$1" "$2")
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [ -z "$fixture_name" ] || [ -z "$expected_reason" ]; then
  echo "Usage: $0 --fixture <fixture-name> --expected-reason <text> [--artifact-root <path>]" >&2
  exit 1
fi

tmp_out="$(mktemp)"
tmp_err="$(mktemp)"
cleanup() {
  rm -f "$tmp_out" "$tmp_err"
}
trap cleanup EXIT

if [ "${#artifact_args[@]}" -gt 0 ]; then
  regression_cmd=(./scripts/test-localization-longform-regression.sh --fixture "$fixture_name" "${artifact_args[@]}")
else
  regression_cmd=(./scripts/test-localization-longform-regression.sh --fixture "$fixture_name")
fi

if "${regression_cmd[@]}" >"$tmp_out" 2>"$tmp_err"; then
  cat "$tmp_out"
  cat "$tmp_err" >&2
  echo "Expected regression gate to fail for ${fixture_name}, but it passed." >&2
  exit 1
fi

cat "$tmp_out"
if [ -s "$tmp_err" ]; then
  cat "$tmp_err" >&2
fi

report_path="$(sed -n 's/^REPORT_ARTIFACT=//p' "$tmp_out" | tail -n 1)"
if [ -z "$report_path" ] || [ ! -f "$report_path" ]; then
  echo "Could not locate REPORT_ARTIFACT for ${fixture_name}." >&2
  exit 1
fi

if ! grep -F "$expected_reason" "$report_path" >/dev/null; then
  echo "Expected failure reason not found in report: $expected_reason" >&2
  echo "Report path: $report_path" >&2
  exit 1
fi

echo "Expected failure fixture triggered the regression gate."
