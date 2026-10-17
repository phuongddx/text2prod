# Review: <change slug>

Reviewer: <name>
Date: YYYY-MM-DD
Plan under review: `plan.md` in this directory

## Passes

Run each pass and tag every finding with its pass:

- **Bugs** — logic errors, broken edge cases, subtle regressions.
- **Security** — injection risks, auth gaps, secrets/PII exposure.
- **Compliance** — the diff matches the plan and repo conventions.
- **Impact** — what the change could break outside the diff. Fill the
  block below; levels per Text2Prod's
  `using-text2prod/references/evidence-levels.md` (no relative link: this
  template is copied into other repos).

  | Field | Content |
  | --- | --- |
  | Safety fact | The one fact the change is safe because of, one sentence. |
  | Level | Level reached, proof pasted or pointed at. Below L3: `unproven`, and the finding is Important. |
  | Beyond the diff | Config, manifests, wire or file formats, other harnesses, scripts and tests that read the changed thing. One line each: path, then `clear` or the finding. A search that finds nothing is recorded. |
  | Cheapest pre-merge check | The one command or script that would catch the real breakage. |

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

## Decisions

Rulings agents made on the human partner's behalf, copied from the plan
ledger in order. With none, one row: `None`.

| Decision | Why | Evidence | Cost if wrong |
| --- | --- | --- | --- |
| | | | |

## Verdict

<!-- approve | request changes --> Reasoning in one or two sentences.
