# Spec: Evidence-graded review and structural correction

Status: approved <!-- draft | approved | shipped | superseded -->
Date: 2026-10-17

## Problem

Text2Prod's verification and review output does not tell its reader how
strong the evidence behind a claim is, does not look past the diff, and
loses the decisions agents took along the way. Five concrete gaps, each
cited to the current skill text:

1. **Evidence strength is invisible.** `verification-before-completion`
   demands fresh evidence (its Iron Law) but has no vocabulary for how
   strong that evidence is. "Linter passed" and "a script exercised the
   risky path" both read as "verified" in a report. The human partner
   cannot tell them apart without re-running the work.
2. **Review stops at the diff.** `requesting-code-review/code-reviewer.md`
   checks plan alignment, policy, quality, architecture, tests, and
   production readiness. Its only pointer beyond the changed lines is
   "Backward compatibility considered?". Nothing asks which config,
   manifest, script, test, or other harness reads the thing that changed.
3. **Rulings die with the chat.** `subagent-driven-development` keeps a
   ledger of `Ruling:` lines, prints them as "Rulings I made" in the final
   message, then deletes the workspace (its Finish section). `review.md`
   has no place for them, so `git log -- docs/features/<slug>/` holds the
   findings but not the decisions.
4. **The fix order is unproven in history.** `systematic-debugging` Phase 4
   writes a failing test before the fix but says nothing about committing
   it first. A reviewer reading history cannot see red-then-green, and
   escalation waits for three failed fixes, counting attempts rather than
   noticing that two of them shared one wrong assumption.
5. **Repeated corrections produce more prose.** When the human partner
   corrects the same mistake twice, no skill asks whether a lint, a test,
   or a structural change would make the mistake impossible. The default
   outcome is another line in an instruction file that nothing enforces.

Who is affected: the human partner reading reports and `review.md`, and
every agent that inherits a repo where the same mistakes keep recurring.

No logged incident triggered this spec. The ideas come from reading
pstack (see References). Each is landed only if an eval shows the current
skill missing the case (see Constraints and Testing).

## Context read

- `AGENTS.md`, `CLAUDE.md` (points at `AGENTS.md`): skills are
  behavior-shaping code, content edits need eval evidence and go through
  `writing-skills`; one experienced problem per PR; no new dependencies.
- `ARCHITECTURE.md`: `skills/` and `hooks/` are the product; `AGENTS.md`
  points at knowledge and never restates it; durable knowledge lives in
  `docs/`.
- `docs/engineering/conventions.md`: skill directory and frontmatter
  rules ("Use when…", under 500 characters); shell style; PR rules.
- `docs/engineering/tech-stack.md`, `docs/engineering/infrastructure.md`:
  read for constraints, nothing in them bears on this design.
- `docs/testing.md`: `tests/` for non-LLM wiring tests, `evals/` (separate
  drill repo) for behavior; `plugin-evals/` holds `claude plugin eval`
  suites and is the in-repo eval mechanism this spec uses.
- `skills/using-text2prod/references/feature-artifacts.md`: feature-mode
  layout, template resolution, promotion rule, never edit `AGENTS.md`.
- `skills/verification-before-completion/SKILL.md`: Iron Law, Gate
  Function, Common Failures table, Red Flags.
- `skills/requesting-code-review/SKILL.md` and `code-reviewer.md`: single
  reviewer seat, no nested subagents, reviewer never approves, report
  format with Strengths / Issues / Assessment.
- `skills/finishing-a-development-branch/SKILL.md`: Step 1b writes
  `review.md` and proposes promotions; Status set in Step 5.
- `skills/subagent-driven-development/SKILL.md`: ledger, "Rulings I
  made", workspace deletion at Finish.
- `skills/systematic-debugging/SKILL.md`: Phase 4 steps 1-5, the
  3-failed-fixes architecture rule, Red Flags.
- `skills/writing-skills/SKILL.md`: skill types, TDD mapping, "Match the
  Form to the Failure", description rules.
- `skills/using-text2prod/templates/review.md` and
  `.agents/templates/review.md`: identical today; Passes section lists
  Bugs, Security, Compliance.
- `plugin-evals/*/prompt.md` and `graders/*.md`: grader types in use
  (`tool_used`, `tool_order`, `file_exists`, `llm`), context embedded in
  prompts, `plugin-evals/results/` gitignored.
