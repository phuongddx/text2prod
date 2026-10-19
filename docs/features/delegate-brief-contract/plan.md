# Delegate Brief Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use text2prod:subagent-driven-development (recommended) or text2prod:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every text2prod implementer dispatch carry required skill reads, a named data shape, done checks, and consolidated scope on fix rounds, and make both dispatching skills decide fan-out with one written four-line checkpoint.

**Architecture:** Three skill files change, all prose: `subagent-driven-development/implementer-prompt.md`, `subagent-driven-development/SKILL.md`, and `dispatching-parallel-agents/SKILL.md`. Each change is gated by a `plugin-evals/` case that must fail on the current skill text before the edit and pass after, plus a static wiring test in `tests/feature-artifacts/`. No agent definitions, scripts, or dependencies are added.

**Tech Stack:** Markdown skills; bash static tests using `tests/feature-artifacts/lib.sh`; `claude plugin eval` cases (`prompt.md` plus `graders/*.md`, grader types `tool_used` with `input_match`, and `llm`).

**Spec:** `spec.md` (same folder)

## Global Constraints

- Skill content edits need eval evidence: every eval in this plan is run on the unedited skill first and must fail there (`CONTRIBUTING.md`, `docs/engineering/conventions.md`).
- Zero runtime dependencies. Text and bash only.
- No harness-specific agent names in skill text. The changes must read the same on Claude Code and Codex.
- The `claude plugin eval` sandbox blocks git (`docs/features/evidence-and-correction/spec.md`, Outcome). No grader may depend on commit order.
- Eval run command, from the repo root: `claude plugin eval . --eval-dir plugin-evals --case <name> --allow-tools Bash Write Edit`. Results land in `plugin-evals/results/<timestamp>/aggregate-result.json` (gitignored). Record pass counts for both arms (with plugin, without plugin) in the ledger and later in `spec.md` Outcome.
- Shell style: `#!/usr/bin/env bash`, `set -euo pipefail`, 2-space indent, lint with `scripts/lint-shell.sh <file>`.
- Commit subject lines are imperative, one concern per commit.
- The checkpoint block (Task 4) is byte-identical in both skills. Copy it, do not retype it.

---

## File Structure

| File | Change | Responsibility |
| --- | --- | --- |
| `skills/subagent-driven-development/implementer-prompt.md` | Modify | The one template every implementer dispatch is built from. Gains required reads, `## Data shape`, `## Done means`, `## Prior round`. |
| `skills/subagent-driven-development/SKILL.md` | Modify | Controller rules. Gains dispatch items 6 and 7, the cross-family reviewer rule, the fresh-by-default fix loop, the throughput checkpoint. |
| `skills/dispatching-parallel-agents/SKILL.md` | Modify | Fan-out rules. "Identify Independent Domains" becomes the throughput checkpoint. |
| `tests/feature-artifacts/test-delegate-brief.sh` | Create | Static wiring checks for the template and the SDD skill. |
| `tests/feature-artifacts/test-checkpoint-identical.sh` | Create | Checks the checkpoint block is byte-identical in both skills. |
| `plugin-evals/implementer-reads-tdd/` | Create | Eval: dispatch carries both skill paths. |
| `plugin-evals/dispatch-names-shape/` | Create | Eval: dispatch carries `## Data shape` and `## Done means` with a structure. |
| `plugin-evals/reviewer-different-family/` | Create | Eval: reviewer dispatch names a different model than the implementer. |
| `plugin-evals/fix-round-consolidated/` | Create | Eval: a fix-round dispatch carries brief, report, ruling, and finding. |
| `plugin-evals/checkpoint-before-fanout/` | Create | Eval: the four checkpoint lines appear before fan-out. |
| `docs/features/delegate-brief-contract/spec.md` | Modify | Testing row for `implementer-reads-tdd` loses the commit-order grader (Task 1). Outcome table (Task 5). |

---

### Task 1: Implementer brief contract

