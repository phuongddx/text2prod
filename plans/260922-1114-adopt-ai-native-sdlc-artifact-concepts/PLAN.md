# Adopt AI-Native SDLC Artifact Concepts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the missing AI-native SDLC concepts (thin architecture doc, `intent.md`/`review.md` templates, feature-workflow doc) without moving any existing file or touching manifests/skills.

**Architecture:** Purely additive markdown. Root gets one thin pointer doc (`ARCHITECTURE.md`); `plans/templates/` gets two artifact templates; `docs/feature-workflow.md` documents the artifact chain and graduation rule; `CONTRIBUTING.md` gains one pointer line. Existing skill-owned formats (`writing-plans` → `plan.md`, `brainstorming` → spec) are never duplicated.

**Tech Stack:** Markdown only. No code, no dependencies, no manifest changes.

**Spec:** `plans/260922-1114-adopt-ai-native-sdlc-artifact-concepts/SPEC.md`

## Global Constraints

- Zero file moves; every change is additive except one line in `CONTRIBUTING.md`.
- Do NOT edit: `AGENTS.md`, `skills/**`, `hooks/**`, any `.*-plugin/**`, `gemini-extension.json`.
- All new markdown lives in `plans/` or `docs/` (plus root `ARCHITECTURE.md` per approved spec).
- No commits or pushes without explicit user authorization — present the final diff first.
- DRY: no template for `plan.md` or `spec.md` (owned by `writing-plans` / `brainstorming` skills).
- Keep `ARCHITECTURE.md` under one page; pointers only, never restates `docs/` content.

---

### Task 1: Root architecture pointer document

**Files:**
- Create: `ARCHITECTURE.md`

**Interfaces:**
- Produces: stable relative links to `docs/feature-workflow.md` (Task 4), `docs/testing.md`, `docs/porting-to-a-new-harness.md`, `CONTRIBUTING.md` — Task 4 must create its file with exactly the name referenced here.

- [ ] **Step 1: Create `ARCHITECTURE.md` with this exact content**

```markdown
# Text2Prod Architecture

Text2Prod is a **zero-dependency, multi-harness plugin**: it distributes
general-purpose skills and session-start hooks to coding agents across
IDEs and CLIs.

## Layout model

| Location | Role |
| --- | --- |
| `skills/` | The product. General-purpose skills (`brainstorming`, `writing-plans`, `test-driven-development`, …). |
| `hooks/` | The product. Session-start wiring that loads the bootstrap per harness. |
| `.*-plugin/`, `gemini-extension.json` | Adapters. Per-harness packaging that points back at `skills/` and `hooks/`. |
| `skills/using-text2prod/` | Bootstrap skill — loaded at session start; makes the other skills trigger at the right moments. |
| `CONTRIBUTING.md` | How to contribute: ground rules, workflow, PR requirements. |
| `docs/` | Durable reference: [testing](docs/testing.md), [porting to a new harness](docs/porting-to-a-new-harness.md), [feature workflow](docs/feature-workflow.md). |
| `plans/` | Ephemeral working artifacts for a change (intent/spec/plan/review chain). |
| `tests/` | Plugin-infrastructure tests. |

## Rules

- Skills and hooks at the repo root **are** the product; adapters never
  contain logic, only wiring.
- This file and `AGENTS.md` point at knowledge; they never restate it.
- Anything durable belongs in `docs/`; anything in-flight belongs in
  `plans/<date>-<issue>-<slug>/`.
```

- [ ] **Step 2: Verify links resolve**

Run: `ls docs/feature-workflow.md docs/testing.md docs/porting-to-a-new-harness.md CONTRIBUTING.md`
Expected: Task 4 not yet run, so `docs/feature-workflow.md` will be missing at this point — note it and re-verify in Task 6. The other three must exist now.

---

### Task 2: `intent.md` template

**Files:**
- Create: `plans/templates/intent.md`

**Interfaces:**
- Produces: the canonical `intent.md` shape referenced by `docs/feature-workflow.md` (Task 4). Copied into a plan dir and filled before design starts.

- [ ] **Step 1: Create `plans/templates/intent.md` with this exact content**

```markdown
# Intent: <one-line summary>

Author: <name>
Status: draft <!-- draft | accepted | rejected -->
Date: YYYY-MM-DD

## Problem

What cannot be done today, who is affected, and what it costs them.

## Proposed outcome

What "better" looks like once this ships. One paragraph, no design.

## Affected users and systems

- Users:
- Systems / repos:

## Constraints

Hard limits: policy, security, performance, compatibility, scope.

## Open questions

Questions that must be answered before or during design.
```

