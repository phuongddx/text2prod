/**
 * Text2Prod plugin for OpenCode V2
 *
 * Registers text2prod skills through the V2 skill transform (native `skill`
 * tool discovery), injects the zed-mode bootstrap through the `context`
 * session hook — the V2 replacement for V1's
 * `experimental.chat.messages.transform` — and registers the workflow
 * delegate agents (zed, comment-sicko) through the agent transform, sourcing
 * their definitions from .opencode/agents/*.md.
 *
 * The hook edits the outgoing model call only (never persisted history), and
 * OpenCode re-runs it on every agent model call, so the bootstrap survives
 * compaction with no re-injection lifecycle of our own. AgentEditor.update()
 * upserts: it creates the agent when the id is missing (verified against a
 * live v2.2.5 server), which is how a plugin ships agents without touching
 * user config.
 *
 * Zero runtime dependencies: `@opencode/plugin` is imported defensively so
 * the plugin also loads when the host resolves that specifier for us; when it
 * does not, the bare { id, setup } definition is exported, which is the same
 * shape `Plugin.define` returns.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PLUGIN_ID = 'text2prod';
const SKILLS_DIR = path.resolve(__dirname, '../../skills');
const AGENTS_DIR = path.resolve(__dirname, '../agents');
const BOOTSTRAP_SKILL = 'zed-mode';
// V1 used this tag as the dedup marker; keep it so an in-flight upgrade where
// both plugins could observe the same assembly never double-injects.
const BOOTSTRAP_MARKER = 'EXTREMELY_IMPORTANT';

// Tool mapping for OpenCode V2 (machine names verified against
// https://opencode.ai/v2/docs/tools). Shape B keeps the mapping inline in the
// bootstrap per docs/porting-to-a-new-harness.md Part 5, Step 4.
const TOOL_MAPPING = `**Tool Mapping for OpenCode:**
When skills request actions, substitute OpenCode V2 equivalents:
- Read a file → \`read\`
- Create or replace a file → \`write\`; targeted edits to an existing file → \`edit\`; delete via \`shell\` (\`rm\`)
- Run shell commands → \`shell\` (set \`workdir\` instead of \`cd\`; \`background: true\` for long-running processes)
- Search file contents → \`grep\`; find files by pattern → \`glob\`
- Fetch a URL → \`webfetch\`; web search → \`websearch\`
- Dispatch a subagent → \`subagent\` with the agent ID, a short description, and a complete, self-contained prompt (\`background: true\` for parallel work). Implementation delegates: this plugin registers \`zed\` (implementation) and \`comment-sicko\` (read-only comment pass) — dispatch them by name. \`zed\`'s system prompt carries its contract: read \`test-driven-development/SKILL.md\` and \`verification-before-completion/SKILL.md\` in full, under the skills base directory above, before writing any code
- Create/update todos → OpenCode has no native todo tool; track progress in a plan file or TODO.md instead
- Invoke a skill → the native \`skill\` tool with the skill's exact ID (e.g. \`brainstorming\`)

OpenCode advertises available skills (id, name, description) at every model
step; load one with the \`skill\` tool when it applies.`;

// ---------------------------------------------------------------------------
// Skill / SKILL.md parsing (dependency-free, same approach as the V1 plugin)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Frontmatter parsing (dependency-free, same approach as the V1 plugin).
// Flat `key: value` pairs become strings; a `key:` followed by `- ` items
// becomes an array — string items stay strings, `key: value` items gather
// their indented continuation lines into objects (list-of-maps, e.g. the
// permission rules in .opencode/agents/*.md). YAML comments are skipped.
// ---------------------------------------------------------------------------

const unquote = (value) => value.replace(/^["']|["']$/g, '');

const parseFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  let listKey = null;
  let listItem = null;
  for (const rawLine of match[1].split('\n')) {
    if (/^\s*#/.test(rawLine)) continue;
    const item = rawLine.match(/^\s+-\s+(.*)$/);
    if (item) {
      const colonIdx = item[1].indexOf(':');
      if (colonIdx > 0) {
        listItem = { [item[1].slice(0, colonIdx).trim()]: unquote(item[1].slice(colonIdx + 1).trim()) };
        frontmatter[listKey].push(listItem);
      } else {
        listItem = null;
        frontmatter[listKey].push(unquote(item[1].trim()));
      }
      continue;
    }
    if (listKey !== null && /^\s+/.test(rawLine) && listItem !== null) {
      const colonIdx = rawLine.indexOf(':');
      if (colonIdx > 0) {
        listItem[rawLine.slice(0, colonIdx).trim()] = unquote(rawLine.slice(colonIdx + 1).trim());
      }
      continue;
    }
    const colonIdx = rawLine.indexOf(':');
    if (colonIdx > 0) {
      const key = rawLine.slice(0, colonIdx).trim();
      const value = rawLine.slice(colonIdx + 1).trim();
      if (value === '') {
        frontmatter[key] = [];
        listKey = key;
        listItem = null;
      } else {
        frontmatter[key] = unquote(value);
        listKey = null;
        listItem = null;
      }
    }
  }

  return { frontmatter, body: match[2] };
};

// ---------------------------------------------------------------------------
// Module-level caches. SKILL.md files do not change during a session, so
// reading + parsing them once avoids redundant disk work on every transform
// and every agent step (see #1202 for the V1 analysis).
// ---------------------------------------------------------------------------

let _skillsCache; // undefined = not loaded, null = skills dir missing
let _bootstrapCache; // undefined = not loaded, null = bootstrap skill missing

const readSkill = (skillDir) => {
  const skillPath = path.join(SKILLS_DIR, skillDir, 'SKILL.md');
  if (!fs.existsSync(skillPath)) return null;

  const { frontmatter, body } = parseFrontmatter(
    fs.readFileSync(skillPath, 'utf8'),
  );

  return {
    // OpenCode V2 skill IDs are path-derived and case-sensitive; the skill
    // directory name is the ID (docs/README.opencode.md, Skills > IDs).
    id: skillDir,
    name: frontmatter.name || skillDir,
    description: frontmatter.description || '',
    path: skillPath,
    content: body,
  };
};

const getSkills = () => {
  if (_skillsCache !== undefined) return _skillsCache;
  if (!fs.existsSync(SKILLS_DIR)) {
    _skillsCache = null;
    return null;
  }

  _skillsCache = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readSkill(entry.name))
    .filter((skill) => skill !== null);

  return _skillsCache;
};

// V2-native delegate agent markdown from .opencode/agents/: the body becomes
// the agent system prompt, the frontmatter its configuration.
let _delegatesCache; // undefined = not loaded, null = agents dir missing

const getDelegateAgents = () => {
  if (_delegatesCache !== undefined) return _delegatesCache;
  if (!fs.existsSync(AGENTS_DIR)) {
    _delegatesCache = null;
    return null;
  }

  _delegatesCache = fs
    .readdirSync(AGENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const { frontmatter, body } = parseFrontmatter(
        fs.readFileSync(path.join(AGENTS_DIR, entry.name), 'utf8'),
      );
      const permissions = (frontmatter.permissions || []).filter(
        (rule) => rule && typeof rule === 'object' && rule.action && rule.effect,
      );

      return {
        id: entry.name.replace(/\.md$/, ''),
        name: frontmatter.name || entry.name.replace(/\.md$/, ''),
        description: frontmatter.description || '',
        mode: frontmatter.mode || 'subagent',
        system: body,
        permissions,
      };
    })
    .filter((agent) => agent !== null && agent.description);

  return _delegatesCache;
};

const getBootstrap = () => {
  if (_bootstrapCache !== undefined) return _bootstrapCache;

  const skill = readSkill(BOOTSTRAP_SKILL);
  if (!skill) {
    _bootstrapCache = null;
    return null;
  }

  _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have text2prod.

**IMPORTANT: The zed-mode skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "zed-mode" again - that would be redundant.**

Base directory for this skill: ${path.join(SKILLS_DIR, BOOTSTRAP_SKILL)}

${skill.content}

${TOOL_MAPPING}
</EXTREMELY_IMPORTANT>`;

  return _bootstrapCache;
};

// ---------------------------------------------------------------------------
// Plugin definition
// ---------------------------------------------------------------------------

const definition = {
  id: PLUGIN_ID,
  async setup(ctx) {
    // 1. Register every bundled skill so OpenCode advertises it natively and
    //    the model can load it with the `skill` tool. Transforms must stay
    //    synchronous and cheap: data is loaded above, the callback only adds.
    if (ctx.skill && typeof ctx.skill.transform === 'function') {
      await ctx.skill.transform((editor) => {
        const skills = getSkills();
        if (!skills) return;
        for (const skill of skills) editor.add(skill);
      });
    } else {
      console.error(`[${PLUGIN_ID}] ctx.skill.transform unavailable; skills not registered`);
    }

    // 2. Register the workflow delegate agents from .opencode/agents/*.md.
    if (ctx.agent && typeof ctx.agent.transform === 'function') {
      await ctx.agent.transform((editor) => {
        const delegates = getDelegateAgents();
        if (!delegates) return;
        for (const delegate of delegates) {
          // Native {agent,agents}/** discovery (repo-open sessions) already
          // defines these; leave that definition in place.
          if (editor.get(delegate.id)) continue;
          // update() upserts — there is no add.
          editor.update(delegate.id, (info) => {
            info.name = delegate.name;
            info.description = delegate.description;
            info.mode = delegate.mode;
            info.system = delegate.system;
            if (delegate.permissions.length > 0) info.permissions = delegate.permissions;
          });
        }
      });
    } else {
      console.error(`[${PLUGIN_ID}] ctx.agent.transform unavailable; delegate agents not registered`);
    }

    // 3. Inject the bootstrap into every agent model call. `event.system` is
    //    the per-call system assembly (SystemPart[]); edits affect only the
    //    outgoing call, are re-applied after compaction, and never persist —
    //    so no user-message mutation, persistence, or re-injection flags are
    //    needed (unlike V1). The marker guard keeps injection idempotent if
    //    the hook ever observes an assembly that already contains us.
    if (ctx.session && typeof ctx.session.hook === 'function') {
      await ctx.session.hook('context', (event) => {
        const bootstrap = getBootstrap();
        if (!bootstrap || !Array.isArray(event.system)) return;
        if (
          event.system.some(
            (part) => part && part.type === 'text' && typeof part.text === 'string' && part.text.includes(BOOTSTRAP_MARKER),
          )
        ) {
          return;
        }
        event.system.push({ type: 'text', text: bootstrap });
      });
    } else {
      console.error(`[${PLUGIN_ID}] ctx.session.hook unavailable; bootstrap not injected`);
    }
  },
};

// Prefer Plugin.define when the host exposes @opencode/plugin without us
// declaring a runtime dependency; the bare definition is the fallback.
let plugin = definition;
try {
  const { Plugin } = await import('@opencode/plugin');
  if (Plugin && typeof Plugin.define === 'function') {
    plugin = Plugin.define(definition);
  }
} catch {
  // Host does not expose @opencode/plugin to us; the bare definition works.
}

export default plugin;
