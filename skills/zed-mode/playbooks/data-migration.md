### Data migration

**You own the data. Every step is reversible until the one that is not, and that one waits for your human partner.** Use for a schema change, a backfill, or any write to stored data that cannot be undone. The code that reads and writes the data changes under `playbooks/feature.md` or `playbooks/refactoring.md`. This playbook orders the data steps around it.

1. Read the current schema, the data volume, and every reader and writer of the affected data. Cite paths. Name the invariant the migration must hold, such as a row count, uniqueness, no nulls, or a checksum.
2. Design it as expand, migrate, contract. Add the new shape beside the old one, move the data, switch readers and writers, and remove the old shape last in a separate change. A destructive step never shares a deploy with the step that depends on it.
3. Make the migration rerunnable. It runs in batches, resumes from where it stopped, and is safe to run twice (`principles/references/make-operations-idempotent.md`).
4. Write the rollback for each step, and say which step has none. A backup counts only after you have restored from it.
5. Dry-run on a copy or a production-sized sample. Record the invariant before and after, the run time, and the locking or load it caused. Run the rollback there too.
6. Pause for your human partner before the real run and again before the contract step. Give the commands, the dry-run numbers, the rollback, and the point of no return. A full-autonomy grant does not cover these two pauses.
7. Run it, then verify the invariant on the real data and on the surface the user uses (`principles/references/prove-it-works.md`). Keep the old shape until that passes.
8. Run the `verification-before-completion` skill, then `playbooks/opening-a-pr.md`.

**Reply:** the invariant with its before and after values, the dry-run results, each step's rollback, what ran in production and who approved it, and what remains to contract.

_Original to Text2Prod._
