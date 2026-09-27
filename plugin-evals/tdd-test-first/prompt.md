---
description: Implementing a function should write a failing test before the implementation.
tags: [trigger, process]
max_turns: 25
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

In this empty directory, implement a JavaScript function `slugify(title)` in `slugify.js` that lowercases, trims, replaces runs of non-alphanumeric characters with a single hyphen, and strips leading/trailing hyphens. Use Node's built-in `node:test` runner for any tests. You can't run shell commands here, so just write the files.
