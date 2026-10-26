# Evidence levels

How strong is the evidence behind a claim? Skills that make or review
claims point here instead of restating the scale.

| Level | Name | What it means |
| --- | --- | --- |
| 1 | Asserted | "It's fine." Counts for nothing. |
| 2 | Cited | A real `file:line`, or the library's own source. |
| 3 | Traced | The failure path walked step by step and shown not to reach. |
| 4 | Executed | A script or test that calls the real code and fails loud when wrong. |
| 5 | Reproduced | Seen in the running system: app, CLI, or harness. |

## Rules

- A claim names its level in the same sentence, as `L<n>`:
  "tests pass (L4: 34/34, exit 0)".
- Minimum levels:

  | Claim | Minimum |
  | --- | --- |
  | Tests pass, build succeeds, linter clean | L4 |
  | Bug fixed | L4 with red-green verified, or L5 |
  | Safety fact in a review | L3; L4 when a script is cheap |
  | Nothing else depends on this | L3 |

- L1 and L2 never close a Critical or Important finding.
- Below the minimum, write the level you reached and `unproven`.
