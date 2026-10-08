# Repository Guidelines

## Project Overview

Text2Prod is a zero-dependency, multi-harness plugin distributing a software-development methodology to coding agents (Claude Code, Codex App, Codex CLI) as composable skills plus session-start hooks. It implements the AI-native SDLC loop: `spec.md → plan.md → implementation → review.md → merge`, with intent folded into `spec.md`'s `## Problem` section (since v0.0.3, `spec.md` is the only design artifact). Skills and hooks are the product; everything else is wiring, tests, or working artifacts. Fork of upstream at `v0.0.1`.

## Architecture & Data Flow

Session start → `hooks/hooks.json` → `hooks/run-hook.cmd` (Windows/Unix polyglott) → `hooks/session-start` injects the `skills/using-text2prod` bootstrap, which makes the other skills auto-trigger at the right moments. Packaging (`scripts/package-codex-plugin.sh`) git-archives `HEAD` (`.codex-plugin`, `assets`, `skills`, `README/LICENSE/CODE_OF_CONDUCT`), seeds `skills/*/agents/openai.yaml` from a prior official package, and emits a deterministic rootless zip/tar.gz.

## Key Directories

- `skills/` — the product: 15 general-purpose skills (`brainstorming`, `writing-plans`, `test-driven-development`, `systematic-debugging`, `subagent-driven-development`, `init-project`, …)
- `hooks/` — session-start wiring; hook scripts are extensionless on purpose (Windows auto-detection)
- `.claude-plugin/`, `.codex-plugin/` — packaging adapters only, never logic
- `.opencode/` — OpenCode V2 in-process plugin (`plugins/text2prod.js`): registers skills via `ctx.skill.transform`, injects the bootstrap via `ctx.session.hook("context")`; entrypoint declared by root `package.json` `main`
- `.agents/` — this repo's own agent layer: `skills/`, `policies/`, `hooks/`, `templates/`
- `tests/` — plugin-infrastructure tests (bash/node/python)
- `docs/` — durable reference; `docs/features/<slug>/` — per-feature artifact chain (`spec.md → plan.md → review.md`); `plans/` — historical artifacts only, new work goes in `docs/features/`; `evals/` — separate drill repo (gitignored)

## Development Commands

- Version: `scripts/bump-version.sh <X.Y.Z> | --check | --audit` — keeps 4 manifests in sync (`package.json`, both plugin manifests, marketplace)
- Lint: `scripts/lint-shell.sh [--all] [--format] [files…]` — ShellCheck + syntax, changed files by default; `--format` runs shfmt (`-i 2` style)
- Package: `scripts/package-codex-plugin.sh` (requires clean tree or `--allow-dirty`; needs prior package as metadata seed)
- Tests: no repo-level `npm test` (package.json has no scripts — ignore stale mentions in README/docs). Run per-directory suites: `tests/feature-artifacts/run-all.sh`, `tests/explicit-skill-requests/run-all.sh`, `tests/claude-code/run-skill-tests.sh`, `tests/version-bump/test-bump-version.sh`, `tests/codex/test-*.sh`, `tests/opencode/run-tests.sh`; brainstorm-server suite under `tests/brainstorm-server/`

## Code Conventions & Common Patterns

Zero runtime dependencies — new deps are rejected. Skills are behavior-shaping code, not prose: content edits require eval evidence (`text2prod-evals`) and `skills/writing-skills`. Shell scripts follow `shfmt -i 2` style. Tests derive expectations from source manifests (e.g. marketplace version comes from `package.json`) so version bumps cannot break them.

## Important Files

`ARCHITECTURE.md` (layout rules), `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.version-bump.json` (declared version files + audit excludes), `docs/testing.md`, `docs/feature-workflow.md` (feature artifact chain; full contract in `skills/using-text2prod/references/feature-artifacts.md`), `docs/porting-to-a-new-harness.md`.

## Runtime/Tooling Preferences

Bash (macOS/Linux) with a Windows polyglott fallback; `jq` required for version/packaging scripts; `shellcheck`/`shfmt` for lint; Python evals use `uv` inside the separate `evals/` clone. No package-manager runtime — `package.json` is metadata plus the OpenCode plugin `main` entrypoint.

## Testing & QA

Plugin tests live in `tests/` and run via the relevant `run-*.sh` or per-script invocation; there is no repo-level `npm test` script. Skill-behavior evals are real LLM sessions driven by drill in the separate `text2prod-evals` repo. Pre-commit hooks only cover `evals/*.py` when that clone exists.

## Commit & Pull Request Guidelines

Commits: imperative subject lines (e.g. `Release v0.0.1: reset fork version…`), atomic, one concern. Tag releases `vX.Y.Z` after `bump-version.sh --audit` and targeted tests pass. PRs target `main` (not `dev` — README's dev-branch instruction is stale upstream prose), fill every template section with real answers, disclose model/harness/plugins and the human who reviewed the full diff, cite prior open+closed PRs, and solve one experienced problem — no new dependencies, no bundled unrelated changes, no speculative fixes. New-harness PRs require a session transcript proving the bootstrap auto-triggers.
