---
name: init-project
description: Use when the user asks to onboard, initialize, or set up a project for AI-native development - explores the whole codebase first, generates a repository-specific root AGENTS.md when missing, and creates the AI-native starter structure. Never modifies an existing AGENTS.md.
---

# Init Project

Explicit onboarding for an existing or new repository. The request itself
is consent. Work in phases; never write before Phase 2.

## Phase 0 — Gates (read-only)

1. If `<repo-root>/AGENTS.md` exists: mark the AGENTS phase **SKIP**. Do not
   read it as input, modify it, or overwrite it. Report it as unchanged.
2. If `.agents/` OR `ARCHITECTURE.md` exists: enter **gap-fill mode** —
   create only missing pieces, never duplicate or restructure existing ones.

## Phase 1 — Whole-codebase research (read-only)

Use four parallel read-only research agents when delegation is available;
otherwise run the same four passes inline. Each agent inspects only its
area, cites exact paths and commands, and writes nothing.

| # | Area | Find |
| --- | --- | --- |
| 1 | Core source | Purpose, architecture, modules, data flow, recurring patterns |
| 2 | Tests | Frameworks, commands, naming conventions, fixtures, expectations |
| 3 | Configs & build | Package/runtime manager, build/lint/format/run commands, constraints |
| 4 | Scripts, docs & git | Local helpers, contributor docs, entry points, commit/PR conventions |

Rules:
- Resolve contradictions using current source/config evidence.
- Never invent commands. If something is absent, note it as absent.

## Phase 2 — Generate (missing pieces only)

### `AGENTS.md` — only if Phase 0 did not mark SKIP

- Title: `# Repository Guidelines`.
- 200–400 words where practical; repository-specific, concise.
- Preserve applicable headings; omit only ones that genuinely do not apply:
  Project Overview · Architecture & Data Flow · Key Directories ·
  Development Commands · Code Conventions & Common Patterns ·
  Important Files · Runtime/Tooling Preferences · Testing & QA ·
  Commit & Pull Request Guidelines.
- State `Not configured` only where useful; never substitute assumptions.

### `ARCHITECTURE.md`

Thin "what the system is" derived from the same findings: layout model
table, pointers into docs — never restates content.

### Starter structure

```text
.agents/skills/.gitkeep
.agents/policies/.gitkeep
.agents/hooks/.gitkeep
.agents/templates/intent.md    # copy from ../using-text2prod/templates/
.agents/templates/review.md    # copy from ../using-text2prod/templates/
docs/features/.gitkeep
```

If the plugin templates are unreachable, draft minimal equivalents inline.

## Phase 3 — Report

Present a table: **created / skipped / pre-existing** for every target path.
Recommend committing the structure as its own commit before feature work.

## Hard rules

- Never modify an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- Never create `src/` or `tests/`.
- Never re-run research after Phase 1 within the same invocation.
- Empty/new repository: generate honest stubs; say what is `Not configured`.

## Failure handling

- No delegation available → inline four passes.
- Template copy fails → inline draft, note the fallback in the report.
- Write failure → report exactly what failed; do not silently retry.
