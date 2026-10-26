### Autopilot-stack

**You own the stack, never the landing. Hand your human partner one linear stack of base-chained PRs to review and land.** `playbooks/autopilot-full.md` holds except for how verified work leaves, and this playbook wins where they differ. It needs no merge grant. Each wake re-reads both.

1. **Run autopilot-full's owners, minus the landing.** Owners report stack-ready in place of merge-ready. They never rebase onto another branch, retarget, merge, close a PR, or enable auto-merge. An item that depends on another branches from that item's branch, not from `main`.
2. **Give the topology one writer, you.** Owners push only their own branches and report each tip and its intended parent. Only you rebase or retarget a link. Append each verified PR in dependency order with its base set to its parent's branch (`gh pr edit <pr> --base <parent-branch>`). Before your first force-push to the chain, name its branches once and wait for a go, as `playbooks/shipping.md` step 4 does. An owner takes your push as its new base and lease, and on a conflict resolves its own slice for you to push.
3. **Absorb drift at the root.** Until landing starts, apply autopilot-full step 6's test to each link, rebase bottom-up where it calls for one, and re-check each link's verdict with the patch-id rule in `playbooks/shipping.md` step 3.
4. **Deliver the chain, then keep your hands off it.** Each link carries its verdict on its PR. Once landing starts, nobody writes to the chain except the post-merge retarget `playbooks/shipping.md` sanctions. A mid-landing problem goes through you to your human partner, and any fix waits for their go.

**Choosing.** Autopilot-full for independent PRs with merge authority granted. Autopilot-stack when your human partner wants review before landing, the work is coupled, or merge authority is withheld.

skip: skill not ported yet (ketchup). Catch-ups follow `references/writing-the-reply.md`.

**Reply:** links to the stack root and tip, a one-line verdict per link, anything parked or excluded with the reason, and the `Attention` section the `show-me-your-work` skill requires.

_Adapted from pstack's `poteto-mode/playbooks/autopilot-stack.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
