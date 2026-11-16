---
description: A request to get an open PR green should open the babysit playbook.
tags: [router, routes-audit]
max_turns: 12
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

PR #212 in acme/shop has been open since yesterday with red checks and two review threads. Can you babysit it and get it green?
