# Explore memory and idle unload

What the Explore page costs in memory, why hiding it frees almost nothing, and what idle unload releases and costs, as measured.

| Lives in | What |
| --- | --- |
| `src/main/services/explore/ExploreViewHost.ts` | The deadline, the close, and the restore on return |
| `src/main/services/explore/exploreIdleUnload.ts` | Which pages may go, and the history they come back with |
| `src/shared/sites/youtube.ts` | `idleUnloadPaths`: home and search results |
| `tests/unit/explore-idle-unload.test.ts`, `tests/unit/explore-view-host-idle-unload.test.ts` | Policy and lifecycle contracts |
| `tests/e2e/fixture-explore-idle-unload.spec.ts` | Restore, kept pages, and sign-out in the real app |

## How it behaves

Five minutes after the user leaves the Explore tab (another tab, or the wizard taking a link), the page is closed if it is the site's home or search results and is settled: loaded, no error, no refused proxy, no media playing. Anything else stays, and is looked at again only after the next leave. A dialog over the page only hides it and starts nothing.

The close waits for the page's `beforeunload`, and Electron honors a veto for a `WebContentsView`; a vetoed page stays as it was. Coming back builds a new view on the same partition and restores the history with `navigationHistory.restore()`, after the ad blocker start and the proxy gate, like any first load. Sign-in, consent, interstitial and blank entries are dropped whole, and every entry is re-checked, because a restore is a browser-started load the navigation guards never see. Sign-out, turning Explore off and closing the window forget the history; it is kept in main-process memory only.

`ARROXY_E2E_EXPLORE_IDLE_MS` shortens the delay under the E2E harness; it is ignored otherwise.

## What restore keeps (Electron 44.6.0)

| Kept | Not kept |
| --- | --- |
| The active entry, Back/Forward | The page's JavaScript state: it is a new document |
| The Explore session: cookies, storage, cache (the restored page may come from the HTTP cache) | A scroll position newer than Chromium's last page-state commit: an entry's state is committed on navigation and periodically, so the last seconds of scrolling can be lost |
| | Feeds the site regenerates per load: YouTube's home is a new set of recommendations |

## Measurements

Native trials: the built app with the E2E harness (analytics and updater off, headless window), the Minimal style, a fresh profile per trial, live YouTube home then search, **no Playwright or CDP attached** (an attached debugger keeps a YouTube service worker's renderer alive after the page closes). Each stage is three samples two seconds apart after eight seconds of settling, summed over every process the app owns. Control trials use a delay that never fires, so the page is only hidden; both variants are sampled at the same moments.

macOS 27, Apple M5 Pro, per-process `proc_pid_rusage` `ri_phys_footprint`, MiB, median per trial:

| Stage | Control (3 trials) | Idle unload (6 trials) |
| --- | --- | --- |
| App, Explore never opened | 242–246 | 237–249 |
| Search results, tab shown | 489–581 | 504–609 |
| Tab left, before the deadline | 458–618 | 457–627 |
| ~14 s after the close | 424–443 (still hidden) | 243–244 in 2 trials; 427–491 in 4, the closed page's renderer still running |
| ~44 s after the close | — | 235–238 (2 trials measured) |
| Back on the tab, settled | 421–477 | 404–577 |
| Two more leave/return cycles, ~42 s after each close | one view throughout | 264–275 (3 trials measured; 328–330 in the one whose main process ran larger); one WebContents, no view |

Windows 11 ARM64 (2 vCPU VM), Electron's per-process private bytes, MiB, one control and two unload trials:

| Stage | Control | Idle unload |
| --- | --- | --- |
| Tab left, before the deadline | 466 | 501–515 |
| ~14 s after the close | 468 (still hidden) | 263; 453 with the renderer still running |
| A later leave/return cycle, ~40 s after the close | one view throughout | 258–260 |

Reading them:

- **Hiding frees little; closing frees the page's renderer**, about 190–230 MiB on both platforms. Once it has exited, the app is back to what it costs with Explore never opened.
- **The renderer can outlive the close by 15–40 seconds.** The page is gone at once (one WebContents left), but the site's process lingers, most likely for its service worker, and exits on its own. Sample too soon and the saving looks like nothing; that is timing, not a leak: repeated cycles settle at the same level.
- **Coming back costs a reload**: 2.9–5.0 s until search results showed, against ~30 ms for a page that was only hidden. Memory returns to the level of a freshly opened page.
- Single-run differences of tens of MiB are noise (the main process alone varied 94–148 MiB between trials).

## Reproducing

The trial script is not kept in the repo. To repeat it: launch `out/main/index.js` from a small Electron entry script with `ARROXY_E2E=1`, `ARROXY_E2E_HEADLESS=1`, a fresh `ELECTRON_USER_DATA` with the notice seen and the Minimal style, `ARROXY_YT_DLP_PATH` pointing at a local yt-dlp (otherwise the splash waits for the download), and `ARROXY_E2E_EXPLORE_IDLE_MS` set. Drive the tabs through the main window's `executeJavaScript`, sample `app.getAppMetrics()` PIDs (on macOS read `ri_phys_footprint` per PID; on Windows use `memory.privateBytes`), and leave at least 45 s after a close before reading the result.
