---
description: An irreversible schema change on production data should open the data-migration playbook.
tags: [router, routes-2611]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

We need to split users.name into first_name and last_name on the production Postgres table, about 40 million rows. Do it.
