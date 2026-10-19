# In-App Browser (Explore) Spec

Status: implemented and released in **Arroxy 0.5.0** (merged to `main` as PR #275). The manual matrix passed on
the product build (2026-10-15/16).
Updated: 2026-10-17 (executed build plan removed; stale references fixed). Spike, freshness measurements and
decisions D1–D6 date from 2026-10-13/16.

Research and rationale: [`youtube-auth-research.md`](youtube-auth-research.md).
**Read §2 and §6a before touching any of this.** The user-agent rule is
counter-intuitive and trivially broken by a well-meaning edit. Where this spec
and the research record disagree, this spec wins (the research keeps its
history; superseded points are marked there).

"Legacy" below is spec shorthand for what exists today — the Wizard (the **URL**
tab) and the `off` / `file` / `browser` cookie modes. It is not a glossary term
and never a UI label.

## Lives in

| Path | Role |
|---|---|
| `src/main/services/ExploreSessionService.ts` | **new** — owns the Explore partition: UA, proxy, permission/download policy, cookie reads, signed-in check and verification. Desktop adapter for `SessionCookieJarPort` |
| `src/main/utils/rendererUserAgent.ts` | Electron's original default UA (what every bland UA is derived from) and the app-wide renderer default, which the Explore session sets to its UA (see the UA rule) |
| `src/main/services/netscapeCookieJar.ts` | **new** — pure `ExploreCookie[]` → Netscape text, with domain filter |
| `src/main/services/exploreEscalation.ts` | **new** — pure: does a failed run escalate? Matches `(errorKind, rawError/stderr)` (D1) |
| `src/shared/sites/types.ts`, `src/shared/sites/youtube.ts` | `Site.explore` capability (D5); owned `ExploreCookie` type — no Electron types in `src/shared` |
| `src/main/services/cookiesResolver.ts` | exhaustive switch over `(cookiesMode, auth)`; `file`/`browser`/`off` results unchanged |
| `src/main/services/YtDlp.ts` | `auth` run option (replaces `withoutCookies`); per-spawn jar via the injected port inside `invokeOnce`; stale-cookie warning detection |
| `src/main/services/YtDlp.ts` `invokeWithRetry` | escalated runs bypass the PoT ladder (no anonymous token); `HiddenWindowTokenProvider` `CHROME_UA` fix shipped separately first (PR #263) |
| `src/main/services/ProbeService.ts` | probe-time escalation; `auth` on the probe result |
| `src/main/services/QueueService.ts` | carries `auth` from item to `StartDownloadInput`; persists escalation before the escalated spawn |
| `src/main/services/phases/VideoPhase.ts`, `SidecarSubsPhase.ts`, `SubtitleOnlyPhase.ts` | every `ytDlp.run` caller passes the job's `auth`; escalated jobs bypass `CookielessRetry` (D4) |
| `src/shared/schemas.ts` | `cookiesModeSchema` + `'explore'`; `jobAuthSchema`; `auth` on queue item, `probeInfoJsonRefSchema`, `startDownloadSchema`; new `common` fields |
| `src/shared/ipc.ts`, preload | `explore:*` channels, zod-validated in main |
| `src/renderer/src/components/wizard/DownloadProfilesHome.tsx` | the **existing** tab bar — Explore is added as one more tab |
| `src/renderer/src/store/wizard/probeErrorExperience.ts`, `DownloadProfilesSettingsTab.tsx` | `explore` mode in error guidance, settings and the ban warning |
| `src/main/services/download/startupTempSweep.ts` | sweeps temp jars orphaned by a crash |
| `design/in-app-browser/` | mockups (`Main.dc.html`, `MinWindow.dc.html`). **Gitignored (`/design/`), so local-only and not in the repo**; layout decisions are restated in [UI](#ui). The real minimum window is 720x760 (`WINDOW_MIN_*` in `src/shared/constants.ts`) |

## Goal

Add an **Explore** tab: an embedded browser where the user browses YouTube,
optionally signs in, and grabs what they find into the download flow. When a
download needs an account — sign-in required, private, age-restricted, or a bot
wall — Arroxy uses the Explore session's cookies for that job. This removes
manual cookie export and browser-picking, and fixes the "my cookies stopped
working" problem by construction (see *Cookie freshness — measured*).

## Non-goals

- **Not a replacement for the Wizard.** The `off` / `file` / `browser` cookie modes keep today's behaviour exactly; D6 *adds* `explore`.
- ~~Not a general-purpose browser.~~ Reversed by [ADR 0011](../docs/adr/0011-explore-browses-the-open-web.md): Explore loads any web page and any site's downloads can escalate. YouTube stays the home, the search and the only site with its own sign-in check.
- **Not multi-account.** One session, one signed-in identity.
- **Arroxy never handles credentials.** No reading, injecting, autofilling, or observing the sign-in form. The user types into Google's page; we only own the view it renders in.

## Decisions

### D1 — Explore cookies are used only when a job needs them

Downloads run signed out by default, exactly as today. A job **escalates** to
the Explore session only when a run fails in a way an account can fix, and only
if `cookiesMode` is `explore` (D6), `exploreEnabled` is on, and Explore is
signed in.

`ytdlp-errors` kinds alone do not separate these cases (a private video
classifies as `unavailable`; Watch Later and private playlists surface as
`unknown` / an empty playlist), so `exploreEscalation.ts` matches on
**`(errorKind, rawError/stderr)`**, app-side. The patterns are upstreamed to
`ytdlp-errors` later as a separately released change — never on this feature's
critical path.

| Escalates | Does not escalate |
|---|---|
| `loginRequired` | `ipBlock`, `rateLimit` — an account does not fix these, and signing in under throttling adds ban risk |
| `ageRestricted` | `geoBlocked`, `drmProtected` |
| `unavailable` **when** the message says private / members-only ("Private video", "members-only", "Join this channel") | `unavailable` otherwise (removed, terminated, …) |
| Account-only playlists: Watch Later / Liked (`list=WL`, `list=LL`), "playlist does not exist" on a private playlist | everything else |
| `botBlock`, **after** `invokeWithRetry`'s PoT ladder is exhausted | |

The members-only wording must be confirmed against a real members-only video
before the pattern is trusted.

**Escalation is decided in main and is sticky for the whole job.** Data flow:

1. **Probe escalation:** `ProbeService` re-runs the failed probe with the session and returns `auth: 'exploreSession'` on the probe result and on `probeInfoJsonRef` (the cached info-json is signed-in and must only ever be replayed by a signed-in run).
2. The renderer copies `auth` onto every queue item built from that probe — **playlist children inherit it**.
3. `QueueService` passes `auth` into `StartDownloadInput` (never `PreparedJob`, which describes *what* to download, not *as whom*).
4. **Video-phase escalation:** `VideoPhase` emits an escalation event that `QueueService` **persists before** the escalated spawn starts, so pause, crash or restart mid-run keeps the item signed in. The escalated run re-extracts — it never loads a signed-out probe's info-json.
5. Every `ytDlp.run` caller passes the job's `auth`: probe, `VideoPhase`, `SidecarSubsPhase`, `SubtitleOnlyPhase`. Title backfill stays anonymous (titles only; a failure there is harmless).
6. Probe entry points that must all honour this: Wizard single and bulk, hotkey, clipboard, profile quick-download, playlist hydration, Explore's Grab.

If Explore is not signed in, the error is shown as today plus a **"Sign in in
Explore"** action.

**Per-job budget.** Today a job can spawn up to ladder (3) × info-json fallback
(2) × auto-retry runs. Escalated runs get an explicit cap of **6 signed-in
spawns per job attempt**; exceeding it fails the job with the normal error
rather than retrying further. Tune from logs.

Rationale: the account is spent only where it unlocks something (yt-dlp
maintainers' and other apps' advice); the signed-out path stays primary;
signed-in sessions sometimes get *fewer* formats (why `CookielessRetry` exists).

### D2 — Sign-in happens inline in the Explore pane

The user clicks YouTube's own Sign in; Google's page renders in the same view —
the flow the spike verified on three platforms. No separate window. Reversible:
a dedicated window would wrap the same engine and session if the inline flow
proves cramped (e.g. reCAPTCHA at the 720x760 minimum window).

### D3 — Explore is on by default, with a "New" badge; the URL tab stays the launch tab

Arroxy already has a tab bar (`URL | Downloads | Profiles | Settings`, in
`DownloadProfilesHome.tsx`); Explore joins it right after URL —
`URL | Explore (New) | Downloads | Profiles | Settings`. Conditions:

1. **Lazy load.** Nothing in the Explore partition loads until the user first opens the tab — no YouTube page, RAM/CPU, autoplay, or Google tracking cookies for users who never use it. The view is torn down with the window; the session persists.
2. **Kill switch.** `exploreEnabled = false` hides the tab **and disables escalation**. The UA token is a per-user setting (validated, see the UA rule): support can tell users how to change it, but v1 has **no remote override** — a blocklisted token needs either user action or a release.
3. **Ban-risk notice** on Explore's first-run screen, before any sign-in: a downloader session carries account risk; use a secondary account (yt-dlp's own guidance).
4. **Wizard flows are unchanged.** The tab bar gains one tab; downloads started from the URL tab follow the selected cookie mode (D6), which is how they gain escalation.

### D4 — Escalated jobs never drop cookies

`CookielessRetry` does not apply to a job whose `auth` is `exploreSession`: it
escalated because the signed-out run failed, so a cookieless retry would fail
again. A quality-limited result on such a job is kept and reported, as today.
`CookielessRetry` is unchanged for `file` / `browser`.

### D5 — v1 is YouTube-only, structured for more sites

Site-specific facts live in the site adapter as an optional `explore`
capability, using an owned cookie type so `src/shared` stays Electron-free:

```ts
// src/shared — no Electron imports
interface ExploreCookie { name: string; value: string; domain: string; hostOnly: boolean; path: string; secure: boolean; httpOnly: boolean; session: boolean; expirationDate?: number }

interface SiteExplore {
  homeUrl: string                       // where the tab opens
  accountCookieHosts: HostRule[]        // account cookies that never reach another site's jar (ADR 0011)
  cookieDomains: string[]               // a job's jar contains only these domains' cookies
  isSignedIn(cookies: ExploreCookie[]): boolean
}
```

YouTube's values:

- `cookieDomains`: **`youtube.com` only.** yt-dlp authenticates YouTube with YouTube's cookies; `.google.com` session cookies (which carry Gmail etc.) never reach a temp file. **Verified 2026-10-13:** a youtube.com-only jar (21 of 54 cookies) authenticates Watch Later exactly as the full jar does.
- `isSignedIn`: `LOGIN_INFO` plus a SAPISID-family cookie (yt-dlp's own `_has_auth_cookies` rule). Cheap and synchronous — a *presence* check; see verification below for *validity*.
- `accountCookieHosts`: `youtube.com`, `google.com`, `google.<cc>` — see Cookie scope for other sites.

Adding a site = an `explore` entry **plus** re-running the sign-in and freshness
checks for that site. Not in v1: site switching, per-site sign-in status,
multi-site settings.

### D6 — Explore is a cookie mode

`cookiesMode` becomes `off | file | browser | explore`; the selected mode is the
one identity source, so a job never mixes two identities.

| Mode | Behaviour |
|---|---|
| `explore` | D1: anonymous by default; escalation uses the Explore session when signed in |
| `file`, `browser` | unchanged: those cookies on every run, `CookielessRetry` as today; no escalation |
| `off` | no cookies, ever — a real opt-out even when signed in to Explore |

- **Auto-switch at first Explore open, not at app start.** The first time a user opens the Explore tab with `cookiesMode === 'off'`, it switches to `explore` silently (they are opening the account feature). Users who never open Explore keep exactly today's settings and behaviour — no change to their error guidance, ban warning, or downgrade safety. A marker (`exploreModeAutoSwitched`) makes it happen once, so a later deliberate `off` is respected. The schema default stays `off`.
- **`file` / `browser` are never switched automatically** — those users are signed in today; a silent switch would break their gated downloads until they sign in to Explore, change on-every-run behaviour to on-demand, and may move them off a deliberately chosen secondary account.
- **In-tab nudge:** opening Explore while `cookiesMode` is `file` / `browser` (or a deliberate `off`) shows an alert naming the current mode — "Downloads use your cookies file, not your Explore sign-in" — with **[Use Explore sign-in]** (sets `cookiesMode` to `explore`; reversible in Settings) and **[Not now]** (remembered until `cookiesMode` next changes). It takes its own row above the browser view and never stacks with the first-run notice. Reuse the `CookiesErrorAlert` / `OpenCookiesSettingsButton` patterns.
- **Every `cookiesMode` consumer handles `explore` explicitly:**
  - `resolveCookies` becomes an exhaustive switch over `(mode, auth)` — today any non-`off`/`file` mode falls through to `browser` (`cookiesResolver.ts`), which would pass `--cookies-from-browser` to `explore` users with a leftover browser setting.
  - `probeErrorExperience.ts` (bot-wall / needs-cookies guidance keyed on `mode === 'off'`): under `explore`, signed out → "Sign in in Explore"; signed in → today's "enabled" variant.
  - Settings: `explore` option, and the ban warning shown for it (it is shown for any non-`off` mode today).
  - `ProbeService.probe`'s option type uses `CookiesMode`, not a hand-written literal union.
- **Downgrade:** an older build fails to parse `cookiesMode: 'explore'` and resets the `common` settings section to defaults (`SettingsStore`). Accepted and documented in the CHANGELOG — it only affects users who chose Explore.

## The rule that must not be broken

**Never claim to be a browser we are not.**

Google's sign-in gate does not check the engine — it checks for deception. A UA
string asserting Chrome/Brave/Firefox/Safari while Client Hints
(`Sec-CH-UA`, `navigator.userAgentData`) say otherwise is a detectable lie and
gets `/v3/signin/rejected`. A bland token that asserts nothing checkable passes
the full `GlifWebSignIn` flow.

- The Explore UA is Electron's default UA with the `Electron/<v>` and app-name tokens **replaced by the bland token `Desktop/1.0`**. Platform and Chromium version stay real so they agree with the client hints.
- **Not `Arroxy/<version>`.** It passes too, but names the downloader — a blocklist target and an account-flagging signal.
- **Never override Client Hints** to match a spoofed UA. That is the failure mode, not the fix.
- **The Explore UA is also the app-wide renderer default** (`app.userAgentFallback`). The session UA does not reach out-of-process frames: a cross-site iframe runs in its own renderer, which only knows the app-wide default. Left at Electron's default, such a frame's `navigator.userAgent` and requests named `Electron/<v>` and the app while its page said `Desktop/1.0`. Cloudflare's Turnstile frame (`challenges.cloudflare.com`) then passed its challenge under one UA, the site's `cf_clearance` was checked under the other, and the challenge came back after every pass (seen on vimeo.com, Electron 44.6.0). The ad blocker, the permission lockdown and the failed WebRTC STUN lookups play no part. The challenge passes with all three left as they are. Every bland UA is derived from Electron's original default, captured before it is replaced, so a token change never stacks a second token.
- `exploreUserAgent` stores **only the token**, validated as `^[A-Za-z][A-Za-z0-9._-]*/[A-Za-z0-9._-]+$` and rejected if it names a browser (`Chrome`, `Firefox`, `Safari`, `Edg`, `OPR`, `Brave`, `Electron`, the app name). A pasted full UA is rejected, not stored.
- **UA invariant test:** the Explore UA must equal the platform's Electron default with exactly the `Electron/` and app-name tokens replaced by the configured token — no other change. Fails the build on any `Electron/`, app-name, or browser-identity token.

## Glossary additions

Add to [`GLOSSARY.md`](../GLOSSARY.md) (implementation-free, per its rules; reuse
the existing **Wizard** term rather than adding "Legacy"):

- **Explore** — the in-app browser tab where the user browses a supported site and may sign in.
- **Explore session** — the persistent, app-owned browsing identity behind Explore.
- **Explore cookies** — cookies read from the Explore session at the moment a download needs them. (Not "session cookies", which already means cookies that expire with the browser.)
- **Escalation** — switching one download from anonymous to the Explore session after a failure an account can fix.
- **Job auth** — the identity a download runs as: anonymous, or the Explore session after escalation; fixed for the rest of that download.

## Architecture

### Layering

Core download code never imports Electron or `ExploreSessionService`. The
session reaches yt-dlp through a port injected via `InvokeOptions`:

```ts
interface SessionCookieJarPort {
  // Writes a fresh, domain-filtered jar for the site, runs fn, deletes the jar — always.
  withJar<T>(siteId: SiteId, fn: (jarPath: string) => Promise<T>): Promise<T>
}
```

`ExploreSessionService` is the desktop adapter. This keeps the core/shell split
in [`dual-deploy-plan.md`](dual-deploy-plan.md) intact and makes the jar lifecycle unit-testable with a
fake port.

### Main process — `ExploreSessionService`

Owns the partition; nothing else may touch it.

```ts
class ExploreSessionService implements SessionCookieJarPort {
  getSession(): Session                          // persist:arroxy-explore
  getUserAgent(): string                         // Electron default with the token swapped
  readCookies(siteId: SiteId): Promise<ExploreCookie[]>   // live read, never cached, filtered to cookieDomains
  hasAuthCookies(siteId: SiteId): Promise<boolean>        // site.explore.isSignedIn — presence only
  verifySignedIn(siteId: SiteId): Promise<boolean>        // hidden page in the partition reads LOGGED_IN — validity
  signOut(): Promise<void>                       // clearStorageData on the partition
  withJar<T>(siteId: SiteId, fn: (jarPath: string) => Promise<T>): Promise<T>
}
```

Session setup, applied before anything loads:

- **`WebContentsView`**, not `<webview>` and not a second `BrowserWindow`; `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, no preload with app privileges. On Linux the app already runs with `--no-sandbox` (`build/afterPack.mjs`), so `sandbox: true` is a no-op there — an accepted, existing platform risk, stated rather than hidden.
- **Proxy:** the user's proxy setting is applied to the partition (as `HiddenWindowTokenProvider` does for its own), and proxy-auth `login` events are answered from it — otherwise cookies rotate from a different IP than yt-dlp uses. A changed proxy setting is re-applied to an open view at once. A setting the partition refuses, and a page load that fails in the proxy (`ERR_PROXY_*`, `ERR_TUNNEL_CONNECTION_FAILED`, `ERR_SOCKS_CONNECTION_FAILED`, `ERR_MANDATORY_PROXY_CONFIGURATION_FAILED`), show the view's proxy error with a way to Settings; any other main-frame failure shows the generic load error. A **refused setting fails closed**: the partition still routes the old way, so the open page is stopped and replaced by `about:blank`, page navigations are refused, and no committed navigation clears the error. Only a setting that applies (a re-apply or Retry) clears it and reloads the page the view was on; the blank page leaves no history entry.
- **Permissions:** `setPermissionRequestHandler` / `setPermissionCheckHandler` deny everything except what sign-in needs (to be confirmed in the manual matrix: WebAuthn/security keys, possibly clipboard-read for paste). Deny camera, mic, geolocation, notifications, MIDI.
- **Downloads:** `will-download` is cancelled; downloads go through Arroxy's pipeline only.
- **Devtools:** disabled when `app.isPackaged`; the gate is unit-tested (mock E2E runs unpackaged and cannot prove it).
- **YouTube's first-load self-reload** (`?themeRefresh=1`, `ERR_ABORTED`) is normal navigation, never a failure.

### Cookie handoff

```ts
type ResolvedCookies =
  | {kind: 'file'; path: string}
  | {kind: 'browser'; browser: CookiesBrowser}
  | {kind: 'session'; siteId: SiteId}   // explore mode + auth 'exploreSession'
```

`resolveCookies(settings, auth)` is an exhaustive switch over the mode; it stays
synchronous. Signed-in checks happen at escalation time and on the stale-cookie
path, not in the resolver.

**Never store a jar.** For `kind: 'session'`, `invokeOnce` calls
`port.withJar(siteId, jarPath => spawn(... '--cookies', jarPath ...))`: a fresh
read, a domain-filtered Netscape jar in Arroxy's own temp dir (`0600` on
macOS/Linux; on Windows the per-user temp dir's ACL is the protection — `0600`
means nothing there), deleted in a `finally`. The jar is scoped to **one
spawn** — `invokeOnce`, not `invokeWithRetry`, which can spawn up to three
times. A crash can orphan a jar, so the startup temp sweep deletes leftovers.

**Why exported cookies die, and why this design avoids it** (yt-dlp maintainers,
[#8227](https://github.com/yt-dlp/yt-dlp/issues/8227),
[#12482](https://github.com/yt-dlp/yt-dlp/issues/12482),
[#14872](https://github.com/yt-dlp/yt-dlp/issues/14872), PR
[#13014](https://github.com/yt-dlp/yt-dlp/pull/13014)): there is no time-based
expiry. Page JS in any open YouTube tab calls `RotateCookies` (~10 min cadence),
replacing `__Secure-1PSIDTS`/`3PSIDTS`; the server then rejects older copies by
clearing `LOGIN_INFO`. A copy whose source session is never used again lasts
days–weeks. Every app that captures cookies once (Seal, YTDLnis, Tyrrrz
YoutubeDownloader, Grayjay) has "login expired" reports. Because the Explore
session *is* the rotating browser, a read immediately before each spawn always
carries the newest values.

**Discard yt-dlp's write-back; never merge it into the session.** `--cookies FILE`
is read *and* rewritten on exit (`YoutubeDL.close()` → `cookiejar.save()`, not
atomic, no opt-out). The rewrite adds yt-dlp's own `PREF` (`hl=en`, `tz=UTC`),
`SOCS`, drops `HttpOnly`, and — on a stale run — carries the cleared
`LOGIN_INFO`, which merged back would sign Explore out. Measured: yt-dlp changes
only `PREF` and the `SIDCC` family; it never receives rotated sign-in cookies.

**Cookie freshness — measured 2026-10-13** (macOS, signed-in Explore-style
partition, hidden `youtube.com` page kept loaded and reloaded every 15 min to
stand in for a user browsing; 12 checks over 3 h; Watch Later as oracle):

| Finding | Evidence |
|---|---|
| The session rotates `__Secure-1PSIDTS`/`3PSIDTS` **every 10.0 min** while a YouTube page is loaded, and immediately on the first load after idling | 18 rotation pairs at 8.9, 19.0, 29.0 … 179.6 min |
| A copy **one rotation behind still authenticates** | 6/6 passes |
| A copy **two or more rotations behind is rejected** — yt-dlp warns *no longer valid* and runs signed out | 6/7 fails (one 2-behind copy passed at tick 4) |
| ⇒ a snapshot is safe for **≥ 10 min** after capture (until the 2nd rotation), at most ~20 min | |
| Presenting rejected copies did **not** harm the live session — no theft-detection revocation | 6 stale presentations; every following fresh check passed, `LOGGED_IN` stayed true |
| A fresh read before a spawn **always** authenticated | 12/12 |
| yt-dlp's write-back on success changes only `PREF`, `SIDCC` family, `__Secure-YNID`; on a rejected run it **deletes every auth cookie** (`LOGIN_INFO`, `SID`, `SAPISID`, `__Secure-1PSID`, …) | write-back diff per run, names only |

Consequences: per-spawn fresh reads are sufficient because the queue runs one
yt-dlp process per item (playlist items are separate queue items) and auth is
exercised in a spawn's first seconds. The only exposed path is a single spawn
whose authenticated requests span >10 min while a YouTube page is open in the
partition (e.g. enumerating a huge channel) — stale-cookie handling below
covers it. The write-back result makes "never merge" a hard rule.

### Presence vs validity, and stale-cookie handling

Cookie *presence* (`hasAuthCookies`) is not proof of a valid session: a password
change leaves a complete jar that authenticates nobody (research §6). And with
no YouTube page loaded nothing rotates, so simply re-reading the jar returns the
same cookies.

- **Before escalating:** `hasAuthCookies` must pass (cheap). No validity check and no keep-alive page: **measured 2026-10-13/14**, a session left 10 h with no YouTube page loaded (only signed-in yt-dlp runs in between, which do not rotate sign-in cookies) still authenticated yt-dlp from a fresh jar, and a page load afterwards reported `LOGGED_IN: true` — consistent with yt-dlp maintainers' "unused sessions last days–weeks". Validity is checked only when yt-dlp rejects the cookies (below).
- **On yt-dlp's warning** ("The provided YouTube account cookies are no longer valid…" — a warning, not an error; no `ytdlp-errors` kind): call `verifySignedIn`. If `LOGGED_IN` is true, retry the spawn **once** with a fresh jar. If false, Explore's `signedIn` turns false (and stays false over cookie presence until the site itself reports signed in again) and the job fails with the "Sign in in Explore" action, rather than silently degrading. There is no separate signed-out notice: the failed download's guidance is the signal.
- Both retries count against the per-job signed-in spawn cap (D1).

### Concurrency and pacing

- At most **2 escalated spawns run concurrently**; further escalated jobs wait (anonymous jobs are unaffected).
- At least **5 s between the starts of escalated spawns** (yt-dlp wiki: ~2,000 videos/hour signed-in; 5–10 s between items recommended).
- Concurrent `withJar` calls are safe: each gets its own jar, and reads never mutate the session.

### Navigation policy

Superseded by [ADR 0011](../docs/adr/0011-explore-browses-the-open-web.md). Rules
govern **top-level (main-frame) navigations**; sub-frames are not policed, like
subresources.

- **Any `http:` / `https:` page loads in the view**, whether clicked, scripted, redirected to or typed. Nothing is ever handed to the system browser.
- **Any other scheme** (`javascript:`, `file:`, `data:`, an app's own protocol) is blocked and only its host logged.
- `setWindowOpenHandler` → `{action: 'deny'}`; a web target loads in the view only within the user-gesture window (a click or key press in the view within the last second), so a script or a sub-frame cannot replace the page without a click.
- Typed, Google's sign-in, account and consent hosts are refused (see the address bar); clicked on a page they load.
- Never inject scripts into `accounts.google.com` — not for convenience, not for diagnostics. (`verifySignedIn` reads `ytcfg` on `youtube.com` only.)

### Cookie scope for other sites

A run's Explore cookies follow its URL (`exploreCookieScopeFor`): a YouTube URL
gets the youtube.com-only jar (D5); any other web URL gets every cookie in the
session except the account cookies of the sites with an Explore capability
(`SiteExplore.accountCookieHosts`: `youtube.com`, `google.com`, `google.<cc>`).
For such a URL the session counts as signed in when it holds a cookie the host
would be sent, and `verifySignedIn` answers `unknown`. Escalation is unchanged
(D1). A failure escalates on any site when yt-dlp's own login hint offers cookies (`Use --cookies…`, the hint every extractor's shared login helper appends), when the extractor asks for cookies in its own words, or when it names private or subscriber-only content; a password-only hint (`Use --username and --password`) never escalates, since Arroxy never passes credentials. Measured against yt-dlp's extractor sources: all 116 cookie-hint login errors escalate, none of the 22 password-only ones. Such a run also sends `--add-headers User-Agent:<Explore UA>`: Cloudflare's
`cf_clearance` holds only under the user agent that earned it (measured on
vimeo.com/watchlater: 403 `Cf-Mitigated: challenge` under yt-dlp's UA, 200
under Explore's).

### PO tokens — never the anonymous token on an escalated run

Today every YouTube media run (and explicit single-video probe) mints a PO
token from the **anonymous** `HiddenWindowTokenProvider` and sends it with
`visitor_data` (`YtDlp.ts` `invokeOnce`; `TokenService` has one provider, one
cache). An escalated run would therefore pair signed-in cookies with a token
bound to a different, anonymous identity — the mismatch the research measured
as "cookies + `web.gvs` token → 0 formats". So:

- **An escalated run never receives the anonymous token.** Per the recommendation below, v1 sends it no token at all; if account-bound minting is ever needed, `TokenService` becomes keyed by identity (`anonymous` vs `account`, the latter minted inside the Explore partition and passed as `data_sync_id`).
- **Measured 2026-10-13** (macOS, yt-dlp `2026.10.10` nightly, public 4K video `aqz-KE-bpKQ`, `best-quality` profile; the signed-in jar was youtube.com-only and verified authenticated via Watch Later):

  | Run | Clients yt-dlp used | Result |
  |---|---|---|
  | Anonymous + anonymous token (today's pipeline, `smoke:download`) | `tv_samsung`, `visionos`, `web_embedded` | `401+258`, **2160p**, 1 attempt |
  | Signed-in + anonymous token (`smoke:download --cookies file:`) | `web_embedded`, `tv_samsung` | `401+258`, **2160p**, 1 attempt |
  | Signed-in, **no token** (raw yt-dlp) | `tv_samsung`, `web_embedded` | `401+258`, **2160p**; no withheld-formats warning |

  The research's "cookies + `web.gvs` token → 0 formats" came from the old `mweb` path and **does not reproduce** on current yt-dlp. These runs say nothing about the anonymous token's effect on a signed-in run (see the correction below); it would still pair two identities.

  **Correction (2026-10-19):** the two "+ anonymous token" rows never reached yt-dlp with a token. The pipeline then sent the token in one `--extractor-args youtube:` block and the player clients in a later one, and yt-dlp keeps only the last block per extractor, so all three rows ran tokenless. They show that tokenless runs reach 2160p on this video, not what a token changes. Runs with cookies (any source) now get no anonymous token at all; see [download-recovery-plan.md](download-recovery-plan.md).
- **Decided 2026-10-14 (reverses the earlier "build account-bound minting with escalation"):** escalated runs send **no PO token** in v1. It removes the identity mismatch, measured full quality, and drops the largest piece of the escalation work (minting inside the Explore partition, an identity-keyed `TokenService`). The pipeline's existing withheld-formats signal (`formatsWithheld`) is logged per escalated run; account-bound minting (`data_sync_id`) is added only if that signal shows up on escalated jobs. Not yet covered by the measurement: age-restricted / members-only videos, which need an age-verified account.
- Signed-in runs currently use `web_embedded` / `tv_samsung` / `web` ([yt-dlp #17805](https://github.com/yt-dlp/yt-dlp/pull/17805)); `android_vr` does not support cookies. Do not hard-code client assumptions; they move with yt-dlp releases.
- **`CHROME_UA` fix shipped separately, first (PR #263):** `HiddenWindowTokenProvider` used to declare `X11; Linux x86_64 … Chrome/130` regardless of host — the same class of lie as above, affecting every user's minting. The constant is gone from `src/`.

## Settings and schema

Per house rule, enums go in [`src/shared/schemas.ts`](../src/shared/schemas.ts) as `z.enum` → `z.infer` → `.options`.

```ts
export const cookiesModeSchema = z.enum(['off', 'file', 'browser', 'explore'])
export const jobAuthSchema = z.enum(['anonymous', 'exploreSession'])
```

New `common` fields:

| Field | Type | Default | Notes |
|---|---|---|---|
| `exploreEnabled` | `boolean` | `true` | Shows the Explore tab; off also disables escalation (D3) |
| `exploreUserAgent` | `string?` | unset → `Desktop/1.0` | Token only, validated (UA rule) |
| `exploreNoticeSeen` | `boolean` | `false` | First-run ban-risk notice acknowledged |
| `exploreModeAutoSwitched` | `boolean` | `false` | D6 one-time `off` → `explore` at first Explore open |
| `exploreModeNudgeDismissedFor` | `CookiesMode?` | unset | D6 "Not now", cleared when `cookiesMode` changes |
| `exploreLastUrl` | `string?` | unset | Last site page the view showed, reopened at the next start (P2-R34). Main-owned: not in the renderer's settings patch |
| `exploreAdBlock` | `boolean?` | unset → off | The Explore ad blocker (P2-R36) |

**Last page (P2-R34).** The view records each committed main-frame page (full
and in-page navigations — YouTube is a single-page app), debounced to one write
per second of quiet and flushed when the window closes. Only a **site page** is
kept: https, a host on the site's own domains (`youtube.com` family for v1), not
a sign-in or consent host (`accounts.*`, `consent.*`), not one of the site's
own hops (`/redirect`, `/signin*`, `/logout`, `/signout`), no credentials in the
URL, at most 2048 chars; anything else leaves the last kept page in place. A new
view opens the stored page while it still passes that check, else home; Home
still opens home. Under the E2E home override, only the override's origin counts
(stored real-site pages are ignored, so the override always wins). **Sign out of
Explore** forgets the page. The URL is never logged.

`auth: JobAuth` (default `'anonymous'`) on: the queue item (persisted),
`probeInfoJsonRefSchema`, the probe result, and `startDownloadSchema`. Persisted
data is parsed through these schemas on load (trust boundary).

`YtDlpRunOptions.withoutCookies` is replaced by a single identity option
(`'configured' | 'none' | 'exploreSession'`), so callers state *which* identity
a run uses instead of combining flags.

## UI

Mockups were local-only (`design/in-app-browser/` is gitignored and not in the
repo). The layout is the split layout described below; it must hold at the real
minimum window, 720x760.

- **Tab bar:** the existing one gains Explore after URL (D3), with a "New" badge; URL stays the launch tab. With `exploreEnabled` off, the bar is exactly today's.
- **Explore first run:** ban-risk notice, then the YouTube home page. The view mounts on first open only (D3.1). The notice opens with a decorative preview of Explore (`aria-hidden`, `inert`): the toolbar in miniature with the real Download split naming the active profile, over an abstract video page (top bar with search and avatar, side menu, chip row, two-column card grid) in neutral shapes and theme colours — no site branding, artwork or people. It is shorter in a narrow card (a container query on the card, which measures unzoomed CSS px, so any UI zoom above 100% at the 720 px floor gets the short form). At 720x760 and UI zoom 100% the whole notice, Continue included, is in view without scrolling (asserted in en, el, fr, my, pl and ur); at 125% and above, scrolling to reach Continue is accepted.
- **Sign-in inline** (D2) — nothing injected, no Arroxy UI over Google's form.
- **Toolbar above the view;** must hold at the 720x760 minimum window and at 150% UI zoom in the longest locales. **Grab** takes the view's current URL (from `exploreStateChanged`) into the download flow — no second URL input. From the start of the row:
  - Back, Forward, Reload, Home, then the **address bar** (P2-R45, reverses P2-R33): an omnibox that searches YouTube. Unfocused it shows the page's address; focus selects it all, so a paste replaces it; Esc or blur puts the page's address back. The placeholder (shown only when empty) reads "Search YouTube or enter an address". Nothing is judged while the user types; on Enter a shared classifier (`classifyExploreAddress`) routes the text:
    - text is a **link** only with a scheme, a leading `www.`, a bare host plus a path (`vimeo.com/123`), or a bare host that is one of the site's own (`youtube.com`, `youtu.be`); anything else, a dotted word such as `node.js`, `e.g.` or `v1.2` included, is **plain text** and opens `https://www.youtube.com/results?search_query=…`;
    - a **YouTube link** — a host among the site's content hosts (`SiteExplore.contentHosts`: `youtube.com` and every subdomain, so `m.` and `music.youtube.com` too, and `youtu.be`) — loads in the view: always https, `youtu.be/<id>` as `https://www.youtube.com/watch?v=<id>` keeping `t` and `list`;
    - a **link on any other host** loads in the view as typed (http stays http, a port stays);
    - anything else (another scheme such as `javascript:` or `data:`, credentials in the URL, a sign-in, account or consent host — `SiteExplore.signInHosts`: `accounts.google.*`, `accounts.youtube.com`, `myaccount.google.com`; `SiteExplore.consentHosts`: `consent.youtube.com`, `consent.google.*` — or a link over 2048 characters) is refused in the renderer: a hint row under the toolbar says "Explore can't open that address.", and nothing is sent. The hint closes on Esc, on an edit, or when the user leaves the Explore tab; it is its own row, so the view shrinks below it. A search whose text or results URL is over 2048 characters gets its own hint, "That search is too long."
    The hint row is not a live region itself; an always-mounted, visually hidden polite `role="status"` region announces its text (empty while there is none).
    The renderer sends links and searches as `{kind: 'address', url}`; **main decides** what loads: `exploreHandlers` checks the address with zod against `isExploreAddress` (a web page, never a sign-in, account or consent host; no username or password; within the cap), logs only the host of a refusal and answers a validation error, which the renderer shows as the hint; any other failed navigate result (IPC, an error in main) is only logged, and a result that lands after the user left the tab is dropped. Sign-in and account pages stay reachable by clicking on a page; they are only never typed. The host checks again, loads the parsed form (`new URL(url).href`, never the raw string) and loads through the proxy gate (`whenProxyReady`).
  - A split button, **Download · *active profile*** with the profile's icon: the main part queues the page with the active profile (quick download) and stays in Explore. Like the URL tab's Quick Download it prepares in the background (P2-R37/R38): the page becomes a placeholder row in Downloads at once, named by the page title until the probe knows the video's, and an `Added: <title>` toast with **View** confirms it; several Downloads prepare in parallel. A failure or a choice the probe raises (a playlist over the load limit, a link that turned out to be a list) lands on that row, resolved from the Downloads tab, plus a toast; nothing appears above the view. The chevron opens the URL tab's profile menu (the same component: the profile grid, then Edit, New and Manage); a pick sets the global active profile. A long profile name truncates and stays whole in the native tooltip.
  - An icon-only **interactive** button (a wand, unlike every profile icon) with a native tooltip, "Choose format, subtitles and more…": it opens the step-by-step flow with the current page. That run remembers Explore as its origin, so Back to the home, Start over and a finished queue all land on Explore again; a run from the URL tab is unchanged. The origin belongs to that run: Retry from its error step keeps it, while Advanced settings, a bulk Download, and a failed Download's Retry clicked on the URL tab are URL-tab runs.
  - On YouTube every part is disabled unless the page is a video, playlist or channel; on any other site every web page is grabbable (yt-dlp decides what it holds); a Download still preparing never blocks the next. Tooltips are native `title`s on purpose: they are OS windows, which the view cannot cover.
- **Link menu (right-click in the page).** The same controls for a link, so a grid of videos downloads without opening each one. It is a native menu built and shown by main (`exploreLinkMenu.ts`), never page DOM: renderer DOM cannot paint over the view, and the page gets no Arroxy script or bridge, so it cannot open the menu or pick from it (Electron fires `context-menu` only for the user's own right-click). Only the link's address leaves the event (`linkURL`; not the link text, a selection or media). On a link the download flow can take (the same `isExploreGrabbable` gate as the bar, on the cleaned link):
  - **Download · *active profile*** queues the link (background quick download, Explore entry);
  - **Download with ▸** lists every enabled profile by name, the active one checked; a pick is the bar's pick: it becomes the global active profile, then the link is queued with it;
  - **Interactive Download: choose format, subtitles and more…** (the wand's own label) opens the step-by-step flow with the link, returning to Explore like the wand;
  - **Copy link** puts the link, as the page had it, on the clipboard.
  - Any other web link gets only **Copy link**; no link (a plain spot, text, an image), another scheme, or a page a refused proxy blanked gets no menu. Main sends a pick to the renderer as `explore:linkAction` (`{kind: 'download', url, profile?}` or `{kind: 'interactive', url}`), parsed against its schema first; the renderer checks the link against the gate again and runs it only while the Explore tab is mounted. A `&` in a profile name is escaped (Electron reads it as a mnemonic on Windows and Linux).
- **Ad blocker shield (P2-R36):** an icon-only toggle between the address and the Download split, pressed while `exploreAdBlock` is on. Its icon and native `title` give the state from `adBlock` in the view state (off, starting, on, unavailable) plus one line: "YouTube may push back on ad blockers for signed-in accounts." See **Ad blocker** below.
- **No sign-in status chip.** After a verification finds the session signed out, `signedIn` turns false and the failed download offers "Sign in in Explore"; there is no separate signed-out notice.
- **The native view paints over all DOM.** Overlay policy: the renderer reports a placeholder element's rect in CSS px (which already include the UI zoom, a CSS `zoom` on the content wrapper); main multiplies it by the main window's zoom factor (the default menu's Cmd/Ctrl +/−/0) and positions the view there. The renderer re-sends on resize and whenever the window zoom changes. The view is **hidden** whenever the placeholder is unmounted or any modal/dialog/sheet/popover is open (dialogs, the What's-new dialog, settings sheets, the profile menu, the mixed-URL prompt), and when the main window's renderer commits a new page (`did-navigate`: a reload; the navigations the main window cancels leave the view alone). Toasts and the update banner must not render inside the placeholder's area. Alerts (nudge, notices) take layout rows *above* the placeholder.
- **A snapshot stands in for the hidden page (P2-R35).** When an overlay opens, the renderer first asks main for a snapshot (`explore:capture`: `capturePage`, encoded as a quality-85 JPEG data URL at full device resolution, so it is sharp on HiDPI — ~15 ms to encode, where a full-size PNG takes ~300 ms), shows it in the placeholder where the view was, and only then hides the view. On close the live view is shown first, then the picture is dropped. No picture (nothing shown, an error, a failed or rejected capture, or none within ~300 ms) means the view hides at once, as before: the overlay is never held up. The picture lives only in the viewport's state; it is never stored or logged. An error surface or leaving the tab hides the view at once, without a picture. Toasts keep their own rule (P2-R16): the view shrinks for them and does not hide.
- **Sound follows the tab:** the view is muted while the Explore tab is not the active tab (P2-R32); a dialog over it hides it but does not mute it.
- **Even tab spacing:** each tab trigger sizes to its content and shares the free room equally; pills are inset along the row, cast no sideways glow, and keyboard focus rings the pill from inside (plus a transparent inset outline, so forced colours still show focus), so any two lit pills (selected, hovered, a working Downloads tab) keep the same clear gap. The tab-bar sweep measures it.
- **Five tabs at the 720px floor** with the longest locales (`el`, `fr`, `my`) is the main layout risk. `tests/browser/toggle-overflow.spec.ts` covers the tab bar (`overflowingTabs`).
- shadcn primitives only; no Radix; `toggleVariants` rules; the ui-consistency ratchet must not rise.

## Ad blocker

P2-R36, user-approved: [Ghostery's adblocker](https://github.com/ghostery/adblocker) (`@ghostery/adblocker-electron`, MPL-2.0, listed in `THIRD_PARTY_NOTICES.txt`).

- **Off by default** (`exploreAdBlock`; reverses P2-R53, since it breaks too many sites once Explore browses the open web). Unset means off and only an explicit `true` (the user turned it on) means on; `isExploreAdBlockOn` in shared is the one reading, main and renderer. Nothing is written on startup. The shield toggles it; main applies it to the Explore session at once and reloads the page shown. Downloads, the main window and the token window are never touched: the blocker lives on the Explore partition only.
- **Lazy.** Nothing is loaded or fetched until an Explore view opens with the blocker on or it is turned on. The library's module is imported on first use (it sets `ELECTRON_DISABLE_SECURITY_WARNINGS` in `process.env` as it loads; Arroxy puts it back, since yt-dlp spawns inherit the environment).
- **Engine:** the prebuilt ads + tracking lists, fetched through the Explore session's `fetch` (the proxy applies, and nothing goes out while the proxy setting is refused), cached in `userData/explore-adblock/engine.bin` with the library's cache option and refreshed after a week. A failed refresh keeps the older cache. No lists and no cache: the status is `unavailable`, nothing is blocked, Explore works as before, one warning is logged; the next turn-on, or a proxy setting that applies, tries again. A new view's first page waits up to 3 s for the blocker; one that starts later reloads the page. A session left running checks daily whether the lists are over a week old and, if so, fetches them in the background and swaps the engine in place (requests keep using the old one meanwhile; no reload).
- **Follows the tab.** The kill switch (and a closed window) takes the blocker off the partition: no request hooks or page script without the tab. Without a view the status follows the setting (`starting`: it starts with the next view, before its first page; `off` only after the user turned it off).
- **Trust (accepted risk).** The lists, including scriptlets that run inside the signed-in YouTube page, come from Ghostery's GitHub (`raw.githubusercontent.com/ghostery/adblocker/master/...`) over HTTPS with no integrity check beyond TLS; a compromised list could inject script into Explore pages. This is how list-based blockers work (uBlock Origin and Ghostery's own extension trust their list hosts the same way), the user can turn the blocker off with one click, and the risk is limited to the Explore partition. Accepted for v1.
- **Never on sign-in.** Requests to, and requests made by a page or frame on, the site's sign-in hosts (`SiteExplore.signInHosts`: `accounts.google.com`, its country hosts, `accounts.youtube.com`, `myaccount.google.com`) are never blocked, and those pages get no cosmetic filtering. Checked in Arroxy's own listeners rather than with `@@…$document` filters, which the library matches against the referrer (often empty) and `$important` filters override.
- **Session hooks.** Electron keeps one `webRequest` listener per event per session. The blocker is the only owner of the Explore session's `onBeforeRequest` and `onHeadersReceived`, and turning it off clears exactly those. Arroxy does not use the library's `enableBlockingInSession`: it resolves its preload from `node_modules` (absent in a packaged app), registers IPC handlers that answer any renderer, and cannot spare sign-in pages. Arroxy registers the same preload per session (`registerPreloadScript`, frame type), answers the library's two IPC channels only for Explore-session senders, and parses the page's DOM report with zod (an unknown `lifecycle` value is read as a DOM update and logged once, so a newer preload never silently loses cosmetics). Two tripwires guard a library upgrade: a test reads `BlockingContext.enable()` and fails if it registers anything Arroxy does not mirror, and another checks that the shipped preload invokes exactly the channels Arroxy answers. The build ships the preload next to the main bundle (`exploreAdBlockPreloadPlugin` in `electron.vite.config.ts`). The library calls the page's `executeJavaScript` and `insertCSS` without awaiting them, so Arroxy hands its cosmetic handler a contained event (`CosmeticEvent`: the frame ids and a sender whose two calls settle themselves): a scriptlet that throws in the page logs one debug line per page (host only) instead of an unhandled rejection in main; nothing is installed process-wide. A third tripwire checks the handler reads nothing else off the event.
- **Tests:** unit (lifecycle, cache, failure, sign-in hosts against a real engine), renderer (shield states and titles), browser-mock scenarios `explore-adblock-on` (every other Explore scenario has the shield off) / `explore-adblock-unavailable` (in the toolbar overflow sweep), and fixture E2E: a local page's "ad" script on a second local origin is requested on a fresh profile (off by default), is not requested once the shield is turned on, its banner hidden only while the shield is on, and the on choice holds across a restart. The E2E builds the engine from `ARROXY_E2E_EXPLORE_ADBLOCK_FILTERS` (never in a packaged build), so no list is fetched.

## IPC

Add to `IPC_CHANNELS` in [`src/shared/ipc.ts`](../src/shared/ipc.ts); every
renderer → main payload is parsed with zod in main:

```
exploreNavigate      'explore:navigate'      // {kind: 'back'|'forward'|'reload'|'home'} | {kind: 'address', url} — a typed address, loaded only on the site (P2-R45)
exploreSetBounds     'explore:setBounds'     // {x, y, width, height} in CSS px; main applies the main window's zoom factor
exploreSetVisible    'explore:setVisible'    // {visible: boolean} — overlay policy, unmount
exploreSetActive     'explore:setActive'     // {active: boolean} — the Explore tab is the active tab; unmutes the view
exploreSignOut       'explore:signOut'
exploreGetState      'explore:getState'
exploreCapture       'explore:capture'       // → JPEG data URL | null; the handler drops anything but a base64 JPEG within 16 MiB chars
exploreStateChanged  'explore:stateChanged'  // main → renderer
```

State: `{url, title, canGoBack, canGoForward, loading, signedIn, error, adBlock}` — `error` is `'proxy' | 'load' | null`; `adBlock` is `'off' | 'starting' | 'on' | 'unavailable'`.
Grab reads `url` from state — no separate channel. **Cookies never cross IPC.**

## Security

- Temp jars: own temp dir, `0600` where meaningful, deleted in a `finally`, swept at startup, never in the output directory, filtered to the site's `cookieDomains` (YouTube: `youtube.com` only).
- Never log cookie values — names and domains only.
- If cookies are ever persisted outside the session (they should not be), encrypt at rest via `safeStorage`.
- **Cookie encryption at rest: not used (decided 2026-10-15).** The Explore partition stays plaintext on disk, like the existing token partition and a yt-dlp `cookies.txt`; Chromium keeps its cookie database readable by the user's account only. The `EnableCookieEncryption` fuse was researched and rejected: it protects only copies of the profile (backups, synced folders, a stolen disk), never against code running as the user, and it costs more than that buys here — the unsigned macOS build would raise a Keychain prompt after every update (denying it signs the user out), Linux without a reachable keyring (including today's Flatpak) silently signs out or falls back to a fixed key, and a downgrade to a build without the fuse deletes the Google/YouTube cookies. This is the explicit, recorded decision to accept plaintext that a stable release requires; revisit it if the macOS build gets a Developer ID.
- Account safety: concurrency and pacing caps above; ban-risk notice before sign-in.
- `NSBluetoothAlwaysUsageDescription` in the packaged macOS app's Info.plist, or Bluetooth security keys cannot complete 2FA.

## Testing

Following the layer ownership in [`fixture-e2e.md`](fixture-e2e.md) — Explore is **not** an excuse to
drive real YouTube login from CI.

| Layer | Covers |
|---|---|
| Unit (`tests/unit`) | Jar writer: host-only cookies (`FALSE`, no leading dot), `#HttpOnly_`, expiry `0` for session cookies, `__Host-`/`__Secure-` names; domain filter (`.google.com` excluded); escalation matcher over `(kind, message)` incl. private, members-only, WL/LL, botBlock-after-ladder, and every non-escalating kind; sticky `auth` through probe result → ref → queue item → `StartDownloadInput`, playlist inheritance, persistence before the escalated spawn; per-job spawn cap; concurrency/pacing; `CookielessRetry` bypass (D4); `resolveCookies` exhaustive over modes, `file`/`browser`/`off` unchanged; auto-switch at first open exactly once, later `off` respected, `file`/`browser` never switched; `probeErrorExperience` under `explore`; stale warning → verify → one retry / signed-out state; navigation policy decisions; `exploreUserAgent` validation; devtools gate; **UA invariant**; escalated runs never receive the anonymous PO token |
| Renderer (`tests/renderer`) | Explore tab after URL, "New" badge, URL still the launch tab, absent when `exploreEnabled` off; first-run notice; nudge shown/hidden/dismissed; view not mounted before first open; placeholder hidden while a modal is open; overlay snapshot order (capture → picture → hide; show → drop) and its fallbacks |
| Browser mock (`tests/browser`) | Explore layout at the minimum window size (720x760) and 150% zoom; tab-bar case in `toggle-overflow.spec.ts` across `el`/`fr`/`my` |
| Mock Electron E2E | Partition isolation from the app session; no cookies over IPC; no Explore partition activity before first open; `will-download` cancelled |
| Fixture Product E2E | Needs an **E2E-only hook** (gated on `ARROXY_E2E=1`) to seed cookies into the Explore partition. **Escalation scenario:** the fixture plugin reads a marker cookie via `self._get_cookies('https://www.youtube.com')` and raises "Sign in to confirm your age" without it; the probe fails anonymously, escalates, downloads. Oracles: the plugin reports the marker per request (reusing the existing `signedIn` request field), so other items are shown anonymous; the item's `auth` persisted; the file exists; deny proxy clean. **D4 scenario** with `COOKIE_LIMITED_VIDEO_ID`: an escalated, quality-limited job asserts no cookieless retry happens. **Last page:** after a restart the view reopens the fixture origin's second page, never asking for home. **Never real YouTube auth.** |
| Manual | Cross-platform matrix on the product build (below), logging off-allowlist hosts |

**Manual matrix — executed 2026-10-13** with a throwaway spike (plain Electron
43.7.7, own persistent partition, UA token `Desktop/1.0`, no injection, no
synthetic input), a spare Google account with TOTP 2FA, signed in by hand.
Oracle: yt-dlp reads the account's Watch Later with the session jar and gets
*"The playlist does not exist"* without it.

| Platform | Page-load flow (`Desktop/1.0` / honest Electron control) | Real sign-in (pwd + TOTP) | `LOGGED_IN` | Cookies authenticate yt-dlp | Survives restart | Bot-wall relief |
|---|---|---|---|---|---|---|
| macOS 26 arm64 | `GlifWebSignIn` / `WebLiteSignIn` | pass | true | pass | pass | unproven |
| Windows 11 arm64 | `GlifWebSignIn` / `WebLiteSignIn` | pass | true | pass | pass | unproven |
| Ubuntu 26.04 arm64 (Wayland) | `GlifWebSignIn` / `WebLiteSignIn` | pass | true | pass | pass | unproven |

Observed on every platform, and binding on the implementation:

- **YouTube reloads itself on first load** (`?themeRefresh=1`), aborting the initial `loadURL` with `ERR_ABORTED`. Treat that abort as normal navigation, never as a failure. (`HiddenWindowTokenProvider` already loads the `themeRefresh` URL, likely for this reason.)
- **Google inserted `challenge/recaptcha` before the password step** every time (new account; may not apply to established ones). The Explore view must be large enough to solve a reCAPTCHA at the 720x760 minimum window.
- **Linux ran with `--no-sandbox`** — identical to the shipped Linux build (`build/afterPack.mjs`), so no deviation from production.
- **Electron 44.6.0 / Chromium 152** (the version `main` moved to on 2026-10-14): page-load probe on macOS still reaches `GlifWebSignIn` with `Desktop/1.0`. The full matrix was repeated on the product build (below).
- Not yet run: x64 Windows/Linux (same Chromium; low risk — run one probe before release) and bot-wall relief (cannot be provoked on demand).

**Manual matrix on the product build — executed 2026-10-15/16** (packaged `feat/explore` builds, Electron 44.6.0, fresh profile per platform, a spare Google account signed in by hand inside Explore). Oracle as above: Watch Later (`list=WL`) fails signed out with *"The playlist does not exist"*, then escalates and downloads.

| Platform | Sign-in in Explore | Signed-out probe fails | Escalated to the Explore session | Downloads complete | Cookie jars cleaned up | Cookie values in logs |
|---|---|---|---|---|---|---|
| macOS 26 arm64 | pass | pass | pass | 3/3 | 4 written, 0 left | none |
| Windows 11 arm64 | pass (passkey dialog first, see below) | pass | pass | pass | pass (1 open jar belonged to a running download) | none |
| Ubuntu 26.04 arm64 | pass | pass | pass | 3/3 | 0 left | none |

- **Windows shows a "Sign in with a passkey" dialog before the email step.** Google's sign-in page offers passkeys up front; in Chrome that is a quiet autofill suggestion, but Electron has no conditional-mediation UI, so Windows Security opens its own dialog. Cancel continues to email and password. Accepted: no injection into the sign-in page, and real security keys keep working.
- Downloads ran with the signed-in pacing (`sleepingBetweenRequests` 6 s) and one fresh `0600` jar per spawn, deleted afterwards.

## Open items

- **Members-only wording** — confirm the message against a real members-only video (D1). UNVERIFIED: `tests/unit/explore-escalation.test.ts` covers the patterns, but nothing here records a check against a real video.
- **Sign-in permissions** — the product-build matrix saw no permission request beyond the Windows passkey dialog (WebAuthn); security-key sign-in over Bluetooth on macOS still needs a real key to confirm (UNVERIFIED).
- **x64 probe** — one x64 Windows or Linux page-load probe (same Chromium as arm64; low risk). UNVERIFIED whether it was run before 0.5.0 shipped; no record in this doc.
