#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
status=0
for t in "$SCRIPT_DIR"/test-*.sh; do
  echo "=== $(basename "$t") ==="
  bash "$t" || status=1
done
exit "$status"
