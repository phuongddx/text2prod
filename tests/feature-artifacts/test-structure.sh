#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

I="$REPO_ROOT/skills/init-project/SKILL.md"
P="$REPO_ROOT/skills/using-text2prod/references/project-structure.md"

for f in "$I" "$P"; do
  n=$(basename "$(dirname "$f")")/$(basename "$f")
  check "$n: conventions"    "$f" 'docs/engineering/conventions.md'
  check "$n: infrastructure" "$f" 'docs/engineering/infrastructure.md'
  check "$n: tech-stack"     "$f" 'docs/engineering/tech-stack.md'
  check "$n: spec template"  "$f" '.agents/templates/spec.md'
  check_absent "$n: no intent template" "$f" '.agents/templates/intent.md'
done
check "init: engineering section"   "$I" '### `docs/engineering/`'
check "init: no invented commands"  "$I" 'Cite real paths and commands; write `Not configured` where absent'
check "bootstrap: contract pointer" "$P" 'feature-artifacts.md'

finish "project structure wiring"
