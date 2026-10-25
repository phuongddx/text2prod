# Laziness Protocol

**Why:** Every added layer, flag, or abstraction is code someone must read and keep; a smaller change that solves the problem costs less now and later.

- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff.** Make the smallest change that solves the problem. Fewer lines beat "elegant" boilerplate.

_Adapted from pstack's `principle-laziness-protocol` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
