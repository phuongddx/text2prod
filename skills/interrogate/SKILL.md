---
name: interrogate
description: Use when a design or change is contested ("two of us disagree", "pick one"), before shipping a risky change, or when asked to interrogate, adversarially review, challenge, stress-test, find blind spots in, or tear apart code or a design
---

# Interrogate

Several reviewers attack the same change from independent positions. The deliverable is your verdict on their findings, each verified against the code. Do not apply any change yourself; the human partner decides what to act on.

## Step 1: Scope

- Files or a diff the user names: use those.
- A feature branch: `git diff <base>...HEAD` against the branch it targets.
- A contested design with no code yet: the design text (`spec.md`, a proposal, or each competing option written out side by side).

Package the changed code with the surrounding files a reviewer needs to understand it.

## Step 2: Intent

State the intent in one paragraph, drawn from the user's message, commit messages, the PR description, and the code. For a pick-one dispute, the intent is the shared goal and both options, stated without leaning. If you cannot state the intent, ask before spawning reviewers.

## Step 3: Spawn reviewers

Dispatch at least two reviewers, labeled Reviewer A, B, and so on, all in one message so they run in parallel.

- **Model.** Pick each reviewer's model per the `subagent-driven-development` skill's Model Selection section. A contested design is a design task, so at least one reviewer runs on the most capable model. Give each reviewer a different model when the harness offers more than one. Otherwise every reviewer runs on the same model and the diversity comes from angles alone.
- **Angle.** Every reviewer gets the whole rubric and lens and leads with one angle. Reviewer A leads with correctness, root causes, and security from `references/rubric.md`. Reviewer B leads with structure and simplification from `references/code-quality-review.md`. A third leads with verification and complexity budget. On one model the angles are what keep reviewers from converging on the same reading, so never drop them there.
- **Read-only.** Use the harness's read-only agent type when it has one. Either way, the brief says the reviewer never edits files and never spawns subagents. Run `git status` after they return and revert anything a reviewer changed.

Build every prompt from `references/reviewer-prompt.md`, filled with the intent, the scope, its angle, `references/rubric.md`, and `references/code-quality-review.md`. For a design with no code, drop the code-quality lens.

## Step 4: Synthesize

Merge findings that describe one issue in different words and record which reviewers raised each. Findings two reviewers raised independently are the strongest signal; on one model, agreement between different angles still counts but weighs less than agreement across models. Note where one reviewer flags what another explicitly clears.

## Step 5: Lead judgment

You are the lead: a pragmatic senior engineer, not an aggregator. Read `references/lead-judgment.md`. A reviewer's finding is an assertion until you check it against the code yourself. Grade what you found with `../zed-mode/references/evidence-levels.md`, and tag every finding with its `L<n>`.

- **Act on.** Real issues of correctness, security, or maintainability that would block a real PR. Needs L2 at least; a correctness or security finding needs L3.
- **Consider.** Legitimate, but the cost of fixing now may outweigh it. Same evidence floor as Act on.
- **Noted.** Valid, not actionable at this stage.
- **Dismissed.** Wrong, nitpicking, missing context, or stuck at L1 after your check. Give the reason. A correctness or security finding needs L3 to dismiss; one you can neither prove nor refute at L3 goes to Consider tagged `unproven`.

For a pick-one dispute, end with the option that survives and the finding that decided it.

## Output

```
### Intent
> <the Step 2 paragraph>

### Reviewers
Diversity: <different models | one model, distinct angles>
- Reviewer A: <model>, angle <angle>, <N> findings

### Act on / Consider / Noted / Dismissed
<one heading each, entries as Step 5 describes, with L<n> and the reviewers who raised it>

### Agreement map
<where reviewers agreed and diverged, and what that pattern says>
```

_Adapted from pstack's `interrogate/SKILL.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
