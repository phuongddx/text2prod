---
type: llm
---

PASS if the reply correctly explains that each call resets the timer so `fn` runs only after `wait` ms with no new calls, describes what `leading: true` changes, and says when throttling fits better than debouncing.
FAIL if the explanation is wrong, misses one of those three points, or the reply asks a question instead of explaining.
