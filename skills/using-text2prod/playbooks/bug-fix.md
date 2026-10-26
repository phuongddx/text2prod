### Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents when the hunt is large; stay in the lead.

Be scientific. Every shipped line traces to runtime evidence. A belt-and-suspenders change that "might help" is a hypothesis, not a fix, and does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships (`principles/references/laziness-protocol.md`).

1. Reproduce it yourself on the surface the user uses (test runner, CLI, browser, simulator). Ask the user to reproduce only with a stated reason you cannot reach that surface, and only after driving it as far as it goes. If it will not reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Run the `systematic-debugging` skill. Form the candidate hypotheses, then rule them out until one survives: each pass takes the split that cuts the most remaining problem space, gets runtime evidence, and eliminates. When program state is unclear, add logging and read it as the code runs. Confirm the surviving mechanism with runtime evidence before planning the fix (`principles/references/fix-root-causes.md`).
3. Capture the failing repro before any fix: the `test-driven-development` skill writes it as a test; when no cheap test path exists, write a one-off script that fails on the bug. Skipping a failing repro needs your human partner's OK. Commit it before the fix (`principles/references/sequence-verifiable-units.md`).
4. Plan the fix. If it crosses a function boundary, run the `brainstorming` skill (it classifies the path; usually bounded) first. Delegate implementation to a `zed` subagent (where `zed` is not installed, the harness's default subagent, told to read the `test-driven-development` and `verification-before-completion` skills first) with a specific scope (file paths, the named data shape, success criteria) when the fix is more than a few lines; otherwise make it yourself.
5. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass: flag it. Unit tests show branch behavior, not bug absence (`principles/references/prove-it-works.md`).
6. Run the `verification-before-completion` skill, then `playbooks/opening-a-pr.md`.

**Reply:** what was broken, root cause, fix, how you verified. Paste failing-then-passing repro output verbatim.

_Adapted from pstack's `playbooks/bug-fix.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
