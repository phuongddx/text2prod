#!/usr/bin/env bash
#
# Check the guide site before it deploys.
#
# Usage:
#   scripts/check-guide-site.sh [--site DIR] [--repo DIR]
#
# Fails on banned terms, catalog entries that disagree with the skills on
# disk, broken local links, and unpinned CDN URLs.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$SCRIPT_DIR/.." && pwd)"
site=""

usage() {
  sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
}

die() {
  echo "error: $*" >&2
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --site)
      [[ $# -ge 2 ]] || die "$1 needs a value"
      site="$2"
      shift 2
      ;;
    --repo)
      [[ $# -ge 2 ]] || die "$1 needs a value"
      repo="$2"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *) die "unknown argument: $1" ;;
  esac
done

[[ -n "$site" ]] || site="$repo/site"
[[ -d "$site" ]] || die "no site directory at $site"
catalog="$site/assets/catalog.js"
[[ -f "$catalog" ]] || die "no catalog at $catalog"

failures=0
fail() {
  echo "FAIL: $*"
  failures=$((failures + 1))
}

# Whole-word, case-insensitive. Keep the site free of the external guide's
# names and of Riot Games IP.
banned='pstack|poteto|lauren tan|cursor/plugins|riot|riot games|league of legends'

check_banned_terms() {
  local hit
  while IFS= read -r hit; do
    fail "banned term: ${hit#"$site"/}"
  done < <(grep -rniwE "$banned" "$site" || true)
}

# Prints the quoted values of <key> inside `export const <array> = [ … ];`.
catalog_values() {
  local array="$1" key="$2"
  awk -v arr="$array" -v key="$key" '
    $0 ~ "^export const " arr " = \\[" { on = 1; next }
    on && /^\];/ { on = 0 }
    on && match($0, key ": \"[^\"]+\"") {
      print substr($0, RSTART + length(key) + 3, RLENGTH - length(key) - 4)
    }
  ' "$catalog" | LC_ALL=C sort
}

disk_playbooks() {
  local f
  for f in "$repo"/skills/zed-mode/playbooks/*.md; do
    if [[ -e "$f" ]]; then basename "$f" .md; fi
  done | LC_ALL=C sort
}

disk_skills() {
  local d
  for d in "$repo"/skills/*/; do
    if [[ -f "$d/SKILL.md" ]]; then basename "$d"; fi
  done | LC_ALL=C sort
}

disk_principles() {
  local f
  for f in "$repo"/skills/principles/references/*.md; do
    if [[ -e "$f" ]]; then basename "$f" .md; fi
  done | LC_ALL=C sort
}

# compare <label> <catalog list> <disk list>
compare() {
  local label="$1" in_catalog="$2" on_disk="$3" x
  while IFS= read -r x; do
    if [[ -n "$x" ]]; then fail "$label on disk but missing from catalog: $x"; fi
  done < <(LC_ALL=C comm -13 <(printf '%s\n' "$in_catalog") <(printf '%s\n' "$on_disk"))
  while IFS= read -r x; do
    if [[ -n "$x" ]]; then fail "$label in catalog but not on disk: $x"; fi
  done < <(LC_ALL=C comm -23 <(printf '%s\n' "$in_catalog") <(printf '%s\n' "$on_disk"))
}

check_catalog() {
  compare playbook "$(catalog_values playbooks name)" "$(disk_playbooks)"
  compare skill "$(catalog_values skills name)" "$(disk_skills)"
  compare principle "$(catalog_values principles file)" "$(disk_principles)"

  local slug
  while IFS= read -r slug; do
    if [[ -n "$slug" && ! -f "$site/$slug.html" ]]; then
      fail "no page for chapter: $slug"
    fi
  done < <(catalog_values chapters slug)
}

check_links() {
  local file dir hit lineno ref path
  while IFS= read -r file; do
    dir="$(dirname "$file")"
    while IFS= read -r hit; do
      lineno="${hit%%:*}"
      ref="${hit#*=\"}"
      ref="${ref%\"}"
      case "$ref" in
        http://* | https://* | mailto:* | data:* | javascript:* | \#*) continue ;;
      esac
      path="${ref%%#*}"
      path="${path%%\?*}"
      if [[ -n "$path" && ! -e "$dir/$path" ]]; then
        fail "broken link: ${file#"$site"/}:$lineno: $ref"
      fi
    done < <(grep -noE '(href|src)="[^"]*"' "$file" || true)
  done < <(find "$site" -name '*.html' | LC_ALL=C sort)
}

check_cdn_pins() {
  local hit url
  while IFS= read -r hit; do
    url="https://${hit#*https://}"
    if ! [[ "$url" =~ @[0-9]+\.[0-9]+\.[0-9]+/ ]]; then
      fail "unpinned CDN URL: ${hit#"$site"/}"
    fi
  done < <(grep -rnoE 'https://(cdn\.jsdelivr\.net|unpkg\.com)/[^"'"'"' )]+' "$site" || true)
}

check_banned_terms
check_catalog
check_links
check_cdn_pins

if [[ "$failures" -gt 0 ]]; then
  echo "$failures check(s) failed"
  exit 1
fi
echo "guide site OK"
