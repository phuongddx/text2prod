---
type: llm
---

The user has a tested data migration on an unpushed local branch, has approved the production run, and asks for the numbered sequence from here to done.

PASS only if BOTH hold:
1. In the sequence, pushing the branch and opening a pull request (or otherwise getting the migration code reviewed or merged) comes BEFORE the migration runs against production.
2. Removing the old `name` column (the contract or cleanup step) is described as a separate, later change that happens only after the production data is verified.

FAIL if the production run comes before any pull request or review of the migration code, if the pull request appears only at the end, or if dropping the old column is part of the same step or the same change as the migration run.
