---
description: A large cross-cutting request that fits no playbook should fall back to the figure-it-out skill and frame the run before acting.
tags: [zed-parity, router]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

We're moving production off Heroku onto Fly.io: 12 apps, 3 Postgres databases, a Redis instance, the scheduled jobs, DNS, and all the secrets. Each app can afford at most five minutes of downtime. Work out how to do it and get started.
