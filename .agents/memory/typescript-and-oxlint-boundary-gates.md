---
name: typescript-and-oxlint-boundary-gates
description: How to actually enforce a module boundary here — tsconfig "types" does not block explicit imports, and oxlint no-restricted-imports needs a `**` glob.
metadata:
  type: reference
---

Two assumptions about boundary enforcement were tested and disproved on 2026-08-26 while planning the core/shell split. Both fail **silently**, which is what makes them worth recording.

**`"types": []` does not block `import {app} from 'electron'`.** It suppresses only *automatic* `@types` inclusion. An explicit import still resolves through `node_modules/electron/electron.d.ts` and pulls the ambient `declare namespace Electron` back in. Verified by compiling under `types: []`, `lib: ["ES2024"]`, NodeNext — exit 0.

What a restricted tsconfig *does* buy is dropping **DOM / DOM.Iterable / `vite/client`** globals. Blocking Electron is `no-restricted-imports`' job, and only lint catches `import type {BrowserWindow} from 'electron'`.

`"types": []` also breaks any Node-side project outright (`Cannot find name 'process' / setTimeout / node:path`). Use `"types": ["node"]`. Note `process.resourcesPath` is declared in `electron.d.ts`, **not** `@types/node`, so it must be injected as a value once Electron types are gone.

**oxlint `no-restricted-imports` patterns need `**`.** Against `import {x} from '@shell/electron/windowHandlers.js'` on oxlint 1.78.0: `"@shell/*"` does not fire, `"**/shell/**"` does not fire, **`"@shell/**"` fires.** A wrong glob is a no-op, not an error — so always prove a new gate fails before trusting it.

Careful: `@shell/*` is not inert — it matches *single-segment* specifiers (`@shell/foo.js`) and misses only nested ones. A spot-check against a shallow import will falsely validate a broken glob, so always probe with a nested path.

Do not confuse any of this with `tsconfig.json` `paths`, which correctly uses a single `*` (`"@shell/*": ["./src/main/shell/*"]`). Different syntaxes, both right in their own file.

**A `/// <reference lib="dom" />` in any transitive `@types` package silently re-adds DOM**, overriding `compilerOptions.lib`. Here that is `@types/make-fetch-happen/index.d.ts:1`, reaching the program via `src/main/services/binary/BinaryDownloader.ts`. Measured: a no-DOM tsconfig still typechecked `document.createElement('div')` at exit 0; path-mapping `make-fetch-happen` to a stub `.d.ts` made it fail correctly.

The general lesson behind all three: **a lint or tsconfig gate that has never been watched failing is not known to work.** Prove each one fails before trusting it.

Related: [[loc-limits-are-architecture-signals]]
