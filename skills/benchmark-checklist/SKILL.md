---
name: benchmark-checklist
description: Use when you ran a benchmark or timed something, or before you report, compare, or act on any number you measured (a speedup, regression, latency, throughput, size, memory, error rate, or eval score), inside or outside a perf task
---

# Benchmark checklist

Apply `../principles/references/explain-the-number.md` to every number you measured. This checklist is the procedure for it. Answer each question with evidence from a run, not a guess about the code.

For a quick ballpark your human partner asked for, one run is enough. Still check questions 4 and 7, and say that it is one run. A choice between options is never a ballpark.

For a number that is not a time (an eval pass rate, a bundle size, peak memory), ask the same questions of its trials. Was each side configured the same way, did every trial do the task, does the gap hold across repeats, and does it matter to what a user sees?

## Before you run anything

- Write down the claim you expect to make, in the words you would ship ("export is 30% faster at p50 on the 60k-row dataset"). The questions test that sentence.
- Read the measurement script. Note what it times, counts, and ignores.
- Check the load average (`uptime`) and the core count. If the machine is busy, find out what is running. If you cannot stop it, interleave the sides so both see the same noise, and say so in the report.

## The questions

1. **Why not double?** Name the limiter. Profile in a run you do not report, because profilers slow the work down. Use per-process CPU, a runtime profiler, I/O wait, and syscall counts, then map the hot spot to source. If the load generator saturates first, you measured the load generator. If a change did not move the number, the limiter explains why; find it before you call the change useless.
2. **Was it tuned?** Run every side the way production runs it: release builds, production flags and env, batching and transaction settings, connection pools, caches as warm or cold as production sees them, same versions and data. A side on defaults means you compared configurations, not implementations. A limiter that is a setting (a commit per row, a debug build, a missing index) means that side is untuned. Tune it and measure again before you pick a winner. If you cannot tune it, do not pick a winner from that run. Narrowing the claim to "the code as it ships today" does not fix this when your human partner is choosing what to adopt.
3. **Did it break limits?** Do the arithmetic. Compare bytes per second with disk and network bandwidth, operations per second times cost per operation with your cores, and the time saved with the time the changed piece took. Removing a piece that takes 10% of the run makes the run at most about 11% faster. A result past a limit measured something else: a cache, a no-op, or a bug.
4. **Did it error?** Count failures and non-success responses, and check outputs are correct, not just present. Rejections are often fast; timeouts and retries are slow. If the script does not count errors, add the count.
5. **Does it reproduce?** Run each side at least 5 times, alternating A, B, A, B, so warmup, lazy initialization, caches, and drift favor neither. Report the median and range. A gap smaller than the run-to-run variation is no measurable difference. When the call is close, use a rank-sum test or the harness's own statistics.
6. **Does it matter?** Next to any micro result, measure the end-to-end path a user waits on, with realistic data sizes and concurrency, and report the micro result as a share of the whole. A helper that takes 1% of a request can make the request at most 1% faster.
7. **Did it even happen?** Confirm the work ran inside the timed region: the request reached the server, the rows were written, the bytes were read, and the code used the result. Lazy code (generators nobody iterates, promises nobody awaits, results the JIT discards) and timeouts produce numbers for work that never happened.

## Report

- Lead with the verdict: faster, slower, no measurable difference, or inconclusive.
- Give the number with its unit, the run count, the range, and the limiter. For example, "p50 41 ms to 33 ms, median of 7 runs per side, range 32 to 35 ms after, bound by JSON parsing on one core."
- Call the verdict inconclusive when you claim a difference but cannot name the limiter, when a side ran untuned, or when you could not check questions 4 and 7. Name the gap.
- A PR body carries one primary number (`../zed-mode/playbooks/opening-a-pr.md`). Put the runs, range, and limiter evidence in a linked artifact or notes file.

## Where it plugs in

- In `../zed-mode/playbooks/perf-issue.md`, vet the baseline before planning from it, and every number after.
- In a metric loop that keeps or reverts changes against a frozen harness, vet the harness before freezing it. Make it print error and work counts so every keep-or-revert checks questions 4 and 7.

_Adapted from pstack's `benchmark-checklist/SKILL.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
