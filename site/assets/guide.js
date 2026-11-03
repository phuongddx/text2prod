import { chapters, playbooks, skills, principles, playbookSteps, routerTerms } from "./catalog.js";

const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";
const THEME_KEY = "text2prod-guide-theme";
const root = document.documentElement;
const page = document.body.dataset.page;
const current = chapters.find((c) => c.slug === page);
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

const pageHref = (chapter) => `${chapter.slug}.html`;
const chapterHref = (n) => pageHref(chapters.find((c) => c.n === n));
const chapterLabel = (c) => (c.n === 0 ? c.title : `${c.n}. ${c.title}`);


function routeGoal(text) {
  const goal = text.trim().toLowerCase();
  if (!goal) return { playbook: playbooks.find((p) => p.name === "bug-fix"), score: 0, named: false };
  let best = null;
  let bestScore = 0;
  for (const p of playbooks) {
    let score = 0;
    if (goal.includes(p.name)) score += 5;
    const terms = routerTerms[p.name] ?? [];
    for (const term of terms) if (goal.includes(term)) score += term.includes(" ") ? 3 : 2;
    if (goal.includes(p.group)) score += 1;
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  if (!best || bestScore < 2) return { playbook: playbooks.find((p) => p.name === "figure-it-out"), score: bestScore, named: true };
  return { playbook: best, score: bestScore, named: true };
}

const promptFor = (goal, playbook) =>
  goal.trim() ? `/text2prod:zed-mode use the ${playbook.name} playbook. ${goal.trim()}` : `/text2prod:zed-mode use the bug-fix playbook. describe your goal and your done check here.`;


function renderNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const list = el("ol", { class: "nav-list" });
  for (const c of chapters) {
    const link = el("a", { href: pageHref(c) }, ...(c.n === 0 ? [c.title] : [el("span", { class: "n" }, `${c.n}.`), c.title]));
    if (c.slug === page) link.setAttribute("aria-current", "page");
    list.append(el("li", {}, link));
  }
  nav.append(list);
  const toggle = document.getElementById("menu-toggle");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function renderPager() {
  const pager = document.getElementById("pager");
  if (!pager || !current || current.n === 0) return;
  const i = chapters.indexOf(current);
  const prev = chapters[i - 1];
  const next = chapters[i + 1];
  if (prev) pager.append(el("a", { class: "prev", href: pageHref(prev) }, `← ${prev.title}`));
  if (next) pager.append(el("a", { class: "next", href: pageHref(next) }, `Next: ${next.title} →`));
}


function rowLink({ href, name, sub, meta }, i = 0) {
  const row = el("a", { class: "row", href, "data-enter": "" });
  row.style.setProperty("--enter-delay", `${(i % 4) * 70}ms`);
  row.append(el("span", { class: "dot", "aria-hidden": "true" }));
  const nameWrap = el("span", {}, el("code", {}, name));
  nameWrap.style.fontWeight = "600";
  if (sub) nameWrap.append(el("span", { class: "row-sub" }, sub));
  row.append(nameWrap);
  if (meta) row.append(el("span", { class: "row-meta" }, meta));
  return row;
}

const renderers = {
  opener(node) {
    if (!current || current.n === 0) return;
    const own = playbooks.filter((p) => p.chapter === current.n);
    const bench = el("div", { class: "bench", "data-ui": "" });
    if (own.length) {
      const p = own[0];
      bench.setAttribute("aria-label", `The ${p.name} playbook and its real steps`);
      bench.append(el("div", { class: "bench-head" }, el("span", { class: "dot", "aria-hidden": "true" }), `playbook: ${p.group}`, el("span", { class: "routed" }, `→ ${p.name}`)));
      const list = el("ol", { class: "todo" });
      for (const [i, step] of (playbookSteps[p.name] ?? []).entries()) {
        list.append(el("li", { class: i === 0 ? "done" : "" }, el("span", { class: "box", "aria-hidden": "true" }), el("span", { class: "label" }, step)));
      }
      bench.append(list);
      const rest = own.length > 1 ? ` · ${own.length - 1} more in this chapter` : "";
      bench.append(el("div", { class: "bench-foot" }, el("span", {}, `steps from the real playbook${rest}`)));
    } else {
      const group = principles.filter((x) => x.group === "Core").slice(0, 4);
      bench.setAttribute("aria-label", "Principles and when to say them");
      bench.append(el("div", { class: "bench-head" }, el("span", { class: "dot", "aria-hidden": "true" }), "say it when", el("span", { class: "routed" }, "→ named rule")));
      const list = el("ol", { class: "todo" });
      for (const x of group) {
        list.append(el("li", {}, el("span", { class: "box", "aria-hidden": "true" }), el("span", { class: "label" }, `${x.name}: ${x.sayWhen}`)));
      }
      bench.append(el("div", { class: "bench-foot" }, el("span", {}, "24 named rules, one line each")));
    }
    node.append(bench);
  },

  "chapter-index"(node) {
    const wrap = el("div", { class: "rows" });
    let ci = 0;
    for (const c of chapters.filter((c) => c.n > 0)) {
      const row = el("a", { class: "row", href: pageHref(c), "data-enter": "" });
      row.style.setProperty("--enter-delay", `${(ci % 4) * 70}ms`);
      ci += 1;
      row.append(el("span", { class: "dot", "aria-hidden": "true" }));
      row.append(el("span", {}, el("span", { class: "row-name" }, c.title), el("span", { class: "row-sub" }, c.blurb)));
      row.append(el("span", { class: "row-meta" }, `Chapter ${c.n}`));
      wrap.append(row);
    }
    node.append(wrap);
  },

  "in-this-chapter"(node) {
    if (!current) return;
    const ownSkills = skills.filter((s) => s.chapter === current.n);
    const ownPlaybooks = playbooks.filter((p) => p.chapter === current.n);
    if (ownSkills.length) {
      node.append(el("h3", {}, "Skills"), el("div", { class: "rows compact" }, ...ownSkills.map((s, i) => rowLink({ href: pageHref(current), name: s.name, sub: s.what }, i))));
    }
    if (ownPlaybooks.length) {
      node.append(el("h3", {}, "Playbooks"), el("div", { class: "rows compact" }, ...ownPlaybooks.map((p, i) => rowLink({ href: pageHref(current), name: p.name, sub: p.when }, i))));
    }
  },

  "playbook-grid"(node) {
    const groups = ["all", ...new Set(playbooks.map((p) => p.group))];
    const panel = el("div", { class: "command" });
    const bar = el("div", { class: "filters", role: "group", "aria-label": "Filter playbooks by group" });
    const grid = el("div", { class: "rows compact" });
    const draw = (group) => {
      grid.replaceChildren(...playbooks.filter((p) => group === "all" || p.group === group).map((p, i) => rowLink({ href: chapterHref(p.chapter), name: p.name, sub: p.when, meta: `Chapter ${p.chapter}` }, i)));
      for (const button of bar.children) button.setAttribute("aria-pressed", String(button.dataset.group === group));
    };
    for (const group of groups) {
      const button = el("button", { type: "button", "data-group": group }, group);
      button.addEventListener("click", () => draw(group));
      bar.append(button);
    }
    panel.append(bar, grid);
    node.append(panel);
    draw("all");
  },

  principles(node) {
    for (const group of [...new Set(principles.map((p) => p.group))]) {
      const wrap = el("div", { class: "row-group" });
      wrap.append(el("h3", { class: "group-label" }, group));
      const rows = el("div", { class: "rows compact two-col" });
      let i = 0;
      for (const p of principles.filter((p) => p.group === group)) {
        const row = el("div", { class: "row", "data-enter": "" });
        row.style.setProperty("--enter-delay", `${(i % 4) * 70}ms`);
        i += 1;
        row.append(el("span", { class: "dot", "aria-hidden": "true" }));
        row.append(el("span", { class: "row-name" }, p.name));
        row.append(el("span", { class: "row-meta" }, p.sayWhen));
        rows.append(row);
      }
      wrap.append(rows);
      node.append(wrap);
    }
  },
};


const scenarios = [
  { goal: "fix the export dropping its last row", playbook: "bug-fix" }, // taste-skill-ignore: product term, not a CSS shadow
  { goal: "why does the nightly job fail on tuesdays", playbook: "investigation" },
  { goal: "the settings page is slow to load", playbook: "perf-issue" },
];

function benchInit() {
  const bench = document.getElementById("bench");
  if (!bench) return;
  const input = document.getElementById("bench-input");
  const todo = document.getElementById("bench-todo");
  const route = document.getElementById("bench-route");
  const hint = document.getElementById("bench-hint");
  const copyBtn = document.getElementById("bench-copy");
  let userTook = false;

  const drawSteps = (playbookName, { tickCount = 0, instant = false } = {}) => {
    const steps = playbookSteps[playbookName] ?? [];
    todo.replaceChildren(
      ...steps.map((step, i) => {
        const li = el("li", { class: instant ? (i < tickCount ? "done" : "") : "appearing" }, el("span", { class: "box", "aria-hidden": "true" }), el("span", { class: "label" }, step));
        if (!instant) {
          requestAnimationFrame(() => requestAnimationFrame(() => li.classList.remove("appearing")));
          li.style.transitionDelay = `${i * 90}ms`;
        }
        return li;
      }),
    );
    if (!instant && tickCount > 0) {
      [...todo.children].slice(0, tickCount).forEach((li, i) => setTimeout(() => li.classList.add("done"), 450 + i * 520));
    }
  };

  const apply = (goal, { instant = false, tick = 0 } = {}) => {
    const { playbook } = routeGoal(goal || "fix something");
    input.value = goal;
    route.textContent = `→ ${playbook.name}`;
    hint.textContent = playbook.name === "figure-it-out" ? "no single match — figure-it-out frames it" : "steps from the real playbook";
    drawSteps(playbook.name, { tickCount: tick, instant });
  };

  input.addEventListener("input", () => {
    userTook = true;
    apply(input.value, { instant: true });
  });
  input.addEventListener("focus", () => {
    userTook = true;
  });

  copyBtn?.addEventListener("click", async () => {
    const { playbook } = routeGoal(input.value);
    const text = promptFor(input.value, playbook);
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
    } catch {
      copyBtn.textContent = "Select to copy";
    }
    setTimeout(() => (copyBtn.textContent = "Copy prompt"), 1600);
  });

  // The signature move: when idle, the bench performs the shadow run itself. // taste-skill-ignore
  if (reducedMotion.matches) {
    apply(scenarios[0].goal, { instant: true, tick: 2 });
    return;
  }
  let scene = 0;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const cancelled = () => userTook || document.hidden;
  (async () => {
    await sleep(2600);
    while (!cancelled()) {
      const s = scenarios[scene % scenarios.length];
      scene += 1;
      input.value = "";
      route.textContent = "→ matching";
      todo.replaceChildren();
      await sleep(650);
      if (cancelled()) break;
      for (let i = 1; i <= s.goal.length; i += 2) {
        if (cancelled()) break;
        input.value = s.goal.slice(0, i);
        await sleep(26);
      }
      if (cancelled()) break;
      apply(s.goal, { tick: 3 });
      await sleep(5200);
    }
    if (userTook) apply(input.value, { instant: true });
  })();
}


