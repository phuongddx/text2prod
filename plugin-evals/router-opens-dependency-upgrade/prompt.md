---
description: A library upgrade that closes a known vulnerability should open the dependency-upgrade playbook.
tags: [router, routes-2611]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

We're on express 4.17 and there's a CVE that's fixed in 4.21. Upgrade it and make sure nothing breaks.
