#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

P="$REPO_ROOT/skills/zed-mode/references/project-structure.md"

n=$(basename "$(dirname "$P")")/$(basename "$P")
check "$n: conventions"    "$P" 'docs/engineering/conventions.md'
check "$n: infrastructure" "$P" 'docs/engineering/infrastructure.md'
check "$n: tech-stack"     "$P" 'docs/engineering/tech-stack.md'
check "$n: spec template"  "$P" '.agents/templates/spec.md'
check_absent "$n: no intent template" "$P" '.agents/templates/intent.md'
check "bootstrap: explicit ask is the accept" "$P" 'the ask is'
check "bootstrap: AGENTS.md only if missing" "$P" 'only if missing'
check "bootstrap: no invented commands" "$P" 'Cite real paths and commands;'
check "bootstrap: contract pointer" "$P" 'feature-artifacts.md'

finish "project structure wiring"
