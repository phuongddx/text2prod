# Guide Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use text2prod:subagent-driven-development (recommended) or text2prod:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a visual, chapter-by-chapter Text2Prod guide on GitHub Pages, guarded by a pre-deploy check script.

**Architecture:** Hand-written static HTML pages in `site/` share one stylesheet, one ES-module script, and one data table (`site/assets/catalog.js`) that drives the nav, pager, playbook grid, principle cards, and per-chapter lists. A bash gate (`scripts/check-guide-site.sh`) fails on banned names, catalog/disk drift, broken local links, and unpinned CDN URLs; a GitHub Actions workflow runs it, then deploys `site/` to Pages.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), Mermaid 11.4.1 from jsDelivr, bash, GitHub Actions (`configure-pages`, `upload-pages-artifact`, `deploy-pages`).

**Spec:** `docs/features/guide-site/spec.md` (approved). Read it before any task.

## Global Constraints

- No new repository dependencies: no npm, pip, gem, or site generator. `package.json` is not touched.
- The only third-party runtime fetch is `https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs`.
- Nothing under `site/` may contain the external guide's project name, its author's name or handle, its upstream repository path, `Riot`, or `League of Legends`, nor the champion's name as a character reference. `scripts/check-guide-site.sh` holds the exact banned list.
- The site never links to individual files under `skills/` (those files carry MIT attribution the site must not surface). Cards link to guide chapters instead.
- All prose is original, written per the `text2prod:unslop` skill, and states only facts checked against the repo file named in the task.
- Prompts on the site use the real command: `/text2prod:zed-mode …`.
- Visual identity: original shadow motif; palette near-black, crimson, steel; no Riot assets.
- Shell scripts: `#!/usr/bin/env bash`, `set -euo pipefail`, `shfmt -i 2` style, pass `scripts/lint-shell.sh <files>`, and run on macOS bash 3.2 (no associative arrays, no `mapfile`).
- Enabling Pages on the repo and the first deploy wait for the owner's explicit OK.

## File map

| File | Responsibility | Task |
| --- | --- | --- |
| `scripts/check-guide-site.sh` | Pre-deploy gate | 1 |
| `tests/guide-site/test-check-guide-site.sh` | Gate test suite with fixtures | 1 |
| `site/assets/catalog.js` | The one data table: chapters, playbooks, skills, principles | 2 |
| `site/assets/guide.js` | Nav, pager, renderers, copy buttons, theme, Mermaid | 2 |
| `site/assets/guide.css` | Tokens, themes, layout, components | 2 |
| `site/assets/mark.svg` | Original shuriken/shadow mark and favicon | 2 |
| `site/index.html` | Home | 2 |
| `site/01-setup.html` … `site/05-build.html` | Chapters 1–5 | 3 |
| `site/06-verify-ship.html` … `site/10-recipes.html` | Chapters 6–10 | 4 |
| `.github/workflows/pages.yml` | Check, then deploy | 5 |
| `ARCHITECTURE.md`, `docs/engineering/infrastructure.md`, `docs/testing.md`, `README.md` | Docs rows and links | 5 |

Spec correction folded into this plan: the spec's file list names `site/.nojekyll`. Pages deployed through Actions never runs Jekyll, and `upload-pages-artifact` v4 drops dotfiles, so the file is dropped. Task 2 edits that line out of `spec.md`.

## Throughput checkpoint

- **Blocking first steps:** Task 1 (the gate), then Task 2 (shared assets, catalog, page skeleton). Every page depends on both.
- **Independent workstreams:** Task 3 and Task 4 write disjoint files and can run in parallel after Task 2.
- **Shared mutable state:** `site/assets/catalog.js` is written once in Task 2. Tasks 3 and 4 do not edit it; if a chapter needs a catalog change, the task reports it instead of editing.
- **Smallest safe decomposition:** five tasks; Task 5 runs after 3 and 4 because the workflow's first run must see the full site.

## Page skeleton (used by every page)

Every page under `site/` uses this exact skeleton. Only `<title>`, the `description` meta, `data-page`, the eyebrow, and the article body change. `data-page` equals the page's `chapters[].slug`.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Set up · Text2Prod guide</title>
  <meta name="description" content="Install Text2Prod in Claude Code, Codex, or OpenCode and confirm the bootstrap loaded.">
  <link rel="icon" href="assets/mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/guide.css">
  <script type="module" src="assets/guide.js"></script>
</head>
<body data-page="01-setup">
  <header class="topbar">
    <button id="menu-toggle" class="icon-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <a class="brand" href="index.html"><img src="assets/mark.svg" alt="" width="28" height="28">Text2Prod guide</a>
    <button id="theme-toggle" class="icon-btn" type="button" aria-label="Toggle light and dark theme">◐</button>
  </header>
  <div class="layout">
    <nav id="nav" aria-label="Chapters"></nav>
    <main>
      <article>
        <p class="eyebrow">Chapter 1</p>
        <h1>Set up</h1>
        <!-- chapter body -->
      </article>
      <nav id="pager" aria-label="Pages"></nav>
    </main>
  </div>
</body>
</html>
```

Body conventions for chapter content:

- First paragraph after `<h1>`: `<p class="lede">…</p>`, one paragraph saying what the reader learns.
- Copyable prompts: `<pre><code>…</code></pre>`. `guide.js` adds the Copy button. Escape `<`, `>`, `&` inside code.
- Diagrams: `<pre class="mermaid">…</pre>` containing Mermaid source.
- Highlighted note: `<div class="callout"><p>…</p></div>`.
- Rendered lists: `<div data-render="in-this-chapter"></div>` (every chapter page includes it once, under an `<h2>In this chapter</h2>`), `<div data-render="playbook-grid"></div>`, `<div data-render="principles"></div>`, `<div data-render="chapter-index"></div>`.
- Tables: plain `<table>` with `<thead>`.

---

### Task 1: Pre-deploy gate and its tests

**Files:**
- Create: `scripts/check-guide-site.sh`
- Test: `tests/guide-site/test-check-guide-site.sh`

**Interfaces:**
- Consumes: nothing.
- Produces: `scripts/check-guide-site.sh [--site DIR] [--repo DIR]`. Defaults: repo = the script's parent directory's parent; site = `<repo>/site`. Exit 0 and prints `guide site OK` when clean; exit 1 with one `FAIL: …` line per problem plus a count line; exit 2 on usage errors or a missing site/catalog. Reads `site/assets/catalog.js` with the line format in Task 2: each array opens with `export const <name> = [` at line start and closes with `];` at line start; each entry is on one line; values the gate reads (`slug`, `name`, `file`) are double-quoted.

- [ ] **Step 1: Write the failing test suite**

Create `tests/guide-site/test-check-guide-site.sh`:

```bash
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

