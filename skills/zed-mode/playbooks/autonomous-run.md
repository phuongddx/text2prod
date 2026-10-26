### Autonomous run

**You own the exit condition. Define done, then drive to it without stopping.**

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N PRs verified and merge-ready, pixel diff zero). A merge predicate needs an explicit request to merge (`playbooks/shipping.md`); "run until done" is not one.
2. Pick the wake mechanism. An event to watch (CI, a merge, a ref advancing) gets a watcher subagent that wakes you on the event; otherwise re-check when the harness wakes you, at an interval sized to when the result is worth re-checking.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits if it advanced, and discards changes that did not help. A belt-and-suspenders change that "might help" gets reverted (`principles/references/sequence-verifiable-units.md`).
4. Mid-run discoveries are yours: broken skills, related bugs, flaky verifiers, review noise, tooling failures. Fix them yourself, each in its own PR, and return to the predicate. Do not park reversible work for the human. Surface only irreversible actions, a genuine product or preference call, or a real dead end (see Autonomy in `SKILL.md`).
5. Log every decision as it lands with the `show-me-your-work` skill: what changed, why, the evidence, and whether the predicate moved. The log survives a run that stops early; at finish its rows feed the `## Decisions` table in `docs/features/<slug>/review.md` when the feature has one.
6. Stop when the predicate is met. A plateau is not a stop: pivot the approach. Surface a genuine dead end rather than spinning, and never relax the predicate to declare victory.

**Reply:** the exit condition, iterations run, what landed, what was discarded, final predicate state.

_Adapted from pstack's `playbooks/autonomous-run.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