- [ ] **Step 2: Usability check**

Run: `sed -n '1,8p' plans/templates/intent.md`
Expected: header block renders with Author/Status/Date; no TBD/TODO placeholders.

---

### Task 3: `review.md` template

**Files:**
- Create: `plans/templates/review.md`

**Interfaces:**
- Produces: the canonical `review.md` shape referenced by `docs/feature-workflow.md` (Task 4). Scoped to one change's plan dir — never repo-wide review policy.

- [ ] **Step 1: Create `plans/templates/review.md` with this exact content**

```markdown
# Review: <change slug>

Reviewer: <name>
Date: YYYY-MM-DD
Plan under review: `plan.md` in this directory

## Passes

Run each pass and tag every finding with its pass:

- **Bugs** — logic errors, broken edge cases, subtle regressions.
- **Security** — injection risks, auth gaps, secrets/PII exposure.
- **Compliance** — the diff matches this plan's `plan.md` and repo conventions.

## Severity rule

**Important** = would break behavior, leak data, or breach policy.
Style and naming are nits.

## Nit cap

Report at most 5 nits; summarize the rest as a count.

## Do not report

- Generated files.
- Anything CI already enforces.

## Findings

| # | Severity | Pass | Location | Note |
| --- | --- | --- | --- | --- |
| 1 | | | | |

## Verdict

<!-- approve | request changes --> Reasoning in one or two sentences.
```

- [ ] **Step 2: Usability check**

Run: `grep -c 'TBD\|TODO' plans/templates/review.md`
Expected: `0`

---

### Task 4: Feature-workflow doc

**Files:**
- Create: `docs/feature-workflow.md`

**Interfaces:**
- Consumes: file names produced by Tasks 1–3 (`ARCHITECTURE.md`, `plans/templates/intent.md`, `plans/templates/review.md`).
- Produces: the chain + graduation rule linked from `ARCHITECTURE.md` (Task 1) and `CONTRIBUTING.md` (Task 5).

- [ ] **Step 1: Create `docs/feature-workflow.md` with this exact content**

```markdown
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
```

- [ ] **Step 2: Verify referenced paths exist**

Run: `ls ARCHITECTURE.md plans/templates/intent.md plans/templates/review.md`
Expected: all three listed (Tasks 1–3 complete).

---

### Task 5: CONTRIBUTING pointer

**Files:**
- Modify: `CONTRIBUTING.md` (one added line after the Workflow numbered list, before `## Licensing`)

**Interfaces:**
- Consumes: `docs/feature-workflow.md` from Task 4.

- [ ] **Step 1: Add this exact line**

Insert immediately after the line `4. Disclose if AI tooling helped produce the change, and which environment.` and before the blank line preceding `## Licensing`:

```markdown

For feature-sized changes, follow the artifact chain in [`docs/feature-workflow.md`](docs/feature-workflow.md).
```

- [ ] **Step 2: Verify the diff is exactly one added line**

Run: `git diff --stat CONTRIBUTING.md && git diff CONTRIBUTING.md`
Expected: `1 insertion(+)`; no other lines touched.

---

### Task 6: Final verification and diff gate

**Files:**
- Read-only verification across all deliverables.

**Interfaces:**
- Consumes: all files from Tasks 1–5.

- [ ] **Step 1: Scope check — nothing outside the approved set changed**

Run: `git status --porcelain`
Expected exactly:

```text
 M CONTRIBUTING.md
?? ARCHITECTURE.md
?? docs/feature-workflow.md
?? plans/260922-1114-adopt-ai-native-sdlc-artifact-concepts/
?? plans/templates/
```

- [ ] **Step 2: Link check**

Run: `ls ARCHITECTURE.md CONTRIBUTING.md docs/feature-workflow.md docs/testing.md docs/porting-to-a-new-harness.md plans/templates/intent.md plans/templates/review.md`
Expected: all exist, no error.

- [ ] **Step 3: Placeholder scan**

Run: `grep -rn 'TBD\|TODO\|implement later\|fill in details' ARCHITECTURE.md docs/feature-workflow.md plans/templates/ || true`
Expected: no output.

- [ ] **Step 4: Present the full diff to the user**

Run: `git diff && git status --porcelain`
Show output. Ask for explicit authorization before any commit. Do not commit or push otherwise.

## Self-Review (completed)

- Spec coverage: all 5 deliverables → Tasks 1–5; validation section → Task 6. ✔
- Placeholder scan: none. ✔
- Name consistency: `docs/feature-workflow.md`, `plans/templates/intent.md`, `plans/templates/review.md` identical across tasks. ✔