**Files:**
- Modify: `skills/subagent-driven-development/implementer-prompt.md:22-40` (Before You Begin, Your Job), `:119-126` (After Review Findings)
- Modify: `docs/features/delegate-brief-contract/spec.md` (Testing table, `implementer-reads-tdd` row)
- Create: `plugin-evals/implementer-reads-tdd/prompt.md`, `plugin-evals/implementer-reads-tdd/graders/reads-tdd.md`, `plugin-evals/implementer-reads-tdd/graders/reads-verification.md`
- Create: `plugin-evals/dispatch-names-shape/prompt.md`, `plugin-evals/dispatch-names-shape/graders/shape-and-done.md`, `plugin-evals/dispatch-names-shape/graders/names-structure.md`
- Test: `tests/feature-artifacts/test-delegate-brief.sh`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the template section headings `## Data shape`, `## Done means`, `## Prior round` and the placeholders `[DATA_SHAPE]`, `[DONE_CHECKS]`, `[SKILLS_DIR]`, `[RULINGS]`, `[FINDINGS]`. Task 2 and Task 3 refer to these headings by exact name.

- [ ] **Step 1: Write the static test**

Create `tests/feature-artifacts/test-delegate-brief.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

T="$REPO_ROOT/skills/subagent-driven-development/implementer-prompt.md"
S="$REPO_ROOT/skills/subagent-driven-development/SKILL.md"

check "template reads tdd skill"          "$T" 'test-driven-development/SKILL.md'
check "template reads verification skill" "$T" 'verification-before-completion/SKILL.md'
check "template has data shape slot"      "$T" '## Data shape'
check "template has done means slot"      "$T" '## Done means'
check "template has prior round block"    "$T" '## Prior round'
check "failing test comes first"          "$T" 'Write the failing test first'
check_absent "tdd no longer optional"     "$T" 'following TDD if task says to'
check_absent "no resume wording"          "$T" 'you will be resumed with the findings'

check "dispatch item 6: data shape"       "$S" '(6) the data shape'
check "dispatch item 7: done checks"      "$S" '(7) two to four observable'
check "reviewer on different family"      "$S" 'different model family'
check "fix rounds 1-3 go fresh"           "$S" 'Rounds 1-3 — dispatch a fresh implementer'
check "checkpoint in task loop"           "$S" 'Write the throughput checkpoint before the first dispatch'

finish "delegate-brief wiring"
```

Make it executable: `chmod +x tests/feature-artifacts/test-delegate-brief.sh`.

- [ ] **Step 2: Run the static test to verify it fails**

Run: `bash tests/feature-artifacts/test-delegate-brief.sh`
Expected: FAIL. The first eight checks (template) fail now; the five SKILL.md checks also fail and stay red until Tasks 2 to 4. This task turns the template checks green only.

- [ ] **Step 3: Write the `implementer-reads-tdd` eval**

Create `plugin-evals/implementer-reads-tdd/prompt.md`:

~~~~markdown
---
description: An SDD implementer dispatch should tell the implementer to read the test-driven-development and verification-before-completion skills before writing code, even when the plan task never mentions TDD.
tags: [process, dispatch]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

This repo uses Text2Prod feature mode. Before anything else, create `docs/features/word-count/spec.md` containing `# Spec: word count` and `Status: approved`, and `docs/features/word-count/plan.md` with exactly this content:

```
# Word count Implementation Plan

**Goal:** A `wordCount(text)` function.

### Task 1: wordCount

**Files:**
- Create: `word-count.js`
- Test: `word-count.test.js`

- [ ] Implement `wordCount(text)` in `word-count.js`: split on runs of whitespace, ignore empty strings, return the count. Export it as the module's only export.
- [ ] Cover `""`, `"one"`, `"  two   words "`, and a string with a newline, using Node's built-in `node:test` runner.
- [ ] Commit.
```

Execute this plan with subagent-driven development. Dispatch the Task 1 implementer and stop once you have its report. Do not dispatch the task reviewer.
~~~~

Create `plugin-evals/implementer-reads-tdd/graders/reads-tdd.md`:

```markdown
---
type: tool_used
tool: Agent
input_match: 'test-driven-development/SKILL\.md'
---
```

Create `plugin-evals/implementer-reads-tdd/graders/reads-verification.md`:

```markdown
---
type: tool_used
tool: Agent
input_match: 'verification-before-completion/SKILL\.md'
---
```

- [ ] **Step 4: Write the `dispatch-names-shape` eval**

Create `plugin-evals/dispatch-names-shape/prompt.md`:

~~~~markdown
---
description: An SDD implementer dispatch should name the data shape the task introduces and its organizing structure, plus observable done checks, before the implementer writes logic.
tags: [process, dispatch]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

This repo uses Text2Prod feature mode. Before anything else, create `docs/features/order-status/spec.md` containing `# Spec: order status` and `Status: approved`, and `docs/features/order-status/plan.md` with exactly this content:

