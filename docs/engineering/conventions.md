# Conventions

Stable rules that specs and plans are drafted against. Sources are cited;
when docs disagree, current source and config win.

## Skills (`skills/`)

- One directory per skill, kebab-case, usually verb/gerund-first
  (`writing-plans`, `using-git-worktrees`). Entry point is `SKILL.md`;
  helpers sit beside it as `kebab-case.md`; optional `scripts/` and
  `examples/` subdirectories.
- Frontmatter: `name` (matches the directory; letters, numbers, hyphens)
  and `description` (starts "Use when…", triggering conditions only, no
  workflow summary, under 500 characters). See
  `skills/writing-skills/SKILL.md`.
- Skills are behavior-shaping code: content or description edits need
  eval evidence and must go through `text2prod:writing-skills`
  (`CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`).

## Shell

- `#!/usr/bin/env bash`, `set -euo pipefail`, usage comment header,
  quoted `"${VAR}"`, usage errors to stderr with `exit 2`
  (e.g. `hooks/session-start`, `skills/subagent-driven-development/scripts/`).
- Hook and skill helper scripts are extensionless on purpose (avoids
  Claude Code's Windows `.sh` auto-detection).
- Format with `shfmt -i 2 -ci -bn`; lint with
  `scripts/lint-shell.sh [--all] [--format] [--strict]`.
- LF line endings are enforced by `.gitattributes`.

## Dependencies

Zero runtime dependencies (`CONTRIBUTING.md`). The only npm dependency is
the test-only `ws` in `tests/brainstorm-server/package.json`.

## Commits

- Imperative subject lines; releases as `Release vX.Y.Z: …`.
- One concern per commit; PR merges land with a ` (#N)` suffix on a
  linear history.
- Agent-authored commits carry a `Co-Authored-By:` trailer.

## Pull requests

- Branch off and target `main` (`CONTRIBUTING.md`, PR template). There
  is no `dev` branch; older references to it are stale.
- Branch names follow `type/topic` (`docs/…`, `chore/…`, `eval/…`).
- Fill every template section: submitter model/harness/plugins, the
  human who reviewed the full diff, prior open and closed PRs, and
  before/after evaluation. One experienced problem per PR; no new
  dependencies; new-harness PRs need a bootstrap transcript.
- `main` requires one approving review.

## Evals (`plugin-evals/`)

- Run a new eval on the unedited skill first. If the key behaviour
  already passes, drop the idea instead of landing the edit; a fix
  justified by a cited contradiction may keep its eval as a regression
  guard, and says so.
- The eval sandbox blocks `git` (even `git init` fails with "Operation
  not permitted"), so evals cannot observe commits or history.
- `tool_used` with `input_match` reports "called 0x" both for "not
  called" and for "called without the string". Do not infer a cause
  from it.
- Trace files are deleted after a run. Record per-run evidence from the
  `evidence` field of the `--json` output.
