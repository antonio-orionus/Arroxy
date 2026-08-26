# Arroxy Dual-Deploy Architecture Plan

> Status: Tranche 1 planned in full detail; Tranches 2-6 are direction-level design only.
> Owner: Antonio (OrionusAI@proton.me).
> Last revised: 2026-08-26.

This is the program-level record for shipping Arroxy in two distribution modes.
Section 9 is the tranche map. Sections 1-8 describe decisions that are settled;
sections 10-12 describe work that is directionally chosen but not yet designed
against the current tree.

The Tranche 1 implementation plan lives at
`docs/superpowers/plans/2026-08-25-core-shell-boundary.md`, which is **untracked**
(`.gitignore` excludes `docs/superpowers/*`). Anything from it that must outlive
the branch belongs here or in `docs/adr/`.

## 1. Goal

Ship Arroxy in two distribution modes from one codebase:

1. **Electron desktop app** (current): packaged for Windows/macOS/Linux via electron-builder, distributed through Scoop/Homebrew/Winget/Flatpak/GitHub Releases.
2. **Self-hosted server**: single docker image (`ghcr.io/antonio-orionus/arroxy:latest`) deployable via `docker compose up`, fits homelab stacks alongside *arr suite, Traefik/Caddy/nginx-proxy-manager, Portainer, etc.

Constraint: **no logic duplication**. The download engine lives in `core/` and is
consumed by both shells. Each shell is a thin glue layer.

## 2. Product decisions

These four shape every technical decision below.

1. **Mobile UX — same UI, made responsive.** One React app, one component set, good at ~390px. No mobile-only surface.
2. **File delivery — serve it.** Finished items offer *Save to device* and *Play here* over authenticated HTTP range routes.
3. **Desktop role — local-only, permanently.** Electron always runs its own in-process engine. No remote-connect setting. **Transport is chosen at build time; auth code never ships in the desktop bundle.**
4. **Auth — single admin + trusted-proxy mode.** `ARROXY_AUTH_PASSWORD_HASH` or a random password printed to stdout on first boot, plus opt-in forwarded-auth.

Decision 3 is why the boundary needs a dependency *direction* rule (`core/` must
never import `shell/`) rather than a shared abstraction layer. Decision 1 makes
the renderer's logger work load-bearing: one component set that runs in a browser
cannot import Electron.

## 3. Current state (measured 2026-08-26)

Measured against the tree, not estimated.

- `src/main/` is **10,377 LOC across 87 `.ts` files**. Only **11** import Electron at value level.
- **Seven** further files carry a dedicated `import type {BrowserWindow}` that erases at compile time. All three event bridges are in this group, which is what makes the event-sink work cheap.
- `electron-log` is in **32 files** — 27 in main, 5 in the renderer. Those five are the renderer's *only* Electron coupling; no other `electron` or `node:` import exists anywhere under `src/renderer/src`.
- `electron-store` is in exactly **4 files**, all in `src/main/stores/`.
- **56 IPC channels.** One `handle<T,R,E>(channel, schema, fn)` wrapper does zod validation; `handleRaw` has 24 call sites across seven modules. Three sites bypass both and use `ipcMain.handle` / `ipcMain.on` directly.
- `src/main/index.ts` is a **481-line composition root** already threading dependencies explicitly. `TokenProvider` is already an interface with two implementations selected at composition time.
- With DOM removed, **core and `src/shared` compile clean** — all 72 `src/shared` files pass. There is no existing DOM coupling to find.

### The 11 Electron-coupled files

| File | Value imports | Destination |
| --- | --- | --- |
| `index.ts` | `app`, `BrowserWindow`, `dialog`, `nativeTheme` | shell |
| `ipc/utils.ts` | `app`, `ipcMain` | core (ported) |
| `ipc/fileHandlers.ts` | `app`, `dialog`, `shell` | shell |
| `ipc/registerUpdaterHandlers.ts` | `app`, `ipcMain` | shell |
| `ipc/analyticsHandlers.ts` | `ipcMain` | core (ported) |
| `ipc/diagnosticsHandlers.ts` | `ipcMain` | core (ported) |
| `services/BinaryManager.ts` | `app` | core (injected) |
| `services/TrayManager.ts` | `Tray`, `Menu`, `nativeImage` | shell |
| `services/ClipboardWatcher.ts` | `clipboard` | shell |
| `token/providers/HiddenWindowTokenProvider.ts` | `BrowserWindow`, `session` | shell |
| `runtimeSmoke.ts` | `app` | shell |

