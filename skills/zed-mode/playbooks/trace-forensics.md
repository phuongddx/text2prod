### Trace forensics

**You own the diagnosis from the artifact.** The capture (cpuprofile, trace, spindump, heap snapshot) already exists: a fixed dataset to read, not re-run. To instrument a live process, use `playbooks/runtime-forensics.md`. The deliverable is a cited diagnosis, not a fix.

1. Identify the format and load it with a generic tool: a devtools or trace parser for cpuprofile and `.json.gz`, a text editor for a spindump, heap tooling for a heap snapshot. Parse large artifacts in a subagent and keep only the finding in the main thread (`principles/references/guard-the-context-window.md`).
2. Make it queryable before you read it, for example sqlite with one row per sample, frame, or node.
3. Narrow to the cause. Query for the frames holding the most time and walk the call tree to the hot path. For a leak, follow the retainer chain to a GC root. For a spindump, find the thread stuck on-CPU or blocked, and its wait reason.
4. Attribute to source (file, symbol, line) via the artifact's own symbols. A frame with no source mapping is not yet a diagnosis: resolve the symbols, or say plainly the artifact lacks them.
5. With a paired capture, diff before against after to confirm. Without one, label the finding the strongest hypothesis the artifact supports, not a confirmed cause.
6. Write `throughput checkpoint: n/a, read-only forensics` as one step.

No fix unless asked. Once the cause is known, re-route to `playbooks/bug-fix.md` or `playbooks/perf-issue.md`.

**Reply:** the artifact and format, the reduced finding, the source location, the artifact paths, and whether a paired capture confirmed it.

_Adapted from pstack's `playbooks/trace-forensics.md` by Lauren Tan (MIT, https://github.com/cursor/plugins)._
