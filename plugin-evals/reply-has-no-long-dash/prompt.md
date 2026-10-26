---
description: An explanation reply should carry no long-dash character, per the zed-mode reply rules.
tags: [zed-parity, reply]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Can you walk me through what this does, piece by piece, and tell me when I'd reach for it instead of a throttle?

```js
export function debounce(fn, wait = 250, { leading = false } = {}) {
  let timer = null;
  return function (...args) {
    const callNow = leading && timer === null;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!leading) fn.apply(this, args);
    }, wait);
    if (callNow) fn.apply(this, args);
  };
}
```
