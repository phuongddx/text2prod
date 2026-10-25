# Guard the Context Window

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.

_Adapted from pstack's `principle-guard-the-context-window` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
