# SPEC: `init-project` skill — explicit project onboarding

Date: 2026-09-22
Status: Approved design — pending spec review

## Problem

The shipped structure offer is passive: it fires only when feature work
starts in a repo lacking the layout. There is no explicit way to say
"onboard/init this project now" and get the full first-time treatment —
including a researched root `AGENTS.md`.

## Goal

A dedicated `init-project` skill: on explicit request, explore the whole
codebase first, then generate a repository-specific `AGENTS.md` (when
missing) plus the minimal AI-native starter structure.

## Decisions (approved)

1. **Minimal scope** — no wizard, no policy seeding; the explicit request is
   consent.
2. **Dedicated skill** named `init-project` (not a bootstrap edit).
3. **Research first** — embeds the `generate-agents-md` procedure: 4-pass
   parallel read-only exploration before any writes.
4. **Safety gate preserved** — an existing `AGENTS.md` is never read as
   input, modified, or overwritten; that phase reports "unchanged, skipped".

## Architecture

| Piece | Path | Notes |
| --- | --- | --- |
| New skill | `skills/init-project/SKILL.md` | Self-contained (zero-dependency, cross-harness) |
| Reused templates | `skills/using-text2prod/templates/{intent,review}.md` | Referenced plugin-relative (`../using-text2prod/templates/`); inline-draft fallback if absent |
| Untouched | bootstrap, hook, manifests, passive offer | Purely additive skill; auto-discovered by packaging |

## Flow

```text
explicit "init/onboard this project" → init-project fires

Phase 0 — gates (no writes)
  • AGENTS.md exists?         → AGENTS phase = SKIP (report unchanged)
  • .agents/ OR ARCHITECTURE.md exists? → gap-fill mode (create missing only)

Phase 1 — whole-codebase research (read-only)
  • 4 parallel subagents when delegation is available, else inline:
    1. Core source — purpose, architecture, modules, data flow, patterns
    2. Tests — frameworks, commands, naming, fixtures, expectations
    3. Configs/build — package/runtime manager, build/lint/run, constraints
    4. Scripts/docs/git — helpers, contributor docs, commits, PR templates
  • Each cites exact paths/commands; findings only, no writes.
  • Resolve contradictions from current source/config evidence.

Phase 2 — generate (missing pieces only)
  • AGENTS.md — title "# Repository Guidelines"; 200–400 words where
    practical; repository-specific; preserve applicable headings
    (Project Overview; Architecture & Data Flow; Key Directories;
    Development Commands; Code Conventions & Common Patterns; Important
    Files; Runtime/Tooling Preferences; Testing & QA; Commit & Pull Request
    Guidelines); "Not configured" where true; never invent commands.
  • ARCHITECTURE.md — thin "what the system is", pointers only.
  • .agents/{skills,policies,hooks}/.gitkeep
  • .agents/templates/{intent,review}.md — copied from plugin templates
  • docs/features/.gitkeep

Phase 3 — report
  • Table: created / skipped / pre-existing, plus recommendation to commit
    the structure as its own commit before feature work.
```

## Rules

- Never modify existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- Never create `src/` or `tests/`.
- Never re-run research after Phase 1 within the same invocation.
- Empty/new repo: generate honest stubs; state "Not configured" where true.

## Error handling

- No subagent delegation → run the 4 passes inline.
- Plugin templates unreachable → draft minimal equivalents inline.
- Write failure → report exactly what failed; do not partially retry silently.

## Testing

1. **Unit** — extend the skills-inventory/packaging test to require
   `init-project` (no manifest edits needed; skills auto-discovered).
2. **Behavioral evals (repo bar for new skills)**:
   - Explicit "init this project" in a bare repo → full structure + AGENTS.md.
   - Existing `AGENTS.md` → untouched, phase skipped, rest generated.
   - Existing partial structure → gaps filled, nothing duplicated.
   - Research quality → commands/paths verifiable, none invented.
   - No fire on unrelated requests (description precision).
3. Fork ship without evals requires the same explicit owner waiver as the
   previous skill change.

## Non-goals

- No bootstrap, hook, or manifest changes.
- No interactive wizard; no policy seeding; no `workflows/`/`agents/`/
  `adapters/` on init.
- Passive feature-start offer remains the only automatic path.

## Validation summary

- New files: `skills/init-project/SKILL.md`; test extension; plan dir.
- `git status` shows nothing else (plus pre-existing unrelated WIP).

## Risks

- Description too broad → fires on ordinary "set up" requests — mitigated by
  trigger wording limited to onboarding/init/structure generation.
- Cross-skill template reference breaks in an exotic harness — mitigated by
  inline-draft fallback.
- Research cost on huge repos — mitigated by scoped 4-pass design and
  read-only subagents.