echo "guide-site gate tests: all passed"
```

- [ ] **Step 2: Run the suite to verify it fails**

Run: `chmod +x tests/guide-site/test-check-guide-site.sh && tests/guide-site/test-check-guide-site.sh`
Expected: `FAIL: clean fixture: expected exit 0, got 127` (the gate does not exist yet).

- [ ] **Step 3: Write the gate**

Create `scripts/check-guide-site.sh`:

```bash
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
      site="$2"
      shift 2
      ;;
    --repo)
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
```

Note on the banned-term output: `grep -rn` prints `path:line:text`, and the gate strips the site prefix, so a hit reads `FAIL: banned term: index.html:7:<p>Ported from pstack.</p>`. That is what test case 2 matches.

- [ ] **Step 4: Run the suite to verify it passes**

Run: `chmod +x scripts/check-guide-site.sh && tests/guide-site/test-check-guide-site.sh`
Expected: seven `[PASS]` lines, then `guide-site gate tests: all passed`.

- [ ] **Step 5: Lint both scripts**

Run: `scripts/lint-shell.sh scripts/check-guide-site.sh tests/guide-site/test-check-guide-site.sh`
Expected: no ShellCheck findings. If `shfmt` is installed, also run `scripts/lint-shell.sh --format` on the same two files and commit the result; if not, say so in the task report.

- [ ] **Step 6: Commit**

```bash
git add scripts/check-guide-site.sh tests/guide-site/test-check-guide-site.sh
git commit -m "Add the guide-site pre-deploy gate and its tests"
```

---

### Task 2: Shared assets, catalog, and Home

**Files:**
- Create: `site/assets/catalog.js`, `site/assets/guide.js`, `site/assets/guide.css`, `site/assets/mark.svg`, `site/index.html`
- Create (stubs, replaced by Tasks 3 and 4): `site/01-setup.html` through `site/10-recipes.html`
- Modify: `docs/features/guide-site/spec.md` (drop the `.nojekyll` line from the Files block)

**Interfaces:**
- Consumes: `scripts/check-guide-site.sh` from Task 1.
- Produces:
  - `catalog.js` exports `chapters` (`{ n, slug, title, blurb }`), `playbooks` (`{ name, chapter, group, when }`), `skills` (`{ name, chapter, kind, what }`), `principles` (`{ name, file, group, sayWhen }`).
  - `guide.js` renderers selected by `data-render`: `chapter-index`, `in-this-chapter`, `playbook-grid`, `principles`. Copy buttons on every `pre > code`. Mermaid on every `pre.mermaid`. Nav into `#nav`, pager into `#pager`, theme via `#theme-toggle`, mobile menu via `#menu-toggle`.
  - CSS classes for chapter bodies: `lede`, `eyebrow`, `callout`, `hero`, `grid`, `card`, `tag`.

- [ ] **Step 1: Write `site/assets/catalog.js`**

Every value comes from the repo: playbook `when` text from the table in `skills/zed-mode/SKILL.md`; skill `what` text summarises the `description:` line of `skills/<name>/SKILL.md`; principle names, files, and groups from `skills/principles/SKILL.md`.

```js
// The single data table for the guide. scripts/check-guide-site.sh diffs
// playbook names, skill names, and principle files against skills/ on disk,
// so keep one entry per line and double-quote those values.

export const chapters = [
  { n: 0, slug: "index", title: "Home", blurb: "What Text2Prod is and the one prompt to remember." },
  { n: 1, slug: "01-setup", title: "Set up", blurb: "Install in Claude Code, Codex, or OpenCode and confirm the bootstrap loaded." },
  { n: 2, slug: "02-zed-mode", title: "Route work through zed-mode", blurb: "Say the goal and a done check; the router picks one of 23 playbooks." },
  { n: 3, slug: "03-understand", title: "Understand before editing", blurb: "Read-only investigations and root-cause debugging before any fix." },
  { n: 4, slug: "04-design", title: "Design the change", blurb: "Spike, bounded, or architectural, and the spec to plan chain." },
  { n: 5, slug: "05-build", title: "Build and clean", blurb: "Tests first, delegated tasks, isolated worktrees, and plain prose." },
  { n: 6, slug: "06-verify-ship", title: "Verify and ship", blurb: "Evidence on the real surface, honest numbers, review, and a merged PR." },
  { n: 7, slug: "07-unattended", title: "Run it unattended", blurb: "Autonomy grants, decision logs, and programs of many PRs." },
  { n: 8, slug: "08-principles", title: "Steer with principles", blurb: "Twenty-four named rules that redirect an agent mid-task." },
  { n: 9, slug: "09-make-it-yours", title: "Make it yours", blurb: "Onboard a repo, customise templates, and test a skill change." },
  { n: 10, slug: "10-recipes", title: "Recipes and pitfalls", blurb: "Prompts to copy and mistakes to skip." },
];

export const playbooks = [
  { name: "investigation", chapter: 3, group: "understand", when: "A read-only question: how does X work, why was Y built this way, are we sure about Z." },
  { name: "runtime-forensics", chapter: 3, group: "understand", when: "Diagnosing a live symptom (leak, spin, glitch) from instrumentation." },
  { name: "trace-forensics", chapter: 3, group: "understand", when: "Diagnosing a captured profile, trace, or heap snapshot." },
  { name: "feature", chapter: 4, group: "change", when: "New or changed behavior. Runs the spec, plan, implementation, review chain." },
  { name: "prototype", chapter: 4, group: "change", when: "A throwaway sketch to settle a design or behavioral fork by observing it." },
  { name: "multi-phase-plan", chapter: 4, group: "plan", when: "Work that spans phases or stacked PRs." },
  { name: "bug-fix", chapter: 5, group: "change", when: "A reported defect to reproduce, root-cause, and fix with runtime evidence." },
  { name: "refactoring", chapter: 5, group: "change", when: "A behavior-preserving change to structure or shape." },
  { name: "perf-issue", chapter: 5, group: "change", when: "A measured slowness to trace and improve against a baseline." },
  { name: "hillclimb", chapter: 5, group: "change", when: "Improving one metric toward a target over many measured iterations." },
  { name: "visual-parity", chapter: 5, group: "change", when: "Pixel-exact match between two UIs." },
  { name: "opening-a-pr", chapter: 6, group: "ship", when: "The end of every other playbook." },
  { name: "babysit", chapter: 6, group: "ship", when: "Driving a PR to merge-ready: conflicts, review threads, CI." },
  { name: "shipping", chapter: 6, group: "ship", when: "Landing a verified green stack." },
  { name: "autonomous-run", chapter: 7, group: "plan", when: "A long task to drive to completion without stopping." },
  { name: "orchestrate", chapter: 7, group: "plan", when: "A multi-day program of many stacked PRs under one coordinator." },
  { name: "autopilot-full", chapter: 7, group: "plan", when: "A queue of independent PRs run to merged under full autonomy." },
  { name: "autopilot-stack", chapter: 7, group: "plan", when: "A queue built into one verified stack your human partner lands." },
  { name: "session-pickup", chapter: 7, group: "lifecycle", when: "Resuming or taking over another agent's in-flight work." },
  { name: "pause-safely", chapter: 7, group: "lifecycle", when: "Suspending in-flight work cleanly so it can be resumed." },
  { name: "worktree-cleanup", chapter: 7, group: "lifecycle", when: "Pruning merged or abandoned worktrees and stale simulators." },
  { name: "authoring-a-skill", chapter: 9, group: "authoring", when: "Writing or editing a SKILL.md, playbook, or skill reference." },
  { name: "eval", chapter: 9, group: "authoring", when: "Testing how a skill, playbook, or prompt change affects agent behavior before promoting it." },
];

export const skills = [
  { name: "zed-mode", chapter: 2, kind: "bootstrap", what: "Loads at session start, checks for a matching skill before any reply, and routes work to a playbook." },
  { name: "figure-it-out", chapter: 2, kind: "process", what: "Plans large or cross-cutting work when no single playbook fits." },
  { name: "systematic-debugging", chapter: 3, kind: "process", what: "Finds the root cause of a bug or failing test before any fix is proposed." },
  { name: "brainstorming", chapter: 4, kind: "process", what: "Turns an idea into an approved design before any code is written." },
  { name: "writing-plans", chapter: 4, kind: "process", what: "Turns an approved spec into small tasks, each with its own test." },
  { name: "interrogate", chapter: 4, kind: "review", what: "Stress-tests a contested or risky design or change before it ships." },
  { name: "test-driven-development", chapter: 5, kind: "discipline", what: "Writes the failing test first, then the code that makes it pass." },
  { name: "subagent-driven-development", chapter: 5, kind: "process", what: "Runs a plan by dispatching a fresh subagent per task, with review between tasks." },
  { name: "executing-plans", chapter: 5, kind: "process", what: "Runs a plan in batches with review checkpoints." },
  { name: "dispatching-parallel-agents", chapter: 5, kind: "process", what: "Splits two or more independent tasks across parallel agents." },
  { name: "using-git-worktrees", chapter: 5, kind: "discipline", what: "Gives feature work an isolated workspace." },
  { name: "unslop", chapter: 5, kind: "discipline", what: "Cuts filler and AI tells from any prose the agent writes." },
  { name: "verification-before-completion", chapter: 6, kind: "discipline", what: "Runs the check and reads its output before anyone says done." },
  { name: "benchmark-checklist", chapter: 6, kind: "discipline", what: "Vets a measured number before it is reported or acted on." },
  { name: "requesting-code-review", chapter: 6, kind: "review", what: "Asks for review against the requirements before merge." },
  { name: "receiving-code-review", chapter: 6, kind: "review", what: "Checks review feedback on its merits instead of agreeing by reflex." },
  { name: "finishing-a-development-branch", chapter: 6, kind: "review", what: "Decides how finished work integrates, and asks before merging." },
  { name: "show-me-your-work", chapter: 7, kind: "process", what: "Keeps an audit trail of decisions during long or unattended runs." },
  { name: "principles", chapter: 8, kind: "meta", what: "The 24 named rules behind design, debugging, delegation, and verification calls." },
  { name: "init-project", chapter: 9, kind: "meta", what: "Onboards a repository for AI-native work without touching an existing AGENTS.md." },
  { name: "writing-skills", chapter: 9, kind: "meta", what: "Creates or edits a skill and checks it works before it ships." },
];

export const principles = [
  { name: "Laziness Protocol", file: "laziness-protocol", group: "Core", sayWhen: "The diff is growing layers, flags, or abstractions." },
  { name: "Foundational Thinking", file: "foundational-thinking", group: "Core", sayWhen: "Logic is about to be written before the data structures are settled." },
  { name: "Redesign from First Principles", file: "redesign-from-first-principles", group: "Core", sayWhen: "A new requirement is about to be bolted onto an old design." },
  { name: "Attack the Premise", file: "attack-the-premise", group: "Core", sayWhen: "Two fixes built on one assumption failed the same check." },
  { name: "Subtract Before You Add", file: "subtract-before-you-add", group: "Core", sayWhen: "An addition is planned on top of dead weight." },
  { name: "Minimize Reader Load", file: "minimize-reader-load", group: "Core", sayWhen: "The code is hard to trace through layers and hidden state." },
  { name: "Outcome-Oriented Execution", file: "outcome-oriented-execution", group: "Core", sayWhen: "A migration plans throwaway in-between states." },
  { name: "Experience First", file: "experience-first", group: "Core", sayWhen: "Builder convenience is costing the user." },
  { name: "Exhaust the Design Space", file: "exhaust-the-design-space", group: "Core", sayWhen: "A new kind of decision has no precedent to copy." },
  { name: "Build the Lever", file: "build-the-lever", group: "Core", sayWhen: "Repetitive edits or checks could be done and proved by a script." },
  { name: "Model the Domain", file: "model-the-domain", group: "Architecture", sayWhen: "Logic branches a lot or repeats one shape assumption." },
  { name: "Boundary Discipline", file: "boundary-discipline", group: "Architecture", sayWhen: "Validation, error handling, or adapters are being wired." },
  { name: "Type System Discipline", file: "type-system-discipline", group: "Architecture", sayWhen: "A type or signature is being designed in a typed language." },
  { name: "Make Operations Idempotent", file: "make-operations-idempotent", group: "Architecture", sayWhen: "A step can crash halfway and be retried." },
  { name: "Migrate Callers Then Delete Legacy APIs", file: "migrate-callers-then-delete-legacy-apis", group: "Architecture", sayWhen: "A new API lands while old callers remain." },
  { name: "Separate Before Serializing Shared State", file: "separate-before-serializing-shared-state", group: "Architecture", sayWhen: "Parallel workers might write the same file, branch, or key." },
  { name: "Prove It Works", file: "prove-it-works", group: "Verification", sayWhen: "Someone is about to say done." },
  { name: "Fix Root Causes", file: "fix-root-causes", group: "Verification", sayWhen: "A guard is about to hide a symptom." },
  { name: "Sequence Verifiable Units", file: "sequence-verifiable-units", group: "Verification", sayWhen: "Commits, tasks, or PRs are being ordered." },
  { name: "Test Behavior Not Implementation", file: "test-behavior-not-implementation", group: "Verification", sayWhen: "A test is being written, changed, or kept." },
  { name: "Explain the Number", file: "explain-the-number", group: "Verification", sayWhen: "A measurement is about to be trusted or reported." },
  { name: "Guard the Context Window", file: "guard-the-context-window", group: "Delegation", sayWhen: "Large outputs or long files are flooding the thread." },
  { name: "Never Block on the Human", file: "never-block-on-the-human", group: "Delegation", sayWhen: "The agent is about to ask permission for reversible work." },
  { name: "Encode Lessons in Structure", file: "encode-lessons-in-structure", group: "Meta", sayWhen: "The same instruction is being given a second time." },
];
```

