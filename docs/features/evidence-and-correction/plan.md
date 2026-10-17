# Evidence-graded review and structural correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use text2prod:subagent-driven-development (recommended) or text2prod:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Text2Prod's reports a shared evidence scale, a review pass that looks past the diff, a durable Decisions table, repro-first and premise-testing rules in debugging, and a skill that turns repeated corrections into enforced fixes.

**Architecture:** Skill-text edits in place, one new shared reference (`evidence-levels.md`) that three skills point at, and one new skill. Every behavior change is gated by a `plugin-evals/` suite that must fail on the current skills before the edit lands, plus bash static tests that pin the wiring. One PR (#11), commits grouped by area.

**Tech Stack:** Markdown skills, bash static tests (`tests/feature-artifacts/lib.sh` assertions), `claude plugin eval` suites (`prompt.md` + `graders/*.md`). No runtime dependencies.

**Spec:** `spec.md` (same folder)

**Delivery:** one pull request (#11, branch `feat/evidence-review`, worktree `.claude/worktrees/feat-evidence-review`), all tasks on that branch in order. Opened as a draft; the human partner marks it ready after reading the full diff.

## Global Constraints

- Zero runtime dependencies (`CONTRIBUTING.md`).
- Skill content edits go through `writing-skills`; each PR cites eval evidence. An idea whose new eval already passes on the current skills is dropped from its PR and the drop is recorded in `review.md`.
- One PR (#11) carries all three areas by the human partner's decision. Each area's evals are written and run on the unedited skills first.
- Skill descriptions start "Use when", list triggering conditions only, under 500 characters.
- No harness-only tool names in skill text (Claude Code, Codex, OpenCode must read it the same).
- `skills/using-text2prod/templates/review.md` and `.agents/templates/review.md` stay byte-identical.
- Reviewer subagents never approve and never spawn subagents.
- Skills never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- Shell: `#!/usr/bin/env bash`, `set -euo pipefail`, `shfmt -i 2`; lint with `scripts/lint-shell.sh`.
- Commits: imperative subject, one concern, `Co-Authored-By: Claude <noreply@anthropic.com>` trailer.
- Eval run command (no manifest `experimental.evals`, so pass the dir): `claude plugin eval . --eval-dir plugin-evals --case <name> --allow-tools Write Edit Bash`. Results land in `plugin-evals/results/<timestamp>/aggregate-result.json` (gitignored); copy the per-grader pass/fail lines into the PR body.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `skills/using-text2prod/references/evidence-levels.md` | Create. The five-level table and minimum levels. Single source. |
| `skills/verification-before-completion/SKILL.md` | Modify lines 33, 40-48, 50-60. Point at the reference; add Level column and red flag. |
| `skills/using-text2prod/templates/review.md` | Modify lines 7-13 (Impact pass), add `## Decisions` before `## Verdict`. |
| `.agents/templates/review.md` | Byte-identical copy of the above. |
| `skills/requesting-code-review/code-reviewer.md` | Modify lines 46-80 (Impact block in What to Check), 93-122 (Impact section in Output Format). |
| `skills/finishing-a-development-branch/SKILL.md` | Modify lines 34-37 (copy rulings into Decisions). |
| `skills/systematic-debugging/SKILL.md` | Modify lines 172-177 (repro-first bullet), insert new step after 196, line 226 red flag. |
| `skills/correcting-repeated-mistakes/SKILL.md` | Create. Technique skill, ~120 lines. |
| `skills/writing-skills/SKILL.md` | Modify after line 475: one-line pointer. |
| `README.md` | Modify lines 168-170: new skill row under Debugging. |
| `tests/feature-artifacts/test-evidence-levels.sh` | Create. Reference exists, three readers point at it. |
| `tests/feature-artifacts/test-review-template.sh` | Create. Parity, Impact pass, Decisions, finishing sentence, reviewer block. |
| `tests/systematic-debugging/test-phase4-wiring.sh` | Create. Repro-first bullet, premise step, red flag. |
| `tests/feature-artifacts/test-correcting-skill.sh` | Create. Frontmatter rules, never-touch files, propose-not-apply. |
| `plugin-evals/<seven cases>/` | Create. One `prompt.md` + `graders/` per spec Testing row. |

---

# PR 1: `feat/evidence-review` (spec sections 1 and 2) (area, same PR #11)

Work on branch `feat/evidence-review` in `.claude/worktrees/feat-evidence-review` (PR #11).

### Task 1: Eval `verification-states-level` (must fail today)

**Files:**
- Create: `plugin-evals/verification-states-level/prompt.md`
- Create: `plugin-evals/verification-states-level/graders/states-level.md`
- Create: `plugin-evals/verification-states-level/graders/skill-fired.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the `L4` token convention (`L<n>` in the same sentence as the claim) that Task 4's reference defines. Grader regex is `\bL4\b`.

- [ ] **Step 1: Write the prompt**

````markdown
---
description: A completion claim should state its evidence level alongside the proof.
tags: [process]
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

I implemented `clamp(n, lo, hi)` in `clamp.js` and ran the suite. Here is the full output. Is this done? Give me your completion statement.

```
$ node --test
▶ clamp
  ✔ returns n inside range (0.4ms)
  ✔ returns lo below range (0.2ms)
  ✔ returns hi above range (0.2ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
$ echo $?
0
```
````

- [ ] **Step 2: Write the graders**

`graders/states-level.md`:

```markdown
---
type: regex
pattern: '\bL4\b'
target: last_message
---
```

`graders/skill-fired.md`:

```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?verification-before-completion"'
---
```

- [ ] **Step 3: Run against the current skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case verification-states-level`
Expected: `states-level` FAIL on all runs (no `L4` in today's output). `skill-fired` may pass. If `states-level` passes, stop: record "idea 1 dropped, eval passes on current skills" in the PR notes and skip Task 4's verification edit.

- [ ] **Step 4: Commit**

```bash
git add plugin-evals/verification-states-level
git commit -m "Add verification-states-level eval

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 2: Eval `review-impact-pass` (must fail today)

**Files:**
- Create: `plugin-evals/review-impact-pass/prompt.md`
- Create: `plugin-evals/review-impact-pass/graders/safety-fact.md`
- Create: `plugin-evals/review-impact-pass/graders/unshown-reader.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the literal heading `Safety fact` that Task 6's reviewer block uses.

- [ ] **Step 1: Write the prompt**

````markdown
---
description: A code review should name the fact the change is safe because of and look for readers outside the diff.
tags: [process]
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

Review this change before I merge it. The repo is a small Node CLI; `config.json` is read by `src/load-config.js` (shown) and by `scripts/release.sh` (not shown, it greps the key by name).

```diff
--- a/config.json
+++ b/config.json
-  "releaseChannel": "stable",
+  "channel": "stable",
--- a/src/load-config.js
+++ b/src/load-config.js
-  return cfg.releaseChannel;
+  return cfg.channel;
```

Tests pass. Write the review.
````

- [ ] **Step 2: Write the graders**

`graders/safety-fact.md`:

```markdown
---
type: regex
pattern: 'Safety fact'
target: last_message
---
```

`graders/unshown-reader.md`:

```markdown
---
type: llm
---

PASS if the review names `scripts/release.sh` (or "the release script") as a reader of the renamed key that the diff does not update, or states that it searched for other readers of `releaseChannel` beyond the diff.
FAIL if the review only discusses the two files in the diff.
```

- [ ] **Step 3: Run against the current skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case review-impact-pass`
Expected: `safety-fact` FAIL. If it passes, record "idea 2 dropped" and skip Task 6.

- [ ] **Step 4: Commit**

```bash
git add plugin-evals/review-impact-pass
git commit -m "Add review-impact-pass eval

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 3: Eval `finishing-writes-decisions` (must fail today)

**Files:**
- Create: `plugin-evals/finishing-writes-decisions/prompt.md`
- Create: `plugin-evals/finishing-writes-decisions/graders/decisions-written.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the heading `## Decisions` and ruling text that Task 5's template and finishing edit must produce.

- [ ] **Step 1: Write the prompt**

```markdown
---
description: Closing a feature folder should copy the plan ledger's rulings into review.md.
tags: [artifact]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

This repo uses Text2Prod feature mode. Before anything else, create `docs/features/csv-export/spec.md` containing `# Spec: CSV export` and `Status: approved`, and `docs/features/csv-export/plan.md` containing `# CSV export plan`.

The branch implementing that plan is done and tests are green (12/12, exit 0). The code review found no Critical or Important issues. The plan ledger holds two rulings:

```
Ruling: kept the quoting helper inline instead of a new module (one caller). Cost if wrong: a second caller duplicates it.
Ruling: used `\n` line endings, not `\r\n`, since the only consumer is our own importer. Cost if wrong: Excel on Windows shows one line.
```

Close out the feature folder. Do not merge or open a PR, just write the close-out artifacts.
```

- [ ] **Step 2: Write the grader**

`graders/decisions-written.md`:

```markdown
---
type: tool_used
tool: Write
input_match: '"file_path"\s*:\s*"[^"]*docs/features/csv-export/review\.md"[\s\S]*## Decisions[\s\S]*quoting helper[\s\S]*line endings'
---
```

- [ ] **Step 3: Run against the current skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case finishing-writes-decisions`
Expected: `decisions-written` FAIL (today's template has no `## Decisions`). If it passes, record "idea 6 dropped" and skip the Decisions parts of Task 5.

- [ ] **Step 4: Commit**

```bash
git add plugin-evals/finishing-writes-decisions
git commit -m "Add finishing-writes-decisions eval

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 4: Evidence levels reference and verification edit

**Files:**
- Create: `skills/using-text2prod/references/evidence-levels.md`
- Modify: `skills/verification-before-completion/SKILL.md:33,40-48,52`
- Test: `tests/feature-artifacts/test-evidence-levels.sh`

**Interfaces:**
- Consumes: nothing.
- Produces: path `skills/using-text2prod/references/evidence-levels.md`; token form `L<n>`; the phrase "state the claim with its level". Tasks 5 and 6 add their own checks to this test file.

- [ ] **Step 1: Write the failing static test**

`tests/feature-artifacts/test-evidence-levels.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

REF="$REPO_ROOT/skills/using-text2prod/references/evidence-levels.md"
V="$REPO_ROOT/skills/verification-before-completion/SKILL.md"

check "reference exists"            "$REF" '# Evidence levels'
check "five levels: asserted"       "$REF" '| 1 | Asserted |'
check "five levels: reproduced"     "$REF" '| 5 | Reproduced |'
check "claim carries level"         "$REF" 'A claim names its level in the same sentence'
check "L1/L2 never close findings"  "$REF" 'L1 and L2 never close a Critical or Important finding'

check "verification points at ref"  "$V" '../using-text2prod/references/evidence-levels.md'
check "gate states level"           "$V" 'ONLY THEN: Make the claim, with its level'
check "table has Level column"      "$V" '| Claim | Requires | Level | Not Sufficient |'
check "red flag on low level"       "$V" 'A Level 1 or 2 statement closing a finding'

finish "evidence-levels wiring"
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bash tests/feature-artifacts/test-evidence-levels.sh`
Expected: 9 `[FAIL]` lines, exit 1.

- [ ] **Step 3: Create the reference**

`skills/using-text2prod/references/evidence-levels.md`:

```markdown
# Evidence levels

How strong is the evidence behind a claim? Skills that make or review
claims point here instead of restating the scale.

| Level | Name | What it means |
| --- | --- | --- |
| 1 | Asserted | "It's fine." Counts for nothing. |
| 2 | Cited | A real `file:line`, or the library's own source. |
| 3 | Traced | The failure path walked step by step and shown not to reach. |
| 4 | Executed | A script or test that calls the real code and fails loud when wrong. |
| 5 | Reproduced | Seen in the running system: app, CLI, or harness. |

## Rules

- A claim names its level in the same sentence, as `L<n>`:
  "tests pass (L4: 34/34, exit 0)".
- Minimum levels:

  | Claim | Minimum |
  | --- | --- |
  | Tests pass, build succeeds, linter clean | L4 |
  | Bug fixed | L4 with red-green verified, or L5 |
  | Safety fact in a review | L3; L4 when a script is cheap |
  | Nothing else depends on this | L3 |

- L1 and L2 never close a Critical or Important finding.
- Below the minimum, write the level you reached and `unproven`.
```

- [ ] **Step 4: Edit verification-before-completion**

Line 33, replace `5. ONLY THEN: Make the claim` with:

```
5. ONLY THEN: Make the claim, with its level
   (see ../using-text2prod/references/evidence-levels.md)
```

Lines 40-48, replace the Common Failures table with:

```markdown
| Claim | Requires | Level | Not Sufficient |
|-------|----------|-------|----------------|
| Tests pass | Test command output: 0 failures | L4 | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | L4 | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | L4 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | L4 red-green, or L5 | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | L4 | Test passes once |
| Agent completed | VCS diff shows changes | L2 + L4 for its tests | Agent reports "success" |
| Requirements met | Line-by-line checklist | L2 per line | Tests passing |

Levels are defined in `../using-text2prod/references/evidence-levels.md`.
```

After line 52 (`- Using "should", "probably", "seems to"`) add:

```markdown
- A Level 1 or 2 statement closing a finding
```

- [ ] **Step 5: Run the static test and the full suite**

Run: `bash tests/feature-artifacts/test-evidence-levels.sh && bash tests/feature-artifacts/run-all.sh`
Expected: all `[PASS]`, exit 0.

- [ ] **Step 6: Lint and commit**

```bash
scripts/lint-shell.sh tests/feature-artifacts/test-evidence-levels.sh
git add skills/using-text2prod/references/evidence-levels.md skills/verification-before-completion/SKILL.md tests/feature-artifacts/test-evidence-levels.sh
git commit -m "Add evidence levels reference and grade verification claims

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 5: Review template Impact pass, Decisions table, finishing edit

**Files:**
- Modify: `skills/using-text2prod/templates/review.md:7-13,35`
- Modify: `.agents/templates/review.md` (identical)
- Modify: `skills/finishing-a-development-branch/SKILL.md:34-37`
- Test: `tests/feature-artifacts/test-review-template.sh`

**Interfaces:**
- Consumes: `evidence-levels.md` path from Task 4.
- Produces: pass name `Impact`; heading `## Decisions` with columns `Decision | Why | Evidence | Cost if wrong`; finishing sentence "copy every `Ruling:` line".

- [ ] **Step 1: Write the failing static test**

`tests/feature-artifacts/test-review-template.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

T="$REPO_ROOT/skills/using-text2prod/templates/review.md"
A="$REPO_ROOT/.agents/templates/review.md"
F="$REPO_ROOT/skills/finishing-a-development-branch/SKILL.md"

if cmp -s "$T" "$A"; then
  echo "  [PASS] templates identical"
else
  echo "  [FAIL] templates identical"
  FAILURES=$((FAILURES + 1))
fi

check "impact pass listed"     "$T" '- **Impact** —'
check "impact names safety fact" "$T" 'Safety fact'
check "impact points at levels" "$T" 'using-text2prod/references/evidence-levels.md'
check "decisions section"      "$T" '## Decisions'
check "decisions columns"      "$T" '| Decision | Why | Evidence | Cost if wrong |'
check "finishing copies rulings" "$F" 'copy every `Ruling:` line from the plan'
check "finishing none row"     "$F" 'the single row reads `None`'

finish "review template wiring"
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bash tests/feature-artifacts/test-review-template.sh`
Expected: "templates identical" PASS, the other 7 FAIL, exit 1.

- [ ] **Step 3: Edit the skill template**

In `skills/using-text2prod/templates/review.md`, after line 13 (`- **Compliance** — …`) add:

```markdown
- **Impact** — what the change could break outside the diff. Fill the
  block below; levels per Text2Prod's
  `using-text2prod/references/evidence-levels.md` (no relative link: this
  template is copied into other repos).

  | Field | Content |
  | --- | --- |
  | Safety fact | The one fact the change is safe because of, one sentence. |
  | Level | Level reached, proof pasted or pointed at. Below L3: `unproven`, and the finding is Important. |
  | Beyond the diff | Config, manifests, wire or file formats, other harnesses, scripts and tests that read the changed thing. One line each: path, then `clear` or the finding. A search that finds nothing is recorded. |
  | Cheapest pre-merge check | The one command or script that would catch the real breakage. |
```

Before `## Verdict` (line 35) insert:

```markdown
## Decisions

Rulings agents made on the human partner's behalf, copied from the plan
ledger in order. With none, one row: `None`.

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| | | | |

```

- [ ] **Step 4: Mirror to `.agents/templates/review.md`**

```bash
cp skills/using-text2prod/templates/review.md .agents/templates/review.md
```

- [ ] **Step 5: Edit finishing Step 1b**

Replace lines 34-37 of `skills/finishing-a-development-branch/SKILL.md` with:

```markdown
1. Write or update `docs/features/<slug>/review.md` from the review
   template (see Template resolution in the contract). Record the
   findings and verdicts from the code reviews run on this branch,
   including each review's Impact block. Then copy every `Ruling:` line
   from the plan's ledger into `## Decisions`, in order, before the
   workspace is deleted; add decisions made outside a plan by hand, one
   row each; with none, the single row reads `None`. Never write an
   approval yourself — the verdict is the reviewer's assessment;
   merge approval is your human partner's. Tell your human partner the path you wrote.
```

- [ ] **Step 6: Run the static tests**

Run: `bash tests/feature-artifacts/run-all.sh`
Expected: all PASS, including `test-finishing.sh` (its existing `check` strings are preserved above).

- [ ] **Step 7: Lint and commit**

```bash
scripts/lint-shell.sh tests/feature-artifacts/test-review-template.sh
git add skills/using-text2prod/templates/review.md .agents/templates/review.md skills/finishing-a-development-branch/SKILL.md tests/feature-artifacts/test-review-template.sh
git commit -m "Add Impact pass and Decisions table to review.md

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 6: Impact block in the code reviewer prompt

**Files:**
- Modify: `skills/requesting-code-review/code-reviewer.md:54-55,76-80,118`
- Test: `tests/feature-artifacts/test-review-template.sh` (append checks)

**Interfaces:**
- Consumes: `Safety fact` heading (Task 2), `evidence-levels.md` (Task 4).
- Produces: reviewer report section `### Impact`.

- [ ] **Step 1: Append failing checks to the static test**

Before `finish "review template wiring"` in `tests/feature-artifacts/test-review-template.sh` add:

```bash
R="$REPO_ROOT/skills/requesting-code-review/code-reviewer.md"
check "reviewer tags impact pass"   "$R" 'Tag each finding with its pass: Bugs, Security, Compliance, or Impact'
check "reviewer impact block"       "$R" '**Impact (what this could break outside the diff):**'
check "reviewer safety fact"        "$R" 'Safety fact'
check "reviewer points at levels"   "$R" '../using-text2prod/references/evidence-levels.md'
check "reviewer output has impact"  "$R" '### Impact'
```

Run: `bash tests/feature-artifacts/test-review-template.sh`
Expected: the 5 new checks FAIL.

- [ ] **Step 2: Edit the reviewer prompt**

Line 55, replace `- Tag each finding with its pass: Bugs, Security, or Compliance` with:

```
    - Tag each finding with its pass: Bugs, Security, Compliance, or Impact
```

After line 80 (`- No obvious bugs?`) add:

```
    **Impact (what this could break outside the diff):**
    - Safety fact: the one fact this change is safe because of, one sentence
    - Level reached for that fact, per ../using-text2prod/references/evidence-levels.md,
      with the proof. Below L3 write `unproven` and file an Important finding
    - Beyond the diff: config, manifests, wire or file formats, other
      harnesses, scripts and tests that read the changed thing. One line
      each: path, then `clear` or the finding. A search that finds nothing
      is still recorded
    - Cheapest pre-merge check: the one command or script that catches the
      real breakage
```

Before `### Assessment` (line 118) insert:

```
    ### Impact

    **Safety fact:** [one sentence]
    **Level:** [L1-L5 or unproven, with proof]
    **Beyond the diff:** [path — clear | finding, one per line]
    **Cheapest pre-merge check:** [command or script]

```

- [ ] **Step 3: Run the static tests**

Run: `bash tests/feature-artifacts/run-all.sh`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add skills/requesting-code-review/code-reviewer.md tests/feature-artifacts/test-review-template.sh
git commit -m "Add Impact block to the code reviewer prompt

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 7: Prove PR 1 with evals and open it

**Files:**
- None created. Reads `plugin-evals/results/<timestamp>/aggregate-result.json`.

**Interfaces:**
- Consumes: Tasks 1-6.
- Produces: PR 1 URL.

- [ ] **Step 1: Run the three new evals on the edited skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case 'verification-states-level' --allow-tools Write Edit`
Run: `claude plugin eval . --eval-dir plugin-evals --case 'review-impact-pass' --allow-tools Write Edit`
Run: `claude plugin eval . --eval-dir plugin-evals --case 'finishing-writes-decisions' --allow-tools Write Edit`
Expected: every grader PASS on the with-plugin arm. A FAIL means the skill text did not shape behavior: fix the wording via `writing-skills` and rerun. Do not loosen the grader.

- [ ] **Step 2: Rerun the existing seven evals**

Run: `claude plugin eval . --eval-dir plugin-evals --case 'brainstorm-before-building' --allow-tools Write Edit` and the same for `debug-root-cause-first`, `no-overtrigger-on-question`, `plan-from-spec`, `spec-has-problem-section`, `spec-only-feature-mode`, `tdd-test-first`.
Expected: same pass set as before the branch (compare with the latest `plugin-evals/results/` from `main`). Any regression blocks the PR.

- [ ] **Step 3: Run every static suite**

Run: `bash tests/feature-artifacts/run-all.sh && scripts/lint-shell.sh --all`
Expected: exit 0.

- [ ] **Step 4: Open the PR**

```bash
git push -u origin feat/evidence-review
gh pr create --base main --title "Grade evidence and review impact beyond the diff" --body-file /dev/stdin <<'EOF'
(fill every section of .github/PULL_REQUEST_TEMPLATE.md: submitter table,
problem = spec Problem items 1-3, change = Tasks 4-6, core-fit = yes
(general-purpose review/verification), alternatives = spec approaches B
and C, unrelated changes = no (one review/verification surface), existing
PRs = none found, before/after = grader lines from Steps 1-2.)
EOF
```

Report the URL.

---

# PR 2: `feat/debugging-premise-repro` (spec section 3) (area, same PR #11)

Work on branch `feat/evidence-review` in `.claude/worktrees/feat-evidence-review` (PR #11).

### Task 8: Eval `debug-commits-repro-first` (must fail today)

**Files:**
- Create: `plugin-evals/debug-commits-repro-first/prompt.md`
- Create: `plugin-evals/debug-commits-repro-first/graders/repro-before-fix.md`
- Create: `plugin-evals/debug-commits-repro-first/graders/two-commits.md`

**Interfaces:**
- Consumes: nothing.
- Produces: commit subject convention `Reproduce <symptom>` that Task 10 writes into the skill.

- [ ] **Step 1: Write the prompt**

````markdown
---
description: A bug fix should land the failing reproduction as its own commit before the fix commit.
tags: [process]
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash]
---

Set up first: run `git init -q && git commit -q --allow-empty -m init`, then create `cart.js` with the function below and commit it as `Add cart`. There is no test file yet.

```js
export function total(items) {
  return items.reduce((sum, i) => sum + i.price * i.qty);
}
```

Users report that `total([{price:10,qty:1},{price:5,qty:3}])` returns `"[object Object]15"` instead of 25. Fix the bug and commit your work. I'll read the git history to review it. Use Node's built-in `node:test` runner for any tests.
````

- [ ] **Step 2: Write the graders**

`graders/repro-before-fix.md`:

```markdown
---
type: regex
pattern: 'git commit[^\n]*Reproduce[\s\S]*git commit'
target: trace
---
```

`graders/two-commits.md`:

```markdown
---
type: llm
---

PASS if the final reply reports at least two commits made after `Add cart`, where the first contains only a failing test or reproduction (its subject starts with "Reproduce") and a later commit contains the fix (adding an initial value of 0 to reduce).
FAIL if the fix and the reproduction land in one commit, or the fix commit precedes the reproduction commit, or no commits are described.
```

- [ ] **Step 3: Run against the current skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case debug-commits-repro-first --allow-tools Write Edit Bash`
Expected: `repro-before-fix` FAIL. If it passes, record "idea 3 dropped" and skip the repro-first bullet in Task 10.

- [ ] **Step 4: Commit**

```bash
git add plugin-evals/debug-commits-repro-first
git commit -m "Add debug-commits-repro-first eval

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 9: Eval `debug-tests-premise` (must fail today)

**Files:**
- Create: `plugin-evals/debug-tests-premise/prompt.md`
- Create: `plugin-evals/debug-tests-premise/graders/premise-tested.md`
- Create: `plugin-evals/debug-tests-premise/graders/no-third-fix.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the word `premise` that Task 10's step uses as its heading.

- [ ] **Step 1: Write the prompt**

````markdown
---
description: After two failed fixes that share an assumption, the agent should write down and test the assumption before a third fix.
tags: [process]
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

Our nightly job sometimes writes a report with yesterday's date. Two fixes so far, both failed the same nightly check:

1. Changed `new Date()` to `new Date(Date.now())` in `report.js`. Still wrong one night in five.
2. Added `process.env.TZ = 'UTC'` at the top of `report.js`. Still wrong one night in five.

Both assumed the date is computed when the job starts. Here is the only other relevant code, `scheduler.js`:

```js
const when = computeRunDate();        // called once at deploy
cron.schedule('0 2 * * *', () => runReport(when));
```

Give me the next fix to try.
````

- [ ] **Step 2: Write the graders**

`graders/premise-tested.md`:

```markdown
---
type: llm
---

PASS if the reply, before proposing any code change, states the shared assumption of the two failed fixes (the date is computed at run time) in one sentence, points out that `scheduler.js` computes `when` once at deploy and passes the stale value, and proposes an observation or check that confirms this (for example logging `when` at trigger time or asserting it equals today) rather than a third edit on the same assumption.
FAIL if the reply proposes a third date-formatting or timezone fix without first naming and testing the shared assumption.
```

`graders/no-third-fix.md`:

```markdown
---
type: tool_used
tool: Edit
min: 0
max: 0
arm: both
---
```

- [ ] **Step 3: Run against the current skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case debug-tests-premise`
Expected: `premise-tested` FAIL on at least one run (today's skill escalates at three failures, not on a shared premise). If it passes on all runs, record "idea 5 dropped" and skip the premise step in Task 10.

- [ ] **Step 4: Commit**

```bash
git add plugin-evals/debug-tests-premise
git commit -m "Add debug-tests-premise eval

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 10: Phase 4 edits in systematic-debugging

**Files:**
- Modify: `skills/systematic-debugging/SKILL.md:172-177,191-198,226`
- Test: `tests/systematic-debugging/test-phase4-wiring.sh`

**Interfaces:**
- Consumes: `Reproduce <symptom>` (Task 8), `premise` (Task 9).
- Produces: nothing downstream.

- [ ] **Step 1: Write the failing static test**

`tests/systematic-debugging/test-phase4-wiring.sh` (reuses the feature-artifacts assertion library):

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../feature-artifacts/lib.sh
. "$REPO_ROOT/tests/feature-artifacts/lib.sh"

S="$REPO_ROOT/skills/systematic-debugging/SKILL.md"

check "repro committed first"      "$S" 'commit the failing test on its own before writing the fix'
check "repro commit subject"       "$S" '`Reproduce <symptom>`'
check "premise step present"       "$S" '**If 2 Fixes Failed on the Same Premise: Test the Premise**'
check "premise written down"       "$S" 'Write the premise down in one sentence'
check "no third fix"               "$S" 'No third fix before the premise is tested'
check "architecture rule kept"     "$S" '**If 3+ Fixes Failed: Question Architecture**'
check "red flag on shared premise" "$S" 'Two fixes failed on the same assumption, about to try a third'

finish "systematic-debugging phase 4 wiring"
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bash tests/systematic-debugging/test-phase4-wiring.sh`
Expected: 6 FAIL, "architecture rule kept" PASS, exit 1.

- [ ] **Step 3: Edit Phase 4 step 1**

After line 177 (`- Use the text2prod:test-driven-development skill…`) add:

```markdown
   - In a git repo, commit the failing test on its own before writing the fix,
     subject `Reproduce <symptom>`. The fix is the next commit, so history
     shows red then green. A one-off script is committed the same way and
     removed in the fix commit when it does not belong in the repo
```

- [ ] **Step 4: Edit step 4 and insert the premise step**

Replace lines 191-196 with:

```markdown
4. **If Fix Doesn't Work**
   - STOP
   - Count: How many fixes have you tried, and what did they assume?
   - If 2 failed fixes shared one assumption: test the premise (step 5 below)
   - If < 3 and no shared assumption: Return to Phase 1, re-analyze with new information
   - **If ≥ 3: STOP and question the architecture (step 6 below)**
   - DON'T attempt Fix #4 without architectural discussion

5. **If 2 Fixes Failed on the Same Premise: Test the Premise**

   Each failed fix is evidence against the belief it assumed.

   - Write the premise down in one sentence: the thing every failed fix took for granted
   - Find an observation that would come out differently if the premise were false, and make it. Prefer a rerunnable check (a script, a log line) over reading code
   - False: the cause is elsewhere. Return to Phase 1 with the premise crossed off
   - True: ask the next "why" and continue
   - No third fix before the premise is tested
```

Renumber the following `5. **If 3+ Fixes Failed: Question Architecture**` to `6.`.

- [ ] **Step 5: Add the red flag**

After line 226 (`- **"One more fix attempt" (when already tried 2+)**`) add:

```markdown
- **Two fixes failed on the same assumption, about to try a third**
```

- [ ] **Step 6: Run the static test and the debugging suite**

Run: `bash tests/systematic-debugging/test-phase4-wiring.sh && bash tests/systematic-debugging/test-find-polluter.sh`
Expected: all PASS.

- [ ] **Step 7: Lint and commit**

```bash
scripts/lint-shell.sh tests/systematic-debugging/test-phase4-wiring.sh
git add skills/systematic-debugging/SKILL.md tests/systematic-debugging/test-phase4-wiring.sh
git commit -m "Commit the repro first and test a shared premise in debugging

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 11: Prove PR 2 with evals and open it

**Files:**
- None created.

**Interfaces:**
- Consumes: Tasks 8-10.
- Produces: PR 2 URL.

- [ ] **Step 1: Run the two new evals on the edited skill**

Run: `claude plugin eval . --eval-dir plugin-evals --case debug-commits-repro-first --allow-tools Write Edit Bash`
Run: `claude plugin eval . --eval-dir plugin-evals --case debug-tests-premise`
Expected: every grader PASS on the with-plugin arm. A FAIL means fix the wording via `writing-skills`, never the grader.

- [ ] **Step 2: Rerun `debug-root-cause-first` and `no-overtrigger-on-question`**

Run: `claude plugin eval . --eval-dir plugin-evals --case debug-root-cause-first` and `--case no-overtrigger-on-question`.
Expected: same pass set as on `main`.

- [ ] **Step 3: Static suites**

Run: `bash tests/systematic-debugging/test-phase4-wiring.sh && bash tests/feature-artifacts/run-all.sh && scripts/lint-shell.sh --all`
Expected: exit 0.

- [ ] **Step 4: Update PR #11**

No new PR. Ask the human partner before pushing: it publishes to the shared remote. After the yes, `git push` the branch, then edit PR #11's title and body so the Problem, What changes, Alternatives, Unrelated-changes and Evaluation tables and the commit list cover the debugging area. Keep the limits disclosures. Keep the PR a draft.

---

# PR 3: `feat/correcting-repeated-mistakes` (spec section 4) (area, same PR #11)

Work on branch `feat/evidence-review` in `.claude/worktrees/feat-evidence-review` (PR #11).

### Task 12: Evals `correcting-fires-on-repeat` and `correcting-not-on-first` (first must fail today)

**Files:**
- Create: `plugin-evals/correcting-fires-on-repeat/prompt.md`
- Create: `plugin-evals/correcting-fires-on-repeat/graders/skill-fired.md`
- Create: `plugin-evals/correcting-fires-on-repeat/graders/proposes-enforcement.md`
- Create: `plugin-evals/correcting-fires-on-repeat/graders/no-edits.md`
- Create: `plugin-evals/correcting-not-on-first/prompt.md`
- Create: `plugin-evals/correcting-not-on-first/graders/skill-not-fired.md`

**Interfaces:**
- Consumes: nothing.
- Produces: skill name `correcting-repeated-mistakes` that Task 13 creates.

- [ ] **Step 1: Write the repeat prompt**

`plugin-evals/correcting-fires-on-repeat/prompt.md`:

```markdown
---
description: A repeated correction should route to correcting-repeated-mistakes, which proposes enforcement above prose and does not apply it.
tags: [trigger, process]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

This is the second time I've had to say this: stop hand-editing the version number in README.md. Last week you bumped `package.json` to 1.4.0 and left README at 1.3.2; today you did it again with 1.4.1. Our repo has `package.json`, `README.md` (line 3 says `Version: 1.4.0`), `scripts/bump-version.sh` (rewrites package.json only), and a GitHub Actions workflow in `.github/workflows/ci.yml` that runs `npm test`. Make sure this cannot happen again.
```

- [ ] **Step 2: Write the repeat graders**

`graders/skill-fired.md`:

```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?correcting-repeated-mistakes"'
---
```

`graders/proposes-enforcement.md`:

```markdown
---
type: llm
---

PASS if the reply proposes a fix that a machine enforces rather than only a written rule: for example `bump-version.sh` also rewriting README (one source of truth), or a CI/test check that fails when README and package.json versions differ, and asks the user to approve before applying it.
FAIL if the reply only adds a sentence to an instruction file or README, or applies changes without asking.
```

`graders/no-edits.md`:

```markdown
---
type: tool_used
tool: Edit
min: 0
max: 0
arm: both
---
```

- [ ] **Step 3: Write the first-occurrence prompt and grader**

`plugin-evals/correcting-not-on-first/prompt.md`:

```markdown
---
description: A first correction should not fire correcting-repeated-mistakes.
tags: [trigger]
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

Small thing: you left the version in README.md at 1.3.2 when you bumped package.json to 1.4.0. Please fix the README line (line 3, `Version: 1.3.2`).
```

`graders/skill-not-fired.md`:

```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?correcting-repeated-mistakes"'
min: 0
max: 0
arm: both
---
```

- [ ] **Step 4: Run both against the current skills**

Run: `claude plugin eval . --eval-dir plugin-evals --case 'correcting-*'`
Expected: `correcting-fires-on-repeat/skill-fired` FAIL (skill does not exist). `correcting-not-on-first` PASS (nothing to fire). If `proposes-enforcement` already passes on every run, record it; the skill still lands because the trigger gap (`skill-fired`) is the problem being solved.

- [ ] **Step 5: Commit**

```bash
git add plugin-evals/correcting-fires-on-repeat plugin-evals/correcting-not-on-first
git commit -m "Add correcting-repeated-mistakes trigger evals

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 13: The `correcting-repeated-mistakes` skill

**Files:**
- Create: `skills/correcting-repeated-mistakes/SKILL.md`
- Test: `tests/feature-artifacts/test-correcting-skill.sh`

**Interfaces:**
- Consumes: skill name from Task 12.
- Produces: skill name and the `Rule | Enforced by` table convention in `docs/engineering/conventions.md`.

- [ ] **Step 1: Write the failing static test**

`tests/feature-artifacts/test-correcting-skill.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

S="$REPO_ROOT/skills/correcting-repeated-mistakes/SKILL.md"

check "frontmatter name matches dir" "$S" 'name: correcting-repeated-mistakes'
check "description starts Use when"  "$S" 'description: Use when the same correction has come up twice or more'
check "fires at two occurrences"     "$S" 'A class counts once it has happened twice'
check "structure level first"        "$S" '| Structure |'
check "prose level last"             "$S" '| Prose |'
check "propose, don't apply"         "$S" 'Applied only on an explicit yes'
check "rule table location"          "$S" '`docs/engineering/conventions.md`'
check "never-touch files"            "$S" 'Never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`'
check "exception shape"              "$S" 'a reason, an expiry date, and who approved'

desc_len=$(grep -m1 '^description:' "$S" | wc -c | tr -d ' ')
if [ "$desc_len" -lt 500 ]; then
  echo "  [PASS] description under 500 chars ($desc_len)"
else
  echo "  [FAIL] description under 500 chars ($desc_len)"
  FAILURES=$((FAILURES + 1))
fi

finish "correcting-repeated-mistakes wiring"
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bash tests/feature-artifacts/test-correcting-skill.sh`
Expected: all FAIL, exit 1.

- [ ] **Step 3: Write the skill**

`skills/correcting-repeated-mistakes/SKILL.md`:

````markdown
---
name: correcting-repeated-mistakes
description: Use when the same correction has come up twice or more - your human partner repeats a "don't do X" or "we do Y here", a review flags the same class of mistake again, or a revert repeats an earlier one. Use before adding another instruction to an agent rules file.
---

# Correcting Repeated Mistakes

## Overview

The same mistake keeps coming back. Another sentence in an instruction
file will not stop it: nothing fails when an agent skips a sentence.
Change the repo so the next agent cannot make the mistake.

**Core principle:** Fix each mistake class at the highest level that
works. Structure, then types and checks, then tests, then prose.

**Announce at start:** "I'm using the correcting-repeated-mistakes skill
to find what keeps going wrong and propose fixes that enforce themselves."

Assume every contributor is an agent that sees only the files it opened,
copies the nearest example, and takes the shortest path that compiles.

## Step 1: Collect the Evidence

Read, in order, whatever exists:

1. The correction your human partner just gave, in their words.
2. `git log --oneline -50` and any `Revert` commits in it.
3. `docs/features/*/review.md` Findings tables.
4. PR review comments, when `gh` is available:
   `gh pr list --state all --limit 20` then `gh pr view <n> --comments`.
   Without `gh`, say so and skip.
5. Agent instruction files (`AGENTS.md`, `CLAUDE.md`, `.agents/policies/`)
   for rules that already exist and were not followed.
6. Comments in code that explain a workaround.

Group what you find into **mistake classes**.
A class counts once it has happened twice. Each class cites its
occurrences (commit, PR, review line, or the correction itself).

## Step 2: Pick the Highest Level That Works

For each class, walk this table top to bottom and stop at the first level
that makes the mistake impossible or loud:

| Level | Fix shape | Stop here when |
| --- | --- | --- |
| Structure | One owner per piece of state. One supported way to do the task. Delete the old way and dead code an agent would copy. One source of truth instead of hand-synced lists. | The wrong change has no place to be written. |
| Types, lint, CI | A check whose error message names the right file, type, or function to use instead. If the pattern is already common, fail only when a change adds more. | The wrong change cannot pass CI. |
| Tests | A behavior test that fails when the behavior breaks and passes when only internals change. Fix or delete tests that do neither. | The wrong change fails a test a reviewer will run. |
| Prose | A line in `docs/engineering/conventions.md` or a skill. | The rule needs judgment no check can make. |

Write down, per class, the level you picked and why the level above it
did not work.

## Step 3: Propose, Don't Apply

Present one proposal per class:

```
Class: <one line>              Occurrences: <commit/PR/review cites>
Level: <Structure | Types, lint, CI | Tests | Prose>
Why not higher: <one sentence>
Change: <files and the diff or script>
Proof: <the new check fails on <commit> (a real past instance)>
```

Applied only on an explicit yes from your human partner, one proposal at
a time. The same rule as the promotion step in
`text2prod:finishing-a-development-branch`.
Never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.

Prove each applied check: run it against the real past mistake (check out
the offending commit or recreate its diff) and paste the failure. Run the
same command locally and in CI.

## Step 4: Keep the Rule Table

Each kept rule gets a row in `docs/engineering/conventions.md`:

```markdown
| Rule | Enforced by |
| --- | --- |
| README version matches package.json | `scripts/bump-version.sh --check`, run in CI |
```

A rule already in the table whose enforcement column is empty, and whose
mistake recurs, is a repeat: fix it at the next level up in the same
change. Drop a rule once its mistake cannot happen.

## Exceptions

An exception lives on the offending line, with
a reason, an expiry date, and who approved it:

```js
// allowed-until: 2026-12-31, approved by <name>: legacy importer needs CRLF
```

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll just add it to CLAUDE.md" | Nothing fails when an agent skips a sentence. Pick a level a machine enforces first. |
| "A lint rule is overkill for this" | Two occurrences already cost more than the rule. The third is coming. |
| "I'll fix the instance and move on" | Fixing the instance is Step 0. The skill exists for the class. |
| "They said fix it, so I'll apply the check too" | They approved the fix. Each enforcement proposal gets its own yes. |
| "The test passes, so it enforces the rule" | Break the behavior and run it. A test that still passes enforces nothing. |
````

- [ ] **Step 4: Run the static test**

Run: `bash tests/feature-artifacts/test-correcting-skill.sh`
Expected: all PASS.

- [ ] **Step 5: Lint and commit**

```bash
scripts/lint-shell.sh tests/feature-artifacts/test-correcting-skill.sh
git add skills/correcting-repeated-mistakes/SKILL.md tests/feature-artifacts/test-correcting-skill.sh
git commit -m "Add correcting-repeated-mistakes skill

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 14: Wire the skill into README and writing-skills

**Files:**
- Modify: `README.md:169-170`
- Modify: `skills/writing-skills/SKILL.md:475`
- Test: `tests/feature-artifacts/test-correcting-skill.sh` (append checks)

**Interfaces:**
- Consumes: skill name from Task 13.
- Produces: nothing downstream.

- [ ] **Step 1: Append failing checks**

Before `finish` in `tests/feature-artifacts/test-correcting-skill.sh` add:

```bash
check "README lists skill"        "$REPO_ROOT/README.md" '- **correcting-repeated-mistakes** -'
check "writing-skills points here" "$REPO_ROOT/skills/writing-skills/SKILL.md" 'text2prod:correcting-repeated-mistakes'
```

Run: `bash tests/feature-artifacts/test-correcting-skill.sh`
Expected: the 2 new checks FAIL.

- [ ] **Step 2: Edit README**

After line 170 (`- **verification-before-completion** - Ensure it's actually fixed`) add:

```markdown
- **correcting-repeated-mistakes** - Turn a repeated correction into a fix that enforces itself (structure, checks, tests, prose last)
```

- [ ] **Step 3: Edit writing-skills**

After line 475 (`- **Exemption clauses don't scope.** …`) add:

```markdown

For a mistake that recurs outside skills (in code, config, or process),
route it through `text2prod:correcting-repeated-mistakes`, which picks the
enforcement level before any prose is written.
```

- [ ] **Step 4: Run the static tests**

Run: `bash tests/feature-artifacts/run-all.sh`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md skills/writing-skills/SKILL.md tests/feature-artifacts/test-correcting-skill.sh
git commit -m "List correcting-repeated-mistakes in README and writing-skills

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Task 15: Prove PR 3 with evals and open it

**Files:**
- None created.

**Interfaces:**
- Consumes: Tasks 12-14.
- Produces: PR 3 URL and the two follow-ups for the human partner.

- [ ] **Step 1: Run the two new evals**

Run: `claude plugin eval . --eval-dir plugin-evals --case 'correcting-*'`
Expected: `correcting-fires-on-repeat`: all three graders PASS on the with-plugin arm. `correcting-not-on-first`: `skill-not-fired` PASS on both arms. A fire on the first-occurrence prompt means the description over-triggers: tighten the description's conditions via `writing-skills` and rerun.

- [ ] **Step 2: Rerun `no-overtrigger-on-question` and `debug-root-cause-first`**

Run: `claude plugin eval . --eval-dir plugin-evals --case no-overtrigger-on-question` and `--case debug-root-cause-first`.
Expected: same pass set as on `main`. The new skill must not steal either prompt.

- [ ] **Step 3: Static suites**

Run: `bash tests/feature-artifacts/run-all.sh && scripts/lint-shell.sh --all`
Expected: exit 0.

- [ ] **Step 4: Update PR #11**

No new PR. Ask the human partner before pushing: it publishes to the shared remote. After the yes, `git push` the branch, then edit PR #11's title and body so the Problem, What changes, Alternatives, Unrelated-changes and Evaluation tables and the commit list cover the `correcting-repeated-mistakes` area. Keep the limits disclosures. Keep the PR a draft.

- [ ] **Step 5: Report the follow-ups**

Tell the human partner, in the final message: `AGENTS.md` says "15 general-purpose skills" and is now 16; `docs/testing.md` does not mention `plugin-evals/`; the version bump (`scripts/bump-version.sh`) is theirs after the three PRs merge.

## Deviations from this plan (Tasks 1-7, as built)

1. Task 3's run command needs `--allow-tools Write Edit` (the eval cannot pass without Write).
2. Task 5's finishing replacement is rewrapped so each grep-checked phrase sits on one line, and a later fix (commit 655965d) adds a fallback to the "Rulings I made" list because subagent-driven development deletes the ledger before finishing runs, and changes "each review's Impact block" to "the final review's Impact block".
3. Task 2's eval was re-scoped after measuring 0 of 6 (commit cc6d50b): the prompt asks for a code review with Agent allowed, graders are `reviewer-prompt-has-impact` (tool_used Agent), `skill-fired` and `unshown-reader`; the `safety-fact` regex was removed; the grader's `input_match` was later tightened to `Impact \(what this could break outside the diff\)` (655965d).
4. A new eval, `finishing-decisions-after-cleanup`, was added with the fix wave (d7e5de0); it passed before the fix, so it is a regression guard, not evidence for the fix.
5. The reviewer prompt's `Level` field reads `[L1-L5, plus "unproven" below L3, with proof]`, its returns line and example output include `### Impact`, and the templates' Decisions intro says `Evidence: a pointer if the ruling cites one, else —` (655965d).
6. Task 4's Interfaces line saying Tasks 5 and 6 add checks to `test-evidence-levels.sh` was wrong: they use `test-review-template.sh`.
7. Task 7 ran the three evals plus the seven existing ones; the human partner chose to re-scope Task 2's eval instead of dropping the Impact pass.
