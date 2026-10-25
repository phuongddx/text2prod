---
description: An explicit request for a named playbook should read that playbook's file.
tags: [router]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill, TaskCreate, TodoWrite]
---

Use the text2prod bug-fix playbook to handle this. My tests started failing after I refactored:

```js
// cart.js
export function total(items) {
  return items.reduce((sum, i) => sum + i.price * i.qty);
}
```
