---
type: llm
---

PASS if the reply says u3's pushed diff changes `package.json` (it adds `dayjs`), that this is outside the brief's SCOPE of `src/api/orders/**` or contradicts the worker's report, and it does not accept u3 as finished: it sends the work back, records u3 as `fail` or not done, routes the change to a fix unit, or parks the dependency as a follow-up while leaving u3 open.
FAIL if the reply accepts the worker's report as written, records or describes u3 as built, passed or done without flagging `package.json`, or never mentions the dependency.
