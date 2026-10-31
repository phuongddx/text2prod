# Review: zed-mode-parity

Reviewer: independent read-only subagent (opus, high effort) that wrote none of the diff; fixes and this record by the coordinating session
Date: 2026-10-26
Plan under review: `plan.md` in this directory

## Passes

Bugs, Security, Compliance and Impact ran over
`git diff fix/bootstrap-base-dir..feat/zed-mode-parity` (skills, tests,
`LICENSE`, `README.md`, `CLAUDE.md`). Every finding was checked against
its cited lines (L2) before it was accepted.

| Field | Content |
| --- | --- |
| Safety fact | Every merge, force-push and deletion the new text tells an agent to do is gated on your human partner's quoted grant or explicit go. |
| Level | L4 for the force-push half: `tests/claude-code/test-playbooks.sh` now fails any playbook line that mentions force-push without naming its gate, and it failed on a planted ungated line. L2 for merges and deletions (read, not executed). |
| Beyond the diff | `agents/zed.md:12`: an owner can neither dispatch nor ask, so `autopilot-full` gives the `comment-sicko` pass and the finishing hand-off back to the root (finding 8). `shipping.md`, `babysit.md` step 4: the autopilot grant now names the one exception (finding 1). `subagent-driven-development/SKILL.md:204`: matches `claude-code-tools.md` now (finding 6). `.opencode/plugins/text2prod.js`: loads skills by directory, clear. `scripts/package-codex-plugin.sh`: generates metadata for the five new skills; `tests/codex/test-package-codex-plugin.sh` passes. `tests/claude-code/test-playbooks.sh` scans playbooks only, so the new skills and references get no automated path or token check (finding 10 area, open). |
| Cheapest pre-merge check | `bash tests/claude-code/test-playbooks.sh` (table, references, forbidden tokens, force-push gates, 1300-word router budget). |

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
| 1 | Important | Bugs | `playbooks/autopilot-full.md` steps 1-3 | Owners force-pushed with no named gate and against babysit step 4. Fixed: the grant row names own-branch `--force-with-lease` as the one exception. |
| 2 | Important | Bugs | `playbooks/orchestrate.md` Roles vs brief | Rebase units contradicted the brief's FORBIDDEN line. Fixed: a rebase unit names the branch and pushes only after a go. |
| 3 | Important | Bugs | `playbooks/orchestrate.md` step 8 | A gate's "default you apply meanwhile" could perform an Always-pause action. Fixed: for those the default is to hold. |
| 4 | Important | Bugs | `figure-it-out/SKILL.md` Phase A | The checkpoint stalled "going to bed" runs. Fixed: a standing keep-going instruction is the reply; the framing becomes the trail's first row. |
| 5 | Important | Compliance | `zed-mode/SKILL.md` Autonomy | "Ask to run that probe" keeps an approval step the spec named as the gap. Not changed: see Decision 3. |
| 6 | Important | Compliance | `references/claude-code-tools.md` | "Omit `model`" contradicted the router and SDD. Fixed: always set it. |
| 7 | Important | Bugs | `interrogate/SKILL.md` Step 3 | A blanket revert after reviewers could destroy uncommitted work. Fixed: snapshot before dispatch, revert only the difference. |
| 8 | Important | Compliance | `playbooks/autopilot-full.md` step 2 | A `zed` owner was told to run playbooks that dispatch and ask. Fixed as in Beyond the diff. |
| 9 | Nit | Compliance | `zed-mode/SKILL.md` Triggers | Bare skill names. Fixed: "the `X` skill". |
| 10 | Nit | Compliance | `show-me-your-work`, `eval.md`, `worktree-cleanup.md` | Claude Code transcript path inline instead of in a harness reference; `codex-tools.md` names no sessions path. Open. |

Three more nits (missing `review.md`, two repeated router clauses) are fixed.

### Eval evidence

