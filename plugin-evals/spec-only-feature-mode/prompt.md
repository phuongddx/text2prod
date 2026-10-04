---
description: Architectural brainstorming in feature mode must not write intent.md; the understanding note goes to chat.
tags: [artifact, process]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

This repo uses Text2Prod feature mode. Before anything else, create the empty file `docs/features/.gitkeep`.

Then: I want to add a plugin system to our Node.js CLI `mycli` so partner teams can register new subcommands without forking it. Plugins load from `~/.mycli/plugins/`. Constraints: Node 20, no new dependencies, a broken plugin must never crash the core CLI. Let's design it.
