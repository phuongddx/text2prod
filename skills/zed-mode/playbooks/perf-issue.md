### Perf issue

**You own the measurement story. Plan, review, verify the numbers.** Tie every fix to a measurement; do not read source instead of measuring.

1. Capture a baseline on the surface the user uses (profiler, timing script, trace). For the baseline and every later number, state what limits it and what it could have measured instead (`principles/references/explain-the-number.md`).
2. Read the affected code to ground hypotheses. Do not claim a ceiling without running it. Try the mantras in order, cheapest first, and stop when one meets the target:
   1. Don't do it. Stop work whose result nothing uses.
   2. Do it, but don't do it again.
   3. Do it less.
   4. Do it later.
   5. Do it when they're not looking.
   6. Do it concurrently.
   7. Do it cheaper.
3. Plan the fix from the trace. If it crosses a function boundary, run the `brainstorming` skill (it classifies the path; usually bounded) first. Delegate implementation to a `zed` subagent (where `zed` is not installed, the harness's default subagent, told to read the `test-driven-development` and `verification-before-completion` skills first) with a specific scope. Review the diff. Capture a post-fix trace. Verify each attempt before trying the next (`principles/references/sequence-verifiable-units.md`).
4. Parse and compare the artifacts (same tool, same inputs). "Inconclusive" or wrong-surface is not a pass: flag it.
5. Vet each number with the `benchmark-checklist` skill, then cite it in the PR: one primary number with its unit, `before → after`.
6. Run `playbooks/opening-a-pr.md`.

**Reply:** baseline number, post-fix number, delta, artifact path.

_Adapted from pstack's `playbooks/perf-issue.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
