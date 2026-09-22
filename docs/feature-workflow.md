# Feature Workflow

The artifact chain for a feature-sized change. Each stage commits an
artifact the next stage reads; the plan directory is the audit trail.

```text
intent.md → spec.md → plan.md → implementation → review.md → merge
```

## Where artifacts live

Everything goes in one plan directory: `plans/<date>-<issue>-<slug>/`.
Start by copying the templates you need from `plans/templates/`.

## Who owns each format

| Artifact | Owner | How it's produced |
| --- | --- | --- |
| `intent.md` | Originator | Copy `plans/templates/intent.md`, fill before design. |
| `spec.md` | `brainstorming` skill | Architectural path of the skill writes the design. |
| `plan.md` | `writing-plans` skill | The skill defines the format — do not hand-roll. |
| implementation | `executing-plans` / `subagent-driven-development` | TDD against the plan. |
| `review.md` | Reviewer | Copy `plans/templates/review.md`, run its passes. |

## Graduation rule

`plans/` is ephemeral working state. When something proves durable —
a convention, reference material, a long-lived decision — move it to
`docs/` as part of the change that proved it. `docs/` never holds
in-flight work; `plans/` never becomes the long-term home of reference
material.
