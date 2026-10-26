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
"Before fix" is the first full run (`--ablation with-without`, cost $22.65);
"after" reruns the case on the final text (`--ablation none`).

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
suite passes, and evals show lift on items 4 (routing), 6, 7, 8 and 9;
items 1, 3 and 5 landed without measured lift by ruling, and item 2's
eval is inconclusive in this sandbox.
