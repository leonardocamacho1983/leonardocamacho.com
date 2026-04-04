#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

./scripts/test-localization-longform-regression-expected-failure.sh \
  --fixture localization-longform-advisory-close-failure \
  --expected-reason "advisory close matched pattern"
