# Visual debugging

How to look at Arroxy's UI: the browser-mock renderer, the real Electron renderer over CDP, which browser to use and its recipes, locale simulation, and the GPU/backdrop fallback model. `AGENTS.md` keeps only the entry points.

| Lives in | What |
| --- | --- |
| `scripts/dev-env.ts` | `dev:mock`, `doctor`, per-checkout ports and paths |
| `src/renderer/src/browserMock.ts` | `window.appApi` stub for `browser-mock` mode |
| `src/renderer/src/dev/browserMockScenarios.ts` | Scenario Workbench states (`?scenario=<id>`) |
| `src/renderer/src/dev/probeSources/` | Real probes of many sites; the "Real sites" group (`?scenario=source-<id>`) |
| `src/renderer/src/components/layout/background/` | `AppBackdrop`, `CanvasSceneHost`, scene fallbacks |

## Renderer and Electron

Which browser:

- **In the Claude desktop app, its built-in browser.** It is already loaded in every session and is what sessions here use (about 20 times as often as anything else in October 2026). Start the browser-mock renderer with `preview_start` on the checkout's `arroxy-mock` entry in `.claude/launch.json` (it runs `bun run dev:mock` on the port `bun run doctor` reports), read with `read_page` / `get_page_text`, click with `computer`, check breakpoints and dark mode with `resize_window`.
- **Other agents (Codex, OpenCode), and anything that must attach to the real Electron app over CDP: `agent-browser`** (installed through mise; recipes below).
- **Playwright only for tests, traces and Electron `_electron.launch()`**, never for interactive checks.

For renderer-only visual iteration, **use the project wrapper first**:

```bash
bun run dev:mock
bun run doctor
```

This starts the Vite renderer in `browser-mock` mode with the repo-owned defaults. `bun run doctor` reports the computed renderer URL. Full Electron automation is slower and should be reserved for Electron-specific behavior.

If browser automation needs a fixed URL, pin the port through the wrapper instead of bypassing it:

```bash
# POSIX shells
ARROXY_RENDERER_PORT=5173 bun run dev:mock

# PowerShell
$env:ARROXY_RENDERER_PORT = "5173"; bun run dev:mock
```

Only bypass the wrapper when you intentionally need a custom Vite invocation, such as a different port or one-off debugging flags:

```bash
# Fallback only. From project root — uses src/renderer/vite.config.mjs (aliases + Tailwind + React)
bunx vp dev src/renderer --port 5173 --mode browser-mock
```

The renderer's `browserMock.ts` stubs `window.appApi` with simulated downloads, formats, settings when Vite runs in explicit `browser-mock` mode — no Electron needed. Electron dev and packaged builds must use the real preload bridge.

Update-banner scenarios (`update-direct`, `update-scoop`, `update-homebrew`, `update-winget`, `update-portable`, `update-flatpak`) are the only ones that emit an update event.

For realtime interaction with the real Electron renderer, expose Electron CDP through `electron-vite`:

```bash
REMOTE_DEBUGGING_PORT=9333 bun run dev
agent-browser --session arroxy-electron connect 9333
agent-browser --session arroxy-electron snapshot -i
```

Use this for live app inspection when behavior depends on the real preload bridge, IPC, native shell, or Electron rendering. In Linux headless shells only, wrap the launch with `xvfb-run -a`; on a desktop session, macOS, or Windows, launch normally without `xvfb-run`. If another dev server is already running, isolate the session with `ARROXY_RENDERER_PORT`, `ELECTRON_USER_DATA`, and `ARROXY_DEV_TMP`. Playwright can attach to the same endpoint with `chromium.connectOverCDP('http://127.0.0.1:9333')`, but prefer it for scripted proofs, traces, or fallback JS rather than first-pass interactive exploration.

### agent-browser workflow

1. `agent-browser skills get core` before the first browser task in a session.
2. `agent-browser --session arroxy-ui --args "--no-sandbox" open http://127.0.0.1:<doctor-port>/` when Chromium sandboxing fails in the dev VM.
3. `agent-browser --session arroxy-ui set viewport 1190 768` to check breakpoint behavior.
4. `agent-browser --session arroxy-ui snapshot -i` for interactive refs.
5. `agent-browser --session arroxy-ui screenshot output/playwright/<name>.png` for review artifacts.
6. `agent-browser --session arroxy-ui console` / `agent-browser --session arroxy-ui errors` for runtime issues.
7. `agent-browser --session arroxy-ui close` after the visual pass.

