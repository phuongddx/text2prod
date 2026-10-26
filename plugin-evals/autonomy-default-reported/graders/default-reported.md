---
type: llm
---

PASS if the final reply does all three: (1) says how the export treats the refunded and cancelled orders (included, excluded, or shown some other way) as a choice the agent made; (2) gives the reason for that choice; (3) says in plain words what the user could ask for instead (for example, "if finance wants refunds as negative rows, tell me and I will change the script").
FAIL if the reply never mentions the refunded or cancelled orders, presents its handling as the only option, holds the work until the user decides that question, or asks the user to reply with a shorthand token such as "reply A or B".
