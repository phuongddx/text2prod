### Authoring a skill

**You own the skill's voice.** Use this for writing or editing any `SKILL.md`, playbook, or skill reference.

1. Follow the `writing-skills` skill.
2. Validate the skill: frontmatter has `name` and a `description` that starts "Use when", referenced files exist, cross-skill links resolve.
3. Prove the behavior change with `playbooks/eval.md`. Structural changes also get a static test under `tests/`.
4. Run `playbooks/opening-a-pr.md`.

When in doubt, delete. Keep only prose that changes a decision. Tell the agent to do the thing and skip the reason unless the rule is confusing without one. Point at structural sources (types, manifests, config) instead of restating them (`principles/references/encode-lessons-in-structure.md`). Delegate to other skills by path. A workflow you keep hitting that no skill captures: propose a new skill.

**Reply:** what the skill does, the key design decisions, validation and eval results.

_Adapted from pstack's `poteto-mode/playbooks/authoring-a-skill.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
