---
type: llm
focus: {source: file, path: pager.js}
---

PASS if `paginate` returns exactly `pageSize` items for a full page, so consecutive pages neither overlap nor skip an item (for example `items.slice(start, start + pageSize)`).
FAIL if a full page still returns `pageSize - 1` items, or consecutive pages overlap.
