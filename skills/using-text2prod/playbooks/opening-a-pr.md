### Opening a PR

Invoked at the end of every other playbook. The mechanics (branch, merge, PR, cleanup decisions, `review.md`) are the `finishing-a-development-branch` skill; this playbook sets the standards it opens the PR to.

**Worktree.** Work from a worktree off `main` (the `using-git-worktrees` skill). Subagents inherit it. A dirty branch with unrelated work: patch out, fresh worktree, apply.

**Commits.** Commit liberally, then rebase into small, ordered commits before opening the PR. Each commit is landable and ordered to tell the story. Amend when the fix belongs in a just-made commit; new commit when separable. Bodies do not restate the subject.

**Comments.** If the session lists `comment-sicko` as an agent type, dispatch it over the diff before review and act on its accepted findings; otherwise record `skip: comment-sicko not available`. Keep only comments that explain a non-obvious *why* the code cannot show; no phase-narrating comments in tests or scripts.

**Titles.** Conventional Commits `type(scope): subject`, no trailing period. Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`. Scope is the area. Subject is short, imperative, and names a real symbol when one carries the change.

**Descriptions.** A one-minute briefing for a reviewer who has the diff. `##` headings in this order; drop a section with nothing to say:

- `## Why`: the problem and approach, 1-3 short sentences.
- `## What changed`: 1-3 bullets. Name a real symbol or path only when it carries the change; name both sides of a rename.
- `## Scope`: always. What it covers and what it deliberately leaves out.
- `## Tradeoffs`: only rejected alternatives a reviewer would otherwise ask about.
- `## Blast Radius`: 1-2 sentences on who or what it touches and why that is safe or risky.
- `## Verification`: 1-3 bullets, each a real run path and its outcome. Perf: one primary number with its unit, `before → after`.

Attach screenshots or recordings when they prove a claim. Long logs, lane recitals, and file-by-file checklists go in a linked artifact, not the body.

**Forge.** Use the GitHub CLI (`gh`) for create, edit, view, and merge; when the harness has a built-in PR tool, create and edit through it and use `gh` for what it does not cover.

**Size and stacks.** Prefer five narrow PRs to one large PR. A stack is a base-branch chain: the root targets `main`, each child targets its parent branch (`gh pr create --base <parent-branch>`); as a parent merges, retarget the child to `main` (`gh pr edit <pr> --base main`) and rebase it per `playbooks/shipping.md`.

**Readiness.** Open every PR ready, not draft, unless the repository's contribution rules say otherwise. Run `gh pr view <number>` before you refer to PR status.

**Babysit.** Opening a PR does not start a babysit. Post the URL and keep building. Run `playbooks/babysit.md` only when the user asks after the whole stack exists.

**Reply:** the PR URL, its title, and the Verification bullets.

_Adapted from pstack's `playbooks/opening-a-pr.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
