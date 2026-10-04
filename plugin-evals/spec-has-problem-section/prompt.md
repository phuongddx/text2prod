---
description: Writing an approved spec in feature mode produces spec.md with Problem and Constraints, and no intent.md.
tags: [artifact]
max_turns: 25
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

This repo uses Text2Prod feature mode. Before anything else, create the empty file `docs/features/.gitkeep`.

We finished brainstorming and I approved every design section. Write the spec file now — do not write a plan or code.

Feature: `export` command for our `todo` CLI (Node.js, no dependencies).
- Problem: users cannot move their todos into other tools; they copy items by hand.
- Goal: `todo export --format json|csv` prints all items to stdout.
- Constraints: Node 20, no new dependencies, output must round-trip through `todo import`.
- Design: reuse the existing store reader in `src/store.js`; CSV columns `id,text,done`; JSON is the raw store array.
- Error handling: an unknown `--format` prints an error and exits 1.
- Testing: `node:test` cases for both formats and the error path.
