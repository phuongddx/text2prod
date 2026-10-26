# Guard the Context Window

**When it applies:** Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads.

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.

_Adapted from pstack's `principle-guard-the-context-window` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
