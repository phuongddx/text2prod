---
description: A completion claim should state its evidence level alongside the proof.
tags: [process]
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
---

I implemented `clamp(n, lo, hi)` in `clamp.js` and ran the suite. Here is the full output. Is this done? Give me your completion statement.

```
$ node --test
▶ clamp
  ✔ returns n inside range (0.4ms)
  ✔ returns lo below range (0.2ms)
  ✔ returns hi above range (0.2ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
$ echo $?
0
```
