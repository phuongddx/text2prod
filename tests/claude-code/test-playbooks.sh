#!/usr/bin/env bash
# Static wiring test: the router's playbook table, the playbook files, and the skills they name agree.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../feature-artifacts/lib.sh
. "$REPO_ROOT/tests/feature-artifacts/lib.sh"

BOOTSTRAP="$REPO_ROOT/skills/using-text2prod/SKILL.md"
PLAYBOOKS="$REPO_ROOT/skills/using-text2prod/playbooks"
CODEX="$REPO_ROOT/skills/using-text2prod/references/codex-tools.md"

check "router section present" "$BOOTSTRAP" "## Playbooks"
check "router copies steps verbatim" "$BOOTSTRAP" "copied verbatim"
check "router documents the skip marker" "$BOOTSTRAP" "skip: <one-line reason>"
check "router names the session's task tool" "$BOOTSTRAP" "the session's task tool (\`TodoWrite\`, \`TaskCreate\`, or \`update_plan\`)"
check "autonomy section present" "$BOOTSTRAP" "## Autonomy"
check "always-pause list present" "$BOOTSTRAP" "force-push to shared branches"
check "autonomy keeps skill approval gates" "$BOOTSTRAP" "Approval gates inside a skill still stop for your human partner"
check "codex reference notes update_plan opt-in" "$CODEX" "tools.update_plan.enabled = true"

names="$(sed -nE 's/^\| `([a-z-]+)` \|.*$/\1/p' "$BOOTSTRAP" | sort -u)"
name_count="$(printf '%s\n' "$names" | grep -c . || true)"
if [[ "$name_count" -ge 13 ]]; then
  echo "  [PASS] playbook table lists at least 13 playbooks ($name_count)"
else
  echo "  [FAIL] playbook table lists at least 13 playbooks (found $name_count)"
  FAILURES=$((FAILURES + 1))
fi

forbidden='grok|gpt-|-xhigh|[Cc]ursor|setup-pstack|deslop|control-ui|control-cli|AskQuestion|generalPurpose|watch-pr|origin pr|Graphite|/loop|poteto'

while IFS= read -r name; do
  [[ -n "$name" ]] || continue
  f="$PLAYBOOKS/$name.md"
  if [[ ! -f "$f" ]]; then
    echo "  [FAIL] playbooks/$name.md exists"
    FAILURES=$((FAILURES + 1))
    continue
  fi
  echo "  [PASS] playbooks/$name.md exists"
  if head -1 "$f" | grep -qE '^### '; then
    echo "  [PASS] playbooks/$name.md starts with a ### title"
  else
    echo "  [FAIL] playbooks/$name.md starts with a ### title"
    FAILURES=$((FAILURES + 1))
  fi
  check "playbooks/$name.md has a Reply contract" "$f" "**Reply:**"
  check "playbooks/$name.md has the credit line" "$f" "Adapted from pstack"

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -n "$line" ]] || continue
    printf '%s' "$line" | grep -q 'skip:' && continue
    for skill in $(printf '%s' "$line" | grep -oE '[Tt]he `[a-z-]+` skill' | sed -E 's/[Tt]he `([a-z-]+)` skill/\1/'); do
      if [[ -d "$REPO_ROOT/skills/$skill" ]]; then
        echo "  [PASS] playbooks/$name.md: skill $skill exists"
      else
        echo "  [FAIL] playbooks/$name.md: skill $skill exists"
        FAILURES=$((FAILURES + 1))
      fi
    done
  done <"$f"

  for ref in $(grep -oE 'playbooks/[a-z-]+\.md' "$f" | sort -u); do
    if [[ -f "$REPO_ROOT/skills/using-text2prod/$ref" ]]; then
      echo "  [PASS] playbooks/$name.md: $ref exists"
    else
      echo "  [FAIL] playbooks/$name.md: $ref exists"
      FAILURES=$((FAILURES + 1))
    fi
  done

  for ref in $(grep -oE 'principles/references/[a-z-]+\.md' "$f" | sort -u); do
    if [[ -f "$REPO_ROOT/skills/$ref" ]]; then
      echo "  [PASS] playbooks/$name.md: $ref exists"
    else
      echo "  [FAIL] playbooks/$name.md: $ref exists"
      FAILURES=$((FAILURES + 1))
    fi
  done

  if hits="$(grep -nE "$forbidden" "$f" | grep -v 'Adapted from pstack')" && [[ -n "$hits" ]]; then
    echo "  [FAIL] playbooks/$name.md has no forbidden tokens"
    printf '%s\n' "$hits" | sed 's/^/    /'
    FAILURES=$((FAILURES + 1))
  else
    echo "  [PASS] playbooks/$name.md has no forbidden tokens"
  fi
done <<<"$names"

for f in "$PLAYBOOKS"/*.md; do
  [[ -f "$f" ]] || continue
  stem="$(basename "$f" .md)"
  if printf '%s\n' "$names" | grep -qx "$stem"; then
    echo "  [PASS] playbooks/$stem.md is in the table"
  else
    echo "  [FAIL] playbooks/$stem.md is in the table"
    FAILURES=$((FAILURES + 1))
  fi
done

finish "playbooks test"
