# Get started with Text2Prod

This guide covers Text2Prod v0.0.7. You install the plugin, run a first feature through it, and learn what to type to get each workflow.

## What Text2Prod is

Text2Prod is a plugin of skills for coding agents. Each skill is a written procedure the agent follows, such as `brainstorming` for design, `test-driven-development` for code, and `systematic-debugging` for bugs. A bootstrap skill, `using-text2prod`, tells the agent to check for a matching skill before it responds. Text2Prod runs in Claude Code, Codex (CLI and App), and OpenCode, and feature work leaves a spec, a plan, and a review in your repository.

## Install the plugin

Install Text2Prod once per harness. If you use two harnesses, install it in both.

### Claude Code

Run these commands in a Claude Code session:

```text
/plugin marketplace add phuongddx/text2prod
/plugin install text2prod@text2prod
```

Start a new session afterwards, so the session-start hook runs. Details are in the README's [Claude Code section](../README.md#claude-code).

### Codex CLI

Text2Prod is not in the official Codex plugin marketplace yet. Add this repository as a Git marketplace, then install the plugin:

```bash
codex plugin marketplace add https://github.com/phuongddx/text2prod.git
codex plugin add text2prod@text2prod
```

These commands come from `docs/engineering/infrastructure.md`. The README's [Codex CLI section](../README.md#codex-cli) describes two other routes, local packaging with `scripts/package-codex-plugin.sh` and the interactive `/plugins` search.

### Codex App

Build an archive with `scripts/package-codex-plugin.sh` and upload it through the Codex portal. The script needs a prior official package as its metadata seed. See the README's [Codex App section](../README.md#codex-app).

### OpenCode

Text2Prod supports OpenCode V2:

```bash
opencode plugin add github:phuongddx/text2prod
```

You can also add `"github:phuongddx/text2prod"` to the `plugins` array in `opencode.json`. See the README's [OpenCode section](../README.md#opencode) and the [OpenCode guide](README.opencode.md).

## Run your first session

### What loads on its own

The bootstrap reaches the agent in a different way on each harness.

| Harness | How `using-text2prod` loads |
| --- | --- |
| Claude Code | `hooks/hooks.json` runs `hooks/session-start` on startup, `/clear`, and compaction. The hook injects `skills/using-text2prod/SKILL.md` into the session. |
| OpenCode | The plugin injects the bootstrap through the `context` session hook on every model call. |
| Codex | Codex has no session-start hook. It discovers the skills natively, and the agent loads `using-text2prod` by its description like any other skill. |

The bootstrap carries The Rule (invoke a matching skill before any response, clarifying questions included), a pointer to the principles, the playbook table, and the autonomy rules. Your own instructions in `CLAUDE.md`, `AGENTS.md`, or the chat take precedence over the skills.

### Walk through a feature

Open a repository and type a feature request:

```text
Let's add a dark mode toggle
```

Here is what happens, in order.

1. The agent announces "Using brainstorming to ..." and starts the `brainstorming` skill. A "let's build X" request goes to `brainstorming` first.
2. The agent classifies the request out loud as a spike, bounded, or architectural, and you can override it. If the app already has a settings screen, the agent may call the toggle bounded. A bounded change gets a short design in chat and no spec file. The rest of this walkthrough follows the architectural path.
3. The agent reads the project context and posts a short context note. Then it asks clarifying questions one at a time, for example who the toggle is for and whether it follows the system theme.
4. The agent proposes 2-3 approaches with trade-offs and a recommendation. It presents the design in sections, and you approve each section.
5. The agent writes `docs/features/dark-mode-toggle/spec.md`, commits it, and asks you to review the file. Your approval of the chat design does not approve the spec. Each stage needs its own yes.
6. After you approve the spec, `writing-plans` saves `plan.md` next to it and offers two execution options. Subagent-Driven (recommended) dispatches a fresh subagent per task and reviews between tasks. Inline Execution runs `executing-plans` in this session, in batches with checkpoints.
7. Implementation follows `test-driven-development` in both options. A failing test comes before each piece of code.
8. When the tasks are done, `finishing-a-development-branch` runs the full test suite, writes `review.md`, and shows this menu:

```text
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
```

### Find the files it wrote

Each feature gets one folder:

