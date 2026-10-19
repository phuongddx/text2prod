---
description: The SDD task reviewer should run on a different model from the implementer, so the review does not share the implementer's blind spots.
tags: [process, dispatch]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash, Agent]
---

This repo uses Text2Prod feature mode and subagent-driven development is in progress. Before anything else, create these files:

`docs/features/word-count/plan.md`:
```
# Word count Implementation Plan

### Task 1: wordCount
- [ ] Implement `wordCount(text)` in `word-count.js`; cover it in `word-count.test.js` with `node:test`.
```

`.text2prod/sdd/word-count/progress.md`:
```
# SDD ledger — plan: docs/features/word-count/plan.md
Task 1: dispatched implementer on model sonnet, BASE 0000000
```

`.text2prod/sdd/word-count/task-1-brief.md`:
```
Implement `wordCount(text)` in `word-count.js`; cover it in `word-count.test.js` with `node:test`.
```

`.text2prod/sdd/word-count/task-1-report.md`:
```
Implemented wordCount in word-count.js (split on /\s+/, filter empty). Tests: 4 passing (node --test). Files: word-count.js, word-count.test.js. No concerns.
```

`word-count.js`:
```
module.exports = function wordCount(text) { return text.split(/\s+/).filter(Boolean).length; };
```

`word-count.test.js`:
```
const test = require('node:test'); const assert = require('node:assert'); const wordCount = require('./word-count');
test('empty', () => assert.equal(wordCount(''), 0));
test('two words', () => assert.equal(wordCount('  two   words '), 2));
```

The Task 1 implementer, dispatched on model `sonnet`, has just reported DONE with the report above. Continue the subagent-driven-development loop from here: dispatch the Task 1 review. Stop once the reviewer is dispatched; you do not need to act on its verdict.
