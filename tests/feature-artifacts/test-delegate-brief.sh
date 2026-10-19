#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

T="$REPO_ROOT/skills/subagent-driven-development/implementer-prompt.md"
S="$REPO_ROOT/skills/subagent-driven-development/SKILL.md"

check "template reads tdd skill"          "$T" 'test-driven-development/SKILL.md'
check "template reads verification skill" "$T" 'verification-before-completion/SKILL.md'
check "template has data shape slot"      "$T" '## Data shape'
check "template has done means slot"      "$T" '## Done means'
check "template has prior round block"    "$T" '## Prior round'
check "prior round overrides job"   "$T" 'This block overrides the numbered steps of `## Your Job`'
check "report appended not rewritten" "$T" 'never rewriting it'
check "failing test comes first"          "$T" 'Write the failing test first'
check_absent "tdd no longer optional"     "$T" 'following TDD if task says to'
check_absent "no resume wording"          "$T" 'you will be resumed with the findings'

check "dispatch item 6: data shape"       "$S" '(6) the data shape'
check "dispatch item 7: done checks"      "$S" '(7) two to four observable'
check "reviewer on different family"      "$S" 'different model family'
check_absent "tdd optional in self-review" "$T" 'TDD if required'
check_absent "tdd optional in report"      "$T" 'if TDD was required'
check "fix loop names Prior round"         "$S" 'with its `## Prior round` block filled'
check "re-review tier carve-out"           "$S" 're-review: same tier'

finish "delegate-brief wiring"
