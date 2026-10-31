# Spec: zed-mode parity with poteto-mode

Status: approved
Date: 2026-10-26
Updated: 2026-10-31 (orchestrate supervision rules from pstack 0.15.36)
Related: `docs/features/pstack-migration/spec.md` (deferred every item below as a later feature)

## Problem

`zed-mode` (renamed from `using-text2prod` on `refactor/zed-mode-rename`)
is the session router every text2prod user gets at session start. A
read-only comparison against pstack 0.15.25 `poteto-mode` found nine
behaviors it lacks or has only inside one skill. A grep of `skills/`, `agents/` and `.agents/`
plus a read of the nearest files, found:

1. Reply-writing rules (no long dash, no colon connector, frame impact
   for consumer and maintainer, never fabricate a link).
2. Classify a question before asking it: an observable fact is
   prototyped, not asked. Partial today: `investigation.md` step 4 and
   `prototype.md` route a probe through `brainstorming`'s spike path,
   but that path asks the human to approve the probe, and no
   session-wide rule stops an `AskUserQuestion` on an observable fork.
3. Full-autonomy grant rules: apply a default, report it, say in plain
   words what the operator could ask for instead.
4. Adversarial multi-reviewer pass on a contested design (`interrogate`).
5. A decision trail written during long or unattended work
   (`show-me-your-work`). Partial today: `templates/review.md`
   `## Decisions` records rulings, copied from the plan ledger at finish
   time, and `autonomous-run.md` step 5 writes a row per iteration
   there or in the reply. A run with no feature folder, or one that
   stops before the reply, leaves no trail on disk.
6. A checklist before reporting a measured number
   (`benchmark-checklist`). Partial today: `perf-issue.md` step 1 applies
   `explain-the-number` to every number. Missing: the questions on
   tuning, errors, repeatability and whether the work ran, and any rule
   for numbers measured outside the perf playbook.
7. Model tiering for delegates outside `subagent-driven-development`.
   That skill's `## Model Selection` (`SKILL.md:184`) already tiers
   fast, standard and most capable, and `references/codex-tools.md:62`
   maps it to Codex spawns. A delegate from `bug-fix.md` step 4 or any
   other playbook gets no rule.
8. Triage of automated review-bot comments. Partial today: `babysit.md`
   step 8 triages bot reviews skeptically, but only inside babysit, with
   no fix / dismiss / ask rubric.
9. Ten playbooks (`eval`, `authoring-a-skill`, `hillclimb`,
   `runtime-forensics`, `trace-forensics`, `visual-parity`,
   `orchestrate`, `autopilot-full`, `autopilot-stack`,
   `worktree-cleanup`) and the `figure-it-out` fallback.

