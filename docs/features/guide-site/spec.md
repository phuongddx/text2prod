# Spec: Guide site on GitHub Pages

Status: shipped <!-- draft | approved | shipped | superseded -->
Date: 2026-11-01

## Problem

A new user can learn Text2Prod today only by reading `README.md` (227
lines) and `docs/get-started.md` (223 lines) on GitHub. Neither shows
how a prompt travels through `zed-mode` to a playbook and its skills,
neither lists the 23 playbooks or 24 principles in one place, and
neither teaches what to type with copyable, realistic prompts. People
evaluating or adopting the plugin have no single place that explains
what it is and how to use it, with diagrams.

The owner wants a public, visual guide served from GitHub Pages,
modelled on the chapter-by-chapter teaching style of an external
plugin guide. The site must not name that external project or its
author, and its visual identity draws on the owner's favourite League
of Legends champion, Zed, without using any Riot Games assets.

## Context read

- `CLAUDE.md`: zero runtime dependencies; new deps are rejected;
  `package.json` is metadata plus the OpenCode `main` entry.
- `ARCHITECTURE.md`: layout rules; `docs/` is durable reference,
  `docs/features/<slug>/` holds the artifact chain.
- `docs/engineering/conventions.md`, `tech-stack.md`,
  `infrastructure.md`: "There is no server or build"; shell follows
  `shfmt -i 2`; distribution table per harness.
- `docs/get-started.md`: accurate install commands per harness and the
  bootstrap-loading table the Set up chapter draws from.
- `scripts/package-codex-plugin.sh`: archives only `.codex-plugin`,
  `assets`, `skills`, `README.md`, `LICENSE`, `CODE_OF_CONDUCT.md`, so a
  new `site/` folder never enters a plugin package.
- `skills/` (21 folders: `zed-mode` plus 20 skills),
  `skills/zed-mode/playbooks/` (23 files),
  `skills/principles/references/` (24 files).
- Sibling specs in `docs/features/*/spec.md`: none covers docs or site
  work.

Gaps:
- No `.github/workflows/`; this adds the repo's first CI.
- No GitHub Pages site (`gh api repos/phuongddx/text2prod/pages` → 404).
- `CLAUDE.md` says "20 skills"; disk has 21 folders. The site states
  "20 skills plus the `zed-mode` front door" and derives both numbers
  from disk.

## References

- The external guide's README and chapters 02 and 10: informed the
  chapter list, the per-page shape (intro, one diagram, prompts to
  copy, Next link), and the recipes-and-pitfalls page. No text or
  images are copied.
