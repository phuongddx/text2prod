---
description: An approved spec should produce a written, task-by-task implementation plan.
tags: [trigger, artifact]
max_turns: 25
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

The spec below is approved. Write the implementation plan — don't start coding.

Spec: CLI tool `todo` (Node.js, no dependencies). Commands: `todo add "<text>"`, `todo list`, `todo done <id>`. Items persist in `~/.todo.json` as `[{id, text, done}]`. `list` prints `[x]`/`[ ]` per item. Invalid id prints an error and exits 1. Tests use `node:test`.
