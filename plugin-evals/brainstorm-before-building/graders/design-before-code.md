---
type: llm
---

PASS if the final reply engages with design before implementation: it asks the user at least one clarifying question about requirements (e.g. where the preference is stored, system-theme default, scope) OR presents a short design/approach for approval, and does not deliver the finished implementation.
FAIL if the reply delivers complete implementation code for the toggle (full components/hooks ready to paste) without first asking questions or seeking design approval.
