# Upstream Scrub Report: obra / superpowers removal

Date: 2026-09-14 · Repo: `/Users/ddphuong/Projects/get-prod-done`

## Result

**Zero `obra` / `superpowers` / upstream-brand references remain** (case-insensitive repo-wide grep). Only 2 intentional exceptions: guard assertions inside `tests/brainstorm-server/branding.test.js` that *enforce* absence of upstream links/assets.

## Removed (quarantined to `/tmp/text2prod-upstream-scrub-260914/`)

- `RELEASE-NOTES.md` — 94KB upstream history
- `docs/plans/` — 2025 upstream plan history
- `docs/text2prod/{plans,specs}/` — upstream design history (2 fixture files restored for `test-worktree-path-policy.sh`; verified ref-free)
- `.github/FUNDING.yml` — funded upstream author
- `.github/ISSUE_TEMPLATE/` — linked upstream repos
- `.opencode/INSTALL.md` — installed from upstream repo
- `scripts/sync-to-codex-plugin.sh` + `tests/codex-plugin-sync/` — upstream sync tooling
- Old rebrand report (contained kept-refs documentation)

## Edited

- **Manifests**: dropped `homepage` / `repository` / `websiteURL` / `author.url` fields pointing upstream (codex, claude, cursor, kimi, devin); `.hermes-plugin` author → `text2prod`; install refs → local `./`
- **`server.cjs`**: fixed broken `SUPERPOWERS_BRAND_IMAGE_URL` const (rename bug from previous pass); branding now local text-only `Text2Prod vX.Y.Z`, no remote logo, no upstream link, no Prime Radiant strings
- **`branding.test.js`**: rewritten for text-only branding + upstream-absence guard assertions
- **`README.md`** (21 edits): marketplace install commands → local-install notes; Commercial Services + upstream credits/signup removed
- **`docs/README.{opencode,kimi}.md`**: upstream git URLs → `text2prod@file:./` / `./`
- **`docs/porting-to-a-new-harness.md`**, **`docs/testing.md`**, **`CODE_OF_CONDUCT.md`** (neutral contact), skill/test env-var + prose refs

## Verification

- 9/9 JSON manifests valid ✓
- shell-lint PASS · session-start hooks PASS · codex marketplace manifest PASS · worktree-path-policy PASS ✓
- brainstorm-server branding: 7/7 PASS ✓
- `LICENSE` kept intact (MIT attribution, legally required on distribution)

## Unresolved Questions

- Publish target repo URL? Manifests intentionally have no `homepage`/`repository` until then.
- `git init` still recommended — no version control in this folder.