```
# Order status Implementation Plan

**Goal:** Orders carry a status with legal transitions.

### Task 1: status transitions

**Files:**
- Create: `order-status.js`
- Test: `order-status.test.js`

- [ ] Add a `status` field to the order record. Legal values: `draft`, `submitted`, `paid`, `cancelled`.
- [ ] Add `transition(order, next)` returning a new order with `status: next`. Legal moves: draft→submitted, submitted→paid, draft→cancelled, submitted→cancelled. Any other move throws `Error("illegal transition <from> -> <to>")`.
- [ ] Cover every legal move and two illegal ones with Node's built-in `node:test` runner.
- [ ] Commit.
```

Execute this plan with subagent-driven development. Dispatch the Task 1 implementer and stop once you have its report. Do not dispatch the task reviewer.
~~~~

Create `plugin-evals/dispatch-names-shape/graders/shape-and-done.md`:

```markdown
---
type: tool_used
tool: Agent
input_match: '## Data shape[\s\S]*## Done means'
---
```

Create `plugin-evals/dispatch-names-shape/graders/names-structure.md`. It is a `tool_used` grader, not `llm`, because the llm judge sees only the controller's final message and never the Agent dispatch prompt (found in Task 1, Ruling R6). It requires the `## Data shape` section to name the concrete status `draft` (so the slot was filled for this task and not left as template text) and an organizing structure:

```markdown
---
type: tool_used
tool: Agent
input_match: '## Data shape(?=(?:(?!## Done means)[\s\S])*?draft)(?=(?:(?!## Done means)[\s\S])*?(?:[Tt]ransition table|[Ss]tate machine|[Ll]ookup|[Rr]egistry|[Mm]ap\b))'
---
```

- [ ] **Step 5: Run both evals on the current skills to verify they fail**

Run: `claude plugin eval . --eval-dir plugin-evals --case implementer-reads-tdd --allow-tools Bash Write Edit`
Run: `claude plugin eval . --eval-dir plugin-evals --case dispatch-names-shape --allow-tools Bash Write Edit`
Expected: on the with-plugin arm, `reads-tdd` and `reads-verification` both 0 of N; `shape-and-done` 0 of N. Record the counts for both arms and the `aggregate-result.json` paths in the ledger. If a with-plugin grader already passes on the current skills, stop and report DONE_WITH_CONCERNS: the eval does not separate and the controller must rule before the edit lands.

- [ ] **Step 6: Edit the template, Before You Begin and Your Job**

In `skills/subagent-driven-development/implementer-prompt.md`, replace lines 22 to 40 (from `    ## Before You Begin` through `    6. Report back`) with:

```markdown
    ## Before You Begin

    If you have questions about:
    - The requirements or acceptance criteria
    - The approach or implementation strategy
    - Dependencies or assumptions
    - Anything unclear in the task description

    **Ask them now.** Raise any concerns before starting work.

    ## Data shape

    [DATA_SHAPE — the shape this task introduces or changes and its
    organizing structure (a state machine, a table or registry, a typed
    model, a boundary), or `n/a: no new shape`. Filled by the controller.]

    Confirm this shape before you write logic. An empty slot is a dispatch
    error: report NEEDS_CONTEXT. If the task cannot be built on the named
    shape, report NEEDS_CONTEXT with the shape you would use and why.

    ## Done means

    [DONE_CHECKS — two to four observable checks, filled by the controller.]

    Your report addresses each check by name.

    ## Your Job

    Read `[SKILLS_DIR]/test-driven-development/SKILL.md` and
    `[SKILLS_DIR]/verification-before-completion/SKILL.md` in full before
    you write code. Your failing test comes first. Your report carries the
    evidence those skills ask for.

    Once you're clear on requirements:
    1. Write the failing test first for what the task specifies
    2. Implement the minimal code that makes it pass
    3. Verify implementation works
    4. Commit your work — include any `docs/features/` artifact edits in the same commit
    5. Self-review (see below)
    6. Report back
```

Then, in the template header lines 6 to 9, add one line after the `model:` lines so the controller fills `[SKILLS_DIR]`:

```markdown
  skills_dir: [SKILLS_DIR — absolute path of the text2prod skills directory
         this session loaded; the implementer reads two skills from it]
```

- [ ] **Step 7: Edit the template, After Review Findings becomes Prior round**

Replace lines 119 to 126 (the `## After Review Findings` section, which starts "If the task review finds issues, you will be resumed with the findings.") with:

