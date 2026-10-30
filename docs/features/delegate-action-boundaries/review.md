# Review: delegate-action-boundaries

Reviewer: subagent reviewers (task review: sonnet; fix re-reviews: haiku, sonnet; final whole-branch review: opus)
Date: 2026-10-28
Plan under review: `plan.md` in this directory

The branch is docs-only. Both proposed skill changes were dropped before
any skill edit, because each eval baseline showed controllers already pass
the project rule to their delegates (see `spec.md` Outcome). The reviews
covered the spec, the plan's scope changes, and whether the Outcome
matches the measured evidence.

## Passes

- **Bugs**: no code changed.
- **Security**: no code changed; no secrets or personal data in the diff.
- **Compliance**: findings 1 to 6 below.
- **Impact**: block below, from the final whole-branch review.

  | Field | Content |
  | --- | --- |
  | Safety fact | No file outside `docs/features/delegate-action-boundaries/` changed, so no skill, hook, test, manifest, or packaged archive is affected. |
  | Level | L4: `git diff --name-only 455c1a3 3c53eb6 \| grep -v '^docs/features/delegate-action-boundaries/' \| wc -l` returned 0; `tests/feature-artifacts/run-all.sh` exits 0 (132 passes); `scripts/bump-version.sh --audit` exits 0. Re-checked at `e946989`. |
  | Beyond the diff | `scripts/package-codex-plugin.sh`: clear, does not ship `docs/`. `tests/feature-artifacts/*.sh`: clear, they read skill files only. `tests/claude-code/test-sdd-workspace.sh`: clear, builds its own fixtures. `.version-bump.json` and `--audit`: clear, one informational hit on `spec.md` ("v0.0.8 shipped it"). Hooks and the `.claude-plugin`, `.codex-plugin`, `.opencode` manifests: clear, no reference to the feature path. `skills/zed-mode/references/feature-artifacts.md:64`: finding 4. `skills/finishing-a-development-branch/SKILL.md:119,148`: finding 6. |
  | Cheapest pre-merge check | `git diff --name-only main...HEAD \| grep -v '^docs/features/delegate-action-boundaries/'` prints nothing, and `grep -n '^Status:' docs/features/delegate-action-boundaries/spec.md` reads `superseded`. |

## Findings

| # | Severity | Pass | Location | Note |
| --- | --- | --- | --- | --- |
| 1 | Important | Compliance | `spec.md` Outcome, baseline bullet | Task review: "never called Agent" stated as fact although the baseline traces were not kept, and "with this plugin and without it" overclaimed for SDD. Fixed in `3c53eb6`, then reworded to "unknown" in `e946989`; re-reviews ADDRESSED. |
| 2 | Important | Compliance | `spec.md` Testing vs Outcome | Final review: the premise grader also matched never, do not, don't, no new, and without, wider than Testing's "a stop, ask, or before cue". All 38 traced dispatches matched through "never" or "do not"; a stop/ask/before-only regex matches 0 of 38. The drops rest on the Problem premise (rules reach the delegate only if pasted), which the traces falsify in 38 of 38. Reconciled in the Outcome in `e946989`; ADDRESSED. Ruling 9's stated reason fits the Problem premise, not the Testing cue list. |
| 3 | Important | Compliance | `plan.md:13` | Scope-change paragraph covered Rulings 6 to 8 only; Task 3 Step 2 edited `docs/testing.md` unconditionally. Fixed in `e946989`; ADDRESSED. |
| 4 | Important | Compliance | `spec.md:3` | `superseded` named no successor, against `feature-artifacts.md:64`. A `Successor:` line was added in `e946989`; ADDRESSED. The contract has no status for a feature that shipped nothing; a `dropped` status would be a separate change. |
| 5 | Important | Compliance | `spec.md` Outcome | "No dispatch in either case told the delegate to stop" claimed beyond the traced runs. Scoped to "No traced dispatch (38: 3 SDD, 35 parallel)" in `e946989`; ADDRESSED. |
| 6 | Important | Compliance | `finishing-a-development-branch/SKILL.md:119,148` | Process hazard outside the diff: finishing sets `Status: shipped` unconditionally, which would contradict "Neither change ships". Handled by Ruling 13. |