A follow-up on item 9: pstack 0.15.36 (`c742dd6`, cursor/plugins PR
#1043) rewrote its Orchestrate playbook and added three supervision
rules that text2prod's `playbooks/orchestrate.md` lacks. Today a
coordinator drains a completion by appending a row from the worker's
report, so a report that claims "in scope, tests pass" over a diff that
also edits `package.json` is recorded as fact (R1, R3). Its reply
reports state counts from ledger rows, which come from those reports,
so a PR that went red after its last row is reported green (R2). The
playbook checks live PR state only on resume.

Who it costs. A user who steps away from an autonomous run gets no
record of why the agent chose what it did (5). A skill author has no
playbook that routes the eval evidence `CLAUDE.md` requires (9,
`eval`). The router answers "no playbook fits" with nothing (9,
`figure-it-out`). Delegates run on whatever model the harness defaults
to outside `subagent-driven-development`, so a mechanical edit and a
concurrency fix from the bug-fix playbook get the same model (7). A
user who checks in on an orchestrated program twice a day gets a status
built from what workers said, not from the diffs and PRs (9, R1-R3).

## Context read

- `CLAUDE.md`: skill content edits need eval evidence and `writing-skills`; zero dependencies.
- `ARCHITECTURE.md`, `docs/engineering/conventions.md` (Evals section: baseline first, drop the edit when the baseline passes).
- `docs/features/pstack-migration/spec.md`: Non-goals list these items as later features; Cursor-only parts excluded.
- `skills/zed-mode/SKILL.md` (960 words, injected every session), `playbooks/*.md`, `references/*.md`.
- `tests/claude-code/test-playbooks.sh`: playbook gate (table and files agree, named skills exist, credit line, forbidden Cursor tokens).
- `scripts/package-codex-plugin.sh:322-331`: generates `agents/openai.yaml` when no seed exists, so new skill folders package.
- For the 0.15.36 follow-up: `skills/zed-mode/playbooks/orchestrate.md` (step 4 Drain, step 9 Close, Resuming, Reply); `references/feature-artifacts.md:28` (names `ledger.tsv` and `briefs/`, unchanged here); `references/claude-code-tools.md` and `references/codex-tools.md` (no change needed, the edit names no harness tool); `gh pr view` and `gh pr checks` already appear in `babysit`, `shipping`, `opening-a-pr`, `autopilot-*` and orchestrate's Resuming; `plugin-evals/bot-comment-triaged/prompt.md` (fixtures are written inline in the prompt); `plugin-evals/router-opens-orchestrate/` (routing only, no behavior case).

Gaps:
- No static check bounds the size of `skills/zed-mode/SKILL.md`.
- No `references/claude-code-tools.md`; Claude Code specifics live inline.

## References

- pstack 0.15.25 `skills/poteto-mode/SKILL.md` and `playbooks/*.md` (MIT, Lauren Tan): source for every item.
- pstack `skills/unslop`, `interrogate`, `show-me-your-work`, `benchmark-checklist`, `figure-it-out`: source for the new skills.
- pstack `docs/harness/claude-code.md`: Claude Code `Agent` takes `model` of `opus | sonnet | haiku | fable` plus `effort`; informs item 7.
- `claude plugin eval --help`: grader types `tool_used`, `tool_order`, `regex`, `file_exists`, `llm`.
- pstack 0.15.36, commit `c742dd6` and cursor/plugins PR #1043 (merged 2026-10-27): source for R1-R3. The PR syncs the playbook from an internal source skill. It gives no failure cases or eval data; its verification is static (harness-tree check, plugin validation, docs check, script tests 61 pass after deleting `orch.test.ts`). Its other changes move state to the Cursor Project tracker and store and delete the `orch` scripts; neither applies here, because text2prod never ported `orch` and keeps state in a committed ledger.

## Goals

1. Each of the nine lands in text2prod in harness-neutral form.
2. `zed-mode/SKILL.md` stays small enough to inject every session: at most 1300 words, enforced by a static test.
3. Every new playbook and skill passes `test-playbooks.sh`, carries the pstack credit line, and names no Cursor-only tool.

## Non-goals

- `swarm`, `arena`, `architect`, `how`, `why`, `ketchup`, `technical-writing`, `deslop`, `no-comments`. Steps that name them carry `skip: skill not ported yet` or point at the text2prod equivalent (`dispatching-parallel-agents`, `brainstorming`, `comment-sicko`).
- pstack scripts that need Bun or `commander` (`scripts/orch`, `watch-pr`, `check-plan.mjs`). Playbook steps that call them become prose steps.
- Editing `brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `finishing-a-development-branch`.
- From pstack 0.15.36: the Project tracker and store, one owner per PR, a verifier on every PR, forking a worker for its built state (a Claude Code fork copies the coordinator, not a worker; a worker's built state already persists in its worktree), sub-coordinator sampling, and the slimmer brief. Rules 0.15.36 restates that `orchestrate.md` already has (liveness by pushes, never messaging a worker to check on it, retry by cause, a verdict per head SHA) are not re-added.
- A Codex eval runner.

## Constraints

- Zero runtime dependencies. Ported scripts are plain bash: `show-me-your-work/scripts/log.sh` (42 lines) and `worktree-audit.sh` (126 lines) qualify after a dependency check.
- Every content edit ships with an eval. The drop-on-baseline rule is waived for this feature (see Decision).
- Forbidden tokens from `test-playbooks.sh` apply to every new file: no `grok`, `-xhigh`, `Cursor`, `AskQuestion`, `generalPurpose`, `setup-pstack`, `poteto`.
- Session context budget: rules go in `SKILL.md` as one-line triggers; detail goes in `references/` or the new skill.
- Target harnesses are Claude Code and Codex only. OpenCode and Cursor are not validated. Playbook text names no harness tool, so both harnesses read it the same way.

## Design

### Where each item lands

| # | Item | Lands in | Harness adaptation |
| --- | --- | --- | --- |
| 1 | Reply-writing rules | `references/writing-the-reply.md`, one trigger line in `SKILL.md`; new `unslop` skill | Stated as a default. A user output style or instruction file overrides it. |
| 2 | Classify before asking | `SKILL.md` Autonomy, three sentences | None. |
| 3 | Full-autonomy grant | `SKILL.md` Autonomy, three sentences | None. |
| 4 | Contested design | new `interrogate` skill, trigger line in `SKILL.md` | "Different model family" becomes "a different model when the harness offers one; otherwise independent angles on the same model", matching `plugin-evals/reviewer-different-family`. |
| 5 | Decision trail | new `show-me-your-work` skill with `scripts/log.sh`; step in `playbooks/autonomous-run.md` | Transcript audit reads the harness's own transcript path, named per harness in `references/`. |
| 6 | Measured number | new `benchmark-checklist` skill; step in `playbooks/perf-issue.md` | None. |
| 7 | Model tiering | One `SKILL.md` line: every delegate picks its model per `subagent-driven-development` Model Selection. No new tier table. | Already harness-neutral. Codex mapping exists at `references/codex-tools.md:62`. Claude Code gets one line there or in a new `references/claude-code-tools.md`: `model` plus `effort`. |
| 8 | Review-bot triage | `references/review-bot-triage.md`; step in `playbooks/babysit.md` | Generic "automated reviewer" (any bot that comments on a PR), not one product. |
| 9 | Ten playbooks plus `figure-it-out` | `playbooks/*.md`, new `figure-it-out` skill, rows in the router table | `orchestrate` and `autopilot-*` use worktree-isolated subagents and `gh`; cloud agents and `orch` become prose steps. `worktree-cleanup` ships `worktree-audit.sh` if it passes the dependency check. `orchestrate` later took three supervision rules from pstack 0.15.36 (`c742dd6`); see Orchestrate supervision rules. |

### Phases

Each phase is one commit group with its eval evidence. A later phase
never edits an earlier phase's files.

0. **Levers.** Static test for the `SKILL.md` word budget. Port `playbooks/eval.md` and `playbooks/authoring-a-skill.md` first, because every later phase uses them. `authoring-a-skill` routes to `writing-skills`.
1. **Session rules.** Items 2, 3, 7, and the item 1 trigger line plus `references/writing-the-reply.md`.
2. **Skills.** `unslop`, `benchmark-checklist`, `show-me-your-work`, `interrogate`, and `references/review-bot-triage.md` (items 1, 4, 5, 6, 8), with their trigger lines and playbook steps.
3. **Playbooks.** `figure-it-out` and the remaining eight playbooks (item 9), riskiest first: `orchestrate`, `autopilot-full`, `autopilot-stack`, then the rest.
4. **Orchestrate supervision.** The two eval cases (rows 10 and 11 below) with a baseline run on the unedited plugin, then the `orchestrate.md` edit and its eval run.

### Orchestrate supervision rules (pstack 0.15.36)

Three rules, all in step 4 (Drain), because that step already runs
before any report:

- **R1.** Read the pushed diff or artifact, not only the worker's report.
- **R3.** Work outside the brief's SCOPE, or past what it asked, gets a
  `fail` row naming the extra paths and goes to a fix unit. Only fixes
  that block landing stay; the rest park as follow-ups. This reuses the
  existing `fail` to fix-unit path, so the ledger gains no state.
- **R2.** Before a report, check each open PR with `gh pr view` and
  `gh pr checks`, not its last ledger row, and append a row where they
  disagree. The Reply reports each PR's live state.

Step 4 today says a diff that needs review "becomes a verifier unit,
never a drain task". pstack's old text said the same, and 0.15.36
reverses it. The two are reconciled by depth: the coordinator reads a
diff to check scope and that the work exists; a full review is still a
verifier unit, so a drain stays cheap.

```diff
-4. **Drain** between tasks and before any report. Append a row per completion, commit, push, then spawn the next window. A diff that needs review becomes a verifier unit, never a drain task.
+4. **Drain** between tasks and before any report. For each completion, read the pushed diff or artifact, not only the worker's report. Work outside the brief's SCOPE or past what it asked gets a `fail` row naming the extra paths and goes to a fix unit; keep only fixes that block landing and park the rest as follow-ups. Before a report, check each open PR with `gh pr view` and `gh pr checks`, not its last row, and append a row where they disagree. Append a row per completion, commit, push, then spawn the next window. A diff that needs a full review becomes a verifier unit, never a drain task.
```

```diff
-**Reply:** the predicate and state counts from the ledger, what landed with PR links, abandoned units and why, open gates, the ledger and trail paths, and the `Attention` section the `show-me-your-work` skill requires.
+**Reply:** the predicate and state counts from the ledger, each PR's live state and verdict with its link, abandoned units and why, open gates, the ledger and trail paths, and the `Attention` section the `show-me-your-work` skill requires.
```

Unchanged: the brief template, the ledger columns and states,
`feature-artifacts.md`, `SKILL.md`, both harness references, the credit
line, and `LICENSE` (its pstack notice already covers
`skills/zed-mode/`).

### Evals

Twenty-one `plugin-evals/` cases tagged `zed-parity`, run on the edited
plugin with `--ablation with-without` as regression guards.

| # | Case | Scored graders |
| --- | --- | --- |
| 1 | `reply-has-no-long-dash` | `regex` fails on U+2014 in the reply; `llm` checks the explanation is correct |
| 2 | `observable-fork-not-asked` | `llm` on the trace: a sketch ran before the recommendation |
| 3 | `autonomy-default-reported` | `llm`: the product call is a stated default with a reason and a plain-words alternative |
| 4 | `contested-design-interrogated` | `Skill` `interrogate` (`arm: both`); `Agent` at least twice |
| 5 | `unattended-run-logs-trail` | `regex` over files finds a `.tsv` log; the migrated file no longer calls the old API |
| 6 | `speedup-vetted` | `Skill` `benchmark-checklist` (`arm: both`); `llm`: the short runs are flagged before the claim |
| 7 | `delegate-gets-tier` | two `Agent` graders: the mechanical task does not name `opus`, the design task does |
| 8 | `bot-comment-triaged` | `llm`: the real bug is fixed; `regex`: the nit was not applied; `llm`: the nit is declined with a reason |
| 9 | `router-opens-<playbook>` (10) and `router-falls-back-figure-it-out` | `Read` of `zed-mode/playbooks/<name>.md`; for the fallback, `Skill` `figure-it-out` plus an `llm` on the framing |
| 10 | `orchestrate-drain-checks-diff` (R1, R3) | Setup inline in `prompt.md`: a coordinator mid-program with ledger rows for u1-u3; u3's report says "done, SCOPE `src/api/**` only, tests pass"; the agent creates the ledger and `out/u3.patch`, whose diff also adds a dependency to `package.json`; "drain u3 and tell me where we stand". `regex` over files: no `pass` row for u3 in `ledger.tsv`. `llm`: the reply names `package.json` as out of scope and routes it to a fix unit or a follow-up |
| 11 | `orchestrate-report-checks-live-pr` (R2) | Ledger shows `#41 pass` and `#42 built`; "morning check-in, where's the program?" `tool_used` Bash, `input_match` `gh pr (view\|checks)`. `llm`: when `gh` fails, the reply says live state could not be confirmed rather than restating ledger rows as fact |

Cases 10 and 11 are tagged `[zed-parity, orchestrate]`, five runs per
arm. R1 has no case of its own: the sandbox writes fixtures from the
prompt, so the coordinator always sees the diff, and R1's only
observable effect is R3's.

## Error handling

- Baseline already passes: the edit still lands (see Decision); the run is recorded in `review.md`.
- A ported script fails the dependency check: the playbook step becomes prose, recorded in `review.md`.
- A step names an unported skill: `skip: skill not ported yet` with the pstack name.
- `SKILL.md` over budget: move text to `references/` before landing; the static test blocks the commit group.
- Case 10 or 11 fails on the edited plugin: revise the wording and rerun, at most two rounds. Still failing: record a `review.md` finding and ask the human partner before landing.
- `gh` missing or unauthenticated in the eval sandbox: the expected path. The `tool_used` grader counts the attempt; the `llm` grader checks the reply says live state is unconfirmed.

## Testing

- Static: `tests/claude-code/test-playbooks.sh` (table count rises to 23), a new budget check in the same file, `tests/codex/test-package-codex-plugin.sh` for the new skill folders, `scripts/lint-shell.sh` for ported scripts.
- Behavior: the eval table above, each run with `--ablation with-without`, per-run evidence copied from `--json` into `review.md`.
- Harness coverage: `claude plugin eval` runs on Claude Code only, and the repo has no Codex eval runner. Codex parity for the orchestrate edit rests on harness-neutral wording and `test-playbooks.sh` (forbidden tokens, the force-push rule).

## Decision

The human partner approved this spec on 2026-10-26 and ruled that all
nine land regardless of baseline, overriding `conventions.md`'s drop
rule for this feature. Evals still ship, as regression guards run on
the edited plugin, and their results go in `review.md`.

On 2026-10-31 the human partner chose to cherry-pick R1-R3 from pstack
0.15.36 rather than mirror its rewrite, to record the change in this
feature, and to land all three regardless of baseline. The drop rule is
waived for R1-R3 as well. Cases 10 and 11 ship as regression guards,
with their baseline and edited-plugin runs in `review.md`.
