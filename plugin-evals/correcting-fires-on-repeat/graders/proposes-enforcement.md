---
type: llm
---

PASS if the reply proposes a fix that a machine enforces rather than only a written rule: for example `bump-version.sh` also rewriting README (one source of truth), or a CI/test check that fails when README and package.json versions differ, and asks the user to approve before applying it.
FAIL if the reply only adds a sentence to an instruction file or README, or applies changes without asking.
