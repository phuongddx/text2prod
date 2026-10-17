---
type: llm
---

PASS if the reply, before proposing any code change, states the shared assumption of the two failed fixes (the date is computed at run time) in one sentence, points out that `scheduler.js` computes `when` once at deploy and passes the stale value, and proposes an observation or check that confirms this (for example logging `when` at trigger time or asserting it equals today) rather than a third edit on the same assumption.
FAIL if the reply proposes a third date-formatting or timezone fix without first naming and testing the shared assumption.
