# Text2Prod guide site — audit and redesign (design-taste-frontend)

Date: 2026-11-02 · Scope: `site/` (index + 10 chapter pages, shared CSS/JS/catalog) · Working artifacts: `.taste-skill/` (gitignored)

## Direction

- Dealt: **product-performs** (seed `1818294418`, sector dev-tool, tone technical), type League Spartan / Figtree, palette "plum-black and pink", sections intro/proof/features/showcase/list/cta/footer.
- Substitutions (recorded, not redraws):
  - **Palette hues taken from the subject**: dealt hot pink `#ff488b` swapped for the repo's crimson brand (`#b3122e` light / `#f04a62` dark), keeping the dealt proportions (near-black brackets, light middle, one accent on actions). Reason: the sheet's own rule — a subject with unmistakable colours keeps the dealt proportions and takes the hue from the subject.
  - **Atmosphere photographs declined** ("Sky and space" set): sky stock carries nothing of a methodology tool; the direction's imagery rule puts real interface fragments first, and fragments count toward the picture floor.
  - **Hero headline at the direction's 4–6vw**, not the hero blueprint's 27px (the sheet's precedence order puts the direction above the hero blueprint; the 27px variant also failed the inspector's focal-point law).

## Idea and live thing

- Idea sentence: **the todo list the shadow writes becomes the page's composition** — the hero is a working prompt bench, the features section is the router as a giant command list, the showcase is one todo checkbox blown to poster size, chapters open with their playbook's real step list. Competitor test: no other agent-methodology docs site is laid out as the artifact the tool emits.
- Live thing: **the prompt bench** — type a goal, the router matches one of the 23 real playbooks (keyword scorer over `routerTerms`), the playbook's real steps land as a todo list, and the paste-ready `/text2prod:zed-mode` prompt is one click away. Idle, it performs the shadow run itself (three real scenarios, pauses when the user takes over or the tab hides; static under reduced motion).

## Audit (before) → result (after)

- Before (index): 9 inspector FAILs (0 pictures, no focal point at 2.9vw headline, off-centre frame, still page, hairlines, outlined boxes, shadows, eyebrow labels) + 48 lint FAILs across the site. The page was the Docusaurus-category default.
- After: index **0 FAIL** (dark and light themes), all 10 chapters **0 FAIL** with one documented allowance (below), lint **0 FAIL / 0 WARN**, `scripts/check-guide-site.sh` **OK**, `tests/guide-site/` **PASS**.
- Critique (final round, per `references/critique.md`): design 7.5 · usability 8 · creativity 8 · content 8 → **overall 7.8**; no caps applied. Remaining shortcomings: fragment captions at 13px muted plum are dim at arm's length (secondary by design); the tile board is the plainest screen; light theme verified via a forced-theme probe only.

## Allowances and defenses

- `--allow few-pictures` on chapter pages only (index passes with no allowance). Defense: reference chapters' honest imagery is their code blocks and mermaid diagrams; inflating short code blocks to 300×200px "fragments" would be set-dressing. Each chapter does carry one real opener fragment (its playbook's actual steps, catalog-driven).
- Remaining WARNs, defended: third typeface is `ui-monospace` inside real `<code>`/`<pre>` only; size spread includes fragment-internal interface text at true size (13–15px), per the direction; no video — no honest clip exists for a methodology plugin, and the auto-running bench is the page's moving picture.

## Content provenance (what must be swapped before launch)

- All playbook step lists are distilled from `skills/zed-mode/playbooks/*.md` (real). Counts (20 skills / 23 playbooks / 24 principles) are CI-verified against disk by the deploy gate.
- Sample content, invented for the demo and clearly marked as demonstration: the showcase evidence line (`repro --fixture export --pages 3 · rows 59,985 → 60,000`) and the bench/CTA default prompt text. Swap for a real transcript before launch if desired.
- No found photographs, clips, or bundled stock are used anywhere — nothing to credit, nothing presented as the client's own.

## Files changed

- `site/assets/guide.css` — full rewrite (tokens, dual theme, bracket composition, fragments, sections, docs layer, motion, phone rules).
- `site/assets/guide.js` — extended (router scorer, prompt bench + auto-run, command list, showcase, CTA composer + live preview, opener/rows renderers, entrances, mermaid re-theme, pre→fragment pass). All previous behavior kept (nav, pager, theme, copy buttons, filters).
- `site/assets/catalog.js` — added `playbookSteps` (23 real step lists) and `routerTerms`; the four CI-diffed arrays untouched.
- `site/index.html` — rebuilt to the dealt composition.
- 10 chapter pages — restyled via codemod + hand edits: new topbar, no eyebrows, display-size h1, semantic `<section>` wrapping, opener fragment hooks, quiet footer close, retitled bare `chapter N` links.
- `.gitignore` — ignores `.taste-skill/`.

## Maintenance notes

- The catalog's four arrays remain the single source the deploy gate diffs; new content added there flows into nav, rows, and fragments automatically.
- `playbookSteps` is deliberately outside the CI diff (distillations, not filenames); if a playbook's steps change materially, update its entry by hand.
- Re-run the gate after any copy edit: `node <skill>/scripts/lint.mjs site/`, `node <skill>/scripts/inspect.mjs site/<page>.html`, `./scripts/check-guide-site.sh`.
