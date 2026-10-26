---
description: A styling migration that must not change a pixel should open the visual-parity playbook.
tags: [zed-parity, router]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

We're moving `Button`, `Card`, and `Modal` off styled-components onto CSS modules. Nothing may look different afterwards, not even by a pixel.
