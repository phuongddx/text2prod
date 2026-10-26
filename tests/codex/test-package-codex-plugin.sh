#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCRIPT_UNDER_TEST="$REPO_ROOT/scripts/package-codex-plugin.sh"

FAILURES=0
TEST_ROOT="$(mktemp -d)"

cleanup() {
  rm -rf "$TEST_ROOT"
}
trap cleanup EXIT

pass() {
  echo "  [PASS] $1"
}

fail() {
  echo "  [FAIL] $1"
  FAILURES=$((FAILURES + 1))
}

assert_equals() {
  local actual="$1"
  local expected="$2"
  local description="$3"

  if [[ "$actual" == "$expected" ]]; then
    pass "$description"
  else
    fail "$description"
    echo "    expected: $expected"
    echo "    actual:   $actual"
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local description="$3"

  if printf '%s' "$haystack" | grep -Fq -- "$needle"; then
    pass "$description"
  else
    fail "$description"
    echo "    expected to find: $needle"
  fi
}

assert_not_matches() {
  local haystack="$1"
  local pattern="$2"
  local description="$3"

  if printf '%s' "$haystack" | grep -Eq -- "$pattern"; then
    fail "$description"
    echo "    did not expect to match: $pattern"
  else
    pass "$description"
  fi
}

list_archive() {
  local archive_path="$1"

  case "$archive_path" in
    *.tar.gz|*.tgz)
      tar -tzf "$archive_path"
      ;;
    *.zip)
      unzip -Z1 "$archive_path"
      ;;
    *)
      unzip -Z1 "$archive_path"
      ;;
  esac
}

normalize_archive_paths() {
  sed 's#/$##' | LC_ALL=C sort
}

extract_archive() {
  local archive_path="$1"
  local destination="$2"

  mkdir -p "$destination"
  case "$archive_path" in
    *.tar.gz|*.tgz)
      tar -xzf "$archive_path" -C "$destination"
      ;;
    *.zip)
      unzip -q "$archive_path" -d "$destination"
      ;;
    *)
      unzip -q "$archive_path" -d "$destination"
      ;;
  esac
}

read_archive_file() {
  local archive_path="$1"
  local file_path="$2"

  case "$archive_path" in
    *.tar.gz|*.tgz)
      tar -xOf "$archive_path" "$file_path"
      ;;
    *.zip)
      unzip -p "$archive_path" "$file_path"
      ;;
    *)
      unzip -p "$archive_path" "$file_path"
      ;;
  esac
}

write_metadata_fixture() {
  local destination="$1"
  local skill

  while IFS= read -r skill; do
    mkdir -p "$destination/skills/$skill/agents"
    cat >"$destination/skills/$skill/agents/openai.yaml" <<EOF
interface:
  display_name: "$skill"
  short_description: "Fixture metadata for $skill"
EOF
  done < <(find "$REPO_ROOT/skills" -mindepth 1 -maxdepth 1 -type d -print | sed 's#.*/##' | sort)
}

echo "Codex package archive tests"

metadata_source="$TEST_ROOT/metadata-source"
archive="$TEST_ROOT/text2prod"
tar_archive="$TEST_ROOT/text2prod.tar.gz"
extracted="$TEST_ROOT/extracted"
tar_extracted="$TEST_ROOT/tar-extracted"
write_metadata_fixture "$metadata_source"

source_hooks="$(python3 -c 'import json; print(json.load(open("'"$REPO_ROOT"'/.codex-plugin/plugin.json")).get("hooks"))')"
assert_equals "$source_hooks" "{}" "source Codex manifest suppresses local hook auto-discovery"

if output="$("$SCRIPT_UNDER_TEST" --allow-dirty --metadata-source "$metadata_source" --output "$archive" 2>&1)"; then
  pass "package script exits successfully"
else
  fail "package script exits successfully"
  printf '%s\n' "$output" | sed 's/^/      /'
fi

if [[ -f "$archive" ]]; then
  pass "package script writes archive"
else
  fail "package script writes archive"
fi

assert_contains "$output" "Archive:" "reports archive path"
assert_contains "$output" "Format:  zip" "reports default zip format"
assert_contains "$output" "SHA-256:" "reports archive checksum"

extract_archive "$archive" "$extracted"

