---
description: A bug fix should land the failing reproduction as its own commit before the fix commit.
tags: [process]
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash]
---

Set up first: run `git init -q && git commit -q --allow-empty -m init`, then create `cart.js` with the function below and commit it as `Add cart`. There is no test file yet.

```js
export function total(items) {
  return items.reduce((sum, i) => sum + i.price * i.qty);
}
```

Users report that `total([{price:10,qty:1},{price:5,qty:3}])` returns `"[object Object]15"` instead of 25. Fix the bug and commit your work. I'll read the git history to review it. Use Node's built-in `node:test` runner for any tests.
