# Spec: Evidence-graded review and structural correction

Status: shipped <!-- draft | approved | shipped | superseded -->
Date: 2026-10-17

## Problem

Text2Prod's verification and review output does not tell its reader how
strong the evidence behind a claim is, does not look past the diff, and
loses the decisions agents took along the way. Three concrete gaps, each
cited to the current skill text:

1. **Evidence strength is invisible.** `verification-before-completion`
   demands fresh evidence (its Iron Law) but has no vocabulary for how
   strong that evidence is. "Linter passed" and "a script exercised the
   risky path" both read as "verified" in a report. The human partner
   cannot tell them apart without re-running the work.
2. **Review does not record what it checked beyond the diff.**
   `requesting-code-review/code-reviewer.md` checks plan alignment,
   policy, quality, architecture, tests, and production readiness. Its
   only pointer beyond the changed lines is "Backward compatibility
   considered?". Reviewers already find unshown readers (the
   `unshown-reader` grader passes with no plugin). What no skill asks for
   is a recorded safety fact, its evidence level, and the list of what was
   checked beyond the diff.
3. **Rulings die with the chat.** `subagent-driven-development` keeps a
   ledger of `Ruling:` lines, prints them as "Rulings I made" in the final
   message, then deletes the workspace (its Finish section). `review.md`
   has no section for them, so `git log -- docs/features/<slug>/` holds
   the findings but not the decisions. When the plan ledger is pasted into
   the prompt the model already copies rulings into `review.md` under its
   own heading. What is missing is a stable heading and a fixed shape, and
   a fallback for when subagent-driven development has already deleted the
   ledger.
Who is affected: the human partner reading reports and `review.md`, and
every agent that inherits a repo where the same mistakes keep recurring.

No logged incident triggered this spec. The ideas come from reading
pstack (see References). Each is landed only if an eval shows the current
skill missing the case (see Constraints and Testing). Three further ideas
(3, 4 and 5 of the original six) were evaluated and dropped; see Outcome.

## Context read

- `AGENTS.md`, `CLAUDE.md` (points at `AGENTS.md`): skills are
  behavior-shaping code, content edits need eval evidence and go through
  `writing-skills`; one experienced problem per PR; no new dependencies.
- `ARCHITECTURE.md`: `skills/` and `hooks/` are the product; `AGENTS.md`
  points at knowledge and never restates it; durable knowledge lives in
  `docs/`.
- `docs/engineering/conventions.md`: skill directory and frontmatter
  rules ("Use when…", under 500 characters); shell style; PR rules.
- `docs/engineering/tech-stack.md`, `docs/engineering/infrastructure.md`:
  read for constraints, nothing in them bears on this design.
- `docs/testing.md`: `tests/` for non-LLM wiring tests, `evals/` (separate
  drill repo) for behavior; `plugin-evals/` holds `claude plugin eval`
  suites and is the in-repo eval mechanism this spec uses.
- `skills/using-text2prod/references/feature-artifacts.md`: feature-mode
  layout, template resolution, promotion rule, never edit `AGENTS.md`.
- `skills/verification-before-completion/SKILL.md`: Iron Law, Gate
  Function, Common Failures table, Red Flags.
- `skills/requesting-code-review/SKILL.md` and `code-reviewer.md`: single
  reviewer seat, no nested subagents, reviewer never approves, report
  format with Strengths / Issues / Assessment.
- `skills/finishing-a-development-branch/SKILL.md`: Step 1b writes
  `review.md` and proposes promotions; Status set in Step 5.
- `skills/subagent-driven-development/SKILL.md`: ledger, "Rulings I
  made", workspace deletion at Finish.
- `skills/systematic-debugging/SKILL.md`: Phase 4 steps 1-5, the
  3-failed-fixes architecture rule, Red Flags.
- `skills/writing-skills/SKILL.md`: skill types, TDD mapping, "Match the
  Form to the Failure", description rules.
- `skills/using-text2prod/templates/review.md` and
  `.agents/templates/review.md`: identical today; Passes section lists
  Bugs, Security, Compliance.
