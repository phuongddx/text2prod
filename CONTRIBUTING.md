# Contributing to Text2Prod

Thanks for your interest in contributing! Text2Prod is an open, MIT-licensed
plugin — issues and pull requests are welcome.

## Ground rules

- **One problem per PR** — small, focused changes get reviewed faster.
- **Describe the real problem** you hit, not just the change you made.
- **Test on at least one harness** and report results in your PR.
- Keep the plugin **zero-dependency** — no third-party runtime deps.

## Workflow

1. Fork the repo, create a branch off `dev`.
2. Make your change; run the relevant tests under `tests/`.
3. Open a PR against `dev` (not `main`) using the PR template in
   `.github/PULL_REQUEST_TEMPLATE.md`.
4. Disclose if AI tooling helped produce the change, and which environment.

For feature-sized changes, follow the artifact chain in [`docs/feature-workflow.md`](docs/feature-workflow.md).

## Licensing

By contributing, you agree your contributions are licensed under the MIT
`LICENSE` in this repository.
