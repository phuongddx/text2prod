# Infrastructure

## Runtime

There is no server or build. The product runs inside the user's agent
harness:

- **Claude Code** loads `skills/` and `hooks/hooks.json`. On
  `startup|clear|compact`, `hooks/run-hook.cmd session-start` (a
  Windows/Unix polyglot) runs `hooks/session-start`, which injects
  `skills/using-text2prod/SKILL.md` as session context.
- **Codex** loads `skills/` via `.codex-plugin/plugin.json`
  (`"hooks": {}`, so there is no session-start injection).

## Distribution

| Target | Mechanism |
| --- | --- |
| Claude Code | GitHub marketplace `phuongddx/text2prod`: `.claude-plugin/marketplace.json`, marketplace `text2prod`, plugin `text2prod@text2prod` |
| Codex CLI | Same repo added as a git marketplace (`codex plugin marketplace add https://github.com/phuongddx/text2prod.git`, then `codex plugin add text2prod@text2prod`) |
| Codex App portal | Archive from `scripts/package-codex-plugin.sh` (needs a prior official package as the `agents/openai.yaml` metadata seed) |

Users only receive a new release when `version` changes, so bump it
with `scripts/bump-version.sh <X.Y.Z>`.

## Release

1. `scripts/bump-version.sh <X.Y.Z>`, then `scripts/bump-version.sh --audit`
2. Run the targeted tests (see `docs/testing.md`)
3. Tag `vX.Y.Z` (only `v0.0.1` exists today)

No release automation is configured.

## CI

Not configured. `.github/` holds only `PULL_REQUEST_TEMPLATE.md`. All
tests and evals run locally.

## Evals

- **Plugin evals:** `claude plugin eval . --eval-dir plugin-evals --allow-tools Write Edit --threshold 0.8`.
  These are real model calls billed to the runner. Results go to
  `plugin-evals/results/` (gitignored).
- **Drill harness:** lives in a separate `text2prod-evals` clone under
  `evals/` (gitignored); see `docs/testing.md`.
