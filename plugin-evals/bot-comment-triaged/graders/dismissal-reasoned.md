---
type: llm
---

PASS if the reply declines the bot's suggestion to extract `20` into a named constant and gives a concrete reason tied to this code (for example, the value appears once, as the default of a parameter whose name already says what it is), and also says the slice bug was fixed.
FAIL if the reply applies the constant, skips that comment without a reason, or does not address the slice bug.
