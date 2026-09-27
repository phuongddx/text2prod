#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

EP="$REPO_ROOT/skills/executing-plans/SKILL.md"
SDD="$REPO_ROOT/skills/subagent-driven-development/SKILL.md"
IMP="$REPO_ROOT/skills/subagent-driven-development/implementer-prompt.md"
RCR="$REPO_ROOT/skills/requesting-code-review/SKILL.md"
CR="$REPO_ROOT/skills/requesting-code-review/code-reviewer.md"

check "executing-plans commits artifacts" "$EP"  'commit them with the task'"'"'s code'
check "sdd example feature path"          "$SDD" 'docs/features/auth-system/plan.md'
check "implementer commits artifacts"     "$IMP" 'include any `docs/features/` artifact edits in the same commit'
check "review requirements feature mode"  "$RCR" 'pass `docs/features/<slug>/spec.md` and `plan.md`'
check "review finds, human approves"      "$RCR" 'The reviewer reports findings; it never approves'
check "review example feature path"       "$RCR" 'Task 2 from docs/features/deployment/plan.md'
check "reviewer policy pass"              "$CR"  '**Policy compliance:**'

finish "execution and review wiring"
