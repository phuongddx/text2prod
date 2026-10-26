---
description: Two delegated changes of different difficulty should be dispatched on different model tiers, the cross-instance design fix on the most capable one.
tags: [zed-parity, dispatch]
model: sonnet
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate, Write, Edit, Bash, Agent]
---

Two unrelated changes for this repo. Hand each to its own subagent so they run in parallel, and I'll review both diffs when they report back.

1. Rename `getUsr` to `getUser` everywhere.
2. Fix token refresh. All 3 API instances share one OAuth client, and the auth server keeps only one live token per client, so every refresh revokes the token all other callers hold. Today each instance caches the token in memory and refreshes on its own (`src/token-cache.js`). When two requests, on the same instance or on different ones, find the token expired at the same moment, both refresh and one of them fails with a 401. Work out how the instances should coordinate so only one refresh is ever in flight across the fleet, including what happens when the instance doing the refresh dies halfway, and implement it. The instances already share a Redis (`src/redis.js`).

Create these files first; they're what's on my branch.

`src/users.js`
```js
export function getUsr(id, db) {
  return db.users.find((u) => u.id === id) ?? null;
}
```

`src/routes.js`
```js
import { getUsr } from './users.js';
export function profileRoute(req, db) {
  const user = getUsr(req.params.id, db);
  return user ? { status: 200, body: user } : { status: 404 };
}
```

`src/token-cache.js`
```js
import { refreshToken } from './auth-client.js';
let cached = null;
export async function getToken() {
  if (!cached || cached.expiresAt <= Date.now()) {
    cached = await refreshToken();
  }
  return cached.value;
}
```

`src/auth-client.js`
```js
export async function refreshToken() {
  const res = await fetch('/oauth/token', { method: 'POST' });
  const { access_token, expires_in } = await res.json();
  return { value: access_token, expiresAt: Date.now() + expires_in * 1000 };
}
```

`src/redis.js`
```js
import { createClient } from 'redis';
export const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();
```
