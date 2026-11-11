### Incident

**You own recovery. Stop the damage first, then find the cause.** Use when production is broken now. This reverses `playbooks/bug-fix.md`. A mitigation ships before the root cause is known, and the root cause still gets found.

1. Confirm the impact from live signals such as error rate, logs, or a request you make yourself. Say what is failing, for whom, and since when. Note what changed just before it started, such as a deploy, a flag, or a config or data change.
2. Pick the most reversible mitigation that stops the damage. Roll back the deploy, turn the flag off, or revert the config. Do not write a forward fix under pressure while a rollback exists.
3. Pause for your human partner before any production write (rollback, deploy, flag flip, data change) unless they already granted it. Give the exact command and its undo. If you cannot reach production, hand them the command and wait for its output.
4. Verify recovery on the same signal that showed the failure. "Deploy succeeded" is not recovery.
5. Preserve the evidence before it expires. Save the logs, the failing request, the bad build's SHA, and the timings where the bug fix can read them, and say where.
6. Hand the root cause to `playbooks/bug-fix.md`, starting from the preserved evidence. The mitigation stays in place until that fix is verified.
7. Write the postmortem as facts. Give the timeline, the impact, the mitigation, the root cause or "open", and one structural follow-up that would have caught it (`principles/references/encode-lessons-in-structure.md`). It goes in `docs/features/<slug>/review.md` when the feature has one, and in the reply otherwise.

**Reply:** impact and timeline, the mitigation and who ran it, the recovery evidence, where the evidence is saved, the state of the root cause, and the follow-up.

_Original to Text2Prod._
