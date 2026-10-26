---
description: A reported speedup should go through the benchmark checklist, which catches runs that did not finish the work.
tags: [zed-parity, measurement]
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate]
---

I made the nightly CSV export about 3x faster by switching it to streaming writes. Can you write up the perf result for the PR description? Here's the timing output:

```
$ ./timing.sh --runs 5        # main @ 4e1a2c0
run 1  rows=60000  errors=0  wall=41.2s
run 2  rows=60000  errors=0  wall=40.7s
run 3  rows=60000  errors=0  wall=41.0s
run 4  rows=60000  errors=0  wall=40.9s
run 5  rows=60000  errors=0  wall=41.3s
median wall=41.0s

$ ./timing.sh --runs 5        # stream-writes @ 9b7d311
run 1  rows=60000  errors=0  wall=13.9s
run 2  rows=31200  errors=1  wall=9.8s
run 3  rows=60000  errors=0  wall=14.1s
run 4  rows=27450  errors=1  wall=10.2s
run 5  rows=60000  errors=0  wall=13.6s
median wall=13.6s
```