```text
docs/features/dark-mode-toggle/
├── spec.md     written by brainstorming
├── plan.md     written by writing-plans
└── review.md   written by finishing-a-development-branch
```

This layout applies when `docs/features/` exists at the repository root. Without that folder, the agent writes specs to `docs/text2prod/specs/` and plans to `docs/text2prod/plans/`, and it writes no `review.md`. In a repository without `.agents/` or `ARCHITECTURE.md`, the agent offers once to create a starter structure that includes `docs/features/`. It does not block the task on your answer, and it never edits an existing `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`. To set up a repository on purpose, say "init this project" and the `init-project` skill runs.

## Ask for the right workflow

The bootstrap matches each request to one of 13 playbooks in `skills/using-text2prod/playbooks/`. A playbook is a short list of steps. The agent copies the steps into its task list and runs the skill each step names.

Name the playbook when you want its steps. In the evals for v0.0.7, sessions with the plugin read the playbook file 3 of 3 times, against 0 of 3 without it. On a plain bug report, no session produced the bug-fix playbook's step list on its own (0 of 3, with or without the plugin), and the cause is unproven. So write "use the bug-fix playbook", not only "fix this".

| Playbook | What you type | What happens |
| --- | --- | --- |
| `investigation` | "Use the investigation playbook. How does the session-start hook load skills?" | A cited answer. No edits and no PR. |
| `bug-fix` | "Use the bug-fix playbook. Login fails after a password reset." | The agent reproduces the bug, runs `systematic-debugging`, commits a failing test, then fixes and verifies on the same surface. |
| `feature` | "Use the feature playbook to add CSV export." | The walkthrough above, from `brainstorming` to the finishing menu. |
| `refactoring` | "Use the refactoring playbook to split `parser.ts`." | The agent pins current behavior with a test, then moves code in small steps. No new behavior. |
| `perf-issue` | "Use the perf-issue playbook. Search takes 4 seconds." | A baseline measurement first, a fix from the trace, and a before and after number in the PR. |
| `prototype` | "Use the prototype playbook to compare two layouts." | Throwaway variants in a scratch directory behind one switcher, then a recommendation. |
| `multi-phase-plan` | "Use the multi-phase-plan playbook for the database migration." | A `spec.md` and a `plan.md` with one section per phase and PR. The agent stops and waits for your go. |
| `babysit` | "Check on PR 42", "get it green" | The agent declares a mode, then works conflicts, review threads, and CI on the lowest unmerged PR. It never merges. |
| `shipping` | "Land it", "merge when ready" | An independent verifier per PR, then a bottom-up merge of the verified run with `gh pr merge --squash`. |
| `autonomous-run` | "Run until done", "going to bed" | The agent states a checkable exit condition and iterates until it is met. |
| `session-pickup` | "Use the session-pickup playbook to continue this branch." | The agent reads the prior trail and the latest `wip:` commit, names the resume point, and redoes nothing. |
| `pause-safely` | "Use the pause-safely playbook." | The agent stops at a safe boundary and commits a `wip:` commit with a resume note. |
| `opening-a-pr` | "Use the opening-a-pr playbook." | It runs at the end of every other playbook. Conventional Commits title, a one-minute PR body, and `comment-sicko` over the diff when available. |

When no playbook fits, the agent says which playbooks it considered.

## Use the principles

Text2Prod ships 24 principles in `skills/principles/`. Each principle is one rule with a condition for when it applies. Laziness Protocol, for example, applies when you size a diff, and its rule is to prefer the smallest change. The bootstrap tells the agent to read the principles index before a design, debugging, delegation, or verification decision, and then the reference file for each principle that applies.

You see the principles in the agent's final reply. The agent names each principle that changed a choice, and the choice it changed, as in "Laziness Protocol: left `fetchWithRetry` as one function, no policy layer". It cites only principles whose reference file it read in that session. In the evals, sessions with the plugin cited a principle and the choice it changed 3 of 3 times, against 0 of 3 without.

To ask for one, name it in the request, as in "Apply Subtract Before You Add to this refactor". The index in `skills/principles/SKILL.md` lists all 24 with their conditions.

## Know the delegate agents

Text2Prod ships two delegate agents in `agents/`.

