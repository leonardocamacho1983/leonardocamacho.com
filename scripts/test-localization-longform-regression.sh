#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

timestamp="$(date +"%Y%m%d-%H%M%S")"
default_artifact_root="${LOCALIZATION_REGRESSION_ARTIFACT_ROOT:-/tmp/localization-regression}"
artifact_root="$default_artifact_root"
fixture_name="localization-longform-founders-clarity"

tmp_out="$(mktemp)"
tmp_err="$(mktemp)"
cleanup() {
  rm -f "$tmp_out" "$tmp_err"
}
trap cleanup EXIT

while [ "$#" -gt 0 ]; do
  case "$1" in
    --fixture)
      fixture_name="$2"
      shift 2
      ;;
    --artifact-root)
      artifact_root="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

artifact_dir="${artifact_root}/${timestamp}-${fixture_name}"
raw_json="${artifact_dir}/raw.json"
report_file="${artifact_dir}/report.txt"

mkdir -p "$artifact_dir"

if ! env -u CODEX_SANDBOX_NETWORK_DISABLED -u SANDBOX_NETWORK_DISABLED \
  npx tsx scripts/run-localization-longform-smoke.ts --fixture "$fixture_name" >"$tmp_out" 2>"$tmp_err"
then
  cp "$tmp_out" "$raw_json" 2>/dev/null || : >"$raw_json"
  {
    echo "[FAIL] runner - scripts/run-localization-longform-smoke.ts exited non-zero"
    if [ -s "$tmp_err" ]; then
      echo
      echo "stderr:"
      cat "$tmp_err"
    fi
  } >"$report_file"
  cat "$report_file"
  echo "RAW_ARTIFACT=$raw_json"
  echo "REPORT_ARTIFACT=$report_file"
  exit 1
fi

cp "$tmp_out" "$raw_json"

if ! jq -e . >/dev/null <"$tmp_out"; then
  {
    echo "[FAIL] runner - output was not valid JSON"
    echo
    echo "stdout preview:"
    head -c 400 "$tmp_out"
    if [ -s "$tmp_err" ]; then
      echo
      echo "stderr:"
      cat "$tmp_err"
    fi
  } >"$report_file"
  cat "$report_file"
  echo "RAW_ARTIFACT=$raw_json"
  echo "REPORT_ARTIFACT=$report_file"
  exit 1
fi

if node scripts/check-localization-longform-regression.mjs \
  --raw "$raw_json" \
  --report "$report_file" \
  --fixture "$fixture_name"
then
  status=0
else
  status=$?
fi

cat "$report_file"
echo "RAW_ARTIFACT=$raw_json"
echo "REPORT_ARTIFACT=$report_file"
exit "$status"