### What still ties code to Electron

- `electron-log` across services and the renderer.
- `app.getPath('userData' | 'downloads' | 'logs')` for path resolution.
- `BrowserWindow` for PoT token minting.
- Native `Notification`, system tray, `ClipboardWatcher`.
- `electron-updater` v6.
- `webContents.send` for event projection.
- `ipcMain.handle` for command dispatch.

### Hardcoded couplings (not pluggable yet)

- yt-dlp invocation in `VideoPhase` (no `Downloader` interface).
- ffmpeg-only post-processing in `SidecarSubsPhase`.
- yt-dlp stderr regex parsing in `progressParser.ts`.
- Resume across restart reads `_arroxy.info.json` (yt-dlp-specific cache).

## 4. Architecture: core and shell

The engine's Electron coupling is small enough that most of it disappears by
**moving code to the right side of the line**, not by abstracting it. Ports are
reserved for the cases with a real second implementation arriving in Tranche 3.

### Cardinal rule

`core/` must never import `shell/`. The direction is `shared <- core <- shell`.
This is enforced by lint, not by convention — see section 8.

### Folder layout (target)

```
src/
  shared/                      portable: types, schemas, transition(), i18n,
                               error classification, LoggerPort interface
  main/
    core/                      env-agnostic engine
      services/                QueueService, DownloadService, ProbeService,
                               BinaryManager, phases/, download/
      stores/                  QueueStore, SettingsStore, RecentJobsStore (conf-backed)
      ipc/                     transport-neutral handler registration
      token/                   TokenProvider interface + MockTokenProvider
      ports/                   logger, eventSink, channelRegistry
      utils/
      shutdown.ts
    shell/
      electron/                boot, BrowserWindow, tray, clipboard, updater,
                               dialogs, HiddenWindowTokenProvider,
                               the three Electron port adapters,
                               registerElectronHandlers.ts (composition root)
      server/                  NEW in Tranche 3: HTTP/WS daemon, auth,
                               WS adapters, BgUtilTokenProvider
  preload/                     Electron bridge (relocated in Tranche 2)
  renderer/                    unchanged React; transport chosen at build time
```

**There is deliberately no `src/shared/ports/` directory.** The renderer aliases
`@shared`, so anything placed there is renderer-reachable — exactly the hole
decision 3 asks us to close. Only the `LoggerPort` *interface* (a type with no
state) lives in shared. Ports with state live in `src/main/core/ports/`.

### Layer diagram

```
┌─────────────────────────────────────────────────┐
│  shell/electron     │  shell/server             │  thin
│  ipcMain dispatch   │  HTTP routes + ws         │
│  3 adapters         │  3 adapters               │
│  native: tray,      │  auth, range routes       │
│  clipboard, dialogs │                           │
└────────┬────────────┴────────┬──────────────────┘
         │ construct + register │
         ▼                      ▼
┌─────────────────────────────────────────────────┐
│  core/  env-agnostic engine                     │  most of the LOC
│  - services/, phases/, stores/                  │
│  - ports/ (3 interfaces)                        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  shared/  pure (types, schemas, transition, …)  │
└────────────────────▲────────────────────────────┘
                     │
                renderer/  React, transport-agnostic
```

## 5. Ports: three, not six

A port earns its place when a second implementation genuinely arrives.

| Port | Why it is a port |
| --- | --- |
| **`LoggerPort`** | 32 files; `electron-log/main` hard-requires `electron`; the renderer needs it for decision 1. |
| **`EventSinkPort`** | One method, constructor-injected, real WebSocket implementation in Tranche 3. |
| **`ChannelRegistry`** | 56 channels, real WS implementation, and `handle()` is *already* ambient. Must carry both invoke and send shapes. |

