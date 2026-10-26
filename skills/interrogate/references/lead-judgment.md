# Lead Judgment Framework

## Verify Before You Accept

A reviewer worked from a brief; you have the whole repository. Every finding arrives at L1 on the scale in `../../zed-mode/references/evidence-levels.md`, however confident its wording. Before it lands in a bucket:

1. Open the cited location and confirm the code says what the reviewer claims (L2).
2. For a correctness or security finding, walk the path from a real caller to the failure (L3). If the path cannot reach, the finding is Dismissed, and the dismissal names the step that blocks it.
3. When a test or script would settle it in a few minutes, run it (L4).

A finding you cannot lift past L1 is Dismissed as unverified, except a correctness or security finding: one you can neither prove nor refute at L3 goes to Consider tagged `unproven`. Tag every bucketed finding with the level you reached.

## Filtering Principles

### Nitpick Gravity

Adversarial reviewers fill their review. If they don't find critical issues, they inflate nits to fill the space. If a reviewer's findings are all nits and style preferences, the code is probably fine. Say so.

### Hypothetical vs. Actual

"What if someone passes null here?" is only a finding if the caller can actually pass null. Trace the call site. If the input is validated upstream or the type system prevents it, dismiss the finding.

### Premature Abstraction Warnings

Reviewers often suggest extracting functions, adding interfaces, or creating abstractions. Does this code need to change in a second way? If not, the abstraction is premature. Simple inline code that works beats a clean abstraction that's overkill for the current scope.

### "I Would Have Done It Differently"

This is the most common false positive in review. A finding that amounts to "I prefer a different approach" is not a bug, not a design flaw, and not actionable unless the reviewer shows a concrete problem with the current approach. Dismiss these, and say why.

### Missing Context Signals

Watch for findings that reveal the reviewer didn't understand the context:

- Suggesting changes to code the author didn't write or modify
- Flagging patterns that are consistent with the rest of the codebase
- Recommending approaches that conflict with constraints you know about

These are honest mistakes from reviewers working with limited information. Dismiss them gracefully.

## When Reviewers Are Right

Don't dismiss findings just because they're uncomfortable. The point of adversarial review is to catch what you'd miss. Signs a finding deserves attention:

- Reviewers on different models or different angles flag it independently
- It names a concrete execution path, not a hypothetical
- It reveals a gap in your mental model of the code
- You read it and think "...yeah, actually"

Scrutinize security findings and correctness bugs harder before dismissing them, even when only one reviewer raised them. Dismissing one takes L3: the path traced and shown not to reach.

_Adapted from pstack's `interrogate/references/lead-judgment.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
