---
name: figure-it-out
description: Use when no zed-mode playbook fits the task, or the work is large or cross-cutting enough that a narrower playbook under-serves it - a migration across many call sites, an ambitious multi-part change, or work your human partner will audit after stepping away
---

# Figure it out

When no playbook fits, design one. The deliverable before any code is the workflow itself: phases that scale rigor to the task, run each step as an experiment, and leave a decision trail your human partner can audit after stepping away.

## Start

Read `../zed-mode/SKILL.md` and name the playbooks you considered and why none fits or why the nearest under-serves the work. Read `../principles/SKILL.md`, then each principle reference below as its phase fires. Open a step list with the session's task tool (`TodoWrite`, `TaskCreate`, or `update_plan`), or in your reply when it has none, holding Phases A to E.

## Phase A: Frame

Ground first, then commit. Do not start the run until you can state:

- Done as a falsifiable predicate (`../principles/references/prove-it-works.md`).
- Scope, quantified: rough units and effort, plus the blockers grounding surfaced.
- The rigor level, biased high. One-way doors and high blast radius get more; reversible low-stakes steps get less. Rigor is gates and artifacts, not "try harder".

Present the framing and its tradeoffs before a long run. Reversible work proceeds without waiting (`../principles/references/never-block-on-the-human.md`). A multi-hour run earns one checkpoint: present this framing and wait for the reply before the run starts. That is the one stop this skill adds. Gates inside skills still stop regardless of the checkpoint or any autonomy grant: the `brainstorming` skill's design approval, and merge approval in the `finishing-a-development-branch` skill.

## Phase B: Design the workflow

Decompose into atomic, independently landable units. Sequence the riskiest unknown first. Scaffold and verification come before features (`../principles/references/foundational-thinking.md`).

- Build the verification harness before the work, with a baseline captured from the pre-change state, so each check reads "old value vs new value".
- For a one-way-door design decision, run the `brainstorming` skill and compare two or three competing options (`../principles/references/exhaust-the-design-space.md`). Skip this for mechanical work whose shape is already concrete. A second design pass over a settled design is over-engineering (`../principles/references/laziness-protocol.md`).
- Decide what fans out. Parallelize only across seams, with the `dispatching-parallel-agents` skill, and give each worker its own worktree or branch (the `using-git-worktrees` skill; `../principles/references/separate-before-serializing-shared-state.md`). Don't over-fan. Pick each subagent's model per the `subagent-driven-development` skill's Model Selection section.
- Write the phase list down where your human partner will read it.

Then execute it. Add its steps to the step list between Phase C and Phase D. Run each under the Phase C discipline, and log a Phase D row as each step lands rather than writing the trail at the end.

## Phase C: Run the loop

Each unit is an experiment. State the hypothesis, make the smallest change, measure against the predicate on the real artifact, keep it if it advanced, revert it if it didn't. Verify each unit before starting the next (`../principles/references/sequence-verifiable-units.md`).

- Verify by inspecting the artifact, never a self-report. When something passes too easily, suspect the observation method before the system.
- Pair delegated work with a judge. If a worker games the gate, reset and harden the contract. If the gate itself is wrong, fix the gate in its own change rather than routing around it.
- A verdict is VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Inconclusive is not a pass. Don't hide a negative.

## Phase D: Keep the audit trail

Log the run with the `show-me-your-work` skill. Work that needed this skill is usually ambitious enough to commit the trail so the reviewer reads it beside the diff.

## Phase E: Verify and hand back

Check the whole against the Phase A predicate on the real product, not just the harness. Encode any correction you made twice as a gate, a lint rule, a check, or a script (`../principles/references/encode-lessons-in-structure.md`). Then run `../zed-mode/playbooks/opening-a-pr.md`.

**Reply:** the playbook you designed, the rigor level and why, the decision-trail path, what is verified against the predicate, and what is still open.

_Adapted from pstack's `figure-it-out/SKILL.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