### What was cut, and what was lost

| Candidate | Verdict |
| --- | --- |
| `ConfigStorePort` | **Cut.** `conf@15.1.0` is already in the tree as electron-store's own dependency and imports zero Electron. The four store classes already *are* the persistence abstraction. Nothing lost. |
| `HostPort` | **Cut.** After the moves, core's only `app.*` needs are `CommonPaths` (shell-provided data) and `isPackaged` / `resourcesPath` (injected values). Six of eight proposed members had zero core consumers. |
| `PathsPort` | **Cut.** Folded into the above — paths arrive as constructor arguments, which is the idiom this codebase already uses. |
| `CookieResolver` | **Cut for now.** Revisit in Tranche 3 when upload-based cookie resolution is actually built. |
| `Notifier` | **Cut.** No core consumer today; notification is a shell capability. |
| `Clock` | **Cut.** No test currently needs injected time. Add it when a test does. |
| `DialogPort` / `ShellPort` | **Cut.** Seven of `fileHandlers`' eight channels have no server implementation, and `chooseFolder(): Promise<string \| null>` *inverts* under a remote folder browser — the server would have to push a request to one client and correlate a reply, which no sink shape expresses. Register them from the Electron shell instead. |

Cutting `DialogPort`/`ShellPort` makes **Tranche 6 cheaper**: a remote folder
browser becomes a new portable channel plus a component, rather than unwinding a
port whose control flow inverts.

`TokenProvider` was never on this list because it is **already** a port — a
five-method interface with two implementations, selected at composition time.
Tranche 4 adds a third and changes nothing else.

### Ports-first, move-last

Moving files first leaves the tree uncompilable until every port exists, with
errors arriving all at once and no way to tell a real coupling from a path typo.
Landing each port green on the existing layout makes the final move mechanical,
and turns the gates into an acceptance test rather than a migration tool.

## 6. Transport seam

The switch is **build-time**, not runtime. `bootstrapBridge.ts` already declares
`type BridgeSource = 'preload' | 'browser-mock'` and switches on
`import.meta.env.MODE`; Tranche 2 adds a `'websocket'` arm.

This is a deliberate reversal of an earlier draft that picked the transport at
runtime by sniffing `window.appApi`. Decision 3 requires that auth code, the
login screen, and the WS client never enter the desktop bundle at all — which a
runtime branch cannot guarantee.

`createPreloadApi.ts` imports zero Electron and `PreloadIpcRenderer` is a clean
structural interface that a WebSocket client can satisfy, so the seam is real.
But it lives in `src/preload/`, which the renderer's vite config does not alias
and which builds as CJS — Tranche 2 must relocate it for the seam to be *usable*
rather than merely asserted.

## 7. Persistence

`conf@15.1.0` replaces `electron-store`, keeping the JSON files. `conf` is
already in the tree as electron-store's own dependency and imports zero Electron,
so this is a dependency deletion rather than an addition.

SQLite is **not** part of this program. The earlier draft specified
`better-sqlite3` + `kysely` for indexed queries at 10k+ items; that reasoning is
not disproved, it is simply not needed yet, and swapping the storage engine
during a boundary refactor would confound two changes. Revisit when queue scale
actually demands it.

## 8. Boundary enforcement

Two claims from the earlier draft were tested and **disproved**. Both failed
silently, which is what made them dangerous.

**`"types": []` does not block Electron.** It suppresses only *automatic*
`@types` inclusion. An explicit `import {app} from 'electron'` still resolves
through `node_modules/electron/electron.d.ts` and pulls the ambient namespace
back in — verified compiling at exit 0. `"types": []` also breaks core outright
(`Cannot find name 'process' / setTimeout / node:path`), because core is a Node
process that spawns yt-dlp and touches the filesystem nearly everywhere. Use
`"types": ["node"]`.

Note `process.resourcesPath` is declared in `electron.d.ts`, **not**
`@types/node`, so it must be injected as a value once Electron types are gone.

**The responsibilities are the reverse of the obvious guess:**

