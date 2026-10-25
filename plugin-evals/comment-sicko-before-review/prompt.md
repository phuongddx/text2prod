---
description: Making a diff review-ready should dispatch the comment-sicko agent over it when the agent exists.
tags: [process, dispatch]
max_turns: 20
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Agent]
---

Create `slugify.js` with exactly this content, then get it review-ready: I'm about to open a PR for it.

```js
// slugify.js
// Phase 1: normalize the input
export function slugify(input) {
  // lower-case everything first
  const lower = input.toLowerCase();
  // IMPORTANT: do not remove, trims whitespace
  const trimmed = lower.trim();
  // replace runs of non-alphanumerics with a dash
  return trimmed.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
```
