#!/usr/bin/env bash
set -euo pipefail

fail=0

check_forbidden() {
  local label="$1"
  local cmd="$2"
  if eval "$cmd"; then
    echo "[lint:design] FAIL: ${label}"
    fail=1
  else
    echo "[lint:design] PASS: ${label}"
  fi
}

check_forbidden "hex literals outside tokens.css" "rg -n --pcre2 '#[0-9A-Fa-f]{3,8}' src --glob '!src/styles/tokens.css'"
check_forbidden "clamp() outside tokens.css" "rg -n 'clamp\\(' src --glob '!src/styles/tokens.css'"
check_forbidden "raw box-shadow outside tokens.css" "rg -n --pcre2 'box-shadow\\s*:\\s*(?:[0-9]|\\.|#|rgba\\(|inset|-)' src --glob '!src/styles/tokens.css'"
check_forbidden "raw border-radius outside tokens.css" "rg -n --pcre2 'border-radius\\s*:\\s*(?:[0-9]|\\.)' src --glob '!src/styles/tokens.css'"
check_forbidden "raw font-size outside tokens.css" "rg -n --pcre2 'font-size\\s*:\\s*(?:[0-9]|\\.|clamp\\()' src --glob '!src/styles/tokens.css'"
check_forbidden "rgba() outside tokens.css" "rg -n 'rgba\\(' src --glob '!src/styles/tokens.css'"
check_forbidden "inline style attributes" "rg -n 'style=\"' src/pages src/components src/layouts"

if [ "$fail" -ne 0 ]; then
  echo "[lint:design] One or more design guardrails failed."
  exit 1
fi

echo "[lint:design] All checks passed."
