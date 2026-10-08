// Unit tests for the OpenCode V2 text2prod plugin (.opencode/plugins/text2prod.js).
//
// Fakes the V2 plugin context (ctx.skill.transform, ctx.session.hook) and
// asserts: plugin shape, skill registration, bootstrap injection, dedup guard,
// and frontmatter stripping. Run via tests/opencode/run-tests.sh.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const PLUGIN_PATH = path.join(REPO_ROOT, '.opencode/plugins/text2prod.js');

const makeFakeCtx = () => {
  const state = { skills: [], hooks: {} };
  const ctx = {
    state,
    skill: {
      transform: async (callback) => {
        const editor = {
          added: [],
          list: () => [],
          get: () => undefined,
          add(skill) {
            this.added.push(skill);
          },
          update() {},
          remove() {},
        };
        await callback(editor);
        state.skills = editor.added;
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
  return ctx;
};

const makeContextEvent = () => ({
  system: [],
  messages: [],
  options: {},
  tools: {},
});

const main = async () => {
  const plugin = (await import(PLUGIN_PATH)).default;

  // --- Plugin shape (works with or without Plugin.define branding) ---
  assert.equal(plugin.id, 'text2prod', 'plugin id');
  assert.equal(typeof plugin.setup, 'function', 'plugin setup is a function');

  // --- setup registers skills + the context hook ---
  const ctx = makeFakeCtx();
  await plugin.setup(ctx);

  const skills = ctx.state.skills;
  assert.ok(skills.length >= 15, `expected at least 15 skills, got ${skills.length}`);

  const ids = new Set(skills.map((s) => s.id));
  for (const expected of [
    'using-text2prod',
    'brainstorming',
    'writing-plans',
    'test-driven-development',
    'systematic-debugging',
    'subagent-driven-development',
  ]) {
    assert.ok(ids.has(expected), `skill ${expected} not registered`);
  }

  for (const skill of skills) {
    assert.ok(!skill.id.includes('/'), `skill id must be path-derived: ${skill.id}`);
    assert.ok(skill.path.endsWith(path.join(skill.id, 'SKILL.md')), `skill path for ${skill.id}`);
    assert.ok(fs.existsSync(skill.path), `skill path must exist: ${skill.path}`);
    assert.ok(skill.description.length > 0, `skill ${skill.id} needs a description to be advertised`);
    assert.ok(!skill.content.startsWith('---'), `skill ${skill.id} content must be frontmatter-stripped`);
  }

  // --- bootstrap injection ---
  assert.ok(ctx.state.hooks.context, 'context hook registered');
  const event = makeContextEvent();
  await ctx.state.hooks.context(event);

  assert.equal(event.system.length, 1, 'exactly one system part added');
  const text = event.system[0].text;
  assert.equal(event.system[0].type, 'text', 'system part type');
  assert.ok(text.includes('<EXTREMELY_IMPORTANT>'), 'bootstrap wrapper');
  assert.ok(
    text.includes('Do NOT use the skill tool to load "using-text2prod" again'),
    'already-loaded preamble',
  );
  assert.ok(
    text.includes('Invoke relevant or requested skills BEFORE'),
    'using-text2prod body present',
  );
  assert.ok(!text.includes('name: using-text2prod'), 'no YAML frontmatter in bootstrap');
  assert.ok(text.includes('`skill` tool'), 'tool mapping inlined');
  assert.ok(text.includes('`subagent`'), 'subagent mapping');
  assert.ok(text.includes('`shell`'), 'shell mapping');

  // --- dedup guard: hook is idempotent on an assembly that already has us ---
  await ctx.state.hooks.context(event);
  assert.equal(event.system.length, 1, 'no double injection');

  // --- pre-existing unrelated system parts are preserved ---
  const event2 = makeContextEvent();
  event2.system.push({ type: 'text', text: 'unrelated instruction' });
  await ctx.state.hooks.context(event2);
  assert.equal(event2.system.length, 2, 'existing system part preserved');
  assert.equal(event2.system[0].text, 'unrelated instruction');

  // --- bootstrap content is cached: a second setup reuses it, injects once ---
  const ctx2 = makeFakeCtx();
  await plugin.setup(ctx2);
  const event3 = makeContextEvent();
  await ctx2.state.hooks.context(event3);
  assert.equal(event3.system.length, 1, 'second instance injects once');

  console.log('test-plugin.mjs: all assertions passed');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
