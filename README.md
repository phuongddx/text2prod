# Text2Prod

Text2Prod is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

![AI-native SDLC lifecycle](assets/ai-native-sdlc-loop.png)

*Text2Prod implements the AI-native SDLC loop — [concept by Anthropic](https://claude.com/blog/the-ai-native-sdlc-playbook).*

## Table of Contents

- [How it works](#how-it-works)
- [Getting Started](#installation)
  - [Claude Code](#claude-code)
  - [Codex App](#codex-app)
  - [Codex CLI](#codex-cli)
- [The Basic Workflow](#the-basic-workflow)
- [Community](#community)
- [What's Inside](#whats-inside)
- [Philosophy](#philosophy)
- [Contributing](#contributing)
- [Updating](#updating)
- [License](#license)
- [Visual companion telemetry](#visual-companion-telemetry)

## How it works

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do. 

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest. 

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY. 

Next up, once you say "go", it launches a *subagent-driven-development* process, having agents work through each engineering task, inspecting and reviewing their work, and continuing forward. It's not uncommon for your agent to work autonomously for a couple hours at a time without deviating from the plan you put together.

There's a bunch more to it, but that's the core of the system. And because the skills trigger automatically, you don't need to do anything special. Your coding agent just has Text2Prod.

## The AI-Native SDLC Workflow

Text2Prod operationalizes the [AI-native SDLC](https://claude.com/blog/the-ai-native-sdlc-playbook):
instead of a linear handoff pipeline, every stage commits an artifact the next
stage reads, and the loop closes when production findings become new intent.

```text
intent.md → spec.md → plan.md → implementation → review.md → deploy
     ↑                                                          │
     └──────────── production findings restart the loop ────────┘
```

| Stage | Text2Prod piece |
| --- | --- |
| Plan | `brainstorming` — interrogates intent, produces the design (`intent.md` → `spec.md`) |
| Design | standards encoded as skills; flagged concerns resolved while the spec is written |
| Build | `writing-plans` → `plan.md`, then `subagent-driven-development` / `executing-plans` |
| Test | `test-driven-development` + `verification-before-completion`; sessions verify their own work |
| Deploy | `requesting-code-review` → severity-ranked findings; `finishing-a-development-branch` |
| Maintain | findings and incidents written back as new `intent.md` — the loop restarts |

**Project onboarding.** In any repo without the structure, feature work triggers a
one-time offer to scaffold it (`ARCHITECTURE.md`, `.agents/`, `docs/features/`,
artifact templates). For explicit first-time onboarding — including a researched
root `AGENTS.md` — say *"init/onboard this project"* and the `init-project` skill
explores the whole codebase first, then generates everything. Existing
`AGENTS.md`/`CLAUDE.md`/`GEMINI.md` files are never modified.

See [docs/feature-workflow.md](docs/feature-workflow.md) for the artifact chain
and [ARCHITECTURE.md](ARCHITECTURE.md) for the repo's layout model.

## Installation

Installation differs by harness. If you use more than one, install Text2Prod separately for each one.

### Claude Code

Text2Prod is installed from this repository's marketplace:

- Register the repository as a marketplace:

  ```bash
  /plugin marketplace add phuongddx/text2prod
  ```

- Install the plugin:

  ```bash
  /plugin install text2prod@text2prod-dev
  ```

### Codex App

Text2Prod is not yet in the official Codex plugin marketplace.

- Build a portal archive locally with `scripts/package-codex-plugin.sh`
  (see the script header for options; it needs a prior official package as
  metadata seed), then upload it via the Codex portal.

### Codex CLI

Text2Prod is not yet in the official Codex plugin marketplace.

- Clone this repository and package it locally with
  `scripts/package-codex-plugin.sh`, or open the search interface:

  ```bash
  /plugins
  ```

- Search for Text2Prod:

  ```bash
  text2prod
  ```

- Select `Install Plugin`.

## The Basic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.

2. **using-git-worktrees** - Activates after design approval. Creates isolated workspace on new branch, runs project setup, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

4. **subagent-driven-development** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with two-stage review (spec compliance, then code quality), or executes in batches with human checkpoints.

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass, commit. Deletes code written before tests.

6. **requesting-code-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

7. **finishing-a-development-branch** - Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## Community

- **Discord**: [Join us](https://discord.gg/35wsABTejz) for community support, questions, and sharing what you're building with Text2Prod
- **Issues**: track them locally in this fork

## What's Inside

### Skills Library

**Testing**
- **test-driven-development** - RED-GREEN-REFACTOR cycle (includes testing anti-patterns reference)

**Debugging**
- **systematic-debugging** - 4-phase root cause process (includes root-cause-tracing, defense-in-depth, condition-based-waiting techniques)
- **verification-before-completion** - Ensure it's actually fixed

**Collaboration** 
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Batch execution with checkpoints
- **dispatching-parallel-agents** - Concurrent subagent workflows
- **requesting-code-review** - Pre-review checklist
- **receiving-code-review** - Responding to feedback
- **using-git-worktrees** - Parallel development branches
- **finishing-a-development-branch** - Merge/PR decision workflow
- **subagent-driven-development** - Fast iteration with two-stage review (spec compliance, then code quality)

**Meta**
- **writing-skills** - Create new skills following best practices (includes testing methodology)
- **using-text2prod** - Introduction to the skills system

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success

Read [the original release announcement](https://blog.fsck.com/2025/10/09/text2prod/).

## Contributing

The general contribution process for Text2Prod is below. Keep in mind that we don't generally accept contributions of new skills and that any updates to skills must work across all of the coding agents we support.

1. Fork the repository
2. Switch to the 'dev' branch
3. Create a branch for your work
4. Follow the `writing-skills` skill for creating and testing new and modified skills
5. Submit a PR, being sure to fill in the pull request template.

Skill-behavior tests use the drill eval harness from [text2prod-evals](https://github.com/prime-radiant-inc/text2prod-evals/), cloned into `evals/` — see `evals/README.md` for setup. Plugin-infrastructure tests live at `tests/` and run via the relevant `run-*.sh` or `npm test`.

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Text2Prod updates are somewhat coding-agent dependent, but are often automatic.

## License

MIT License - see LICENSE file for details

## Visual companion telemetry

Because skills and plugins don't provide any feedback to creators, we have no idea how many of you are using Text2Prod. By default, the Prime Radiant logo on brainstorming's optional visual companion feature is loaded from our website. It includes the version of Text2Prod in use. It does not include any details about your project, prompt, or coding agent. We don't see your clicks or anything about what you're building. This helps us have a rough idea of how many folks are using Text2Prod and which version of Text2Prod they're using. It's 100% optional. To disable this, set the environment variable `TEXT2PROD_DISABLE_TELEMETRY` to any true value. Text2Prod also honors Claude Code's `DISABLE_TELEMETRY` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` opt-outs.
