# Spec: pstack migration — principles, router, playbooks, delegate agents

Status: approved <!-- draft | approved | shipped | superseded -->
Date: 2026-10-25

## Problem

Text2Prod has one workflow: `spec.md → plan.md → implementation →
review.md`. Every request that is not a feature (a bug report, a perf
question, "how does X work", "get PR 123 green", "land this stack") is
routed by `using-text2prod` only as far as "invoke a skill if one
applies". There is no step list the agent copies and works through, no
named rule the agent cites when it makes a design or verification call,
and no delegate wrapper for Codex at all.

pstack (`github.com/cursor/plugins/tree/main/pstack`, v0.15.25, MIT,
Lauren Tan) solves exactly those three gaps for Cursor: a router skill
(`poteto-mode`) with 23 playbooks, 24 one-rule principle skills the
router indexes inline, and two delegate agents (`poteto-agent`,
`comment-sicko`). The human partner uses Codex and Claude Code, not
Cursor, so pstack's value is unreachable: its model routing names Grok
slugs, its config lives in a Cursor `.mdc` rule, its agents are Cursor
subagent types, and its scripts need Bun.

Who is affected: the human partner running Text2Prod on Codex and Claude
Code, the delegate agents those sessions dispatch, and anyone reading
the resulting diffs and replies.

Cost today: the partner keeps two plugins installed, gets competing
triggers for the same moment (pstack `tdd` next to Text2Prod
`test-driven-development`), and loses pstack's playbooks and principles
on Codex entirely.

## Context read

- `CLAUDE.md`, `ARCHITECTURE.md`: skills and hooks are the product,
  adapters carry no logic; skill content edits need eval evidence and go
  through `writing-skills`; zero runtime dependencies; one problem per
  PR. The uncommitted `ARCHITECTURE.md` row adds `agents/` as a
  Claude-only product directory.
- `docs/engineering/conventions.md`: frontmatter rules (`name` matches
  the directory, `description` starts "Use when…", under 500 chars);
  shell style; evals run on the unedited skill first and a change that
  already passes is dropped.
- `skills/using-text2prod/SKILL.md` and
  `references/feature-artifacts.md`, `references/codex-tools.md`: the
  bootstrap's current rule set; Codex multi-agent tools (`spawn_agent`,
  `wait_agent`, `agent_type` role files under `~/.codex/agents/`).
- `agents/zed.md`, `tests/agents/test-agent-static.sh` (uncommitted):
  an in-flight port of pstack's `poteto-agent`, renamed from `karen` to
  `zed`. Committed first on the migration branch (phase 0).
- `scripts/package-codex-plugin.sh:263-290` and
  `tests/codex/test-package-codex-plugin.sh:178-180`: Codex packaging
  dies for any skill directory with no `agents/openai.yaml` seed in the
  prior package, and the test asserts one metadata file per skill. The
  archive list (`.codex-plugin`, `assets`, `skills`, README, LICENSE,
  CODE_OF_CONDUCT) does not include `agents/`.
- `plugin-evals/*/` (10 scenarios): `prompt.md` with frontmatter
  (`description`, `tags`, `max_turns`, `allowed_tools`) plus
  `graders/*.md` of type `llm` or `tool_used`.
- `docs/features/delegate-brief-contract/spec.md` (shipped): already
  took pstack's delegate brief ideas into `subagent-driven-development`.
  This spec does not touch that skill.
- pstack sources read in full: `README.md`, `plugin.json`,
  `skills/poteto-mode/SKILL.md` and `playbooks/*.md`,
  `agents/poteto-agent.md`, `agents/comment-sicko.md`,
  `skills/principle-*/SKILL.md`, `docs/harness/claude-code.md`.

Gaps:
- `CLAUDE.md` says evals live in `evals/` (separate clone); they live in
  `plugin-evals/` in this repo. `.gitignore` carries both.
- `.agents/policies/` and `.agents/skills/` are empty.
- `skills-lock.json` is untracked and unrelated (mattpocock skills).

## References

