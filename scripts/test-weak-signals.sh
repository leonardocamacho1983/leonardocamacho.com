#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

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
