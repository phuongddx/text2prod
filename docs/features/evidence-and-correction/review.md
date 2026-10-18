# Review: evidence-and-correction

Reviewer: Claude Opus 5.5 (final whole-branch review); scoped re-review by Claude Sonnet 5.5; human partner has not yet reviewed the full diff
Date: 2026-10-18
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
  | Safety fact | The branch only adds markdown text and new test and eval files; no script, manifest or harness adapter parses the changed sections. |
  | Level | L4: `bash tests/feature-artifacts/run-all.sh` exit 0 (113 PASS, 0 FAIL at review time); `cmp` on `.agents/templates/review.md` and `skills/using-text2prod/templates/review.md` identical; `scripts/lint-shell.sh` on the two new tests exit 0. |
  | Beyond the diff | `skills/subagent-driven-development/SKILL.md:471-487`: finding (Important 1, fixed in 655965d). `skills/subagent-driven-development/task-reviewer-prompt.md`: no Impact block, finding (Minor 4, fixed in 655965d). `skills/init-project/SKILL.md:73` and `skills/using-text2prod/references/project-structure.md:31`: copy the template at init, finding (Minor 6, disclosed in the PR body). `skills/using-text2prod/references/feature-artifacts.md:30-35`: repo copy wins, clear. `tests/feature-artifacts/test-finishing.sh`, `tests/feature-artifacts/test-execution-review.sh`, `tests/claude-code/test-worktree-path-policy.sh`: clear. `.opencode/plugins/text2prod.js`: lists skill directories only, clear. `scripts/package-codex-plugin.sh`: archives all of `skills/`, clear. `.version-bump.json` and the four manifests: untouched, clear. |
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

Final whole-branch review (Claude Opus 5.5): 0 Critical, 2 Important, 6 Minor; assessment "Ready to merge? With fixes". Scoped re-review (Claude Sonnet 5.5): all six findings it re-checked addressed.

| # | Severity | Pass | Location | Note |
| --- | --- | --- | --- | --- |
| 1 | Important | Impact | `skills/finishing-a-development-branch/SKILL.md:38-39` against `skills/subagent-driven-development/SKILL.md:482-487` | Finishing Step 1b read a ledger that subagent-driven-development Finish had already deleted. Fixed in 655965d: fallback to the "Rulings I made" list. |
| 2 | Important | Compliance | PR #11 body, `docs/features/evidence-and-correction/spec.md`, `plan.md` | The PR needs single-problem framing, the eval disclosures, and the spec and plan synced to the eval re-scope. Handled by the PR body and by commits cd06194..8965808. |
| 3 | Minor | Bugs | `skills/requesting-code-review/code-reviewer.md:132` | Reviewer `Level` field said "or unproven"; the reference says "and unproven". Fixed in 655965d. |
| 4 | Minor | Compliance | `skills/requesting-code-review/code-reviewer.md:165,167-199` | Reviewer returns line and example omitted `### Impact`. Fixed in 655965d. |
| 5 | Minor | Compliance | `.agents/templates/review.md`, `skills/using-text2prod/templates/review.md` | Decisions Evidence column had no source. Fixed in 655965d (pointer if the ruling cites one, else `—`). |
| 6 | Minor | Compliance | `skills/finishing-a-development-branch/SKILL.md:37` | Finishing said "each review's Impact block" instead of the final review's. Fixed in 655965d. |
| 7 | Minor | Bugs | `plugin-evals/review-impact-pass` (`reviewer-prompt-has-impact`) | Grader could match other files that also carry the matched text. Tightened in 655965d to `Impact \(what this could break outside the diff\)`. |
| 8 | Minor | Impact | `skills/init-project/SKILL.md:73`, `skills/using-text2prod/references/project-structure.md:31` | Repos initialised earlier keep an old `.agents/templates/review.md`, which wins under template resolution. Disclosed in the PR body; no code change. |
| 9 | Important | Compliance | `skills/verification-before-completion/SKILL.md:34` | Codex review bot (P1): the Rigor declaration says writing-skills and adversarial pressure testing were not run (`AGENTS.md:30`). Addressed by three combined-pressure scenarios (71a55d6, 35e30b4); no violation found, results in the spec Outcome. The bot's thread was not resolved by the bot. |

