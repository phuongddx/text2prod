#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SKILL="$REPO_ROOT/skills/init-project/SKILL.md"

FAILURES=0
check() {
    if grep -q "$2" "$SKILL"; then
        echo "  [PASS] $1"
    else
        echo "  [FAIL] $1"
        FAILURES=$((FAILURES + 1))
    fi
}

[ -f "$SKILL" ] || { echo "  [FAIL] SKILL.md exists"; exit 1; }
check "frontmatter name"            '^name: init-project$'
check "description triggers"        'onboard, initialize, or set up'
check "AGENTS.md safety gate"       'Never modifies an existing AGENTS.md'
check "phase gates present"         'Phase 0 — Gates'
check "research phase present"      'Phase 1 — Whole-codebase research'
check "four research areas"         'Core source'
check "generation phase present"    'Phase 2 — Generate'
check "report phase present"        'Phase 3 — Report'
check "guide title rule"            '# Repository Guidelines'
check "template source path"        '\.\./using-text2prod/templates/'
check "inline fallback rule"        'draft minimal equivalents inline'
check "never modify rule"           'Never modify an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`'
check "no src/tests creation rule"  'Never create `src/` or `tests/`'

if [[ "$FAILURES" -gt 0 ]]; then
    exit 1
fi
echo "init-project static skill test: all checks passed"
