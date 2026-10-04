# Spec: Spec-only feature artifacts

Status: approved <!-- draft | approved | shipped | superseded -->
Date: 2026-10-04
Related: [link-skills-to-project-structure](../link-skills-to-project-structure/spec.md)

## Problem

In feature mode every architectural change produces two design files,
`intent.md` and `spec.md`. They overlap: in the only shipped feature,
`intent.md`'s Problem and Constraints restate the spec's Context read and
Non-goals. Two files cost two reviews, two templates to maintain, and a
feature folder created before any design exists (`brainstorming` writes
`intent.md` early, so abandoned brainstorms leave folders behind).

Affected users: anyone running Text2Prod in Claude Code or Codex on a repo
with `docs/features/`. Affected systems: `skills/using-text2prod`,
`skills/brainstorming`, `skills/init-project`, `.agents/templates/`,
`README.md`, `docs/feature-workflow.md`, `ARCHITECTURE.md`,
`tests/feature-artifacts/`, `plugin-evals/`.

## Context read

- `CLAUDE.md`, `ARCHITECTURE.md`, `docs/feature-workflow.md`
- `skills/using-text2prod/references/feature-artifacts.md`, `references/project-structure.md`, `templates/{intent,spec}.md`
- `.agents/templates/{intent,spec}.md` (identical to the skill copies)
- `skills/brainstorming/SKILL.md` (lines 91, 230, Documentation, Spec Self-Review)
- `skills/init-project/SKILL.md` (line 72)
- `tests/feature-artifacts/test-{brainstorming,contract,structure}.sh`
- `plugin-evals/brainstorm-before-building/` (eval format)
- `docs/features/link-skills-to-project-structure/{intent,spec}.md`
- Commits `08ed01d` (v0.0.2, introduced `docs/features/`), `4a89337`

Gaps:
- `CLAUDE.md` and `AGENTS.md` describe the chain as `intent.md → spec.md → …`. Out of scope (never edited by this change); listed in the PR for a manual fix.
- Unknown whether `claude plugin eval` can start from a fixture repo containing `docs/features/`. Resolved during planning.

## References

- Anthropic, *The AI-native SDLC playbook* — https://claude.com/blog/the-ai-native-sdlc-playbook — defines `intent.md` (why) and `spec.md` (what) as separate stages. Informed the README note that Text2Prod deliberately folds intent into the spec.
- GitHub Spec Kit — https://github.com/github/spec-kit, spec template https://raw.githubusercontent.com/github/spec-kit/main/templates/spec-template.md — has no intent document; the why lives in `spec.md` (prioritized user stories, success criteria). Evidence a single spec file works.
- Böckeler, *Understanding SDD: Kiro, spec-kit, and Tessl* — https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html — and Eberhardt, Scott Logic — https://blog.scottlogic.com/2025/11/26/putting-spec-kit-through-its-paces-radical-idea-or-reinvented-waterfall.html — Spec Kit's markdown volume makes review slow. Informed keeping the change to two new sections (no FR/SC numbering, no extra files).

## Goals

1. `spec.md` is the only design artifact in feature mode: the chain is `spec.md → plan.md → implementation → review.md`.
2. The why survives the merge: the understanding note your human partner corrects becomes the spec's **Problem** and **Constraints** (outcome goes to **Goals**).
3. No feature folder is created before the spec is written.
4. Legacy mode is unchanged.

## Non-goals

