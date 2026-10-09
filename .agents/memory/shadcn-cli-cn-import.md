---
name: shadcn-cli-cn-import
description: `bunx shadcn add` writes `import {cn} from "cn"` and installs the unrelated npm package `cn`; revert the deps and fix the import by hand.
metadata:
  type: project
---

On 2026-10-09 `bunx shadcn@latest add skeleton` (shadcn 4.21, base-nova) generated `import { cn } from "cn"` instead of `@renderer/lib/utils.js`, added `"cn": "^0.4.0"` to `package.json`, and re-resolved `bun.lock` — despite `components.json` aliasing `utils` to `@renderer/lib/utils`.

**Why:** the CLI mis-resolves the `utils` alias in this repo; the unrelated `cn` package would ship as a runtime dependency (and violates exact-pin policy).

**How to apply:** after every `shadcn add`, run `git diff package.json bun.lock`; if it touched them, `git checkout package.json bun.lock && bun install --frozen-lockfile`, then rewrite the new file's import to `import {cn} from '@renderer/lib/utils.js'` and match the house style of the other `components/ui/*` files (tabs, `ReactNode` return type).
