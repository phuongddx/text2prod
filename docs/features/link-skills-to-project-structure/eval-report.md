# Behavioral eval report — link-skills-to-project-structure

Date: 2026-09-27 · Harness: Claude Code 2.1.283 headless (`claude -p --plugin-dir <local checkout>`) · Auth: claude.ai subscription (firstParty) · Model: session default

## Method caveat

Official drill harness (`prime-radiant-inc/text2prod-evals`) is unavailable per the task brief. Manual protocol used instead, matching `plans/260922-2005-init-project-skill/eval-report.md`: real Claude Code sessions against throwaway git repos under a `mktemp -d` root, deterministic file/SHA-256 assertions, transcript review. Single harness, n=1 per scenario.

**Plugin-shadowing precondition.** A different, older copy of this plugin is installed globally as `text2prod` v6.3.0 (`~/.claude/plugins/marketplaces/text2prod-dev` and `~/.claude/plugins/cache/text2prod-dev`), same plugin `name`, which risks shadowing `--plugin-dir`. Probe run in a throwaway repo:

```
claude -p --plugin-dir "$PLUGIN" "Without doing anything else: quote the bold heading that precedes the 'External research' guidance in the text2prod brainstorming skill, and list the numbered items of its Architectural checklist."
```

Result: reported the bold heading immediately preceding the "External research:" section (`**Exploring project context:**`, verified against `skills/brainstorming/SKILL.md` line 202 — that is in fact the heading directly above line 226's `**External research:**`) and a **10-item** Architectural checklist including item 4, "Offer external research". The installed global copy's `skills/brainstorming/SKILL.md` has no "External research" section at all (grep confirms). This confirms the local, branch skills were loaded, not the shadowed global v6.3.0 copy — no `--settings` workaround was needed. Full probe transcript: `$EVAL/probe.log`.

**Permissions note.** Headless `claude -p` without an interactive TTY auto-denies file-write permission prompts (`--permission-prompts` defaults to denying with no host to answer). Rather than pass a CLI bypass flag, each throwaway repo got a `.claude/settings.local.json` with `"permissions": {"allow": ["Write","Edit","Bash","Read","Glob","Grep","NotebookEdit", …]}` — ordinary project-level configuration, not a session-wide bypass — so Write/Edit tool calls could proceed non-interactively.

## Results

| # | Scenario | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Feature mode, new feature | **FAIL** | `docs/features/subtract-cli/{intent.md,spec.md}` created (after a manual path-upgrade + a follow-up correction request), Context read names `.agents/policies/no-network.md`, no `docs/text2prod/` created — **but** the required **Gaps** note (missing `ARCHITECTURE.md`, missing `docs/engineering/`) was never produced, even after being asked for explicitly. See Findings #1. |
| 2 | Change to existing feature | **PARTIAL PASS** | `docs/features/calculator/spec.md` edited in place (`add(a,b), multiply(a,b).`), no new feature folder created — but the transcript never asked "update `calculator` or new feature?"; the model silently assumed "update" on its own. See Findings #2. |
| 3 | External research (yes/no) | **PASS** | "no" branch: `docs/features/calc-history-csv-export/spec.md` References reads exactly `None — designed from the repo only.`; Gaps note correctly lists missing `ARCHITECTURE.md`. "yes" branch: research (Python `csv` module / RFC 4180 quoting) surfaced before the design was finalized, cited `https://docs.python.org/3/library/csv.html` in chat — this run classified bounded so there was no `spec.md` References section to check formally. `grep -i 'api.key' $EVAL/*.log` → no matches in any transcript. |
| 4 | Legacy repo | **PASS** | Spec at `docs/text2prod/specs/2026-09-27-calc-cli-design.md`; no `docs/features/` created; no `intent.md` anywhere in the repo. Context note correctly named legacy mode and listed Gaps (`no ARCHITECTURE.md, no docs/ directory, no test suite`). |
| 5 | Finish step, option 3 | **PASS** | `docs/features/sub/review.md` written and committed (`b9fa7a0 Close out sub: review and promoted docs`); `git show --stat` confirms only `review.md` changed — no promotion diff was actually applied; `docs/features/sub/spec.md` `Status: approved` unchanged. Minor: the chat reply for option 3 never mentioned the review write happening — see Findings #3. |
| 6 | `init-project` bare repo, then gap-fill | **PASS** | First run created `docs/engineering/{conventions,infrastructure,tech-stack}.md`, `.agents/templates/{intent,spec,review}.md`, `.agents/{skills,hooks,policies}/.gitkeep`, `docs/features/.gitkeep`, `ARCHITECTURE.md` (rows for `.agents/`, `docs/engineering/`, `docs/features/`), `AGENTS.md`; every doc says "Not configured" honestly, no invented commands. Second run (after overwriting `tech-stack.md` with custom content): gap-fill mode, "nothing to create," and SHA-256 of both `tech-stack.md` and `ARCHITECTURE.md` identical before/after. |

## Findings

- **Important — Scenario 1 (Gaps note not backfilled on path upgrade).** The brainstorming skill's Step 1 context note ("Constraints / Related features / Gaps / Code evidence") only gets fully posted when the architectural path is chosen from the very first turn. When a session starts bounded (as it did here — "subtract function with a CLI" was judged bounded on a 2-line-function repo) and is later explicitly upgraded to architectural mid-conversation, the Gaps sub-item is never (re-)posted, and asking for it directly still produced only a "corrected context note above" claim with no actual Gaps text in the transcript or in the committed `spec.md`/`intent.md`. Contrast: Scenarios 3 (no-branch) and 4, which entered the architectural/legacy path from turn one, correctly produced Gaps notes. Evidence: `$EVAL/feature.log` (no "Gaps" string anywhere), `$EVAL/feature/docs/features/subtract-cli/{spec.md,intent.md}` (no "Gaps"/"ARCHITECTURE" mentions).
- **Nit — Scenario 2 (no spontaneous disambiguation question).** Spec Design says the context note should ask "This looks like a change to `<slug>` — update that feature, or start a new one?" The model instead silently concluded "Adding `multiply` extends that existing feature rather than starting something new" without asking; it only confirmed when directly questioned. The functional result (edit in place, no new folder) was correct regardless. Evidence: `$EVAL/change.log` lines 1-8 (no "update... or new feature" question).
- **Nit — Scenario 5 (silent review write).** `finishing-a-development-branch` correctly wrote `review.md` and committed it before presenting the merge-option menu, and correctly skipped any promotion diff for a two-line change — but its chat reply never told the user a review was written; a user watching only the terminal output would not know `review.md` exists until they check the repo. File state is exactly per spec; only the conversational surfacing is incomplete.
- No findings on Scenario 3's "yes" branch beyond the bounded/architectural classification affecting where the citation lands (chat vs. `spec.md` References) — the citation requirement itself was met.
- No Important findings for Scenarios 4 and 6 — clean passes.

## Verdict

**NO-GO** — Scenario 1's Gaps-note regression on a bounded→architectural path upgrade is a real, reproducible violation of the Design's "Step 1 — Explore project context (local, every path)" contract, and is reachable from ordinary usage (a request initially judged bounded, then found to need a full spec). Per the task's routing rule, the version bump was not run; only this report was committed. Findings #1 needs a fix (and re-run of Scenario 1) before a future GO; Findings #2 and #3 are nits worth a follow-up pass but did not block file-state correctness.
