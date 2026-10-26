#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

REF="$REPO_ROOT/skills/zed-mode/references/evidence-levels.md"
V="$REPO_ROOT/skills/verification-before-completion/SKILL.md"

check "reference exists"            "$REF" '# Evidence levels'
check "five levels: asserted"       "$REF" '| 1 | Asserted |'
check "five levels: reproduced"     "$REF" '| 5 | Reproduced |'
check "claim carries level"         "$REF" 'A claim names its level in the same sentence'
check "L1/L2 never close findings"  "$REF" 'L1 and L2 never close a Critical or Important finding'

check "verification points at ref"  "$V" '../zed-mode/references/evidence-levels.md'
check "gate states level"           "$V" 'ONLY THEN: Make the claim, with its level'
check "table has Level column"      "$V" '| Claim | Requires | Level | Not Sufficient |'
check "red flag on low level"       "$V" 'A Level 1 or 2 statement closing a finding'

finish "evidence-levels wiring"