- [ ] **Step 2: Write `site/assets/guide.js`**

```js
import { chapters, playbooks, skills, principles } from "./catalog.js";

const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";
const THEME_KEY = "text2prod-guide-theme";
const root = document.documentElement;
const page = document.body.dataset.page;
const current = chapters.find((c) => c.slug === page);
const darkQuery = matchMedia("(prefers-color-scheme: dark)");

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

const pageHref = (chapter) => `${chapter.slug}.html`;
const chapterHref = (n) => pageHref(chapters.find((c) => c.n === n));
const chapterLabel = (c) => (c.n === 0 ? c.title : `${c.n}. ${c.title}`);

function renderNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const list = el("ol", { class: "nav-list" });
  for (const c of chapters) {
    const link = el("a", { href: pageHref(c) }, chapterLabel(c));
    if (c.slug === page) link.setAttribute("aria-current", "page");
    list.append(el("li", {}, link));
  }
  nav.append(list);
  const toggle = document.getElementById("menu-toggle");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function renderPager() {
  const pager = document.getElementById("pager");
  if (!pager || !current) return;
  const i = chapters.indexOf(current);
  const prev = chapters[i - 1];
  const next = chapters[i + 1];
  if (prev) pager.append(el("a", { class: "prev", href: pageHref(prev) }, `← ${prev.title}`));
  if (next) pager.append(el("a", { class: "next", href: pageHref(next) }, `Next: ${next.title} →`));
}

function playbookCard(p) {
  return el(
    "a",
    { class: "card", href: chapterHref(p.chapter) },
    el("code", {}, p.name),
    el("p", {}, p.when),
    el("span", { class: "tag" }, p.group),
  );
}

function skillCard(s) {
  return el(
    "a",
    { class: "card", href: chapterHref(s.chapter) },
    el("code", {}, s.name),
    el("p", {}, s.what),
    el("span", { class: "tag" }, s.kind),
  );
}

const renderers = {
  "chapter-index"(node) {
    const grid = el("div", { class: "grid" });
    for (const c of chapters.filter((c) => c.n > 0)) {
      grid.append(
        el(
          "a",
          { class: "card", href: pageHref(c) },
          el("span", { class: "tag" }, `Chapter ${c.n}`),
          el("strong", {}, c.title),
          el("p", {}, c.blurb),
        ),
      );
    }
    node.append(grid);
  },

  "in-this-chapter"(node) {
    if (!current) return;
    const ownSkills = skills.filter((s) => s.chapter === current.n);
    const ownPlaybooks = playbooks.filter((p) => p.chapter === current.n);
    if (ownSkills.length) {
      node.append(el("h3", { class: "grid-heading" }, "Skills"), el("div", { class: "grid" }, ...ownSkills.map(skillCard)));
    }
    if (ownPlaybooks.length) {
      node.append(el("h3", { class: "grid-heading" }, "Playbooks"), el("div", { class: "grid" }, ...ownPlaybooks.map(playbookCard)));
    }
  },

  "playbook-grid"(node) {
    const groups = ["all", ...new Set(playbooks.map((p) => p.group))];
    const bar = el("div", { class: "filters", role: "group", "aria-label": "Filter playbooks by group" });
    const grid = el("div", { class: "grid" });
    const draw = (group) => {
      grid.replaceChildren(...playbooks.filter((p) => group === "all" || p.group === group).map(playbookCard));
      for (const button of bar.children) button.setAttribute("aria-pressed", String(button.dataset.group === group));
    };
    for (const group of groups) {
      const button = el("button", { type: "button", "data-group": group }, group);
      button.addEventListener("click", () => draw(group));
      bar.append(button);
    }
    node.append(bar, grid);
    draw("all");
  },

  principles(node) {
    for (const group of [...new Set(principles.map((p) => p.group))]) {
      const cards = principles
        .filter((p) => p.group === group)
        .map((p) => el("div", { class: "card" }, el("strong", {}, p.name), el("p", {}, `Say it when: ${p.sayWhen}`)));
      node.append(el("h3", { class: "grid-heading" }, group), el("div", { class: "grid" }, ...cards));
    }
  },
};

function addCopyButtons() {
  for (const code of document.querySelectorAll("pre > code")) {
    const button = el("button", { class: "copy", type: "button", "aria-label": "Copy to clipboard" }, "Copy");
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select to copy";
      }
      setTimeout(() => (button.textContent = "Copy"), 1500);
    });
    code.parentElement.append(button);
  }
}

function storedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Without storage the toggle still works for this page view.
  }
}

const effectiveTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");

let mermaidModule;
async function renderDiagrams() {
  const nodes = [...document.querySelectorAll("pre.mermaid")];
  if (!nodes.length) return;
  for (const node of nodes) {
    node.dataset.source ??= node.textContent;
    node.textContent = node.dataset.source;
    node.removeAttribute("data-processed");
  }
  try {
    mermaidModule ??= import(MERMAID_URL).then((m) => m.default);
    const mermaid = await mermaidModule;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: effectiveTheme() === "dark" ? "dark" : "neutral",
      fontFamily: "inherit",
    });
    await mermaid.run({ nodes });
  } catch (error) {
    console.warn("Diagrams unavailable; showing their source instead.", error);
  }
}

function initTheme() {
  const saved = storedTheme();
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    saveTheme(next);
    renderDiagrams();
  });
  darkQuery.addEventListener("change", () => {
    if (!root.dataset.theme) renderDiagrams();
  });
}

initTheme();
renderNav();
renderPager();
for (const node of document.querySelectorAll("[data-render]")) renderers[node.dataset.render]?.(node);
addCopyButtons();
renderDiagrams();
```

