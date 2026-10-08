/**
 * Text2Prod plugin for OpenCode V2
 *
 * Registers text2prod skills through the V2 skill transform (native `skill`
 * tool discovery) and injects the using-text2prod bootstrap through the
 * `context` session hook — the V2 replacement for V1's
 * `experimental.chat.messages.transform`.
 *
 * The hook edits the outgoing model call only (never persisted history), and
 * OpenCode re-runs it on every agent model call, so the bootstrap survives
 * compaction with no re-injection lifecycle of our own.
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
const BOOTSTRAP_SKILL = 'using-text2prod';
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
- Dispatch a subagent → \`subagent\` with the agent ID, a short description, and a complete, self-contained prompt (\`background: true\` for parallel work)
- Create/update todos → OpenCode has no native todo tool; track progress in a plan file or TODO.md instead
- Invoke a skill → the native \`skill\` tool with the skill's exact ID (e.g. \`brainstorming\`)

OpenCode advertises available skills (id, name, description) at every model
step; load one with the \`skill\` tool when it applies.`;

// ---------------------------------------------------------------------------
// Skill / SKILL.md parsing (dependency-free, same approach as the V1 plugin)
// ---------------------------------------------------------------------------

// Extract YAML frontmatter (flat key: value pairs only) and strip it from body.
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
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

  const { frontmatter, content } = extractAndStripFrontmatter(
    fs.readFileSync(skillPath, 'utf8'),
  );

  return {
    // OpenCode V2 skill IDs are path-derived and case-sensitive; the skill
    // directory name is the ID (docs/README.opencode.md, Skills > IDs).
    id: skillDir,
    name: frontmatter.name || skillDir,
    description: frontmatter.description || '',
    path: skillPath,
    content,
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

const getBootstrap = () => {
  if (_bootstrapCache !== undefined) return _bootstrapCache;

  const skill = readSkill(BOOTSTRAP_SKILL);
  if (!skill) {
    _bootstrapCache = null;
    return null;
  }

  _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have text2prod.

**IMPORTANT: The using-text2prod skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-text2prod" again - that would be redundant.**

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

    // 2. Inject the bootstrap into every agent model call. `event.system` is
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