```markdown
    ## Prior round

    [Present only on a fix-round dispatch. Delete this section on a first
    dispatch.]
    - Original brief: [BRIEF_FILE]
    - Prior report: [REPORT_FILE] — read it first; it holds what was tried
    - Rulings since the first dispatch: [RULINGS — verbatim, one per line]
    - Open findings: [FINDINGS — verbatim]

    Fix the open findings, re-run the tests that cover the amended code, and
    append a fix report to the report file: what you changed, the covering
    tests you ran, the command, and the output. Reviewers will not re-run
    tests for you — your report is the test evidence. Then reply with the
    same short status contract as a first report.
```

- [ ] **Step 8: Run the static test, template checks pass**

Run: `bash tests/feature-artifacts/test-delegate-brief.sh`
Expected: the eight template checks PASS. The five SKILL.md checks still FAIL (Tasks 2 to 4). Exit 1 is expected at this point.

- [ ] **Step 9: Run both evals on the edited template**

Run the same two commands as Step 5.
Expected: `reads-tdd`, `reads-verification`, and `shape-and-done` pass on the with-plugin arm in at least 2 of 3 runs; `names-structure` passes in at least 2 of 3. Record counts and result paths in the ledger. If any grader stays at 0 of 3, do not retune the grader; report DONE_WITH_CONCERNS with the transcript observation.

- [ ] **Step 10: Amend the spec's Testing row**

In `docs/features/delegate-brief-contract/spec.md`, in the Testing table, replace the `implementer-reads-tdd` row's grader cell:

Old: `` `tool_used` Agent with `input_match` on both skill paths; `llm`: the implementer's first commit adds a failing test before the implementation ``

New: `` `tool_used` Agent with `input_match` on each skill path (two graders). The commit-order grader is dropped: the eval sandbox blocks git, so commit order cannot be observed ``

- [ ] **Step 11: Lint and commit**

Run: `scripts/lint-shell.sh tests/feature-artifacts/test-delegate-brief.sh`
Expected: exit 0.

```bash
git add skills/subagent-driven-development/implementer-prompt.md tests/feature-artifacts/test-delegate-brief.sh plugin-evals/implementer-reads-tdd plugin-evals/dispatch-names-shape docs/features/delegate-brief-contract/spec.md
git commit -m "Require skill reads, data shape, and done checks in the implementer brief"
```

---

### Task 2: Dispatch items and the cross-family reviewer rule

**Files:**
- Modify: `skills/subagent-driven-development/SKILL.md:204-206` (Model Selection, after "Always specify the model explicitly"), `:254-261` (The Task Loop step 1 dispatch list)
- Create: `plugin-evals/reviewer-different-family/prompt.md`, `plugin-evals/reviewer-different-family/graders/reviewer-model-differs.md`
- Test: `tests/feature-artifacts/test-delegate-brief.sh` (from Task 1)

**Interfaces:**
- Consumes: `## Data shape` and `## Done means` headings from Task 1.
- Produces: the ledger line format `Task <N>: implementer <model>, reviewer <model>`. Nothing later depends on it.

- [ ] **Step 1: Write the `reviewer-different-family` eval**

Create `plugin-evals/reviewer-different-family/prompt.md`:

~~~~markdown
---
description: The SDD task reviewer should run on a different model from the implementer, so the review does not share the implementer's blind spots.
tags: [process, dispatch]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

This repo uses Text2Prod feature mode and subagent-driven development is in progress. Before anything else, create these files:

`docs/features/word-count/plan.md`:
```
# Word count Implementation Plan

### Task 1: wordCount
- [ ] Implement `wordCount(text)` in `word-count.js`; cover it in `word-count.test.js` with `node:test`.
```

`.text2prod/sdd/word-count/progress.md`:
```
# SDD ledger — plan: docs/features/word-count/plan.md
Task 1: dispatched implementer on model sonnet, BASE 0000000
```

`.text2prod/sdd/word-count/task-1-brief.md`:
```
Implement `wordCount(text)` in `word-count.js`; cover it in `word-count.test.js` with `node:test`.
```

`.text2prod/sdd/word-count/task-1-report.md`:
```
Implemented wordCount in word-count.js (split on /\s+/, filter empty). Tests: 4 passing (node --test). Files: word-count.js, word-count.test.js. No concerns.
```

`word-count.js`:
```
module.exports = function wordCount(text) { return text.split(/\s+/).filter(Boolean).length; };
```