- `plugin-evals/*/prompt.md` and `graders/*.md`: grader types in use
  (`tool_used`, `tool_order`, `file_exists`, `llm`), context embedded in
  prompts, `plugin-evals/results/` gitignored.
- `docs/features/link-skills-to-project-structure/spec.md`,
  `docs/features/spec-only-artifacts/spec.md`: both shipped, unrelated.
- Recent commits `4eb78c5`..`607c183`: release and OpenCode wiring, no
  overlap.

Gaps:
- `.agents/policies/` is empty.
- `plugin-evals/` has no eval for review, finishing, or verification
  behavior.
- `docs/testing.md` does not mention `plugin-evals/`.

## References

- pstack 0.15.25 (`cursor/plugins`, local copy under
  `~/.claude/plugins/cache/cursor-plugins/pstack/0.15.25/`), MIT:
  - `skills/blast-radius/SKILL.md`: the five-step "how sure are you"
    ladder and "find the one fact it's safe because of". Informed the
    evidence levels and the Impact pass.
  - `skills/poteto-mode/playbooks/bug-fix.md` step 5: "stage the commits
    so the failing repro lands before the fix". Informed the repro-first
    idea (dropped, see Outcome).
  - `skills/principle-attack-the-premise/SKILL.md`: test the shared
    premise after two failed fixes. Informed the premise idea (dropped,
    see Outcome).
  - `skills/correct/SKILL.md` and
    `skills/principle-encode-lessons-in-structure/SKILL.md`: fix classes
    at the highest level that works; rule table paired with enforcement.
    Informed the `correcting-repeated-mistakes` idea (dropped, see
    Outcome).
  - `skills/show-me-your-work/SKILL.md`: one row per decision, evidence
    as a pointer not prose. Informed the Decisions table columns.
- `claude plugin eval --help` (this build; no public docs page exists):
  grader types `regex`, `tool_used`, `tool_order`, `file_exists`, `llm`,
  `baseline`; `prompt.md` frontmatter; no fixture seeding without
  `--scaffold`. Informed the Testing section. Known discrepancy: the
  reference omits `input_match` and `weight` on `tool_order`, but
  `plugin-evals/tdd-test-first` uses both with recorded results, so the
  repo's usage is kept (`conventions.md`: current source wins).

## Goals

- A report or `review.md` states, for each claim, how strong its evidence
  is, on a scale shared by three skills.
- Every code review names the one fact the change is safe because of,
  grades its proof, and records what was checked beyond the diff.
- Every `review.md` carries the decisions agents took on the human
  partner's behalf, so git history holds them.
- Every change is backed by a `plugin-evals/` suite that fails on the
  current skills and passes on the new ones.

## Non-goals

- Model routing, per-role model tables, or multi-model review panels.
- A standalone blast-radius skill or any new auto-trigger.
- Ideas 3, 4 and 5 of the original six (commit the repro first, test the
  shared premise, a correcting-repeated-mistakes skill). Each was
  evaluated and dropped; see Outcome.
- A decision log file outside `review.md`.
- Scripts in Bun, TypeScript, or any runtime beyond bash and node.
- Changing the three-option integration menu, the reviewer-never-approves
  rule, or the brainstorming gates.
- Editing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` from any skill.

## Constraints

- Zero runtime dependencies (`CONTRIBUTING.md`).
- Skill content edits go through `writing-skills` and carry eval evidence
  (`AGENTS.md`, PR template). Because no incident triggered this work,
  each PR's first task is its eval run against the current skills; an
  idea whose eval already passes is dropped from that PR.
- One PR carries the shipped areas (human partner's decision, after PR #11 was opened as a draft for the first area). The PR body states how the areas relate. Each area still carries its own evals.
- Works identically in Claude Code, Codex, and OpenCode: no harness-only
  tools in skill text.
- The two `review.md` templates stay byte-identical.
- Reviewer subagents never approve and never spawn subagents
  (`code-reviewer.md`).
- Skills never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`
  (`feature-artifacts.md`).

