# Claude Code tool mapping

Skills name tools generically. In Claude Code:

| Skill says | Claude Code |
| --- | --- |
| Step list / task tool | `TaskCreate` or `TodoWrite`, whichever the session offers. Neither: keep the list in your reply. |
| Dispatch a subagent | `Agent`. Delegates: `subagent_type: "text2prod:zed"`. Comment review: `"text2prod:comment-sicko"`. Read-only search: `"Explore"`. |
| Isolated workspace for a subagent | `Agent` with `isolation: "worktree"`, or the `using-git-worktrees` skill. |
| Ask your human partner | `AskUserQuestion` when present; in non-interactive (`-p`) mode, ask in plain text. |

## Model routing on dispatch

Map the Model Selection tiers of `subagent-driven-development` to the
`Agent` tool's `model` and `effort`:

| Tier | `model` | `effort` |
| --- | --- | --- |
| Mechanical, fast and cheap | `haiku` or `sonnet` | `low` or `medium` |
| Integration and judgment | `sonnet` | `medium` or `high` |
| Architecture, design, final review | `opus` | `high` or `xhigh` |

`model` accepts only the family names the tool schema lists. Always set
it: an omitted `model` inherits the session's. A second
opinion runs the same prompt on a different family.
