# YouTube in-app authentication — research record

Investigation into whether Arroxy can offer an in-app browser with YouTube
sign-in, the way 4K Video Downloader+ does.

**Status:** mechanism found and proven end to end. No implementation yet.
**Implementation spec:** [`dev-docs/in-app-browser-spec.md`](dev-docs/in-app-browser-spec.md)
**Date:** 2026-08-27 / 2026-08-28 / 2026-08-29
**Environment:** macOS (darwin 25.5), Electron 43.4.0 (Chromium 150.0.7871.224),
Brave 151, yt-dlp 2026.07.04.

> Account identifiers, cookie values and tokens from the test session are
> redacted throughout.

---

## 1. The answer, in short

**Corrected 2026-08-28.** The rule is not "bundled engines are banned". It is
about what the client *declares*:

| User-agent declares | Outcome |
|---------------------|---------|
| `Electron/…` (honest) | permitted but **demoted** to the low-trust `WebLiteSignIn` flow |
| Pure `Chrome/…`, Brave, Firefox, or Safari from a Chromium build | **blocked** — impersonating a browser it cannot prove it is |
| `QtWebEngine/…` | full `GlifWebSignIn` flow — a framework Google does not blocklist |
| **A custom app token (`Arroxy/1.0.0`)** | **full `GlifWebSignIn` flow — accepted** |

So: **do not impersonate a real browser, and do not carry a blocklisted framework
token.** Declare your own app name and plain Electron is accepted, on every
platform. No native webview is required.

An earlier draft of this document concluded the opposite — that bundled Chromium
was banned outright and Linux was unsolvable. That was wrong. It came from testing
only *spoofed* identities inside Electron and Qt, and never testing an honest
custom token. Every competitor
that ships this feature works the same way: log in through the system webview,
then hand the resulting cookies to the bundled engine and to yt-dlp.

The chain that works, verified:

The chain proven end to end (via native `WKWebView`; the Electron path below
reaches account lookup and still needs a real-credential confirmation):

| # | Step | Result |
|---|------|--------|
| 1 | Log in with a **non-impersonating** user-agent | Google accepts, full sign-in completes |
| 2 | Read cookies from `WKWebsiteDataStore.httpCookieStore` | 53 cookies, incl. 21 on `.youtube.com` |
| 3 | Inject them into an Electron session partition | `LOGGED_IN true` — the embedded browser is signed in |
| 4 | Mint a PO token **in that authenticated context**, bound to `DATASYNC_ID` | 132-char token |
| 5 | `yt-dlp --cookies <jar>` — no extractor args needed | authenticated: account-gated endpoints reachable |

**Simplest working recipe (plain Electron, no native code):**

```
UA:      Electron's default with `Electron/<v>` replaced by `Arroxy/<v>`
Login:   ordinary BrowserWindow / WebContentsView
Capture: session.cookies.get({}) -> Netscape jar
Use:     yt-dlp --cookies <jar>          # no PO token, no player_client override
```

Getting step 4 or 5 wrong is the difference between **360p and 4K**.

---

## 2. Why Google blocks embedded browsers

Two separate mechanisms, one threat model: *a session that can move between
programs is a session that can be stolen.*

**Embedded-browser ban (2019 →).** In an embedded webview the host app can read
the DOM, inject JS and keylog the login form. Google cannot distinguish a
legitimate app from a credential harvester, so it blocks the category. CEF
sign-in was disabled 2021-06-30; embedded-webview sign-in was deprecated
2021-09-30. This is why *identity spoofing can never work* — the objection is to
the container, not to the name it gives.

**BotGuard.** Confirmed empirically: `window.botguard` is present on
`accounts.google.com`. It is an obfuscated attestation runtime that probes the
real JS environment and submits a token with the form. Google's accept/reject
decision comes from that token, not from declared strings.

**DBSC (Device Bound Session Credentials).** Binds a session to a non-exportable
key in the TPM / Secure Enclave, re-proved every ~5 minutes; copied cookies stop
refreshing elsewhere. GA on Windows since Chrome 146 (April 2026), default-on for
personal accounts since 2026-05-25, **cannot be disabled**. macOS via Secure
Enclave is next.

