### Pause safely

**You own a clean stop. Leave a checkpoint a cold-start agent can resume from.** Explicit only: on "keep going" or "don't stop", do not pause.

1. Stop at a safe boundary. Finish the current atomic step or back out of it. Start nothing new; cancel nested subagents.
2. Take no irreversible action to pause. No PR and no push unless you already had one out.
3. Make the work durable. Commit uncommitted edits as one `wip:` commit on the current branch (an empty `wip:` commit when nothing is uncommitted). If the tree is broken, say so in the commit body in one line.
4. Write the resume note into the body of that `wip:` commit (amend it): intent, what you were doing, progress and what is verified, current state, next steps, key files, gotchas. Repeat it in your reply.

**Reply:** where you are in the loop, what is on disk versus still in your head (paths, no diff dumps), the commits you made and whether the tree is clean, and the first action on resume. This is a pause, not a final report.

_Adapted from pstack's `playbooks/pause-safely.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
