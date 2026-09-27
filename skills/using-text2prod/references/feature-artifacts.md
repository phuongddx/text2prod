# Feature artifacts

Where a feature's artifacts live and how skills find them. Skills point
here instead of hard-coding paths.

## Mode detection

- **Feature mode:** `docs/features/` exists at the repo root.
- **Legacy mode:** otherwise. Artifact locations and the files written are unchanged from before this contract:
  - Legacy specs: `docs/text2prod/specs/YYYY-MM-DD-<topic>-design.md`
  - Legacy plans: `docs/text2prod/plans/YYYY-MM-DD-<feature-name>.md`
  - No `intent.md` or `review.md` files are written.

User preferences for artifact location override both modes.

## Feature-mode layout

```text
docs/features/<slug>/
├── intent.md   originator; brainstorming drafts it when absent
├── spec.md     brainstorming
├── plan.md     writing-plans
└── review.md   finishing-a-development-branch
```

- `<slug>`: kebab-case, 2–5 words, naming the feature (not the change).
- If `docs/features/<slug>/` already exists, ask: "Is this the same
  feature, or a new one?" A new one gets a `-2` suffix.
- A feature's artifacts live only in its folder — never in `plans/` or the legacy `docs/text2prod/` tree.

## Template resolution

For `intent.md`, `spec.md`, and `review.md`, use the first that exists:

1. `.agents/templates/<name>.md` in the repo (team customization)
2. `templates/<name>.md` in this skill (`using-text2prod`)
3. The owning skill's built-in format

`plan.md` has no template: `writing-plans` defines its format.

## Research read order

`brainstorming` reads, in order, whatever exists:

1. `AGENTS.md` / `CLAUDE.md`
2. `ARCHITECTURE.md`
3. `docs/engineering/*.md`
4. `.agents/policies/*`
5. `docs/features/<slug>/intent.md`, if a matching feature exists
6. Sibling `docs/features/*/spec.md` — title and `Status:` line only

A missing file is a **gap**: note it, never block on it, never create it
from here.

## Artifacts are code

- Edit artifacts in place when a feature changes. Git is the history:
  `git log -- docs/features/<slug>/`. No changelog inside the files.
- Commit artifact edits together with the code they describe.
- Concurrent changes to one feature use separate branches or worktrees;
  conflicts resolve at merge, like code.
- `spec.md` carries `Status: draft | approved | shipped | superseded`.
  A superseded spec names its successor and is never deleted.

## Changing an existing feature

| Change | Effect on the feature folder |
| --- | --- |
| Bounded fix | No new artifacts. If documented behavior changes, edit those `spec.md` lines. |
| Architectural change | Edit `intent.md`, `spec.md`, `plan.md`, `review.md` in place. |
| Outgrows the feature | New `docs/features/<new-slug>/`; both specs get a `Related:` line. |

## Promotion rule

When a feature finishes, knowledge that outlives it — a convention, a
tech-stack choice, an infrastructure fact — is proposed as a diff to
`docs/engineering/*.md` or `ARCHITECTURE.md`. Apply it only on your human
partner's explicit yes; a decline is recorded in `review.md`.
Never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
