# In-App Browser (Explore) Spec

Status: draft for implementation
Updated: 2026-08-29

Research and rationale: [`YOUTUBE-AUTH-RESEARCH.md`](../YOUTUBE-AUTH-RESEARCH.md).
**Read §2 and §6a before touching any of this.** The user-agent rule is
counter-intuitive and trivially broken by a well-meaning edit.

## Lives in

| Path | Role |
|---|---|
| `src/main/services/ExploreSessionService.ts` | **new** — owns the Explore partition, UA, and cookie reads |
| `src/main/services/netscapeCookieJar.ts` | **new** — pure `Cookie[]` → Netscape text |
| `src/main/services/cookiesResolver.ts` | gains the `session` kind; Legacy branches untouched |
| `src/main/services/YtDlp.ts` | `cookiesArgs` construction and temp-jar lifetime around `invokeWithRetry` |
| `src/main/token/providers/HiddenWindowTokenProvider.ts` | existing UA bug to fix; authenticated minting |
| `src/shared/schemas.ts` | `cookieSourceSchema`, new `common` fields |
| `src/shared/ipc.ts` | `explore:*` channels |
| `src/renderer/src/App.tsx` | rail mounting point above the content area |
| `src/renderer/src/components/layout/WizardPanel.tsx` | Legacy content, wrapped not modified |
| `design/in-app-browser/` | mockups — `Main.dc.html` chosen, `MinWindow.dc.html` the 720x680 floor. **Gitignored (`/design/`), so local-only** — the layout decisions are restated in [UI](#ui) rather than left solely to those files |

## Goal

Add an **Explore** tab: an embedded browser where the user browses YouTube while
signed in, and Arroxy reuses that session's cookies for yt-dlp. This removes
manual cookie export and browser-picking for users who want a signed-in session.

## Non-goals

- **Not a replacement for Legacy.** `cookiesMode` (`off` / `file` / `browser`) stays exactly as it is.
- **Not a general-purpose browser.** YouTube and Google sign-in only.
- **Not multi-account.** One session, one signed-in identity.
- **Arroxy never handles credentials.** No reading, injecting, autofilling, or observing the sign-in form. The user types into Google's page; we only own the window it renders in.

## Rollout

- Explore ships behind a flag, **default off**, labelled experimental in the UI.
- **Legacy is frozen.** Its behaviour, its settings, and its cookie path do not change. A rail wrapping it is acceptable; changing what it does is not.
- Temporary duplication (two entry points, two cookie paths) is accepted, with an explicit **promote-or-delete decision point** rather than indefinite drift.

## The rule that must not be broken

**Never claim to be a browser we are not.**

Google's sign-in gate does not check the engine — it checks for deception. A UA
string asserting Chrome/Brave/Firefox/Safari while Client Hints
(`Sec-CH-UA`, `navigator.userAgentData`) say otherwise is a detectable lie and
gets `/v3/signin/rejected`. A bland token that asserts nothing checkable passes
the full `GlifWebSignIn` flow.

Consequences for implementation:

- The Explore session UA is a **bland token** (e.g. `Arroxy/<version>`). Never a real browser's UA.
- **Never override Client Hints** to match a spoofed UA. That is the failure mode, not the fix.
- The token is **runtime-configurable** (settings-backed, no release needed) because a blocklist is the plausible way this breaks.
- Honest `Electron/<v>` also passes but is *demoted* to `WebLiteSignIn`. Prefer the bland token; treat `Electron/` in the UA as a bug.
- A unit test must fail the build if a real-browser UA string appears in the Explore session path.

## Glossary additions

Add to [`CONTEXT.md`](../CONTEXT.md):

- **Explore** — the in-app browser tab and its signed-in session.
- **Explore session** — the persistent Electron session partition backing Explore.
- **Session cookies** — cookies read live from the Explore session, as opposed to a user-supplied file or an external browser.
- **Legacy** — today's URL-input wizard flow, kept unchanged alongside Explore.

## Architecture

### Main process

New `ExploreSessionService` (`src/main/services/ExploreSessionService.ts`) owns
the whole surface. Nothing else may touch the partition.

```ts
class ExploreSessionService {
  getSession(): Session                       // persist:arroxy-explore
  getUserAgent(): string                      // bland token, settings-backed
  readCookies(): Promise<Cookie[]>            // live read, never cached
  isSignedIn(): Promise<boolean>              // presence of SID/__Secure-3PSID
  signOut(): Promise<void>                    // clearStorageData on the partition
}
```

- Use **`WebContentsView`**, not `<webview>` (deprecated) and not a second `BrowserWindow`.
- Partition: `session.fromPartition('persist:arroxy-explore')`.
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, no preload with app privileges.
- Devtools disabled in packaged builds.

### Cookie handoff

Extend the existing `ResolvedCookies` union in
[`src/main/services/cookiesResolver.ts`](../src/main/services/cookiesResolver.ts):

```ts
type ResolvedCookies =
  | {kind: 'file'; path: string}
  | {kind: 'browser'; browser: CookiesBrowser}
  | {kind: 'session'}          // new — Explore
```

**Never store a jar.** For `kind: 'session'`, immediately before each yt-dlp
spawn: read cookies live from the session, write a Netscape-format temp jar with
`0600` permissions, spawn, delete the jar in a `finally`. Because the session is
ours, a live read is always current — nothing can go stale.

Integration point is [`YtDlp.ts:130`](../src/main/services/YtDlp.ts), where
`cookiesArgs` is built. The `session` kind resolves to `['--cookies', <tmpPath>]`,
same as `file`. The temp-jar lifetime must be scoped to the invocation, which
means the write/delete belongs around `invokeWithRetry`, not inside the arg
builder.

New pure module `src/main/services/netscapeCookieJar.ts` — `Cookie[]` → Netscape
text. Pure and unit-testable; no I/O.

### Navigation policy

- Allowlist: `youtube.com`, `google.com`, `accounts.google.com`, `gstatic.com`, `ggpht.com`, `googlevideo.com` and their subdomains. Everything else opens in the system browser via `shell.openExternal`.
- `setWindowOpenHandler` → `{action: 'deny'}`, routing popups to in-tab navigation or the system browser. **Exception:** Google's sign-in flow legitimately opens popups; verify before hard-denying or sign-in may break.
- Never inject scripts into `accounts.google.com`. Not for convenience, not for diagnostics.

### PO tokens

`HiddenWindowTokenProvider` keeps working and is unchanged by this feature, with
two follow-ups:

1. **Fix the existing UA bug** — it declares `X11; Linux x86_64 … Chrome/130` while running whatever host and Chromium it is actually on. This is the same class of lie described above and should be fixed regardless of Explore.
2. When Explore is signed in, mint tokens in the **authenticated** session so the token binds to the account's `DATASYNC_ID` rather than `VISITOR_DATA`.

With valid cookies yt-dlp settles on `android_vr` (a `no-js-player` client that
needs no PO token), so tokens drop from primary path to bot-wall fallback.

## Settings and schema

Per house rule, enums go in [`src/shared/schemas.ts`](../src/shared/schemas.ts) as `z.enum` → `z.infer` → `.options`.

```ts
export const cookieSourceSchema = z.enum(['settings', 'explore'])
```

New `common` fields:

| Field | Type | Default | Notes |
|---|---|---|---|
| `exploreEnabled` | `boolean` | `false` | The experimental flag |
| `cookieSource` | `CookieSource` | `'settings'` | `'explore'` routes yt-dlp to the session |
| `exploreUserAgent` | `string?` | unset → `Arroxy/<version>` | Advanced/hidden escape hatch if the token is blocklisted |

`resolveCookies` returns `{kind: 'session'}` only when `exploreEnabled &&
cookieSource === 'explore' &&` the session is signed in — otherwise it falls
through to today's `cookiesMode` logic unchanged. That fallthrough is what keeps
Legacy frozen.

## UI

Mockups: [`design/in-app-browser/`](../design/in-app-browser/) — `Main.dc.html`
is the chosen split layout, `MinWindow.dc.html` the 720x680 floor.

- **Rail** (`Explore | Legacy | Downloads | Profiles | Settings`) above the content area. With the flag off, Explore is absent and the rail must not alter Legacy's behaviour.
- **Split pane**: browser above, download controls below. Must hold at the 720x680 minimum window.
- **Grab**: takes the current Explore URL into the download flow. No second URL input — the browser's address is the source of truth.
- **No sign-in status chip.** The browser shows the user's state; a redundant label was explicitly rejected.
- Use installed shadcn primitives. No Radix. Segmented controls follow the `toggleVariants` rules in CLAUDE.md.
- Localised labels run 1.5–2x English — check `el`, `fr`, `my` against the rail at minimum width.

**Open decision:** sign-in inline in the Explore pane (simplest, most
browser-like, but download controls sit above a live Google password form)
versus a dedicated modal (cleaner boundary around credentials, slightly more
code). Same engine and session either way — purely UX, reversible.

## IPC

Add to `IPC_CHANNELS` in [`src/shared/ipc.ts`](../src/shared/ipc.ts):

```
exploreNavigate      'explore:navigate'       // renderer → main
exploreGrabUrl       'explore:grabUrl'        // renderer → main
exploreSignOut       'explore:signOut'        // renderer → main
exploreGetState      'explore:getState'       // renderer → main
exploreStateChanged  'explore:stateChanged'   // main → renderer
```

`exploreGetState` / `exploreStateChanged` carry `{url, title, canGoBack,
canGoForward, signedIn}`. **Cookies never cross IPC.** The renderer has no
reason to see them and every reason not to.

## Security

- Temp jars: `0600`, deleted in a `finally`, never inside the user's output directory.
- Never log cookie values. Names and domains only, as used during this research.
- If cookies are ever persisted outside the session (they should not be), encrypt at rest via `safeStorage`.
- The UI must warn that a downloader session carries account-ban risk, and recommend against using a primary account — this matches yt-dlp's own guidance.
- `NSBluetoothAlwaysUsageDescription` in the packaged macOS app, or Bluetooth security keys cannot complete 2FA.

## Testing

Following the layer ownership in CLAUDE.md — Explore is **not** an excuse to
drive real YouTube login from CI.

| Layer | Covers |
|---|---|
| Unit (`tests/unit`) | Netscape jar writer; `resolveCookies` session branch and its fallthrough; navigation allowlist; **UA invariant test** — fails if a real-browser UA appears in the Explore path |
| Renderer (`tests/renderer`) | Rail rendering, flag on/off, Explore absent when disabled |
| Browser mock (`tests/browser`) | Split-pane layout at 720x680 and 150% zoom; rail overflow across `el`/`fr`/`my` |
| Mock Electron E2E | Session partition isolation from the app session; no cookies over IPC; devtools off when packaged |
| Fixture Product E2E | Grab → queue → download using the fixture extractor. **Never real YouTube auth.** |
| Manual | Cross-platform sign-in matrix (below) |

**Manual matrix — none of this has been executed.** macOS is verified; Windows
and Linux have never been run. The mechanism is engine-level so it should be
identical, but "should" is not "is", and this is the single largest unknown in
the feature.

| Platform | Sign-in reaches `GlifWebSignIn` | Cookies authenticate yt-dlp | Bot-wall relief |
|---|---|---|---|
| macOS | verified | verified | unproven |
| Windows | not run | not run | not run |
| Linux | not run | not run | not run |

## Implementation order

1. `netscapeCookieJar.ts` + `ExploreSessionService` (headless, no UI) → **verify:** unit tests pass; a manual sign-in in a scratch window produces a jar that authenticates an account-gated endpoint.
2. `resolveCookies` session branch + `YtDlp` temp-jar lifecycle → **verify:** unit tests cover both branches; Legacy's existing tests still pass untouched.
3. Schema, settings, flag plumbing → **verify:** `bun run check`; flag off leaves `resolveCookies` behaviour byte-identical.
4. IPC + `WebContentsView` mounting → **verify:** mock E2E asserts partition isolation and that no cookie crosses IPC.
5. Rail + split pane + Grab → **verify:** browser tests at 720x680 and 150% zoom across the worst-case locales.
6. Cross-platform manual matrix → **verify:** table above filled in for Windows and Linux.
7. Promote-or-delete review → **verify:** an explicit decision is recorded, not deferred.

Steps 1–2 are independently useful and carry no UI risk. Step 6 is the one that
can invalidate the design; if it fails, the feature stays flagged off rather
than shipping broken.

## Open decisions

- Inline sign-in versus dedicated modal (above).
- Whether Explore's rail ships with the flag off — i.e. whether Legacy gains a rail with a single tab, or the rail appears only when Explore is enabled.
- Whether an ADR is warranted for "bland UA, never impersonate". It fits the criteria (hard to reverse, surprising without context, real trade-off), and `YOUTUBE-AUTH-RESEARCH.md` is long-form research rather than a decision record.
- Promote-or-delete criteria: what observed result would justify making Explore the default and retiring `cookiesMode`.
