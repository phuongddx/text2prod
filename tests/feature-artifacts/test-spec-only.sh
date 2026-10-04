#!/usr/bin/env bash
# Guard: spec.md is the only design artifact. intent.md must not return to
# skills or templates, and the two spec template copies must stay identical.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

hits=$(grep -rlF 'intent.md' "$REPO_ROOT/skills" || true)
if [ -n "$hits" ]; then
  echo "  [FAIL] skills mention intent.md:"
  printf '    %s\n' "$hits"
  FAILURES=$((FAILURES + 1))
else
  echo "  [PASS] no skill mentions intent.md"
fi

for f in skills/using-text2prod/templates/intent.md .agents/templates/intent.md; do
  if [ -e "$REPO_ROOT/$f" ]; then
    echo "  [FAIL] $f still exists"
    FAILURES=$((FAILURES + 1))
  else
    echo "  [PASS] $f removed"
  fi
done

if cmp -s "$REPO_ROOT/skills/using-text2prod/templates/spec.md" "$REPO_ROOT/.agents/templates/spec.md"; then
  echo "  [PASS] spec template copies identical"
else
  echo "  [FAIL] spec template copies differ"
  FAILURES=$((FAILURES + 1))
fi

finish "spec-only artifacts"
