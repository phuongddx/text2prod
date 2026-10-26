### Worktree and simulator cleanup

**You own every deletion. List candidates, get your human partner's yes, then delete.** Removing a worktree, branch, or simulator is data deletion, so it always pauses (see Autonomy in `SKILL.md`). No code review catches a slip here; these gates are the review.

1. Snapshot `df -h /`. Name the base PRs merge into (`origin/HEAD` unless PRs target another branch) and fetch it.
2. Audit every worktree as a loop you can rerun, not an eyeball pass (`principles/references/build-the-lever.md`). Take paths from `git worktree list --porcelain`, never typed by hand, which misses worktrees a harness created elsewhere (`principles/references/encode-lessons-in-structure.md`). Skip the first entry, the main worktree. Per path:
   - size `du -sh <path>`; age `git -C <path> log -1 --format=%cr`.
   - merged: `git -C <path> merge-base --is-ancestor HEAD <base>`. It misses squash merges, so PR state is the stronger signal.
   - dirty: `git -C <path> status --porcelain`, split into `wip:N` (tracked edits) and `scratch:N` (untracked only).
   - remote: `pushed`, `aheadN` unpushed commits, `no-remote`, or `detached`.
   - PR: if `gh` is installed, one `gh pr list --author @me --state all --limit 1000 --json number,state,headRefName` matched by branch; otherwise `-`, and lean on merged.
   Suggest a bucket: `hold-wip` for any `wip`, `hold-open-pr` for an open or draft PR, `safe` for merged or a closed PR, `review` otherwise.
3. The bucket is advice, not permission. Ask your human partner which sessions are open or will be resumed, and cross-check every candidate. A live session's subagents may work in sibling worktrees it never names; those are in use. When unsure, have subagents read this repo's recent transcripts in the harness's own store (Claude Code: `~/.claude/projects/<repo-path-slug>/`; Codex: `~/.codex/sessions/`) and report the worktree paths each touched (`principles/references/guard-the-context-window.md`). Read no other project's transcripts.
4. Present the candidates: path, size, bucket, reason. For each `wip:N`, show the diff: uncommitted work is gone once removed, while a clean worktree is recoverable from its branch. For each `scratch:N`, name the files. Wait for confirmation of the exact set; silence is not a yes.
5. Prune only the confirmed set: `git worktree remove --force <path>`; if the directory survives on ignored build output, `rm -rf` it, then `git worktree prune`. Branch refs stay, so no commits are lost. Delete a branch only when your human partner names it. Re-run `df -h /` and re-list.
6. Optional, macOS only: simulators and caches, often the next-biggest win. List with sizes first: `xcrun simctl list devices unavailable`, `xcrun simctl --set testing list` (test clones), `xcrun simctl runtime list`, Xcode `DerivedData` and `iOS DeviceSupport`, package caches (pnpm, uv, brew, yarn). Delete only what your human partner confirms (`xcrun simctl delete unavailable`, `xcrun simctl --set testing delete all`, `xcrun simctl runtime delete <id>`). Never clear a cache they said to keep.

**Reply:** `df -h /` before and after with space reclaimed, the worktrees pruned, and a one-line reason for each held back (open session, open PR, or uncommitted work).

_Adapted from pstack's `playbooks/worktree-cleanup.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
