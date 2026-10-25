#!/usr/bin/env bash
# Static wiring test: the principles index and its reference files agree.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../feature-artifacts/lib.sh
. "$REPO_ROOT/tests/feature-artifacts/lib.sh"

SKILL="$REPO_ROOT/skills/principles/SKILL.md"
REFS="$REPO_ROOT/skills/principles/references"
BOOTSTRAP="$REPO_ROOT/skills/using-text2prod/SKILL.md"

if [[ ! -f "$SKILL" ]]; then
  echo "  [FAIL] skills/principles/SKILL.md exists"
  exit 1
fi

check "frontmatter name" "$SKILL" "name: principles"
check "description starts with Use when" "$SKILL" "description: Use when"
check "citation rule present" "$SKILL" "Cite only principles whose reference file you read this session"
check "credit line present" "$SKILL" "Adapted from pstack"
check "bootstrap points at the index" "$BOOTSTRAP" "principles/SKILL.md"
check "LICENSE carries the pstack notice" "$REPO_ROOT/LICENSE" "pstack"

linked="$(grep -oE '\]\(references/[a-z-]+\.md\)' "$SKILL" | sed -E 's/\]\(references\/([a-z-]+)\.md\)/\1/' | sort -u)"
linked_count="$(printf '%s\n' "$linked" | grep -c . || true)"
if [[ "$linked_count" -eq 24 ]]; then
  echo "  [PASS] index links 24 references"
else
  echo "  [FAIL] index links 24 references (found $linked_count)"
  FAILURES=$((FAILURES + 1))
fi

while IFS= read -r name; do
  [[ -n "$name" ]] || continue
  f="$REFS/$name.md"
  if [[ -f "$f" ]]; then
    echo "  [PASS] references/$name.md exists"
  else
    echo "  [FAIL] references/$name.md exists"
    FAILURES=$((FAILURES + 1))
    continue
  fi
  check "references/$name.md has a Why" "$f" "**Why:**"
  check "references/$name.md has the credit line" "$f" "Adapted from pstack"
  check_absent "references/$name.md has no frontmatter" "$f" "disable-model-invocation"
done <<<"$linked"

for f in "$REFS"/*.md; do
  name="$(basename "$f" .md)"
  if printf '%s\n' "$linked" | grep -qx "$name"; then
    echo "  [PASS] references/$name.md is indexed"
  else
    echo "  [FAIL] references/$name.md is indexed"
    FAILURES=$((FAILURES + 1))
  fi
done

forbidden='grok|gpt-|-xhigh|[Cc]ursor|setup-pstack|deslop|control-ui|control-cli|AskQuestion|generalPurpose|watch-pr|origin pr|Graphite|/loop|poteto|\*\*principle-'
for f in "$SKILL" "$REFS"/*.md; do
  rel="${f#"$REPO_ROOT"/}"
  if hits="$(grep -nE "$forbidden" "$f" | grep -v 'Adapted from pstack')" && [[ -n "$hits" ]]; then
    echo "  [FAIL] $rel has no forbidden tokens"
    printf '%s\n' "$hits" | sed 's/^/    /'
    FAILURES=$((FAILURES + 1))
  else
    echo "  [PASS] $rel has no forbidden tokens"
  fi
done

finish "principles index test"
