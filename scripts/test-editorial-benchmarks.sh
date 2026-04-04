#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

timestamp="$(date +"%Y%m%d-%H%M%S")"
default_artifact_root="${EDITORIAL_BENCHMARK_ARTIFACT_ROOT:-/tmp/editorial-benchmarks}"
artifact_root="$default_artifact_root"
batch_size="2"
selected_cases=()

tmp_out="$(mktemp)"
tmp_err="$(mktemp)"
cleanup() {
  rm -f "$tmp_out" "$tmp_err"
}
trap cleanup EXIT

while [ "$#" -gt 0 ]; do
  case "$1" in
    --artifact-root)
      artifact_root="$2"
      shift 2
      ;;
    --batch-size)
      batch_size="$2"
      shift 2
      ;;
    --case)
      selected_cases+=("$2")
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if ! [[ "$batch_size" =~ ^[1-9][0-9]*$ ]]; then
  echo "Invalid --batch-size: $batch_size" >&2
  exit 1
fi

artifact_dir="${artifact_root}/${timestamp}-editorial-en-benchmarks"
chunk_dir="${artifact_dir}/chunks"
raw_json="${artifact_dir}/raw.json"
report_file="${artifact_dir}/report.txt"
history_json="${artifact_dir}/history.json"
history_report="${artifact_dir}/history.txt"
mkdir -p "$chunk_dir"

if [ "${#selected_cases[@]}" -gt 0 ]; then
  case_ids=("${selected_cases[@]}")
else
  case_ids=()
  while IFS= read -r case_id; do
    case_ids+=("$case_id")
  done < <(npx tsx scripts/run-editorial-benchmark-suite.ts --list-cases | jq -r '.[]')
fi

if [ "${#case_ids[@]}" -eq 0 ]; then
  echo "No benchmark cases selected." >&2
  exit 1
fi

chunk_files=()
total_cases="${#case_ids[@]}"
chunk_count=$(((total_cases + batch_size - 1) / batch_size))
start=0
chunk_index=1

while [ "$start" -lt "$total_cases" ]; do
  chunk_cases=("${case_ids[@]:start:batch_size}")
  chunk_id="$(printf '%02d' "$chunk_index")-$(printf '%s' "${chunk_cases[0]}" | tr '/ ' '__')"
  chunk_json="${chunk_dir}/${chunk_id}.json"
  runner_cmd=(npx tsx scripts/run-editorial-benchmark-suite.ts)

  for case_id in "${chunk_cases[@]}"; do
    runner_cmd+=(--case "$case_id")
  done

  printf 'Running chunk %s/%s: %s\n' "$chunk_index" "$chunk_count" "${chunk_cases[*]}" >&2

  if ! "${runner_cmd[@]}" >"$tmp_out" 2>"$tmp_err"; then
    cp "$tmp_out" "$chunk_json" 2>/dev/null || : >"$chunk_json"
    {
      echo "[FAIL] runner - chunk ${chunk_index}/${chunk_count} exited non-zero"
      echo "cases: ${chunk_cases[*]}"
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

  if ! jq -e . >/dev/null <"$tmp_out"; then
    cp "$tmp_out" "$chunk_json" 2>/dev/null || : >"$chunk_json"
    {
      echo "[FAIL] runner - chunk ${chunk_index}/${chunk_count} output was not valid JSON"
      echo "cases: ${chunk_cases[*]}"
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

  cp "$tmp_out" "$chunk_json"
  chunk_files+=("$chunk_json")
  printf 'Finished chunk %s/%s: %s\n' "$chunk_index" "$chunk_count" "${chunk_cases[*]}" >&2
  start=$((start + batch_size))
  chunk_index=$((chunk_index + 1))
done

jq -s '
  def category_summary($field):
    [
      .[] | .cases[] as $case
      | $case[$field][]?
      | { category: .category, caseId: $case.caseId }
    ]
    | sort_by(.category)
    | group_by(.category)
    | map({
        category: .[0].category,
        count: length,
        caseIds: (map(.caseId) | unique | sort)
      });

  {
    ok: all(.[]; .ok == true),
    suiteId: "editorial-en-benchmarks",
    generatedAt: (map(.generatedAt) | last),
    summary: {
      total: (map(.summary.total) | add),
      passed: (map(.summary.passed) | add),
      failed: (map(.summary.failed) | add),
      passedFirstAttempt: (map(.summary.passedFirstAttempt // 0) | add),
      passedAfterRevision: (map(.summary.passedAfterRevision // 0) | add),
      initialFailureTaxonomy: category_summary("initialFailureTaxonomy"),
      finalFailureTaxonomy: category_summary("finalFailureTaxonomy")
    },
    cases: (map(.cases) | add)
  }
' "${chunk_files[@]}" >"$raw_json"

jq -r '
  def format_taxonomy($title; $items):
    if ($items | length) == 0
    then []
    else [$title] + ($items | map("  - \(.category): \(.count) [cases: \(.caseIds | join(", "))]"))
    end;

  [(.cases[] |
      if .finalStatus == "passed" and .benchmarkResolution == "pass_after_revision" then
        "[PASS_AFTER_REVISION] \(.caseId)"
      elif .finalStatus == "passed" then
        "[PASS] \(.caseId)"
      else
        "[FAIL] \(.caseId) - \(.failureReasons | join("; "))"
      end),
   (if .ok
      then "Editorial benchmark suite passed: \(.summary.passed)/\(.summary.total) cases passed. First-pass: \(.summary.passedFirstAttempt). After revision: \(.summary.passedAfterRevision)."
      else "Editorial benchmark suite failed: \(.summary.failed) case(s) failed. First-pass: \(.summary.passedFirstAttempt). After revision: \(.summary.passedAfterRevision)."
    end),
   "",
   (format_taxonomy("Initial failure taxonomy:"; .summary.initialFailureTaxonomy)[]),
   "",
   (format_taxonomy("Final failure taxonomy:"; .summary.finalFailureTaxonomy)[])][]
' "$raw_json" >"$report_file"

npx tsx scripts/summarize-editorial-benchmark-history.ts \
  --artifact-root "$artifact_root" \
  --suite-id "editorial-en-benchmarks" \
  --limit 10 \
  --out-json "$history_json" \
  --out-report "$history_report" >/dev/null

printf '\n' >>"$report_file"
cat "$history_report" >>"$report_file"

cat "$report_file"
echo "RAW_ARTIFACT=$raw_json"
echo "REPORT_ARTIFACT=$report_file"
echo "HISTORY_ARTIFACT=$history_json"

if jq -e '.ok == true' >/dev/null <"$raw_json"; then
  exit 0
fi

exit 1
