### Shipping

**You own what lands. Verify each PR independently, land only the verified run from the root, then keep your hands off the stack.** Start only on an explicit request to merge or land; that request is the merge approval the `finishing-a-development-branch` skill asks for. "Ship it" meaning "open a PR" routes to `playbooks/opening-a-pr.md`.

1. **Verify each PR independently before it lands.** One verifier per PR, dispatched with the `dispatching-parallel-agents` skill as `zed` subagents (the harness's default subagent where `zed` is not installed), runs the change the way a user would on the surface the user uses, parent against head, and posts `PASS`, `PASS+NOTES`, or `FAIL` on the PR. Only a verdict from an agent that did not write the code counts. Green CI and an approving bot review are not verdicts.
2. **Land only the contiguous verified run rooted at the bottom.** Walk up from the lowest unmerged PR and stop at the first one without `PASS` or `PASS+NOTES`. The PRs below it are the run; the top one is the ceiling. A verified PR above an unverified one waits.
3. **Re-check that the verdicts still describe the code.** A verdict covers a patch; a rebase moves every PR above it to a new SHA. Compare `git patch-id` at the verdict SHA with the current head before trusting an older verdict. A difference only in tests, docs, or lint config keeps the verdict if the built output is the same apart from noise; the change itself still gets fresh checks.
4. **Land bottom-up, one PR at a time.** Merge the run's lowest unmerged PR with `gh pr merge <pr> --squash`, then read it back with `gh pr view <pr> --json state,mergedAt,baseRefName`: a merge command can report success when a queue only queued the PR. After a merge lands, retarget the next PR to `main` (`gh pr edit <pr> --base main`), rebase its patch onto the merge result, push with `--force-with-lease` (before the run's first force-push, pause once and name the branches; that one approval covers this stack's own PR branches for the rest of the run), and apply step 3 before merging it.
5. **Leave the stack alone while it lands.** Step 4's move of the next PR is the only change to a branch or base. If a merge stalls, find out why before you change anything.
6. **Stop at the ceiling.** Extending the run takes new verdicts, so it is a new pass through step 1.

Record each verdict and merge as a decision row in `docs/features/<slug>/review.md` when the feature has one.

**Reply:** the verified run and its ceiling, each PR's verdict and who produced it, what landed and how you confirmed it, and what the next gap needs.

_Adapted from pstack's `playbooks/shipping.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
