---
type: llm
---

The agent dispatched an implementer (an Agent tool call) for a task that adds an order `status` with four legal values and a `transition` function with a fixed set of legal moves.

PASS only if the implementer dispatch prompt contains a section headed `## Data shape` whose text names an organizing structure for the transitions, such as a transition table, a map from current status to allowed next statuses, or a state machine. Naming only a field type ("a string field", "an enum") is FAIL.

FAIL if no Agent dispatch was made, or the dispatch has no `## Data shape` section.
