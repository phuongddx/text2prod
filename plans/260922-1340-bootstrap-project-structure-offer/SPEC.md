# SPEC: Bootstrap project-structure offer in `using-text2prod`

Date: 2026-09-22
Status: Implemented — shipped per user decision WITHOUT behavioral evals (fork-only; unit tests green)

## Problem

Text2Prod teaches the artifact workflow (brainstorm → plan → implement →
review) but creates no home for it in a host project. When the plugin is
installed in an arbitrary repo, feature artifacts have no agreed location and
the AAVN layout (knowledge / policy / procedure / enforcement homes) is never
materialized.

## Goal

When the human starts feature work in a project that lacks the structure,
the agent offers (once, consent-gated, never blocking) to generate the
minimal starter structure. On accept, it creates the missing pieces and
continues the task normally.

## Decisions (approved)

1. **Mechanism: extend `using-text2prod`** (not a new skill, not a hook
   mutation, not a standalone script).
2. **Trigger: feature-work start only.** Quick questions, read-only tasks,
   and debug sessions get no offer. The offer never blocks or delays the
   task; `brainstorming` starts regardless of the answer.
3. **Scope: minimal starter + growth rule** (matches the slide's own advice).

## Architecture

Token-cheap layering so the always-on hook payload grows minimally:

| Layer | File | Loaded |
| --- | --- | --- |
| Trigger | `skills/using-text2prod/SKILL.md` — short "Project structure" section pointing at the reference | every session (~3 lines) |
| Rules | `skills/using-text2prod/references/project-structure.md` | on invoke only |
| Templates | `skills/using-text2prod/templates/intent.md`, `review.md` | on accept only |

This mirrors the skill's existing `references/` pattern (e.g.
`references/codex-tools.md`). No hook, manifest, or packaging changes.

## Behavior contract

```text
Feature work requested
  → marker check: does `.agents/` OR `ARCHITECTURE.md` exist?
      yes → proceed to brainstorming normally
      no  → offer ONCE: "Set up the AI-native structure? (creates ~7 files)"
           accept  → generate missing pieces → proceed
           decline → proceed, never re-offer for this task
```

### Generated set (missing pieces only)

```text
ARCHITECTURE.md                # thin, agent-drafted from reading the repo
.agents/
  skills/                      # empty dir + .gitkeep
  policies/                    # empty dir + .gitkeep
  hooks/                       # empty dir + .gitkeep
  templates/intent.md          # copied from plugin templates
  templates/review.md          # copied from plugin templates
docs/features/.gitkeep         # feature artifact home
```

- Growth rule (stated in the reference): `workflows/`, `agents/`,
  `adapters/` are added only when a second team or harness needs them.
- `src/` and `tests/` are never created — the host project owns those.

### Never-touch rules

- Never modify an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- If a root instructions file exists, the agent may offer — as a separate
  explicit yes/no — a one-line pointer append. "No" is final.
- Never re-offer within the same task after a decline.

## Error handling

- Templates dir missing (older package): agent drafts minimal equivalents
  inline; the task continues.
- Partial structure present: create only the missing pieces; never duplicate.
- Write failure (permissions, read-only FS): report the failure and continue
  the actual task.

## Testing

Skill content changes require eval evidence (repo policy). Minimum:

1. **Unit** — `tests/hooks/test-session-start.sh`: hook still emits valid
   JSON with the new section; payload size stays within existing sane bound.
2. **Behavioral evals (before/after, multi-session)**:
   - Acceptance test ("Let's make a react todo list") still auto-triggers
     `brainstorming` in a clean session.
   - Offer fires exactly once at feature start in a bare repo.
   - No offer for quick questions / read-only tasks.
   - Decline respected; task proceeds; no second offer same task.
   - Existing root instruction files untouched.
   - Partial structure filled, not duplicated.
3. Eval harness: `evals/` (text2prod-evals). If not cloned locally, clone
   per `evals/README.md` before running.

## Non-goals

- No changes to `hooks/session-start`, manifests, or packaging.
- No new standalone skill.
- No `.agents/` taxonomy inside text2prod itself.
- No auto-generation without explicit consent.
- No `workflows/`, `agents/`, `adapters/` on first accept.

## Validation summary

- All changed/created files: 1 modified SKILL.md section, 1 reference,
  2 templates, extended hook test, eval evidence artifacts.
- `git status` contains nothing outside that set plus the plan dir.

## Risks

- Bootstrap is tuned content; even a small section could shift behavior in
  unrelated sessions — mitigated by trigger-scoped wording and eval case 1
  (acceptance test unchanged).
- Offer could annoy users in repos that deliberately reject the layout —
  mitigated by once-per-task and never-blocking rules.
