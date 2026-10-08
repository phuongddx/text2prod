# Text2Prod for OpenCode (V2)

See [`docs/README.opencode.md`](../docs/README.opencode.md) for the full guide.

Quick install (OpenCode V2 only):

```bash
opencode plugin add github:phuongddx/text2prod
```

This directory is the plugin *source*; it is what gets loaded when the
repository is opened in OpenCode (`.opencode/plugins/` discovery) or installed
as a package plugin via the repository root `package.json` `main` field.

Do not add local install artifacts (node_modules, lockfiles) here — they are
gitignored on purpose.
