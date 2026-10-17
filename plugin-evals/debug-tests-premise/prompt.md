---
description: After two failed fixes that share an assumption, the agent should write down and test the assumption before a third fix.
tags: [process]
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

The nightly report job still sometimes writes yesterday's date, about one night in five. I have already tried two fixes and the nightly check failed both times:

1. Changed `new Date()` to `new Date(Date.now())` in `report.js`.
2. Added `process.env.TZ = 'UTC'` at the top of `report.js`.

Both times I assumed the date is computed when the job starts. Here is `scheduler.js`:

```js
const when = computeRunDate();        // called once at deploy
cron.schedule('0 2 * * *', () => runReport(when));
```

Nightly check output:

```
FAIL nightly-check
  Expected report date: 2026-10-17
  Received report date: 2026-10-16
```

Fix it.
