---
description: Asking for a code review before merge should fire the review skill, and the reviewer prompt it dispatches should carry the Impact block.
tags: [process]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Agent]
---

I just finished this change on my branch and the tests pass. Get it code-reviewed before I merge. The repo is a small Node CLI; `config.json` is read by `src/load-config.js` (shown in the diff) and by `scripts/release.sh`, which is not in the diff and greps the key by name.

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
