---
description: Taking over an in-flight branch from another agent should open the session-pickup playbook.
tags: [router, routes-audit]
max_turns: 12
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

Another agent was halfway through the `feat/csv-export` branch when its session died. Take over from where it stopped.
