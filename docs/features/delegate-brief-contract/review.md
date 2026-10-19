# Review: delegate-brief-contract

Reviewer: Claude Fable 5.1 (final whole-branch review); task reviews and scoped re-reviews by Claude Opus 5.5; human partner has not yet reviewed the full diff
Date: 2026-10-19
Plan under review: `plan.md` in this directory

## Passes

Run each pass and tag every finding with its pass:

- **Bugs** — logic errors, broken edge cases, subtle regressions.
- **Security** — injection risks, auth gaps, secrets/PII exposure.
- **Compliance** — the diff matches the plan and repo conventions.
- **Impact** — what the change could break outside the diff. Fill the
  block below; levels per Text2Prod's
  `using-text2prod/references/evidence-levels.md` (no relative link: this
  template is copied into other repos).

  | Field | Content |
  | --- | --- |
  | Safety fact | The only consumers of the two changed skill files are controllers that load the subagent-driven-development skill and read them as prose; no hook, manifest, packaging script or test parses their structure beyond grep-based static checks, and those pass. |
  | Level | L4: `bash tests/feature-artifacts/run-all.sh` exit 0 and `tests/feature-artifacts/test-delegate-brief.sh` 17 of 17 at the fix-wave head; the final reviewer recomputed every Outcome count with jq from 14 `aggregate-result.json` files and found no mismatch. At finish the non-LLM suites also pass: feature-artifacts, init-project, version-bump, `tests/codex/test-*.sh` (2), opencode, hooks, shell-lint, and `scripts/lint-shell.sh` on the changed test. |
  | Beyond the diff | `hooks/session-start`: clear, injects only `using-text2prod/SKILL.md`. `.opencode/plugins/text2prod.js`: clear, registers skill directories and the template is model-read. `.codex-plugin/plugin.json`, `.claude-plugin/`: clear, skill names only. `scripts/package-codex-plugin.sh`: clear, archives `skills/` wholesale. `tests/feature-artifacts/test-execution-review.sh`: reads `implementer-prompt.md`, passes. `tests/claude-code/test-subagent-driven-development*.sh`: clear, pin no template wording, live-LLM, not run. `skills/subagent-driven-development/task-reviewer-prompt.md`, `re-review-prompt.md`: clear. `skills/dispatching-parallel-agents/SKILL.md`, `skills/executing-plans/SKILL.md`: unchanged, clear. `skills/using-text2prod/references/codex-tools.md:24-28`: finding 6 (rounds 1-3 always resume on Codex V2, so the Prior round block's real surface there is rounds 4-5 and a vanished implementer). |
  | Cheapest pre-merge check | `bash tests/feature-artifacts/run-all.sh` |

## Severity rule

**Important** = would break behavior, leak data, or breach policy.
Style and naming are nits.

## Nit cap

Report at most 5 nits; summarize the rest as a count.

## Do not report

- Generated files.
- Anything CI already enforces.

## Findings

Final whole-branch review (Claude Fable 5.1): 0 Critical, 4 Important, 7 Minor; assessment "Ready to merge? With fixes". Scoped re-review of the fix wave (Claude Opus 5.5): Important 1-4 addressed, one new Important found (finding 10, still open).

| # | Severity | Pass | Location | Note |
| --- | --- | --- | --- | --- |
| 1 | Important | Compliance | `plugin-evals/dispatch-names-shape/graders/names-structure.md` | Task 1 review: the `llm` judge sees only the final message, never the Agent dispatch prompt, so the grader was 0 of 3 even where `shape-and-done` passed. Replaced by a `tool_used` regex (R6). Fixed in 9b833e5. |
| 2 | Important | Compliance | `skills/subagent-driven-development/implementer-prompt.md` `## Prior round` against `## Your Job` and `## Report Format` | Task 1 review: a fresh fix dispatch got conflicting instructions about the report file. Fixed in c4d800d with an override sentence (R8). |
| 3 | Important (retracted) | Compliance | Task 1 "before" eval evidence | The reviewer read `Agent called 0x` as "never dispatched". On a `tool_used` grader it counts only calls matching `input_match`; traces show the old-template controllers dispatched. I accepted the reading unchecked (R9); the 5-run re-baseline stands as stronger evidence. Not a defect. |
| 4 | Important | Compliance | `plugin-evals/fix-round-consolidated/graders/carries-scope.md:4` | Task 3 review: the last anchor `paid -> draft` repeated 2 to 5 times per dispatch, so the grader did not check that the finding was verbatim or after the ruling. Anchored on the verbatim finding sentence in e3c2c5d. |
| 5 | Important (3) | Compliance | `spec.md` Outcome (Task 5 review) | A "before" count with no source, "Existing suites: unchanged" next to one lower grader, and two annotations that also tagged the shipped Prior round idea. Fixed in 4bd5ba5. |
| 6 | Important | Bugs | `skills/subagent-driven-development/SKILL.md` fix loop | Final review: the shipped `## Prior round` block had no caller in SKILL.md. Fixed in 58c8fc5 with one sentence under rounds 1-3 and rounds 4-5. |
| 7 | Important | Bugs | `skills/subagent-driven-development/implementer-prompt.md:136,165` | Final review: "TDD if required" and "if TDD was required" made TDD optional inside the template that made it mandatory. Fixed in 58c8fc5. |
| 8 | Important | Bugs | `skills/subagent-driven-development/SKILL.md` Model Selection | Final review: the cross-family rule had no precedence against the reviewer floor and diff-size scaling. Fixed in 58c8fc5 (task and final reviews only; a scoped re-review may share the tier, recorded `re-review: same tier`). |
| 9 | Important | Bugs | `skills/subagent-driven-development/implementer-prompt.md` Prior round override | Final review: the override was wider than the conflict and cancelled the skill reads and failing-test-first. Narrowed in 58c8fc5, check string updated. |
| 10 | Important | Compliance | `docs/features/delegate-brief-contract/spec.md:278` | Open. Introduced by the fix wave from my own instruction: "the ruling 1 of 5 ... the ruling is what the block adds" is false. In the `fix-round-consolidated-20261019T182331` traces all 5 old controllers carried the ruling in substance; 4 wrapped `cancelled` in backticks, which the grader regex does not allow. The block adds verbatim, in-order copying, not the ruling itself. Parked for the human with the corrected cell (R21). |
| 11 | Minor | Compliance | `implementer-prompt.md:10-11` | `skills_dir:` sits in the header next to real Agent parameters. 0 of 9 dispatches passed it as a parameter. Open, ships (R20). |
| 12 | Minor | Bugs | `skills/subagent-driven-development/SKILL.md` ledger pairing line | No fixed separator; nothing parses it. Open, ships. |
| 13 | Minor | Bugs | `implementer-prompt.md` Prior round and `## Report Format` | After narrowing, "Write your full report to [REPORT_FILE]" still sits beside "append, never rewriting". Open, ships (R22). |
| 14 | Minor | Bugs | `skills/subagent-driven-development/SKILL.md` re-review carve-out | "as the Review tasks paragraph above allows" overclaims for a top-tier or cheapest-tier implementer. Open, ships (R22). |
| 15 | Minor | Compliance | `plugin-evals/dispatch-names-shape`, `reviewer-different-family`, `fix-round-consolidated` graders | `shape-and-done` passes on an unfilled template, `names-structure` misses plain "table", `reviewer-model-differs` accepts `haiku` and tests only the single-family fallback, `carries-scope` anchors on the finding's second sentence. Open, ships. |

The other deferred minors (14 at the final review, 3 fixed in 58c8fc5) ship as they are or are cosmetic (R20, R22).

## Decisions

Rulings agents made on the human partner's behalf, copied from the plan
ledger in order. Evidence: a pointer if the ruling cites one, else `—`.
With none, one row: `None`.

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| R1: worked in place, no git worktree. | `using-git-worktrees` and the `EnterWorktree` tool both gate on explicit user consent and none was given. | — | Unrelated uncommitted files (ARCHITECTURE.md, agents/, tests/agents/, skills-lock.json) share the tree; every dispatch said stage explicit paths only. |
| R2: evals run through a clean-copy wrapper, not `claude plugin eval .`; the wrapper passes `--no-publish`, `--trust-plugin`, `-j 3` and `--max-cost-usd 30`. | Untracked `agents/karen.md` would register `text2prod:karen` in the with-plugin arm and confound the dispatch evals; the default publishes transcripts to claude.ai; the 30 USD cap is a guess, not measured. | — | A cap that aborts a legitimate run (exit 2, implementer reports BLOCKED); the copy is rebuilt per call from tracked plus untracked non-ignored files, so it cannot drift. |
| R3: the plan follows spec Design (NEEDS_CONTEXT when the task cannot be built on the named shape) and gained the empty-slot NEEDS_CONTEXT sentence from Error handling. | Spec Design says NEEDS_CONTEXT, spec Error handling says DONE_WITH_CONCERNS when the shape is wrong. | `spec.md` Design against Error handling | The DONE_WITH_CONCERNS path is unspecified; the spec's two bullets still disagree and need a human fix. |
| R4: added the single-family ledger token `reviewer: same family, different tier` to Task 2. | Spec Error handling required it and the plan lacked it. | — | None beyond one extra phrase. |
| R5: implementers on sonnet, task reviewers on opus, final review planned on opus. The final review ran on Fable 5.1, the most capable model available, not opus. | Opus is a different tier from the implementer; this harness is single-family, so the new cross-family rule cannot be met. | — | Higher review cost, or same-tier blind spots. |
| R6: the `names-structure` grader changed from `llm` to a `tool_used` regex that needs the concrete status `draft` plus a structure word. | The `llm` judge sees only the final message, not the Agent dispatch prompt (0 of 3 even where `shape-and-done` passed); the regex cannot pass on unfilled template text. | 9b833e5 | The regex can pass a dispatch that names a structure word without a real design, and fail a real design phrased differently. |
| R7: `shape-and-done` at 2 of 3 accepted, no prompt retune. | The third run's controller never dispatched because git is unusable in the eval sandbox; 2 of 3 meets the plan's threshold; the baseline was measured on this prompt. | — | The 2 of 3 may reflect sandbox flake, not the edit; the Outcome says so. |
| R8: accepted the reviewer's Important 2 and fixed it with an override sentence in the template. | The Prior round text conflicted with Your Job and Report Format on a fresh fix dispatch. | c4d800d | One extra sentence; the plan text was amended by this ruling. |
| R9: accepted the reviewer's Important 1 and re-baselined with `EVAL_REF=eb68fe1` at 5 runs, compared on dispatched runs. Corrected: the premise was wrong, `Agent called 0x` counts only matching calls and the old-template controllers did dispatch (verified in traces e-5sb2NZ, e-2Mc2wG against e-oJ6muF, e-AatiKg); I accepted the reviewer's reading without checking what the grader line counts. | The first baseline looked like it never dispatched; it did, with the old text. | `plugin-evals/results/implementer-reads-tdd-20261019T170344`, `dispatch-names-shape-20261019T170834` | About 40 eval runs spent on a finding that needed no new data. |
| R10: embedded eval prompts in `plan.md` fenced with tildes instead of four backticks. | Four-backtick fences desynced `task-brief`'s fence tracking: the Task 1 brief swallowed later tasks and Task 2 would have truncated; all five briefs verified to start and end inside their own task. | dfadd82 | None; plan formatting only. |
| R11: Task 3 also edits two stale resume instructions the plan's grep misses and adds four `check_absent` checks first. Later dropped with R13. | Spec Goal 3 made fresh the default, so leaving the Common Rationalizations row and the Example Workflow line contradicted the skill. | — | Two more prose edits in a file Task 3 already touched; moot after R13. |
| R12: redesign the `fix-round-consolidated` prompt around an idle implementer reachable by `SendMessage`, one attempt, with a decision gate before any SKILL.md edit. | That is the case the flip changes: the old skill says resume, the new one says fresh. | — | One more eval round; a dropped Task 3 leaves spec Problem 3 and Goal 3 unmet. |
| R13: the fresh-by-default fix-round flip is dropped, and so are R11's two stale-text edits and the four checks. | `SendMessage` was not callable in the eval sandbox (ToolSearch found no match in 9 of 10 runs) and the redesigned eval passed the grader in 2 of 5 with-plugin and 2 of 5 without runs; the spec lands an idea only if an eval shows the gap. | `plugin-evals/results/fix-round-consolidated-20261019T180714` | Spec Problem 3 and Goal 3 stay unmet; the spec annotates them as dropped. |
| R14: Task 3 restructured to the `fix-round-consolidated` eval for Task 1's Prior round block, with its baseline rerun on `eb68fe1`; the Task 1 static check `fix rounds 1-3 go fresh` deleted. | The first-version prompt (implementer no longer running) separates the block (5 of 5 with plugin on HEAD, 0 of 5 without); the deleted check could never go green. Plan rewritten (8054b47, 1e3dc55; my first rewrite lost Step 1 because `index()` matched Task 2's identical step title, restored from dfadd82). | `plugin-evals/results/fix-round-consolidated-20261019T180042` | Task 1's block gets its evidence at the cost of one more eval run. |
| R15: committed the implementer's verified Task 3 files myself and relaxed the plan's stop gate to a majority of dispatched runs. | The gate was mine and set at zero tolerance, too strict for a stochastic eval at n=5; 1 of 5 to 5 of 5 with plugin and 0 of 5 to 0 of 5 without separates old from new (one-sided Fisher exact about 0.02, my calculation). | ba79a86, 8edc65e | The Outcome could overstate; the table reports 1 of 5 and the one old-skill pass. |
| R16: Task 4's `four-lines` grader changed from `llm` to a regex on the final reply, and the eval prompt's last sentence asks how the work was decomposed. | The `llm` judge sees only the final message (found twice), so "or in a file" was unverifiable; the new sentence does not leak the four labels to the no-plugin arm. | a453f94 | A reply that paraphrases the labels fails the regex even if it wrote a checkpoint. |
| R17: the throughput checkpoint is dropped. | The eval did not move (0 of 5 to 0 of 5); controllers wrote prose in every run and already addressed the shared `src/config.js` write before the edit; the spec lands an idea only if an eval shows the gap. | `plugin-evals/results/checkpoint-before-fanout-20261019T183536`, `-20261019T183934`, `dropped-task-4/` | Spec Problem 4 and Goal 5 stay unmet and are annotated as dropped; a stronger-wording follow-up with its own eval is the way back. |
| R18: Task 5 reruns only the 3 existing suites that mention subagents or allow the Agent tool, not all 14. | `git diff --stat eb68fe1 HEAD -- skills` shows only two `subagent-driven-development/` files changed, no skill description or bootstrap file changed, and no other existing eval can load SDD; 18 sessions instead of about 84. | `git diff --stat eb68fe1 HEAD -- skills` | An unrelated regression goes undetected, which needs a path from an untouched skill to the edited files and I found none. |
| R19: Task 5's regression threshold was "a drop of 2 or more runs out of 3 is flagged, rerun at 5", set in my dispatch, not the brief's "any drop is a regression, stop and report BLOCKED". | Zero tolerance is too strict for n=3 on a stochastic eval (same reasoning as R15); the threshold was set before the reruns. | — | A real one-run regression could hide inside the threshold; the one lower grader is named in the Outcome. |
| R20: final-review triage. Fix before merge: the TDD conditionals, the override width, the cross-family precedence and the Prior round caller in SKILL.md. Fold in four cheap spec edits and persist the cited result directories into `plugin-evals/results/`. Ship as-is: `skills_dir` header, the grader-regex minors, the haiku-accepting grader, the ledger separator, the mid-line annotation, the Task 3 report arm mapping. | One fix wave is all the process allows; the four fixed items are contradictions a reader hits on a normal run. | 58c8fc5 | The shipped skill keeps small misleading lines; residuals are adjudicated afterwards. |
| R21: the `spec.md:278` residual is real but not structural, and is parked for the human with the corrected cell ready: "old controllers carried brief, report, finding and the ruling's substance 5 of 5, but the ruling verbatim and in order only 1 of 5 (the others wrapped `cancelled` in backticks, which the grader's regex does not allow); what the block adds is verbatim, in-order copying". | The process allows no second fix wave; the error came from my own instruction in the fix brief, not from the implementer. | `plugin-evals/results/fix-round-consolidated-20261019T182331` | The committed Outcome carries one false interpretive sentence until the human fixes it; the headline counts 1 of 5 to 5 of 5 are the grader's counts and stand. |
| R22: the residual Minors and out-of-scope notes from the re-review ship as they are. They are the Report Format ambiguity, the over-claiming "as the Review tasks paragraph allows", two short broken lines kept so a test string stays on one line, the final-review fix wave not naming the template, step 4 (commit) cancelled by the override, a single-family final reviewer unable to be both most capable and a different tier, and `carries-scope` measuring verbatim formatting. | The last two predate this wave; none breaks a run. | — | Small wording ambiguities in two skill files; the human can send them as a follow-up. |

## Verdict

request changes. This is the assessment of the reviewers, not an approval: the final reviewer (Claude Fable 5.1) said "With fixes"; the scoped re-review (Claude Opus 5.5) found Important 1-4 addressed and one new Important open (finding 10, a false sentence in the spec's Outcome, corrected cell in R21). Merge approval is the human partner's.