archive_paths="$(list_archive "$archive" | normalize_archive_paths)"
unexpected_pattern='(^text2prod/|^\.agents/|^hooks/|package\.json$|^\.git|^\.pytest_cache|^\.ruff_cache|^scripts/|^tests/|^docs/|^evals/|^lib/|^\.claude|^\.cursor|^\.kimi|^\.opencode|^\.pi|^AGENTS\.md$|^CLAUDE\.md$|^GEMINI\.md$|^RELEASE-NOTES\.md$|^CHANGELOG\.md$)'
assert_not_matches "$archive_paths" "$unexpected_pattern" "archive excludes source-only paths"
assert_contains "$archive_paths" ".codex-plugin/plugin.json" "archive includes Codex manifest"
assert_contains "$archive_paths" "skills/brainstorming/SKILL.md" "archive includes skills"
assert_contains "$archive_paths" "skills/brainstorming/agents/openai.yaml" "archive includes OpenAI skill metadata"
assert_contains "$archive_paths" "assets/app-icon.png" "archive includes app icon"
assert_contains "$archive_paths" "assets/text2prod-small.svg" "archive includes composer icon"
assert_contains "$archive_paths" "agents/codex/zed.toml" "archive includes Codex delegate roles"
assert_contains "$archive_paths" "agents/codex/comment-sicko.toml" "archive includes the comment-sicko Codex role"

manifest_summary="$(read_archive_file "$archive" .codex-plugin/plugin.json | python3 -c 'import json,sys; data=json.load(sys.stdin); print("\t".join([data["name"], data["version"], data["skills"], str(data.get("hooks"))]))')"
expected_version="$(python3 -c 'import json; print(json.load(open("'"$REPO_ROOT"'/.codex-plugin/plugin.json"))["version"])')"
assert_equals "$manifest_summary" "text2prod	$expected_version	./skills/	$source_hooks" "archive manifest preserves source hooks"

skill_count="$(find "$extracted/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
metadata_count="$(find "$extracted/skills" -path '*/agents/openai.yaml' -type f | wc -l | tr -d ' ')"
assert_equals "$metadata_count" "$skill_count" "every packaged skill has OpenAI metadata"

if [[ -x "$extracted/skills/subagent-driven-development/scripts/task-brief" ]]; then
  pass "archive preserves executable script mode"
else
  fail "archive preserves executable script mode"
fi

zip_times="$(python3 - "$archive" <<'PY'
import sys
import zipfile

with zipfile.ZipFile(sys.argv[1]) as archive:
    print("\n".join(sorted({str(info.date_time) for info in archive.infolist()})))
PY
)"
assert_equals "$zip_times" "(1980, 1, 1, 0, 0, 0)" "zip archive normalizes entry timestamps"

if tar_output="$("$SCRIPT_UNDER_TEST" --allow-dirty --metadata-source "$metadata_source" --format tar.gz --output "$tar_archive" 2>&1)"; then
  pass "package script writes explicit tar.gz archive"
else
  fail "package script writes explicit tar.gz archive"
  printf '%s\n' "$tar_output" | sed 's/^/      /'
fi
assert_contains "$tar_output" "Format:  tar.gz" "reports explicit tar.gz format"

extract_archive "$tar_archive" "$tar_extracted"
tar_archive_paths="$(list_archive "$tar_archive" | normalize_archive_paths)"
assert_equals "$tar_archive_paths" "$archive_paths" "zip and tar.gz archives contain the same paths"

tar_task_brief_mode="$(tar -tzvf "$tar_archive" skills/subagent-driven-development/scripts/task-brief | awk '{print $1}')"
assert_equals "$tar_task_brief_mode" "-rwxr-xr-x" "tar.gz archive preserves executable script mode"

tar_metadata_times="$(python3 - "$tar_archive" <<'PY'
import sys, tarfile
with tarfile.open(sys.argv[1]) as archive:
    print(sorted({member.mtime for member in archive.getmembers()}))
PY
)"
assert_equals "$tar_metadata_times" "[0]" "tar.gz archive normalizes entry timestamps"

metadata_archive="$TEST_ROOT/metadata-source.tar.gz"
metadata_zip="$TEST_ROOT/metadata-source.zip"
archive_from_tar_source="$TEST_ROOT/text2prod-from-tar-source.zip"
archive_from_zip_source="$TEST_ROOT/text2prod-from-zip-source.zip"
(
  cd "$metadata_source"
  tar -czf "$metadata_archive" .
  zip -X -q -r "$metadata_zip" .
)

if output="$("$SCRIPT_UNDER_TEST" --allow-dirty --metadata-source "$metadata_archive" --output "$archive_from_tar_source" 2>&1)"; then
  pass "package script accepts tarball metadata source"
else
  fail "package script accepts tarball metadata source"
  printf '%s\n' "$output" | sed 's/^/      /'
fi

if cmp -s "$archive" "$archive_from_tar_source"; then
  pass "tarball metadata source produces identical archive"
else
  fail "tarball metadata source produces identical archive"
fi

