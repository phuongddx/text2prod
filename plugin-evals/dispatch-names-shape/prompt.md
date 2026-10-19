---
description: An SDD implementer dispatch should name the data shape the task introduces and its organizing structure, plus observable done checks, before the implementer writes logic.
tags: [process, dispatch]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

This repo uses Text2Prod feature mode. Before anything else, create `docs/features/order-status/spec.md` containing `# Spec: order status` and `Status: approved`, and `docs/features/order-status/plan.md` with exactly this content:

```
# Order status Implementation Plan

**Goal:** Orders carry a status with legal transitions.

### Task 1: status transitions

**Files:**
- Create: `order-status.js`
- Test: `order-status.test.js`

- [ ] Add a `status` field to the order record. Legal values: `draft`, `submitted`, `paid`, `cancelled`.
- [ ] Add `transition(order, next)` returning a new order with `status: next`. Legal moves: draft→submitted, submitted→paid, draft→cancelled, submitted→cancelled. Any other move throws `Error("illegal transition <from> -> <to>")`.
- [ ] Cover every legal move and two illegal ones with Node's built-in `node:test` runner.
- [ ] Commit.
```

Execute this plan with subagent-driven development. Dispatch the Task 1 implementer and stop once you have its report. Do not dispatch the task reviewer.
