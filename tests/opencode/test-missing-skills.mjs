// Graceful-degradation test: when the plugin file is copied somewhere with no
// skills/ directory beside it (broken install), setup must not throw, must
// register no skills, and the context hook must be a no-op.
//
// Runs as a subprocess because the plugin caches skills/bootstrap at module
// level; a separate process gets clean caches against a temp copy.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const PLUGIN_PATH = path.join(REPO_ROOT, '.opencode/plugins/text2prod.js');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 't2p-opencode-missing-'));
try {
  // Copy the plugin so ../../skills resolves to a directory that does not exist.
  const copyDir = path.join(tmpDir, 'plugins');
  fs.mkdirSync(copyDir, { recursive: true });
  fs.copyFileSync(PLUGIN_PATH, path.join(copyDir, 'text2prod.js'));

  const driver = `
    const plugin = (await import(${JSON.stringify(path.join(copyDir, 'text2prod.js'))})).default;
    const state = { skills: [], hooks: {} };
    const ctx = {
      skill: { transform: async (cb) => {
        const editor = { added: [], list: () => [], get: () => undefined,
          add(s) { this.added.push(s); }, update() {}, remove() {} };
        await cb(editor); state.skills = editor.added;
        return { dispose: async () => {} };
      } },
      session: { hook: async (name, cb) => {
        state.hooks[name] = cb; return { dispose: async () => {} };
      } },
    };
    await plugin.setup(ctx);
    const event = { system: [], messages: [], options: {}, tools: {} };
    await state.hooks.context(event);
    console.log(JSON.stringify({
      skillCount: state.skills.length,
      systemParts: event.system.length,
    }));
  `;

  const out = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', driver],
    { encoding: 'utf8' },
  );
  const result = JSON.parse(out.trim().split('\n').pop());

  assert.equal(result.skillCount, 0, 'no skills registered when skills/ is missing');
  assert.equal(result.systemParts, 0, 'bootstrap not injected when skills/ is missing');

  console.log('test-missing-skills.mjs: all assertions passed');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
