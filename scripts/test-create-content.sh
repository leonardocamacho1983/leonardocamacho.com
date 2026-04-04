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

max_attempts=3
jq_filter='{
  opening: (.writerOutput.bodyMarkdown | split("\n")[0]),
  closing: (.writerOutput.bodyMarkdown | split("\n\n") | last),
  retry: .retry,
  firstPassViolations: ((.firstPassBrandGuardian.violations // []) | map(.rule) | join(", "))
}'

forwarded_args=()
while [ "$#" -gt 0 ]; do
  case "$1" in
    --attempts)
      max_attempts="$2"
      shift 2
      ;;
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
  ./scripts/test-create-content.sh [--attempts N] [--filter 'jq filter'] -- <run-create-content args>

Example:
  ./scripts/test-create-content.sh -- \
    --topic "Why most organizations are structurally incapable of acting on weak signals" \
    --type insight \
    --audience founders \
    --locale en-us \
    --goal "Explain why organizations fail to act on signals they already noticed" \
    --notes "Decision rights sit far from signal holders" \
    --notes "Sunk costs raise the threshold for response" \
    --thesisHint "The signal was not weak. The threshold was wrong." \
    --sourceMode notes
EOF
  exit 1
fi

cmd=(npx tsx scripts/run-create-content.ts "${forwarded_args[@]}")

attempt=1
success=0

while [ "$attempt" -le "$max_attempts" ]; do
  : >"$tmp_out"
  : >"$tmp_err"

  if "${cmd[@]}" >"$tmp_out" 2>"$tmp_err"; then
    if jq -e . >/dev/null <"$tmp_out"; then
      success=1
      break
    fi
  fi

  if grep -q "Invalid JSON from model" "$tmp_err"; then
    attempt=$((attempt + 1))
    continue
  fi

  cat "$tmp_err" >&2
  exit 1
done

if [ "$success" -ne 1 ]; then
  echo "Test failed after $max_attempts attempts." >&2
  cat "$tmp_err" >&2
  exit 1
fi

jq "$jq_filter" "$tmp_out"
