# Bootstrap Project-Structure Offer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `using-text2prod` offers (once, never blocking) to generate the minimal AI-native starter structure when feature work starts in a repo that lacks it.

**Architecture:** Three layers — a ~4-line trigger section in `SKILL.md` (always-on), full rules in `references/project-structure.md` (on-invoke), and two copyable templates in `templates/` (on-accept). No hook, manifest, or packaging changes.

**Tech Stack:** Markdown skill content, Bash test extension, optional Python drill evals (`evals/`, real LLM sessions).

**Spec:** `plans/260922-1340-bootstrap-project-structure-offer/SPEC.md`

## Global Constraints

- Do NOT edit `hooks/session-start`, any manifest, or any `.*-plugin/` config.
- Do NOT modify tuned content in `SKILL.md` (Red Flags table, rationalization lists, SUBAGENT-STOP, EXTREMELY-IMPORTANT block) — insertion of one new section only, zero existing lines changed.
- Never modify existing `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` in host projects (rule text enforces this).
- No commits/pushes without explicit user authorization — final task presents the diff.
- Skill-behavior change ships only with eval evidence; if eval infra is unavailable (no `evals/` clone or no API key), STOP after unit tests and report the blocker.

---

### Task 1: Rules reference

**Files:**
- Create: `skills/using-text2prod/references/project-structure.md`

**Interfaces:**
- Produces: `references/project-structure.md` — the file Task 3's SKILL.md section points at; path string must match exactly.

- [ ] **Step 1: Create the file with this exact content**

````markdown
# Project structure

When the human starts **feature work** (build/change something) in a repo
that lacks the AI-native structure, offer — once — to create the starter
set. Never offer for questions, read-only tasks, or debugging.

## Marker check

The structure exists if `.agents/` OR `ARCHITECTURE.md` is present at the
repo root. If either exists, proceed normally — no offer.

## The offer

One sentence, then continue:

> Want me to set up the AI-native project structure first? Creates ~7
> files (`ARCHITECTURE.md`, `.agents/` starter, `docs/features/`). Say no
> and I'll skip it.

- Ask **once per task**. A decline is final for that task.
- **Never block**: start `brainstorming` regardless of the answer.

## On accept — create missing pieces only

```text
ARCHITECTURE.md                # thin: what the system is; pointers, never prose
.agents/skills/.gitkeep
.agents/policies/.gitkeep
.agents/hooks/.gitkeep
.agents/templates/intent.md    # copy from this skill's templates/
.agents/templates/review.md    # copy from this skill's templates/
docs/features/.gitkeep
```

- Draft `ARCHITECTURE.md` by reading the repo; keep it under one page.
- Never create `src/` or `tests/` — the host project owns those.
- If a piece already exists, leave it untouched and fill only the gaps.

## Growth rule

`workflows/`, `agents/`, and `adapters/` are NOT created now. Add them
only when a second team or harness actually needs them.

## Never-touch rules

- Never modify an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- If one exists, you may offer — as a separate yes/no — a one-line pointer
  append. "No" is final.

## Failure handling

- `templates/` missing in this package: draft minimal equivalents inline.
- Write failure (permissions, read-only FS): report it and continue the
  actual task.
````

- [ ] **Step 2: Verify no placeholder text**

Run: `grep -n 'TBD\|TODO' skills/using-text2prod/references/project-structure.md || echo clean`
Expected: `clean`

---

### Task 2: Distributable templates

**Files:**
- Create: `skills/using-text2prod/templates/intent.md`
- Create: `skills/using-text2prod/templates/review.md`

**Interfaces:**
- Produces: the two files Task 1's reference names (paths must match exactly).

- [ ] **Step 1: Create `templates/intent.md` with this exact content**

````markdown
# Intent: <one-line summary>

Author: <name>
Status: draft <!-- draft | accepted | rejected -->
Date: YYYY-MM-DD

## Problem

What cannot be done today, who is affected, and what it costs them.

## Proposed outcome

What "better" looks like once this ships. One paragraph, no design.

## Affected users and systems

- Users:
- Systems / repos:

## Constraints

Hard limits: policy, security, performance, compatibility, scope.

## Open questions

Questions that must be answered before or during design.
````

- [ ] **Step 2: Create `templates/review.md` with this exact content**

````markdown
# Review: <change slug>

Reviewer: <name>
Date: YYYY-MM-DD
Plan under review: `plan.md` in this directory

## Passes

Run each pass and tag every finding with its pass:

- **Bugs** — logic errors, broken edge cases, subtle regressions.
- **Security** — injection risks, auth gaps, secrets/PII exposure.
- **Compliance** — the diff matches the plan and repo conventions.

## Severity rule

**Important** = would break behavior, leak data, or breach policy.
Style and naming are nits.

## Nit cap

Report at most 5 nits; summarize the rest as a count.

## Do not report

- Generated files.
- Anything CI already enforces.

## Findings

| # | Severity | Pass | Location | Note |
| --- | --- | --- | --- | --- |
| 1 | | | | |

## Verdict

<!-- approve | request changes --> Reasoning in one or two sentences.
````

