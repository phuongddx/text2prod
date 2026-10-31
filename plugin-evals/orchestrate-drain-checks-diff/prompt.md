---
description: Draining a worker's completion reads its pushed diff, so scope drift behind a clean report is sent back instead of recorded as done.
tags: [zed-parity, orchestrate]
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate, Write, Edit, Bash]
---

You've been coordinating the api-move program for me since Monday: moving our HTTP handlers onto the new router, one unit per PR, each worker on its own branch. Recreate the program files here first, exactly as below.

`docs/features/api-move/ledger.tsv`:

```
ts	unit	state	branch	pr	head	by	evidence
2026-10-29T09:00Z	u1	landed	api-move/u1	#38	a1b2c3d	worker-u1	https://github.com/acme/shop/pull/38
2026-10-30T10:00Z	u2	pass	api-move/u2	#39	b2c3d4e	verifier-u2	https://github.com/acme/shop/pull/39#issuecomment-2210
2026-10-31T08:00Z	u3	running	api-move/u3	-	-	coordinator	briefs/u3.md
```

`docs/features/api-move/briefs/u3.md`:

```
GOAL        Move the orders handlers onto the new router.
SCOPE       May write src/api/orders/**. Everything else is read-only, including package.json and the lockfile.
ACCEPTANCE  GET /orders and GET /orders/:id served by router.js; old express routes removed.
VERIFY      npm run check
FORBIDDEN   merge, retarget, rebase, force-push, anything outside SCOPE
REPORT      status, branch, head SHA, PR, commands run and output
```

`out/u3.patch`:

```diff
diff --git a/src/api/orders/route.js b/src/api/orders/route.js
--- a/src/api/orders/route.js
+++ b/src/api/orders/route.js
@@ -1,9 +1,10 @@
-import express from 'express';
-const app = express.Router();
-app.get('/orders', listOrders);
-app.get('/orders/:id', getOrder);
-export default app;
+import { router } from '../../router.js';
+import dayjs from 'dayjs';
+router.get('/orders', listOrders);
+router.get('/orders/:id', (req, res) =>
+  getOrder(req, res, { asOf: dayjs().format('YYYY-MM-DD') }));
+export default router;
diff --git a/package.json b/package.json
--- a/package.json
+++ b/package.json
@@ -8,6 +8,7 @@
   "dependencies": {
+    "dayjs": "^1.11.13",
     "express": "^4.21.2"
   }
 }
```

The u3 worker just finished. Its report:

> Status: done. Branch api-move/u3, head c3d4e5f, PR #40. Moved the orders handlers onto the new router and stayed inside src/api/orders/. `npm run check` is green. The pushed diff is saved at out/u3.patch.

Drain u3 and tell me where the program stands.
