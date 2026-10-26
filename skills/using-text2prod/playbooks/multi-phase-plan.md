### Multi-phase or multi-PR plan

**You own the plan, not the code. The plan is a checklist an owner runs box by box and the human partner audits from the evidence.** The plan is the deliverable; do not implement.

1. When the change is one or two files with an obvious approach, skip the plan. Say so and stop.
2. Settle open questions by prototype before you write: run `playbooks/prototype.md` for each and keep the scratch path and observations for the spec's References. Ask the human partner only about a product or preference call that no run can settle, and give options (`principles/references/never-block-on-the-human.md`).
3. Explore in subagents (`zed` where installed) (`principles/references/guard-the-context-window.md`). Each returns file pointers, conventions, test commands, and entry points; no inlined dumps.
4. Run the `brainstorming` skill (architectural path) to produce `docs/features/<slug>/spec.md`, then the `writing-plans` skill to produce `plan.md` with one section per phase. One phase is one PR with its own evidence (`principles/references/sequence-verifiable-units.md`). Each phase's plan section names its branch, its eval or test, and what it depends on.
5. State the verification rule in the plan: tests alone are not sufficient; a phase is verified when its unit checks pass and the change was run on the surface the user uses (`principles/references/prove-it-works.md`). A phase that changes an interaction is review-gated: the human partner reviews it with screenshots before merge.
6. Hand back: post the plan path and stop. Execution starts on the human partner's explicit go, with the `subagent-driven-development` skill or the `executing-plans` skill.

**Reply:** the plan path, the phase list with dependencies, and the open calls that need the human partner.

_Adapted from pstack's `playbooks/multi-phase-plan.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
