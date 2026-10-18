---
description: Closing a feature folder should copy the plan ledger's rulings into review.md.
tags: [artifact]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit]
---

This repo uses Text2Prod feature mode. Before anything else, create `docs/features/csv-export/spec.md` containing `# Spec: CSV export` and `Status: approved`, and `docs/features/csv-export/plan.md` containing `# CSV export plan`.

The branch implementing that plan is done and tests are green (12/12, exit 0). The code review found no Critical or Important issues. The plan ledger holds two rulings:

```
Ruling: kept the quoting helper inline instead of a new module (one caller). Cost if wrong: a second caller duplicates it.
Ruling: used `\n` line endings, not `\r\n`, since the only consumer is our own importer. Cost if wrong: Excel on Windows shows one line.
```

Close out the feature folder. Do not merge or open a PR, just write the close-out artifacts.
