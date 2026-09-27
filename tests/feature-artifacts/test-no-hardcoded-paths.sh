#!/usr/bin/env bash
# Guard: skills may mention docs/text2prod/ only as the legacy-mode fallback.
# Prevents the three-way artifact-path split from returning.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

hits=$(grep -rn 'docs/text2prod/' "$REPO_ROOT/skills" | grep -vi 'legacy' || true)
if [ -n "$hits" ]; then
  echo "  [FAIL] docs/text2prod/ outside a legacy-mode line:"
  printf '    %s\n' "$hits"
  exit 1
fi
echo "  [PASS] docs/text2prod/ appears only as the legacy fallback"
echo "no-hardcoded-paths: all checks passed"
