#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

F="$REPO_ROOT/skills/finishing-a-development-branch/SKILL.md"

check "core principle includes close-out" "$F" 'Verify tests → Close feature folder → Detect environment'
check "step 1b present"                   "$F" '## Step 1b: Close the Feature Folder'
check "points at contract"                "$F" '../using-text2prod/references/feature-artifacts.md'
check "writes review.md"                  "$F" 'Write or update `docs/features/<slug>/review.md`'
check "never self-approves"               "$F" 'Never write an approval yourself'
check "promotion needs yes"               "$F" 'apply it only on an explicit yes'
check "never-touch files"                 "$F" 'Never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`'
check "status shipped on merge/PR"        "$F" 'set `Status: shipped` in `spec.md`'
check "tells human review path"  "$F" 'Tell your human partner the path you wrote.'
check "stages named files only"   "$F" 'git add docs/features/<slug>/review.md docs/features/<slug>/spec.md'
check "abandoned PR reverts"      "$F" 'If the PR is abandoned, set it back to `approved`.'

finish "finishing wiring"
