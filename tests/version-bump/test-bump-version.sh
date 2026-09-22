#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCRIPT_SOURCE="$REPO_ROOT/scripts/bump-version.sh"
TEST_ROOT="$(mktemp -d)"

cleanup() {
  rm -rf "$TEST_ROOT"
}
trap cleanup EXIT

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

make_fixture() {
  local repo="$1"

  mkdir -p "$repo/scripts" "$repo/.codex-plugin"
  cp "$SCRIPT_SOURCE" "$repo/scripts/bump-version.sh"
  printf '%s\n' \
    '{' \
    '  "files": [' \
    '    { "path": "package.json", "field": "version" },' \
    '    { "path": ".codex-plugin/plugin.json", "field": "version" }' \
    '  ],' \
    '  "audit": { "exclude": [] }' \
    '}' >"$repo/.version-bump.json"
  printf '%s\n' \
    '{' \
    '  "name": "fixture",' \
    '  "version": "1.2.3"' \
    '}' >"$repo/package.json"
  printf '%s\n' \
    '{' \
    '  "name": "text2prod",' \
    '  "version": "1.2.3"' \
    '}' >"$repo/.codex-plugin/plugin.json"
}

happy_repo="$TEST_ROOT/happy"
make_fixture "$happy_repo"

/bin/bash "$happy_repo/scripts/bump-version.sh" --check >"$TEST_ROOT/check.out"
/bin/bash "$happy_repo/scripts/bump-version.sh" --audit >"$TEST_ROOT/audit.out"
/bin/bash "$happy_repo/scripts/bump-version.sh" 2.3.4 >"$TEST_ROOT/bump.out"

[[ "$(jq -r '.version' "$happy_repo/package.json")" == "2.3.4" ]] \
  || fail "package.json was not bumped"
[[ "$(jq -r '.version' "$happy_repo/.codex-plugin/plugin.json")" == "2.3.4" ]] \
  || fail "Codex manifest was not bumped"

jq -e '
  any(.files[];
    .path == ".codex-plugin/plugin.json" and .field == "version")
' "$REPO_ROOT/.version-bump.json" >/dev/null \
  || fail "Codex manifest is not registered"

echo "Version-bump tests passed"
