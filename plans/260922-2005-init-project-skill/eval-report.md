# Behavioral eval report — `init-project` skill

Date: 2026-09-22 · Harness: Claude Code 2.1.278 headless (`claude -p --plugin-dir <local checkout>`) · Auth: claude.ai subscription (firstParty) · Model: session default

## Method caveat

Official drill harness (`prime-radiant-inc/text2prod-evals`) is **private/unavailable** (HTTP 404; SSH no access). Equivalent manual protocol used instead: real Claude Code sessions against throwaway git repos, deterministic assertions on resulting trees + SHA-256 immutability checks + transcript review. Single harness, n=1 per scenario — weaker than drill's multi-session adversarial sweep; flagged for any future upstream PR.

## Results

| # | Scenario | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Explicit init, bare repo | **PASS** | full set created (AGENTS.md, ARCHITECTURE.md, .agents/{skills,policies,hooks}/.gitkeep, templates×2, docs/features/.gitkeep); honest `Not configured` sections; **zero invented commands**; report table; no commit; inline-research fallback reasoned |
| 2 | Existing AGENTS.md | **PASS** | SHA-256 before==after; sentinel intact; phase skipped+reported; rest generated; commands **verified by running** (caught broken Makefile + stray file, recorded not "fixed") |
| 3 | Unrelated read-only question | **PASS** | 0 files created; 0 offer mentions; direct answer |
| 4 | Partial structure | **PASS** | existing ARCHITECTURE.md + custom policy SHA unchanged; only gaps filled (skills/hooks .gitkeep, templates, docs/features, AGENTS.md) |

Research-quality criterion (no invented commands) covered by S1+S2. No-fire criterion covered by S3.

## Findings

- **Nit (accepted)**: S2 research executed the test suite, leaving `__pycache__` artifacts — research phase is read-*only* in spirit; running tests is verification but has FS side effects. Future tweak: `PYTHONDONTWRITEBYTECODE=1` guidance or "no side-effect artifacts" rule. Not blocking.
- No Important findings.

## Verdict

**GO** for fork ship. Upstream PR would additionally need the official drill sweep (multi-session, multi-harness).
