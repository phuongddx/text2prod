# SPEC: Adopt AI-native SDLC artifact concepts (concept-only)

Date: 2026-09-22
Status: Approved — implemented (final review passed)
Scope decision: Option C (concept adoption only). No file moves. No manifest changes. No skill edits.

## Problem

Text2Prod's workflow already implements most of the AI-native SDLC playbook
(brainstorm → plan → execute → TDD → verify → review), but three concepts have
no home in this repo:

1. No root architecture document explaining what the product *is* (skills and
   hooks at repo root are the product; per-harness plugin dirs are adapters).
2. No `intent.md` artifact capturing what was wanted and why, before design.
3. No `review.md` artifact recording review passes and severity rules for a
   change.

## Goals

- Add the missing playbook concepts without restructuring the repo.
- Keep every new file additive; nothing existing moves or is rewritten.
- Stay DRY with existing skills: `writing-plans` owns `plan.md` format;
  `brainstorming` owns the design/spec flow. No duplicate templates.
- Keep all new markdown inside `plans/` or `docs/` per repo rules.

## Non-goals

- No `.agents/` taxonomy, no `policies/`, `workflows/`, `agents/` dirs.
- No changes to `skills/`, `hooks/`, or any `.*-plugin/` manifest.
- No edits to `AGENTS.md` (untouched unless separately authorized).
- No retroactive backfill of `plans/260920-2312-port-superpowers-brainstorming/`.
- No commits/pushes without explicit user authorization.

## Decisions (approved)

1. **Concept adoption only** — the AAVN folder layout is not copied; only the
   artifact-chain idea is adopted.
2. **Working chain lives in `plans/`** — each
   `plans/<date>-<issue>-<slug>/` directory may contain `intent.md`, `spec.md`
   (when produced by `brainstorming`), `plan.md` (produced via
   `writing-plans`), and `review.md`.
3. **Graduation rule** — anything that proves durable (conventions, reference
   material, long-lived decisions) moves to `docs/`; `plans/` stays ephemeral
   working state.

## Deliverables

### 1. `ARCHITECTURE.md` (root, < 1 page)

Thin pointer document, never restates content:

- What Text2Prod is: a zero-dependency, multi-harness skill/hook plugin.
- Layout model: `skills/` and `hooks/` at root are the product;
  `.*-plugin/` dirs + `gemini-extension.json` are per-harness adapters;
  `using-text2prod` is the bootstrap skill.
- Where knowledge lives: pointers to `docs/`, `CONTRIBUTING.md`,
  `docs/feature-workflow.md`.

### 2. `plans/templates/intent.md`

Sections: Intent title; Author; Status (draft/accepted/rejected);
Problem; Proposed outcome; Affected users and systems; Constraints;
Open questions. One screen max. Filled by the originator before any
design work starts.

### 3. `plans/templates/review.md`

Sections: Review passes (Bugs / Security / Compliance-vs-plan);
What "Important" means here; Nit cap (max 5, rest summarized as count);
Do-not-report list; Findings table (severity, pass, location, note);
Verdict. Mirrors the playbook's REVIEW.md concept, scoped to one change.

### 4. `docs/feature-workflow.md` (short)

Documents the chain and the graduation rule:

```
intent.md → spec.md (brainstorming) → plan.md (writing-plans)
          → implementation (executing-plans / subagent-driven-development)
          → review.md → merge
```

- States which skill owns which artifact (no duplication).
- States the graduation rule: durable knowledge → `docs/`.

### 5. One pointer line in `CONTRIBUTING.md`

Single line linking to `docs/feature-workflow.md` under the existing
workflow/general guidance. No restructuring of that file.

## Validation

- All new markdown files render (no broken relative links).
- `plans/templates/*.md` are usable standalone: copy → fill → commit into a
  plan dir.
- `ARCHITECTURE.md` contains no content duplicated verbatim from `docs/`
  (pointers only).
- No tracked file outside the five deliverables changes
  (`git status` shows only the new files + one-line CONTRIBUTING edit).

## Risks

- Template drift vs. playbook evolution — mitigated by keeping templates
  minimal and skill-owned formats untouched.
- Review.md could be confused with PR review policy — mitigated by scoping it
  to a single change's plan dir, not repo-wide review rules.