## Design

### 1. Evidence levels (shared reference)

New file `skills/using-text2prod/references/evidence-levels.md`:

| Level | Name | What it means |
| --- | --- | --- |
| 1 | Asserted | "It's fine." Counts for nothing. |
| 2 | Cited | A real `file:line`, or the library's own source. |
| 3 | Traced | The failure path walked step by step and shown not to reach. |
| 4 | Executed | A script or test that calls the real code and fails loud when wrong. |
| 5 | Reproduced | Seen in the running system: app, CLI, or harness. |

Rules in the same file:

- A claim names its level in the same sentence, as `L<n>`, for example
  "tests pass (L4: 34/34, exit 0)".
- Minimum levels: "tests pass" and "build succeeds" need L4. "Bug fixed"
  needs L4 with red-green verified, or L5. A safety fact (section 2)
  needs L3, or L4 when a script is cheap. L1 and L2 never close a
  Critical or Important finding.

Readers: `verification-before-completion`, `code-reviewer.md`, the
`review.md` template. Each points at the file instead of restating it.

**Edit to `verification-before-completion`:** Gate Function step 5 becomes
"ONLY THEN: make the claim, with its level". The Common Failures table
gets a `Level` column holding the minimum for each row. Red Flags gains
"A Level 1 or 2 statement closing a finding". Roughly 15 lines.

### 2. Impact pass and Decisions table

**Impact pass.** The `review.md` template's Passes section gains a fourth
pass, and `code-reviewer.md` "What to Check" gains an **Impact** block
the reviewer fills in a fixed shape:

| Field | Content |
| --- | --- |
| Safety fact | The one fact the change is safe because of, one sentence. |
| Level | Evidence level reached, with the proof pasted or pointed at. Below L3 it reads `unproven` alongside the level reached, and the Impact finding is Important. |
| Beyond the diff | What was checked where a symbol search stops: config files, manifests, wire or file formats, other harnesses, scripts and tests that read the changed thing. Each item is a path plus `clear` or a finding. A search that finds nothing is recorded as an answer. |
| Cheapest pre-merge check | The one command or script that would catch the real breakage. |

Findings from this pass go in the Findings table tagged `Impact`. The
pass runs inside the single reviewer seat; no new subagent, no new skill.
Per-task reviews do not use the Impact block; only the final
`code-reviewer.md` review does. The reviewer still never approves.

**Decisions table.** `review.md` gains:

```markdown
## Decisions

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
```

`finishing-a-development-branch` Step 1b item 1 gains one sentence: copy
every `Ruling:` line from the plan's ledger into this table, in order,
before the workspace is deleted. Decisions made outside a plan are added
by hand, one row each. With none, the single row reads `None`. When
subagent-driven development has already deleted the ledger, take the lines
from its "Rulings I made" list in the conversation. Evidence: a pointer if
the ruling cites one, else `—`.

**Template parity.** Both `review.md` copies change together; a static
test enforces byte equality (see Testing).

### 3. Delivery

