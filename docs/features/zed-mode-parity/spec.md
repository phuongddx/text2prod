# Spec: zed-mode parity with poteto-mode

Status: approved
Date: 2026-10-26
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

Who it costs. A user who steps away from an autonomous run gets no
record of why the agent chose what it did (5). A skill author has no
playbook that routes the eval evidence `CLAUDE.md` requires (9,
`eval`). The router answers "no playbook fits" with nothing (9,
`figure-it-out`). Delegates run on whatever model the harness defaults
to outside `subagent-driven-development`, so a mechanical edit and a
concurrency fix from the bug-fix playbook get the same model (7).

## Context read

- `CLAUDE.md`: skill content edits need eval evidence and `writing-skills`; zero dependencies.
- `ARCHITECTURE.md`, `docs/engineering/conventions.md` (Evals section: baseline first, drop the edit when the baseline passes).
- `docs/features/pstack-migration/spec.md`: Non-goals list these items as later features; Cursor-only parts excluded.
- `skills/zed-mode/SKILL.md` (960 words, injected every session), `playbooks/*.md`, `references/*.md`.
- `tests/claude-code/test-playbooks.sh`: playbook gate (table and files agree, named skills exist, credit line, forbidden Cursor tokens).
- `scripts/package-codex-plugin.sh:322-331`: generates `agents/openai.yaml` when no seed exists, so new skill folders package.

Gaps:
- No static check bounds the size of `skills/zed-mode/SKILL.md`.
- No `references/claude-code-tools.md`; Claude Code specifics live inline.

## References

- pstack 0.15.25 `skills/poteto-mode/SKILL.md` and `playbooks/*.md` (MIT, Lauren Tan): source for every item.
- pstack `skills/unslop`, `interrogate`, `show-me-your-work`, `benchmark-checklist`, `figure-it-out`: source for the new skills.
- pstack `docs/harness/claude-code.md`: Claude Code `Agent` takes `model` of `opus | sonnet | haiku | fable` plus `effort`; informs item 7.
- `claude plugin eval --help`: grader types `tool_used`, `tool_order`, `regex`, `file_exists`, `llm`.

## Goals

1. Each of the nine lands in text2prod in harness-neutral form.
2. `zed-mode/SKILL.md` stays small enough to inject every session: at most 1300 words, enforced by a static test.
3. Every new playbook and skill passes `test-playbooks.sh`, carries the pstack credit line, and names no Cursor-only tool.

## Non-goals

- `swarm`, `arena`, `architect`, `how`, `why`, `ketchup`, `technical-writing`, `deslop`, `no-comments`. Steps that name them carry `skip: skill not ported yet` or point at the text2prod equivalent (`dispatching-parallel-agents`, `brainstorming`, `comment-sicko`).
- pstack scripts that need Bun or `commander` (`scripts/orch`, `watch-pr`, `check-plan.mjs`). Playbook steps that call them become prose steps.
- Editing `brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `finishing-a-development-branch`.

## Constraints

- Zero runtime dependencies. Ported scripts are plain bash: `show-me-your-work/scripts/log.sh` (42 lines) and `worktree-audit.sh` (126 lines) qualify after a dependency check.
- Every content edit ships with an eval. The drop-on-baseline rule is waived for this feature (see Decision).
- Forbidden tokens from `test-playbooks.sh` apply to every new file: no `grok`, `-xhigh`, `Cursor`, `AskQuestion`, `generalPurpose`, `setup-pstack`, `poteto`.
- Session context budget: rules go in `SKILL.md` as one-line triggers; detail goes in `references/` or the new skill.

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
| 9 | Ten playbooks plus `figure-it-out` | `playbooks/*.md`, new `figure-it-out` skill, rows in the router table | `orchestrate` and `autopilot-*` use worktree-isolated subagents and `gh`; cloud agents and `orch` become prose steps. `worktree-cleanup` ships `worktree-audit.sh` if it passes the dependency check. |

### Phases

Each phase is one commit group with its eval evidence. A later phase
never edits an earlier phase's files.

0. **Levers.** Static test for the `SKILL.md` word budget. Port `playbooks/eval.md` and `playbooks/authoring-a-skill.md` first, because every later phase uses them. `authoring-a-skill` routes to `writing-skills`.
1. **Session rules.** Items 2, 3, 7, and the item 1 trigger line plus `references/writing-the-reply.md`.
2. **Skills.** `unslop`, `benchmark-checklist`, `show-me-your-work`, `interrogate`, and `references/review-bot-triage.md` (items 1, 4, 5, 6, 8), with their trigger lines and playbook steps.
3. **Playbooks.** `figure-it-out` and the remaining eight playbooks (item 9), riskiest first: `orchestrate`, `autopilot-full`, `autopilot-stack`, then the rest.

### Evals

Nineteen `plugin-evals/` cases tagged `zed-parity`, run on the edited
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

## Error handling

- Baseline already passes: the edit still lands (see Decision); the run is recorded in `review.md`.
- A ported script fails the dependency check: the playbook step becomes prose, recorded in `review.md`.
- A step names an unported skill: `skip: skill not ported yet` with the pstack name.
- `SKILL.md` over budget: move text to `references/` before landing; the static test blocks the commit group.

## Testing

- Static: `tests/claude-code/test-playbooks.sh` (table count rises to 23), a new budget check in the same file, `tests/codex/test-package-codex-plugin.sh` for the new skill folders, `scripts/lint-shell.sh` for ported scripts.
- Behavior: the eval table above, each run with `--ablation with-without`, per-run evidence copied from `--json` into `review.md`.

## Decision

The human partner approved this spec on 2026-10-26 and ruled that all
nine land regardless of baseline, overriding `conventions.md`'s drop
rule for this feature. Evals still ship, as regression guards run on
the edited plugin, and their results go in `review.md`.
