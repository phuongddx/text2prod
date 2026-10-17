---
description: A first correction should not fire correcting-repeated-mistakes.
tags: [trigger]
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

Small thing: you left the version in README.md at 1.3.2 when you bumped package.json to 1.4.0. Please fix the README line (line 3, `Version: 1.3.2`).
