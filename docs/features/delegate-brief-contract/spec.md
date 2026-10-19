# Spec: Delegate brief contract and throughput checkpoint

Status: approved <!-- draft | approved | shipped | superseded -->
Date: 2026-10-19

## Problem

Text2Prod's subagent workflows decide less than they could before a
dispatch, and lose directives between dispatches. Four concrete gaps,
each cited to the current skill text:

1. **TDD is optional for the implementer.**
   `subagent-driven-development/implementer-prompt.md` says "Write tests
   (following TDD if task says to)". Nothing tells the implementer to
   read `test-driven-development` or `verification-before-completion`,
   so whether a delegate writes the failing test first depends on the
   plan author remembering to say so in every task.
2. **The brief names no data shape and no success criteria.** The
   dispatch section of `subagent-driven-development/SKILL.md` (step 1 of
   The Task Loop) lists five things a dispatch contains: placement,
   brief path, prior interfaces, ambiguity rulings, report contract. The
   shape the task introduces, its organizing structure, and the
   observable checks that mean "done" are not among them. The
   implementer chooses the structure while coding and reports against
   its own reading of done.
3. **Fix rounds resume the implementer by default.** The fix loop
   (step 4) resumes the original implementer for rounds 1 to 3 and only
   falls back to a fresh dispatch when the harness cannot message a live
   subagent. A resumed agent receives the new findings but not a
   restatement of earlier rulings, so a directive given in round 1 can
   be silently dropped by round 3. The fresh-dispatch path exists but
   has no contract for what it must carry.
4. **Fan-out is decided by prose, in two different ways.**
   `dispatching-parallel-agents` decides with "Identify Independent
   Domains" and a "When NOT to Use" list. `subagent-driven-development`
   decides with "Batch small same-shape work" and "Never dispatch multiple
   implementation subagents in parallel". Neither asks the controller to
   write down the gates that must run first, which writes are shared, or
   why one worker is the smallest safe split. The two skills can reach
   different answers for the same plan.

Who is affected: the controller chat running a plan, the implementer and
reviewer subagents it dispatches, and the human partner who reads the
reports and inherits the code.

No logged incident triggered this spec. The ideas come from reading
pstack's `poteto-mode` delegation workflow (see References). Each lands
only if an eval shows the current skill missing the case (see Constraints
and Testing). A Claude Code agent wrapper (`agents/karen.md`) was built
first and set aside; see Non-goals.

## Context read

- `AGENTS.md`, `CLAUDE.md`: skills are behavior-shaping code, content
  edits need eval evidence and go through `writing-skills`; zero runtime
  dependencies; one experienced problem per PR.
- `ARCHITECTURE.md`: `skills/` and `hooks/` are the product; adapters
  carry no logic; durable knowledge lives in `docs/`.
- `docs/engineering/conventions.md`: skill frontmatter rules, shell
  style, commit rules.
- `docs/engineering/tech-stack.md`, `docs/engineering/infrastructure.md`:
  read for constraints; nothing in them bears on this design.
- `docs/testing.md`: `tests/` for non-LLM wiring checks, `plugin-evals/`
  for in-repo `claude plugin eval` suites, `evals/` for drill sessions.
- `skills/subagent-driven-development/SKILL.md` (Model Selection, The
  Task Loop, the fix loop), `implementer-prompt.md`,
  `task-reviewer-prompt.md`.
- `skills/dispatching-parallel-agents/SKILL.md` (The Pattern, When NOT
  to Use).
- `skills/executing-plans/SKILL.md`: redirects to
  subagent-driven-development when subagents exist; not changed here.
- `skills/using-text2prod/references/codex-tools.md`: Codex spawns take
  `model` and `reasoning_effort` overrides; `agent_type` role files
  attach only to isolated forks.
- `docs/features/evidence-and-correction/spec.md` (shipped): the
  precedent for landing pstack-derived ideas one eval at a time.
- Sibling specs: `code-intel-aware-exploration` (superseded),
  `link-skills-to-project-structure` (shipped), `spec-only-artifacts`
  (shipped). None overlaps.

