---
description: A code review should name the fact the change is safe because of and look for readers outside the diff.
tags: [process]
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

Review this change before I merge it. The repo is a small Node CLI; `config.json` is read by `src/load-config.js` (shown) and by `scripts/release.sh` (not shown, it greps the key by name).

```diff
--- a/config.json
+++ b/config.json
-  "releaseChannel": "stable",
+  "channel": "stable",
--- a/src/load-config.js
+++ b/src/load-config.js
-  return cfg.releaseChannel;
+  return cfg.channel;
```

Tests pass. Write the review.
