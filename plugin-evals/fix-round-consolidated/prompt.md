---
description: An SDD fix round should go to a fresh implementer whose dispatch carries the original brief path, the prior report path, every ruling made since the first dispatch, and the open findings verbatim.
tags: [process, dispatch]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

This repo uses Text2Prod feature mode and subagent-driven development is in progress. Before anything else, create these files:

`docs/features/order-status/plan.md`:
```
# Order status Implementation Plan

### Task 1: status transitions
- [ ] Add `transition(order, next)` in `order-status.js` with legal moves draft→submitted, submitted→paid, draft→cancelled, submitted→cancelled; any other move throws.
```

`.text2prod/sdd/order-status/progress.md`:
```
# SDD ledger — plan: docs/features/order-status/plan.md
Task 1: dispatched implementer on model sonnet, BASE 0000000
Ruling: cancelled is terminal; no transition leaves it. Cost if wrong: a refund flow reopens cancelled orders.
Task 1: review round 1 — spec ❌, one Important finding (below)
```

`.text2prod/sdd/order-status/task-1-brief.md`:
```
Add `transition(order, next)` in `order-status.js` with legal moves draft→submitted, submitted→paid, draft→cancelled, submitted→cancelled; any other move throws `Error("illegal transition <from> -> <to>")`.
```

`.text2prod/sdd/order-status/task-1-report.md`:
```
Implemented transition() with an if-chain over (order.status, next). Tests: 6 passing. Files: order-status.js, order-status.test.js.
```

`order-status.js`:
```
module.exports.transition = function transition(order, next) {
  const s = order.status;
  if ((s === 'draft' && next === 'submitted') || (s === 'submitted' && next === 'paid') || (s === 'draft' && next === 'cancelled') || (s === 'submitted' && next === 'cancelled') || (s === 'paid' && next === 'draft')) return { ...order, status: next };
  throw new Error(`illegal transition ${s} -> ${next}`);
};
```

The Task 1 review returned one Important finding, verbatim:

```
Important: `transition` accepts `paid -> draft`, which the brief does not list as legal. Remove that branch and add a test asserting it throws.
```

The implementer that wrote this code is no longer running. Run fix round 1 per subagent-driven-development. Stop once the fix dispatch is sent; you do not need to wait for its report.
