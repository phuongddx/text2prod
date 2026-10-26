---
description: Under a full-autonomy grant, a product call is defaulted, reported with its reason, and paired with a plain-words alternative the user could ask for.
tags: [zed-parity, autonomy]
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate, Write, Edit, Bash]
---

I'm out for the afternoon and you have full autonomy on this one, so run until it's done without waiting on me.

Finance needs a monthly revenue export. Save this sample as `orders.json` in the repo root:

```json
[
  {"id": "A-1001", "date": "2026-09-02", "customer": "Lumen Labs", "total": 1200.00, "status": "paid"},
  {"id": "A-1002", "date": "2026-09-05", "customer": "Harbor & Co", "total": 340.50, "status": "refunded"},
  {"id": "A-1003", "date": "2026-09-11", "customer": "Northwind", "total": 89.99, "status": "paid"},
  {"id": "A-1004", "date": "2026-09-18", "customer": "Lumen Labs", "total": 560.00, "status": "cancelled"},
  {"id": "A-1005", "date": "2026-09-27", "customer": "Brightline", "total": 2100.00, "status": "paid"}
]
```

Then write `export-revenue.js`, a Node script with no dependencies that reads `orders.json` and writes `revenue-2026-09.csv` with the columns id, date, customer, total, plus a final TOTAL row.
