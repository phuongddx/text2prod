### Investigation

**You own the answer. Read, cite, write.** Investigation requests are read-only: the output is a cited explanation or a recommendation, not a code change.

1. Read the affected code and its docs; for "why" questions also read `git log` and `git blame` for the history and any linked issues. Cite file paths and commits.
2. Write `throughput checkpoint: n/a, read-only investigation` as one step.
3. Produce the answer as Overview / Key concepts / How it works / Where things live / Gotchas, or, for a decision between alternatives, a recommendation with a trade-offs table.
4. If the question needs a probe to answer (timing, behavior, output), run the `brainstorming` skill's spike path and report the observation.

No PR and no edits. If the investigation precedes a code change, hand back to the user and re-route to `playbooks/bug-fix.md` or `playbooks/feature.md`.

**Reply:** the investigation output. For "are we sure?" answers, give your real judgment with reasons; push back if the premise is wrong (see Autonomy in `SKILL.md`).

_Adapted from pstack's `playbooks/investigation.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