- [ ] **Step 3: Write `site/assets/guide.css`**

```css
:root {
  --bg: #f6f5f3;
  --surface: #ffffff;
  --surface-2: #efedea;
  --text: #1b1a1d;
  --muted: #5d5b62;
  --accent: #b3122e;
  --accent-soft: #b3122e14;
  --steel: #6f7884;
  --border: #dcd9d4;
  --code-bg: #f0eeeb;
  --shadow: 0 1px 2px #0000000f, 0 8px 24px #0000000d;
  --radius: 10px;
  --font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0e0e11;
    --surface: #16161b;
    --surface-2: #1e1e25;
    --text: #ecebef;
    --muted: #a3a1ab;
    --accent: #e5354f;
    --accent-soft: #e5354f24;
    --steel: #8d97a5;
    --border: #2a2a33;
    --code-bg: #121217;
    --shadow: 0 1px 2px #00000066, 0 8px 24px #00000055;
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  --bg: #0e0e11;
  --surface: #16161b;
  --surface-2: #1e1e25;
  --text: #ecebef;
  --muted: #a3a1ab;
  --accent: #e5354f;
  --accent-soft: #e5354f24;
  --steel: #8d97a5;
  --border: #2a2a33;
  --code-bg: #121217;
  --shadow: 0 1px 2px #00000066, 0 8px 24px #00000055;
  color-scheme: dark;
}

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.65 var(--font); }
a { color: var(--accent); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.topbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.brand { display: flex; align-items: center; gap: 8px; margin-right: auto; font-weight: 650; color: var(--text); text-decoration: none; }
.icon-btn { font: inherit; background: var(--surface); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 4px 10px; cursor: pointer; }
#menu-toggle { display: none; }

.layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); max-width: 1180px; margin: 0 auto; }
#nav { position: sticky; top: 57px; align-self: start; max-height: calc(100vh - 57px); overflow: auto; padding: 24px 16px; }
.nav-list { list-style: none; margin: 0; padding: 0; }
.nav-list a { display: block; padding: 6px 10px; border-radius: 8px; color: var(--muted); text-decoration: none; }
.nav-list a:hover { background: var(--surface-2); color: var(--text); }
.nav-list a[aria-current="page"] { background: var(--accent-soft); color: var(--accent); font-weight: 600; }

main { min-width: 0; padding: 32px 16px 64px; }
article { max-width: 760px; }
h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 12px; }
h2 { margin-top: 2.2em; font-size: 1.4rem; }
.eyebrow { margin: 0 0 4px; color: var(--accent); font-weight: 600; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; }
.lede { font-size: 1.15rem; color: var(--muted); }

code { font-family: var(--mono); font-size: 0.9em; background: var(--surface-2); padding: 0.1em 0.35em; border-radius: 5px; }
pre { position: relative; overflow-x: auto; background: var(--code-bg); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius); padding: 14px 72px 14px 16px; }
pre code { background: none; padding: 0; white-space: pre-wrap; word-break: break-word; }
pre.mermaid { padding: 16px; border-left-color: var(--steel); background: var(--surface); font-family: var(--mono); font-size: 0.85rem; white-space: pre; text-align: center; }
.copy { position: absolute; top: 8px; right: 8px; font: 600 0.75rem var(--font); color: var(--muted); background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 2px 8px; cursor: pointer; }

table { display: block; overflow-x: auto; width: 100%; border-collapse: collapse; }
th, td { text-align: left; vertical-align: top; padding: 8px 10px; border-bottom: 1px solid var(--border); }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin: 16px 0; }
.grid-heading { margin: 1.5em 0 0; }
.card { display: block; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; color: var(--text); text-decoration: none; box-shadow: var(--shadow); transition: transform 0.15s, border-color 0.15s; }
a.card:hover { transform: translateY(-2px); border-color: var(--accent); }
.card strong { display: block; }
.card p { margin: 6px 0 0; color: var(--muted); font-size: 0.92rem; }
.tag { display: inline-block; margin-top: 8px; font-size: 0.75rem; color: var(--steel); letter-spacing: 0.06em; text-transform: uppercase; }

.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.filters button { font: inherit; font-size: 0.85rem; padding: 4px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; }
.filters button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #fff; }

.callout { border: 1px solid var(--border); border-left: 3px solid var(--accent); background: var(--accent-soft); border-radius: var(--radius); padding: 4px 16px; }
.hero { position: relative; padding: 16px 0 8px; }
.hero::before { content: ""; position: absolute; top: -24px; right: 0; width: 220px; height: 220px; background: url(mark.svg) no-repeat center / contain; opacity: 0.07; pointer-events: none; }

#pager { display: flex; justify-content: space-between; gap: 12px; max-width: 760px; margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--border); }
#pager .next { margin-left: auto; }

@media (max-width: 800px) {
  #menu-toggle { display: inline-block; }
  .layout { display: block; }
  #nav { display: none; position: static; max-height: none; padding: 8px 16px; border-bottom: 1px solid var(--border); }
  #nav.open { display: block; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

- [ ] **Step 4: Write `site/assets/mark.svg`**

A four-point shuriken with an offset steel shadow copy and a punched centre (`evenodd`), so it reads on both themes.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" role="img" aria-label="Text2Prod guide mark">
  <path fill="#6f7884" fill-opacity="0.55" fill-rule="evenodd" transform="translate(7 7)"
    d="M26 2 L31 21 L50 26 L31 31 L26 50 L21 31 L2 26 L21 21 Z M26 22 a4 4 0 1 0 0.01 0 Z"/>
  <path fill="#b3122e" fill-rule="evenodd"
    d="M26 2 L31 21 L50 26 L31 31 L26 50 L21 31 L2 26 L21 21 Z M26 22 a4 4 0 1 0 0.01 0 Z"/>
</svg>
```

