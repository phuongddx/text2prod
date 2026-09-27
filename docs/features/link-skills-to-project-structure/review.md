# Review: link-skills-to-project-structure

Reviewer: Claude subagents (per-task reviewers + final whole-branch reviewer); human approval pending
Date: 2026-09-27
Plan under review: `plan.md` in this directory

## Passes

Run each pass and tag every finding with its pass:

- **Bugs** — logic errors, broken edge cases, subtle regressions.
- **Security** — injection risks, auth gaps, secrets/PII exposure.
- **Compliance** — the diff matches the plan and repo conventions.

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
| 1 | Important | Compliance | `skills/using-text2prod/references/feature-artifacts.md` | A `docs/text2prod/` mention lacked "legacy" on its line (the plan's own text). Fixed in `83e97bd`. |
| 2 | Important | Bugs | `skills/brainstorming/SKILL.md` | Eval S1 found no Gaps note after a bounded→architectural upgrade; S2 found update-vs-new not asked. Fixed in `afcf482`; re-run passed. |
| 3 | Important | Bugs | `skills/brainstorming/SKILL.md` | No skill set `Status: approved`. Fixed in `878cc49`. |
| 4 | Important | Bugs | `skills/brainstorming/SKILL.md` | Bounded path could write `intent.md`, contradicting the contract. Fixed in `629565d`; eval S7 passed. |
| 5 | Important | Compliance | `ARCHITECTURE.md` | `.agents/` row pointed at an uncommitted folder. Fixed in `a515266`. |
| 6 | Nit | Bugs | `skills/brainstorming/SKILL.md:89-91` | The upgrade rule lists "write `intent.md` in feature mode" generically. It is scoped by "heavier path's earlier steps", so it stands. Optional tightening: "…when upgrading to architectural". |
| 7 | Nit | Bugs | `tests/feature-artifacts/` | Static checks are presence-only, and the guard accepts any line containing "legacy". Behavior is covered by evals. |
| 8 | Nit | Bugs | `skills/subagent-driven-development/scripts/sdd-workspace` | A feature folder `foo/` and a legacy plan `foo.md` would share a workspace. Legacy plans are date-prefixed, so this is unlikely. |
| 9 | Nit | Compliance | `AGENTS.md:17` (= `CLAUDE.md`) | Still calls `plans/` "ephemeral in-flight". Never-touch file, so left for the human. |
| 10 | Nit | Bugs | eval S7 | The model treated the change as a bounded fix to `calculator` without literally asking update-vs-new. The criteria allowed this, but the skill text says "always ask". |

Also fixed during the final fix wave, without their own rows: 7 more nits (legacy wording scope, slug-if-exists, spike note, bounded graph, over-staging, abandoned-PR status, SDD placeholder, README). Evidence for all behavior changes is in `eval-report.md` (7 scenarios, final verdict GO).

## Verdict

approve — no open Important findings. All Important findings were fixed and re-verified: static suites green and real-session evals GO. Merge approval is the human's.

Promotion: none proposed. This branch's durable knowledge already landed in `docs/feature-workflow.md` and `ARCHITECTURE.md` as planned edits, and this repo has no `docs/engineering/`.