> **DBSC is a Chrome feature. Safari does not implement it.** A session created
> in a Safari/iPad context cannot be DBSC-enrolled, so its cookies stay ordinary
> bearer tokens — transferable. The iPad route sidesteps the one mechanism that
> would otherwise kill this feature within a year.

**The mobile exemption.** The ban is a *desktop* policy. On iOS/iPadOS, native
apps legitimately sign in through webviews — it is the platform norm — so the
mobile flow must accept webview-shaped clients. This is the loophole every
shipping competitor uses.

---

## 3. Approaches that did NOT work

All tested against `accounts.google.com/ServiceLogin?service=youtube` from an
Electron `BrowserWindow`. Oracle: reaching account lookup / password = accepted;
`/v3/signin/rejected` + *"This browser or app may not be secure"* = blocked.

| # | Approach | Result |
|---|----------|--------|
| 1 | **Arroxy's existing `CHROME_UA`** — claims `X11; Linux x86_64` + `Chrome/130` while running macOS + Chromium 150 | **Blocked.** UA contradicts platform, version and client hints |
| 2 | **Stripped Electron UA** — truthful `Chrome/150.0.7871.224` on macOS, only the `Electron/43.4.0` token removed | **Blocked** |
| 3 | **Full Brave impersonation** — UA, `Sec-CH-UA` headers, `navigator.userAgentData` (*verified by reading it back from the page*), fake `navigator.brave`, Electron globals deleted | **Blocked** |
| 4 | **Firefox impersonation** — Firefox 140 UA, all `Sec-CH-UA` stripped, no `userAgentData`, no `window.chrome`, Firefox-only `navigator` props | **Blocked.** Google *believed* it (served Firefox's "Use a Private Window" wording) and refused anyway |
| 5 | **`X-Client-Data` hypothesis** | **Disproven.** Brave sends zero such headers across 24 requests to Google, yet is accepted — so it cannot be the discriminator |
| 6 | **Honest Electron UA** (`Electron/43.4.0` left in) | **Not blocked**, but routed to `WebLiteSignIn` — a lower-trust flow ending in reCAPTCHA. In real use it triggered a **"Verify it's you — unusual activity"** account challenge. Rejected as unsafe to ship |
| 7 | **iPad UA inside Electron** (bundled Chromium) | Page load reached the **full** `GlifWebSignIn` flow with the form rendered — but **submit was refused**: *"This browser or app may not be secure."* Tested manually, 2026-08-28 |
| 8 | **iPad UA inside QtWebEngine** (Qt's Chromium — what 4KVD ships on Linux) | **Blocked.** `/v3/signin/rejected` — another engine/identity contradiction |

**Conclusion (revised): every failure above is an IMPERSONATION.** Each one
claims to be a real browser — Chrome, Brave, Firefox, Safari/iPad — from a build
that cannot substantiate it. None of them failed because the engine was bundled.

Proof: the *same* Electron Chromium, declaring `Arroxy/1.0.0` instead, reaches
the full `GlifWebSignIn` flow and is accepted (#9). Qt's Chromium behaves
identically — blocked when claiming iPad (#8), accepted with its honest
`QtWebEngine/…` token (#10). Google is detecting the container,
exactly as its stated policy describes; no user-agent, client-hint or JS
manipulation can change that, because none of it changes the container.

### What DOES work (tested with a nonexistent address — no account involved)

| # | Identity | Flow served | Verdict |
|---|----------|-------------|---------|
| 9 | Electron, UA token replaced with **`Arroxy/1.0.0`** | `GlifWebSignIn` | **ACCEPTED** — "Couldn't find this account" |
| 10 | Electron, UA token replaced with `QtWebEngine/6.11.2` | `GlifWebSignIn` | **ACCEPTED** |
| 11 | QtWebEngine with its own honest UA | `GlifWebSignIn` | **ACCEPTED** |
| 12 | Native `WKWebView` + iPad UA | `GlifWebSignIn` | **ACCEPTED** — full login completed with real credentials |

Recipe — take Electron's default UA and replace the `Electron/<version>` token,
leaving the rest (real platform, real Chromium version) untouched so it stays
consistent with the client hints Chromium sends.

**Do NOT use the product name.** `Arroxy/1.0.0` works, but it tells Google
exactly which app is signing in — a token they can blocklist (as they did
`Electron`) or correlate with downloading to flag accounts. Any unrecognised
non-browser token is accepted, so anonymity is free:

| Token | Verdict |
|-------|---------|
| `Desktop/1.0` | ACCEPTED |
| `WebView/1.0` | ACCEPTED |
| `QtWebEngine/6.11.2` | ACCEPTED — hides among thousands of real Qt apps |
| `Arroxy/1.0.0` | ACCEPTED, but **identifies the product — avoid** |

This is very likely why 4KVD spoofs an iPad: not technical necessity, but
anonymity. Their users appear in Google's device history as "Apple iPad",
revealing nothing about a downloader.

**Make the token runtime-configurable** (settings or a remote manifest) so it can
be changed without shipping a release if it is ever blocklisted.

### Approaches that worked but were rejected on UX grounds

- **Launching the real system browser** (Chrome/Brave with an app-owned
  `--user-data-dir` + `--remote-debugging-port`, cookies read over CDP
  `Storage.getCookies`). Works — reached the password step, captured httpOnly
  cookies decrypted. Rejected: a separate browser window is poor UX.
  *(Note: since Chrome 136 `--remote-debugging-port` requires a non-default
  `--user-data-dir`, and Chrome 111+ needs `--remote-allow-origins`.)*
- **Screencasting a hidden real browser into Arroxy** via
  `Page.startScreencast` + `Input.dispatch*`. Measured: 12.8 fps, 19 KB/frame at
  1180×583, input forwarding functional, YouTube rendered correctly. Rejected:
  ~13 fps and a large amount of machinery.

---

## 4. What the competitors actually do

### 4K Video Downloader+ 26.3.1 (macOS arm64) — binary inspection

The decisive finding. They ship **two web engines** and split the work:

```
Contents/Frameworks/QtWebEngineCore|Quick|Widgets.framework   ← bundled Chromium
Contents/Frameworks/QtWebView.framework
Contents/PlugIns/webview/libqtwebview_darwin.dylib            ← native WebKit
Contents/PlugIns/webview/libqtwebview_webengine.dylib
```

`libqtwebview_darwin.dylib` links against
`/System/Library/Frameworks/WebKit.framework` and contains `WKWebView`,
`WKNavigationDelegate`, `QtWKWebViewDelegate`, `customUserAgent`,
`setCustomUserAgent:`.

| Job | Engine |
|-----|--------|
| In-app browsing (YouTube, search) | QtWebEngine — bundled Chromium |
| **Google login** | **QtWebView → native macOS `WKWebView`**, UA overridden |
| PO tokens | `bgutils-js`, embedded whole |

Their own FAQ confirms the disguise:

> "Google may send a notification that there was an attempt to log in from an
> unknown device, particularly from an **Apple iPad**. This is how Google
> recognizes the 4K Video Downloader… You can also see **Apple iPad** in your
> device history."

Also from the FAQ: in-app authorization is a **paid-plan feature**, and CAPTCHA /
2FA / security-key prompts are documented as normal.

User-agent strings recovered from the binary include several iPad Safari
variants and a **Cobalt TV** UA (`Cobalt/25.lts…Unknown_TV_Unknown_0`),
suggesting client-switching strategies beyond the login path.

### Tyrrrz/YoutubeDownloader (16k⭐, C#/Avalonia)

Independent confirmation of the same architecture on Windows — uses **WebView2**
(system Edge runtime), not a bundled engine. Zero *"browser may not be secure"*
reports in its entire issue history.

Flow (`Views/Dialogs/AuthSetupView.axaml.cs`):
1. `CookieManager.DeleteAllCookies()` when navigating to the login page
2. Navigate to `accounts.google.com/ServiceLogin?continue=https://www.youtube.com`
3. Watch for redirect back to the `youtube.com` host — that is the success signal
4. `CookieManager.GetCookiesAsync(url)`
5. Store **encrypted** (`SettingsService.AuthCookiesEncryptionConverter.cs`)
6. `IsAuthenticated` = cookies exist **and** no `__SECURE*` cookie has expired

They also disable autofill, password saving, devtools and context menus in that
webview.

### th-ch/youtube-music (Electron, `src/index.ts:529-565`)

- `options.overrideUserAgent` defaults to **false** — ships the honest Electron UA
- The optional Chrome-130 spoof explicitly **reverts to the original Electron UA**
  for `accounts.google.com` requests
- Consistent with finding #6: honest Electron is permitted via the lite flow

### ytmdesktop/ytmdesktop (Electron)

Fakes a Firefox UA. Issue #866 *"Can't sign in, Browser or app may not be
secure"*; maintainer: *"There is no fix available"*, later attributing breakage
to *"the Faked Firefox useragent being considered out of date"*. A separate open
issue tracks 2FA security keys not working in Electron. **This is the failure
mode to avoid.**

---

## 4a. Cross-platform reality

4KVD ships all three platforms (`arm64/x64.dmg`, `x64_offline.exe`/`x64.zip`,
`amd64.deb`/`amd64.tar.bz2`), but the login engine differs per platform:

| Platform | Webview backend in 4KVD 26.3.1 | Native? | Google login |
|----------|-------------------------------|---------|--------------|
| macOS | `libqtwebview_darwin.dylib` → `WKWebView` | yes | **works** (verified by us) |
| Windows | Qt WebView → WebView2 (Edge) | yes | works (Tyrrrz/YoutubeDownloader independently confirms WebView2) |
| **Linux** | `libqtwebview_webengine.so` → QtWebEngine | no | **works** — honest `QtWebEngine/…` UA is accepted (#11) |

Qt's documentation confirms there is no native Linux backend: *"On Linux, Qt
WebView depends on the Qt WebEngine module to render content."* But that does
**not** break their Linux login — QtWebEngine's honest user-agent is accepted on
the full `GlifWebSignIn` flow (#11). Only the *spoofed* iPad variant is refused
(#8).

**Consequence for Arroxy:** in-app login works on **all three platforms** with a
plain Electron `WebContentsView`, provided the UA declares a custom app token.
No native webview, no per-platform helper, no child process.

(`cookiesMode` is kept in full — see 6a "Rollout". The Legacy tab continues to
depend on it, so the earlier "delete all three modes" recommendation is
withdrawn.)

Their Linux binary also exposes their client matrix as C++ symbols —
`TvInnertubeClientData`, `iOSInnertubeClientData`, `AndroidInnertubeClientData`,
`MobileWebInnertubeClientData`, `WebSafariInnertubeClientData`,
`VisionosInnertubeClientData`, `AndroidVrInnertubeClientData` — i.e. they switch
InnerTube clients the way yt-dlp switches `player_client`. `bgutils-js` ships on
Linux too.

---

## 5. bgutils-js and the PO token

`bgutils-js` (LuanRT) is the open-source implementation of YouTube's BotGuard
attestation, used to mint **PO tokens** (Proof-of-Origin). 4KVD embeds the whole
minified bundle. Recovered constants:

```
GOOG_BASE_URL  https://jnn-pa.googleapis.com
YT_BASE_URL    https://www.youtube.com
exports        BotGuardClient, WebPoMinter, PoToken, Challenge
```

Arroxy already solves this differently: `HiddenWindowTokenProvider` scrapes the
`bevasrs.wpc` WebPoClient factory out of a hidden YouTube page. Both approaches
produce the same artifact.

**The binding rule that matters** (yt-dlp PO Token Guide): a PO token binds to
the *user session* — **`VISITOR_DATA` when logged out, the account Session ID
(first half of `DATASYNC_ID`) when logged in**.

Arroxy today always binds to `VISITOR_DATA` from a logged-out
`persist:youtube-hidden` window, while cookies arrive from an unrelated source.
So whenever cookies are enabled, yt-dlp receives **one identity's cookies and
another identity's token**. yt-dlp warns that supplying a correctly-bound token
is what avoids account blocks.

Measured cost of getting this wrong:

| Configuration | Formats | Max height |
|---------------|---------|------------|
| Cookies only, `player_client=mweb` | 1 | 360p |
| Cookies + `web.gvs` token, `player_client=web` | 0 | — |
| Cookies + `web.gvs` token, `player_client=web_safari` | 0 | — |
| Cookies, `player_client=tv` / `tv_simply` / `web` | 0 | — |
| **Cookies + `mweb.gvs` token, `player_client=mweb`** | **36** | **2160p** |

**Client-family coherence is a chain:** an iPad login yields a *mobile* session →
pairs with the `mweb` client → needs an **`mweb.gvs`**-labelled token. Mixing
families produces nothing.

---

## 6. Other findings worth keeping

- **Cookie rotation.** yt-dlp's wiki: *"YouTube rotates account cookies
  frequently on open browser tabs"*; the documented method is to log in via a
  private window, export, then **close it so the session is never reopened**.
  This is in direct tension with keeping a signed-in browser tab open *and*
  handing the same jar to yt-dlp. Tyrrrz's app avoids this by using its webview
  for login only, never for browsing. **Needs a deliberate design decision.**
- **Bluetooth security keys.** Our Electron probe logged
  `FIDO: Cannot use Bluetooth because the responsible app … does not have
  Bluetooth metadata in its Info.plist`. Hardware-key 2FA needs
  `NSBluetoothAlwaysUsageDescription` in the packaged app, or users on security
  keys are stuck.
- **macOS menu bar.** A programmatically created `NSApplication` has no menu, so
  Cmd+C/V/X/A silently do nothing — they are dispatched through main-menu key
  equivalents. Any native login window spawned from Electron needs its own Edit
  menu, or paste breaks for password-manager users.
- **`CHROME_UA` is wrong today.** `HiddenWindowTokenProvider.ts:7` claims Linux +
  Chrome 130 while running macOS + Chromium 150, contradicting the client hints
  Chromium still sends. That window mints production PO tokens. Independent of
  this feature, it should be fixed.
- **A password change invalidates every exported jar instantly.** A complete,
  correctly-formed jar authenticated as *nobody* (`LOGGED_IN: false`, visitor
  `DATASYNC_ID`) purely because the account password was changed after capture.
  Worth surfacing in the product: a stored session can die for reasons the app
  cannot see, so "signed in" state must be verified, not assumed.
- **Cookie re-injection into a fresh partition is lossy.** Replaying a jar into a
  new Electron partition landed 65/68 cookies and produced `LOGGED_IN false`
  with a visitor-style `DATASYNC_ID`. Irrelevant in production — the Explore
  partition *is* the logged-in session, so nothing is re-injected — but it means
  a PO token must be minted in the live session, never in a rehydrated copy.
- **Never let an automated probe share a window with a real login.** An
  auto-typing probe was run while a human was signing in for real. Electron
  queues `sendInputEvent` calls, so characters emitted before the click to "Next"
  were still being delivered when the page advanced to `challenge/pwd` — and
  landed in the **password field**. Nothing was captured (no spike reads the
  clipboard or any field value; the probe only ever emits its own generated fake
  address), but the failure mode is obvious in hindsight. All auto-typing probes
  now refuse to start without an explicit `--auto-type` flag, and
  `electron-login-manual.mjs` exists for anything involving real credentials.
- **Scripted form-filling triggers CAPTCHAs.** Assigning `input.value` from JS
  produced *"Type the text you hear or see"* on every run and never reached a
  verdict; typing with real key events (`sendInputEvent` / `QKeyEvent`) reached
  one immediately. Any future probe must type like a user.
- **Automated sign-in attempts trigger account defences.** Repeated scripted
  attempts produced a *"Verify it's you — something unusual about your activity"*
  challenge. Any future testing must be manual, single-attempt, on a throwaway
  account.

---

## 6a. Resulting architecture

Decided 2026-08-29 after the findings above.

### Shape

**One embedded browser. Nothing else.**

- No system browser, no native `WKWebView`/WebView2, no screencast, no child
  process, no native addon — every one of those was a detour down a wrong
  conclusion.
- A single `WebContentsView` in the Explore tab on one session partition.
  Sign-in happens *inside* it, the way it does in a real browser: the user is on
  YouTube, clicks YouTube's own "Sign in", and signs in.

### User agents

| Where | UA | Note |
|-------|----|------|
| Explore session (login **and** browsing) | Electron default, `Electron/<v>` → bland token | One identity for both; no switching |
| yt-dlp | its own, per InnerTube client | yt-dlp's concern, not ours |
| PO-token window | **broken today** — claims Linux + Chrome 130 while running macOS + Chromium 150 | Fix regardless of this feature |

### Open UX decision

Login **inline in the Explore pane** (simplest, most browser-like, but download
controls sit above a live Google password form) versus a **dedicated modal**
(cleaner boundary around credentials, slightly more code, mirrors Tyrrrz). Same
engine and session either way — reversible, purely a UX call.

### Cookie rotation — the handling

**Never store a jar.** Read cookies fresh from the live session immediately
before each yt-dlp spawn, write a temp jar, spawn, delete it. Since the session
is ours, `session.cookies.get({})` is always current, so nothing can go stale.

*Residual risk, untested:* yt-dlp's own requests may cause server-side rotation
that desyncs the browser session and signs the user out of Explore. yt-dlp's wiki
warns of this, but assumes an external browser you do not control; here both
sides are ours and can be re-read. This is the most likely source of
"randomly signed out" reports.

### PO tokens — in-app, and now only a fallback

Nothing external is involved: Arroxy already mints tokens in-app
(`HiddenWindowTokenProvider` scrapes the page), and 4KVD does the same with
`bgutils-js`. What changed is that with valid cookies yt-dlp settles on
`android_vr`, a `no-js-player` client needing **no PO token at all** — so the
token drops from primary path to bot-wall fallback. Keep it, but mint it in the
**authenticated** session so it binds to `DATASYNC_ID`.

### Risk register

| Risk | Handling |
|------|----------|
| Session dies invisibly (password change, revoke) | Verify `LOGGED_IN`; never assume. Observed for real |
| Bluetooth security keys unusable | `NSBluetoothAlwaysUsageDescription` in the packaged app |
| UA token gets blocklisted | Keep it runtime-configurable; changeable without a release |
| Account bans | yt-dlp's guidance is to avoid your main account — say so in the UI |
| **DBSC** | Unknown whether Electron's Chromium enrols. Works today; if Google enrols the session, exported cookies stop refreshing elsewhere |
| Stored cookies | Encrypt at rest if persisted (Tyrrrz's pattern) |

### Rollout: Legacy frozen, Explore experimental

- **Legacy (today's URL tab) is left exactly as it is.** No regression risk to
  the existing flow.
- **`cookiesMode` stays.** Legacy depends on it. This **supersedes the earlier
  recommendation to delete all three modes** — that advice assumed Explore would
  replace Legacy outright.
- **Explore ships behind a flag, marked experimental**, and may break or change
  freely. It rests on Google not blocklisting a UA token, which is not a
  foundation the shipping product should sit on yet.
- Accept temporary duplication (two entry points, two cookie paths) but set an
  explicit promote-or-delete decision point rather than letting it drift.

### Not yet executed

- **Windows and Linux have never been run.** The mechanism is engine-level so it
  should be identical, but neither has been executed.
- **Bot-wall relief on the desktop session.** Demonstrated on the iPad/WKWebView
  session; on the `Arroxy`-token desktop session we proved authentication
  (account-gated endpoint reachable only with the jar) but never reproduced a
  rate-limited state to test against.

---

## 7. Open questions

1. **Session sharing.** Can one session serve both a signed-in Explore tab and
   yt-dlp, given cookie rotation? Options: re-export the jar before every yt-dlp
   run; or keep the login session browser-only (Tyrrrz's model).
2. **Token refresh.** PO tokens last ~6 h (Arroxy caches 5 h). Re-minting needs
   the authenticated context to still exist.
3. **Cross-platform login helper.** `WKWebView` (macOS) / WebView2 (Windows) /
   WebKitGTK (Linux). Abstractions exist — `webview/webview` (14.2k⭐),
   `tauri-apps/wry` (4.9k⭐), `@webviewjs/webview` (Node bindings over wry, exposes
   cookies) — but all create their own window and native event loop, so inside
   Electron they must run as a **child process**, not in the main process.
4. **Embedding.** A native webview cannot be placed inside the Explore pane
   without a per-platform native addon parenting an `NSView`/`HWND` into
   Electron's window. Realistic shape: login in a separate Arroxy-owned modal;
   everything else stays Electron.
5. ~~Does the `Arroxy/1.0.0` path work with a real account?~~ **RESOLVED
   2026-08-29 — yes, end to end.** Manual sign-in in a plain Electron
   `BrowserWindow`; cookies exported; the jar verified as genuinely
   authenticated (`"LOGGED_IN": true`, account `DATASYNC_ID`, not a visitor one),
   and an account-gated endpoint (Watch Later) is **DENIED without the jar and
   REACHABLE with it**.

   **Caveat on format claims.** An earlier draft said this path "returns 29
   formats at 2160p60 with no PO token". That was a confounded measurement:
   the identical run *without* cookies returns the same 29 formats at 2160p60,
   because the test video is public and the IP was not rate-limited. Cookies buy
   **gated content and bot-wall relief**, not extra formats on public videos.
   yt-dlp settles on `android_vr` (a `no-js-player` client) either way, which is
   why no PO token was needed.
6. **How durable is the custom-app-token route?** Google blocklists `Electron`
   by name; an unrecognised token could be added at any time. Worth a documented
   fallback (cookies.txt import) and a way to change the token without a release.
7. **Cookie storage** must be encrypted at rest (Tyrrrz's pattern).

*(Resolved 2026-08-28: "is bundled Chromium banned?" — no. It is impersonation
that is banned. See #9-#12.)*

---

## 8. Reproduction

**The spikes were deleted on 2026-08-29**, together with their live cookie
jars and the `spike:*` scripts in `package.json`. The table below is kept as the
record of what was actually tested and what each run proved; it is no longer a
list of runnable files. Recreating any of them from this table is
straightforward, and none should be recreated with auto-typing input — see the
safety note below.

| File | Purpose |
|------|---------|
| `login-spike.mjs` | Interactive Electron login, selectable UA mode |
| `electron-login-probe.mjs` + `electron-login-preload.cjs` | Brave impersonation |
| `electron-firefox-probe.mjs` + `electron-firefox-preload.cjs` | Firefox impersonation |
| `electron-honest-probe.mjs` | Unmodified Electron identity |
| `electron-ipad-probe.mjs` + `electron-ipad-preload.cjs` | iPad UA, page-load only |
| `electron-ipad-login.mjs` | iPad UA, interactive — **proved Chromium is refused** |
| `chrome-login-spike.mjs` / `chrome-login-probe.mjs` | Real browser + CDP |
| `WKLogin.swift` | **Native WKWebView + iPad UA — the one that works** |
| `pot-authed-probe.mjs` | Cookie injection + authenticated PO-token mint |
| `qtwebengine_probe.py` | QtWebEngine (PyQt6), `--ua=honest\|ipad` — honest is ACCEPTED |
| `electron-honest-probe.mjs` | `--ua=honest\|qt\|arroxy` — **`arroxy` is ACCEPTED**; needs `--auto-type` |
| `electron-login-manual.mjs` | **manual only, safe for real credentials** — zero synthetic input |

**Safety note, learned the hard way.** An early probe queued synthetic
`sendInputEvent` calls that outlived a navigation and typed into the password
field of a real account, and a run of automated sign-in attempts triggered a
Google security challenge on that account. Any recreated spike must be
manual-only: no synthetic keyboard or mouse input on `accounts.google.com`, and
no reading of form field values. The same rule is carried into the product spec
— Arroxy never touches the sign-in form.

---

## 9. References

- [yt-dlp PO Token Guide](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide)
- [yt-dlp Extractors wiki — exporting YouTube cookies](https://github.com/yt-dlp/yt-dlp/wiki/Extractors)
- [Google: blocking less secure browsers](https://developers.googleblog.com/2020/08/guidance-for-our-effort-to-block-less-secure-browser-and-apps.html)
- [Google: protecting cookies with DBSC](https://blog.google/security/protecting-cookies-with-device-bound-session-credentials/)
- [DBSC GA on Windows](https://workspaceupdates.googleblog.com/2026/05/prevent-account-takeovers-with-DBSC-now-generally-available-in-the-Chrome-browser-for-Windows.html)
- [Chrome: remote debugging switch changes](https://developer.chrome.com/blog/remote-debugging-port)
- [4KVD FAQ — logging into YouTube in-app](https://www.4kdownload.com/faq/faq-howto-log-into-youtube-in-app/2)
- [Tyrrrz/YoutubeDownloader](https://github.com/Tyrrrz/YoutubeDownloader) · [th-ch/youtube-music](https://github.com/th-ch/youtube-music) · [ytmdesktop#866](https://github.com/ytmdesktop/ytmdesktop/issues/866)
