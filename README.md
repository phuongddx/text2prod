# Text2Prod

Text2Prod is a complete software development methodology for your coding agents, built on top of a set of composable skills and some initial instructions that make sure your agent uses them.

## Table of Contents

- [How it works](#how-it-works)
- [Getting Started](#installation)
  - [Claude Code](#claude-code)
  - [Antigravity](#antigravity)
  - [Codex App](#codex-app)
  - [Codex CLI](#codex-cli)
  - [Cursor](#cursor)
  - [Devin CLI](#devin-cli)
  - [Factory Droid](#factory-droid)
  - [Gemini CLI](#gemini-cli)
  - [GitHub Copilot CLI](#github-copilot-cli)
  - [Grok Build CLI](#grok-build-cli)
  - [Kimi Code](#kimi-code)
  - [OpenCode](#opencode)
  - [Pi](#pi)
  - [Hermes Agent](#hermes-agent)
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

### Antigravity

Install Text2Prod as a plugin from this repository:

```bash
agy plugin install https://github.com/phuongddx/text2prod
```

Antigravity runs the plugin's session-start hook, so Text2Prod is active from
the first message. Reinstall with the same command to update.

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

### Cursor

- In Cursor Agent chat, install from marketplace:

  ```text
  /add-plugin phuongddx/text2prod
  ```

- Or search for "text2prod" in the plugin marketplace.

### Devin CLI

- Install the plugin from this repository:

  ```bash
  devin plugins install phuongddx/text2prod
  ```

- Update to the latest version with:

  ```bash
  devin plugins update text2prod
  ```

### Factory Droid

- Register the marketplace:

  ```bash
  droid plugin marketplace add https://github.com/phuongddx/text2prod
  ```

- Install the plugin:

  ```bash
  droid plugin install text2prod@text2prod
  ```

### Gemini CLI

- Install the extension:

  ```bash
  gemini extensions install https://github.com/phuongddx/text2prod
  ```

- Update later:

  ```bash
  gemini extensions update text2prod
  ```

### GitHub Copilot CLI

- Register this repository as a marketplace:

  ```bash
  copilot plugin marketplace add phuongddx/text2prod
  ```

- Install the plugin:

  ```bash
  copilot plugin install text2prod@text2prod-dev
  ```

### Grok Build CLI

Text2Prod is not yet in xAI's official marketplace.

- Install from this repository once it is registered as a Grok plugin source,
  or package it locally from a clone of this repository.

### Kimi Code

Install Text2Prod directly from this repository:

- Use Kimi Code's plugin manager:

  ```text
  /plugins
  ```

- Or install directly from this repository:

  ```text
  /plugins install https://github.com/phuongddx/text2prod
  ```

- Detailed docs: [docs/README.kimi.md](docs/README.kimi.md)

### OpenCode

OpenCode uses its own plugin install; install Text2Prod separately even if you
already use it in another harness.

- Tell OpenCode:

  ```
  "plugin": ["text2prod@git+https://github.com/phuongddx/text2prod.git"]
  ```

- Detailed docs: [docs/README.opencode.md](docs/README.opencode.md)

### Pi

Install Text2Prod as a Pi package from this repository:

```bash
pi install git:github.com/phuongddx/text2prod
```

For local development, run Pi with this checkout loaded as a temporary package:

```bash
pi -e /path/to/text2prod
```

The Pi package loads the Text2Prod skills and a small extension that injects the `using-text2prod` bootstrap at session startup and again after compaction. Pi has native skills, so no compatibility `Skill` tool is required. Subagent and task-list tools remain optional Pi companion packages.

### Hermes Agent

Install Text2Prod as a Hermes plugin from this repository:

```bash
hermes plugins install phuongddx/text2prod --enable
```

Restart any active Hermes sessions after installing. Note: Hermes has no
post-compaction hook, so a very long session that compacts over its first
turn loses the bootstrap — start a fresh session if skills stop triggering.

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
