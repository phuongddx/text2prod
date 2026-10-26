---
name: show-me-your-work
description: Use when running long, autonomous, unattended, or multi-phase work, when your human partner steps away and will review the result later ("going to bed", "run until done", "trust it when I'm back"), or when another skill needs an audit trail of the decisions an agent made
---

# Show me your work

Keep one decision log per run, a TSV file with one row per decision:

| Column | Content |
| --- | --- |
| `ts` | ISO 8601 UTC timestamp. `scripts/log.sh` stamps it. |
| `phase` | The phase or workstream. |
| `decision` | What was chosen or done, one line. |
| `why` | The reason in plain words. If a principle drove it, say the reason, not a tag. |
| `evidence` | A pointer that proves it: commit SHA, PR number, `file:line`, an artifact or screenshot path. Never a paragraph. |
| `result` | The outcome or predicate state: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`. |

Cells stay on one line.

```
ts	phase	decision	why	evidence	result
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so old and new can be compared for any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the brief
```

## Write rows as decisions land

Append a row the moment a decision lands, not at the end. A run that stops early, crashes, or loses its context still leaves every row written so far.

At finish time the trail feeds the `## Decisions` table of `review.md` (`../zed-mode/templates/review.md`). Its rows that ruled on your human partner's behalf go in beside the plan ledger's rulings, as the decisions made outside a plan, with `Cost if wrong` filled in then.

Append with `scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>`. It writes the header on first use, flattens tabs and newlines, and quotes cells a spreadsheet would run as formulas. A bare `printf` works too, but then handle those bytes yourself when cells carry generated or user-supplied text. `references/decision-log-template.tsv` is the header row alone, for starting a log by hand.

Log decision points and checkpoints, not every action: a fork chosen, a unit completed with its verification result, a pivot or revert with its trigger, a blocker surfaced, a gate fixed. In a loop, one row per iteration. Write each row the way you would tell a teammate what you did; the `unslop` skill applies to log text.

## Runs and `start` rows

A run is one agent conversation, including its later turns. A pickup, a replacement agent, or a new chat starts a new run. When a run adds to a log that already has rows, its first row has phase `start`, and so does its first row after another run's `start` row. So a run that returns to a log in a later turn first reads the last rows to see whether another run wrote since. A `start` row names the `ts` range of earlier rows this run did not write, and its evidence names this run (its agent or session id). Use phase `start` for nothing else.

## Where it lives

By default the log is a working file, not committed: `decisions.tsv` in the work dir, or `.audit/<task-slug>.tsv` when several efforts run at once. Keep it out of git. Commit it only when a reviewer needs the trail to trust the result.

## Rules

- Append-only. A wrong call gets a new row that supersedes it. Never edit or delete a row.
- Prefer evidence a committed script produced over a hand-made one-off (`../principles/references/encode-lessons-in-structure.md`).

## Audit the log against the transcript

Before handing back, check the log told the truth. Read this run's session transcript in this workspace only:

- Claude Code: `~/.claude/projects/<slug>/<session>.jsonl`. The slug is the workspace path with each `/` and `.` changed to `-`. The newest `.jsonl` in that folder is the current session; `<session>/subagents/` holds its subagents' transcripts.
- Other harnesses: the harness's session transcript for this workspace.

Never read another workspace's transcripts. They are unrelated private chats.

This run's rows are the stretches that begin at one of its `start` rows (or the first row, if this run created the log) and end at another run's next `start` row. Walk them against the transcript:

- Every row maps to a real decision or action.
- Each row's evidence resolves and shows what the row claims.
- A fork, pivot, or abandoned approach that shaped the work but has no row is a gap. Add the row.

Correct the log, not the story. The audit never edits or removes a row, even an invented one. A row that records no real decision or action, or whose claim or evidence is wrong, gets a superseding row with what happened and a pointer that resolves. Rows outside this run's stretches are not audited; if this run's work shows one is wrong, supersede it like any wrong call.

## Independent review of the trail

Before handing back, dispatch a fresh subagent on a different model from the one that did the work when the harness offers one; otherwise a fresh subagent on the same model with no stake in the work. Pick its model and effort per the `subagent-driven-development` skill's Model Selection. Self-review does not substitute. The reviewer reads the trail and the run's transcript and flags what your human partner should look at. It does not redo the work. It looks for:

- Decisions logged with weak or missing evidence.
- Verification claimed without proof in the transcript, or skipped.
- Choices that look risky in hindsight: premature, scope-creeping, or covering a symptom.
- Gaps a casual skim would miss.

Every reply for a run that produced a trail ends with an `Attention` section. Its first line is `reviewed by <model>`, naming the reviewer's model, or the same model with the reason no other was offered. Then each flag, pointing at specific rows or moments. "No flags" is a valid list; a missing model line is not.

## Reading the trail

Read top to bottom, follow the evidence pointers, spot-check. GitHub renders a committed TSV as a table; `column -s$'\t' -t decisions.tsv` renders it in a terminal.

## Composing this skill

Skills that need an audit trail route it here by name and let this skill own the format. Do not restate the columns.

_Adapted from pstack's `show-me-your-work/` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
