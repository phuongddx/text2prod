import { chapters, playbooks, skills, principles } from "./catalog.js";

const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";
const THEME_KEY = "text2prod-guide-theme";
const root = document.documentElement;
const page = document.body.dataset.page;
const current = chapters.find((c) => c.slug === page);
const darkQuery = matchMedia("(prefers-color-scheme: dark)");

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

function renderNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const list = el("ol", { class: "nav-list" });
  for (const c of chapters) {
    const link = el("a", { href: pageHref(c) }, chapterLabel(c));
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
  if (!pager || !current) return;
  const i = chapters.indexOf(current);
  const prev = chapters[i - 1];
  const next = chapters[i + 1];
  if (prev) pager.append(el("a", { class: "prev", href: pageHref(prev) }, `← ${prev.title}`));
  if (next) pager.append(el("a", { class: "next", href: pageHref(next) }, `Next: ${next.title} →`));
}

function playbookCard(p) {
  return el(
    "a",
    { class: "card", href: chapterHref(p.chapter) },
    el("code", {}, p.name),
    el("p", {}, p.when),
    el("span", { class: "tag" }, p.group),
  );
}

function skillCard(s) {
  return el(
    "a",
    { class: "card", href: chapterHref(s.chapter) },
    el("code", {}, s.name),
    el("p", {}, s.what),
    el("span", { class: "tag" }, s.kind),
  );
}

const renderers = {
  "chapter-index"(node) {
    const grid = el("div", { class: "grid" });
    for (const c of chapters.filter((c) => c.n > 0)) {
      grid.append(
        el(
          "a",
          { class: "card", href: pageHref(c) },
          el("span", { class: "tag" }, `Chapter ${c.n}`),
          el("strong", {}, c.title),
          el("p", {}, c.blurb),
        ),
      );
    }
    node.append(grid);
  },

  "in-this-chapter"(node) {
    if (!current) return;
    const ownSkills = skills.filter((s) => s.chapter === current.n);
    const ownPlaybooks = playbooks.filter((p) => p.chapter === current.n);
    if (ownSkills.length) {
      node.append(el("h3", { class: "grid-heading" }, "Skills"), el("div", { class: "grid" }, ...ownSkills.map(skillCard)));
    }
    if (ownPlaybooks.length) {
      node.append(el("h3", { class: "grid-heading" }, "Playbooks"), el("div", { class: "grid" }, ...ownPlaybooks.map(playbookCard)));
    }
  },

  "playbook-grid"(node) {
    const groups = ["all", ...new Set(playbooks.map((p) => p.group))];
    const bar = el("div", { class: "filters", role: "group", "aria-label": "Filter playbooks by group" });
    const grid = el("div", { class: "grid" });
    const draw = (group) => {
      grid.replaceChildren(...playbooks.filter((p) => group === "all" || p.group === group).map(playbookCard));
      for (const button of bar.children) button.setAttribute("aria-pressed", String(button.dataset.group === group));
    };
    for (const group of groups) {
      const button = el("button", { type: "button", "data-group": group }, group);
      button.addEventListener("click", () => draw(group));
      bar.append(button);
    }
    node.append(bar, grid);
    draw("all");
  },

  principles(node) {
    for (const group of [...new Set(principles.map((p) => p.group))]) {
      const cards = principles
        .filter((p) => p.group === group)
        .map((p) => el("div", { class: "card" }, el("strong", {}, p.name), el("p", {}, `Say it when: ${p.sayWhen}`)));
      node.append(el("h3", { class: "grid-heading" }, group), el("div", { class: "grid" }, ...cards));
    }
  },
};

function addCopyButtons() {
  for (const code of document.querySelectorAll("pre > code")) {
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
    code.parentElement.append(button);
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
  try {
    mermaidModule ??= import(MERMAID_URL).then((m) => m.default);
    const mermaid = await mermaidModule;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: effectiveTheme() === "dark" ? "dark" : "neutral",
      fontFamily: "inherit",
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