### Built-in browser recipes

1. `preview_start` with `{name: "arroxy-mock"}`, then `navigate` to `?scenario=<id>` or `?kit`.
2. Zoom for pixel inspection with `javascript_tool`, then a `computer` screenshot (or its `zoom` action):
   ```js
   const el = document.querySelector('.your-class');
   el.style.transform = 'scale(3)';
   el.style.transformOrigin = 'left center';
   el.style.zIndex = '999';
   // screenshot, then reset: el.style.transform = ''
   ```
3. Computed styles: `window.getComputedStyle(el).paddingLeft` etc. Bounding rect: `el.getBoundingClientRect()`.
4. Console errors: `read_console_messages`; failed requests: `read_network_requests`.

### Simulating locale / region

A browser keeps the system's `navigator.languages`. To test locale-driven behavior (e.g. the landing site's auto-redirects), run a short Playwright script with its own context (`bun locale-check.ts` from the repo root, where Playwright is a dev dependency):

```ts
import {chromium} from 'playwright'

const browser = await chromium.launch()
const context = await browser.newContext({locale: 'hi-IN', timezoneId: 'Asia/Kolkata', extraHTTPHeaders: {'Accept-Language': 'hi-IN,hi;q=0.9,en;q=0.5'}})
const page = await context.newPage()
await page.goto('https://orionus.dev/arroxy/')
await page.waitForTimeout(1500) // let the inline redirect script fire
console.log({url: page.url(), title: await page.title()})
await browser.close()
```

## Electron GPU / Backdrop debugging

`bun run dev:mock` proves renderer visuals in the browser, **not** Electron GPU behavior. Host Chrome can show the WebGL backdrop while `bun run dev` falls back because Electron runs inside the VM / Electron Chromium stack.

When Electron logs `webgl: disabled_off` and `glImplementationParts: '(gl=none,angle=none)'`, the renderer has no usable GL/ANGLE backend. If `bun run gpu:probe:force` still reports the same values, do not keep tweaking `ignore-gpu-blocklist` — the blocker is VM/driver/sandbox level.

Use the probes before changing backdrop code:

```bash
bun run gpu:probe          # Electron default GPU status
bun run gpu:probe:force    # adds ignore-gpu-blocklist + enable-gpu-rasterization
bun run gpu:probe:swiftshader # forces SwiftShader and checks a real hidden WebGL canvas
bun run profile:backdrop     # browser-side FPS / fallback profiler
bun run profile:backdrop:weak # forced software + 2 reported cores + 4x CPU throttle
```

On the Ubuntu VMware dev VM observed on 2026-06-09, Xorg had VMware DRI2/DRI3 direct rendering enabled, but Electron/Chrome still logged `MESA-LOADER: failed to open dri_gbm.so: Permission denied` and `WebGL1 blocklisted`. `gpu:probe:force` stayed `gl=none`, while `gpu:probe:swiftshader` enabled WebGL through `ANGLE ... SwiftShader`. Use `bun run dev:swiftshader` only for VM visual iteration; it is CPU WebGL and intentionally opt-in via `ARROXY_BACKDROP_SOFTWARE=1`.

Backdrop availability is adaptive, not screenshot-based: `AppBackdrop` draws the scene for the painted style and color scheme, and `CanvasSceneHost` probes WebGL on a scratch canvas first, rejecting software renderers unless `backdropSoftware=1` / `ARROXY_BACKDROP_SOFTWARE=1` opts in. When WebGL is unavailable or rejected, or the main-process graphics policy blocks it, or the context is lost, the host reports it and the app paints the base style (Minimal) instead; there is no CSS imitation of the backdrop (DESIGN.md §8, the Hardware-Or-Base Rule, ADR 0009). In browser-mock, preview a style with `?style=aurora|minimal` and the blocked-GPU fallback with `?gpu=blocked`. Use `backdropDebug=1` or `localStorage.backdropDebug = '1'` to log the decisions.

If testing Electron sandbox as the GPU blocker, the local Electron helper may need setuid before `bun run gpu:probe:sandbox` / `bun run dev:sandbox`:

```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```
