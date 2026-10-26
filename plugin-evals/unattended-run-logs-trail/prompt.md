---
description: An unattended migration should leave a decision-log TSV written during the run.
tags: [zed-parity, autonomy]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate, Write, Edit, Bash]
---

Going to bed now. Our old `fetchJson(url)` helper is deprecated in favor of the `api.get(url)` client, which returns the parsed body the same way. Please move every call site over to `api.get`. Run until it's done; I'll look at it in the morning.

These are the files as they are on my machine, so create them first.

`lib/fetch-json.js`
```js
export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}
```

`lib/api.js`
```js
export const api = {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
  },
};
```

`src/orders.js`
```js
import { fetchJson } from '../lib/fetch-json.js';
export const listOrders = () => fetchJson('/api/orders');
export const getOrder = (id) => fetchJson(`/api/orders/${id}`);
```

`src/users.js`
```js
import { fetchJson } from '../lib/fetch-json.js';
export async function currentUser() {
  const me = await fetchJson('/api/me');
  return { ...me, initials: me.name.split(' ').map((p) => p[0]).join('') };
}
```

`src/reports.js`
```js
import { fetchJson } from '../lib/fetch-json.js';
export async function monthly(month) {
  const [orders, refunds] = await Promise.all([
    fetchJson(`/api/orders?month=${month}`),
    fetchJson(`/api/refunds?month=${month}`),
  ]);
  return { orders, refunds };
}
```
