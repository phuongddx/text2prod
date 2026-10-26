---
description: A sustained push on one metric toward a target should open the hillclimb playbook, not the one-off perf playbook.
tags: [zed-parity, router]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

Search p95 latency on our staging dataset is 840ms, and we need it under 300ms before launch. Keep iterating on it until we get there. One lucky fix won't cut it; I need the number to hold.
