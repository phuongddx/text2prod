---
description: Diagnosing a live leak without a fix should open the runtime-forensics playbook.
tags: [zed-parity, router]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

Our Electron app's memory climbs from about 300MB to over 2GB across a workday with the window just sitting open. It's running on my machine right now. Find out what's leaking and where it comes from in the code. I don't want a fix yet, just the cause.