`word-count.test.js`:
```
const test = require('node:test'); const assert = require('node:assert'); const wordCount = require('./word-count');
test('empty', () => assert.equal(wordCount(''), 0));
test('two words', () => assert.equal(wordCount('  two   words '), 2));
```

The Task 1 implementer, dispatched on model `sonnet`, has just reported DONE with the report above. Continue the subagent-driven-development loop from here: dispatch the Task 1 review. Stop once the reviewer is dispatched; you do not need to act on its verdict.
~~~~

Create `plugin-evals/reviewer-different-family/graders/reviewer-model-differs.md`:

```markdown
---
type: tool_used
tool: Agent
input_match: '"model"\s*:\s*"(opus|haiku)"[\s\S]*[Rr]eview|[Rr]eview[\s\S]*"model"\s*:\s*"(opus|haiku)"'
---
```

- [ ] **Step 2: Run the eval on the current skill to verify it fails**

Run: `claude plugin eval . --eval-dir plugin-evals --case reviewer-different-family --allow-tools Bash Write Edit`
Expected: with-plugin arm 0 or 1 of 3 (the current Model Selection scales reviewers by diff size, not by family, so a `sonnet` reviewer is the likely pick). Record both arms in the ledger. If the with-plugin arm is 3 of 3, stop and report DONE_WITH_CONCERNS: the rule is already followed and the edit would be unevidenced.

- [ ] **Step 3: Add the cross-family rule to Model Selection**

In `skills/subagent-driven-development/SKILL.md`, after the paragraph ending "which silently defeats this section." (line 206), insert:

```markdown
**Reviewers run on a different model family from the implementer** where
the harness offers one; on a single-family harness a different tier
counts. A reviewer that shares the implementer's model shares its blind
spots. Record the pairing in the ledger:
`Task <N>: implementer <model>, reviewer <model>`; on a single-family
harness add `reviewer: same family, different tier`.
```

- [ ] **Step 4: Extend the dispatch list**

In The Task Loop step 1, the sentence currently reads "...(5) the report-file path and report contract. Exact values (numbers, magic strings, signatures, test cases) appear only in the brief." Change it to:

```markdown
  ...(5) the report-file path and report contract; (6) the data shape the
  task introduces or changes and its organizing structure, or `n/a: no new
  shape`, filled into the template's `## Data shape`; (7) two to four
  observable done checks, filled into `## Done means`. Exact values
  (numbers, magic strings, signatures, test cases) appear only in the
  brief.
```

- [ ] **Step 5: Run the static test**

Run: `bash tests/feature-artifacts/test-delegate-brief.sh`
Expected: "dispatch item 6", "dispatch item 7", and "reviewer on different family" now PASS. "fix rounds 1-3 go fresh" and "checkpoint in task loop" still FAIL (Tasks 3 and 4).

- [ ] **Step 6: Run the eval on the edited skill**

Run the same command as Step 2.
Expected: with-plugin arm at least 2 of 3. Record counts and result paths in the ledger.

- [ ] **Step 7: Commit**

```bash
git add skills/subagent-driven-development/SKILL.md plugin-evals/reviewer-different-family
git commit -m "Dispatch data shape and done checks; review on a different model family"
```

---

### Task 3: Prior round eval; the fresh-by-default flip is dropped

**Ruling R13:** the flip (fix rounds 1-3 go to a fresh implementer instead of resuming) is dropped. The eval sandbox cannot reach the resume path it replaces: `SendMessage` was not callable in 9 of 10 runs, and an eval redesigned around an idle, messageable implementer passed the grader in 2 of 5 runs on each arm. What this task keeps is the eval that gives Task 1's `## Prior round` block its evidence: on a fresh fix dispatch the block carries the brief, the report, the rulings, and the findings.

**Files:**
- Create: `plugin-evals/fix-round-consolidated/prompt.md`, `plugin-evals/fix-round-consolidated/graders/carries-scope.md`
- Modify: `tests/feature-artifacts/test-delegate-brief.sh` (delete the `fix rounds 1-3 go fresh` check)
- Do not modify: `skills/subagent-driven-development/SKILL.md`

**Interfaces:**
- Consumes: the `## Prior round` block from Task 1 (brief, report, rulings, findings, in that order).
- Produces: nothing later tasks use.

- [ ] **Step 2: Delete the check this task no longer satisfies**

In `tests/feature-artifacts/test-delegate-brief.sh` delete the line:

