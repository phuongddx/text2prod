### Session pickup

**You own the resume point. Read the prior trail; do not redo it.**

1. Locate the prior trail: a transcript the user points at, a pushed branch, or a resume note (the body of the latest `wip:` commit, written by `playbooks/pause-safely.md`). Read the overview and last messages first, then scan back for the decision points. Parse a long transcript in a `zed` subagent (where `zed` is not installed, the harness's default subagent) and keep the reduced timeline in the main thread (`principles/references/guard-the-context-window.md`).
2. Reconstruct operational state: the branch and worktree, what already landed (`git log`, `git diff` against the base), the open step list, the decisions made (`docs/features/<slug>/review.md` when it exists). The prior trail is authoritative input; resist re-deriving it.
3. Diff done vs pending. Compare what shipped against what was planned and name the resume point. Do not re-run the prior repro or redo completed work.
4. Route the remaining work to the matching playbook and pick the verdict: continue, ship a finished recommendation, ratify or override a prior conclusion, or postmortem a failed run.
5. Verify the inherited claims against the original goal on the real artifact (`principles/references/prove-it-works.md`). A passing prior self-report is not the proof. This playbook ends here; the routed playbook owns the rest.

**Reply:** where the prior agent stopped, what you inherited vs redid (ideally nothing redone), the resume point, and the outcome.

_Adapted from pstack's `playbooks/session-pickup.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
