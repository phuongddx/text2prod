---
type: llm
---

PASS if the final reply, in chat, restates the user's goal and at least one of their constraints (Node 20, no new dependencies, broken plugins must not crash the CLI) and invites correction or asks a clarifying question, and no implementation code for the plugin system was written.
FAIL if the reply delivers implementation code, or gives no restatement of the goal or constraints in chat.