One plan, one pull request: `feat/evidence-review` (#11). Commits are in
order: evals first, then edits. Each area's first commits are its evals,
run on the unedited skills before any skill edit. The PR goes through
`writing-skills`, fills every PR template section, cites eval results,
and stays a draft until the human partner has read the full diff. The
version bump and the `AGENTS.md` skill count (unchanged at 15, since no
skill is added) remain the human partner's.

## Error handling

- No ledger file and no "Rulings I made" list in the conversation:
  Decisions row reads `None`; the finishing skill says so.
- Safety fact cannot reach L3: the Impact block reads `unproven`, the
  finding is Important, and the human partner decides.
- Eval harness drift: Testing cites `claude plugin eval --help` and the
  known `tool_order` discrepancy; a grader that stops parsing points
  there to recheck.
- A new eval passes on the current skills: that idea is dropped from its
  PR and the drop is recorded in `review.md`.

## Testing

**Evals** (`plugin-evals/`, one per idea; context embedded in `prompt.md`,
no `--scaffold`). Each is run on the current skills first and must fail
there.

| Eval | Prompt shape | Graders |
| --- | --- | --- |
| `verification-states-level` | A function plus pasted test output; "is this done?" | `regex` last message matches `L4`; `tool_used` Skill = verification-before-completion |
| `review-impact-pass` | A request for a code review before merge (Agent allowed) of a diff renaming a config key read by one shown and one unshown file | `tool_used` Agent, `input_match` `Impact \(what this could break outside the diff\)`; `tool_used` Skill = requesting-code-review (indicator); `llm`: names or searches for the unshown reader |
| `finishing-writes-decisions` | A ledger with two `Ruling:` lines; "close out the feature" | `tool_used` Write or Edit on `review.md` matching `## Decisions` and the ruling text |
| `finishing-decisions-after-cleanup` | Same close-out, but the rulings arrive only as a "Rulings I made" message and no ledger file exists | `tool_used` Write on `review.md` matching `## Decisions` and the ruling text |

The existing seven suites rerun on every PR; each PR cites its
`aggregate-result.json` in the template's before/after section.

**Static tests** (`tests/feature-artifacts/`, bash, run by `run-all.sh`):

- The two `review.md` templates are byte-identical.
- `evidence-levels.md` is referenced by `verification-before-completion`,
  `code-reviewer.md`, and the `review.md` template.
- Finishing falls back to the "Rulings I made" list; reviewer Level
  wording says plus "unproven" below L3.

## Outcome

Six ideas went in; three ship and three were dropped, each with a
measured reason. Numbers are runs passing a grader, plugin arm vs
no-plugin arm.

| Idea | Eval | Result | Decision |
| --- | --- | --- | --- |
| 1. Evidence levels | `verification-states-level` | 5 of 6 with the plugin (one miss, then 3 of 3 on rerun) vs 0 of 6 without | Ships |
| 2. Impact pass | `review-impact-pass` | First version, `safety-fact`: 0 of 6 on both arms (the skill never fired). Re-scoped version: 3 of 3 with the looser grader, 4 of 6 with the tightened grader (`Agent called 0x` in both misses, cause unknown, traces gone), vs 0 of 3 on both unedited main and the no-plugin arm | Ships |
| 6. Decisions table | `finishing-writes-decisions` | 3 of 3 (again 3 of 3 after the fix wave) vs 0 of 3 | Ships |
| 6. Decisions table, fallback | `finishing-decisions-after-cleanup` | 3 of 3 before and after the fix. A regression guard, not evidence for the fix | Ships |
| 3. Commit the failing repro first | `debug-commits-repro-first` | No valid before-state. The `claude plugin eval` sandbox blocks git on this machine ("Operation not permitted" even on `git init`, 6 of 6 runs), so commit order cannot be observed | Dropped |
| 5. Test the shared premise after two failed fixes | `debug-tests-premise` (re-scoped; `systematic-debugging` fired 3 of 3) | `premise-tested` 0 of 3 with the plugin and 0 of 3 without. All six replies diagnosed the shared wrong assumption unprompted (`when` computed once at deploy) and fixed it directly. None made a third date or timezone edit, so the failure the step guards against did not occur, and the grader demands a procedure, not an outcome | Dropped |
| 4. `correcting-repeated-mistakes` skill | `correcting-fires-on-repeat` | `proposes-enforcement` 3 of 3 with the plugin on the current skills (2 of 3 without). The replies already proposed `bump-version.sh` rewriting README plus a check script. What the skill adds (mining history for mistake classes, proving a check fails on a past instance, a rule table) cannot be observed in a sandbox with no repo history and no git. A new auto-triggering skill with no demonstrated effect is a speculative change | Dropped |

Limits:

- The `unshown-reader` grader passes without the plugin, so reviewers already find unshown readers; the Impact pass adds the recorded shape, not the finding.
- `finishing-writes-decisions` measures the heading and shape, not lost rulings.
- The Step 1b fallback fix rests on a cited contradiction (`subagent-driven-development/SKILL.md` deletes the workspace before finishing runs), not on an eval.
