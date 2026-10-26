### Hillclimb

**You own the metric and the experiment's integrity. Supervise and review; delegate the attempts.** This is the loop for sustained improvement of one metric against a target. A one-off fix is `playbooks/bug-fix.md` or `playbooks/perf-issue.md`.

One change, one measurement, keep or revert. Never stack untested changes, and never claim a win from reading code (`principles/references/prove-it-works.md`).

1. Ground the workload first. Read the target's code, name the dimensions that can move the result (data size, history, state, concurrency), and pick a case that reproduces the user's complaint; if none does, fix the repro first. Then fix one metric, the direction that counts as better, and a checkable stop predicate that pairs a target with a floor on attempts, so a lucky early win cannot end the run ("at least 50% better than baseline and at least 10 iterations"). Use the user's numbers when given; otherwise propose them.
2. Build the measurement harness, prove its sensitivity, then freeze it (`principles/references/build-the-lever.md`). Contrasting workloads must separate as expected, with the target case showing the symptom; if not, revise the workload or metric. Vet the harness with the `benchmark-checklist` skill before freezing, and make it print its error count and a count of work done. Frozen, one command emits the metric as a median over enough runs to clear the noise. Record the baseline and a green run of the regression gate (the tests that must keep passing) before any change.
3. Open the decision log with the `show-me-your-work` skill, one row per attempt: hypothesis and change as the decision, before, after and gate as the evidence, kept or reverted as the result. Read it before each attempt. Keep it out of git.
4. Ground each hypothesis in a named mechanism ("defer X off the startup path because it blocks first paint"), not "try memoizing something". For a perf metric, order hypotheses by the mantras in `playbooks/perf-issue.md` step 2; borrow their order, not their stop rule.
5. Loop, one hypothesis per iteration:
   - Delegate the change to a `zed` subagent (where `zed` is not installed, the harness's default subagent, told to read the `test-driven-development` and `verification-before-completion` skills first) with a tight scope, on the model the `subagent-driven-development` skill's Model Selection gives the task. Review the diff (`principles/references/guard-the-context-window.md`). Independent live hypotheses fan out through the `dispatching-parallel-agents` skill, each in its own worktree (`principles/references/separate-before-serializing-shared-state.md`).
   - Measure before and after with the frozen harness, and run the regression gate.
   - Keep only when the metric moves past noise and the gate stays green. Otherwise revert in full.
   - One commit per kept change, staging only its files (`git add <files>`, never `-A`). Log the row either way.
   Each iteration ends in a check before the next begins (`principles/references/sequence-verifiable-units.md`). Unattended, borrow the wake mechanism from `playbooks/autonomous-run.md` step 2, not its stop rule.
6. Push past the first plateau. After several rejects in a row, pivot category, combine near-misses, re-read the source, or try something more radical. Correctness and simplicity outrank the number: revert a win that breaks behavior, keep a simplification that holds it (`principles/references/laziness-protocol.md`).
7. Stop when the predicate is met or the remaining ideas are not worth their cost. Never relax the predicate, and do not quit while cheap untried hypotheses remain. Stuck: surface it instead of spinning.
8. Run `playbooks/opening-a-pr.md` with the kept commits in the order they landed.

**Reply:** the metric and target, baseline to final with the percent delta, iterations run (kept vs reverted), each kept change on one line, the decision log path, and the best idea you would try next.

_Adapted from pstack's `playbooks/hillclimb.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