- `docs/features/link-skills-to-project-structure/spec.md`,
  `docs/features/spec-only-artifacts/spec.md`: both shipped, unrelated.
- Recent commits `4eb78c5`..`607c183`: release and OpenCode wiring, no
  overlap.

Gaps:
- `.agents/policies/` is empty.
- `plugin-evals/` has no eval for review, finishing, or verification
  behavior.
- `AGENTS.md` says "15 general-purpose skills"; this spec adds a 16th.
  That line belongs to the human partner (never edited by skills).
- `docs/testing.md` does not mention `plugin-evals/`.

## References

- pstack 0.15.25 (`cursor/plugins`, local copy under
  `~/.claude/plugins/cache/cursor-plugins/pstack/0.15.25/`), MIT:
  - `skills/blast-radius/SKILL.md`: the five-step "how sure are you"
    ladder and "find the one fact it's safe because of". Informed the
    evidence levels and the Impact pass.
  - `skills/poteto-mode/playbooks/bug-fix.md` step 5: "stage the commits
    so the failing repro lands before the fix". Informed the repro-first
    commit rule.
  - `skills/principle-attack-the-premise/SKILL.md`: test the shared
    premise after two failed fixes. Informed the premise rule.
  - `skills/correct/SKILL.md` and
    `skills/principle-encode-lessons-in-structure/SKILL.md`: fix classes
    at the highest level that works; rule table paired with enforcement.
    Informed `correcting-repeated-mistakes`.
  - `skills/show-me-your-work/SKILL.md`: one row per decision, evidence
    as a pointer not prose. Informed the Decisions table columns.
- `claude plugin eval --help` (this build; no public docs page exists):
  grader types `regex`, `tool_used`, `tool_order`, `file_exists`, `llm`,
  `baseline`; `prompt.md` frontmatter; no fixture seeding without
  `--scaffold`. Informed the Testing section. Known discrepancy: the
  reference omits `input_match` and `weight` on `tool_order`, but
  `plugin-evals/tdd-test-first` uses both with recorded results, so the
  repo's usage is kept (`conventions.md`: current source wins).

## Goals

- A report or `review.md` states, for each claim, how strong its evidence
  is, on a scale shared by three skills.
- Every code review names the one fact the change is safe because of,
  grades its proof, and records what was checked beyond the diff.
- Every `review.md` carries the decisions agents took on the human
  partner's behalf, so git history holds them.
- Debugging commits the reproduction before the fix and tests a shared
  assumption after two failed fixes.
- A repeated correction routes to a skill that proposes the strongest
  enforcement that works, applied only on the human partner's yes.
- Every change is backed by a `plugin-evals/` suite that fails on the
  current skills and passes on the new ones.

## Non-goals

- Model routing, per-role model tables, or multi-model review panels.
- A standalone blast-radius skill or any new auto-trigger beyond
  `correcting-repeated-mistakes`.
- A decision log file outside `review.md`.
- Scripts in Bun, TypeScript, or any runtime beyond bash and node.
- Changing the three-option integration menu, the reviewer-never-approves
  rule, or the brainstorming gates.