Gaps:
- `.agents/policies/` is empty.
- `agents/karen.md` and `tests/agents/test-agent-static.sh` exist in the
  working tree but are uncommitted and nothing dispatches them.

## References

All sources are local files read in this session. No web research was
done.

- `~/.claude/plugins/cache/cursor-plugins/pstack/0.15.25/skills/poteto-mode/SKILL.md`,
  Subagents section: fresh subagents by default with consolidated scope;
  the lead reviews the diff and writes its own summary. Informed the
  fresh-by-default rule and the re-dispatch block.
- Same file, Non-negotiables: "Any code → name the data shape first".
  Informed the `## Data shape` slot.
- `.../skills/poteto-mode/playbooks/feature.md`, steps 3 and 4: the
  four-item throughput checkpoint, and the brief that names file paths,
  data shape, and success criteria. Informed the checkpoint and the
  `## Done means` slot.
- `.../skills/poteto-mode/playbooks/orchestrate.md`, the brief template
  (GOAL, SCOPE, ACCEPTANCE, VERIFY, REPORT) and the verifier-on-a-
  different-family rule. Informed the cross-family reviewer line.
- `.../agents/poteto-agent.md`: a delegate that reads its methodology
  before working. Considered and set aside as the primary mechanism; see
  Non-goals.
- `.../docs/harness/claude-code.md`: model and effort mapping for Claude
  Code. Informed the wording "a different model family where the harness
  offers one".

## Goals

- An implementer reads `test-driven-development` and
  `verification-before-completion` before writing code, on every
  harness, without the plan author asking.
- Every dispatch names the data shape and its organizing structure, and
  two to four observable checks that mean done.
- A fix round goes to a fresh implementer carrying the original brief,
  the prior report, every ruling since, and the open findings.
- Reviewers run on a different model family from the implementer where
  the harness offers one.
- Both dispatching skills decide fan-out with the same four written
  lines, recorded before the first dispatch.

## Non-goals

- No agent definition is wired in. `agents/karen.md` stays unwired until
  this feature's `implementer-reads-tdd` eval shows controllers skipping
  the required-reads line; then a follow-up feature wires it with a Codex
  TOML twin.
- No role-and-effort model table, no decision-trail script, no reviewer
  agent. Those are separate features if ever.
- `executing-plans`, `requesting-code-review`, and `writing-plans` do
  not change.
- The four report statuses (DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT,
  BLOCKED) do not change.
- No OpenCode-specific work. The changes are prompt text, so OpenCode
  gets them for free where it supports subagents.

## Constraints

- Skill content edits need eval evidence (`CONTRIBUTING.md`,
  `docs/engineering/conventions.md`). Each addition has an eval that
  fails on current skills before the edit and passes after.
- Zero runtime dependencies. Text only; no new scripts.
- Prompt text added to the implementer template stays resident in the
  controller's context on every dispatch (SKILL.md, The Task Loop). Each
  slot is a heading plus one to four lines.
- The fresh-by-default rule changes an existing choice, not only adds to
  one. Its eval must show fewer dropped directives, not only a different
  path.
- Must read the same on Claude Code and Codex. No harness-specific agent
  names in skill text.

## Design

Three files change. All edits are additive text except the fix-loop
default, which flips.

### Implementer prompt (`subagent-driven-development/implementer-prompt.md`)

Four additions, in the order the delegate reads them.

1. **Required reads.** Before step 1 of "Your Job":

   > Read `skills/test-driven-development/SKILL.md` and
   > `skills/verification-before-completion/SKILL.md` in full before you
   > write code. Your failing test comes first. Your report carries the
   > evidence those skills ask for.

   Step 2 changes from "Write tests (following TDD if task says to)" to
   "Write the failing test first, then the code".

2. **`## Data shape`** slot, filled by the controller: the shape the task
   introduces or changes, and its organizing structure (a state machine,
   a table or registry, a typed model, a boundary), or `n/a: no new
   shape`. The implementer confirms it in "Before You Begin" and writes
   no logic that contradicts it without reporting NEEDS_CONTEXT.

3. **`## Done means`** slot: two to four observable checks the controller
   writes. The report addresses each one by name.

