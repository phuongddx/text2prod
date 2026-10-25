### Feature

**You own the design. Plan, review, verify.** Delegate implementation; stay in the lead. This playbook is the spec → plan → implementation → review chain as steps.

1. Read the affected subsystem's code and docs before designing; cite paths.
2. Run the `brainstorming` skill: classify (spike, bounded, architectural), agree the understanding note, present the design, and get approval. Architectural work ends with an approved `docs/features/<slug>/spec.md`.
3. Write the throughput checkpoint as four items, each kept with `n/a: <reason>` when it does not apply:
   - **Blocking first steps.** Gates that run before any fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize; shared writes serialize.
   - **Shared mutable state.** Split the target first (`principles/references/separate-before-serializing-shared-state.md`); serialize only for a real invariant.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Name the data shape and its organizing structure before any logic is written (`principles/references/model-the-domain.md`): a state machine over scattered booleans, a table over branching, a typed model over repeated shape assumptions.
5. Architectural: run the `writing-plans` skill, then execute with the `subagent-driven-development` skill (delegates are `zed`) or the `executing-plans` skill. Bounded: implement with the `test-driven-development` skill directly.
6. Verify on the surface the user uses with the `verification-before-completion` skill. "Inconclusive" or wrong-surface is not a pass.
7. Rebase into small, ordered commits, each verified before the next (`principles/references/sequence-verifiable-units.md`).
8. If the design is contested, run the `requesting-code-review` skill before shipping.
9. Run `playbooks/opening-a-pr.md`.

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline; that owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments).

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.

_Adapted from pstack's `playbooks/feature.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
