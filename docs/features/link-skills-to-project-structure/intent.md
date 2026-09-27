# Intent: Link Text2Prod skills to the AI-native project structure

Author: PhuongDoan
Status: accepted <!-- draft | accepted | rejected -->
Date: 2026-09-27

## Problem

`init-project` creates an AI-native structure (`AGENTS.md`, `ARCHITECTURE.md`,
`.agents/`, `docs/features/`), but no other skill reads or writes it. Artifact
paths are split three ways (`docs/text2prod/specs|plans/`, `plans/<date>-<slug>/`,
`docs/features/`), `review.md` is never produced, and `brainstorming` designs
without consulting project standards or external research.

## Proposed outcome

Every skill in the chain agrees on one home per feature,
`docs/features/<slug>/{intent,spec,plan,review}.md`, following the AI-native
SDLC playbook. `brainstorming` reads the project structure and, when the user
agrees, researches externally before designing. After implementation the
feature folder is closed out and durable knowledge is promoted to
`docs/engineering/` or `ARCHITECTURE.md` with the user's approval.

## Affected users and systems

- Users: anyone running Text2Prod in Claude Code or Codex.
- Systems / repos: `skills/` (brainstorming, writing-plans, executing-plans,
  subagent-driven-development, requesting-code-review,
  finishing-a-development-branch, init-project, using-text2prod), `docs/`,
  `ARCHITECTURE.md`, `tests/init-project/`.

## Constraints

- Zero dependencies; no bundled search tool; never request API keys in chat.
- Never modify `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- Repos without `docs/features/` keep today's behavior.
- Skill edits need eval evidence and the `writing-skills` process.

## Open questions

None — resolved during brainstorming (see `spec.md`).

Reference: https://claude.com/blog/the-ai-native-sdlc-playbook
