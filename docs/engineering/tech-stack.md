# Tech Stack

| Layer | Technology | Where |
| --- | --- | --- |
| Product | Markdown skills with YAML frontmatter | `skills/*/SKILL.md` |
| Hooks | Bash, plus a Windows/Unix polyglot `.cmd` launcher | `hooks/` |
| Helper scripts | Bash; Node CommonJS for the brainstorm server | `scripts/`, `skills/*/scripts/`, `skills/brainstorming/scripts/server.cjs` |
| Manifests | JSON | `package.json` (metadata only), `.claude-plugin/`, `.codex-plugin/`, `.version-bump.json` |
| Tests | Bash with inline `python3` checks; plain `node` scripts; live `claude` CLI runs | `tests/` |
| Plugin evals | `claude plugin eval` case files (Markdown) | `plugin-evals/` |

## Package and runtime managers

None for the product. `package.json` has no scripts or dependencies. Test
tooling:

- `npm` only for `tests/brainstorm-server/` (`cd tests/brainstorm-server && npm test`)
- `uv` only inside the separate `evals/` clone (`.pre-commit-config.yaml` runs ruff and ty on `evals/*.py`)

## Required tools

| Tool | Needed by |
| --- | --- |
| `bash`, `git` | everything |
| `jq` | `scripts/bump-version.sh`, `scripts/package-codex-plugin.sh` |
| `yq` | `bump-version.sh`, only for YAML manifests |
| `shellcheck`, `shfmt` | `scripts/lint-shell.sh` |
| `tar`, `gzip`, `shasum`, `zip`/`unzip` | `scripts/package-codex-plugin.sh` |
| `node` | brainstorm server and its tests |
| `claude` CLI | live skill tests, `claude plugin eval` |
