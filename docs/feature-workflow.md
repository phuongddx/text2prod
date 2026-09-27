# Feature Workflow

The artifact chain for a feature-sized change. Each stage commits an
artifact the next stage reads.

```text
intent.md → spec.md → plan.md → implementation → review.md → merge
```

## Where artifacts live

One folder per feature: `docs/features/<slug>/`. Mode detection,
layout, templates, the research read order, changing an existing
feature, and the promotion rule are defined in
[`skills/using-text2prod/references/feature-artifacts.md`](../skills/using-text2prod/references/feature-artifacts.md).

## Who owns each artifact

| Artifact | Owner |
| --- | --- |
| `intent.md` | Originator; `brainstorming` drafts it when absent |
| `spec.md` | `brainstorming` |
| `plan.md` | `writing-plans` |
| implementation | `executing-plans` / `subagent-driven-development` |
| `review.md` | `finishing-a-development-branch`, from the review findings |

## History

Older work lives in `plans/<date>-<slug>/` and `docs/text2prod/`. It stays
where it is; new work uses `docs/features/`.
