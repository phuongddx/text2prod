# Spec-only Feature Artifacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use text2prod:subagent-driven-development (recommended) or text2prod:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `intent.md` from Text2Prod's feature-mode artifact chain so `spec.md` (with new `## Problem` and `## Constraints` sections) is the only design artifact.

**Architecture:** Edits to markdown skill files, templates, and docs, guarded by the existing grep-based static tests in `tests/feature-artifacts/` plus two new `claude plugin eval` cases. Evals are written and run first against the unchanged v0.0.2 skills (red), then re-run after the skill edits (green).

**Tech Stack:** Markdown, bash (`tests/feature-artifacts/lib.sh` helpers `check` / `check_absent` / `finish`), `claude plugin eval`, `scripts/bump-version.sh`.

**Spec:** `docs/features/spec-only-artifacts/spec.md` (same folder). Read it before starting any task.

## Global Constraints

- Zero dependencies.
- Skill content edits follow `skills/writing-skills` and need eval evidence (red against v0.0.2, green after).
- The two `spec.md` template copies stay byte-identical: `skills/using-text2prod/templates/spec.md` and `.agents/templates/spec.md`.
- No change to `brainstorming`'s trigger description, its three paths, or its approval gates.
- Never edit `CLAUDE.md`, `AGENTS.md`, or `GEMINI.md`. (`CLAUDE.md` has the user's uncommitted edits — never stage it.)
- Do not touch history: `docs/features/link-skills-to-project-structure/**`, `plans/**`, `docs/text2prod/**`.
- Shell scripts follow `shfmt -i 2` style and must pass `scripts/lint-shell.sh`.
- Eval runs always pass `--no-publish` (results stay local).
- Stage files explicitly by path; never `git add -A` / `git commit -a`.

---

### Task 1: Eval cases and v0.0.2 baseline (red)

**Files:**
- Create: `plugin-evals/spec-only-feature-mode/prompt.md`
- Create: `plugin-evals/spec-only-feature-mode/graders/skill-fired.md`
- Create: `plugin-evals/spec-only-feature-mode/graders/no-intent-file.md`
- Create: `plugin-evals/spec-only-feature-mode/graders/understanding-in-chat.md`
- Create: `plugin-evals/spec-has-problem-section/prompt.md`
- Create: `plugin-evals/spec-has-problem-section/graders/no-intent-file.md`
- Create: `plugin-evals/spec-has-problem-section/graders/spec-sections.md`
- Results: `plugin-evals/results/<timestamp>/` (generated)

**Interfaces:**
- Consumes: nothing. Must run BEFORE Tasks 2–3 change any skill file.
- Produces: case names `spec-only-feature-mode` and `spec-has-problem-section`, re-run in Task 5.

Why the prompts create `docs/features/.gitkeep`: brainstorming detects feature mode by `docs/features/` existing at the repo root, and the eval sandbox starts empty. `scaffold_script` exists only in `case.yaml` and needs `--scaffold`; asking the agent to create the folder keeps the case in the repo's existing `prompt.md` format.

- [ ] **Step 1: Write `plugin-evals/spec-only-feature-mode/prompt.md`**

```markdown
---
description: Architectural brainstorming in feature mode must not write intent.md; the understanding note goes to chat.
tags: [artifact, process]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

This repo uses Text2Prod feature mode. Before anything else, create the empty file `docs/features/.gitkeep`.

Then: I want to add a plugin system to our Node.js CLI `mycli` so partner teams can register new subcommands without forking it. Plugins load from `~/.mycli/plugins/`. Constraints: Node 20, no new dependencies, a broken plugin must never crash the core CLI. Let's design it.
```

- [ ] **Step 2: Write the three graders for `spec-only-feature-mode`**

`plugin-evals/spec-only-feature-mode/graders/skill-fired.md`:

```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?brainstorming"'
---
```

`plugin-evals/spec-only-feature-mode/graders/no-intent-file.md`:

```markdown
---
type: tool_used
tool: Write
input_match: '"file_path"\s*:\s*"[^"]*intent\.md"'
min: 0
max: 0
arm: both
---
```

`plugin-evals/spec-only-feature-mode/graders/understanding-in-chat.md`:

```markdown
---
type: llm
---

PASS if the final reply, in chat, restates the user's goal and at least one of their constraints (Node 20, no new dependencies, broken plugins must not crash the CLI) and invites correction or asks a clarifying question, and no implementation code for the plugin system was written.
FAIL if the reply delivers implementation code, or gives no restatement of the goal or constraints in chat.
```

- [ ] **Step 3: Write `plugin-evals/spec-has-problem-section/prompt.md`**

```markdown
---
description: Writing an approved spec in feature mode produces spec.md with Problem and Constraints, and no intent.md.
tags: [artifact]
max_turns: 25
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

This repo uses Text2Prod feature mode. Before anything else, create the empty file `docs/features/.gitkeep`.

We finished brainstorming and I approved every design section. Write the spec file now — do not write a plan or code.

Feature: `export` command for our `todo` CLI (Node.js, no dependencies).
- Problem: users cannot move their todos into other tools; they copy items by hand.
- Goal: `todo export --format json|csv` prints all items to stdout.
- Constraints: Node 20, no new dependencies, output must round-trip through `todo import`.
- Design: reuse the existing store reader in `src/store.js`; CSV columns `id,text,done`; JSON is the raw store array.
- Error handling: an unknown `--format` prints an error and exits 1.
- Testing: `node:test` cases for both formats and the error path.
```

- [ ] **Step 4: Write the two graders for `spec-has-problem-section`**

`plugin-evals/spec-has-problem-section/graders/no-intent-file.md`:

```markdown
---
type: tool_used
tool: Write
input_match: '"file_path"\s*:\s*"[^"]*intent\.md"'
min: 0
max: 0
arm: both
---
```

`plugin-evals/spec-has-problem-section/graders/spec-sections.md`:

```markdown
---
type: tool_used
tool: Write
input_match: '"file_path"\s*:\s*"[^"]*docs/features/[^"]+/spec\.md"[\s\S]*## Problem[\s\S]*## Constraints'
---
```

- [ ] **Step 5: Run the new cases against the unchanged v0.0.2 skills**

Run (from the repo root; `git diff --quiet -- skills .agents` must succeed first, proving skills are still v0.0.2):

```bash
git diff --quiet -- skills .agents && claude plugin eval . --eval-dir plugin-evals --case 'spec-*' --no-publish --threshold 0
```

Expected: completes and writes `plugin-evals/results/<timestamp>/aggregate-result.json`. With-plugin arm: `no-intent-file` fails in at least one run of `spec-only-feature-mode` and `spec-sections` fails in `spec-has-problem-section` (the v0.0.2 template has no `## Problem`). Record the per-grader with-plugin pass rates.

If `spec-only-feature-mode`'s `no-intent-file` does NOT fail on v0.0.2 (the agent asked a question before reaching the intent step), record that honestly — the static tests and `spec-has-problem-section` remain the red evidence. Do not tune the prompt to force a failure.

- [ ] **Step 6: Commit cases and baseline results**

```bash
git add plugin-evals/spec-only-feature-mode plugin-evals/spec-has-problem-section plugin-evals/results
git commit -m "Add spec-only artifact eval cases with v0.0.2 baseline"
```

Put the recorded baseline pass rates in the commit body.

---

### Task 2: Artifact contract, spec template, and init copy lists

**Files:**
- Modify: `skills/using-text2prod/references/feature-artifacts.md` (lines 12, 20, 33, 49, 70)
- Modify: `skills/using-text2prod/templates/spec.md` (full rewrite below)
- Modify: `.agents/templates/spec.md` (identical copy)
- Delete: `skills/using-text2prod/templates/intent.md`, `.agents/templates/intent.md`
- Modify: `skills/using-text2prod/references/project-structure.md:30`, `skills/init-project/SKILL.md:72`
- Test: `tests/feature-artifacts/test-contract.sh`, `tests/feature-artifacts/test-structure.sh`
- Create test: `tests/feature-artifacts/test-spec-only.sh`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: template section headings `## Problem` and `## Constraints` (Task 3's brainstorming text names them); `test-spec-only.sh` guard (Task 3 relies on it to catch `intent.md` left in `brainstorming`).

- [ ] **Step 1: Add failing checks to `tests/feature-artifacts/test-contract.sh`**

Insert before the line `finish "feature-artifacts contract"`:

```bash
check        "template: problem section"     "$T" '## Problem'
check        "template: constraints section" "$T" '## Constraints'
check_absent "template: no intent link"      "$T" 'Intent:'
check_absent "contract: no intent.md"        "$C" 'intent.md'
check        "contract: matching spec read"  "$C" '`docs/features/<slug>/spec.md`, in full, if a matching feature exists'
```

- [ ] **Step 2: Add a failing check to `tests/feature-artifacts/test-structure.sh`**

Inside the `for f in "$I" "$P"; do … done` loop, after the `spec template` line, add:

```bash
  check_absent "$n: no intent template" "$f" '.agents/templates/intent.md'
```

- [ ] **Step 3: Create `tests/feature-artifacts/test-spec-only.sh`**

```bash
#!/usr/bin/env bash
# Guard: spec.md is the only design artifact. intent.md must not return to
# skills or templates, and the two spec template copies must stay identical.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

hits=$(grep -rlF 'intent.md' "$REPO_ROOT/skills" || true)
if [ -n "$hits" ]; then
  echo "  [FAIL] skills mention intent.md:"
  printf '    %s\n' "$hits"
  FAILURES=$((FAILURES + 1))
else
  echo "  [PASS] no skill mentions intent.md"
fi

for f in skills/using-text2prod/templates/intent.md .agents/templates/intent.md; do
  if [ -e "$REPO_ROOT/$f" ]; then
    echo "  [FAIL] $f still exists"
    FAILURES=$((FAILURES + 1))
  else
    echo "  [PASS] $f removed"
  fi
done

if cmp -s "$REPO_ROOT/skills/using-text2prod/templates/spec.md" "$REPO_ROOT/.agents/templates/spec.md"; then
  echo "  [PASS] spec template copies identical"
else
  echo "  [FAIL] spec template copies differ"
  FAILURES=$((FAILURES + 1))
fi

finish "spec-only artifacts"
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `bash tests/feature-artifacts/test-contract.sh; bash tests/feature-artifacts/test-structure.sh; bash tests/feature-artifacts/test-spec-only.sh`
Expected: each ends with `FAILED`. Failing checks include `template: problem section`, `contract: no intent.md`, `init-project/SKILL.md: no intent template`, `no skill mentions intent.md`, and both `… removed` lines. (`spec template copies identical` already passes — fine.)

- [ ] **Step 5: Edit `skills/using-text2prod/references/feature-artifacts.md`**

Make exactly these five replacements:

| Old line | New line |
| --- | --- |
| `  - No `intent.md` or `review.md` files are written.` | `  - No `review.md` files are written.` |
| `├── intent.md   originator; brainstorming drafts it when absent` | *(delete the line)* |
| ``For `intent.md`, `spec.md`, and `review.md`, use the first that exists:`` | ``For `spec.md` and `review.md`, use the first that exists:`` |
| ``5. `docs/features/<slug>/intent.md`, if a matching feature exists`` | ``5. `docs/features/<slug>/spec.md`, in full, if a matching feature exists`` |
| ``| Architectural change | Edit `intent.md`, `spec.md`, `plan.md`, `review.md` in place. |`` | ``| Architectural change | Edit `spec.md`, `plan.md`, `review.md` in place. |`` |

- [ ] **Step 6: Rewrite `skills/using-text2prod/templates/spec.md`**

Full new content:

```markdown
# Spec: <feature title>

Status: draft <!-- draft | approved | shipped | superseded -->
Date: YYYY-MM-DD

## Problem

What cannot be done today, who is affected (users, systems / repos), and
what it costs them. No design here.

## Context read

Files the design was checked against (from the research read order), and
gaps found.

- 

Gaps:
- 

## References

External sources consulted, each with the decision it informed. Write
"None — designed from the repo only" when research was skipped.

- 

## Goals

## Non-goals

## Constraints

Hard limits: policy, security, performance, compatibility, scope.

## Design

## Error handling

## Testing
```

Note: the `- ` bullet lines under Context read, Gaps, and References end with a trailing space, exactly as in the current template.

- [ ] **Step 7: Copy the template and delete both intent templates**

```bash
cp skills/using-text2prod/templates/spec.md .agents/templates/spec.md
git rm skills/using-text2prod/templates/intent.md .agents/templates/intent.md
```

- [ ] **Step 8: Remove the intent copy line from both structure lists**

In `skills/using-text2prod/references/project-structure.md`, delete the line:

```text
.agents/templates/intent.md    # copy from this skill's templates/
```

In `skills/init-project/SKILL.md`, delete the line:

```text
.agents/templates/intent.md    # copy from ../using-text2prod/templates/
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `bash tests/feature-artifacts/test-contract.sh && bash tests/feature-artifacts/test-structure.sh`
Expected: `feature-artifacts contract: all checks passed` and `project structure wiring: all checks passed`.

Run: `bash tests/feature-artifacts/test-spec-only.sh`
Expected: still `FAILED (1)` — only `no skill mentions intent.md`, listing `skills/brainstorming/SKILL.md`. Task 3 fixes it. Any other failure is a bug in this task.

- [ ] **Step 10: Lint and commit**

```bash
scripts/lint-shell.sh tests/feature-artifacts/test-spec-only.sh tests/feature-artifacts/test-contract.sh tests/feature-artifacts/test-structure.sh
git add skills/using-text2prod/references/feature-artifacts.md skills/using-text2prod/templates/spec.md .agents/templates/spec.md skills/using-text2prod/references/project-structure.md skills/init-project/SKILL.md tests/feature-artifacts/test-contract.sh tests/feature-artifacts/test-structure.sh tests/feature-artifacts/test-spec-only.sh
git commit -m "Drop intent.md from the artifact contract and spec template"
```

(The two `git rm` deletions from Step 7 are already staged.)

---

### Task 3: Brainstorming writes the why into spec.md

**Files:**
- Modify: `skills/brainstorming/SKILL.md` (lines 89–92, 230, 303, 316)
- Test: `tests/feature-artifacts/test-brainstorming.sh` (lines 17, 39, 40)

**Interfaces:**
- Consumes: template headings `## Problem` / `## Constraints` and `test-spec-only.sh` from Task 2.
- Produces: final skill text that Task 5's evals exercise.

Before editing, read `skills/writing-skills/SKILL.md` — this task edits a skill.

- [ ] **Step 1: Update `tests/feature-artifacts/test-brainstorming.sh`**

Replace line 17:

```bash
check        "intent drafted in feature mode" "$B" 'save it as `docs/features/<slug>/intent.md`'
```

with:

```bash
check_absent "no intent file in feature mode" "$B" 'intent.md'
check        "spec problem from note"     "$B" 'fill **Problem** and **Constraints** from the agreed understanding note'
check        "template missing sections"  "$B" 'If the resolved template has no **Problem** or **Constraints** section, add them.'
check        "self-review checks problem" "$B" '**Problem** and **Constraints** match the understanding note your human partner corrected'
```

Delete the line (originally line 39; line numbers shift after the replacement above):

```bash
check        "intent only on architectural" "$B" 'On the architectural path in feature mode, when the feature has no'
```

Replace the line (originally line 40):

```bash
check        "bounded never creates intent" "$B" 'Bounded and spike work never'
```

with:

```bash
check        "bounded never creates folder" "$B" 'Bounded and spike work never creates a new feature folder.'
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bash tests/feature-artifacts/test-brainstorming.sh`
Expected: `brainstorming wiring: FAILED (5)` — the five new/changed checks above.

- [ ] **Step 3: Edit the upgrade sentence (`skills/brainstorming/SKILL.md:89-92`)**

Old:

```text
first complete the heavier path's earlier steps you skipped: post the
full context note (Constraints, Related features, Gaps, Code evidence),
write `intent.md` in feature mode, and offer external research — then
continue.
```

New:

```text
first complete the heavier path's earlier steps you skipped: post the
full context note (Constraints, Related features, Gaps, Code evidence)
and offer external research — then continue.
```

- [ ] **Step 4: Replace the intent paragraph (`skills/brainstorming/SKILL.md:230`)**

Old (one line):

```text
On the architectural path in feature mode, when the feature has no `intent.md`, write your "Write back your understanding" note from the intent template (see Template resolution) and save it as `docs/features/<slug>/intent.md`. Your human partner corrects it; the corrected file is the design brief. Bounded and spike work never creates `intent.md` or a new feature folder.
```

New:

```text
Bounded and spike work never creates a new feature folder.
```

- [ ] **Step 5: Edit the Documentation bullet (`skills/brainstorming/SKILL.md:303`)**

Old:

```text
  - Feature mode: `docs/features/<slug>/spec.md`, from the spec template; fill **Context read** and **References**. For an existing feature, edit its `spec.md` in place.
```

New:

```text
  - Feature mode: `docs/features/<slug>/spec.md`, from the spec template; fill **Problem** and **Constraints** from the agreed understanding note, plus **Context read** and **References**. If the resolved template has no **Problem** or **Constraints** section, add them. For an existing feature, edit its `spec.md` in place.
```

- [ ] **Step 6: Edit the self-review Context check (`skills/brainstorming/SKILL.md:316`)**

Old:

```text
5. **Context check:** (feature mode) Are **Context read** and **References** filled, and does every constraint from the context note appear in the design or in Non-goals?
```

New:

```text
5. **Context check:** (feature mode) Are **Context read** and **References** filled, do **Problem** and **Constraints** match the understanding note your human partner corrected, and does every constraint from the context note appear in the design or in Non-goals?
```

- [ ] **Step 7: Run the feature-artifacts suite**

Run: `bash tests/feature-artifacts/run-all.sh`
Expected: every script ends `all checks passed`; exit code 0. In particular `test-spec-only.sh` now passes `no skill mentions intent.md`.

Also confirm the trigger description is untouched:

Run: `git diff HEAD -- skills/brainstorming/SKILL.md | grep -c '^[-+]description:'`
Expected: `0`

- [ ] **Step 8: Commit**

```bash
git add skills/brainstorming/SKILL.md tests/feature-artifacts/test-brainstorming.sh
git commit -m "Brainstorming writes the understanding note into spec.md Problem and Constraints"
```

---

### Task 4: Docs describe the spec-only chain

**Files:**
- Modify: `README.md:41-56`
- Modify: `docs/feature-workflow.md:7,21`
- Modify: `ARCHITECTURE.md:18`

**Interfaces:**
- Consumes: final behavior from Tasks 2–3.
- Produces: nothing later tasks use.

- [ ] **Step 1: Confirm the stale references (expected to be found)**

Run: `grep -n 'intent\.md' README.md docs/feature-workflow.md ARCHITECTURE.md`
Expected: 6 hits — `README.md` lines 44, 51, 56; `docs/feature-workflow.md` lines 7, 21; `ARCHITECTURE.md` line 18.

- [ ] **Step 2: Edit `README.md`**

Old line 41:

```text
stage reads, and the loop closes when production findings become new intent.
```

New (two lines):

```text
stage reads, and the loop closes when production findings become a new or
updated spec. Text2Prod folds the playbook's separate intent document into the
`## Problem` section of `spec.md`.
```

Old diagram (lines 44–46):

```text
intent.md → spec.md → plan.md → implementation → review.md → deploy
     ↑                                                          │
     └──────────── production findings restart the loop ────────┘
```

New diagram (exactly these three lines; `↑`/`└` sit at column 4, `│`/`┘` at column 53):

```text
spec.md → plan.md → implementation → review.md → deploy
   ↑                                                │
   └───── production findings restart the loop ─────┘
```

Old Plan row:

```text
| Plan | `brainstorming` — interrogates intent, produces the design (`intent.md` → `spec.md`) |
```

New:

```text
| Plan | `brainstorming` — interrogates intent, produces the design (`spec.md`) |
```

Old Maintain row:

```text
| Maintain | findings and incidents written back as new `intent.md` — the loop restarts |
```

New:

```text
| Maintain | findings and incidents written back as a new or updated `spec.md` — the loop restarts |
```

- [ ] **Step 3: Edit `docs/feature-workflow.md`**

Line 7, old: `intent.md → spec.md → plan.md → implementation → review.md → merge`
New: `spec.md → plan.md → implementation → review.md → merge`

Delete the table row (line 21):

```text
| `intent.md` | Originator; `brainstorming` drafts it when absent |
```

- [ ] **Step 4: Edit `ARCHITECTURE.md:18`**

Old: ``| `docs/features/<slug>/` | Per-feature artifact chain: `intent.md → spec.md → plan.md → review.md`. See [feature workflow](docs/feature-workflow.md). |``
New: ``| `docs/features/<slug>/` | Per-feature artifact chain: `spec.md → plan.md → review.md`. See [feature workflow](docs/feature-workflow.md). |``

- [ ] **Step 5: Verify**

Run: `grep -n 'intent\.md' README.md docs/feature-workflow.md ARCHITECTURE.md`
Expected: no output (exit 1).

Run: `python3 -c "import sys; l=open('README.md').read().split('\n'); i=[n for n,x in enumerate(l) if x.startswith('spec.md → plan.md')][0]; print(l[i+1].index('│')+1, l[i+2].index('┘')+1, l[i+1].index('↑')+1, l[i+2].index('└')+1)"`
Expected: `53 53 4 4`

- [ ] **Step 6: Commit**

```bash
git add README.md docs/feature-workflow.md ARCHITECTURE.md
git commit -m "Describe the spec-only artifact chain in README and docs"
```

---

### Task 5: Green evals, regression, and v0.0.3

**Files:**
- Modify (via script): `package.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Results: `plugin-evals/results/<timestamp>/` (generated)

**Interfaces:**
- Consumes: case names from Task 1; skill text from Tasks 2–3.
- Produces: the evidence quoted in the PR description.

- [ ] **Step 1: Re-run the new cases on the changed skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case 'spec-*' --no-publish --threshold 0`
Expected: with-plugin arm passes `no-intent-file` in every run of both cases and `spec-sections` in at least 2 of 3 runs. Compare against the Task 1 baseline and record both.

If `spec-sections` passes fewer than 2 of 3 runs, stop and report — do not edit graders or prompts to make them pass; the skill text is what needs changing, and that requires returning to the spec.

- [ ] **Step 2: Regression on existing cases**

Run: `claude plugin eval . --eval-dir plugin-evals --case 'brainstorm-before-building' --case 'plan-from-spec' --no-publish --threshold 0`
Expected: with-plugin scores no lower than the most recent committed results for these cases (find them with `grep -l '"brainstorm-before-building"\|"plan-from-spec"' plugin-evals/results/*/aggregate-result.json`). If `--case` does not accept repeats, run the two cases as two commands.

- [ ] **Step 3: Full static suite and lint**

Run: `bash tests/feature-artifacts/run-all.sh && scripts/lint-shell.sh`
Expected: all `all checks passed`; lint exit 0.

- [ ] **Step 4: Bump the version**

Run: `scripts/bump-version.sh 0.0.3 && scripts/bump-version.sh --check && scripts/bump-version.sh --audit`
Expected: `--check` prints `All declared files are in sync at 0.0.3`; `--audit` reports no undeclared `0.0.2` strings outside excluded paths (eval results under `plugin-evals/results/` mention `0.0.2` as run metadata — if the audit flags them, record that in the PR; do not edit result files).

- [ ] **Step 5: Commit the release**

Leave the spec at `Status: approved`; `finishing-a-development-branch` sets `shipped` at merge.

```bash
git add plugin-evals/results package.json .claude-plugin/plugin.json .codex-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "Release v0.0.3: spec.md is the only design artifact"
```

Commit body: Task 1 baseline vs Task 5 pass rates per grader, regression scores, and the manual follow-up for the human: `CLAUDE.md` and `AGENTS.md` still say `intent.md → spec.md → …` (never edited by skills).
