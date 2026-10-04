#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

C="$REPO_ROOT/skills/using-text2prod/references/feature-artifacts.md"
T="$REPO_ROOT/skills/using-text2prod/templates/spec.md"

check "contract: mode detection"      "$C" '## Mode detection'
check "contract: feature-mode marker" "$C" '`docs/features/` exists at the repo root'
check "contract: legacy spec path"    "$C" '`docs/text2prod/specs/YYYY-MM-DD-<topic>-design.md`'
check "contract: legacy plan path"    "$C" '`docs/text2prod/plans/YYYY-MM-DD-<feature-name>.md`'
check "contract: layout"              "$C" '## Feature-mode layout'
check "contract: template resolution" "$C" '## Template resolution'
check "contract: read order"          "$C" '## Research read order'
check "contract: artifacts are code"  "$C" '## Artifacts are code'
check "contract: existing feature"    "$C" '## Changing an existing feature'
check "contract: promotion rule"      "$C" '## Promotion rule'
check "contract: never-touch files"   "$C" 'Never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`'
check "template: status field"        "$T" 'Status: draft <!-- draft | approved | shipped | superseded -->'
check "template: context read"        "$T" '## Context read'
check "template: references"          "$T" '## References'
check "template: testing"             "$T" '## Testing'
check "contract: legacy scope wording" "$C" 'Artifact locations and the files written are unchanged'
check "contract: slug if exists"       "$C" 'if a matching feature exists'
check        "template: problem section"     "$T" '## Problem'
check        "template: constraints section" "$T" '## Constraints'
check_absent "template: no intent link"      "$T" 'Intent:'
check_absent "contract: no intent.md"        "$C" 'intent.md'
check        "contract: matching spec read"  "$C" '`docs/features/<slug>/spec.md`, in full, if a matching feature exists'
check        "contract: sibling specs read"  "$C" 'Sibling `docs/features/*/spec.md` — title and `Status:` line only'

finish "feature-artifacts contract"