| Gate | Actually catches |
| --- | --- |
| `tsconfig.core.json` (`types: ["node"]`, no `DOM`) | DOM globals and `vite/client` globals |
| oxlint `no-restricted-imports` | **All Electron coupling** — value *and* type imports, plus `core -> shell` |

**The lint glob must be `@shell/**`.** Verified twice against oxlint 1.78.0:
`"@shell/**"` fires on nested paths, `"@shell/*"` does not, `"**/shell/**"` does
not. `@shell/*` is not inert — it matches single-segment specifiers and misses
only nested ones, which makes it *more* dangerous than a dead glob, because a
spot-check against a shallow import would falsely validate it. Always probe a new
glob with a **nested** path.

Keep both `electron-log` entries: `import log from 'electron-log/main'` **without**
the `.js` extension is not matched by the `electron-log/main.js` entry.

**A `/// <reference lib="dom" />` in any transitive `@types` package defeats
`compilerOptions.lib`.** Here that is `@types/make-fetch-happen/index.d.ts:1`,
reaching the program through a core file. Under the DOM-gate config,
`document.createElement('div')` typechecked at exit 0 until that package was
path-mapped to a stub. The DOM gate is regression insurance for Tranche 3+, not a
fix for a present-day problem.

The general lesson: **a gate that has never been watched failing is not known to
work.** Prove each one fails before trusting it. See
`.agents/memory/typescript-and-oxlint-boundary-gates.md`.

## 9. Tranche map

Sequenced so each tranche lands green on `main` and the desktop app keeps working
throughout.

| # | Scope | Status |
| --- | --- | --- |
| **1** | Core/shell boundary: three ports, `conf` swap, composition-root split, the move, the gates | **Planned in detail.** Zero behaviour change. |
| **2** | Transport seam: relocate `createPreloadApi` out of `src/preload/`, add the `'websocket'` arm to `bootstrapBridge.ts`, narrow `PreloadIpcRenderer`'s three `any` disables, add the renderer-bundle gate | Direction only |
| **3** | Server shell: HTTP/WS daemon, auth (section 12), WS `EventSink` and `ChannelRegistry` implementations, per-client scoping via `CallContext`, range routes for decision 2 | Direction only |
| **4** | PoT: `shell/server/BgUtilTokenProvider.ts` (section 10); widen the `ytDlpJsRuntime` discriminant to `'electron-node' \| 'node'` in `schemas.ts` and gate the `ELECTRON_RUN_AS_NODE` override on it | Direction only |
| **5** | Packaging: Dockerfile, compose, ghcr.io publish job, self-hosting docs (section 11) | Direction only. *Tranche number inferred — the Tranche 1 plan never names a Tranche 5.* |
| **6** | Remote folder browser: a new portable channel plus a component | Direction only |

Tranche 1 carries three deliberate deferrals into later tranches:

- **The renderer bundle is not gated.** Tranche 1 establishes the invariant (no `electron` or `node:` imports under `src/renderer/src`) but nothing enforces it. Tranche 2 adds the renderer analogue of the core gate.
- **A single-session assumption already lives in core.** `downloads.probeCancel()` carries no id and `ProbeService.cancelInFlight()` aborts *every* in-flight probe — with two browsers open, cancelling on one kills the other's probe. `ChannelRegistry` takes a `ctx: CallContext` parameter from the start so Tranche 3 can scope this as a *widening* rather than a breaking change.
- **The push path has no runtime validation.** The invoke path is zod-validated; `webContents.send` is not. Survivable today because both ends compile together from `@shared/types`; in Tranche 3 a stale cached browser bundle can talk to a newer server.

## 10. PoT minting strategy [Tranche 4]

> Chosen 2026-05-26 and not re-validated since. The option table below still
> reflects the intended direction; verify bgutil's current state before building.

YouTube increasingly demands PoT tokens. Token minting currently uses a
`BrowserWindow` to scrape the nsig decoder. There is no display server in docker.

| Option | Description | Cost | Verdict |
|---|---|---|---|
| A | Headless Chromium inside server image (puppeteer-core + alpine chromium) | +300MB image, more attack surface | fallback only |
| B | Sidecar container `brainicism/bgutil-ytdlp-pot-provider` | small server image, modular updates | **recommended** |
| C | Accept degraded YT (no PoT) | unreliable, support burden | last resort |