- An optional or compatibility `intent.md` path (read-only or template-driven). Rejected: two code paths for a file nobody needs.
- A deprecation release that stops writing but still reads `intent.md`. Pre-1.0, one shipped feature; no consumers to protect.
- Migrating or deleting `docs/features/link-skills-to-project-structure/intent.md` or anything under `plans/` and `docs/text2prod/`. History stays.
- Editing `CLAUDE.md`, `AGENTS.md`, or `GEMINI.md`.
- Follow-up ideas from Spec Kit, each its own feature with its own evals:
  - `[NEEDS CLARIFICATION: …]` markers that block spec approval.
  - Numbered requirements and success criteria (FR-### / SC-###) traced by `writing-plans` and code review.

## Constraints

- Zero dependencies.
- Skill content edits follow `skills/writing-skills` and need eval evidence (red against v0.0.2, green after).
- The two `spec.md` template copies stay byte-identical.
- No change to `brainstorming`'s trigger description, its three paths, or its approval gates.

## Design

### 1. Artifact contract and templates

`skills/using-text2prod/references/feature-artifacts.md`:

| Part | Change |
| --- | --- |
| Legacy-mode bullet | "No `review.md` files are written." |
| Feature-mode layout | Remove the `intent.md` line. |
| Template resolution | "For `spec.md` and `review.md`, use the first that exists:" |
| Research read order, step 5 | "`docs/features/<slug>/spec.md`, in full, if a matching feature exists" |
| Changing an existing feature, architectural row | "Edit `spec.md`, `plan.md`, `review.md` in place." |

Spec template (`skills/using-text2prod/templates/spec.md` and `.agents/templates/spec.md`): remove the `Intent:` line; add `## Problem` first and `## Constraints` after `## Non-goals`:

```markdown
## Problem

What cannot be done today, who is affected (users, systems / repos), and
what it costs them. No design here.
```

```markdown
## Constraints

Hard limits: policy, security, performance, compatibility, scope.
```

Delete `skills/using-text2prod/templates/intent.md` and `.agents/templates/intent.md`. Remove the `intent.md` copy line from `skills/using-text2prod/references/project-structure.md` and `skills/init-project/SKILL.md`.

### 2. Brainstorming behavior

`skills/brainstorming/SKILL.md`:

| Location | Change |
| --- | --- |
| Three Paths, upgrade sentence | Drop "write `intent.md` in feature mode,". |
| Exploring project context, intent paragraph | Replace with: "Bounded and spike work never creates a new feature folder." |
| After the Design → Documentation, feature-mode bullet | Fill **Problem** and **Constraints** from the agreed understanding note, plus **Context read** and **References**. If the resolved template has no **Problem** or **Constraints** section, add them. |
| Spec Self-Review, Context check | Add: **Problem** and **Constraints** match the understanding note your human partner corrected. |

"Write back your understanding" stays in chat, as it already is in legacy mode. "After intent is agreed" (External research) keeps its wording: it means the agreed purpose, not the file.

### 3. Docs

- `README.md`: chain becomes `spec.md → plan.md → implementation → review.md → deploy`, loop arrow returns to `spec.md`; Plan row reads "produces the design (`spec.md`)"; Maintain row reads "written back as a new or updated `spec.md`"; add one sentence: "Text2Prod folds the playbook's separate intent document into the `## Problem` section of `spec.md`."
- `docs/feature-workflow.md`: update the chain; remove the `intent.md` owner row.
- `ARCHITECTURE.md`: chain becomes `spec.md → plan.md → review.md`.

### 4. Release

Version `0.0.3` via `scripts/bump-version.sh`.

## Error handling

- **Repo has a team-customized `.agents/templates/spec.md` without Problem/Constraints.** Template resolution picks it first. `brainstorming` adds the two sections (Design §2) so the understanding note is not lost.
- **Repo still has `.agents/templates/intent.md` or old `intent.md` files.** Nothing reads them; nothing deletes them. Harmless.
- **Existing spec with an `Intent:` line.** Left as is; specs are edited in place only when their feature changes.
- **Legacy-mode repo.** No behavior change: it never wrote `intent.md`.

## Testing

Red first, per `writing-skills`: new checks and evals fail on v0.0.2 and pass after.

Static wiring (`tests/feature-artifacts/`):
- `test-brainstorming.sh`: replace the three intent checks with `check_absent 'intent.md'`, a check for the Problem/Constraints fill sentence, and a check for "Bounded and spike work never creates a new feature folder."
- `test-contract.sh`: template has `## Problem` and `## Constraints`; `check_absent 'Intent:'` on the template; `check_absent 'intent.md'` on the contract.
- `test-structure.sh`: `check_absent '.agents/templates/intent.md'` in `init-project` and `project-structure.md`.
- New guard: no file under `skills/` mentions `intent.md`; the two `spec.md` template copies are identical.

Behavior evals (`plugin-evals/`):
1. `spec-only-feature-mode` — architectural request in a feature-mode repo with purpose and constraints supplied. Graders: no write to any `intent.md`; the understanding note is posted in chat. Expected red on v0.0.2.
2. `spec-has-problem-section` — an approved design supplied; asks for the spec. Graders: write to `docs/features/<slug>/spec.md` containing `## Problem` and `## Constraints`; no `intent.md` written.
3. Regression: re-run `brainstorm-before-building` and `plan-from-spec`.

Before the PR: `tests/feature-artifacts/run-all.sh`, `scripts/lint-shell.sh`, `scripts/bump-version.sh --audit`; eval results committed under `plugin-evals/results/` with the before/after comparison in the PR.
