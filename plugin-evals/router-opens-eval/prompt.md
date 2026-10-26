---
description: A request to find out whether a skill rewording changes agent behavior should open the eval playbook.
tags: [zed-parity, router]
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

I reworded the description and the first section of our `requesting-code-review` skill so agents stop asking for review before they have run the checks. Before I merge the new wording, I want evidence that agents actually behave differently with it, not just my read of the diff. Can you set that up?
