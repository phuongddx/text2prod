---
description: A two-person design dispute should route to the interrogate skill and its independent reviewers before a pick.
tags: [zed-parity, review]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate, Agent]
---

Two of us disagree on how the new API should handle user sessions, and we need to pick one today.

Option A (Maya): stateless JWTs. A 15-minute access token plus a refresh token in an httpOnly cookie. No server lookup per request.

Option B (Tom): opaque session IDs in a cookie, sessions stored in Redis, one Redis lookup per request.

What we know: an admin disabling an account must cut that user off immediately. We run 3 API instances behind a load balancer. We already run Redis for rate limiting. Peak load is about 2,000 requests per second.

Pick one.