function chapterRowsInit() {
  const node = document.getElementById("chapter-rows");
  if (!node) return;
  const wrap = el("div", { class: "rows" });
  for (const c of chapters.filter((c) => c.n > 0)) {
    const skillCount = skills.filter((s) => s.chapter === c.n).length;
    const playbookCount = playbooks.filter((p) => p.chapter === c.n).length;
    const meta = [skillCount ? `${skillCount} skill${skillCount > 1 ? "s" : ""}` : "", playbookCount ? `${playbookCount} playbook${playbookCount > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ");
    const row = el("a", { class: "row", href: pageHref(c) });
    row.append(el("span", { class: "dot", "aria-hidden": "true" }));
    row.append(el("span", {}, el("span", { class: "row-name" }, c.title), el("span", { class: "row-sub" }, c.blurb)));
    row.append(el("span", { class: "row-meta" }, meta || `Chapter ${c.n}`));
    wrap.append(row);
  }
  node.append(wrap);
}


function commandInit() {
  const rootEl = document.getElementById("command");
  if (!rootEl) return;
  const input = document.getElementById("command-input");
  const rowsEl = document.getElementById("command-rows");
  const emptyEl = document.getElementById("command-empty");
  let selected = 0;

  const groupRows = () => {
    const groups = [...new Set(playbooks.map((p) => p.group))];
    return groups.map((g) => ({
      name: g,
      count: `${playbooks.filter((p) => p.group === g).length} playbooks`,
      when: `Work like ${playbooks.find((p) => p.group === g).when.toLowerCase()}`,
      href: chapterHref(playbooks.find((p) => p.group === g).chapter),
      kind: "group",
    }));
  };

  const rowsFor = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return groupRows();
    const { playbook } = routeGoal(q);
    const matches = playbooks.filter((p) => p.name.includes(q) || p.when.toLowerCase().includes(q) || p.group.includes(q));
    if (playbook && !matches.some((m) => m.name === playbook.name) && playbook.name !== "figure-it-out") matches.unshift(playbook);
    return matches.map((p) => ({ name: p.name, count: p.group, when: p.when, href: chapterHref(p.chapter), kind: "playbook", chapter: p.chapter }));
  };

  const draw = () => {
    const rows = rowsFor(input.value);
    rootEl.classList.toggle("is-filtered", Boolean(input.value.trim()));
    emptyEl.style.display = rows.length ? "none" : "block";
    selected = Math.min(selected, Math.max(rows.length - 1, 0));
    rowsEl.replaceChildren(
      ...rows.map((r, i) => {
        const row = el("a", { class: `command-row${i === selected ? " selected" : ""}`, href: r.href, role: "option", "aria-selected": String(i === selected) });
        row.append(el("span", {}, r.name));
        row.append(el("span", { class: "count" }, r.count));
        row.append(
          el(
            { group: "span", playbook: "span" }[r.kind] ?? "span",
            { class: "keys" },
            el("kbd", {}, r.kind === "group" ? "↵" : `ch ${r.chapter}`),
          ),
        );
        if (i === selected) row.append(el("span", { class: "when" }, r.when));
        row.addEventListener("mouseenter", () => {
          if (selected !== i) {
            selected = i;
            draw();
          }
        });
        return row;
      }),
    );
  };

  input.addEventListener("input", () => {
    selected = 0;
    draw();
  });
  input.addEventListener("keydown", (event) => {
    const count = rowsEl.children.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selected = Math.min(selected + 1, count - 1);
      draw();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selected = Math.max(selected - 1, 0);
      draw();
    }
  });
  draw();
}


function showcaseInit() {
  const section = document.getElementById("showcase");
  const box = document.getElementById("showcase-box");
  const word = document.getElementById("showcase-word");
  if (!section || !box) return;
  const set = (proved) => {
    section.classList.toggle("proved", proved);
    if (word) word.textContent = proved ? "proved" : "planned";
    document.getElementById("showcase-evidence")?.setAttribute("aria-hidden", String(!proved));
  };
  box.addEventListener("change", () => set(box.checked));
}


function ctaInit() {
  const input = document.getElementById("cta-input");
  const go = document.getElementById("cta-go");
  const note = document.getElementById("cta-note");
  const preview = document.getElementById("cta-preview");
  if (!input || !go) return;
  const previewCode = preview.querySelector("code") ?? preview;
  const update = () => {
    const { playbook } = routeGoal(input.value);
    previewCode.textContent = promptFor(input.value, playbook);
  };
  input.addEventListener("input", update);
  go.addEventListener("click", async (event) => {
    event.preventDefault();
    const goal = input.value.trim();
    if (!goal) {
      location.href = go.href;
      return;
    }
    const { playbook } = routeGoal(goal);
    const text = promptFor(goal, playbook);
    try {
      await navigator.clipboard.writeText(text);
      note.textContent = `Copied. It routes to the ${playbook.name} playbook. Install the plugin first; chapter 1 shows how.`;
    } catch {
      note.textContent = "Clipboard is blocked; copy it from the panel on the right.";
    }
  });
}


function motionInit() {
  for (const article of document.querySelectorAll("article")) {
    let i = 0;
    const tag = (parent) => {
      for (const child of parent.children) {
        if (child.id === "pager") continue;
        if (child.hasAttribute("data-enter")) continue;
        child.setAttribute("data-enter", "");
        child.style.setProperty("--enter-delay", `${(i % 3) * 80}ms`);
        i += 1;
      }
    };
    tag(article);
    for (const section of article.querySelectorAll("section")) tag(section);
  }
  const targets = document.querySelectorAll("[data-enter]");
  if (reducedMotion.matches) {
    targets.forEach((t) => t.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  targets.forEach((t) => io.observe(t));

  const drift = document.querySelector(".bench-scroll");
  if (drift) {
    let ticking = false;
    addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = Math.min(scrollY, innerHeight);
          drift.style.transform = `translateY(${y * -0.06}px)`;
          ticking = false;
        });
      },
      { passive: true },
    );
  }
}


function addCopyButtons() {
  for (const code of document.querySelectorAll("pre > code")) {
    const pre = code.parentElement;
    if (!pre.classList.contains("mermaid")) pre.setAttribute("data-ui", ""); // a real terminal surface of the product
    const button = el("button", { class: "copy", type: "button", "aria-label": "Copy to clipboard" }, "Copy");
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select to copy";
      }
      setTimeout(() => (button.textContent = "Copy"), 1500);
    });
    pre.append(button);
  }
}


function storedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Without storage the toggle still works for this page view.
  }
}

const effectiveTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");

let mermaidModule;
async function renderDiagrams() {
  const nodes = [...document.querySelectorAll("pre.mermaid")];
  if (!nodes.length) return;
  for (const node of nodes) {
    node.dataset.source ??= node.textContent;
    node.textContent = node.dataset.source;
    node.removeAttribute("data-processed");
  }
  const dark = effectiveTheme() === "dark";
  try {
    mermaidModule ??= import(MERMAID_URL).then((m) => m.default);
    const mermaid = await mermaidModule;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: "Figtree, system-ui, sans-serif",
      themeVariables: dark
        ? { background: "#1e1520", primaryColor: "#2a1e2c", primaryTextColor: "#f4ecf1", primaryBorderColor: "#2a1e2c", lineColor: "#a5939e", secondaryColor: "#2a1e2c", tertiaryColor: "#231728", textColor: "#f4ecf1" }
        : { background: "#ffffff", primaryColor: "#f0e9ee", primaryTextColor: "#221722", primaryBorderColor: "#f0e9ee", lineColor: "#715f6b", secondaryColor: "#f0e9ee", tertiaryColor: "#faf7f5", textColor: "#221722" },
    });
    await mermaid.run({ nodes });
  } catch (error) {
    mermaidModule = undefined;
    console.warn("Diagrams unavailable; showing their source instead.", error);
  }
}

function initTheme() {
  const saved = storedTheme();
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    saveTheme(next);
    renderDiagrams();
  });
  darkQuery.addEventListener("change", () => {
    if (!root.dataset.theme) renderDiagrams();
  });
}

initTheme();
renderNav();
renderPager();
for (const node of document.querySelectorAll("[data-render]")) renderers[node.dataset.render]?.(node);
addCopyButtons();
renderDiagrams();
benchInit();
chapterRowsInit();
commandInit();
showcaseInit();
ctaInit();
motionInit();
