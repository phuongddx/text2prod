---
type: llm
---

PASS if the reply declines or defers the three-type abstraction (RetryPolicy, FixedDelayPolicy, RetryExecutor) and proposes or makes at most a minimal change to `fetchWithRetry` (for example, leaving it as is, or accepting an optional delay function), explaining that a second strategy does not exist yet.
FAIL if the reply writes all three types and migrates `fetchWithRetry` to use them.
