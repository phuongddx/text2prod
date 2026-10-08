# Text2Prod Architecture

Text2Prod is a **zero-dependency, multi-harness plugin**: it distributes
general-purpose skills and session-start hooks to coding agents across
IDEs and CLIs.

## Layout model

| Location | Role |
| --- | --- |
| `skills/` | The product. General-purpose skills (`brainstorming`, `writing-plans`, `test-driven-development`, …). |
| `hooks/` | The product. Session-start wiring that loads the bootstrap per harness. |
| `.*-plugin/`, `.opencode/` | Adapters. Claude Code / Codex / OpenCode packaging that points back at `skills/` and `hooks/`. |
| `skills/using-text2prod/` | Bootstrap skill — loaded at session start; makes the other skills trigger at the right moments. |
| `docs/` | Durable reference: [testing](docs/testing.md), [porting to a new harness](docs/porting-to-a-new-harness.md), [feature workflow](docs/feature-workflow.md). |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute: ground rules, workflow, PR requirements. |
| `.agents/` | Agent layer for this repo: `skills/`, `policies/`, `hooks/`, `templates/`. |
| `docs/features/<slug>/` | Per-feature artifact chain: `spec.md → plan.md → review.md`. See [feature workflow](docs/feature-workflow.md). |
| `docs/engineering/` | Stable knowledge specs are drafted against: [conventions](docs/engineering/conventions.md), [infrastructure](docs/engineering/infrastructure.md), [tech stack](docs/engineering/tech-stack.md). |
| `plans/` | Historical working artifacts from before `docs/features/`; reports. |
| `tests/` | Plugin-infrastructure tests. |

## Rules

- Skills and hooks at the repo root **are** the product; adapters never
  contain logic, only wiring.
- This file and `AGENTS.md` point at knowledge; they never restate it.
- Anything durable belongs in `docs/`; a feature's artifacts belong in
  `docs/features/<slug>/`.