- Codex subagents
  (https://learn.chatgpt.com/docs/agent-configuration/subagents.md) and
  the role loader
  (https://github.com/openai/codex/blob/main/codex-rs/agent-roles/src/loader.rs):
  custom agents are TOML files in `~/.codex/agents/` or `.codex/agents/`
  with `name`, `description`, `developer_instructions`; plugins cannot
  ship them. Decision: ship agent TOML sources in the plugin and install
  them into the consuming repo's `.codex/agents/` through a skill step
  (phase 4).
- Codex skills (https://learn.chatgpt.com/docs/build-skills.md) and
  parser
  (https://github.com/openai/codex/blob/main/codex-rs/skills/src/parser.rs):
  `name` ≤ 64 chars, non-empty `description`;
  `agents/openai.yaml` `policy.allow_implicit_invocation: false` is the
  `disable-model-invocation` equivalent. Decision: one `principles`
  skill with references instead of 24 hidden skills, so no per-skill
  policy file is needed.
- Codex `update_plan`
  (https://github.com/openai/codex/blob/main/codex-rs/core/src/config/mod.rs,
  `resolve_update_plan_enabled`): opt-in, off by default. Decision: the
  router opens its step list with `TodoWrite` or `update_plan` when
  present and otherwise keeps the list in the reply.
- Codex modes
  (https://github.com/openai/codex/blob/main/codex-rs/protocol/src/config_types.rs):
  only `Plan` and `Default`; no always-on skill mode. Decision: the
  router lives in `using-text2prod`, which the session-start hook
  already injects every session on both harnesses.
- pstack `docs/harness/claude-code.md`: Cursor→Claude name mapping
  (`Task`→`Agent`, `AskQuestion`→`AskUserQuestion`, non-Claude model
  slugs omitted). Decision: ported text uses Text2Prod's own tool
  vocabulary and never names a model slug.
- pstack license: MIT, Lauren Tan. Decision: attribution in `LICENSE`
  (third-party notice) and a one-line credit in each ported file.

## Goals

1. One plugin, one trigger per moment: pstack's principles, router,
   playbooks, and delegate agents are available in Text2Prod on Claude
   Code and Codex, and the `spec → plan → review` chain stays the feature
   playbook.
2. A named vocabulary of principles the router, the playbooks, and later
   skill edits cite by path.
3. A router that turns any request into a copied step list the partner
   can read and audit, with a documented skip.
4. Delegate agents (`zed`, `comment-sicko`) that work on both harnesses
   with the same brief.
5. Every phase lands as its own group of commits with eval evidence, so
   a phase can be dropped if the baseline already passes.

## Non-goals

- Merging pstack's overlapping skills (`tdd`, `prove-it-works`,
  `interrogate`, `opening-a-pr`, `authoring-a-skill`, `swarm`, `arena`)
  into the existing Text2Prod skills. Each is a later feature with its
  own spec; this spec names them in Design §6 only as follow-ups.
- Porting net-new pstack skills (`how`, `why`, `teach`, `architect`,
  `blast-radius`, `benchmark-checklist`, `unslop`, `no-comments`,
  `technical-writing`, `reflect`, `correct`, `recall`, `ketchup`,
  `sharpen`, `show-me-your-work`, `figure-it-out`, verification-skill
  create/maintain, `typescript-best-practices`). Playbook steps that
  name one of these point at the Text2Prod equivalent or carry
  `skip: skill not ported yet` until the skill lands.
- Cursor-only parts: `setup-pstack`, `make-bot-ui`, `benny`, model
  routing by slug, the `pstack-models.mdc` rule, `poteto-mode/scripts/`
  (Bun, `commander` dependency).
- Playbooks whose steps depend on unported skills end to end:
  `hillclimb`, `runtime-forensics`, `trace-forensics`, `visual-parity`,
  `orchestrate`, `autopilot-full`, `autopilot-stack`, `eval`,
  `worktree-cleanup`. Later features.
- Any change to `brainstorming`, `writing-plans`,
  `subagent-driven-development`, `test-driven-development`,
  `systematic-debugging`, `verification-before-completion`,
  `finishing-a-development-branch` content. The router references them;
  it does not edit them.

## Constraints

- Zero runtime dependencies. Nothing from `poteto-mode/scripts/` ships.
- One branch, one PR: `feat/pstack-migration`, by the human partner's
  decision on 2026-10-25, overriding the repo's one-problem-per-PR
  default (precedent: PR #11). Phases 0–4 land in order as separate
  commit groups; a phase never bundles another phase's files, so a
  reviewer can read the PR phase by phase.
- Skill content edits need eval evidence: each phase names its eval,
  runs it on the unedited plugin first, and drops the edit when the
  baseline already passes (`conventions.md`, Evals).
- Codex packaging must stay green: every new `skills/<name>/` needs an
  `agents/openai.yaml` seed (phase 1 adds the fallback), and shipping
  `agents/` to Codex needs the archive list extended (phase 4).
- Frontmatter per `conventions.md`: `name` equals the directory,
  `description` starts "Use when…" and stays under 500 chars.
- Ported text uses Text2Prod tool names only. No model slugs, no Cursor
  tool names, no `/setup-pstack` or `cursor-team-kit` references.
- The session-start bootstrap is paid every session: `using-text2prod`
  stays a table plus rules; playbook and principle bodies live in files
  the router reads on demand.
- Attribution: MIT notice for pstack (Lauren Tan, cursor/plugins) in
  `LICENSE`; one credit line per ported file.
- Never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.

## Design

### 1. Phases and commit order

| Phase | Change | Files | Depends on |
| --- | --- | --- | --- |
| 0 | `zed` delegate agent | `agents/zed.md`, `tests/agents/test-agent-static.sh`, `ARCHITECTURE.md` row (already written, uncommitted) | — |
| 1 | Codex packaging seed fallback | `scripts/package-codex-plugin.sh`, `tests/codex/test-package-codex-plugin.sh`, `docs/testing.md` | — |
| 2 | Principles skill | `skills/principles/`, `LICENSE`, one pointer in `using-text2prod` | 1 |
| 3 | Router and playbooks | `skills/using-text2prod/SKILL.md`, `skills/using-text2prod/playbooks/*.md`, `references/codex-tools.md` | 2 |
| 4 | Delegate agents on both harnesses | `agents/comment-sicko.md`, `agents/codex/{zed,comment-sicko}.toml`, `references/codex-tools.md`, packaging archive list, `tests/agents/` | 0, 1, 3 |

`writing-plans` produces one `plan.md` with one section per phase; the
sections run in order on `feat/pstack-migration`, the branch ships as
one PR, and `review.md` records
each phase's decisions. Phase 0 needs no plan section: it is the
existing uncommitted work, committed and reviewed as is.

### 2. Phase 1: packaging seed fallback

`package-codex-plugin.sh` keeps seeding `openai.yaml` from the prior
package. For a skill with no prior entry it generates a minimal file:

```yaml
interface:
  display_name: <name from SKILL.md frontmatter, hyphens to spaces>
  short_description: <description, first sentence, max 120 chars>
```

A generated file is reported on stderr (`Generated OpenAI metadata for
skill: <name>`), and the run still dies when a SKILL.md lacks `name` or
`description`. `tests/codex/test-package-codex-plugin.sh` adds a case: a
staged fixture skill with no prior metadata packages successfully and
the archive contains its generated `openai.yaml`.

### 3. Phase 2: principles skill

```
skills/principles/
  SKILL.md                 index + citation rule
  references/<name>.md     one file per principle, 24 files
```

`SKILL.md` frontmatter: `name: principles`; `description: Use when
making a design, debugging, delegation, or verification decision and
you need the named rule that governs it — before adding an abstraction,
choosing a data structure, writing a guard, declaring work done, or
dispatching a subagent.`

Body: a credit line, then the index as a table grouped core /
architecture / verification / delegation / meta, one row per principle:
name, when it applies (pstack's trigger sentence), the one-line rule,
and the reference path. Then the citation rule:

> In your reply, name each principle that changed a decision and the
> specific choice it changed. Cite only principles whose reference file
> you read this session.

Each `references/<name>.md` keeps pstack's rule, **Why**, and sub-rules.
Cross-references become reference paths. Cursor-only phrases are
removed. Names are pstack's kebab-case names without the `principle-`
prefix (`laziness-protocol`, `prove-it-works`,
`sequence-verifiable-units`, …).

`using-text2prod/SKILL.md` gets one rule under "The Rule": before a
design, debugging, delegation, or verification decision, read
`principles/SKILL.md` and apply its citation rule.

`LICENSE` gets a "Third-party notices" section with pstack's MIT text.

### 4. Phase 3: router and playbooks

`using-text2prod/SKILL.md` keeps its current rules (skill-first, red
flags, platform adaptation, project structure) and adds a **Playbooks**
section:

1. Match the request to one playbook from the table. When none fits,
   fall back to the current rule (invoke the matching skill).
2. Open a step list whose first items are the playbook's steps copied
   verbatim, before any task-specific items. Use `TodoWrite` or
   `update_plan` when the session has one; otherwise keep the list in
   the reply and update it at each step.
3. A step you choose not to do stays in the list with
   `skip: <one-line reason>`.
4. Route to the skill each step names as the step fires.

The table ships these playbooks, each at
`skills/using-text2prod/playbooks/<name>.md`, mapped to Text2Prod
skills:

| Playbook | Trigger | Steps route to |
| --- | --- | --- |
| investigation | read-only question: how, why, are we sure | read code, cite evidence, no edits; `brainstorming` spike when the answer needs a probe |
| bug-fix | reported defect | `systematic-debugging` → `test-driven-development` → `verification-before-completion` → opening-a-pr |
| feature | new or changed behavior | `brainstorming` → `writing-plans` → `subagent-driven-development` or `executing-plans` → `finishing-a-development-branch` (the existing chain, now as steps) |
| refactoring | behavior-preserving structural change | `brainstorming` (bounded) → `test-driven-development` (characterization tests) → `verification-before-completion` |
| perf-issue | measured slowness | baseline measurement → `systematic-debugging` → fix → re-measure against baseline |
| prototype | settle a design or behavior fork cheaply | `brainstorming` spike path; output is a recommendation, code labeled throwaway |
| babysit | drive a PR to merge-ready | conflicts → review threads via `receiving-code-review` → CI; declare mode before polling |
| shipping | land a green stack | independent per-PR verification → land bottom-up via `finishing-a-development-branch` |
| autonomous-run | "run until done", "going to bed" | decision log in `docs/features/<slug>/review.md`; pause only on the Always-pause list |
| session-pickup | resume another agent's in-flight work | read transcript or branch, rebuild the step list, continue |
| pause-safely | suspend cleanly | commit WIP, write the resume note, stop |
| multi-phase-plan | work spanning phases or stacked PRs | `writing-plans` with one section per phase, one PR each |
| opening-a-pr | end of every other playbook | `finishing-a-development-branch` |

Each playbook file is pstack's playbook rewritten for Text2Prod: steps
that name an unported skill (`how`, `architect`, `interrogate`) name the
Text2Prod equivalent, or carry `skip: skill not ported yet` with the
pstack name so a later feature can edit the step in place.

The **Autonomy** rules from `poteto-mode` move into the router under
"Autonomy": proceed on reversible work; always pause for force-push to
shared branches, deploys, data deletion, customer messages; "don't
stop" / "going to bed" means keep going; a candid "no" is an acceptable
answer.

`references/codex-tools.md` adds a line: `update_plan` is opt-in
(`tools.update_plan.enabled = true`); without it the step list lives in
the reply.

### 5. Phase 4: delegate agents on both harnesses

- `agents/comment-sicko.md`: Claude Code port of pstack's reviewer.
  Frontmatter per `tests/agents/test-agent-static.sh`; body keeps the
  keep-list and the `MUST KILL` marker; reads diffs only, never writes
  code. Credit line included.
- `agents/codex/zed.toml` and `agents/codex/comment-sicko.toml`:
  Codex role files with `name`, `description`, `developer_instructions`
  holding the same brief as the Markdown agent, minus Claude-only path
  resolution. The parent passes the skills path; with none the agent
  stops and tells the parent.
- Install: `references/codex-tools.md` gains "Delegate roles": on first
  dispatch in a repo, copy `agents/codex/*.toml` from the plugin into the
  repo's `.codex/agents/` on the partner's yes, then dispatch with
  `agent_type: "zed"` or `"comment-sicko"`. The copy is idempotent
  (skip when the file is byte-identical, report when it differs).
- Packaging: `agents` is added to the Codex archive list in
  `package-codex-plugin.sh` and asserted in its test, so the TOML files
  reach Codex users. `ARCHITECTURE.md`'s `agents/` row changes from
  "Claude Code only" to "Claude Code `*.md`; Codex `codex/*.toml`,
  installed per repo".
- `tests/agents/test-agent-static.sh` extends to the TOML files: each
  has the three required keys and a `name` matching its filename.

### 6. Follow-ups named, not designed

Each is a later `docs/features/<slug>/`: `interrogate` into
`requesting-code-review`; `prove-it-works` and `benchmark-checklist`
into `verification-before-completion`; `opening-a-pr` and `shipping`
depth into `finishing-a-development-branch`; the net-new skills in
Non-goals; the deferred playbooks in Non-goals.

## Error handling

- Router finds no matching playbook: fall back to today's skill-first
  rule and say which playbooks were considered.
- A playbook step names a skill the session cannot load: keep the step
  with `skip: <skill> unavailable`, continue.
- `TodoWrite`/`update_plan` absent: step list in the reply, updated at
  each step; never silently drop it.
- Codex: `.codex/agents/` copy declined: dispatch with the built-in
  `worker` role and paste the brief inline; say so in the report.
- Codex: role file present but different from the plugin's: do not
  overwrite; report the diff and ask.
- Packaging: SKILL.md missing `name` or `description`: die with the
  skill name, as today.
- Eval baseline already passes for a phase: drop that phase's content
  edit, record the baseline result in `review.md`, keep the structural
  files (index, playbook files) only if a later phase depends on them.

## Testing

Static (run per phase):
- Phase 1: `tests/codex/test-package-codex-plugin.sh` new case —
  fixture skill without prior metadata packages and ships a generated
  `openai.yaml`; count assertion still holds.
- Phase 2: `tests/claude-code/test-principles-index.sh` — every
  `references/*.md` is linked from the index, has a **Why**, and the
  index links no missing file; `using-text2prod` contains the pointer.
- Phase 3: `tests/claude-code/test-playbooks.sh` — every playbook in the
  table exists, every skill a step names exists under `skills/` or the
  step is marked `skip:`, no playbook names a model slug or Cursor tool.
- Phase 4: `tests/agents/test-agent-static.sh` covers `*.md` and
  `codex/*.toml`; packaging test asserts `agents/codex/*.toml` in the
  Codex archive.

Evals (`plugin-evals/`, baseline on the unedited plugin first):
- Phase 2 `principle-cited-on-decision`: a refactor request that invites
  an unneeded helper layer. `llm` grader passes when the reply names
  Laziness Protocol or Subtract Before You Add and keeps the diff
  minimal; `tool_used` grader checks `principles/SKILL.md` was read.
- Phase 3 `router-opens-playbook`: a bug report. Grader passes when the
  reply opens a step list containing the bug-fix playbook's steps and
  invokes `systematic-debugging` first. Baseline: existing
  `debug-root-cause-first` behaviour; the new grader checks the step
  list, which today's skill never produces.
- Phase 4 `delegate-uses-zed`: a two-task plan executed with
  `subagent-driven-development`. `tool_used` grader passes when the
  dispatch uses `subagent_type` `zed` (Claude) and the report names
  the role. The Codex install step is checked statically only; the eval
  sandbox blocks git and has no `.codex/`.
