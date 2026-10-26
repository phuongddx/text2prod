# zed-mode parity with poteto-mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use text2prod:subagent-driven-development (recommended) or text2prod:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the nine poteto-mode behaviors in `zed-mode` in harness-neutral form.

**Architecture:** One-line triggers and short rules in `skills/zed-mode/SKILL.md`. Detail lives in new `references/` files, five new skills, and ten new playbooks. Static tests pin the wiring and a word budget. One `plugin-evals/` case per item guards the behavior.

**Tech Stack:** Markdown skills, bash static tests (`tests/feature-artifacts/lib.sh`), `claude plugin eval` suites. No runtime dependencies.

**Spec:** `spec.md` (same folder)

**Delivery:** branch `feat/zed-mode-parity`, stacked on `fix/bootstrap-base-dir`, which is stacked on `refactor/zed-mode-rename`. One PR, commits grouped by phase.

## Global Constraints

- Zero runtime dependencies. Ported scripts are bash with `set -euo pipefail`, `shfmt -i 2`, and pass `scripts/lint-shell.sh`.
- No forbidden tokens from `tests/claude-code/test-playbooks.sh` in any new file except on the credit line.
- Every ported file ends with `_Adapted from pstack's <source path> by Lauren Tan (MIT, https://github.com/cursor/plugins)._`
- Skill references use the form ``the `<name>` skill`` and must resolve to `skills/<name>/`. An unported pstack skill appears only on a line carrying `skip: skill not ported yet (<pstack name>)`.
- `skills/zed-mode/SKILL.md` stays at or under 1300 words.
- Not edited: `brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `finishing-a-development-branch`.
- All nine land regardless of eval baseline (spec Decision).
- Eval run: `claude plugin eval . --eval-dir plugin-evals --case <name> --allow-tools Write Edit Bash`.

### pstack to text2prod name map

| pstack | text2prod |
| --- | --- |
| `how`, `why` | read the code inline; `git log` and `git blame` for motivation |
| `architect`, `arena` | the `brainstorming` skill plus `principles/references/exhaust-the-design-space.md` |
| `swarm` | the `dispatching-parallel-agents` skill |
| `create-skill` | the `writing-skills` skill |
| `tdd` | the `test-driven-development` skill |
| `deslop`, `no-comments` | the `comment-sicko` agent |
| `principle-<x>` skill | `principles/references/<x>.md` |
| `poteto-agent` | the `zed` agent |
| `Task`, `AskQuestion` | "a subagent", "ask" |
| `control-ui`, `control-cli` | drive the real surface with the tools the harness offers |
| Bugbot | an automated reviewer |
| `ketchup`, `technical-writing`, `teach`, `reflect` | `skip: skill not ported yet (<name>)` |

---

## File Structure

| Path | Phase | Owner |
| --- | --- | --- |
| `tests/claude-code/test-playbooks.sh` | 0 | root |
| `skills/zed-mode/playbooks/eval.md`, `authoring-a-skill.md` | 0 | root |
| `skills/zed-mode/SKILL.md` | 0, 1, 2, 3 | root only |
| `skills/zed-mode/references/writing-the-reply.md` | 1 | root |
| `skills/zed-mode/references/codex-tools.md` | 1 | root |
| `skills/zed-mode/references/claude-code-tools.md` | 1 | root |
| `skills/unslop/`, `skills/benchmark-checklist/`, `skills/show-me-your-work/` | 2 | delegate A |
| `skills/interrogate/`, `skills/figure-it-out/`, `skills/zed-mode/references/review-bot-triage.md` | 2, 3 | delegate B |
| `skills/zed-mode/playbooks/hillclimb.md`, `runtime-forensics.md`, `trace-forensics.md`, `visual-parity.md`, `worktree-cleanup.md`, `scripts/worktree-audit.sh` | 3 | delegate C |
| `skills/zed-mode/playbooks/orchestrate.md`, `autopilot-full.md`, `autopilot-stack.md` | 3 | delegate D |
| `plugin-evals/<case>/` (nine cases) | 0 to 3 | delegate E |
| Step edits in existing `autonomous-run.md`, `perf-issue.md`, `babysit.md` | 2 | root |
| `LICENSE`, `README.md`, `CLAUDE.md`, `ARCHITECTURE.md` | 3 | root |

Delegates own disjoint files and do not commit. The root integrates, reviews each diff, and commits per phase.

## Task 0: Levers

- [ ] Add a static check to `tests/claude-code/test-playbooks.sh`: `wc -w < skills/zed-mode/SKILL.md` is at most 1300.
- [ ] Port `playbooks/eval.md`: candidates and judge are subagents; judge on a different model when the harness offers one; transcripts read from the harness's own session path; route the run through `claude plugin eval` when the target is a text2prod skill.
- [ ] Port `playbooks/authoring-a-skill.md`: routes to the `writing-skills` skill and the `eval` playbook.
- [ ] Add both rows to the router table. Run `test-playbooks.sh`. Commit.

## Task 1: Session rules (items 1, 2, 3, 7)

- [ ] Autonomy gains "classify before asking" and "full-autonomy grant" rules. Skill approval gates still stop.
- [ ] New `## Triggers` section with one line each for reply style, delegate model choice, and (Task 2) the new skills.
- [ ] `references/writing-the-reply.md`: the poteto-mode reply rules as defaults that a user output style or instruction file overrides.
- [ ] `references/claude-code-tools.md`: `Agent` takes `model` (`opus`, `sonnet`, `haiku`) plus `effort`; maps the Model Selection tiers. Link from Platform Adaptation.
- [ ] Budget check passes. Commit.

## Task 2: Skills and review-bot triage (items 1, 4, 5, 6, 8)

- [ ] Delegates A and B port `unslop`, `benchmark-checklist`, `show-me-your-work` (with `scripts/log.sh`), `interrogate`, `references/review-bot-triage.md`.
- [ ] Root adds trigger lines, a decision-trail step in `autonomous-run.md`, a checklist step in `perf-issue.md`, a triage step in `babysit.md`.
- [ ] `test-playbooks.sh`, `test-package-codex-plugin.sh`, `lint-shell.sh` pass. Commit.

## Task 3: Playbooks and fallback (item 9)

- [ ] Delegate B ports `figure-it-out`; delegates C and D port eight playbooks.
- [ ] Root replaces the no-fit sentence with a `figure-it-out` route, adds eight table rows, updates `LICENSE`, `README.md`, `CLAUDE.md` (`ARCHITECTURE.md` lists no skills, so it needed no change).
- [ ] Full static suite matches baseline plus new checks. Commit.

## Task 4: Evals and review

- [ ] Delegate E writes nine cases per the spec Evals table and the `eval` playbook's blinding rules.
- [ ] Run each case with `--ablation with-without`; copy per-grader results into `review.md`.
- [ ] Write `review.md` from the template. Commit.

## Self-Review

1. Spec coverage: items 1 to 9 map to Tasks 1 to 3; Goals 2 and 3 map to Task 0 and the gates in Tasks 2 and 3.
2. Placeholders: none; each file has an owner and a phase.
3. Names: skill and playbook names match the spec Design table.
