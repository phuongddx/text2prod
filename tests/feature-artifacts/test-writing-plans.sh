#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

W="$REPO_ROOT/skills/writing-plans/SKILL.md"

check "points at contract"       "$W" '../using-text2prod/references/feature-artifacts.md'
check "feature-mode plan path"   "$W" 'Feature mode: `docs/features/<slug>/plan.md`'
check "edit existing in place"   "$W" 'edit its `plan.md` in place'
check "legacy plan path kept"    "$W" 'Legacy mode: `docs/text2prod/plans/YYYY-MM-DD-<feature-name>.md`'
check "relative spec header"     "$W" 'in feature mode, `spec.md` (same folder)'
check "handoff uses plan path"   "$W" 'Plan complete and saved to `<plan path>`'

finish "writing-plans wiring"