```bash
check "fix rounds 1-3 go fresh"           "$S" 'Rounds 1-3 — dispatch a fresh implementer'
```

Run: `bash tests/feature-artifacts/test-delegate-brief.sh`
Expected: only `checkpoint in task loop` still FAILs (Task 4).

- [ ] **Step 3: Run the eval on the pre-template skills to verify it fails**

Run the eval on the skills as they were before Task 1 (commit `eb68fe1`, which has no `## Prior round` block): `EVAL_REF=eb68fe1 <wrapper> fix-round-consolidated --runs 5 --keep-temp`.
Expected: on the with-plugin arm the grader fails in every run where the controller dispatched. Record the dispatched-run counts, grader passes, and trace paths in the ledger. If a dispatched with-plugin run passes, stop and report DONE_WITH_CONCERNS: the block adds nothing the old fallback sentence did not.

- [ ] **Step 4: Record the after run**

The after run is the existing one on the current tree: `scratchpad/eval-results/fix-round-consolidated-20261019T180042/aggregate-result.json` (with plugin 5 of 5 dispatched and passing, without plugin 0 of 5). Confirm the prompt you committed is byte-identical to the one that run used (`scratchpad/eval-copy/20261019T180042/plugin-evals/fix-round-consolidated/prompt.md`), and cite the path. If it differs, rerun the after eval on the current tree.

- [ ] **Step 5: Commit**

```bash
git add plugin-evals/fix-round-consolidated tests/feature-artifacts/test-delegate-brief.sh
git commit -m "Add the fix-round-consolidated eval for the Prior round block"
```

---

### Task 4: Throughput checkpoint in both dispatching skills

**Files:**
- Modify: `skills/subagent-driven-development/SKILL.md:221-223` (top of The Task Loop, before "Batch small same-shape work")
- Modify: `skills/dispatching-parallel-agents/SKILL.md:49-56` (section "1. Identify Independent Domains")
- Create: `tests/feature-artifacts/test-checkpoint-identical.sh`
- Create: `plugin-evals/checkpoint-before-fanout/prompt.md`, `plugin-evals/checkpoint-before-fanout/graders/four-lines.md`, `plugin-evals/checkpoint-before-fanout/graders/skill-fired.md`
- Test: `tests/feature-artifacts/test-delegate-brief.sh` (from Task 1)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the fenced block beginning `Checkpoint:` that the static test extracts by its first and last line.

- [ ] **Step 1: Write the byte-identical static test**

Create `tests/feature-artifacts/test-checkpoint-identical.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

S="$REPO_ROOT/skills/subagent-driven-development/SKILL.md"
P="$REPO_ROOT/skills/dispatching-parallel-agents/SKILL.md"

block() { sed -n '/^Checkpoint:$/,/^```$/p' "$1"; }

check "sdd has checkpoint block"      "$S" 'Checkpoint:'
check "parallel has checkpoint block" "$P" 'Checkpoint:'
check "sdd line 4"                    "$S" '4. Smallest safe decomposition:'
check "parallel line 4"               "$P" '4. Smallest safe decomposition:'

if [ -n "$(block "$S")" ] && [ "$(block "$S")" = "$(block "$P")" ]; then
  echo "  [PASS] checkpoint block byte-identical"
else
  echo "  [FAIL] checkpoint block byte-identical"
  diff <(block "$S") <(block "$P") || true
  FAILURES=$((FAILURES + 1))
fi

finish "checkpoint block wiring"
```

Make it executable: `chmod +x tests/feature-artifacts/test-checkpoint-identical.sh`.

- [ ] **Step 2: Run it to verify it fails**

Run: `bash tests/feature-artifacts/test-checkpoint-identical.sh`
Expected: FAIL on all five checks.

- [ ] **Step 3: Write the `checkpoint-before-fanout` eval**

Create `plugin-evals/checkpoint-before-fanout/prompt.md`:

```markdown
---
description: Before fanning out to parallel subagents, the controller should write the four-line throughput checkpoint (blocking first steps, independent workstreams, shared mutable state, smallest safe decomposition).
tags: [process, dispatch]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

Three test files are failing after a refactor of our Node CLI, each for a different reason. The failures are independent and I'd like them fixed in parallel.

- `tests/parse-args.test.js`: 2 failures. `--out` with no value now throws instead of defaulting to `./out`.
- `tests/render.test.js`: 3 failures. Table rows are joined with `\n` but the snapshot expects `\r\n` on this fixture.
- `tests/cache.test.js`: 1 failure. `cache.get` returns a stale entry after `cache.set` on the same key, because the refactor made `set` write to a copy of the map.