- [ ] **Step 5: Write `site/index.html`**

Use the page skeleton with `<title>Text2Prod guide</title>`, description `A visual guide to Text2Prod: install it, route work through zed-mode, and ship with evidence.`, `data-page="index"`, eyebrow `Guide`, and `<h1>Text2Prod</h1>`. Article body, in this order:

1. `<section class="hero">` holding the lede: Text2Prod is a plugin of skills for coding agents (Claude Code, Codex CLI and App, OpenCode). A bootstrap skill, `zed-mode`, makes the agent check for a matching skill before it replies, and feature work leaves a spec, a plan, and a review in the repository. Source: `docs/get-started.md` "What Text2Prod is".
2. `<h2>The shadow runs first</h2>`: one short paragraph with the motif. When you send a prompt, `zed-mode` sends a shadow ahead: it matches a playbook and copies its steps into a todo list. The real work follows where those steps land, and each step calls the skill it names. Then this diagram:

```text
<pre class="mermaid">
flowchart LR
  P["Your prompt"] --> Z["zed-mode"]
  Z -->|matches| B["One of 23 playbooks"]
  B -->|copies steps into| T["Todo list"]
  T -->|each step calls| S["Skills"]
  S --> E["Evidence you can check"]
</pre>
```

3. `<h2>If you only remember one thing</h2>`: give the agent a goal and a way to check it. This prompt:

```text
<pre><code>/text2prod:zed-mode the nightly export skips the last page of results. reproduce it first, then fix it. done means the three-page fixture exports every row.</code></pre>
```

Then one paragraph: no playbook named, no skill listed. "Reproduce it first" and a done check that can fail are enough for the router to pick `bug-fix` and run its steps.
4. `<h2>Chapters</h2>`, one sentence (read in order the first time; each page stands alone afterwards), then `<div data-render="chapter-index"></div>`.
5. `<h2>What is inside</h2>`: a three-row table: 20 skills plus the `zed-mode` front door; 23 playbooks; 24 principles. Each row links to the chapter that covers it (`02-zed-mode.html`, `02-zed-mode.html`, `08-principles.html`).

- [ ] **Step 6: Write chapter stubs so links resolve**

For each of the ten chapter slugs in `catalog.js`, create `site/<slug>.html` from the skeleton with the right `data-page`, title, eyebrow (`Chapter N`), `<h1>` (the chapter title), and a body of `<p class="lede">Coming in this release.</p>`. Tasks 3 and 4 replace these.

- [ ] **Step 7: Drop `.nojekyll` from the spec**

In `docs/features/guide-site/spec.md`, replace the `site/` part of the Files block with:

```text
site/
├── index.html, 01-setup.html … 10-recipes.html
└── assets/
    ├── guide.css     tokens, light/dark themes, layout, shadow motif
    ├── guide.js      nav, copy buttons, theme toggle, Mermaid init, grids
    ├── catalog.js    the single data table
    └── mark.svg      original shuriken/shadow mark (also the favicon)
```

- [ ] **Step 8: Run the gate on the real site**

Run: `scripts/check-guide-site.sh`
Expected: `guide site OK`. If it reports a catalog mismatch, fix `catalog.js` against the folder it names.

- [ ] **Step 9: Check the Home page on the real surface**

