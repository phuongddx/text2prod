### Refactoring

**You own the contract. The structure changes; the behavior does not.** Distinct from Feature, which adds behavior, and Bug fix, which corrects it. If the cleanup reveals a missing feature or a real bug, split it out and ship the structural change first against the pinned contract. Large or cross-cutting structural work goes through the `writing-plans` skill as a multi-phase plan.

1. Pin the behavior contract first. Read the affected code and its docs to learn the contract, then write a characterization test, snapshot, or equivalence harness that captures current behavior before any structure moves. Type check and lint are not a pin.
2. Name the structure the code is missing (`principles/references/model-the-domain.md`). Boring code stays when the shape is already clear and local. The reshape must delete branches or invalid states, not add indirection.
3. Name the target shape: the module layout, types, and call graph if built today (`principles/references/foundational-thinking.md`, `principles/references/redesign-from-first-principles.md`). If it crosses a function boundary, run the `brainstorming` skill (bounded path) before the move.
4. Subtract before you add: delete dead code, collapse one-caller wrappers, drop redundant validators, remove orphan references, then introduce the new shape (`principles/references/subtract-before-you-add.md`, `principles/references/laziness-protocol.md`). A speculative cleanup that "might help" gets reverted.
5. Move in small behavior-preserving steps, each keeping the pin green. For API reshapes, migrate every caller and delete the old API in the same wave; no compatibility shims (`principles/references/migrate-callers-then-delete-legacy-apis.md`). Spot-check every rename against the actual files: renames miss usages in strings, prose, and back-references. Delegate mechanical edits to a `zed` subagent with a specific scope (file paths, the names being moved, the behavior to hold).
6. Prove behavior is unchanged on the real artifact, not "it compiles" (`principles/references/prove-it-works.md`): a script that diffs old-vs-new outputs, a recorded baseline replayed against the new code, or a smoke run on the surface the user uses.
7. Confirm the change is worth keeping: the success measure is reduced reader load (`principles/references/minimize-reader-load.md`). If the diff does not lower reader load somewhere, revert it.
8. Rebase into small ordered commits: subtraction, reshape, follow-on cleanup (`principles/references/sequence-verifiable-units.md`). Run `playbooks/opening-a-pr.md`.

**Reply:** the structure that changed, the pin you held it against, the equivalence proof, the reader-load delta, what shipped and what got reverted. No new behavior.

_Adapted from pstack's `playbooks/refactoring.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