- [ ] **Step 3: Verify both files exist and are non-trivial**

Run: `wc -l skills/using-text2prod/templates/*.md`
Expected: both ≥ 20 lines.

---

### Task 3: Bootstrap trigger section

**Files:**
- Modify: `skills/using-text2prod/SKILL.md` — insert one new section after the `## Skill Priority` block (immediately before `## Red Flags`); change zero existing lines.

**Interfaces:**
- Consumes: `references/project-structure.md` and `templates/` from Tasks 1–2.
- Produces: the injected hook payload gains this section (Task 4 asserts on it).

- [ ] **Step 1: Insert this exact section**

```markdown
## Project Structure

Before starting feature work in a repository, check whether it has the
AI-native structure (`.agents/` or `ARCHITECTURE.md` at the repo root). If
it does not, read `references/project-structure.md` and follow it: offer
once to create the starter structure, never block the task on the answer,
and never modify existing root instruction files (`AGENTS.md`,
`CLAUDE.md`, `GEMINI.md`).
```

- [ ] **Step 2: Verify insertion is purely additive**

Run: `git diff --stat skills/using-text2prod/SKILL.md && git diff -U0 skills/using-text2prod/SKILL.md | grep '^-' | grep -v '^---' || echo 'no deletions'`
Expected: `1 file changed, 8 insertions(+)` (or similar); then `no deletions`.

---

### Task 4: Hook test extension

**Files:**
- Modify: `tests/hooks/test-session-start.sh` — add one assertion after the existing "legacy-warning-removed" block.

**Interfaces:**
- Consumes: updated `SKILL.md` from Task 3.

- [ ] **Step 1: Add this exact block** (before the final `if [[ "$FAILURES" -gt 0 ]]`)

```bash
structure_home="$(make_home structure-section-injected)"
assert_command_output \
    "SessionStart injects project-structure pointer" \
    "nested" \
    "references/project-structure.md"$'\037'"Project Structure" \
    "" \
    "$structure_home" \
    CLAUDE_PLUGIN_ROOT="$REPO_ROOT" \
    bash "$HOOK_UNDER_TEST"
```

- [ ] **Step 2: Run the hook test suite**

Run: `bash tests/hooks/test-session-start.sh`
Expected: all `[PASS]`, zero `[FAIL]`, exit 0.

---

### Task 5: Full unit suite + scope check

**Files:**
- Read-only verification.

- [ ] **Step 1: Run related plugin tests**

Run: `bash tests/hooks/test-session-start.sh && ls tests/codex tests/claude-code 2>/dev/null`
Expected: hook suite green; note which other suites exist for the harness you can test.

- [ ] **Step 2: Scope check**

Run: `git status --porcelain`
Expected: only `skills/using-text2prod/{SKILL.md,references/project-structure.md,templates/}`, `tests/hooks/test-session-start.sh`, and this plan dir (+ any pre-existing unrelated WIP, unchanged).

---

### Task 6: Behavioral eval evidence (gate for shipping)

**Files:**
- Create: `evals/` clone (gitignored if the repo ignores it; check `.gitignore`)
- Create: eval scenario + report under this plan dir: `plans/260922-1340-bootstrap-project-structure-offer/eval-report.md`

**Interfaces:**
- Consumes: implemented change from Tasks 1–4.

- [ ] **Step 1: Set up eval harness**

Run: `ls evals/README.md 2>/dev/null || git clone https://github.com/prime-radiant-inc/text2prod-evals evals`
Then: `cd evals && uv sync --extra dev`
Requires: `ANTHROPIC_API_KEY`. If missing → STOP and report; do not ship the skill change without evidence.

- [ ] **Step 2: Baseline run (acceptance regression, pre-change)**

Temporarily stash the change (`git stash push -- skills tests`), run the existing acceptance scenario per `evals/README.md` (todo-list style), record result in eval-report, then `git stash pop`.

- [ ] **Step 3: After run — two scenarios**

Author minimal scenarios per harness format (see existing `evals/scenarios/*.yaml`):
1. `project-structure-offer-once`: bare repo + "let's build X" → expect: exactly one offer, task proceeds to brainstorming either way.
2. `no-offer-quick-question`: bare repo + "what does this file do?" → expect: no offer.

Run both (`uv run drill run <scenario> -b claude`), record outputs.

- [ ] **Step 4: Manual adversarial checks (document in eval-report)**

Real session, verify and record: decline respected (no second offer, task continues); existing `AGENTS.md` untouched; partial structure filled not duplicated.

- [ ] **Step 5: Write `eval-report.md`**

Sections: baseline result, after results (both scenarios), adversarial checks, verdict GO/NO-GO for PR.

---

### Task 7: Diff gate

- [ ] **Step 1: Present full diff + eval summary to user; request explicit commit authorization.** Do not commit or push otherwise.

## Self-Review (completed)

- Spec coverage: 3 layers → Tasks 1–3; hook test → Task 4; evals → Task 6; error handling + never-touch rules live inside Task 1's reference text. ✔
- Placeholder scan: none. ✔
- Path consistency: `references/project-structure.md`, `templates/intent.md`, `templates/review.md` identical across tasks. ✔