Run (background): `python3 -m http.server 8765 --directory site`
Then with the Playwright browser tools (`browser_navigate` to `http://localhost:8765/index.html`, `browser_snapshot`, `browser_take_screenshot`, `browser_console_messages`, `browser_resize`):
- At 1280×800: the nav lists 11 entries with Home marked current; the hero diagram renders as an `svg` (not raw text); the chapter grid shows 10 cards; the Copy button appears on the prompt.
- Click the theme toggle: colours flip and the diagram re-renders.
- At 390×844: no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth` via `browser_evaluate`); Menu opens the nav.
- `browser_console_messages` shows no errors.
Stop the server when done (`kill` the PID you started).

- [ ] **Step 10: Commit**

```bash
git add site docs/features/guide-site/spec.md
git commit -m "Add the guide site shell: catalog, shared assets, and Home"
```

---

### Task 3: Chapters 1–5

**Files:**
- Modify (replace stubs): `site/01-setup.html`, `site/02-zed-mode.html`, `site/03-understand.html`, `site/04-design.html`, `site/05-build.html`

**Interfaces:**
- Consumes: page skeleton, CSS classes, and renderers from Task 2. Does not edit `site/assets/*`; report any needed catalog change instead.
- Produces: five finished chapter pages.

For each chapter: read every source file listed, write original prose per the `text2prod:unslop` skill, keep each section short (one to three paragraphs), and include every listed prompt and diagram verbatim. Every chapter ends its article with `<h2>In this chapter</h2><div data-render="in-this-chapter"></div>`.

- [ ] **Step 1: Write `01-setup.html`**

Sources: `docs/get-started.md` (Install, Run your first session), `docs/engineering/infrastructure.md`, `hooks/session-start`.

Sections:
1. Lede: install once per harness, then confirm the bootstrap loaded.
2. `<h2>Install</h2>` with one `<h3>` per harness and its exact commands from `docs/get-started.md`:
   - Claude Code: `/plugin marketplace add phuongddx/text2prod` then `/plugin install text2prod@text2prod`; start a new session afterwards.
   - Codex CLI: `codex plugin marketplace add https://github.com/phuongddx/text2prod.git` then `codex plugin add text2prod@text2prod`.
   - Codex App: build with `scripts/package-codex-plugin.sh` and upload through the Codex portal; the script needs a prior official package as its metadata seed.
   - OpenCode: `opencode plugin add github:phuongddx/text2prod`, or add `"github:phuongddx/text2prod"` to the `plugins` array in `opencode.json`.
3. `<h2>How the bootstrap loads</h2>`: the per-harness table from `docs/get-started.md`, then this diagram:

```text
<pre class="mermaid">
flowchart TD
  S["Session starts"] --> H{"Harness"}
  H -->|Claude Code| C["hooks/session-start runs on startup, /clear, and compaction"]
  H -->|OpenCode| O["Plugin injects the bootstrap through the context hook"]
  H -->|Codex| X["No session hook: skills are discovered natively"]
  C --> Z["zed-mode is in context"]
  O --> Z
  X --> D["The agent loads zed-mode by its description"]
</pre>
```

4. `<h2>Check that it loaded</h2>`: ask a routing question and look for the agent naming a playbook before acting:

```text
<pre><code>/text2prod:zed-mode which playbook would you use to fix a flaky test? answer only, don't start.</code></pre>
```

Say what a working answer looks like (it names `bug-fix` and the skills its steps call) and what to do if nothing loads (start a new session; on Claude Code, check that the plugin is enabled).

- [ ] **Step 2: Write `02-zed-mode.html`**

Sources: `skills/zed-mode/SKILL.md` (The Rule, Skill Priority, Playbooks, Autonomy, Triggers), `docs/get-started.md` (playbook table), `skills/figure-it-out/SKILL.md`.

Sections:
1. Lede: `zed-mode` is the front door. Give it a goal; it matches one of 23 playbooks, copies the steps into a todo list, and calls the skills each step names.
2. `<h2>The skill-first rule</h2>`: the agent checks for a matching skill before any reply, including clarifying questions; process skills (brainstorming, systematic-debugging) set the approach before implementation skills.
3. `<h2>What happens to your prompt</h2>`, diagram:

```text
<pre class="mermaid">
flowchart TD
  A["Your prompt"] --> Z["zed-mode"]
  Z --> R{"What kind of work?"}
  R -->|Read-only question| I["investigation"]
  R -->|Defect| B["bug-fix"]
  R -->|New behavior| F["feature"]
  R -->|Structure only| RF["refactoring"]
  R -->|Measured slowness| P["perf-issue"]
  R -->|PR needs to go green| BS["babysit"]
  R -->|Large, cross-cutting, or no match| FI["figure-it-out"]
  I --> V["Verify and report with evidence"]
  B --> V
  F --> V
  RF --> V
  P --> V
  BS --> V
  FI --> V
</pre>
```

   Then: a skipped step stays visible as `skip: <reason>`; `opening-a-pr` is the closing step of every other playbook.
4. `<h2>What goes in a prompt</h2>`: five parts, one line each: the goal; a done check that can pass or fail; the proof you want to see; what you already know; real constraints ("reproduce first", "don't change code yet"). One full example:

```text
<pre><code>/text2prod:zed-mode the csv export drops its last row since tuesday's deploy. failing job is 4812. reproduce it first, then fix it. done means the 60k-row fixture exports every row. show me the row counts before and after.</code></pre>
```

   And what to leave out: the how, and your theory of the cause until the agent has restated the problem.
5. `<h2>All 23 playbooks</h2>`: one sentence, then `<div data-render="playbook-grid"></div>`.
6. `<h2>When nothing fits</h2>`: `figure-it-out` for large, cross-cutting, or audited-later work; it frames a checkable done condition, designs the phases, and keeps a decision trail.
7. `<h2>In this chapter</h2>` block.

- [ ] **Step 3: Write `03-understand.html`**

Sources: `skills/zed-mode/playbooks/investigation.md`, `runtime-forensics.md`, `trace-forensics.md`, `skills/systematic-debugging/SKILL.md`.

Sections:
1. Lede: understand before you edit; a read-only pass costs one message, a wrong fix costs a review cycle.
2. `<h2>Ask a read-only question</h2>`: what the investigation playbook does (from its file), with:

```text
<pre><code>/text2prod:zed-mode how does a session pick up the bootstrap on OpenCode? read-only. cite file paths for every claim.</code></pre>
```

3. `<h2>Restate a noisy report first</h2>`:

```text
<pre><code>/text2prod:zed-mode read this issue thread and restate the real problem in plain words. don't touch code yet.</code></pre>
```

   Why: a misreading shows up in the restatement, before any code exists.
4. `<h2>Debug to the root cause</h2>`: the systematic-debugging phases as its file states them, and the rule that no fix is proposed before the cause is found.
5. `<h2>Symptoms and captured traces</h2>`: when to reach for `runtime-forensics` (a live leak, spin, or glitch) versus `trace-forensics` (a profile, trace, or heap snapshot you already captured), from their files.
6. `<h2>In this chapter</h2>` block.

- [ ] **Step 4: Write `04-design.html`**

Sources: `skills/brainstorming/SKILL.md` (Three Paths, HARD-GATE, Checklist), `skills/writing-plans/SKILL.md`, `skills/interrogate/SKILL.md`, `skills/zed-mode/playbooks/feature.md`, `prototype.md`, `multi-phase-plan.md`, `skills/zed-mode/references/feature-artifacts.md`, `docs/feature-workflow.md`.

Sections:
1. Lede: design settles before code; how much design depends on the size of the change.
2. `<h2>Spike, bounded, or architectural</h2>`: the three paths in one table (what it is, what you approve, what it leaves behind), then:

```text
<pre class="mermaid">
flowchart TD
  Q["Request"] --> C{"Classify"}
  C -->|Can we...?| S["Spike"]
  C -->|Small change to an existing flow| BD["Bounded"]
  C -->|New project, subsystem, or interface| AR["Architectural"]
  S --> S1["Approve the question and probe"] --> S2["Report a recommendation"]
  BD --> B1["Short design in chat"] --> B2{"Approved?"} -->|yes| B3["Implement with TDD"]
  AR --> A1["Questions, approaches, design sections"] --> A2["Write spec.md"] --> A3{"Spec approved?"} -->|yes| A4["writing-plans writes plan.md"] --> A5["Implement"]
</pre>
```

   Callout: an approval covers the stage it was given for; approving an idea does not approve a spec that does not exist yet.
3. `<h2>The artifact chain</h2>`: where each file lives (`docs/features/<slug>/`), which skill writes it, and that artifacts are edited in place with git as history:

```text
<pre class="mermaid">
flowchart LR
  SP["spec.md: brainstorming"] --> PL["plan.md: writing-plans"] --> IM["Implementation: TDD and subagents"] --> RV["review.md: finishing-a-development-branch"] --> M["Merge"]
</pre>
```

4. `<h2>Prototype before you pick</h2>`:

```text
<pre><code>/text2prod:zed-mode prototype two layouts for the settings page behind a toggle and send me a screenshot of each before we pick.</code></pre>
```

5. `<h2>Turn a settled design into a plan</h2>`:

```text
<pre><code>/text2prod:zed-mode turn the approved spec into a plan of small tasks, each with its own test.</code></pre>
```

   Mention `multi-phase-plan` for work spanning phases or stacked PRs.
6. `<h2>Challenge a contested design</h2>`:

```text
<pre><code>/text2prod:zed-mode interrogate this design. read-only. report only real risks, not style.</code></pre>
```

7. `<h2>In this chapter</h2>` block.

- [ ] **Step 5: Write `05-build.html`**

Sources: `skills/test-driven-development/SKILL.md`, `skills/subagent-driven-development/SKILL.md` (including Model Selection), `skills/executing-plans/SKILL.md`, `skills/dispatching-parallel-agents/SKILL.md`, `skills/using-git-worktrees/SKILL.md`, `skills/unslop/SKILL.md`, playbooks `bug-fix.md`, `refactoring.md`, `perf-issue.md`, `hillclimb.md`, `visual-parity.md`.

Sections:
1. Lede: build in small verified steps, delegate when tasks are independent, and keep the prose plain.
2. `<h2>Tests first</h2>`: red, green, refactor as the TDD skill states it, plus:

```text
<pre><code>/text2prod:zed-mode add a --dry-run flag to the bump script. it prints what would change and writes nothing. tests first.</code></pre>
```

3. `<h2>Run a plan</h2>`: subagent-driven (a fresh subagent per task, review between tasks) versus executing-plans (batches with checkpoints); when the parallel-agents skill applies; worktrees for isolation.
4. `<h2>Pick the playbook for the change</h2>`: a table with one row each for `bug-fix`, `refactoring`, `perf-issue`, `hillclimb`, `visual-parity`: when to use it and what proof it ends with, from each playbook file.
5. `<h2>Clean the prose</h2>`: what `unslop` cuts and where it applies (replies, docs, commits, PR bodies, comments).
6. `<h2>In this chapter</h2>` block.

- [ ] **Step 6: Run the gate**

Run: `scripts/check-guide-site.sh`
Expected: `guide site OK`.

- [ ] **Step 7: Check the five pages on the real surface**

Same procedure as Task 2 Step 9, for each of the five pages: diagrams render as `svg`; clicking a Copy button changes its label to `Copied` (or `Select to copy` where the headless clipboard is blocked); the playbook filter on chapter 2 shows 3 cards for `understand` and 23 for `all`, no horizontal scroll at 390px, no console errors.

- [ ] **Step 8: Commit**

```bash
git add site/01-setup.html site/02-zed-mode.html site/03-understand.html site/04-design.html site/05-build.html
git commit -m "Write guide chapters 1-5: setup through build"
```

---

### Task 4: Chapters 6–10

**Files:**
- Modify (replace stubs): `site/06-verify-ship.html`, `site/07-unattended.html`, `site/08-principles.html`, `site/09-make-it-yours.html`, `site/10-recipes.html`

**Interfaces:**
- Consumes: page skeleton, CSS classes, and renderers from Task 2. Does not edit `site/assets/*`; report any needed catalog change instead.
- Produces: five finished chapter pages.

Same writing rules as Task 3. Every chapter ends with the `<h2>In this chapter</h2>` block except chapter 10, which has no catalog entries and ends with its pitfalls list.

- [ ] **Step 1: Write `06-verify-ship.html`**

Sources: `skills/verification-before-completion/SKILL.md`, `skills/benchmark-checklist/SKILL.md`, `skills/requesting-code-review/SKILL.md`, `skills/receiving-code-review/SKILL.md`, `skills/finishing-a-development-branch/SKILL.md`, playbooks `opening-a-pr.md`, `babysit.md`, `shipping.md`, `skills/zed-mode/references/review-bot-triage.md`.

Sections:
1. Lede: done means checked on the surface people use, with the output in hand.
2. `<h2>Evidence before claims</h2>`: what verification-before-completion requires; "inconclusive" or the wrong surface is not a pass.
3. `<h2>Numbers need an explanation</h2>`:

```text
<pre><code>/text2prod:zed-mode did the cache change make startup faster? measure ten runs before and after and explain the number before you report it.</code></pre>
```

4. `<h2>Review in both directions</h2>`: requesting review against requirements; receiving review by checking each point on its merits; bot comments go through review-bot-triage.
5. `<h2>From branch to merged</h2>`: finishing-a-development-branch asks before merging; opening-a-pr closes every playbook; babysit drives a PR to merge-ready and never merges; shipping lands a verified green stack:

```text
<pre><code>/text2prod:zed-mode check on PR 42 and get it green. don't force-push.</code></pre>
```

6. `<h2>In this chapter</h2>` block.

- [ ] **Step 2: Write `07-unattended.html`**

Sources: `skills/zed-mode/SKILL.md` (Autonomy), `skills/show-me-your-work/SKILL.md`, playbooks `autonomous-run.md`, `orchestrate.md`, `autopilot-full.md`, `autopilot-stack.md`, `session-pickup.md`, `pause-safely.md`, `worktree-cleanup.md`, `skills/zed-mode/references/feature-artifacts.md` (ledger and briefs).

Sections:
1. Lede: trust comes before loops; give a checkable exit condition and say where to stop.
2. `<h2>What a grant covers</h2>`: reversible work proceeds; irreversible writes always pause (force-push to shared branches, deploys, data deletion, messages to customers); skill gates (design approval, merge approval) still stop. Diagram:

```text
<pre class="mermaid">
flowchart TD
  A["Next action"] --> R{"Reversible?"}
  R -->|Yes| K{"A skill gate? Design or merge approval"}
  R -->|No: force-push, deploy, data deletion, customer message| P["Pause for your OK"]
  K -->|Yes| P
  K -->|No| G["Proceed and log the decision"]
</pre>
```

3. `<h2>An overnight prompt</h2>`:

```text
<pre><code>/text2prod:zed-mode going to bed. finish the remaining plan tasks, log each decision, and stop before anything irreversible.</code></pre>
```

   What "going to bed", "run until done", and "don't stop" mean to the router.
4. `<h2>Read the decision log</h2>`: what show-me-your-work records, one row per decision as it lands.
5. `<h2>Programs of many PRs</h2>`: orchestrate (a coordinator, `ledger.tsv` and `briefs/` in the feature folder, resumable in a fresh session); autopilot-full (independent PRs to merged) versus autopilot-stack (one verified stack you land).
6. `<h2>Pick up, pause, clean up</h2>`: session-pickup, pause-safely, worktree-cleanup (audit first, delete only what you confirm).
7. `<h2>In this chapter</h2>` block.

- [ ] **Step 3: Write `08-principles.html`**

Sources: `skills/principles/SKILL.md` (index and Citation rule), and the reference file of each principle quoted in a prompt below.

Sections:
1. Lede: 24 short names that change what the agent does next when you say them mid-task.
2. `<h2>How a name steers</h2>`: the citation rule (the agent names each principle that changed a decision and the choice it changed), and three example prompts:

```text
<pre><code>that guard hides the bug. apply Fix Root Causes.</code></pre>
<pre><code>this adds a policy layer nobody asked for. Laziness Protocol.</code></pre>
<pre><code>before you say done: Prove It Works, on the real app.</code></pre>
```

3. `<h2>All 24</h2>`: `<div data-render="principles"></div>`.
4. `<h2>In this chapter</h2>` block.

- [ ] **Step 4: Write `09-make-it-yours.html`**

Sources: `skills/init-project/SKILL.md`, `skills/zed-mode/references/project-structure.md`, `skills/zed-mode/references/feature-artifacts.md` (Template resolution), `skills/writing-skills/SKILL.md`, playbooks `authoring-a-skill.md`, `eval.md`, `docs/testing.md` (evals and `plugin-evals/`).

Sections:
1. Lede: fit Text2Prod to a repo and a team, and test a skill change before it ships.
2. `<h2>Onboard a repository</h2>`:

```text
<pre><code>/text2prod:zed-mode onboard this repo for AI-native work.</code></pre>
```

   What init-project creates and that it never modifies an existing `AGENTS.md`.
3. `<h2>Team templates</h2>`: `spec.md` and `review.md` resolve from `.agents/templates/<name>.md` first, then the bundled template, then the owning skill's format.
4. `<h2>Write or change a skill</h2>`: skills are behavior-shaping code; writing-skills and the authoring-a-skill playbook.
5. `<h2>Test the change before promoting it</h2>`: the eval playbook runs the unedited skill first, then the edit; `plugin-evals/` cases for Text2Prod skills:

```text
<pre><code>/text2prod:zed-mode use the eval playbook to check my edit to the brainstorming skill before I merge it.</code></pre>
```

6. `<h2>In this chapter</h2>` block.

- [ ] **Step 5: Write `10-recipes.html`**

Sources: chapters 1–9 (link each recipe to its chapter).

Sections:
1. Lede: prompts worth copying, then the mistakes most people make once.
2. `<h2>Recipes</h2>`: each recipe is an `<h3>`, the prompt in `<pre><code>`, and one or two sentences on why it works, ending with a link to its chapter:
   1. Restate a noisy report first (ch 3): `/text2prod:zed-mode read this issue thread and restate the real problem in plain words. don't touch code yet.`
   2. Fix a bug with proof (ch 5): `/text2prod:zed-mode the nightly export skips the last page of results. reproduce it first, then fix it. done means the three-page fixture exports every row. show me the counts before and after.`
   3. Ask a read-only question (ch 3): `/text2prod:zed-mode how does a session pick up the bootstrap on OpenCode? read-only. cite file paths for every claim.`
   4. Add a small feature (ch 5): `/text2prod:zed-mode add a --dry-run flag to the bump script. it prints what would change and writes nothing. tests first.`
   5. Prototype before you pick (ch 4): `/text2prod:zed-mode prototype two layouts for the settings page behind a toggle and send me a screenshot of each before we pick.`
   6. Plan a settled design (ch 4): `/text2prod:zed-mode turn the approved spec into a plan of small tasks, each with its own test.`
   7. Review a branch skeptically (ch 4): `/text2prod:zed-mode interrogate this branch. read-only. report only real bugs or behavior regressions.`
   8. Get a PR green (ch 6): `/text2prod:zed-mode check on PR 42 and get it green. don't force-push.`
   9. Vet a number (ch 6): `/text2prod:zed-mode did the cache change make startup faster? measure ten runs before and after and explain the number before you report it.`
   10. Run overnight (ch 7): `/text2prod:zed-mode going to bed. finish the remaining plan tasks, log each decision, and stop before anything irreversible.`
3. `<h2>Pitfalls</h2>`: each an `<h3>` plus two or three sentences:
   1. Listing skills instead of stating the goal: the router picks skills from the goal; a list overrides its judgment.
   2. A done check that cannot fail: "make it better" gives the agent nothing to verify.
   3. Leading with your theory of the cause: it narrows the search to where you pointed.
   4. Treating one approval as approval for everything after it: each stage needs its own yes.
   5. Accepting "should work": ask for the command output, the screenshot, or the number.
   6. Granting autonomy without a stop line: name the exit condition and what must pause.

- [ ] **Step 6: Run the gate**

Run: `scripts/check-guide-site.sh`
Expected: `guide site OK`.

- [ ] **Step 7: Check the five pages on the real surface**

Same procedure as Task 2 Step 9 for each page; on chapter 8, assert five group headings and 24 principle cards; on chapter 10, assert ten recipe prompts with Copy buttons and that the pager shows no Next link.

- [ ] **Step 8: Commit**

```bash
git add site/06-verify-ship.html site/07-unattended.html site/08-principles.html site/09-make-it-yours.html site/10-recipes.html
git commit -m "Write guide chapters 6-10: verification through recipes"
```

---

### Task 5: Deploy workflow and docs

**Files:**
- Create: `.github/workflows/pages.yml`
- Modify: `ARCHITECTURE.md` (Layout model table), `docs/engineering/infrastructure.md` (new section after Distribution), `docs/testing.md` (Plugin tests list), `README.md` (after the "New here?" line)

**Interfaces:**
- Consumes: `scripts/check-guide-site.sh`, `tests/guide-site/test-check-guide-site.sh`, the finished `site/`.
- Produces: a workflow that checks on PRs and pushes, and deploys `site/` on push to `main` or manual dispatch.

- [ ] **Step 1: Confirm current action majors**

Run: `for a in checkout configure-pages upload-pages-artifact deploy-pages; do printf '%s ' $a; gh api repos/actions/$a/releases/latest --jq .tag_name; done`
Expected: a tag per action. Use each tag's major (`vN`) in Step 2. The YAML below assumes `checkout@v5`, `configure-pages@v5`, `upload-pages-artifact@v4`, `deploy-pages@v4`; change only the major numbers if the output differs.

- [ ] **Step 2: Write `.github/workflows/pages.yml`**

```yaml
name: Guide site

on:
  push:
    branches: [main]
    paths:
      - "site/**"
      - "skills/**"
      - "scripts/check-guide-site.sh"
      - "tests/guide-site/**"
      - ".github/workflows/pages.yml"
  pull_request:
    paths:
      - "site/**"
      - "skills/**"
      - "scripts/check-guide-site.sh"
      - "tests/guide-site/**"
      - ".github/workflows/pages.yml"
  workflow_dispatch:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Test the gate
        run: tests/guide-site/test-check-guide-site.sh
      - name: Check the site
        run: scripts/check-guide-site.sh

  deploy:
    if: github.event_name != 'pull_request'
    needs: check
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    concurrency:
      group: pages
      cancel-in-progress: false
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v5
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: site
      - id: deployment
        uses: actions/deploy-pages@v4
```

The `pull_request` trigger runs only the `check` job, so the gate is proven on the PR before anything deploys.

- [ ] **Step 3: Update `ARCHITECTURE.md`**

Add two rows to the Layout model table, after the `tests/` row:

```markdown
| `site/` | The public guide at https://phuongddx.github.io/text2prod/. Hand-written HTML, CSS, and JS; nav and lists come from `site/assets/catalog.js`. Not packaged into the plugin. |
| `.github/workflows/` | CI. `pages.yml` runs `scripts/check-guide-site.sh` and deploys `site/` to GitHub Pages. |
```

- [ ] **Step 4: Update `docs/engineering/infrastructure.md`**

Insert after the Distribution section, before Release:

```markdown
## Guide site

The guide at https://phuongddx.github.io/text2prod/ is static files in
`site/`, with no build step. `.github/workflows/pages.yml` runs
`tests/guide-site/test-check-guide-site.sh` and
`scripts/check-guide-site.sh` on pull requests and pushes that touch
`site/`, `skills/`, or the gate, then deploys `site/` to GitHub Pages on
push to `main` or manual dispatch. The Pages source is set to GitHub
Actions. The gate fails on banned names, catalog entries that disagree
with `skills/`, broken local links, and unpinned CDN URLs, so a release
that adds or renames a playbook, skill, or principle needs a matching
`site/assets/catalog.js` edit.
```

- [ ] **Step 5: Update `docs/testing.md`**

In the Plugin tests list, after the `tests/feature-artifacts/` bullet, add:

```markdown
- `tests/guide-site/` — the guide site's pre-deploy gate (`test-check-guide-site.sh` exercises `scripts/check-guide-site.sh` on fixtures).
```

- [ ] **Step 6: Update `README.md`**

After the line beginning `New here? Read the [getting-started guide]`, add a blank line and:

```markdown
Prefer a visual tour? The [Text2Prod guide](https://phuongddx.github.io/text2prod/) walks through routing, every playbook, and the principles, with diagrams and prompts to copy.
```

- [ ] **Step 7: Verify locally**

Run: `tests/guide-site/test-check-guide-site.sh && scripts/check-guide-site.sh && scripts/lint-shell.sh scripts/check-guide-site.sh tests/guide-site/test-check-guide-site.sh && tests/claude-code/test-playbooks.sh`
Expected: all pass. `test-playbooks.sh` guards that no playbook file changed by accident.

If `actionlint` is installed, also run `actionlint .github/workflows/pages.yml`; otherwise note it in the report.

- [ ] **Step 8: Commit**

```bash
git add .github/workflows/pages.yml ARCHITECTURE.md docs/engineering/infrastructure.md docs/testing.md README.md
git commit -m "Deploy the guide site to GitHub Pages behind the gate"
```

---

## After Task 5 (controller, not a delegate)

1. Full local surface pass: every page at 1280px and 390px, light and dark, per Task 2 Step 9.
2. Run the `opening-a-pr` playbook: push `feature/guide-site`, open the PR to `main`, and confirm the `check` job passes on the PR.
3. Ask the owner before enabling Pages: `gh api -X POST repos/phuongddx/text2prod/pages -f build_type=workflow`. Merge only with the owner's approval (`finishing-a-development-branch`).
4. After merge: watch the `Guide site` run (`gh run watch`), then check every page URL under `https://phuongddx.github.io/text2prod/` returns 200 and one diagram renders in a real browser.
5. Write `docs/features/guide-site/review.md` and set the spec to `Status: shipped`.
