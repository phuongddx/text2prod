# `init-project` Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** New `init-project` skill — explicit onboarding: whole-codebase research first, then repo-specific `AGENTS.md` (when missing) + AI-native starter structure.

**Architecture:** One new self-contained skill directory; reuses plugin templates via relative path with inline fallback; no bootstrap/hook/manifest changes (packaging auto-discovers skills). One new static test.

**Tech Stack:** Markdown skill, Bash static test, existing packaging tests.

**Spec:** `plans/260922-2005-init-project-skill/SPEC.md`

## Global Constraints

- Touch ONLY: `skills/init-project/**`, `tests/init-project/**`, this plan dir.
- Do NOT edit: bootstrap (`using-text2prod`), hook, manifests, `.*-plugin/`, existing templates.
- Never modify existing `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` (rule lives inside the skill).
- No commits/pushes without explicit user authorization — final task is the diff gate.
- Behavioral evals: repo bar for new skills; owner waiver required to ship without them (same decision point as previous change).

---

### Task 1: The skill

**Files:**
- Create: `skills/init-project/SKILL.md`

**Interfaces:**
- Consumes: `../using-text2prod/templates/intent.md`, `../using-text2prod/templates/review.md` (plugin-relative).
- Produces: skill named `init-project` whose frontmatter/description Task 2 asserts on.

- [ ] **Step 1: Create `skills/init-project/SKILL.md` with this exact content**

````markdown
---
name: init-project
description: Use when the user asks to onboard, initialize, or set up a project for AI-native development - explores the whole codebase first, generates a repository-specific root AGENTS.md when missing, and creates the AI-native starter structure. Never modifies an existing AGENTS.md.
---

# Init Project

Explicit onboarding for an existing or new repository. The request itself
is consent. Work in phases; never write before Phase 2.

## Phase 0 — Gates (read-only)

1. If `<repo-root>/AGENTS.md` exists: mark the AGENTS phase **SKIP**. Do not
   read it as input, modify it, or overwrite it. Report it as unchanged.
2. If `.agents/` OR `ARCHITECTURE.md` exists: enter **gap-fill mode** —
   create only missing pieces, never duplicate or restructure existing ones.

## Phase 1 — Whole-codebase research (read-only)

Use four parallel read-only research agents when delegation is available;
otherwise run the same four passes inline. Each agent inspects only its
area, cites exact paths and commands, and writes nothing.

| # | Area | Find |
| --- | --- | --- |
| 1 | Core source | Purpose, architecture, modules, data flow, recurring patterns |
| 2 | Tests | Frameworks, commands, naming conventions, fixtures, expectations |
| 3 | Configs & build | Package/runtime manager, build/lint/format/run commands, constraints |
| 4 | Scripts, docs & git | Local helpers, contributor docs, entry points, commit/PR conventions |

Rules:
- Resolve contradictions using current source/config evidence.
- Never invent commands. If something is absent, note it as absent.

## Phase 2 — Generate (missing pieces only)

### `AGENTS.md` — only if Phase 0 did not mark SKIP

- Title: `# Repository Guidelines`.
- 200–400 words where practical; repository-specific, concise.
- Preserve applicable headings; omit only ones that genuinely do not apply:
  Project Overview · Architecture & Data Flow · Key Directories ·
  Development Commands · Code Conventions & Common Patterns ·
  Important Files · Runtime/Tooling Preferences · Testing & QA ·
  Commit & Pull Request Guidelines.
- State `Not configured` only where useful; never substitute assumptions.

### `ARCHITECTURE.md`

Thin "what the system is" derived from the same findings: layout model
table, pointers into docs — never restates content.

### Starter structure

```text
.agents/skills/.gitkeep
.agents/policies/.gitkeep
.agents/hooks/.gitkeep
.agents/templates/intent.md    # copy from ../using-text2prod/templates/
.agents/templates/review.md    # copy from ../using-text2prod/templates/
docs/features/.gitkeep
```

If the plugin templates are unreachable, draft minimal equivalents inline.

