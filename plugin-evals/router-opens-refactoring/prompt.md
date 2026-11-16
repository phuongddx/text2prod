---
description: A behavior-preserving restructure should open the refactoring playbook.
tags: [router, routes-audit]
max_turns: 12
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

`OrderService` is a 900-line class driven by six boolean flags. Restructure it so it is readable. Behavior must stay exactly the same.
