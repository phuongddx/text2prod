### Orchestrate

**You own the program, never the code. Write briefs, drain completions, keep the ledger true, decide.** For a multi-day program of many PRs and subagents, with few human check-ins. A completion is a ledger row, not an interrupt. The brief is the product, because a worker cannot ask you a question.

**Roles.** You never edit code. Conflicted rebases, stack surgery, and code changes are units with briefs. Each worker or verifier is a `zed` subagent in its own worktree (the `using-git-worktrees` skill) on a branch only it writes (`principles/references/separate-before-serializing-shared-state.md`), modeled per the `subagent-driven-development` skill's Model Selection. A `zed` never dispatches, so there are no sub-coordinators.

**The ledger.** `docs/features/<slug>/ledger.tsv` on your own branch `orchestrate/<slug>`. Only you write it. Commit and push after every drain.

```
ts	unit	state	branch	pr	head	by	evidence
```

- `state` is `running`, `built`, `pass`, `fail`, `blocked`, `landed`, `abandoned`, or `gate`. A unit's last row is its state. Supersede rows, never edit them.
- `by` is who produced the fact. `evidence` is one pointer. A `running` row points at its brief, committed under `briefs/` with the ledger. A `pass` points at its verdict comment on the PR.
- A `pass` counts only for its `head`, only when `by` did not build the unit, and only at the level `references/evidence-levels.md` requires. A later `built` row voids it. Green CI is not a verdict.
- `blocked` means the verifier's environment broke, so re-verify later. `fail` gets a fix unit.

Log why in the trail (the `show-me-your-work` skill), committed beside the ledger. Standing orders are the plan's `## Global Constraints` plus lines for the merge grant, each stack's one topology writer, and the worktree preference so workers skip the consent question. Restating an instruction means it belongs there (`principles/references/encode-lessons-in-structure.md`).

**The brief.** A field you cannot fill means the unit is not scoped. Collapse it to a paragraph for a one-command unit.

```
GOAL        one sentence a stranger could execute
SCOPE       writable and forbidden paths; branch, base, worktree
CONTEXT     pointers; upstream reports pasted in full
SHAPE       the data shape it introduces, or n/a
ACCEPTANCE  checkable criteria
VERIFY      exact commands or the surface to drive
TIMEBOX     on expiry push, report partial findings, stop
FORBIDDEN   merge, retarget, anything outside SCOPE; rebase and force-push
            too, except in a rebase unit, whose brief names the branch and
            pushes only after your human partner's go
REPORT      status, branch, head SHA, PR, commands run and output
STANDING    the standing orders, verbatim
```

Fix rounds and retries get a fresh worker with the brief, later directives, and the prior report.

**Steps:**

1. **Frame.** With no plan, run `playbooks/multi-phase-plan.md` first. Its tasks are the units. State the done predicate as a count and the wall-clock budget. Work one agent could finish inside it goes to `playbooks/autonomous-run.md`.
2. **Pilot.** Create the branch, ledger, trail, and standing orders. Push one unit through the whole path and fix the brief and verify recipe from it before fan-out. On cheap near-identical units, the first unit is the pilot.
3. **Scale** with the `dispatching-parallel-agents` skill as a rolling window, never blocking batches, capped at what one drain and this machine can carry. By about 70% of the budget, stop spawning and land what is verified.
4. **Drain** between tasks and before any report. Append a row per completion, commit, push, then spawn the next window. A diff that needs review becomes a verifier unit, never a drain task.
5. **Verify, scaled to the unit.** A one-command VERIFY you rerun yourself on the pushed head. Expensive or high-blast-radius units get a verifier that did not build them, on a different model.
6. **Land continuously** through `playbooks/shipping.md`, only after your human partner asked for merges in their own words. Quote the request in the trail. Without it, stop at merge-ready. Babysit per `playbooks/babysit.md`, one per stack, triaging bot comments per `references/review-bot-triage.md`.
7. **Fail by mode.** Probe liveness by pushes and PR activity, never by resuming an agent. Out of context gets smaller scope, network drop a plain retry, tool error another model. After two retries, `abandoned`, then replan. A late zombie reconciles against the ledger first. A tree-wide failure gets a stop line atop the standing orders until fixed.
8. **Escalate in batches** as `gate` rows holding the question and the default you apply meanwhile. For an Always-pause action the default is to hold it. Gates are the Always-pause list in `SKILL.md` Autonomy, product calls no experiment settles, standing orders reality contradicts, and dead ends that survived a replan. Retries, CI flake, review threads, and "should I keep going" never reach your human partner. Discoveries that do not block landing park as follow-ups.
9. **Close.** Give every worker a terminal row. Confirm the predicate on the real artifact and a `pass` at each landed head. Write `review.md` and land the coordinator branch per `playbooks/opening-a-pr.md`.

**Resuming.** Compaction, a restart, or a new session kills your workers and memory, not the ledger. Run `playbooks/session-pickup.md` with the ledger and trail as the prior trail. Check out `orchestrate/<slug>`, re-read the standing orders, and act on each unit's last row. A `running` unit lost its worker, so salvage unpushed commits from `git worktree list` and spawn a fresh one from its brief. A `pass` whose PR head moved (`gh pr view <pr> --json headRefOid`) is void. Open `gate` rows are the questions.

**Reply:** the predicate and state counts from the ledger, what landed with PR links, abandoned units and why, open gates, the ledger and trail paths, and the `Attention` section the `show-me-your-work` skill requires.

_Adapted from pstack's `poteto-mode/playbooks/orchestrate.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
