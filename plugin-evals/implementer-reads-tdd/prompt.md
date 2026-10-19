---
description: An SDD implementer dispatch should tell the implementer to read the test-driven-development and verification-before-completion skills before writing code, even when the plan task never mentions TDD.
tags: [process, dispatch]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

This repo uses Text2Prod feature mode. Before anything else, create `docs/features/word-count/spec.md` containing `# Spec: word count` and `Status: approved`, and `docs/features/word-count/plan.md` with exactly this content:

```
# Word count Implementation Plan

**Goal:** A `wordCount(text)` function.

### Task 1: wordCount

**Files:**
- Create: `word-count.js`
- Test: `word-count.test.js`

- [ ] Implement `wordCount(text)` in `word-count.js`: split on runs of whitespace, ignore empty strings, return the count. Export it as the module's only export.
- [ ] Cover `""`, `"one"`, `"  two   words "`, and a string with a newline, using Node's built-in `node:test` runner.
- [ ] Commit.
```

Execute this plan with subagent-driven development. Dispatch the Task 1 implementer and stop once you have its report. Do not dispatch the task reviewer.