if output="$("$SCRIPT_UNDER_TEST" --allow-dirty --metadata-source "$metadata_zip" --output "$archive_from_zip_source" 2>&1)"; then
  pass "package script accepts zip metadata source"
else
  fail "package script accepts zip metadata source"
  printf '%s\n' "$output" | sed 's/^/      /'
fi

if cmp -s "$archive" "$archive_from_zip_source"; then
  pass "zip metadata source produces identical archive"
else
  fail "zip metadata source produces identical archive"
fi

incomplete_metadata="$TEST_ROOT/incomplete-metadata"
mkdir -p "$incomplete_metadata/skills/brainstorming/agents"
cp "$metadata_source/skills/brainstorming/agents/openai.yaml" \
  "$incomplete_metadata/skills/brainstorming/agents/openai.yaml"

generated_archive="$TEST_ROOT/generated.tar.gz"
if generated_output="$("$SCRIPT_UNDER_TEST" --allow-dirty --metadata-source "$incomplete_metadata" --format tar.gz --output "$generated_archive" 2>&1)"; then
  pass "package script generates metadata for skills missing from the seed"
else
  fail "package script generates metadata for skills missing from the seed"
  printf '%s\n' "$generated_output" | sed 's/^/      /'
fi
assert_contains "$generated_output" "Generated OpenAI metadata for skill: writing-plans" "reports each generated metadata file"
assert_not_matches "$generated_output" "Generated OpenAI metadata for skill: brainstorming" "seeded skill is not regenerated"

generated_yaml="$(read_archive_file "$generated_archive" skills/writing-plans/agents/openai.yaml)"
assert_contains "$generated_yaml" 'display_name: "writing plans"' "generated display_name comes from the skill name"
assert_contains "$generated_yaml" 'short_description: "Use when you have a spec or requirements for a multi-step task, before touching code"' "generated short_description is the description's first sentence"

principles_yaml="$(read_archive_file "$generated_archive" skills/principles/agents/openai.yaml)"
assert_not_matches "$principles_yaml" '[ ,:-]"$' "generated short_description has no trailing punctuation"

seeded_yaml="$(read_archive_file "$generated_archive" skills/brainstorming/agents/openai.yaml)"
assert_contains "$seeded_yaml" 'short_description: "Fixture metadata for brainstorming"' "seeded metadata is copied unchanged"

generated_count="$(tar -tzf "$generated_archive" | grep -c 'skills/.*/agents/openai.yaml$' || true)"
generated_skill_count="$(find "$REPO_ROOT/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
assert_equals "$generated_count" "$generated_skill_count" "every skill has metadata after generation"

nodesc_repo="$TEST_ROOT/nodesc-repo"
git clone -q --no-local "$REPO_ROOT" "$nodesc_repo"
mkdir -p "$nodesc_repo/skills/no-description"
printf -- '---\nname: no-description\n---\n\n# No description\n' >"$nodesc_repo/skills/no-description/SKILL.md"
(
  cd "$nodesc_repo"
  git add skills/no-description/SKILL.md
  git -c user.name=test -c user.email=test@example.com commit -q -m "fixture: skill without description"
)
set +e
nodesc_output="$(
  cd "$nodesc_repo"
  scripts/package-codex-plugin.sh --metadata-source "$metadata_source" --output "$TEST_ROOT/nodesc.tar.gz" 2>&1
)"
nodesc_status=$?
set -e
if [[ "$nodesc_status" -ne 0 ]]; then
  pass "package script rejects a skill whose SKILL.md has no description"
else
  fail "package script rejects a skill whose SKILL.md has no description"
fi
assert_contains "$nodesc_output" "ERROR: cannot generate metadata for skill no-description: SKILL.md has no description" "missing description reports the skill name"

dirty_repo="$TEST_ROOT/dirty-repo"
git clone -q --no-local "$REPO_ROOT" "$dirty_repo"
printf '\n# dirty fixture\n' >>"$dirty_repo/README.md"
set +e
dirty_output="$(
  cd "$dirty_repo"
  scripts/package-codex-plugin.sh \
    --metadata-source "$metadata_source" \
    --output "$TEST_ROOT/dirty.zip" 2>&1
)"
dirty_status=$?
set -e
if [[ "$dirty_status" -ne 0 ]]; then
  pass "package script rejects dirty worktree by default"
else
  fail "package script rejects dirty worktree by default"
fi
assert_contains "$dirty_output" "Working tree has uncommitted changes:" "dirty worktree reports changed files"

if [[ "$FAILURES" -eq 0 ]]; then
  echo "All Codex package archive tests passed"
else
  echo "$FAILURES Codex package archive test(s) failed"
  exit 1
fi