## Decisions

Rulings agents made on the human partner's behalf, copied from the plan
ledger in order. Evidence: a pointer if the ruling cites one, else `—`.
With none, one row: `None`.

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| Where a plan test greps a phrase, the edit keeps that phrase on one physical line and the surrounding prose is rewrapped, never the test; Task 5's finishing replacement was rewritten this way. | Plan text split grep-checked phrases across lines, which would fail the existing and new tests. | — | Nothing; wrapping only, no content change. |
| Task 13's skill text keeps three grep-checked phrases each on one line (same rule as the previous ruling). | Same wrapping conflict, found in the preflight scan. | — | Nothing; wrapping only. Moot, Task 13 was cancelled. |
| Task 8's eval prompt is rewritten so the failing test is not already committed: setup commits only `cart.js`, and the user reports the symptom and says no test exists. | Otherwise the repro-first rule has nothing to commit and the eval can never pass. | — | An eval prompt edit. |
| Tasks 7, 11 and 15 stop before `git push` and `gh pr create` and ask for a yes first. | Those publish to a shared remote, which the skill and norms say to ask about first. | — | One extra question per PR. |
| PR worktrees live under `.claude/worktrees/` instead of `.worktrees/`. | The PreToolUse hook only allows worktrees there; `.claude/` is git-ignored. | — | None. |
| Eval spend (about $1-2 per case, about 10 case runs in PR 1) proceeds without a cost ceiling. | It is within what the user was told before choosing subagent-driven execution. | — | A few dollars. |
| Task 3's run command uses `--allow-tools Write Edit`. | The CLI warned the grader was unpassable without Write; the implementer's re-run is the valid evidence. | — | None; plan defect, committed files unchanged. |
| Idea 2 continues although `review-impact-pass/unshown-reader` passes on current skills; the PR body must say the gap is the missing structured record, not missed readers. | The drop rule keys on the failing key grader (`safety-fact`), but the eval does not support spec Problem item 2 as stated. | `unshown-reader` PASS 6/6 on both arms | An Impact block adds template fields the model would have covered anyway. |
| Idea 6 continues for the fixed Decisions shape and a stable heading; the PR body must say rulings already reach `review.md` when the prompt hands over the ledger. | `finishing-writes-decisions` fails on the `## Decisions` heading only; spec Problem item 3 overstates it. | `finishing-writes-decisions` trace: model copied both rulings under "Accepted rulings" | A table the model would have approximated. |
| The Task 5 check that `evidence-levels.md` defines the L3 threshold the Level row cites needs no change. | A grep found `Safety fact in a review` at L3 (L4 when a script is cheap) and the `unproven` rule. | grep of `skills/using-text2prod/references/evidence-levels.md` | — |
| No `main` baseline run for the seven existing evals up front; run them on the branch, compare to the stored 2026-10-04 results, and rerun any failing grader on a temporary worktree off main. | Edits touch only verification, review and finishing text, and an up-front baseline doubles eval spend. | Stored results in `plugin-evals/results/` of the main checkout | A regression is found one step later. |
| The `tdd-test-first` miss is not attributable to this branch. | Unmodified main (4eb78c5) gave skill-fired 0/3 and test-written-first 2/3 (score 0.78, no-plugin baseline 0.33), and the branch touches no TDD text or bootstrap description. | Run on 4eb78c5 in a detached worktree | A flaky eval hides a trigger regression; the eval stays noisy either way. |
| The `lint-shell.sh --all` exit 1 is not fixed here. | It comes from 11 shellcheck warnings in `tests/claude-code/*`, which this branch does not touch; the two new shell tests lint clean. One problem per PR. | `scripts/lint-shell.sh --all` exit 1, 11 warnings | None for this PR. |
| The human chose option C: re-scope `review-impact-pass` to the dispatched-reviewer path (Agent allowed; graders `reviewer-prompt-has-impact`, `skill-fired`, `unshown-reader`; the `safety-fact` regex removed). | The first run measured 0/6 because the Impact block lives in `code-reviewer.md`, which only a dispatched reviewer reads. This deviates from the spec Testing row and plan Task 2. | cc6d50b; branch with-plugin 3/3 vs baseline arm 0/3, unedited main 0/3 | The grader checks that the template reached the prompt, not that the reviewer's report has the block. |
| Final review Important 1 is real and gets a fix: Step 1b falls back to the "Rulings I made" list when the ledger is gone, plus a variant eval run before (red) and after (green). | Verified against the subagent-driven-development Finish text, which deletes the workspace before handing over. | `skills/subagent-driven-development/SKILL.md:482-487`; fix in 655965d | One extra sentence in Step 1b. |
| Final review Minors 1-4 are applied as wording fixes, Minor 5 tightens the grader to `Impact \(what this could break outside the diff\)`, and Minor 6 goes in the PR body with no code change. | Minors 1-4 are wording, the tightened string is unique to `code-reviewer.md` (the controller's earlier `Beyond the diff` idea also appears in both templates), and Minor 6 needs no code. | 655965d | Wording only; the tightened grader could fail on the branch, then fall back to option B. |
| Keep the Step 1b fallback fix and the new `finishing-decisions-after-cleanup` eval although the eval passed 3/3 before the fix; the PR body must say so. | The fix corrects a cited contradiction (L2 evidence, not eval evidence); the eval stays as a regression guard that the plugin beats no-plugin in that scenario. | d7e5de0, 655965d; 3/3 before and 3/3 after, baseline arm 0/3 | An eval that guards nothing the old wording failed at. |
| Do not fall back to option B after the tightened `reviewer-prompt-has-impact` passed 2/3 on both attempts (4/6); the PR body must report 4/6 against 3/3 for the loose string and the unknown cause. | Both failures read "Agent called 0x", which cannot tell no dispatch from dispatch without the heading, and traces were deleted; main and the no-plugin arm are 0/3, and the Impact block reaches the dispatched prompt in most runs. The "model variance" label is unproven and not used. | 4/6 (tight) vs 3/3 (loose); "Agent called 0x" | The PR claims an effect that is real but not deterministic. |
| All three areas ship in one PR (#11, `feat/evidence-review`); Tasks 8-15 run on this branch, and the spec and plan commits are cherry-picked onto it. The human made this call. | Human decision; it supersedes the spec's three-PR delivery. The PR body must explain the dependency between areas, since AGENTS.md and the PR template say bundled PRs get closed. | PR #11 | A larger diff to read and a reviewer who closes it as bundled. |
| Idea 3 (commit the failing repro first) is dropped from this PR, and `debug-commits-repro-first` is reverted with a revert commit that says why. | The eval sandbox on this machine blocks git, so no valid before-state exists, and an unevidenced skill edit does not land. The human may overrule. | ba1969a (revert of bf06d3e); git blocked in 6/6 runs | A one-bullet rule that might help is missing. |
| Task 9's eval is re-scoped once: a prompt like `debug-root-cause-first` so the skill can fire, a `skill-fired` indicator, `no-third-fix` removed, `premise-tested` unchanged, rerun on the unedited skill. | The skill never fired, so the eval could not measure the edit. If it still did not fire or already passed, idea 5 would be dropped. | 2b6c157 | One more eval cycle (about $1); a correct direct fix may be marked FAIL, to be disclosed in the PR body. |
| Idea 5 (test the shared premise after two failed fixes) is dropped; `systematic-debugging` is not edited, so Tasks 10 and 11 are cancelled. The human may overrule. | The failure it prevents did not happen in any of 6 runs, and `premise-tested` demands a procedure, not a better outcome. | `premise-tested` 0/3 with the plugin, 0/3 without; `systematic-debugging` fired 3/3 | The 3-failed-fixes rule stays the only early-escalation rule. |
| `plugin-evals/debug-tests-premise` is removed in one commit whose message carries the measured result. | A permanently failing eval for a dropped idea is noise; the result also goes in the PR body and spec. | aa01847 | The negative result lives only in git history and the PR text. |
| `correcting-fires-on-repeat/graders/no-edits.md` is omitted (a deviation from plan Task 12). | Edit is not in that prompt's `allowed_tools`, so the grader passes trivially and would falsely claim "proposes, does not apply" is checked; `proposes-enforcement` covers it. | — | None; one trivial grader fewer. |
| Idea 4 (`correcting-repeated-mistakes` skill) is dropped; Tasks 13, 14 and 15 are cancelled. The human may overrule. | The key behaviour already happens on current skills, and what the skill adds cannot be observed in a sandbox with no repo history and no git; an auto-triggering skill with no demonstrated effect is speculative. | fb4d21f; `proposes-enforcement` 3/3 with the plugin, 2/3 without | The structural-fix ordering stays unwritten. |
| `plugin-evals/correcting-fires-on-repeat` and `correcting-not-on-first` are removed. | They test a skill that will not exist; the result goes in the spec Outcome and the PR body. | 4cfb24d | — |
| One redesign of `pressure-fixed-claim` (a change that edits `isLarge`, not `discount`, and looks right when read) to look for a real RED on main; the regex graders for refusals are informational, not pass/fail evidence, and the PR body says so. | A refusal needs no level tag, so the `L<n>` regexes cannot show a violation. If both arms still hold, the evidence is "no violation found, new vocabulary not emitted under pressure", disclosed as is. | 35e30b4 | About $2 and ten minutes. |
| Pressure-test first, then merge and release (human decision, over merge-and-release-now or merge-only). | Human decision. | — | About $4 of evals and an hour. |
| The pressure results do not block the merge. | No run violated the rule on any arm (three scenarios plus one redesign, 3 runs per arm), so no wording fix was needed; the Codex bot's P1 asked for the testing and it was run. The new vocabulary (level tags, Impact dispatch) is not emitted under pressure, so the scenarios cannot show the new rules prevent a violation; the PR body and release notes say so. | 71a55d6, 35e30b4 | The new rules ship with no demonstrated effect under pressure. |
| The Rigor boxes for "used writing-skills and completed adversarial pressure testing" and "tested adversarially" are checked with the results pasted; the box about not modifying tuned content (Red Flags, Common Failures) stays unchecked; the Human review box stays unchecked and the merge is recorded as done at the human's explicit instruction. | One Red Flags bullet and a table column were added with limited evals, and the human has not reviewed the full diff. | `AGENTS.md:30`; pressure results in 71a55d6, 35e30b4 | A reviewer reads the checked boxes as stronger evidence than the numbers show. |
| The 0.0.5 version bump goes inside PR #11, and the PR is merged once with admin override; the tag goes on the squash commit afterwards. | `main` requires 1 approving review, the author cannot approve their own PR, `enforce_admins` is false and the human is ADMIN. This avoids merging and then pushing a second release commit straight to `main`. | Branch protection on `main` (1 required review, `enforce_admins` false) | The release commit is not separate from the feature commit as it was for v0.0.4. |
| The version is 0.0.5 (patch). | v0.0.3 and v0.0.4 each bumped by 0.0.1 for behaviour changes. | — | A re-tag. |
| Codex gets the tag and GitHub release notes only; the portal archive is not built. | `scripts/package-codex-plugin.sh` needs a prior official package to seed `skills/*/agents/openai.yaml` and none exists on this machine; the portal upload is manual and v0.0.4 shipped no assets either. | `scripts/package-codex-plugin.sh` | Codex portal users wait for a manual package. |

## Verdict

request changes. This is the final reviewer's assessment ("With fixes"); the scoped re-review by Claude Sonnet 5.5 found all six findings addressed, and merge approval is the human partner's.
