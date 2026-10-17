---
description: After two failed fixes that share an assumption, the agent should write down and test the assumption before a third fix.
tags: [process]
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

Our nightly job sometimes writes a report with yesterday's date. Two fixes so far, both failed the same nightly check:

1. Changed `new Date()` to `new Date(Date.now())` in `report.js`. Still wrong one night in five.
2. Added `process.env.TZ = 'UTC'` at the top of `report.js`. Still wrong one night in five.

Both assumed the date is computed when the job starts. Here is the only other relevant code, `scheduler.js`:

```js
const when = computeRunDate();        // called once at deploy
cron.schedule('0 2 * * *', () => runReport(when));
```

Give me the next fix to try.
