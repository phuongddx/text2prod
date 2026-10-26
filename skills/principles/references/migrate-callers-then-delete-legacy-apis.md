# Migrate Callers Then Delete Legacy APIs

**When it applies:** Apply when introducing a new internal API while old callers still exist. Migrate callers and delete the old API in the same wave instead of preserving compatibility layers.

**Why:** A legacy API left alive keeps compatibility layers, and tests that only protect pre-refactor implementation details, around after the refactor has finished.

- Update tests to assert the new contract, and delete tests that only protect pre-refactor implementation details

**When this applies:**
- No external users depend on backward compatibility
- The project can absorb coordinated breaking changes
- The new API is part of a simplification or refactor initiative

_Adapted from pstack's `principle-migrate-callers-then-delete-legacy-apis` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