4. **`## Prior round`** block, present only on a fix-round dispatch: the
   original brief path, the prior report path, every ruling made since
   the first dispatch, and the open findings verbatim.

### Dispatch rules (`subagent-driven-development/SKILL.md`)

- **The Task Loop, step 1.** The dispatch list grows from five items to
  seven: (6) the data shape and its structure, (7) the done checks.
- **The fix loop, step 4.** Rounds 1 to 3 dispatch a fresh implementer
  with the `## Prior round` block. Resume the original implementer only
  when it holds state that is costly to move: uncommitted work in its
  checkout, or a process it still runs. The existing harness fallback
  sentence becomes the default and is reworded accordingly.
- **Model Selection.** One line after "Always specify the model
  explicitly": the task reviewer and final reviewer run on a different
  model family from the implementer where the harness offers one; on a
  single-family harness a different tier counts.
- **The Task Loop, before "Batch small same-shape work".** The
  throughput checkpoint (below).

### Throughput checkpoint (both dispatching skills)

Before the first dispatch, the controller writes four lines into its
progress ledger. A line that does not apply stays with `n/a: <reason>`.

```text
Checkpoint:
1. Blocking first steps: <gates that run before any fan-out>
2. Independent workstreams: <disjoint files or layers that parallelize; shared writes serialize>
3. Shared mutable state: <split the target by default; serialize only for a real invariant>
4. Smallest safe decomposition: <if one worker is best, why>
```

In `subagent-driven-development` it sits at the top of The Task Loop and
is the recorded reason behind "never dispatch implementers in parallel".
In `dispatching-parallel-agents` it replaces the prose in "Identify
Independent Domains"; the "When NOT to Use" list stays as examples of
lines 2 and 3 failing. The block is byte-identical in both files.

## Error handling

- A controller that cannot name a data shape writes `n/a: no new shape`.
  An empty slot is a dispatch error the implementer reports as
  NEEDS_CONTEXT.
- An implementer that finds the named shape wrong reports
  DONE_WITH_CONCERNS with the shape it used and why; the controller rules
  and ledgers it.
- A fix-round dispatch missing any `## Prior round` field is not sent.
  The controller fills it from the ledger first.
- A harness with one model family cannot satisfy the cross-family rule.
  The reviewer dispatch names a different tier and the ledger records
  `reviewer: same family, different tier`.
- A checkpoint line the controller cannot answer blocks fan-out, not
  dispatch: default to one worker and record line 4 as the reason.

## Testing

**Evals** (`plugin-evals/`, one per idea; context embedded in
`prompt.md`). Each runs on the current skills first and must fail there.

| Eval | Prompt shape | Graders |
| --- | --- | --- |
| `implementer-reads-tdd` | SDD dispatch of a one-task plan whose task text does not mention TDD | `tool_used` Agent with `input_match` on both skill paths; `llm`: the implementer's first commit adds a failing test before the implementation |
| `dispatch-names-shape` | SDD dispatch of a task that adds a status field with four values | `input_match` `## Data shape` and `## Done means` in the Agent prompt; `llm`: the shape names an organizing structure, not only a type |
| `fix-round-consolidated` | A task review returning one Important finding after a round-1 ruling | `tool_used` Agent, `input_match` on brief path, report path, the ruling text, and the finding text in one prompt |
| `checkpoint-before-fanout` | Three unrelated test failures, `dispatching-parallel-agents` | `llm`: the four checkpoint lines appear in the ledger or reply before the first Agent call |
| `reviewer-different-family` | SDD with the implementer dispatched on a named model | `input_match`: the reviewer dispatch names a model of a different family |

The existing suites rerun on every PR; each PR cites its
`aggregate-result.json` in the template's before/after section.

**Static tests** (`tests/feature-artifacts/`, bash, run by `run-all.sh`):

- The checkpoint block is byte-identical in `subagent-driven-development`
  and `dispatching-parallel-agents`.
- `implementer-prompt.md` contains both skill paths, `## Data shape`,
  `## Done means`, and `## Prior round`.
- `subagent-driven-development/SKILL.md` Model Selection contains the
  phrase "different model family".
