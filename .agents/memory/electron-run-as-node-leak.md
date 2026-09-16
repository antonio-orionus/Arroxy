---
name: electron-run-as-node-leak
description: Agent/editor shells spawned from an Electron app inherit ELECTRON_RUN_AS_NODE=1, which makes a hand-launched Electron run as plain Node and crash on `import {BrowserWindow} from 'electron'`.
type: reference
---

# Inherited ELECTRON_RUN_AS_NODE breaks hand-launched Electron

Shells started from an Electron-based host (agent harnesses such as T3 Code, some editors) can carry `ELECTRON_RUN_AS_NODE=1` in their environment (seen 2026-09-16). Any Electron launched from that shell then runs as bare Node, and the built main process dies at module load:

```
SyntaxError: The requested module 'electron' does not provide an export named 'BrowserWindow'
```

The message points nowhere near the cause. Check with `env | grep ELECTRON_RUN_AS_NODE`.

**How to apply:**
- Launch the built app with `env -u ELECTRON_RUN_AS_NODE ./node_modules/.bin/electron out/main/index.js`, or use a wrapper that already strips it: `bun run smoke:download`, the fixture E2E env (`buildFixtureEnv`), and the startup journeys (`scripts/startup/runJourney.ts`).
- Any new script that spawns Electron must `delete env.ELECTRON_RUN_AS_NODE` itself.
- Unrelated to Arroxy's own deliberate use of the variable: it is set only in the yt-dlp child-process env so yt-dlp can use Electron as its JS runtime (see CLAUDE.md "Electron-as-Node security note"). The runtime smoke fails if it leaks into the app process.
