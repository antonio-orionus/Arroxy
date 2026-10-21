# Release flags

Work meant for a later release merges to `main` in small PRs behind a **release flag**, never on a long-lived feature branch. `main` stays releasable at every commit: a release cut while the work is half done ships it switched off.

| What | Where |
| --- | --- |
| Registry and helper | `src/shared/releaseFlags.ts` |
| Example test | `tests/unit/release-flags.test.ts` |

## Defining and reading a flag

Flags live in one typed registry, `RELEASE_FLAG_DEFINITIONS` in `src/shared/releaseFlags.ts`; `ReleaseFlag` is derived from its keys, so a misspelled or deleted flag is a type error at every read:

```ts
const RELEASE_FLAG_DEFINITIONS = {
	batchRename: {summary: 'Batch rename in the queue', inRelease: false}
} satisfies Record<string, ReleaseFlagDefinition>
```

Read it where the entry point is drawn or registered:

```ts
import {isReleaseFlagOn} from '@shared/releaseFlags'

{isReleaseFlagOn('batchRename') && <DropdownMenuItem onClick={openBatchRename}>…</DropdownMenuItem>}
```

The names are TypeScript keys, not a `z.enum` in `schemas.ts`: a flag never crosses IPC, persistence or any other trust boundary, so there is nothing to parse.

## When a flag is on

| Where | Mode | Unreleased flags |
| --- | --- | --- |
| `bun run dev` (and every `dev:*`) | `development` | on |
| Scenario Workbench, UI kit (`bun run dev:mock`) | `browser-mock` | on |
| Vitest (`bun run test`) | `test` | on |
| Fixture product E2E (`test:e2e:fixtures`, `test:e2e:fixtures:ci`) | `production`, built with `VITE_RELEASE_FLAGS=on` | on |
| Release builds, cold start, Windows installer, `bun run build` | `production` | off |

The switch is build-time, not a packaged check: Vite replaces `import.meta.env.MODE` and `import.meta.env.VITE_RELEASE_FLAGS` with literals in main, preload and renderer alike, so a release build evaluates every unreleased flag to `false` and the gated entry point is unreachable. The gated code still ships in the bundle (the main bundle is not minified, and the lookup is a function call); unreachable, not removed, is the guarantee, which is why a flag gates the way in rather than the logic. `app.isPackaged` would be main-only, would need IPC to reach the renderer, and would leave fixture E2E (which runs an unpackaged production build) unable to tell the two apart.

`VITE_RELEASE_FLAGS=on` is set only by the fixture E2E scripts in `package.json`. Never put it in a `.env` file (Vite would load it into release builds; `tests/unit/release-flags.test.ts` fails on a tracked one) or a release workflow. A spec run by hand against `bun run build` sees flags off: build with `VITE_RELEASE_FLAGS=on bun run build` first.

## Rules

- **Gate entry points only.** A flag hides the way in: a menu item, a button, a route or screen, a settings row, the IPC handler or preload method that exposes the feature. The logic behind it (services, stores, parsers) is unconditional and fully tested, so turning the flag on changes no behaviour except reachability.
- **Tests run with the flag on.** Unit, component and Scenario Workbench coverage see the feature as it will ship. Never stub a flag off to test the shipped shape: off means the entry point is absent, nothing more.
- **Turning it on is one tiny PR.** Set `inRelease: true` once the feature is ready to ship; that PR changes nothing else, and its release is the one that ships the feature.
- **Delete it in the release after.** In the next release cycle, remove the registry entry and every `isReleaseFlagOn` read. The type error at each read is the checklist.
- **No user-facing setting.** A release flag is not a preference or an experiment toggle; users never see it.
