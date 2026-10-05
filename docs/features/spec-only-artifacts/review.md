# Review: spec-only-artifacts

Reviewer: per-task reviews (sonnet) and a final whole-branch review (opus), both automated; human merge approval pending
Date: 2026-10-05
Plan under review: `plan.md` in this directory

## Passes

Run each pass and tag every finding with its pass:

- **Bugs** — logic errors, broken edge cases, subtle regressions.
- **Security** — injection risks, auth gaps, secrets/PII exposure.
- **Compliance** — the diff matches the plan and repo conventions.

Security pass: no findings. The change touches Markdown, one bash guard test and version strings; no secrets, network or auth code.

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
| 1 | Important | Compliance | `skills/using-text2prod/references/feature-artifacts.md` (Research read order) | Task 2 collapsed old steps 5+6 and dropped the sibling-spec step that `brainstorming` uses to find related features. Fixed in `607c183`, with a regression check in `test-contract.sh`. |
| 2 | Minor | Bugs | `plugin-evals/spec-only-feature-mode/graders/understanding-in-chat.md` | Grader fails runs that restate the goal and constraints and invite correction (read from saved transcripts). It scored 1/3 with the plugin both before and after, so it does not separate v0.0.2 from v0.0.3. Rewrite as separate yes/no checks in a follow-up; treat `no-intent-file` and `spec-sections` as the primary evidence. |
| 3 | Minor | Bugs | `skills/brainstorming/SKILL.md:302`, `:315` | The rule "if the resolved template lacks Problem/Constraints, add them" does not cover editing an existing spec in place (for example `link-skills-to-project-structure/spec.md`); self-review item 5 then checks sections that do not exist. Follow-up: extend the sentence to "template or existing spec". Needs its own eval evidence. |
| 4 | Minor | Compliance | `skills/brainstorming/SKILL.md:229` | "No feature folder before the spec" (spec Goal 3) is implied by the hard gate but not stated, and the one-line sentence floats after the Code evidence bullet. No eval grader checks writes under `docs/features/<slug>/` before the spec. |
| 5 | Minor | Bugs | `skills/brainstorming/SKILL.md:25` | Nothing in the checklist says when to post the "write back your understanding" note, though the Documentation step assumes it exists. Agents post it anyway (transcripts), so this is not a regression. |
| 6 | Minor | Compliance | `spec.md`, `plan.md` | They said eval results are committed under `plugin-evals/results/` and omitted `--allow-tools Write Edit`; both were wrong (see Rulings). `spec.md` corrected in the close-out commit; `plan.md` left as the historical record. |

4 further nits not listed: `spec-sections` also passes without the plugin because the prompt names the sections (signal is the with-plugin 0/3 to 3/3 change); `no-intent-file` graders check only `Write`; label alignment of three new `check` lines in `test-brainstorming.sh`; `--audit` keeps flagging the new version string in `spec.md`/`plan.md` unless `docs/features` is added to `.version-bump.json` `audit.exclude`.

## Evidence

Eval runs are local (`plugin-evals/results/` is git-ignored). With-plugin pass counts, 3 runs per arm; baseline = v0.0.2 skills (run `2026-10-04T16-41-16-854Z`), after = this branch:

| Case / grader | Baseline | After |
| --- | --- | --- |
| spec-has-problem-section / no-intent-file | 0/3 | 3/3 |
| spec-has-problem-section / spec-sections | 0/3 | 3/3 |
| spec-only-feature-mode / no-intent-file | 1/3 | 3/3 |
| spec-only-feature-mode / understanding-in-chat | 1/3 | 1/3 (grader unreliable, finding 2) |

Regression (with-plugin score): `brainstorm-before-building` 1.00, `plan-from-spec` 1.00, both equal to the 2026-09-27 results (which may predate the `--allow-tools` flag, so not strictly like-for-like).

Static: `tests/feature-artifacts/run-all.sh`, `tests/init-project`, `tests/hooks`, `tests/shell-lint`, `tests/writing-skills`, `tests/version-bump`, `tests/codex/*` and `tests/claude-code/test-sdd-workspace.sh` pass on the branch head.

## Rulings made during execution

1. Eval results are not committed: `plugin-evals/results/` is git-ignored (`.gitignore:22`); pass rates live in commit bodies (`ca759ff`, `c2b076c`) and this file. The raw `aggregate-result.json` files exist only on the author's machine.
2. Every `claude plugin eval` run used `--allow-tools Write Edit`. Without it the harness withholds `Write`, so the Write-based graders pass or fail vacuously. A first run without the flag was discarded.
3. No fix wave after the final review: all findings were Minor, and the skill-text ones need their own eval evidence.

## Promotion

Nothing to promote. `docs/engineering/infrastructure.md` already documents the eval flag and the git-ignored results; the new artifact chain is already in `ARCHITECTURE.md`, `docs/feature-workflow.md` and the contract.

## Manual follow-up for the human

`CLAUDE.md` (and `AGENTS.md`, a symlink to it) line 5 says `intent.md → spec.md → plan.md → …` in the author's **uncommitted** working-tree edit of `CLAUDE.md`; the committed file never mentioned `intent.md`. Change it to `spec.md → plan.md → implementation → review.md → deploy` before committing that edit.

## Verdict

Reviewer assessment (final whole-branch review, automated): ready to merge — all four goals and every spec section are implemented, nothing stale remains, no Critical or Important findings open. Human merge approval: pending.