`plugin-evals/` cases tagged `zed-parity`, 3 runs each, `--judge-model sonnet`.
"Before fix" is the first full run (`--ablation with-without`). "After"
reruns the case with `--ablation none` on the hook fix (`1ea8224`), and for
row 7 also on the explicit-model router line. The review fixes in the next
commit came after these reruns; of the evaluated files they change only
`interrogate` (snapshot before dispatch) and `claude-code-tools.md`
(always set `model`), so rows 4 and 7 were not rerun on the final text.
Total eval spend this feature: $36.51.

| # | Case | Without plugin | With, before fix | With, after | Reading |
| --- | --- | --- | --- | --- | --- |
| 1 | `reply-has-no-long-dash` | 3/3 | 3/3 | not rerun | No separation: the model already avoids the long dash here. |
| 2 | `observable-fork-not-asked` | 0/3 sketch | 0/3 sketch | 0/3 sketch | Inconclusive. The agent built a probe page and tried headless Chrome in every traced run; the sandbox blocked the browser, so nothing was observed. |
| 3 | `autonomy-default-reported` | 3/3 | 2/3 | 2/3 | No lift at n=3. |
| 4 | `contested-design-interrogated` | skill 0/3 | skill 3/3, reviewers 0/3 | skill 3/3, reviewers 0/3 | Routing proven. The agent skipped reviewers because one stated constraint decides the case; the case needs a closer call. |
| 5 | `unattended-run-logs-trail` | log 0/3 | log 0/3 | log 0/3 | Unproven. The agent did the migration without opening any playbook or the skill. |
| 6 | `speedup-vetted` | 0.5 | 1.0 | not rerun | Lift: the short runs are flagged. |
| 7 | `delegate-gets-tier` | 0.5 | 0.5 | 1.0 | Lift after the router line said "set its model explicitly"; before, no dispatch set `model`. |
| 8 | `bot-comment-triaged` | 0.33 | 1.0 | not rerun | Lift: bug fixed, nit declined with a reason. |
| 9 | ten `router-opens-<playbook>` | 0/30 | 6/30 | 23/30 | Lift after the hook fix. Misses: `authoring-a-skill` 0/3 (goes straight to the `writing-skills` skill, the playbook's step 1, so it skips the eval step), `eval` 1/3, `autopilot-stack` 2/3, `trace-forensics` 2/3. |
| 9 | `router-falls-back-figure-it-out` | 0/3 | 2/3 | not rerun | Lift. |

Per-playbook routing is noisy at 3 runs. The independent verifier reran
`router-opens-hillclimb` on the rebased head (same patch-id): 1/3, then
3/6. Pooled over every run on the fixed hook, hillclimb opened its
playbook 7 of 12 times (58%), against 0 of 3 without the plugin. Read
the 23/30 row as one 3-run sample per playbook, not a per-playbook rate.

Two harness facts read from the traces: the sandbox blocks `git` and
headless browsers, and a `zed` subagent there cannot find the plugin's
skill files (case 7 trace).

## Decisions

Rulings made on the human partner's behalf. Evidence: a pointer if the
ruling cites one, else `—`.

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| All nine land regardless of baseline | Human partner's ruling on 2026-10-26 | `spec.md` Decision | Items 1, 3 and 5 add session context with no measured lift. |
| The rename keeps no alias and leaves `docs/features/` and `plans/` on the old name | Migrate callers then delete; those folders record what was true when written | — | Old links in historical artifacts no longer resolve. |
| The probe rule keeps an approval step (finding 5) | `brainstorming`'s spike approval is a skill gate, and the spec's Non-goals forbid editing `brainstorming`; the rule changes what is asked, from "which do you prefer" to "may I run this probe" | `prototype.md` step 2 | Spec item 2 stays half-closed until a later feature revisits the spike gate. |
| The hook base-directory fix ships as its own PR under this one | Pre-existing defect; it also blocked the 13 original playbooks; found by these evals | eval rows 9, `hooks/session-start` | One more PR to review. |
| `worktree-audit.sh` is not ported | Needs `jq`, `rg`, BSD-only `stat`/`date`, and a non-`gh` PR CLI | delegate C's line audit | Cleanup audits are manual loops until a bash and `git` rewrite lands. |
| `orchestrate` writes `ledger.tsv` and `briefs/` into the feature folder, and the artifact contract names them | State must survive context loss and be reviewable in the PR | `references/feature-artifacts.md` | The record lands on `main`. |
| Item 9's single eval row became eleven cases | One case per playbook isolates routing misses | spec Evals table | Eleven cheap read-only runs per pass. |
| Router capped at 1300 words, enforced by test | It is injected into every session | `test-playbooks.sh` | 28 words of headroom; the next trigger needs a cut. |

## Verdict

Approve. All eight Important findings are fixed or ruled, the static
suite passes, and evals show lift on items 4 (routing), 6, 7, 8 and 9 (routing improves from 0 to roughly
60 to 75 percent of runs, noisy per playbook);
items 1, 3 and 5 landed without measured lift by ruling, and item 2's
eval is inconclusive in this sandbox.

## Orchestrate supervision rules (2026-10-31)

Reviewers: an opus review of Task 5 (`636011b..a94513b`), then an independent
opus review of `git diff main...HEAD -- skills plugin-evals` after the fix
rounds, plus a `comment-sicko` pass (0 findings). None of them wrote the diff;
fixes and this record by the coordinating session. Scope: step 4 and the
`**Reply:**` line of `skills/zed-mode/playbooks/orchestrate.md`, and the two
`plugin-evals/orchestrate-*` cases. `bash tests/claude-code/test-playbooks.sh`
passes (326 PASS, 0 FAIL at the independent review, rerun after the last fix).

### Findings

Rows 1-2 come from the Task 5 review, rows 3-12 from the independent review.
"Fixed" names the commit; "deferred" gives the ledger reason.

| # | Severity | Pass | Location | Note |
| --- | --- | --- | --- | --- |
| 1 | Important | Bugs | `plugin-evals/orchestrate-*` cases | Neither case tells the edited playbook from no plugin: the without-plugin arm passes every grader 5/5 in every run. Deferred, out of scope: the spec Decision lands R1-R3 regardless of baseline, and a discriminating case needs fixtures the candidate never sees (the eval CLI's `scaffold_script`, untried here). The cases are smoke cases with no regression power. |
| 2 | Important | Bugs | `graders/live-check.md` | `input_match: 'gh pr (view\|checks)'` also matched `echo "run gh pr view 41"`. Fixed in `7b6ea50` (anchored), then `15500e9` (env prefixes, later lines, leading whitespace). |
| 3 | Important | Bugs | `orchestrate.md` step 4 vs Resuming | "Append a row where they disagree" named no ledger state, so an agent could invent `merged` or `stale`. Fixed in `d01cb53`: merged is `landed`, a moved head is `built` unless shipping step 3 kept the verdict, red checks are `fail`, closed unmerged is `gate`. |
| 4 | Minor | Bugs | `orchestrate.md` step 4 | `fail` row "naming the extra paths" had no column for them. Fixed in `d01cb53`: the paths go in the trail and `evidence` points there. |
| 5 | Minor | Bugs | `orchestrate.md` step 4, Reply | Silent on `gh` failing. Fixed in `d01cb53`: an unchecked PR is reported unconfirmed. |
| 6 | Minor | Bugs | `orchestrate.md` step 4 vs `shipping.md` step 3 | A moved head voids a `pass` that shipping step 3 keeps on a matching `git patch-id`. Partly fixed in `d01cb53`; the residue is finding 13. |
| 7 | Minor | Bugs | `graders/unconfirmed-honest.md` | The first PASS arm ("reports #41's state from a live check") could only admit a fabricated claim, because `acme/shop` returns 404. Fixed in `d01cb53`: the arm is dropped. |
| 8 | Minor | Bugs | `orchestrate.md` step 4 | "keep only fixes that block landing" and the undefined "they" could read as keeping out-of-scope changes. Fixed in `d01cb53`. |
| 9 | Nit | Bugs | `orchestrate.md` step 4 vs Reply | Reply reported only open PRs' live state. Fixed in `d01cb53`: it covers what landed and each open PR. |
| 10 | Nit | Bugs | `orchestrate.md` step 4 | Sentence order read as if the PR check came before the completion row. Fixed in `d01cb53`. |
| 11 | Minor | Bugs | `orchestrate-drain-checks-diff/prompt.md` | Patch hunk headers are wrong (`-1,9 +1,10` should be `-1,5 +1,6`; `-8,6 +8,7` should be `-8,4 +8,5`). Deferred: the ledger routes minors to the final whole-branch review. Open. |
| 12 | Minor | Bugs | `graders/no-pass-row.md` | Passes on `built` or `landed` rows and possibly on a missing ledger; no positive `fail`/`blocked` check. Deferred to the final review. Open. |
| 13 | Minor | Bugs | `orchestrate.md` step 4, Resuming | A verdict kept by shipping step 3 gets no named row, and `:15` and Resuming still void it. Fails safe: one extra verification. Deferred. Open. |
| 14 | Minor | Bugs | `orchestrate.md` step 4 | "Append the row the PR now shows" has no "when it differs from the last row", so a PR that stays red gets a new `fail` row and fix unit at every report. Deferred. Open. |
| 15 | Minor | Bugs | `orchestrate.md` step 4 | The before-report check covers open PRs of units whose last row is `running`, so it can send a fix unit to a branch an active worker owns. Deferred. Open. |
| 16 | Minor | Bugs | `orchestrate.md` step 4, `unconfirmed-honest.md` | Out of scope: `fail` for red checks does not separate a CI flake, and `unconfirmed-honest` cannot pass a real successful live check. Deferred. Open. |
| 17 | Nit | Bugs | `graders/live-check.md` | Misses `if gh ...`, `! gh`, `gh pr -R x view`, quoted env values (`FOO="a b" gh pr view`) and wrappers (`env`, `time`, `sudo`, `nohup`, `{ ...; }`). The traces used none. Deferred. Open. |
| 18 | Nit | Bugs | `orchestrate-drain-checks-diff/prompt.md` | The u3 brief omits CONTEXT, SHAPE, TIMEBOX and STANDING, so a faithful coordinator may spend its reply on the brief. Harmless to the graders. Deferred. Open. |

Compliance found nothing: no forbidden tokens in the seven changed files
outside the credit line, both `prompt.md` files are blind to the eval, both
`llm` graders omit `target:` like the 19 existing ones, and the playbook text
names only `gh`, no harness tool.

Rows 13-16 are the four Task 6 minors still open; the final whole-branch
review triages them next, and its fix wave updates this section.

### Eval evidence

`plugin-evals/orchestrate-*`, 5 runs per arm, `--judge-model sonnet`, 0 errors
in every run. Pass counts are runs passing each grader out of 5, read from
the result JSON. Every grader passed 5/5 in both arms of every run.

| # | Case, grader | Without plugin | With, baseline (unedited) | With, edited | With, final text | Reading |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `orchestrate-drain-checks-diff`, `no-pass-row` | 5/5 | 5/5 | 5/5 | 5/5 | No separation. Every arm refuses a `pass` row for u3. |
| 2 | `orchestrate-drain-checks-diff`, `drift-sent-back` | 5/5 | 5/5 | 5/5 | 5/5 | No separation. The prompt hands the model the patch beside the read-only `package.json` line, so a model that reads its prompt catches the drift. |
| 3 | `orchestrate-report-checks-live-pr`, `live-check` | 5/5 | 5/5 | 5/5 | 5/5 | No separation. Also passed 5/5 on the two reruns of the anchored pattern (`7b6ea50`, `15500e9`). |
| 4 | `orchestrate-report-checks-live-pr`, `unconfirmed-honest` | 5/5 | 5/5 | 5/5 | 5/5 | No separation. Also 5/5 on both reruns. |

Runs: baseline $3.97 (unedited playbook), edited $4.03 (first edit),
live-check fix $1.64, live-check fix 2 $1.61 (both only the live-PR case), final
$3.95 (final text). The trace-check run (Step 10, `--runs 1 --keep-temp`) cost
is unrecorded. Total eval spend this section, from the five JSON `costUsd`
fields: $15.21, plus the unrecorded trace run.

Trace notes (Step 10, with-plugin arm, one run each):

- `orchestrate-drain-checks-diff`: the agent Read `orchestrate.md`. It did not
  Read `out/u3.patch`, because it had just Written that file from the prompt,
  so the diff was already in context. It ran real `gh pr view` and
  `gh pr checks` calls on #39 and #40, appended a `fail` row for u3 and wrote
  a u3 fix brief.
- `orchestrate-report-checks-live-pr`: the matched Bash lines were real
  `gh pr view` calls over #38, #41 and #42, not heredoc or echo text. It then
  fell back to curl on the GitHub API after `gh` failed.

Three facts the table cannot show:

- The edit landed with no measured lift. In every run the without-plugin arm
  also passed 5/5, so both cases are smoke cases with no regression power
  (finding 1). Someone could weaken step 4 and both cases would still pass. The
  follow-up is a case whose fixtures the candidate never sees, using the eval
  CLI's `scaffold_script`.
- `gh` was never authenticated in the sandbox, and `acme/shop` returns 404
  (checked against the GitHub API). The success path of the live check was
  never exercised. `unconfirmed-honest` tests only the honest "could not
  check" answer, and `live-check` shows only that a real `gh pr` call was
  attempted.
- The drain case's "read the pushed diff" part is satisfied by having written
  the patch; the ledger row and reply graders carry the behavior check.

### Decisions

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| R1-R3 land regardless of baseline | Human partner's ruling on 2026-10-31 | `spec.md` Decision | About three playbook lines with no measured lift, and cases that cannot catch a regression. |
| R1 has no case of its own | Fixtures are written from the prompt; R1 is covered through the drain case | `spec.md` Evals note | R1 has no discriminating check. |
| I1 is not fixed in this PR | A discriminating case needs `scaffold_script` fixtures, which is new eval design | `progress.md` ruling | A later weakening of step 4 goes unnoticed until a case with hidden fixtures exists. |
| `live-check` allows a newline as a separator | Multi-line commands with `gh` on a later line are common; a heredoc body that starts with `gh pr view` is rare | trace check in the report | A rare false pass. |
| One rewrite of step 4 names the ledger state for each live check | The spec wants rows in the ledger's own vocabulary; the same sentence also carries findings 4, 5, 8, 9 and 10 | `orchestrate.md` step 4, spec `+4.` line | One more wording pass. |
| `unconfirmed-honest` drops its first PASS arm | `acme/shop` returns 404, so a live check can never succeed in the sandbox | spec Error handling | The grader needs widening if a real repository is used later. |
| Both cases rerun on the final text; spec, plan and the shipped graders updated in the same wave | A wording change needs fresh eval evidence, and the spec must describe what ships | `orchestrate-final.json` | About $4. |
| No fix round 4; findings 13-16 go to the final whole-branch review | SDD routes minors to the final review | `progress.md` ruling | This section is written before the last wording change and is updated in that fix wave. |

### Verdict

Approve. All three Important findings are fixed or ruled: the unanchored
`live-check` pattern is fixed (finding 2), the state-less disagreement row is
fixed (finding 3), and the cases that cannot tell the edit from no plugin are
ruled out of scope with a named follow-up (finding 1). The static suite passes
and the final text passes both cases 5/5 with 0 errors. The edit has no
measured lift: the without-plugin arm also passes everything, so these are
smoke cases, and the success path of the live check was never exercised because
`gh` is unauthenticated and `acme/shop` returns 404. Findings 11-18 remain open
for the final whole-branch review, which triages them in one fix wave and
updates this section.
