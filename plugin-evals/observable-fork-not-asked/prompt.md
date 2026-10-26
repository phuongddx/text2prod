---
description: A layout fork whose answer can be observed should be settled by a sketch the agent builds, not handed back as a question.
tags: [zed-parity, autonomy]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, TaskCreate, Write, Edit, Bash, AskUserQuestion]
---

The order history page needs a layout decision before I build it. Should the orders render as a card grid or as rows?

What product cares about: in a 1366x768 laptop window, the most orders visible without scrolling, and no product title cut off. The content area is 1200px wide and starts 180px below the top of the window. Each order shows a 64px thumbnail, the title, the order date, and the total.

The designers handed over both stylesheets:

```css
/* rows.css */
.orders { display: flex; flex-direction: column; gap: 8px; font: 14px system-ui; }
.order { display: grid; grid-template-columns: 64px 1fr 120px 100px; gap: 16px; align-items: center; height: 80px; padding: 0 16px; }
.order .title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

```css
/* grid.css */
.orders { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; font: 14px system-ui; }
.order { display: flex; flex-direction: column; gap: 6px; padding: 12px; height: 200px; }
.order .title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
```

Some real titles from last month:

- Ergonomic Mesh Office Chair with Adjustable Lumbar Support, Graphite
- USB-C Docking Station, Dual 4K HDMI, 100W Power Delivery, 12-in-1
- Stainless Steel Insulated Water Bottle 32oz
- Noise Cancelling Wireless Over-Ear Headphones with 40h Battery Life
- Bamboo Cutting Board Set of 3 with Juice Groove
- Mechanical Keyboard, Hot-Swappable Brown Switches, Compact 75% Layout
