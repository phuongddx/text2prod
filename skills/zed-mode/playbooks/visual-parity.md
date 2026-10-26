### Visual parity

**You own pixel-exact equivalence. The baseline is the spec; you do not touch it.** Equivalence is verified by image diff, not by eye.

1. Establish the baseline before any migration: a visual regression harness that screenshots the current component across its states, plus the target when matching two implementations. No baseline, no parity claim. It blocks the work.
2. Hold the anti-shortcut rules: no harness changes, no baseline edits, no restructuring a component to pass a diff. If the baseline looks wrong, stop and ask your human partner.
3. Migrate one component at a time, shared primitives first as a blocking phase. Parallel work is one owner per component, each in its own worktree (`principles/references/separate-before-serializing-shared-state.md`).
4. Diff each component against its baseline, driving the real surface with the tools the harness offers. A nonzero diff is a fail: investigate the pixel delta and iterate until it is zero. Unattended, borrow the wake mechanism from `playbooks/autonomous-run.md` step 2.
5. Run `playbooks/opening-a-pr.md` per component or per safe batch.

**Reply:** components migrated, the diff result for each, the baseline harness location, what is left.

_Adapted from pstack's `playbooks/visual-parity.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
