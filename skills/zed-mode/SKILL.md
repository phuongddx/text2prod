---
name: zed-mode
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, ignore this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## The Rule

**Invoke relevant or requested skills BEFORE any response or action** — including clarifying questions, exploring the codebase, or checking files. If it turns out wrong for the situation, you don't have to use it.

**Before entering plan mode:** if you haven't already brainstormed, invoke the brainstorming skill first.

**Before a design, debugging, delegation, or verification decision:** read `principles/SKILL.md` (the text2prod:principles skill), then the reference for each principle that applies, and follow its citation rule. In your final reply, name each principle that changed a choice and the choice it changed.

Then announce "Using [skill] to [purpose]" and follow the skill exactly. If it has a checklist, create a todo per item.

## Skill Priority

When multiple skills apply, process skills come first — they set the approach, then implementation skills (frontend-design, etc.) carry it out. Brainstorming and systematic-debugging are Text2Prod' most common process skills, but the rule holds for any of them.

- "Let's build X" → text2prod:brainstorming first, then implementation skills.
- "Fix this bug" → text2prod:systematic-debugging first, then domain skills.

## Playbooks

Match the request to one playbook from the table and read its file at `playbooks/<name>.md`. Then open a step list whose first items are the playbook's steps, copied verbatim, before any task-specific items. Use the session's task tool (`TodoWrite`, `TaskCreate`, or `update_plan`) when it has one; otherwise keep the list in your reply and update it at each step. A step you choose not to do stays in the list with `skip: <one-line reason>`. Route to the skill each step names as the step fires. When no playbook fits, say which playbooks you considered; The Rule above applies either way.

| Playbook | Use when |
| --- | --- |
| `investigation` | A read-only question: how does X work, why was Y built this way, are we sure about Z. |
| `bug-fix` | A reported defect to reproduce, root-cause, and fix with runtime evidence. |
| `feature` | New or changed behavior. Runs the spec → plan → implementation → review chain. |
| `refactoring` | A behavior-preserving change to structure or shape. |
| `perf-issue` | A measured slowness to trace and improve against a baseline. |
| `prototype` | A throwaway sketch to settle a design or behavioral fork by observing it. |
| `multi-phase-plan` | Work that spans phases or stacked PRs. |
| `babysit` | Driving a PR to merge-ready: conflicts, review threads, CI. "Check on PR X", "get it green". |
| `shipping` | Landing a verified green stack. "Land it", "merge when ready". |
| `autonomous-run` | A long task to drive to completion without stopping. "Run until done", "going to bed". |
| `session-pickup` | Resuming or taking over another agent's in-flight work. |
| `pause-safely` | Suspending in-flight work cleanly so it can be resumed. |
| `eval` | Testing how a skill, playbook, or prompt change affects agent behavior before promoting it. |
| `authoring-a-skill` | Writing or editing a `SKILL.md`, playbook, or skill reference. |
| `opening-a-pr` | The end of every other playbook. |

## Autonomy

Proceed on reversible work and reversible external actions without asking. Always pause for irreversible writes: force-push to shared branches, deploys, data deletion, messages to customers. "Don't stop", "going to bed", "run until done" mean keep going. Asked whether to do something, answer with your real judgment; "no" and "this doesn't earn its place" are acceptable answers. Approval gates inside a skill still stop for your human partner: brainstorming's design approval, and merge approval in `finishing-a-development-branch`.

## Project Structure

Before starting feature work in a repository, check whether it has the
AI-native structure (`.agents/` or `ARCHITECTURE.md` at the repo root). If
it does not, read `references/project-structure.md` and follow it: offer
once to create the starter structure, never block the task on the answer,
and never modify existing root instruction files (`AGENTS.md`,
`CLAUDE.md`, `GEMINI.md`).

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Platform Adaptation

If your harness appears here, read its reference file for special instructions:

- Codex: `references/codex-tools.md`

## User Instructions

User instructions (CLAUDE.md, AGENTS.md, GEMINI.md, etc, direct requests) take precedence over skills, which in turn override default behavior. Only skip skill workflows or instructions when your human partner has explicitly told you to.
