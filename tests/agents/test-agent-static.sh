#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

FAILURES=0
pass() { echo "  [PASS] $1"; }
fail() {
  echo "  [FAIL] $1"
  FAILURES=$((FAILURES + 1))
}

frontmatter() {
  awk 'NR == 1 && $0 != "---" { exit } NR > 1 && $0 == "---" { exit } NR > 1 { print }' "$1"
}

shopt -s nullglob
agents=("$REPO_ROOT"/agents/*.md)
shopt -u nullglob

if [[ "${#agents[@]}" -eq 0 ]]; then
  echo "  [FAIL] agents/*.md exists"
  exit 1
fi

for agent in "${agents[@]}"; do
  stem="$(basename "$agent" .md)"
  echo "agents/$stem.md"
  fm="$(frontmatter "$agent")"

  name="$(printf '%s\n' "$fm" | sed -n 's/^name:[[:space:]]*//p')"
  if [[ "$name" == "$stem" ]]; then
    pass "name matches file stem"
  else
    fail "name '$name' does not match file stem '$stem'"
  fi

  description="$(printf '%s\n' "$fm" | sed -n 's/^description:[[:space:]]*//p')"
  if [[ -n "${description//[[:space:]]/}" ]]; then
    pass "description is non-empty"
  else
    fail "description is missing or empty"
  fi

  extra_keys="$(printf '%s\n' "$fm" | grep -oE '^[A-Za-z_][A-Za-z0-9_-]*:' | grep -vxE 'name:|description:' || true)"
  if [[ -z "$extra_keys" ]]; then
    pass "frontmatter keys are only name and description"
  else
    fail "unexpected frontmatter keys: $(echo "$extra_keys" | tr '\n' ' ')"
  fi

  refs="$(grep -oE '`[A-Za-z0-9_-]+/SKILL\.md`' "$agent" | tr -d '`' | sort -u || true)"
  while IFS= read -r ref; do
    [[ -n "$ref" ]] || continue
    if [[ -f "$REPO_ROOT/skills/$ref" ]]; then
      pass "skills/$ref exists"
    else
      fail "skills/$ref does not exist"
    fi
  done <<<"$refs"

  if tail -1 "$agent" | grep -q 'Adapted from pstack'; then
    pass "credit line present"
  else
    fail "credit line missing"
  fi
done

shopt -s nullglob
roles=("$REPO_ROOT"/agents/codex/*.toml)
shopt -u nullglob

if [[ "${#roles[@]}" -eq 0 ]]; then
  fail "agents/codex/*.toml exists"
fi

for role in "${roles[@]}"; do
  stem="$(basename "$role" .toml)"
  echo "agents/codex/$stem.toml"

  if grep -qE "^name = \"$stem\"$" "$role"; then
    pass "name matches file stem"
  else
    fail "name does not match file stem '$stem'"
  fi

  if grep -qE '^description = ".+"$' "$role"; then
    pass "description is non-empty"
  else
    fail "description is missing or empty"
  fi

  if grep -qE '^developer_instructions = """$' "$role"; then
    pass "developer_instructions is a multi-line string"
  else
    fail "developer_instructions is missing or not a multi-line string"
  fi

  if [[ -f "$REPO_ROOT/agents/$stem.md" ]]; then
    pass "agents/$stem.md counterpart exists"
  else
    fail "agents/$stem.md counterpart exists"
  fi

  if grep -qiE 'claude|~/\.claude|\.claude-plugin' "$role"; then
    fail "no Claude-only paths in a Codex role"
  else
    pass "no Claude-only paths in a Codex role"
  fi

  if tail -1 "$role" | grep -q 'Adapted from pstack'; then
    pass "credit line present"
  else
    fail "credit line missing"
  fi
done

for agent in "${agents[@]}"; do
  stem="$(basename "$agent" .md)"
  if [[ -f "$REPO_ROOT/agents/codex/$stem.toml" ]]; then
    pass "agents/codex/$stem.toml counterpart exists"
  else
    fail "agents/codex/$stem.toml counterpart exists"
  fi
done

if [[ "$FAILURES" -gt 0 ]]; then
  exit 1
fi
echo "agent static test: all checks passed"
