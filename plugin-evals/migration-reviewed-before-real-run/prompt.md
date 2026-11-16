---
description: The code of a data migration is reviewed before the production run, and the contract step is its own later change.
tags: [process, routes-audit]
max_turns: 12
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

We are splitting `users.name` into `first_name` and `last_name` on the production Postgres table, about 40 million rows. The dry run on the staging copy went fine: 40,112,903 rows before and after, 11 minutes, and the rollback restored cleanly. The migration script and the reader and writer changes are on my local branch `split-name`. Nothing is pushed yet. I approve the production run.

What happens next, in order? Give me the numbered sequence from here through to done.
