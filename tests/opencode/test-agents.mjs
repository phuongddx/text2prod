// Tests for the OpenCode V2 delegate agent adapter: the plugin's native
// agent registration (ctx.agent.transform) and the agent markdown it
// sources (.opencode/agents/). Run via tests/opencode/run-tests.sh.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const AGENTS_DIR = path.join(REPO_ROOT, '.opencode/agents');
const PLUGIN_PATH = path.join(REPO_ROOT, '.opencode/plugins/text2prod.js');

// Parses the agent files with its own frontmatter reader so the file-format
// assertions below pin the shipped V2 markdown shape, independent of the
// plugin's tolerance for it.
const parseAgentFile = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  let currentListKey = null;
  for (const rawLine of match[1].split('\n')) {
    if (/^\s*#/.test(rawLine)) continue;
    const listItem = rawLine.match(/^\s+-\s+(.*)$/);
    if (listItem) {
      if (!currentListKey) throw new Error(`list item outside a key: ${rawLine}`);
      frontmatter[currentListKey].push(listItem[1].trim());
      continue;
    }
    if (currentListKey !== null && /^\s+/.test(rawLine)) {
      const items = frontmatter[currentListKey];
      items[items.length - 1] += ` ${rawLine.trim()}`;
      continue;
    }
    const colonIdx = rawLine.indexOf(':');
    if (colonIdx <= 0) continue;
    const key = rawLine.slice(0, colonIdx).trim();
    const value = rawLine.slice(colonIdx + 1).trim();
    if (value === '') {
      frontmatter[key] = [];
      currentListKey = key;
    } else {
      frontmatter[key] = value.replace(/^["']|["']$/g, '');
      currentListKey = null;
    }
  }
  return { frontmatter, body: match[2] };
};

const readAgent = (name) => {
  const file = path.join(AGENTS_DIR, `${name}.md`);
  assert.ok(fs.existsSync(file), `${file} must exist`);
  return parseAgentFile(fs.readFileSync(file, 'utf8'));
};

const makeFakeCtx = () => {
  const state = { hooks: {}, agents: [] };
  return {
    state,
    skill: {
      transform: async () => ({ dispose: async () => {} }),
    },
    agent: {
      transform: async (callback) => {
        const editor = {
          registered: [],
          get: () => undefined,
          update(id, update) {
            const agent = { id };
            update(agent);
            this.registered.push(agent);
          },
        };
        await callback(editor);
        state.agents = editor.registered;
        return { dispose: async () => {} };
      },
    },
    session: {
      hook: async (name, callback) => {
        state.hooks[name] = callback;
        return { dispose: async () => {} };
      },
    },
  };
};

const main = async () => {
  // --- zed delegate: V2-native agent markdown ---
  const zed = readAgent('zed');
  assert.equal(zed.frontmatter.mode, 'subagent', 'zed must be a subagent');
  assert.ok(!zed.frontmatter.model, 'zed must not pin a model; the dispatcher selects one per task');
  assert.ok(
    typeof zed.frontmatter.description === 'string' && zed.frontmatter.description.length > 30,
    'zed needs a description (OpenCode shows it to the dispatching model)',
  );
  assert.ok(
    /text2prod|delegate/i.test(zed.frontmatter.description),
    'zed description names its text2prod delegate role',
  );
  assert.ok(
    zed.body.includes('test-driven-development/SKILL.md') &&
      zed.body.includes('verification-before-completion/SKILL.md'),
    'zed body carries the read-the-skills-first contract',
  );
  assert.ok(
    /do(es)? not dispatch subagents|do not dispatch subagents|never dispatch/i.test(zed.body),
    'zed body carries the no-subagents contract',
  );

  // --- comment-sicko delegate: read-only reviewer, enforced by permissions ---
  const sicko = readAgent('comment-sicko');
  assert.equal(sicko.frontmatter.mode, 'subagent', 'comment-sicko must be a subagent');
  assert.ok(
    typeof sicko.frontmatter.description === 'string' && sicko.frontmatter.description.length > 30,
    'comment-sicko needs a description',
  );
  const permissions = Array.isArray(sicko.frontmatter.permissions)
    ? sicko.frontmatter.permissions
    : [];
  assert.ok(
    permissions.some((p) => p.includes('action: edit') && p.includes('effect: deny')),
    'comment-sicko must deny edit (covers write/patch; never edits files)',
  );
  // Shell stays allowed on purpose: the body's method reads history via
  // `git log -S`, and only shell can run it.
  assert.ok(
    !permissions.some((p) => p.includes('action: shell') && p.includes('effect: deny')),
    'comment-sicko keeps shell: `git log -S` investigation is part of its method',
  );
  assert.ok(
    /never (edit|write|edit files)|never edits/i.test(sicko.body),
    'comment-sicko body keeps its never-edits contract',
  );

  // --- plugin tool mapping carries the fallback delegate contract ---
  const plugin = (await import(PLUGIN_PATH)).default;
  const ctx = makeFakeCtx();
  await plugin.setup(ctx);
  const event = { system: [], messages: [], options: {}, tools: {} };
  await ctx.state.hooks.context(event);
  const bootstrap = event.system[0].text;

  assert.ok(bootstrap.includes('Implementation delegates'), 'tool mapping names the delegate case');
  assert.ok(
    bootstrap.includes('test-driven-development/SKILL.md') &&
      bootstrap.includes('verification-before-completion/SKILL.md'),
    'tool mapping tells dispatchers to put the skills-first brief in the delegate prompt',
  );

  // --- plugin registers both delegates natively (update() upserts) ---
  const pluginCtx = makeFakeCtx();
  await plugin.setup(pluginCtx);
  const registered = pluginCtx.state.agents;
  const registeredIds = registered.map((a) => a.id).sort();
  assert.deepEqual(
    registeredIds,
    ['comment-sicko', 'zed'],
    'plugin registers exactly the two delegates',
  );

  const registeredZed = registered.find((a) => a.id === 'zed');
  assert.equal(registeredZed.mode, 'subagent', 'registered zed is a subagent');
  assert.ok(!('model' in registeredZed) || registeredZed.model == null, 'registered zed pins no model');
  assert.equal(
    registeredZed.description,
    zed.frontmatter.description,
    'registered zed carries the markdown description',
  );
  assert.ok(
    typeof registeredZed.system === 'string' &&
      registeredZed.system.includes('test-driven-development/SKILL.md') &&
      !registeredZed.system.startsWith('---'),
    'registered zed system is the frontmatter-stripped markdown body',
  );

  const registeredSicko = registered.find((a) => a.id === 'comment-sicko');
  assert.equal(registeredSicko.mode, 'subagent', 'registered comment-sicko is a subagent');
  const sickoPerms = registeredSicko.permissions || [];
  assert.ok(
    sickoPerms.some((p) => p.action === 'edit' && p.effect === 'deny'),
    'registered comment-sicko denies edit',
  );
  assert.ok(
    !sickoPerms.some((p) => p.action === 'shell' && p.effect === 'deny'),
    'registered comment-sicko keeps shell (git log -S)',
  );

  // --- registration is a no-op when the agent already exists ---
  // (repo-open sessions get zed/comment-sicko from .opencode/agents/
  // discovery; the plugin must not fight that definition)
  const existingCtx = makeFakeCtx();
  const existing = { id: 'zed', mode: 'subagent' };
  existingCtx.agent.transform = async (callback) => {
    const editor = {
      registered: [],
      get: (id) => (id === 'zed' || id === 'comment-sicko' ? { ...existing, id } : undefined),
      update(id, update) {
        const agent = { id };
        update(agent);
        this.registered.push(agent);
      },
    };
    await callback(editor);
    existingCtx.state.agents = editor.registered;
    return { dispose: async () => {} };
  };
  await plugin.setup(existingCtx);
  assert.equal(existingCtx.state.agents.length, 0, 'no re-registration when agents already exist');

  console.log('test-agents.mjs: all assertions passed');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
