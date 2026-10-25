---
name: principles
description: Use when making a design, debugging, delegation, or verification decision and you need the named rule that governs it - before adding an abstraction, choosing a data structure, writing a guard, declaring work done, or dispatching a subagent
---

# Principles

Twenty-four rules, one file each under `references/`. Read this index, then read the reference for any principle you apply.

## Citation rule

In your reply, name each principle that changed a decision and the specific choice it changed ("Laziness Protocol: left `fetchWithRetry` as one function, no policy layer"). Cite only principles whose reference file you read this session.

## Index

**Core**

| Principle | When it applies | Rule | Read |
| --- | --- | --- | --- |
| **Laziness Protocol** | Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading | Bias toward deletion and the smallest change that solves the problem | [`laziness-protocol`](references/laziness-protocol.md) |
| **Foundational Thinking** | Before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share | Get the data structures right so downstream code becomes obvious | [`foundational-thinking`](references/foundational-thinking.md) |
| **Redesign from First Principles** | Integrating a new requirement into an existing design | Redesign as if the requirement had been foundational from day one, instead of bolting it on | [`redesign-from-first-principles`](references/redesign-from-first-principles.md) |
| **Attack the Premise** | Two or more fixes that share one premise have failed the same gate | Write the premise down and test it directly before another fix that assumes it | [`attack-the-premise`](references/attack-the-premise.md) |
| **Subtract Before You Add** | Sequencing an addition, refactor, or rewrite | Remove dead weight, redundant validators, and stub references first, then build on the simpler base | [`subtract-before-you-add`](references/subtract-before-you-add.md) |
| **Minimize Reader Load** | Reviewing or shaping code that is hard to trace | Count layers and hidden state; collapse one-caller wrappers; shrink mutable scope | [`minimize-reader-load`](references/minimize-reader-load.md) |
| **Outcome-Oriented Execution** | Planned rewrites and migrations with explicit phase boundaries | Converge on the target architecture; no throwaway compatibility states | [`outcome-oriented-execution`](references/outcome-oriented-execution.md) |
| **Experience First** | Product, UX, or feature-scope trade-offs | Choose user delight over implementation convenience; fewer polished features over more rough ones | [`experience-first`](references/experience-first.md) |
| **Exhaust the Design Space** | A novel interaction or architectural decision with no precedent | Build 2-3 competing prototypes and compare side by side before committing | [`exhaust-the-design-space`](references/exhaust-the-design-space.md) |
| **Build the Lever** | Any non-trivial work: edits, migrations, analyses, checks | Build the tool that does or proves it (codemod, script, generator); the tool is what a reviewer reruns | [`build-the-lever`](references/build-the-lever.md) |

**Architecture**

| Principle | When it applies | Rule | Read |
| --- | --- | --- | --- |
| **Model the Domain** | Stateful logic, or code that branches a lot or repeats a shape assumption across files | Encode the domain in a structure (state machine, typed model, table, reducer) instead of scattered conditionals | [`model-the-domain`](references/model-the-domain.md) |
| **Boundary Discipline** | Wiring validation, error handling, or framework adapters | Guards at system boundaries; trust internal types; keep business logic pure | [`boundary-discipline`](references/boundary-discipline.md) |
| **Type System Discipline** | Designing types or a signature in a typed language | Make illegal states unrepresentable; brand primitives; parse external data at boundaries; exhaust variants | [`type-system-discipline`](references/type-system-discipline.md) |
| **Make Operations Idempotent** | Commands, lifecycle steps, or loops that run amid crashes and retries | Converge to the same end state regardless of partial prior runs | [`make-operations-idempotent`](references/make-operations-idempotent.md) |
| **Migrate Callers Then Delete Legacy APIs** | A new internal API while old callers exist | Migrate callers and delete the old API in the same wave; no compatibility layers | [`migrate-callers-then-delete-legacy-apis`](references/migrate-callers-then-delete-legacy-apis.md) |
| **Separate Before Serializing Shared State** | Concurrent actors might write the same file, branch, key, or object | Eliminate the sharing first; serialize only for a real invariant | [`separate-before-serializing-shared-state`](references/separate-before-serializing-shared-state.md) |

**Verification**

| Principle | When it applies | Rule | Read |
| --- | --- | --- | --- |
| **Prove It Works** | After a task, before declaring done | Verify against the real artifact, not a proxy, a self-report, or "it compiles" | [`prove-it-works`](references/prove-it-works.md) |
| **Fix Root Causes** | Debugging | Trace each symptom to the first place the system went wrong and fix it there; a guard is a fix only when the state it handles is legitimate | [`fix-root-causes`](references/fix-root-causes.md) |
| **Sequence Verifiable Units** | Multi-step work and how you stack commits and PRs | Small units that each end in a check; verify each before the next; order delivery so the sequence proves itself | [`sequence-verifiable-units`](references/sequence-verifiable-units.md) |
| **Test Behavior Not Implementation** | Writing, changing, or keeping a test | Assert what users can observe, so the test fails when behavior breaks and passes when only internals change | [`test-behavior-not-implementation`](references/test-behavior-not-implementation.md) |
| **Explain the Number** | Before trusting, reporting, or acting on a measured number | Find what limits it and rule out that it measured something else | [`explain-the-number`](references/explain-the-number.md) |

**Delegation**

| Principle | When it applies | Rule | Read |
| --- | --- | --- | --- |
| **Guard the Context Window** | Large outputs, long files, repeated reads, fan-out planning | Route bulk to subagents; keep summaries in the main thread | [`guard-the-context-window`](references/guard-the-context-window.md) |
| **Never Block on the Human** | Tempted to ask "should I do X?" on reversible work | Proceed, present the result, let the human course-correct; confirm only irreversible actions | [`never-block-on-the-human`](references/never-block-on-the-human.md) |

**Meta**

| Principle | When it applies | Rule | Read |
| --- | --- | --- | --- |
| **Encode Lessons in Structure** | Writing the same instruction a second time | Encode the rule as a lint, metadata flag, runtime check, or script instead of more text | [`encode-lessons-in-structure`](references/encode-lessons-in-structure.md) |

_Adapted from pstack's `poteto-mode` principles index and `principle-*` skills by Lauren Tan (MIT, https://github.com/cursor/plugins)._
