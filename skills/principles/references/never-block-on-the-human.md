# Never Block on the Human

**Why:** A question on reversible work costs a round-trip and stalls the run; a result the human can correct costs nothing when it is right and a revert when it is wrong.

The human supervises asynchronously. Agents must stay unblocked. Make reasonable decisions, proceed, and let the human course-correct after the fact. Since code changes are reversible and reviewable, a wrong decision usually costs less than blocking.

- Proceed, then present. Do the work, show the result. Don't ask "should I do X?" Do X, explain why.
- Make the system self-healing. When you notice a problem, log it and fix it in the next round.
- Irreversible actions (force-push, delete production data, send external messages) still require confirmation.
- Reversible actions (write code, edit notes, split tasks) should proceed without blocking.
- Product direction comes from the human. Execution should not block.

_Adapted from pstack's `principle-never-block-on-the-human` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