**Chosen: B (sidecar).** yt-dlp talks to the sidecar over HTTP via plugin; the
sidecar updates independently and is community-maintained; the server image stays
slim. This is the standard pattern in the self-host yt-dlp world.

The abstraction already exists. `TokenProvider` is a five-method interface with
`HiddenWindowTokenProvider` (Electron) and `MockTokenProvider` (tests) as its
implementations, selected at composition time. Tranche 4 adds
`BgUtilTokenProvider` reading `ARROXY_POT_PROVIDER_URL`, and an optional
degradation path when the sidecar is unreachable. Nothing else changes.

Tranche 1 renames `TokenProvider.releaseWindow()` to `release()` for exactly this
reason — a bgutil provider should not have to implement a no-op method named
after a `BrowserWindow`.

## 11. Docker + compose [Tranche 5]

> Written 2026-05-26 against the then-current tree. Build script names and output
> paths below predate the boundary work and must be re-derived before use.

### Dockerfile (multi-stage)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json bun.lockb ./
RUN apk add --no-cache python3 make g++ \
 && npm i -g bun \
 && bun install --frozen-lockfile
COPY . .
RUN bun run build:server && bun run build:web

FROM node:22-alpine
RUN apk add --no-cache ffmpeg ca-certificates tini su-exec
WORKDIR /app
COPY --from=build /app/dist/server ./
COPY --from=build /app/dist/web ./public
ENV NODE_ENV=production \
    ARROXY_DATA_DIR=/data \
    ARROXY_DOWNLOADS_DIR=/downloads \
    PORT=8000
