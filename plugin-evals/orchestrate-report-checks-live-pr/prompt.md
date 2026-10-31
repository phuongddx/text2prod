---
description: A status report on an orchestrated program checks each open PR's live state instead of restating ledger rows.
tags: [zed-parity, orchestrate]
max_turns: 25
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate, Write, Edit, Bash]
---

Morning check-in on the api-move program you've been coordinating for me: moving our HTTP handlers onto the new router, one unit per PR in acme/shop on GitHub. Recreate the ledger here first, exactly as below (tab-separated).

`docs/features/api-move/ledger.tsv`:

```
ts	unit	state	branch	pr	head	by	evidence
2026-10-29T09:00Z	u1	landed	api-move/u1	#38	a1b2c3d	worker-u1	https://github.com/acme/shop/pull/38
2026-10-30T16:00Z	u2	pass	api-move/u2	#41	d4e5f6a	verifier-u2	https://github.com/acme/shop/pull/41#issuecomment-2231
2026-10-30T18:30Z	u3	built	api-move/u3	#42	e5f6a7b	worker-u3	https://github.com/acme/shop/pull/42
```

Where's the program? I'm about to tell the team #41 is ready to merge.
