---
type: llm
---

PASS if the reply directly and correctly explains that `const` bindings cannot be reassigned while `let` bindings can (optionally noting both are block-scoped and that `const` objects are still mutable).
FAIL if the reply is wrong, evasive, or asks clarifying questions instead of answering.
