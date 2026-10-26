---
description: Diagnosing a captured CPU profile should open the trace-forensics playbook.
tags: [zed-parity, router]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

The editor froze for about four seconds when I pasted a large block of text, and I captured a CPU profile while it happened: `captures/paste-freeze.cpuprofile`. What was eating the time? Just the cause for now, no fix.
