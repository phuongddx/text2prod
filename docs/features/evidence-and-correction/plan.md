# Evidence-graded review and structural correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use text2prod:subagent-driven-development (recommended) or text2prod:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Text2Prod's reports a shared evidence scale, a review pass that looks past the diff, and a durable Decisions table.

**Architecture:** Skill-text edits in place, one new shared reference (`evidence-levels.md`) that three skills point at. Every behavior change is gated by a `plugin-evals/` suite that must fail on the current skills before the edit lands, plus bash static tests that pin the wiring. One PR (#11), commits grouped by area.

**Tech Stack:** Markdown skills, bash static tests (`tests/feature-artifacts/lib.sh` assertions), `claude plugin eval` suites (`prompt.md` + `graders/*.md`). No runtime dependencies.

**Spec:** `spec.md` (same folder)

**Delivery:** one pull request (#11, branch `feat/evidence-review`, worktree `.claude/worktrees/feat-evidence-review`), all tasks on that branch in order. Opened as a draft; the human partner marks it ready after reading the full diff.

## Global Constraints

- Zero runtime dependencies (`CONTRIBUTING.md`).
- Skill content edits go through `writing-skills`; each PR cites eval evidence. An idea whose new eval already passes on the current skills is dropped from its PR and the drop is recorded in `review.md`.
- One PR (#11) carries the shipped areas by the human partner's decision. Each area's evals are written and run on the unedited skills first.
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
| `tests/feature-artifacts/test-evidence-levels.sh` | Create. Reference exists, three readers point at it. |
| `tests/feature-artifacts/test-review-template.sh` | Create. Parity, Impact pass, Decisions, finishing sentence, reviewer block. |
| `plugin-evals/verification-states-level/`, `plugin-evals/review-impact-pass/`, `plugin-evals/finishing-writes-decisions/` | Create. One `prompt.md` + `graders/` per spec Testing row. |
| `plugin-evals/finishing-decisions-after-cleanup/` | Create (added with the fix wave). Regression guard for the Step 1b fallback; not in the original plan. |

---

# Evidence and review area: `feat/evidence-review` (spec sections 1 and 2) (area, same PR #11)

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

# Cancelled: debugging and correction areas

Tasks 8-15 were not built. Their bodies are removed. Each idea was evaluated and dropped; the numbers are in the spec's `## Outcome`.

- Idea 3, commit the failing repro first (Tasks 8, 10): the `claude plugin eval` sandbox blocks git on this machine (6 of 6 runs), so commit order cannot be observed and no valid before-state exists.
- Idea 5, test the shared premise after two failed fixes (Tasks 9, 10): the re-scoped eval scored `premise-tested` 0 of 3 with the plugin and 0 of 3 without; all six replies diagnosed the shared assumption unprompted and none made a third edit.
- Idea 4, `correcting-repeated-mistakes` skill (Tasks 12-14): `proposes-enforcement` passed 3 of 3 with the plugin on the current skills (2 of 3 without); what the skill adds cannot be observed in a sandbox with no repo history and no git.
- Tasks 11 and 15 (prove and update the PR for these areas) go with them.

---

## Deviations from this plan (as built)

1. Task 3's run command needs `--allow-tools Write Edit` (the eval cannot pass without Write).
2. Task 5's finishing replacement is rewrapped so each grep-checked phrase sits on one line, and a later fix (commit 655965d) adds a fallback to the "Rulings I made" list because subagent-driven development deletes the ledger before finishing runs, and changes "each review's Impact block" to "the final review's Impact block".
3. Task 2's eval was re-scoped after measuring 0 of 6 (commit cc6d50b): the prompt asks for a code review with Agent allowed, graders are `reviewer-prompt-has-impact` (tool_used Agent), `skill-fired` and `unshown-reader`; the `safety-fact` regex was removed; the grader's `input_match` was later tightened to `Impact \(what this could break outside the diff\)` (655965d).
4. A new eval, `finishing-decisions-after-cleanup`, was added with the fix wave (d7e5de0); it passed before the fix, so it is a regression guard, not evidence for the fix.
5. The reviewer prompt's `Level` field reads `[L1-L5, plus "unproven" below L3, with proof]`, its returns line and example output include `### Impact`, and the templates' Decisions intro says `Evidence: a pointer if the ruling cites one, else —` (655965d).
6. Task 4's Interfaces line saying Tasks 5 and 6 add checks to `test-evidence-levels.sh` was wrong: they use `test-review-template.sh`.
7. Task 7 ran the three evals plus the seven existing ones; the human partner chose to re-scope Task 2's eval instead of dropping the Impact pass.
8. Ideas 3, 4 and 5 and Tasks 8-15 were evaluated and dropped with measured reasons (see spec Outcome).
9. The `no-edits` grader of Task 12 was never built.
