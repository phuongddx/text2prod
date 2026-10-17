#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

T="$REPO_ROOT/skills/using-text2prod/templates/review.md"
A="$REPO_ROOT/.agents/templates/review.md"
F="$REPO_ROOT/skills/finishing-a-development-branch/SKILL.md"

if cmp -s "$T" "$A"; then
  echo "  [PASS] templates identical"
else
  echo "  [FAIL] templates identical"
  FAILURES=$((FAILURES + 1))
fi

check "impact pass listed"     "$T" '- **Impact** —'
check "impact names safety fact" "$T" 'Safety fact'
check "impact points at levels" "$T" 'using-text2prod/references/evidence-levels.md'
check "decisions section"      "$T" '## Decisions'
check "decisions columns"      "$T" '| Decision | Why | Evidence | Cost if wrong |'
check "finishing copies rulings" "$F" 'copy every `Ruling:` line from the plan'
check "finishing none row"     "$F" 'the single row reads `None`'

finish "review template wiring"