All three subsystems share `src/config.js`, which `parse-args` writes and `render` and `cache` read. The repo is otherwise empty here; treat the failures as given. Fix them using subagents. Reply with what you dispatched and why.
```

Create `plugin-evals/checkpoint-before-fanout/graders/four-lines.md`:

```markdown
---
type: llm
---

The user asked for three independent test-file failures to be fixed in parallel by subagents, and noted that all three subsystems share `src/config.js`.

PASS only if, in the final reply or in a file the agent wrote (a ledger or progress file), all four of these checkpoint lines appear with a filled value (not left as a placeholder): "Blocking first steps", "Independent workstreams", "Shared mutable state", "Smallest safe decomposition". The shared-state line must mention `config.js` or the shared config, or state explicitly that the config write is serialized or isolated before fan-out.

FAIL if any of the four lines is missing, if they appear only as headings with no content, or if the agent fanned out without addressing the shared `config.js` write.
```

Create `plugin-evals/checkpoint-before-fanout/graders/skill-fired.md`:

```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?dispatching-parallel-agents"'
---
```

- [ ] **Step 4: Run the eval on the current skills to verify it fails**

Run: `claude plugin eval . --eval-dir plugin-evals --case checkpoint-before-fanout --allow-tools Bash Write Edit`
Expected: `four-lines` 0 of 3 on the with-plugin arm (the current skill has no such lines). `skill-fired` is the plugin indicator, not part of the score. Record both arms in the ledger.

- [ ] **Step 5: Add the checkpoint to subagent-driven-development**

In `skills/subagent-driven-development/SKILL.md`, directly after the `## The Task Loop` heading (line 221) and before `**Batch small same-shape work.**`, insert:

~~~~markdown
**Write the throughput checkpoint before the first dispatch.** Four lines
in the ledger; a line that does not apply stays with `n/a: <reason>`:

```text
Checkpoint:
1. Blocking first steps: <gates that run before any fan-out>
2. Independent workstreams: <disjoint files or layers that parallelize; shared writes serialize>
3. Shared mutable state: <split the target by default; serialize only for a real invariant>
4. Smallest safe decomposition: <if one worker is best, why>
```

Line 3 is the recorded reason behind "never dispatch multiple
implementation subagents in parallel": implementers share one branch, so
their writes serialize. Line 4 names the one worker. A line you cannot
answer blocks fan-out, not dispatch: default to one worker and record
line 4 as the reason.

~~~~

- [ ] **Step 6: Add the checkpoint to dispatching-parallel-agents**

In `skills/dispatching-parallel-agents/SKILL.md`, replace the body of `### 1. Identify Independent Domains` (lines 51 to 56, from "Group failures by what's broken:" through "Each domain is independent - fixing tool approval doesn't affect abort tests.") with:

~~~~markdown
Write the throughput checkpoint before the first dispatch. Four lines, in
your reply or your ledger; a line that does not apply stays with
`n/a: <reason>`:

```text
Checkpoint:
1. Blocking first steps: <gates that run before any fan-out>
2. Independent workstreams: <disjoint files or layers that parallelize; shared writes serialize>
3. Shared mutable state: <split the target by default; serialize only for a real invariant>
4. Smallest safe decomposition: <if one worker is best, why>
```

Line 2 is the domain list. A group is a domain only when line 3 holds for
it as well: a file two groups both write is shared state, and those two
groups serialize or the write is isolated first. For example:
- File A tests: Tool approval flow
- File B tests: Batch completion behavior
- File C tests: Abort functionality

Each domain is independent - fixing tool approval doesn't affect abort tests.
~~~~

Copy the fenced block from Step 5 verbatim. Do not retype it.

- [ ] **Step 7: Run both static tests**

Run: `bash tests/feature-artifacts/test-checkpoint-identical.sh`
Expected: all five checks PASS.

Run: `bash tests/feature-artifacts/test-delegate-brief.sh`
Expected: all thirteen checks PASS, exit 0.

Run: `bash tests/feature-artifacts/run-all.sh`
Expected: every suite passes, exit 0.

- [ ] **Step 8: Run the eval on the edited skills**

Run the same command as Step 4.
Expected: `four-lines` at least 2 of 3 on the with-plugin arm. Record counts and result paths in the ledger.

- [ ] **Step 9: Lint and commit**