- `zed` is the implementation delegate. `subagent-driven-development`, `dispatching-parallel-agents`, and `executing-plans` dispatch it for one task at a time. It reads `test-driven-development` and `verification-before-completion` before it writes code, and it never dispatches subagents of its own.
- `comment-sicko` is a read-only comment reviewer. The `opening-a-pr` playbook dispatches it over the diff before review. It returns the comments to delete and the symbols to reshape, marked `MUST KILL`. It never edits files.

On Claude Code, both agents come with the plugin as `text2prod:zed` and `text2prod:comment-sicko`. The evals confirmed dispatch to `zed` (3 of 3). They did not confirm `comment-sicko`, which never appeared in a session's agent list and was never dispatched (0 of 3).

Codex reads roles only from `.codex/agents/` in the repository or from `~/.codex/agents/`, never from a plugin. On the first dispatch in a repository, the agent asks once whether to install the `zed` and `comment-sicko` roles into `.codex/agents/`. On your yes, it copies `agents/codex/zed.toml` and `agents/codex/comment-sicko.toml` there. It skips a byte-identical file, and it reports the diff and asks before it touches a file that differs. If you decline, the agent dispatches the built-in `worker` role with the agent's instructions pasted into the brief. Static tests cover this install flow, but it has not run on a live Codex.

## Know what still stops for you

The agent proceeds on reversible work without asking. It still stops for these:

- Design approval in `brainstorming`. The chat design, the written spec, and the plan's execution method each need your yes.
- Merge approval in `finishing-a-development-branch`. The agent never writes an approval on your behalf.
- Force-push. During `shipping`, the agent pauses once before its first `--force-with-lease` and names the branches. Elsewhere it force-pushes only on your explicit request.
- Other irreversible writes, such as deploys, data deletion, and messages to customers.
- Changes to `docs/engineering/*.md` or `ARCHITECTURE.md` that the agent proposes when a feature closes.

Everything else goes ahead. The agent reads code, runs tests, and commits on its branch. During an autonomous run, it fixes broken skills and related bugs it finds, each in its own PR. "Don't stop", "going to bed", and "run until done" tell it to keep going. If you ask whether it should do something, it gives its real judgment, and "no" is an allowed answer.

## Update Text2Prod

Claude Code:

```bash
claude plugin marketplace update text2prod
claude plugin update text2prod@text2prod
```

Restart Claude Code to apply the update.

Codex CLI, for the Git marketplace you added at install:

```bash
codex plugin marketplace upgrade text2prod
```

OpenCode:

```bash
opencode plugin update
```

OpenCode checks unpinned git plugins for updates on its own. Pin a tag, as in `github:phuongddx/text2prod#v0.0.7`, when you want reproducible installs. On every harness, an update arrives only when the plugin `version` changes.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| The agent writes code without asking design questions. | On Claude Code, the bootstrap did not load. Start a new session or run `/clear`, which reruns the session-start hook. On Codex there is no hook, so say "use the brainstorming skill". |
| The agent does not follow a playbook's steps. | Name the playbook, as in "use the bug-fix playbook". Sessions did not open one on their own for a plain bug report. |
| On Codex, `subagent-driven-development` works inline or reports that it cannot dispatch. | Set `multi_agent = true` under `[features]` in `~/.codex/config.toml`. |
| On Codex, the step list appears in the replies, not in a plan tool. | `update_plan` exists only when `~/.codex/config.toml` sets `tools.update_plan.enabled = true`. Without it, the list in the reply is the intended fallback. |
| On Codex, the report says the agent dispatched `worker`, not `zed`. | The roles are absent or you declined the install. Say yes the next time the agent asks, or copy `agents/codex/*.toml` into `.codex/agents/`. |
| The PR step records `skip: comment-sicko not available`. | The session does not list `comment-sicko` as an agent type. The evals saw the same on Claude Code, so review the diff's comments yourself. |

## Where to go next

- [Feature workflow](feature-workflow.md) for who owns each artifact, and the full [feature artifact contract](../skills/using-text2prod/references/feature-artifacts.md).
- [The bootstrap skill](../skills/using-text2prod/SKILL.md) for The Rule, the playbook table, and the autonomy rules.
- [The principles index](../skills/principles/SKILL.md) for all 24 principles.
- [Codex tool notes](../skills/using-text2prod/references/codex-tools.md) for multi-agent setup, model routing, and the delegate role install.
- [The pstack migration spec](features/pstack-migration/spec.md) for the eval results quoted in this guide.