- Editing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` from any skill.

## Constraints

- Zero runtime dependencies (`CONTRIBUTING.md`).
- Skill content edits go through `writing-skills` and carry eval evidence
  (`AGENTS.md`, PR template). Because no incident triggered this work,
  each PR's first task is its eval run against the current skills; an
  idea whose eval already passes is dropped from that PR.
- One experienced problem per PR; three PRs (see Delivery).
- Skill descriptions start "Use when", list triggering conditions only,
  stay under 500 characters (`conventions.md`).
- Works identically in Claude Code, Codex, and OpenCode: no harness-only
  tools in skill text.
- The two `review.md` templates stay byte-identical.
- Reviewer subagents never approve and never spawn subagents
  (`code-reviewer.md`).
- Skills never edit `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`
  (`feature-artifacts.md`).

## Design

### 1. Evidence levels (shared reference)

New file `skills/using-text2prod/references/evidence-levels.md`:

| Level | Name | What it means |
| --- | --- | --- |
| 1 | Asserted | "It's fine." Counts for nothing. |
| 2 | Cited | A real `file:line`, or the library's own source. |
| 3 | Traced | The failure path walked step by step and shown not to reach. |
| 4 | Executed | A script or test that calls the real code and fails loud when wrong. |
| 5 | Reproduced | Seen in the running system: app, CLI, or harness. |

Rules in the same file:

- A claim names its level in the same sentence, as `L<n>`, for example
  "tests pass (L4: 34/34, exit 0)".
- Minimum levels: "tests pass" and "build succeeds" need L4. "Bug fixed"
  needs L4 with red-green verified, or L5. A safety fact (section 2)
  needs L3, or L4 when a script is cheap. L1 and L2 never close a
  Critical or Important finding.

Readers: `verification-before-completion`, `code-reviewer.md`, the
`review.md` template. Each points at the file instead of restating it.

**Edit to `verification-before-completion`:** Gate Function step 5 becomes
"ONLY THEN: make the claim, with its level". The Common Failures table
gets a `Level` column holding the minimum for each row. Red Flags gains
"A Level 1 or 2 statement closing a finding". Roughly 15 lines.

### 2. Impact pass and Decisions table

**Impact pass.** The `review.md` template's Passes section gains a fourth
pass, and `code-reviewer.md` "What to Check" gains an **Impact** block
the reviewer fills in a fixed shape:

| Field | Content |
| --- | --- |
| Safety fact | The one fact the change is safe because of, one sentence. |
| Level | Evidence level reached, with the proof pasted or pointed at. Below L3 it reads `unproven` and the Impact finding is Important. |
| Beyond the diff | What was checked where a symbol search stops: config files, manifests, wire or file formats, other harnesses, scripts and tests that read the changed thing. Each item is a path plus `clear` or a finding. A search that finds nothing is recorded as an answer. |
| Cheapest pre-merge check | The one command or script that would catch the real breakage. |

Findings from this pass go in the Findings table tagged `Impact`. The
pass runs inside the single reviewer seat; no new subagent, no new skill.
The reviewer still never approves.

**Decisions table.** `review.md` gains:

```markdown
## Decisions

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
```

`finishing-a-development-branch` Step 1b item 1 gains one sentence: copy
every `Ruling:` line from the plan's ledger into this table, in order,
before the workspace is deleted. Decisions made outside a plan are added
by hand, one row each. With none, the single row reads `None`.

**Template parity.** Both `review.md` copies change together; a static
test enforces byte equality (see Testing).

### 3. Debugging edits

Both in `skills/systematic-debugging/SKILL.md` Phase 4.

**Commit the reproduction first.** Step 1 "Create Failing Test Case"
gains a bullet: in a git repo, commit the failing test on its own before
writing the fix, subject `Reproduce <symptom>`. The fix is the next
commit. A one-off script is committed the same way and removed in the
fix commit when it does not belong in the repo.

**Attack the premise.** A new step between the current steps 4 and 5,
firing at two failed fixes that assumed the same thing:

1. Write the premise down in one sentence.
2. Find an observation that would differ if the premise were false, and
   make it. Prefer a rerunnable check over reading code.
3. False: the cause is elsewhere; return to Phase 1 with the premise
   crossed off. True: ask the next "why" and continue.
4. No third fix before the premise is tested.

The 3-failed-fixes architecture rule is unchanged. Red Flags gains "Two
fixes failed on the same assumption, about to try a third".

### 4. `correcting-repeated-mistakes` skill

Directory `skills/correcting-repeated-mistakes/`, type: technique, about
120 lines.

Description: "Use when the same correction has come up twice or more:
your human partner repeats a 'don't do X' or 'we do Y here', a review
flags the same class of mistake again, or a revert repeats an earlier
one. Use before adding another instruction to an agent rules file."

Process:

1. **Collect.** Recent commits and reverts, `docs/features/*/review.md`
   Findings, PR review comments when `gh` is available, agent instruction
   files, comments explaining workarounds. Group into classes; a class
   counts at two occurrences, each cited.
2. **Pick the highest level that works**, per class, in order:

   | Level | Fix shape |
   | --- | --- |
   | Structure | One owner per piece of state, one supported way, delete the old way, one source of truth instead of hand-synced lists. |
   | Types, lint, CI | A check whose error names the right file or function. If the pattern is already common, fail only when a change adds more. |
   | Tests | A behavior test that fails when the behavior breaks and passes when internals change. |
   | Prose | Docs or agent rules, last, only for judgment calls nothing can check. |

3. **Propose, don't apply.** One proposal per class: level, why a higher
   level did not work, and proof that the new check fails on a real past
   instance (commit cited). Applied only on an explicit yes, as in the
   promotion step of `finishing-a-development-branch`.
4. **Rule table.** Each kept rule gets a row `Rule | Enforced by` in
   `docs/engineering/conventions.md` (never `AGENTS.md`). A rule in the
   table with nothing enforcing it that recurs is a repeat and goes up a
   level.
5. **Exceptions** sit on the offending line with a reason, an expiry
   date, and who approved.

Wiring: `README.md` skill table gains a row. `writing-skills` "Match the
Form to the Failure" gains a one-line pointer for mistakes outside skills.
No bootstrap change; skills trigger by description.

### 5. Delivery

One plan, three PRs, each solving one problem:

1. `feat/evidence-review`: sections 1 and 2 (reference, verification
   edit, Impact pass, Decisions table, parity test).
2. `feat/debugging-premise-repro`: section 3.
3. `feat/correcting-repeated-mistakes`: section 4, README row,
   `writing-skills` pointer.

Each PR goes through `writing-skills`, fills every PR template section,
and cites its eval results. Version bump and the `AGENTS.md` skill count
are the human partner's, after PR 3.

## Error handling

- No ledger on the branch (bounded change, or plan without rulings):
  Decisions row reads `None`; the finishing skill says so.
- Repo without git: the repro-first bullet is skipped and the debugging
  skill says so in its report.
- `gh` unavailable: `correcting-repeated-mistakes` skips PR comments and
  lists the sources it did read.
- Safety fact cannot reach L3: the Impact block reads `unproven`, the
  finding is Important, and the human partner decides.
- Eval harness drift: Testing cites `claude plugin eval --help` and the
  known `tool_order` discrepancy; a grader that stops parsing points
  there to recheck.
- A new eval passes on the current skills: that idea is dropped from its
  PR and the drop is recorded in `review.md`.

## Testing

**Evals** (`plugin-evals/`, one per idea; context embedded in `prompt.md`,
no `--scaffold`). Each is run on the current skills first and must fail
there.

| Eval | Prompt shape | Graders |
| --- | --- | --- |
| `verification-states-level` | A function plus pasted test output; "is this done?" | `regex` last message matches `L4`; `tool_used` Skill = verification-before-completion |
| `review-impact-pass` | A diff renaming a config key read by one shown file and one unshown file; "review this" | `regex` last message contains "Safety fact"; `llm`: names or searches for the unshown reader |
| `finishing-writes-decisions` | A ledger with two `Ruling:` lines; "close out the feature" | `tool_used` Write or Edit on `review.md` matching `## Decisions` and the ruling text |
| `debug-commits-repro-first` | Bug, failing test, "fix and commit" (Bash allowed) | `regex` on trace: a commit containing `Reproduce` precedes the fix commit; `llm`: two commits in that order |
| `debug-tests-premise` | Transcript of two failed fixes sharing one assumption; "try another fix" | `llm`: writes the premise down and tests it before a third fix; `tool_used` Edit `max: 0` |
| `correcting-fires-on-repeat` | "Second time I've said this: stop hand-syncing the README version. Make it not happen again." | `tool_used` Skill = correcting-repeated-mistakes; `llm`: proposes a level above prose and asks approval; Write/Edit `max: 0` |
| `correcting-not-on-first` | Same request, first occurrence | `tool_used` Skill = correcting-repeated-mistakes, `min: 0`, `max: 0`, `arm: both` |

The existing seven suites rerun on every PR; each PR cites its
`aggregate-result.json` in the template's before/after section.

**Static tests** (`tests/feature-artifacts/`, bash, run by `run-all.sh`):

- The two `review.md` templates are byte-identical.
- `evidence-levels.md` is referenced by `verification-before-completion`,
  `code-reviewer.md`, and the `review.md` template.
- `skills/correcting-repeated-mistakes/SKILL.md` frontmatter: `name`
  matches the directory, description starts "Use when", under 500
  characters.