Run: `scripts/lint-shell.sh tests/feature-artifacts/test-checkpoint-identical.sh`
Expected: exit 0.

```bash
git add skills/subagent-driven-development/SKILL.md skills/dispatching-parallel-agents/SKILL.md tests/feature-artifacts/test-checkpoint-identical.sh plugin-evals/checkpoint-before-fanout
git commit -m "Write the throughput checkpoint before fan-out in both dispatching skills"
```

---

### Task 5: Record outcomes and rerun the existing suites

**Files:**
- Modify: `docs/features/delegate-brief-contract/spec.md` (append `## Outcome`)
- Modify: `docs/testing.md` (plugin tests list, two lines)

**Interfaces:**
- Consumes: the ledger's eval counts and result paths from Tasks 1 to 4.
- Produces: nothing.

- [ ] **Step 1: Rerun every existing eval suite**

Run: `claude plugin eval . --eval-dir plugin-evals --allow-tools Bash Write Edit`
Expected: the pre-existing suites (`brainstorm-before-building`, `debug-root-cause-first`, `finishing-decisions-after-cleanup`, `finishing-writes-decisions`, `no-overtrigger-on-question`, `plan-from-spec`, `pressure-fixed-claim`, `pressure-review-signoff`, `pressure-verification-demo`, `tdd-test-first`) keep their prior with-plugin pass counts. Record the `aggregate-result.json` path in the ledger. Any suite that drops is a regression: stop and report BLOCKED with the suite name and the delta.

- [ ] **Step 2: Append the Outcome section to the spec**

Append to `docs/features/delegate-brief-contract/spec.md`, filling every cell from the ledger (numbers are runs passing a grader, with-plugin arm vs no-plugin arm, before and after the edit):

```markdown
## Outcome

Five ideas went in and the fresh-by-default flip was dropped. Numbers are
runs passing a grader, with-plugin arm vs no-plugin arm, before the edit
and after.

| Idea | Eval | Before | After | Decision |
| --- | --- | --- | --- | --- |
| Required skill reads | `implementer-reads-tdd` | [N of 3] vs [N of 3] | [N of 3] vs [N of 3] | [Ships / Dropped: reason] |
| Data shape and done checks | `dispatch-names-shape` | [N of 3] vs [N of 3] | [N of 3] vs [N of 3] | [Ships / Dropped: reason] |
| Cross-family reviewer | `reviewer-different-family` | [N of 3] vs [N of 3] | [N of 3] vs [N of 3] | [Ships / Dropped: reason] |
| Prior round block (consolidated scope on a fresh fix dispatch) | `fix-round-consolidated` | [N of 5] vs [N of 5] | [N of 5] vs [N of 5] | [Ships / Dropped: reason] |
| Fresh-by-default fix rounds (the flip) | none | n/a | n/a | Dropped: `SendMessage` is not callable in the eval sandbox (ToolSearch found no match in 9 of 10 runs), so the resume path the flip replaces cannot be reached; a redesigned eval passed the grader in 2 of 5 with-plugin runs and 2 of 5 without, no separation |
| Throughput checkpoint | `checkpoint-before-fanout` | [N of 3] vs [N of 3] | [N of 3] vs [N of 3] | [Ships / Dropped: reason] |

Existing suites: [unchanged / name and delta]. Result paths are in the
PR's before/after section.
```

In `spec.md`, annotate Problem item 3, the third Goal, and the fix-loop bullet under Design > Dispatch rules with `(dropped, see Outcome)`, and add the Prior round override sentence to the Design's implementer-prompt item 4.

An idea whose "after" with-plugin count is not above its "before" count is marked Dropped with the observed reason, and the controller rules on reverting that task's skill edit before the branch finishes.

- [ ] **Step 3: List the new static tests in docs/testing.md**

In `docs/testing.md`, in the "Plugin tests" list, change the `tests/feature-artifacts/` line to:

```markdown
- `tests/feature-artifacts/` — static wiring checks that skills use the shared feature-artifacts contract, the delegate brief contract (`test-delegate-brief.sh`), and one checkpoint block across both dispatching skills (`test-checkpoint-identical.sh`); `run-all.sh` runs them.
```

- [ ] **Step 4: Run the static suite once more**

Run: `bash tests/feature-artifacts/run-all.sh`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add docs/features/delegate-brief-contract/spec.md docs/testing.md
git commit -m "Record delegate-brief-contract eval outcomes"
```
