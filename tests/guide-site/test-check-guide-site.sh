#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CHECK="$REPO_ROOT/scripts/check-guide-site.sh"
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
  local root="$1"
  local repo="$root/repo"
  local site="$root/site"

  mkdir -p "$repo/skills/zed-mode/playbooks" "$repo/skills/brainstorming" \
    "$repo/skills/principles/references" "$site/assets"
  touch "$repo/skills/zed-mode/SKILL.md" "$repo/skills/brainstorming/SKILL.md" \
    "$repo/skills/principles/SKILL.md" "$repo/skills/zed-mode/playbooks/bug-fix.md" \
    "$repo/skills/zed-mode/playbooks/feature.md" \
    "$repo/skills/principles/references/laziness-protocol.md"

  printf '%s\n' \
    'export const chapters = [' \
    '  { n: 0, slug: "index", title: "Home", blurb: "Start." },' \
    '  { n: 1, slug: "01-setup", title: "Set up", blurb: "Install." },' \
    '];' \
    'export const playbooks = [' \
    '  { name: "bug-fix", chapter: 1, group: "change", when: "A defect." },' \
    '  { name: "feature", chapter: 1, group: "change", when: "New behavior." },' \
    '];' \
    'export const skills = [' \
    '  { name: "brainstorming", chapter: 1, kind: "process", what: "Design first." },' \
    '  { name: "principles", chapter: 1, kind: "meta", what: "Named rules." },' \
    '  { name: "zed-mode", chapter: 1, kind: "bootstrap", what: "Routes work." },' \
    '];' \
    'export const principles = [' \
    '  { name: "Laziness Protocol", file: "laziness-protocol", group: "Core", sayWhen: "Diff grows." },' \
    '];' >"$site/assets/catalog.js"
  printf 'body{}\n' >"$site/assets/guide.css"
  printf '%s\n' \
    '<!doctype html>' \
    '<link rel="stylesheet" href="assets/guide.css">' \
    '<script type="module" src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs"></script>' \
    '<a href="01-setup.html#install">Set up</a>' \
    '<a href="#top">Top</a>' \
    '<a href="https://github.com/">GitHub</a>' >"$site/index.html"
  printf '%s\n' '<!doctype html>' '<a href="index.html">Home</a>' >"$site/01-setup.html"
}

# Runs the gate on a fixture; sets $out and $status.
run_check() {
  local root="$1"
  status=0
  out="$("$CHECK" --site "$root/site" --repo "$root/repo" 2>&1)" || status=$?
}

expect_fail() {
  local name="$1" needle="$2"
  [[ "$status" -eq 1 ]] || fail "$name: expected exit 1, got $status. Output: $out"
  [[ "$out" == *"$needle"* ]] || fail "$name: output lacks '$needle'. Output: $out"
  echo "  [PASS] $name"
}

new_case() {
  local name="$1"
  cp -R "$TEST_ROOT/clean" "$TEST_ROOT/$name"
  echo "$TEST_ROOT/$name"
}

make_fixture "$TEST_ROOT/clean"

run_check "$TEST_ROOT/clean"
[[ "$status" -eq 0 ]] || fail "clean fixture: expected exit 0, got $status. Output: $out"
[[ "$out" == *"guide site OK"* ]] || fail "clean fixture: missing OK line. Output: $out"
echo "  [PASS] clean fixture passes"

c="$(new_case banned)"
printf '%s\n' '<p>Ported from pstack.</p>' >>"$c/site/index.html"
run_check "$c"
expect_fail "banned term fails with file and line" "index.html:7"

c="$(new_case missing-catalog-entry)"
touch "$c/repo/skills/zed-mode/playbooks/shipping.md"
run_check "$c"
expect_fail "playbook on disk but not in catalog fails" "missing from catalog: shipping"

c="$(new_case missing-file)"
rm "$c/repo/skills/zed-mode/playbooks/feature.md"
run_check "$c"
expect_fail "catalog playbook with no file fails" "not on disk: feature"

c="$(new_case broken-link)"
printf '%s\n' '<a href="02-missing.html">Gone</a>' >>"$c/site/01-setup.html"
run_check "$c"
expect_fail "broken local link fails" "01-setup.html:3: 02-missing.html"

c="$(new_case unpinned-cdn)"
printf '%s\n' '<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>' >>"$c/site/index.html"
run_check "$c"
expect_fail "unpinned CDN URL fails" "unpinned CDN URL"

c="$(new_case missing-chapter-page)"
rm "$c/site/01-setup.html"
printf '%s\n' '<!doctype html>' >"$c/site/index.html"
run_check "$c"
expect_fail "chapter slug without a page fails" "no page for chapter: 01-setup"

status=0
out="$("$CHECK" --site 2>&1)" || status=$?
[[ "$status" -eq 2 ]] || fail "bare --site: expected exit 2, got $status. Output: $out"
[[ "$out" == *"--site needs a value"* ]] || fail "bare --site: output lacks '--site needs a value'. Output: $out"
echo "  [PASS] option without a value exits 2"

echo "guide-site gate tests: all passed"
