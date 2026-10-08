# Text2Prod for OpenCode (V2)

Complete guide for using Text2Prod with [OpenCode](https://opencode.ai) **V2**.

## Installation

Requires OpenCode V2. V1 is not supported by this plugin (V1 plugin
implementations do not run in V2 and vice versa).

Install globally from this repository's git URL:

```bash
opencode plugin add github:phuongddx/text2prod
```

Or add it to the `plugins` array in your `opencode.json(c)` (global
`~/.config/opencode/opencode.jsonc` or project `.opencode/opencode.jsonc`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["github:phuongddx/text2prod"]
}
```

Plugin entries in `opencode.json(c)` are the V2 replacement for the V1
`plugin` array; if you still have a V1-era `"plugin": [...]` entry, rename the
key to `plugins`.

Restart OpenCode (or run `opencode service restart`) after config changes.

Verify by asking in a fresh session: *"Do you have text2prod skills?"* — the
model should know it has them before you load any skill explicitly.

OpenCode installs through its own plugin manager. If you also use Claude Code,
Codex, or another harness, install Text2Prod separately for each one.

## Usage

OpenCode advertises every Text2Prod skill (id, name, description) at each
model step and the model loads skills with the native `skill` tool — no
manual steps. To force one explicitly:

```
use the skill tool to load brainstorming
```

Skill IDs are the skill directory names (`brainstorming`, `writing-plans`,
`test-driven-development`, …). You can also mention a skill in your prompt as
`@brainstorming`.

## Updating

```bash
opencode plugin update
```

Unpinned git plugins are checked for updates automatically; pin a branch or
tag with a git spec such as `github:phuongddx/text2prod#v0.0.3` when you want
reproducible installs.

## How It Works

The plugin (`.opencode/plugins/text2prod.js`) does two things through the
OpenCode V2 plugin API:

1. **Registers the bundled skills** via `ctx.skill.transform`, so OpenCode
   advertises all Text2Prod skills natively and the model loads them with the
   `skill` tool.
2. **Injects the `using-text2prod` bootstrap** via `ctx.session.hook("context")`,
   the V2 replacement for V1's `experimental.chat.messages.transform`. The
   bootstrap rides the outgoing model call (never persisted history) and is
   re-applied on every agent model call, so it survives compaction with no
   extra lifecycle handling.

### Tool Mapping

Skills speak in actions rather than naming any one runtime's tools. On
OpenCode V2 these resolve to:

- "Read a file" → `read`
- "Create a file" / "edit a file" → `write` / `edit`; delete via `shell` (`rm`)
- "Run a shell command" → `shell`
- "Search file contents" / "find files by name" → `grep` / `glob`
- "Fetch a URL" / "web search" → `webfetch` / `websearch`
- "Dispatch a subagent" → `subagent` with the agent ID, a description, and a
  complete prompt (`background: true` for parallel work)
- "Create/update todos" → no native todo tool in V2; track progress in a plan
  file or `TODO.md`
- "Invoke a skill" → the native `skill` tool with the skill's exact ID

Machine names verified against the
[OpenCode V2 tools reference](https://opencode.ai/v2/docs/tools).

## Troubleshooting

### Plugin not loading

1. Check OpenCode logs: `opencode run --print-logs "hello" 2>&1 | grep -i text2prod`
2. Verify the `plugins` entry (V2 key name) in your `opencode.json(c)`
3. Confirm you are on OpenCode V2 — V1 hosts cannot load this plugin

### Skills not found

1. Ask the model: *"list the exact IDs of every skill you can load"*
2. Check that the plugin is loading (see above)
3. Each skill needs a `SKILL.md` with a `description` — skills without one are
   not advertised

### Skill references ask for external-directory permission

Installed skills live inside OpenCode's package cache, outside your project.
When a skill directs the model to read its bundled `references/`, OpenCode
may request `external_directory` permission for that path — approve it. In
non-interactive `opencode run` sessions the request is auto-rejected; the
model then proceeds from the skill body alone (degraded but functional).

### Bootstrap not appearing

1. Start a fresh session and ask *"Do you have text2prod skills?"*
2. If skills are advertised but the bootstrap is missing, check the logs for
   `ctx.session.hook` errors from plugin `text2prod`

## Getting Help

- Main documentation: this repository
- OpenCode V2 docs: <https://opencode.ai/v2/docs/>
- Plugin guide: <https://opencode.ai/v2/docs/build/plugins>