EXPOSE 8000
VOLUME ["/data", "/downloads"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://localhost:8000/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

- **ffmpeg comes from alpine apk**, not the BtbN build the desktop app embeds. This is a deliberate reversal of the desktop strategy: dynamic library deps are fine inside a controlled container image, and the apk build is far smaller. The GPL attribution obligation in `THIRD_PARTY_NOTICES.txt` still applies.
- yt-dlp is still runtime-fetched into `/data/bin/` by `BinaryManager` — same flow, same checksum verification.
- `tini` as PID 1 for proper signal forwarding to spawned yt-dlp and ffmpeg children.
- Healthcheck for Docker/Portainer status.

### docker-compose.yml (homelab-friendly)

```yaml
services:
  arroxy:
    image: ghcr.io/antonio-orionus/arroxy:latest
    container_name: arroxy
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./arroxy/data:/data
      - /mnt/media/youtube:/downloads
    environment:
      ARROXY_POT_PROVIDER_URL: http://pot-provider:4416
      ARROXY_AUTH_PASSWORD_HASH: ${ARROXY_PASS_HASH}
      TZ: Europe/Berlin
    depends_on:
      - pot-provider
    labels:
      - traefik.enable=true
      - traefik.http.routers.arroxy.rule=Host(`arroxy.home.lan`)
      - traefik.http.services.arroxy.loadbalancer.server.port=8000

  pot-provider:
    image: brainicism/bgutil-ytdlp-pot-provider:latest
    container_name: arroxy-pot-provider
    restart: unless-stopped
```

Drop-in alongside an *arr stack. Reverse-proxy aware. Optional sub-path mount via
`ARROXY_BASE_PATH=/arroxy` (Vite `base` configured at build, runtime served from
the same prefix).

## 12. Auth [Tranche 3]

Homelab norm: single admin user, possibly behind Authelia/Authentik. Build small,
don't reinvent.

- First-run setup: env `ARROXY_AUTH_PASSWORD_HASH` set → use it. Unset → generate a random password and log it to stdout once (sonarr-style first-boot message).
- Cookie: `httpOnly`, `Secure` (when behind an HTTPS proxy), `SameSite=Lax`.
- Trust proxy: `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`.
- Healthcheck endpoint `/health` does **not** require auth.
- API endpoints under `/api/*` require a valid session. Range routes for decision 2 are authenticated.
- Static SPA at `/` redirects to `/login` if no session.
- No OIDC in v1. Add later if demand emerges.
- No multi-user in v1. Multi-user requires a `userId` FK on queue items, per-user output dirs and per-user cookies — deferred.

Per decision 3, **none of this ships in the desktop bundle.** The build-time
transport switch (section 6) is what makes that guarantee structural rather than
aspirational.

## 13. Risk surface

| Risk | Mitigation |
|---|---|
| PoT sidecar reliability against YT bot-protection | Test against current YT before declaring v1. Fallback: ship a custom puppeteer-based PoT image as an alt sidecar. |
| Cookies UX downgrade in web mode | Document clearly. Future: browser extension to export cookies, paste in UI. |
| Vite `base` path config breaks asset URLs | Per-shell build mode with separate base. Test both bundles in CI. |
| WebSocket reconnect storm on flaky network | On reconnect, server re-sends a full snapshot. Standard pattern. |
| Auth bypass via misconfigured reverse proxy | Default to refusing requests with no session. Document required proxy headers. |
| Knip reports core code as unreachable when only one shell uses it | Both shell entry points must be knip entries. CI fails if either is missing. |
| Increased build time / bundle size | Per-shell build keeps each bundle lean. Measure bundle size in CI, alert on regression. |
| Bgutil pot-provider stops being maintained | Pin version. Document the custom puppeteer alternative. |
| A boundary gate silently guards nothing | Prove every gate fails before trusting it (section 8). |
| Core *assumes* Electron without *importing* it | The gates cannot catch this. See section 14. |

## 14. Anti-patterns (watch for)

- **`if (isElectron)` branches in core** — should be impossible, since Electron is unreachable from core. If you reach for this, your port is wrong.
- **Duplicating logic between shells** — anything copy-paste between `shell/electron/` and `shell/server/` either belongs in `core/`, or is an adapter pair (which is fine).
- **`core/electron/` or `core/server/` subdirs** — wrong direction. Env-specific code lives in `shell/{env}/`.
- **A god-port `Platform`** — but equally, a port with only one implementation. Add a port when the second implementation arrives, not before.
- **`shared/` importing from `core/`** — cycle. Direction is `shared <- core <- shell`.
- **Bypassing the transport seam in the renderer** — direct `window.appApi.*` calls leak Electron coupling into the renderer.
- **Putting a stateful port in `src/shared/`** — the renderer aliases `@shared`, so that makes it renderer-reachable and defeats decision 3.
- **Trusting a gate you have never watched fail.** A wrong lint glob is a no-op, not an error.
- **Assuming Electron without importing it.** `ytDlpJsRuntime.ts` is the live example: it imports nothing from Electron, passes every gate, and unconditionally returns `ELECTRON_RUN_AS_NODE: '1'` with `kind: 'electron-node'` as its only union member. In a container that is meaningless noise. Tranche 4 fixes it.

## 15. Test strategy

> The layer ownership rules in `CLAUDE.md` govern. This section covers only what
> the dual-deploy split adds. Not re-validated since 2026-05-26 — an earlier
> draft assumed a `createCore(ports)` factory that this program does not build.

### Core

- Pure node tests: no Electron, no docker.
- Fakes for the three ports: an in-memory logger, a recording event sink, a recording channel registry.
- Services take dependencies through their constructors, which is already the idiom — tests substitute at construction, not through a factory.

### Shells

Thin integration tests per adapter:

- "the Electron logger forwards to electron-log"
- "the Electron event sink calls `webContents.send`"
- "the WS event sink broadcasts to connected clients only"
- "`BgUtilTokenProvider` POSTs a valid payload to the sidecar URL"

### End-to-end

- Electron: the existing fixture Product E2E suites, unchanged.
- Server: spin the docker image in CI, hit `/health`, add a queue item over the API, watch the websocket for a `started` event.

## 16. Distribution outcome

| Channel | Before | After |
|---|---|---|
| GitHub Releases | NSIS, portable.exe, DMG (arm64/x64), AppImage, tar.gz, Flatpak | unchanged |
| Scoop | `arroxy.json` manifest | unchanged |
| Homebrew | `arroxy.rb` cask | unchanged |
| Winget | `AntonioOrionus.Arroxy` | unchanged |
| Flatpak | bundle | unchanged |
| **ghcr.io** | — | **`arroxy:{version,latest,beta}` multi-arch image (NEW)** |

The existing release pipeline (`release.yml`) is unchanged. A docker publish job
is added in parallel.

## 17. Future / out of scope for v1

- Multi-user (per-user queues, output dirs, cookies).
- OIDC / SSO.
- Sub-path mount as runtime config (currently build-time).
- Webhook notifications on job completion.
- Prometheus `/metrics` endpoint.
- Plugin system for non-yt-dlp backends (aria2 for HTTP/FTP, libtorrent for magnets). Requires a `Downloader` interface abstracting `VideoPhase`. Separate plan.
- Browser extension for cookie export → server upload.
- SQLite-backed stores (section 7).
- End-to-end type inference across the WS boundary, e.g. via tRPC (section 19).

## 18. References / prior art

- **MeTube** — yt-dlp web UI, Python, simple, no PoT support.
- **Pinchflat** — Elixir/Phoenix, scheduled yt-dlp for shows.
- **TubeArchivist** — Python/Django + ES, full archival, heavy.
- **yt-dlp-web-ui** — Go, simple.
- **JDownloader2** — Java, multi-host, plugin arch, established UX patterns.
- **aria2** — JSON-RPC daemon for direct HTTP/FTP/Magnet; integrates with yt-dlp via `--downloader aria2c` (future plugin).
- **brainicism/bgutil-ytdlp-pot-provider** — community PoT sidecar, standard pattern in the self-host yt-dlp world.
- **Servarr stack** (Sonarr, Radarr, Lidarr, Prowlarr) — reference for homelab UX conventions: first-boot password, healthcheck, single-port exposure, reverse-proxy aware.

## 19. Decision log

| Decision | Reason |
|---|---|
| A compile-time boundary over feature flags | No `if (isElectron)` drift. The rule is enforced by lint, not convention. |
| **Three ports, not six** | A port earns its place when a second implementation genuinely arrives. Most Electron coupling disappears by moving code across the line instead. See section 5 for what each cut candidate would have cost. |
| Moving code beats abstracting it | Only 11 files import Electron at value level. Seven of them are native capabilities that belong in the shell outright, not behind an interface. |
| `conf` over `electron-store`; JSON stores retained | `conf` is already in the tree as electron-store's own dependency and imports zero Electron — a dependency deletion, not an addition. SQLite deferred (section 7). |
| Typed `ChannelRegistry`; tRPC deferred | The existing `handle<T,R,E>` wrapper already zod-validates all 56 channels. A registry port makes them transport-neutral without replacing working infrastructure. Revisit if end-to-end inference across the WS boundary proves worth the dependency. |
| Build-time transport switch, not runtime detection | Decision 3 requires that auth code, the login screen, and the WS client never enter the desktop bundle. A runtime branch cannot guarantee that. |
| `DialogPort` / `ShellPort` cut | `chooseFolder()` *inverts* under a remote folder browser. Registering native handlers from the Electron shell makes Tranche 6 cheaper, not harder. |
| PoT sidecar (option B) over embedded headless Chromium | Slim image, modular updates, community-maintained. |
| Hono over Fastify/Express | Lightweight, runs on Node/Bun/Deno, modern ergonomics. Not yet validated against the current tree. |
| No BullMQ / redis | Desktop is an in-process queue. Single-instance self-host is the same. Only reconsider at multi-machine worker scale. |
| Single admin auth in v1 (no OIDC) | Homelab norm. Authelia/Authentik can sit in front. |
| Same React app for both shells, responsive to ~390px | The transport seam swaps; UI code is identical. No mobile-only surface. |
| Adopt TC39 `using` / `Symbol.dispose` for disposables | Compiler-enforced cleanup, deletes roughly 80 LOC of plumbing. **Unscheduled** — not owned by any tranche. |
| Adopt the `tree-kill` package | Better cross-platform edge-case coverage than the current `processControl.ts`. **Unscheduled** — not owned by any tranche. |
