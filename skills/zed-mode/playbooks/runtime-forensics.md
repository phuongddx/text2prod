### Runtime forensics

**You own the diagnosis. Instrument the live process; do not theorize from source.** The deliverable is a cited diagnosis, not a fix.

1. Capture the live signal, driving the real surface with the tools the harness offers: a CPU profile for a spin, a heap snapshot for a leak, a devtools trace for a visual glitch. A real artifact, not a guess.
2. Reduce it to the smoking gun: the hot-path function, the retainer chain from the leaked object to a GC root, the loop firing without input. Parse large artifacts in a subagent and keep only the finding in the main thread (`principles/references/guard-the-context-window.md`).
3. Prove the mechanism before believing it: inject instrumentation into the running process (a debugger or devtools eval, or a live hotfix without reload).
4. Map the finding to source: file, symbol, and the line that allocates or schedules.
5. Write `throughput checkpoint: n/a, read-only forensics` as one step.

No fix unless asked. Once the cause is known, re-route to `playbooks/bug-fix.md` or `playbooks/perf-issue.md`.

**Reply:** the signal captured, the reduced finding, how you proved the mechanism, the source location, artifact paths.

_Adapted from pstack's `playbooks/runtime-forensics.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
