# Project structure

When the human starts **feature work** (build/change something) in a repo
that lacks the AI-native structure, offer — once — to create the starter
set. Never offer for questions, read-only tasks, or debugging.

## Marker check

The structure exists if `.agents/` OR `ARCHITECTURE.md` is present at the
repo root. If either exists, proceed normally — no offer.

## The offer

One sentence, then continue:

> Want me to set up the AI-native project structure first? Creates ~7
> files (`ARCHITECTURE.md`, `.agents/` starter, `docs/features/`). Say no
> and I'll skip it.

- Ask **once per task**. A decline is final for that task.
- **Never block**: start `brainstorming` regardless of the answer.

## On accept — create missing pieces only

```text
ARCHITECTURE.md                # thin: what the system is; pointers, never prose
.agents/skills/.gitkeep
.agents/policies/.gitkeep
.agents/hooks/.gitkeep
.agents/templates/intent.md    # copy from this skill's templates/
.agents/templates/review.md    # copy from this skill's templates/
docs/features/.gitkeep
```

- Draft `ARCHITECTURE.md` by reading the repo; keep it under one page.
- Never create `src/` or `tests/` — the host project owns those.
- If a piece already exists, leave it untouched and fill only the gaps.

## Growth rule

`workflows/`, `agents/`, and `adapters/` are NOT created now. Add them
only when a second team or harness actually needs them.

## Never-touch rules

- Never modify an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- If one exists, you may offer — as a separate yes/no — a one-line pointer
  append. "No" is final.

## Failure handling

- `templates/` missing in this package: draft minimal equivalents inline.
- Write failure (permissions, read-only FS): report it and continue the
  actual task.
