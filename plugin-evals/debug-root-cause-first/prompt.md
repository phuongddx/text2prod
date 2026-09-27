---
description: A bug report should trigger root-cause investigation before a fix.
tags: [trigger, process]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

My tests started failing after I refactored this. Can you just fix it?

```js
// cart.js
export function total(items) {
  return items.reduce((sum, i) => sum + i.price * i.qty);
}
```

```
FAIL cart.test.js
  ✕ total of two items (3 ms)
    Expected: 25
    Received: "[object Object]15"
```
