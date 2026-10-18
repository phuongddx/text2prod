---
description: Closing a feature folder after subagent-driven development should record the rulings from the controller's final message, since the ledger file is already deleted.
tags: [artifact]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

This repo uses Text2Prod feature mode. Before anything else, create `docs/features/csv-export/spec.md` containing `# Spec: CSV export` and `Status: approved`, and `docs/features/csv-export/plan.md` containing `# CSV export plan`.

Subagent-driven development just finished that plan and cleaned up its workspace, so there is no ledger file any more. Tests are green (12/12, exit 0) and the final review found no Critical or Important issues. Its final message ended with:

Rulings I made
1. Ruling: kept the quoting helper inline instead of a new module (one caller). Cost if wrong: a second caller duplicates it.
2. Ruling: used `\n` line endings, not `\r\n`, since the only consumer is our own importer. Cost if wrong: Excel on Windows shows one line.

Close out the feature folder. Do not merge or open a PR, just write the close-out artifacts.
