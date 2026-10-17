---
description: A repeated correction should route to correcting-repeated-mistakes, which proposes enforcement above prose and does not apply it.
tags: [trigger, process]
max_turns: 15
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

This is the second time I've had to say this: stop hand-editing the version number in README.md. Last week you bumped `package.json` to 1.4.0 and left README at 1.3.2; today you did it again with 1.4.1. Our repo has `package.json`, `README.md` (line 3 says `Version: 1.4.0`), `scripts/bump-version.sh` (rewrites package.json only), and a GitHub Actions workflow in `.github/workflows/ci.yml` that runs `npm test`. Make sure this cannot happen again.
