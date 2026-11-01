# Review: guide-site

Reviewer: per-task reviewers (sonnet and opus tiers), whole-branch reviewer (fable tier), scoped re-reviewers (sonnet tier)
Date: 2026-11-01
Plan under review: `plan.md` in this directory

## Passes

Impact block for the branch (range `a8ebfe5..9b5b1dc`, 24 files, 3336 insertions, 2 deletions):

| Field | Content |
| --- | --- |
| Safety fact | The branch adds `site/`, one workflow, one gate script with its test, and doc edits; it changes nothing under `skills/`, `agents/`, `hooks/`, the plugin manifests, or `package.json`, so plugin behavior in every harness is unchanged. |
| Level | L4: `git diff main --stat -- skills agents hooks .claude-plugin .codex-plugin package.json` prints nothing; `scripts/bump-version.sh --check` and `--audit` report all files in sync at 0.0.9; the gate suite (8 cases, exit 0 under bash 5 and `/bin/bash` 3.2), `tests/feature-artifacts/run-all.sh`, `tests/agents`, `tests/init-project`, `tests/version-bump`, `test-playbooks.sh`, and `test-principles-index.sh` all exit 0; the whole-branch reviewer swept all 11 pages at 1280px and 390px in both colour schemes (6 of 6 diagrams rendered, no console errors, no horizontal overflow). The first live deploy is not yet exercised: Pages is not enabled, so the deploy path is L3 (traced through the workflow), not L5. |
| Beyond the diff | `scripts/package-codex-plugin.sh`: archives a fixed path list that excludes `site/`, `clear`. `.claude-plugin/marketplace.json` has `"source": "./"`, so `site/` is present in a Claude Code checkout but holds no skills or hooks, `clear`. `.version-bump.json` audit: no undeclared file contains the version string, `clear`. `tests/claude-code/test-playbooks.sh` and `test-principles-index.sh` read only `skills/`, `clear`. `.github/`: no other workflow existed, `clear`. A grep of `scripts`, `tests`, `hooks`, `agents`, `.github`, the plugin manifests, and `.version-bump.json` for `site/` outside the gate, its test, and the workflow found no other reader. |
| Cheapest pre-merge check | `tests/guide-site/test-check-guide-site.sh && scripts/check-guide-site.sh`; after merge, enable Pages once (owner's OK) and run `workflow_dispatch` from `main` to prove the first deploy. |

## Severity rule

**Important** = would break behavior, leak data, or breach policy.
Style and naming are nits.

## Nit cap

Report at most 5 nits; summarize the rest as a count.

## Do not report

- Generated files.
- Anything CI already enforces.

## Findings

All Important findings below were fixed on the branch and verified by a scoped re-review. The whole-branch review also triaged the earlier Minor findings: 20 items (2 must-fix, 18 should-fix) were applied in one final fix wave, and the rest were left or recorded as follow-ups.

| # | Severity | Pass | Location | Note |
| --- | --- | --- | --- | --- |
| 1 | Important | Compliance | `site/index.html` Home prompt | The plan's wording said a plain bug report is enough for the router to pick `bug-fix`; `docs/get-started.md:107` says 0 of 3 sessions did. Fixed: the prompt names the playbook and states the eval result as measured. |
| 2 | Important | Compliance | `.github/workflows/pages.yml` deploy job | Job-level `permissions` dropped `contents: read`, which the spec requires. Fixed. |
| 3 | Important | Compliance | `docs/engineering/infrastructure.md` `## CI` | Still said "Not configured" next to the new workflow. Fixed. |
| 4 | Important | Compliance | `ARCHITECTURE.md` `site/` row | "Not packaged into the plugin" is false for the Claude Code marketplace (`source` is `./`). Fixed: says the Codex archive excludes it. |
| 5 | Important | Compliance | `docs/engineering/infrastructure.md` Guide site | "The Pages source is set to GitHub Actions" is false until Pages is enabled. Fixed: "must be set". |
| 6 | Important | Compliance | `site/assets/catalog.js` `opening-a-pr` | "The end of every other playbook" rendered on a chapter 6 card and was wrong. Fixed. |
| 7 | Important | Bugs | `.github/workflows/pages.yml` deploy `if` | `workflow_dispatch` on any branch could deploy that branch to the public site. Fixed: deploy requires `refs/heads/main`. |
| 8 | Minor | Compliance | `site/*.html`, `docs/engineering/infrastructure.md` | Hard-coded counts ("23 playbooks", "24 principles", "20 skills") are not derived from the catalog or asserted by the gate, contrary to the spec's Context note. Not fixed; follow-up. |
| 9 | Minor | Impact | `site/assets/guide.js`, `guide.css` | Theme flash for a saved theme that differs from the system scheme; `table { display: block }` drops table semantics. Not fixed; follow-up. |
| 10 | Minor | Bugs | `scripts/check-guide-site.sh` | Single-quoted and root-absolute links, `@x.y.z` pins without a trailing slash, and banned-term edge cases (`pstacks`, double spaces) are not handled. Left as noted. |

## Decisions

Copied from the plan ledger in order. R3 was replaced by R4.

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| R1: run Task 3 and Task 4 one after the other, not in parallel | The skill forbids parallel implementers on one branch; the spec does not require parallelism | `skills/subagent-driven-development/SKILL.md` | Wall-clock time only |
| R2: chapters 1 and 10 (and Home) omit the "In this chapter" block | The catalog assigns chapter 1 no skills or playbooks, so the heading would render empty | `site/assets/catalog.js` | One omitted heading |
| R3: keep the extra Home sentence about the router not always picking a playbook | The spec requires site claims to be checked against the repo | `docs/get-started.md:107` | One extra sentence per chapter; replaced by R4 |
| R4: name the playbook in the Home prompt, state the 0-of-3 result as the doc gives it, and start every prompt that expects a specific playbook with "use the <playbook> playbook." | The plan's "router picks bug-fix" overstated the evidence | `docs/get-started.md:107` | Slightly longer example prompts |
| R5: pages do not claim `opening-a-pr` ends every playbook, and quote the autonomy pause list exactly | A reviewer showed the chapter 1-5 pages overclaiming | `skills/zed-mode/SKILL.md` Autonomy section | A few words |
| R6: fix the `opening-a-pr` catalog text in the final fix wave, not in a Task 4 fix round | The text lives in Task 2's catalog, outside Task 4's diff; nothing downstream builds on it | `site/assets/catalog.js:31` | One wrong card sentence if the final wave were skipped |
| R7: Task 5 fix round covers the three Important findings only; Minor findings wait for the final wave | The skill keeps Minor findings out of fix loops | Task 5 review | A wrong doc sentence for the Minors if the wave were skipped |
| R8: apply the final reviewer's MUST FIX and SHOULD FIX lists in one dispatch; hard-coded counts, theme flash, and table semantics become follow-ups | The skill allows exactly one final fix wave | Final review triage | Stale-count risk after a future release if the follow-up is skipped |

## Verdict

approve (the whole-branch reviewer's verdict was "With fixes"; the scoped re-review of the fix wave reported all 20 items addressed with no new breakage). The first green deploy still needs the owner to enable Pages, and merge approval is the owner's.
