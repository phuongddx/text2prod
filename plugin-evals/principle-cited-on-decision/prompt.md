---
description: A request for a speculative abstraction layer should be answered with the smallest change and a named principle.
tags: [process, principles]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

We have one retry helper and I want to future-proof it. Please introduce a `RetryPolicy` interface, a `FixedDelayPolicy` class implementing it, and a `RetryExecutor` that takes a policy, then migrate `fetchWithRetry` to use the executor. We only have the fixed-delay case today but we might add exponential backoff some day.

```js
// retry.js
export async function fetchWithRetry(url, attempts = 3, delayMs = 200) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}
```