## Phase 3 — Report

Present a table: **created / skipped / pre-existing** for every target path.
Recommend committing the structure as its own commit before feature work.

## Hard rules

- Never modify an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- Never create `src/` or `tests/`.
- Never re-run research after Phase 1 within the same invocation.
- Empty/new repository: generate honest stubs; say what is `Not configured`.

## Failure handling

- No delegation available → inline four passes.
- Template copy fails → inline draft, note the fallback in the report.
- Write failure → report exactly what failed; do not silently retry.
````

- [ ] **Step 2: Static sanity check**

Run: `head -4 skills/init-project/SKILL.md && grep -c 'Phase 0\|Phase 1\|Phase 2\|Phase 3' skills/init-project/SKILL.md`
Expected: frontmatter intact; `grep -c '^## Phase'` returns 4 (loose grep may return more due to cross-references).

---

### Task 2: Static test

**Files:**
- Create: `tests/init-project/test-skill-static.sh`

**Interfaces:**
- Consumes: skill from Task 1.

- [ ] **Step 1: Create the test with this exact content**

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SKILL="$REPO_ROOT/skills/init-project/SKILL.md"

FAILURES=0
check() {
    if grep -q "$2" "$SKILL"; then
        echo "  [PASS] $1"
    else
        echo "  [FAIL] $1"
        FAILURES=$((FAILURES + 1))
    fi
}

[ -f "$SKILL" ] || { echo "  [FAIL] SKILL.md exists"; exit 1; }
check "frontmatter name"            '^name: init-project$'
check "description triggers"        'onboard, initialize, or set up'
check "AGENTS.md safety gate"       'Never modifies an existing AGENTS.md'
check "phase gates present"         'Phase 0 — Gates'
check "research phase present"      'Phase 1 — Whole-codebase research'
check "four research areas"         'Core source'
check "generation phase present"    'Phase 2 — Generate'
check "report phase present"        'Phase 3 — Report'
check "guide title rule"            '# Repository Guidelines'
check "template source path"        '\.\./using-text2prod/templates/'
check "inline fallback rule"        'draft minimal equivalents inline'
check "never modify rule"           'Never modify an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`'
check "no src/tests creation rule"  'Never create `src/` or `tests/`'

if [[ "$FAILURES" -gt 0 ]]; then
    exit 1
fi
echo "init-project static skill test: all checks passed"
```

- [ ] **Step 2: Run it**

Run: `bash tests/init-project/test-skill-static.sh`
Expected: all `[PASS]`, exit 0.

---

### Task 3: Regression suites + scope

- [ ] **Step 1: Run existing suites**

Run: `bash tests/init-project/test-skill-static.sh && bash tests/hooks/test-session-start.sh && bash tests/codex/test-package-codex-plugin.sh`
Expected: all green (packaging test auto-discovers the new skill and requires per-skill metadata generation — it must pass unchanged).

- [ ] **Step 2: Scope check**

Run: `git status --porcelain`
Expected: only `skills/init-project/`, `tests/init-project/`, this plan dir, plus pre-existing unrelated WIP (`plans/260920-*`).

---

### Task 4: Behavioral eval gate

- [ ] **Step 1:** Check eval infra (`evals/` + `ANTHROPIC_API_KEY`). If unavailable → present blocker; ship only with explicit owner waiver (fork-only), recorded in ledger and commit message.

---

### Task 5: Diff gate + ship (on authorization)

- [ ] **Step 1:** Present full diff + suite results + eval/waiver status; get explicit authorization.
- [ ] **Step 2 (only after authorization):** commit on `main`, push, refresh Claude Code marketplace+install and Codex plugin cache (reinstall if version pin blocks refresh), verify installed copies contain `init-project`.

## Self-Review (completed)

- Spec coverage: skill → T1; unit test → T2; packaging/regression → T3; eval gate → T4; ship → T5; all spec rules embedded in T1 content. ✔
- Placeholder scan: none. ✔
- Consistency: template path `../using-text2prod/templates/` and skill name identical across tasks. ✔