Nits: 6. Four were fixed in `e946989` (the "don't" cue, the "(unbounded)" table label, local result paths, "unknown" wording); two were parked by Rulings 11 and 12. Two deferred task-review minors were left by the final review's triage (no dropped markers on Goals and Testing, matching precedent; a duplicate of the table-label nit).

## Decisions

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| Ruling 1: work in the main checkout on `feature/delegate-action-boundaries` rather than a separate worktree | The branch is already isolated from main; only the untracked `skills-lock.json` (not ours) is present | — | A stray edit lands on the feature branch, visible in review |
| Ruling 2: string-presence static tests stand | They follow the repo's wiring-test pattern; behavior is proven by the evals | `tests/feature-artifacts/test-delegate-brief.sh` | One reviewer finding to adjudicate |
| Ruling 3: implementers on sonnet, not the cheapest tier | Each task runs two 10-run eval batches and must interpret aggregate JSON against the premise gate | — | Modest token overspend |
| Ruling 4: reviewers on opus | Single-family harness, so a different tier stands in for a different family | — | Shared blind spots across tiers |
| Ruling 5: before dropping the SDD change, re-run the with-plugin arm (3 runs, `--keep-temp`) and classify the matched text | `input_match` filtering was confirmed, but a match on unrelated text would void the baseline | `plugin-evals/results/2026-10-28T14-49-36-780Z` (local) | About 10 minutes and one more eval batch |
| Ruling 6: drop the SDD slot and dispatch item (8) | Spec ship rule (premise check ≥3 of 5 before the edit), confirmed by trace classification: 3 of 3 dispatches carried the rule | `spec.md` Outcome | Delegates still lack stop-and-report framing and the universal stop conditions; reopen only if an incident shows a delegate acting on a rule it was given as a constraint |
| Ruling 7: word-bound the `stop-before-dep` regex before Task 2's baseline | A substring match on "task" is not an "ask" cue | Task 1 trace classification | None; it only removes false positives |
| Ruling 8: Task 2 creates the static test with only its own checks; Task 3 removes the dropped SDD case and reruns only `delegate-gets-tier` | SDD files are unchanged | `plan.md` Task 1 holds the case text | One uncovered regression on an SDD case, impossible while SDD files are untouched |
| Ruling 9: drop the parallel-agent bullet and example | Spec ship rule; every matched line read (20 of 20 carried the rule); tightening the grader after seeing the data would change the success criterion | `plugin-evals/results/2026-10-28T14-58-03-214Z` (local); finding 2 | The stop-and-report framing gap stays open until a spec of its own measures delegate behavior |
| Ruling 10: Task 3 removes all three uncommitted artifacts, skips the `delegate-gets-tier` rerun and the `docs/testing.md` line, and sets the spec to `superseded` | No skill or test ships; precedent: `delegate-brief-contract` committed no eval for its dropped idea | `docs/features/delegate-brief-contract/plan.md:13` | The evals must be recreated from `plan.md` to reproduce |
| Ruling 11: the "35 parallel across both arms" count stands | It is the final reviewer's re-grade of the kept traces (20 with-plugin plus 15 no-plugin); the PR body states the 15 | Final review re-grade | A reader cannot reproduce the 15 from the spec alone |
| Ruling 12: leave `spec.md:277` at 91 characters | Cosmetic; Markdown renders it identically | — | One uneven line in source |
| Ruling 13: keep `Status: superseded` at finishing instead of the skill's `shipped` | The Outcome says neither change ships; `shipped` would contradict the record | Finding 6 | A reader filtering for `shipped` specs misses this one, which is correct |

## Verdict

Final whole-branch review: ready to merge with fixes (findings 2 to 5),
all addressed in `e946989` per the scoped re-review, with no new Critical
or Important breakage. Merge approval is the human partner's.