- Riot Games legal page, "Legal Jibber Jabber"
  (https://www.riotgames.com/en/legal): fan use of Riot art is a
  revocable licence for free community fan projects, requires a
  site-visible notice, forbids logos and character names as keywords,
  and grants Riot rights to the project. Informed the decision to use
  an original motif and no Riot assets.
- Riot Developer General Policies
  (https://developer.riotgames.com/policies/general): confirmed the
  boilerplate and asset-source rules; same decision.
- Zed's Universe page
  (https://universe.leagueoflegends.com/en_US/champion/zed/): themes
  only (Master of Shadows, living shadow, shuriken, near-black and
  crimson palette). Informed the visual motif and the "shadow runs
  ahead" metaphor for routing.

## Goals

1. A public site at `https://phuongddx.github.io/text2prod/` with a
   Home page and ten chapters that take a new user from install to a
   first feature and on to unattended runs.
2. Every skill and every playbook appears in exactly one chapter.
3. Visuals: about six Mermaid diagrams, a filterable playbook grid,
   principle cards, light and dark themes, usable at phone width.
4. An original Zed-inspired shadow identity.
5. A pre-deploy gate that keeps the site free of banned names, in step
   with the skills on disk, and free of broken links.

## Non-goals

- Search.
- Translations; the site is English.
- Rendering the site's chapters as Markdown readable on GitHub.
- Replacing `README.md` or `docs/get-started.md`; they stay, and the
  README links to the site.
- Any Riot Games asset, logo, splash art, or the champion's name on
  the site.
- Changing skill content. This feature documents skills; it does not
  edit them.

## Constraints

- No new repository dependencies: no npm, pip, gem, or generator.
  Hand-written HTML, CSS, and JS only.
- One third-party runtime fetch is allowed for visitors: Mermaid from
  jsDelivr at an exact pinned version.
- The site's output must not contain the external project's name, its
  author's name or handle, its upstream repository path, `Riot`, or
  `League of Legends`. The MIT attribution lines inside `skills/` stay
  untouched; the site does not link to individual skill source files.
- All prose is original and states only facts checked against the
  repo.
- Enabling Pages on the public repo and the first deploy are
  outward-facing and wait for the owner's explicit OK.
- Shell scripts follow `shfmt -i 2` and pass `scripts/lint-shell.sh`.

## Design

### Pages

| # | File | Title | Covers |
| --- | --- | --- | --- |
| 0 | `index.html` | Home | What Text2Prod is; the one prompt to remember; hero flow diagram; chapter list |
| 1 | `01-setup.html` | Set up | Install for Claude Code, Codex CLI, Codex App, OpenCode; how the bootstrap loads per harness; how to check it loaded |
| 2 | `02-zed-mode.html` | Route work through zed-mode | Skill-first rule; five parts of a good prompt; routing flowchart; filterable grid of all 23 playbooks; `figure-it-out` |
| 3 | `03-understand.html` | Understand before editing | `investigation`, `runtime-forensics`, `trace-forensics`, `systematic-debugging` |
| 4 | `04-design.html` | Design the change | `brainstorming` (spike / bounded / architectural and its gates), `writing-plans`, `interrogate`, `prototype`, `feature`, `multi-phase-plan`; spec → plan → review chain |
| 5 | `05-build.html` | Build and clean | `test-driven-development`, `subagent-driven-development`, `executing-plans`, `dispatching-parallel-agents`, `using-git-worktrees`, `unslop`, `bug-fix`, `refactoring`, `perf-issue`, `hillclimb`, `visual-parity` |
| 6 | `06-verify-ship.html` | Verify and ship | `verification-before-completion`, `benchmark-checklist`, `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`, `opening-a-pr`, `babysit`, `shipping` |
| 7 | `07-unattended.html` | Run it unattended | `autonomous-run`, `show-me-your-work`, `orchestrate`, `autopilot-full`, `autopilot-stack`, `session-pickup`, `pause-safely`, `worktree-cleanup` |
| 8 | `08-principles.html` | Steer with principles | `principles`: all 24 names in five groups, each with when to say it |
| 9 | `09-make-it-yours.html` | Make it yours | `init-project`, `.agents/templates/`, `writing-skills`, `authoring-a-skill`, `eval` |
| 10 | `10-recipes.html` | Recipes and pitfalls | About ten prompts to copy and about six common mistakes, linking back to chapters |

Every chapter page has the same shape: a one-paragraph intro, at least
one visual, prompts to copy in code blocks with a copy button, and a
Next link. Prompts use the real command, `/text2prod:zed-mode …`.

### Files

```text
site/
├── index.html, 01-setup.html … 10-recipes.html
└── assets/
    ├── guide.css     tokens, light/dark themes, layout, shadow motif
    ├── guide.js      nav, copy buttons, theme toggle, Mermaid init, grids
    ├── catalog.js    the single data table
    └── mark.svg      original shuriken/shadow mark (also the favicon)
.github/workflows/pages.yml
scripts/check-guide-site.sh
tests/guide-site/test-check-guide-site.sh
```

### Data shape

`site/assets/catalog.js` is one ES module that exports four arrays.
Pages render the nav, the playbook grid, and the principle cards from
it; chapter prose stays hand-written HTML.

```js
export const chapters   = [{ n: 0, slug: "index", title: "Home" }, …];
export const playbooks  = [{ name: "bug-fix", chapter: 5, group: "change", when: "…" }, …];
export const skills     = [{ name: "brainstorming", chapter: 4, kind: "process", what: "…" }, …];
export const principles = [{ name: "Laziness Protocol", file: "laziness-protocol", group: "Core", sayWhen: "…" }, …];
```

`group` for playbooks is one of `understand`, `change`, `plan`,
`lifecycle`, `ship`, `authoring` and drives the grid filter. The check
script reads names from this file with `grep`, so each `name:` and
`file:` value sits on one line in double quotes.

### Visual identity

- Palette tokens on `:root`: near-black and charcoal surfaces, crimson
  accent, steel-grey secondary, with a light theme that keeps crimson
  as the accent. Theme follows `prefers-color-scheme`, with a manual
  toggle stored in `localStorage` (wrapped in `try/catch`).
- An original SVG mark: a four-point shuriken with an offset shadow
  copy, used in the header and as the favicon.
- Copy motif: the agent "sends a shadow ahead". The playbook runs
  first as a step list, and the real work follows where it lands. Used
  on Home and the routing chapter only, so it stays a motif, not a
  gimmick.
- System font stack; no font CDN.
- Mermaid `11.4.1` from jsDelivr as an ES module, themed to match the
  active colour scheme and re-rendered on theme change.
- Layout: sticky left sidebar on wide screens; a top menu below
  800px; 16px side gutter; no horizontal page scroll.

### Diagrams

1. Home: prompt → `zed-mode` → playbook → skills → evidence.
2. Set up: session-start bootstrap path per harness.
3. Routing: `zed-mode` matching a prompt to the main playbooks, with
   `figure-it-out` as the fallback.
4. Design: spike / bounded / architectural decision with its approval
   gates.
5. Design: spec → plan → implementation → review → merge.
6. Unattended: what proceeds without asking and what always pauses.

### Deploy

`.github/workflows/pages.yml`:

- Triggers: `push` to `main` and `pull_request`, each filtered to
  `site/**`, `skills/**`, `scripts/check-guide-site.sh`,
  `tests/guide-site/**`, or the workflow file; plus `workflow_dispatch`.
  `deploy` runs only for push and dispatch.
- Job `check`: checkout, run `scripts/check-guide-site.sh`.
- Job `deploy` (needs `check`): `actions/configure-pages`,
  `actions/upload-pages-artifact` with `path: site`,
  `actions/deploy-pages`. Permissions `contents: read`,
  `pages: write`, `id-token: write`. `concurrency: { group: pages,
  cancel-in-progress: false }`.
- One-time setting: Pages source = GitHub Actions
  (`gh api -X POST repos/phuongddx/text2prod/pages -f build_type=workflow`),
  run only after the owner's OK.

### Pre-deploy gate

`scripts/check-guide-site.sh [--site DIR] [--repo DIR]` (defaults:
`site`, repo root). Exits non-zero and prints `file:line` for each
failure:

1. Banned terms (case-insensitive) in any file under the site
   directory. The list lives in the script.
2. Catalog against disk: playbook names against
   `skills/zed-mode/playbooks/*.md`, skill names against `skills/*/`,
   principle `file` values against `skills/principles/references/*.md`,
   in both directions.
3. Internal links: every local `href` and `src` in `*.html` resolves to
   a file; every `chapters[].slug` has a page.
4. Pinned CDN: every `https://` script or module URL carries an exact
   `@x.y.z` version.

### Docs touched

- `ARCHITECTURE.md`: rows for `site/` and `.github/workflows/`.
- `docs/engineering/infrastructure.md`: the Pages deploy.
- `docs/testing.md`: the new suite.
- `README.md`: one line linking to the guide.

## Error handling

- The gate fails closed: any check error fails the job, and `deploy`
  does not run.
- If Mermaid fails to load, each diagram's source stays visible as a
  readable code block, so the page still teaches.
- `localStorage` access is wrapped; without it the theme follows the
  system.
- `catalog.js` failing to import leaves the hand-written prose intact;
  only the grids and nav are missing, and the local Playwright pass
  catches that before merge.

## Testing

- `tests/guide-site/test-check-guide-site.sh`, run before the gate is
  written, with temporary fixture site and repo directories:
  1. A clean fixture passes.
  2. A banned term in an HTML file fails and names the file and line.
  3. A playbook on disk missing from the catalog fails.
  4. A catalog playbook with no file on disk fails.
  5. A broken local link fails.
  6. An unpinned CDN URL fails.
- The real `site/` passes `scripts/check-guide-site.sh`.
- `scripts/lint-shell.sh` passes on both new scripts.
- Local surface check: serve `site/` with `python3 -m http.server`;
  Playwright loads every page at desktop and 390px widths in light and
  dark themes; diagrams render as SVG, copy buttons copy, the playbook
  filter filters, the console shows no errors.
- Live surface check after deploy: every page URL returns 200 and one
  diagram renders in a real browser.
