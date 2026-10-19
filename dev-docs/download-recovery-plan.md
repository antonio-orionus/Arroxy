# YouTube extraction and recovery: implementation plan

Status: plan, 2026-10-19. It turns [download-recovery-proposal.md](download-recovery-proposal.md) into ordered, shippable steps. The decision is recorded as a draft in [ADR 0010](../docs/adr/0010-one-recovery-policy-for-yt-dlp-runs.md). Nothing here is implemented yet.

## The decision this serves

When YouTube pushes back, Arroxy should deliver the requested file with the fewest requests. It should never repeat an attempt that cannot change the outcome, and it should tell the user truthfully what happened and why it stopped.

Each goal below is checked in [Verification](#verification):

| # | Goal | Measured by |
| --- | --- | --- |
| G1 | The configuration yt-dlp parses equals the configuration Arroxy intended, for every operation and identity, on every yt-dlp version Arroxy can run | Real-parser contract test |
| G2 | Within one operation, two launches never share an effective configuration and identity, except when retrying a transient failure after a backoff | Property test, plus launch counts in Fixture E2E |
| G3 | Every operation has a launch budget and an extraction deadline set from the measured baseline, and stops with a stated reason | Property test, Fixture E2E |
| G4 | A rate limit never triggers an immediate retry. New matching work waits out one per-site cooldown | Fixture E2E 429-burst scenario |
| G5 | The guidance the user sees comes from main's decision, not from the renderer classifying the error again | Renderer tests, Fixture E2E |

## Evidence

### The field incident, from `main.log` (2026-10-19 08:36)

The single-video probe was launched with arguments in this order:

```text
--extractor-args youtube:po_token=[REDACTED];visitor_data=[REDACTED]
… --dump-single-json --no-playlist --sleep-requests 1
--extractor-args youtube:player_client=default,web_embedded
```

yt-dlp then warned `Unable to fetch GVS PO Token for web client: Missing required Visitor Data`, in the same run that had supplied visitor data. A webpage request returned HTTP 429 and the probe completed degraded. **1 ms later** Arroxy relaunched the identical command, which got the same 429. The UI reported `degraded: ['extractor', 'botWall']`, labelling a rate limit as a bot wall. Successful probes in this log take 22–37 s each.

That log also shows 62 startup token pre-warms. Each loads YouTube in a hidden window to mint a token that, for media and single-video probes, is then thrown away.

### Root cause, confirmed against yt-dlp source

Arroxy's yt-dlp is chosen at runtime from a signed index, nightly first (`BinaryManager.runResolveYtDlp`). Today that is `2026.10.10.233141`, revision `897341241f…`. The index can change on a user's next launch without an app release.

| Fact | Source at `897341241f` |
| --- | --- |
| A repeated `--extractor-args` block for the same extractor **replaces** the earlier one (`append=False`) | `options.py:268-296`, `:1925-1937`; reproduced with `parse_options` |
| Syntax: one block per extractor, `;` between keys, `,` between list items, `\,` for a literal comma, no escape for `;`, only the first `=` splits | `options.py:1925-1937` |
| Config-file `--extractor-args` come before the command line, so a command-line block replaces the whole `youtube` dict from config | `utils/_utils.py:5025` |
| A manual `po_token` wins over providers and `fetch_pot`. The only sign it was used is a debug line, `Retrieved a gvs PO Token for web client from config`, shown only with `-v` | `_video.py:2799-2812` |
| For the clients Arroxy uses, a missing token is **silent**: only a debug line, then formats are skipped | `_video.py:3195-3206` |
| A supplied `visitor_data` overrides the per-page visitor refresh during tab pagination. This is the mechanism behind the 100-entry playlist cap | `_base.py:936-945`, `_tab.py:606-608` |
| `visitor_data` is meant to be used without cookies. A token sent with cookies but no Data Sync ID warns "Formats may not work" | yt-dlp README; `_base.py:823-833` |
| Extractor retries never cover 403 or 429. Media downloads retry only 5xx and transport errors. Nothing honours Retry-After. `--retry-sleep` defaults to no sleep | `_base.py:1002, 1337`; `downloader/http.py:185-192` |

On the Arroxy side, `spawnCollect` places the token block before `plan.args` ([YtDlp.ts:234](../src/main/services/YtDlp.ts)). The bridge adds `youtube:player_client=…` for every single-video probe since 2026-06-15, and for every YouTube media request since #230 on 2026-09-16 ([mediaRequest.ts:56](../src/main/services/phases/mediaRequest.ts)). Subtitle runs carry no client block, so they keep the token. The bridge's own managed workflow has the same defect for `lang`, `comment_sort`, `max_comments`, `fetch_pot`, `skip`, `player_client`, `formats` and `po_token` ([workflow.ts:603-610](../packages/yt-dlp-bridge/src/workflow.ts)). That bug ships in the published package.

**Hazard the fix would expose.** `shouldUsePotLadder` excludes only the Explore session ([YtDlp.ts:369](../src/main/services/YtDlp.ts)). Runs with a cookies file or browser cookies still receive the anonymous token and visitor data. Today the defect hides this on media runs, but subtitle runs already send them. A correct argument fix with no other change would start pairing anonymous visitor data with a signed-in account on every cookie-file download.

### Baseline launch counts (static analysis)

Here a launch is one yt-dlp process. "Typical" means every anonymous attempt is bot-walled and the signed-in attempt succeeds. "Wasted" means the effective configuration is identical to the previous launch.

| Operation | Typical today | Wasted | Worst today | Worst wall clock |
| --- | --- | --- | --- | --- |
| Single-video probe | 4 | 2 | 12 | ~54 min (180 s timer per launch, plus slot waits) |
| Auto or playlist probe | 2; a degraded success also takes 2 | the degraded retry (identical) | 8 | ~24 min |
| Bulk hydration of N rows (2 workers) | 4N | 2N | 12N; signed-in launches have no overall cap | ⌈N/2⌉ × 54 min |
| Media job with the probe's info-json | 7 | ~4 (the replay mints tokens no extraction reads) | 8 (cookie file or browser: 9) | Not limited by the app |
| Subtitle-only job | 4 | 0 | 5 | — |
| Media plus sidecar subtitles | — | — | 10 | — |
| Queue automatic retry of a media job | 0 for a bot wall (not eligible); 2 per 429 cycle | — | ~100 over 10 cycles | 2,310 s of backoff, no shared cooldown |

**Identical launches** happen in five places:

- The 3-step token ladder whenever explicit clients are passed.
- The ladder on info-json replays, where no extraction happens.
- The probe timeout retry (the token is cached for 5 h).
- The probe degradation retry.
- Retries after escalation, which differ only in the cookie-jar path.

`VideoPhase` also resets the anonymous token session on signed-in jobs that never use it.

### Classification loses meaning

- `YtDlp.ts:358` classifies the **entire** stderr, and `botBlock` takes precedence over `rateLimit`. So a 429 *warning* can mask a later fatal error such as unavailable or geo-blocked.
- The probe's own pattern list lumps 429 under `bot`. It misses the curly-apostrophe `you’re`, the captcha suffix, the session rate-limit message, `Signature solving failed` and `Failed to extract any player response`.
- The `unavailable` pattern includes `Requested format is not available`. That is often what a missing token or a failed n/signature solve looks like downstream, not an unavailable video.
- The renderer then gives account/cookie advice for every `unavailable` ([probeErrorExperience.ts:50](../src/renderer/src/store/wizard/probeErrorExperience.ts)).

### Tests share the same false assumption

- [ytdlp-args.test.ts:767](../tests/unit/ytdlp-args.test.ts) expects two separate blocks.
- [ytdlp-retry.test.ts:85](../tests/unit/ytdlp-retry.test.ts) pins the ladder on replays.
- [download-smoke-report.test.ts:32](../tests/unit/download-smoke-report.test.ts) and `probeSmokeReportIsHealthy` treat "token present in argv" as "token used". (The live probe smoke also accepts a bot wall; that is deliberate, since it runs on CI runners YouTube walls by IP, and it checks the packaged runtime's wiring, not reachability.)
- The fixture extractor ([arroxy_fixture.py](../tests/e2e/yt-dlp-plugins/yt_dlp_plugins/extractor/arroxy_fixture.py)) never reads extractor args and never produces a 429, a bot wall, a degraded result or a timeout.
- E2E overrides the production retry budgets, so they never run.
- `_lastInvocations` lives on the shared `YtDlp` instance, so concurrent runs overwrite each other's smoke summaries.

### Live comparison (step 2), 2026-10-19

**Setup.**
- `bun run smoke:download -- --cookies off --proxy off --verbose`, macOS dev build of this branch, balanced profile (cap `res:720`).
- 20 public videos: 7 music, 7 long-form, 5 Shorts, and one 2005 upload limited to 240p.
- Three configurations:
  - **a:** yt-dlp defaults, `--clients none --po-token off`.
  - **b:** production clients `default,web_embedded`, `--po-token off`.
  - **c:** production clients plus the token.
- 60 runs in a seeded random order (seed 20261019), stopping at the first HTTP 429.
- Runs 0–3 used a VPN exit in Iceland at 30 s spacing. Runs 4–14 used a VPN exit in Canada at 90 s spacing, on a build that also had the visitor-data fix below. Run 15 used a datacenter exit in France.
- The Iceland and Canada exits were rate limited after about 5 and 11 runs respectively. The France exit answered 429 on its first run, so the comparison stopped there: 16 of the 60 runs happened. 15 completed; run 3 was lost to the rate limit.

| # | Video | Kind | Cfg | Exit | Selected / available height | Format chosen | Launches | Token used for | Clients withheld | Warnings | s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | `rfscVS0vtbw` | long | b | IS | 720 / 720 | yes | 1 | – | – | – | 54 |
| 1 | `YQHsXMglC9A` | music | b | IS | 720 / 1080 | yes | 1 | – | – | – | 57 |
| 2 | `YlvcFJOE-OE` | short | b | IS | 1280 / 2162 | yes | 1 | – | – | – | 56 |
| 3 | `hTWKbfoikeg` | music | a | IS | – / – | no | 1 | – | web | 429 (webpage), then a fatal bot check | 46 |
| 4 | `aircAruvnKk` | long | c | CA | 720 / 1080 | yes | 1 | – | – | – | 35 |
| 5 | `9bZkp7q19f0` | music | a | CA | 720 / 1080 | yes | 1 | – | – | – | 30 |
| 6 | `dQw4w9WgXcQ` | music | c | CA | 720 / 2160 | yes | 1 | – | – | – | 38 |
| 7 | `Nus7MfF2ytw` | short | a | CA | 1280 / 3840 | yes | 1 | – | – | – | 34 |
| 8 | `LXb3EKWsInQ` | long | c | CA | 720 / 2160 | yes | 1 | – | – | – | 36 |
| 9 | `JGwWNGJdvx8` | music | a | CA | 720 / 2160 | yes | 1 | – | – | – | 34 |
| 10 | `YlvcFJOE-OE` | short | c | CA | 1280 / 2162 | yes | 1 | web | web | – | 37 |
| 11 | `Nus7MfF2ytw` | short | c | CA | 1280 / 3840 | yes | 1 | web | web | – | 39 |
| 12 | `LXb3EKWsInQ` | long | a | CA | 720 / 2160 | yes | 1 | – | – | – | 38 |
| 13 | `z1NNgSu8hTI` | long | a | CA | 720 / 1080 | yes | 1 | – | – | – | 34 |
| 14 | `z1NNgSu8hTI` | long | b | CA | 720 / 1080 | yes | 1 | – | web | 429 (webpage), no visitor data | 40 |
| 15 | `rfscVS0vtbw` | long | c | FR | 720 / 720 | yes | 1 | – | – | 429 (webpage) | 67 |

Shorts are vertical, so the 720 cap shows as a height of 1280.

**Requested-quality fit.** Every completed run reached the profile's cap, in all three configurations:

| Config | Fit | Launches |
| --- | --- | --- |
| a | 5/5 (+1 lost to the 429) | 6 |
| b | 4/4 | 4 |
| c | 6/6 | 6 |

On the Canadian exit, (a) averaged 34 s and (c) 37 s. The difference is the per-process mint, which production caches for 5 h.

**What else the runs showed:**

- **The token rarely reaches a format decision.** yt-dlp drops a client's formats once an earlier client has already supplied the same stream, and the GVS token is requested only for formats that survive. With the production clients, `tv_samsung` and `visionos` usually supply every stream first. yt-dlp took the token for the web client in only 2 of 6 (c) runs (runs 10 and 11, both Shorts), and the web formats were withheld in both anyway. No run's selection changed because of the token.
- **The token could not work at all on some networks.** On those networks youtube.com serves `ytcfg` without `VISITOR_DATA`; the visitor identity is only in `INNERTUBE_CONTEXT.client.visitorData`. Arroxy read only `VISITOR_DATA`, so it bound the token to the video ID, and yt-dlp dropped it for the web client with `Missing required Visitor Data`. Seen on the Dutch and Icelandic exits; fixed in this PR (`getVisitorData` reads both keys, and no visitor data means no token). Runs 4–14 had the fix.
- **429 here arrives first on yt-dlp's webpage request, as a warning.** The extraction carries on through the player API clients. Run 3 then hit a fatal bot check, and runs 3 and 14 lost visitor data with the webpage. Runs 14 and 15 still reached the cap. A plain `curl` of the same watch page right after a 429 returned 200.

**Decision: token-first.** (c) matched (a) and (b) on requested-quality fit, with the same single launch. By the decision rule, the token stays first, and token-on-demand is not built.

The sample is small: 16 of the planned 60 runs, three exits, one profile. If withheld-quality reports return now that the token is effective, rerun the comparison:
- `--po-token off` and `--verbose` are the levers;
- `poTokenFromConfigClients` shows whether the token reached a decision.

**H1** (tokenless media downloads since 2026-09-16 caused some of the withheld-quality cases that cookieless recovery, #230, was built for): **not supported.**
- Every tokenless anonymous run that completed (a and b, 9 runs) reached the profile's cap.
- The cases #230 handles are signed-in runs: formats withheld while cookies are sent. Invariant 1 now keeps the anonymous token away from every run with cookies, so a re-run "with the token effective" cannot exist for them.
- The three-case re-run was therefore not performed. The original report also has no reproducible URLs or account.

## Architecture

The structure follows [ADR 0005](../docs/adr/0005-core-shell-boundary-three-ports-and-an-inward-dependency-rule.md). The policy is a pure function and needs no port. Logging and attempt events go through the existing ports. The token provider and the Explore session stay shell-side, and the policy receives only *whether they are available*.

```text
 renderer ── (event port: AttemptRecord, Decision.reason) ──────────────────────┐
                                                                                 │
 ProbeService / phases / QueueService                                            │
        │ operation + identity + request                                         │
        ▼                                                                        │
 OperationRunner  ── loop ──►  decideNext(state)  (pure, src/shared/recovery/)   │
        │   ▲                       │ Decision: launch(strategy) │ finish │ defer │ needUser
        │   └── AttemptRecord ◄─────┘                                            │
        ▼                                                                        │
 renderArgv(plan, strategy)  (yt-dlp-bridge: typed ExtractorOptions → one block per IE)
        ▼                                                                        │
 YtDlp process adapter: exactly one launch, returns stdout, stderr, exit,       │
 observations[], elapsed, effectiveConfigFingerprint ─────────────────────────────┘
        ▲
 SiteRequestState (plain class, injected): rateLimitedUntil, anonymousWallStreak, per site + route
```

### A1. Typed extractor options, rendered once (bridge)

- **Typed model.** `ExtractorOptions` is a typed map from extractor name to `{key: string[]}`. `YoutubeExtractorOptions` names the keys Arroxy uses: `playerClient`, `poToken`, `visitorData`, `playerSkip`, `fetchPot`, `lang`, `skip`, `formats`. Both are Zod schemas, following the bridge's existing pattern.
- **One renderer.** `renderExtractorArgs(options)` writes **exactly one** `--extractor-args` per extractor. It escapes `,` as `\,`, rejects `;` in values, and drops empty keys.
- **A plan is data until it runs.** `planWorkflow` returns `facts.extractorOptions` and argv without extractor args. A new `renderArgv(plan, overrides)` merges per-attempt overrides (token, visitor data, clients) and renders the final argv. The app stops concatenating extractor flags in `spawnCollect`. The token becomes a typed override, not a string.
- **Managed workflow.** `appendManagedExtractorArgs` uses the same renderer, which fixes the published package.
- **Guard.** `assertOneBlockPerExtractor(argv)` runs in the process adapter. It throws in tests and E2E and logs an error in production. This catches any future path that bypasses the renderer.
- The app consumes the bridge via `workspace:*`, so **no package publish is on the critical path**. The package is released later on its own `yt-dlp-bridge-v*` tag, with a changelog entry for the managed-path fix.

### A2. Evidence: observations separate from the terminal cause

- `normalizeOutcome(exit, stdout, stderr)` returns:
  - `observations[]`, each `{kind, severity: debug|warning|error, line, extractor}`, classified **per line**.
  - `terminalCause`, taken from the last `ERROR:` line only.
  - Two separate facts about the result:
    - `usable`: there is something to keep (video info with at least one downloadable format; media file on disk; subtitle file on disk).
    - `satisfies`: the usable result also meets the request (requested height, audio, subtitles).

    A 720p result for a 1080p request is `usable` but does not `satisfy`. It is kept as the best candidate, so it survives budget exhaustion.
- **Evidence kinds** are a Zod enum in `schemas.ts`. They are named after yt-dlp's strings from the table above:
  - `rateLimited`, `sessionRateLimited`, `botCheck`, `ipBlocked`
  - `accountRequired` (login, private, members-only, age-gated with a login reason)
  - `removed`, `geoBlocked`, `drm`, `drmPartial`
  - `tokenContextMissing` (missing visitor data, invalid `po_token`)
  - `challengeFailed` (n or signature), `jsRuntimeMissing`
  - `formatsWithheld` (the existing format-limit signals), `formatUnavailable` (requested format not available), `noPlayerResponse`
  - `transport`, `cookiesRejected`, `unknown`
- **Reuse `ytdlp-errors` for the patterns**, but call it per line. Add the missing patterns there. Each pattern is pinned to the yt-dlp source line it comes from, and `scripts/scan-yt-dlp-source.mjs` (which already exists) is extended to fail when a pinned string disappears upstream. Because this changes the published package, it ships on its own tag after the app uses the workspace version.
- **`unavailable` is split.** `formatUnavailable` is never account evidence.

### A3. The policy, a pure function

```ts
decideNext(state: RecoveryState): Decision
RecoveryState = {
  operation: 'probeVideo' | 'probeCollection' | 'media' | 'subtitlesOnly' | 'subtitlesAfterMedia' | 'titleBackfill'
  identity: 'anonymous' | 'exploreSession' | 'cookieFile' | 'browserCookies'
  capabilities: {tokenProvider: boolean; exploreEligible: boolean; escalationAllowed: boolean}
  site: SiteRequestSnapshot     // rateLimitedUntil, anonymousWallStreak
  history: AttemptRecord[]      // strategy, identity, fingerprint, outcome, observations, startedAt, elapsedMs
  budget: {launchesLeft: number; deadlineAt: number | null}
  best: UsableCandidate | null  // ranked by the request's requirements, not by format count
  now: number
}
Decision =
  | {kind: 'launch'; strategy: Strategy; identity: Identity; reason: ReasonCode}
  | {kind: 'finish'; result: 'usable' | 'failed'; reason: ReasonCode}
  | {kind: 'defer'; until: number; reason: ReasonCode}
  | {kind: 'needUser'; action: 'signIn' | 'chooseExplore' | 'retryLater'; reason: ReasonCode}
Strategy = {token: 'none' | 'anonymousPot'; clients: 'default' | readonly string[]; reuseInfoJson: boolean}
```

`ReasonCode`, `Decision['kind']` and `Strategy` fields are Zod enums in `schemas.ts`. Every `switch` is exhaustive.

**The central rule:** a launch is allowed only if its **fingerprint** is new in `history`. The one exception is when the last evidence was `transport` or a timeout and the backoff has passed. This single rule removes every identical launch in the baseline.

The fingerprint is a hash of:

- The rendered extractor config, with secret values replaced by **generation counters**: `tokenGeneration` goes up on each re-mint, `sessionGeneration` on each verified cookie-jar refresh.
- The identity.
- Whether cached metadata is reused (`reuseInfoJson`).

So a real re-mint, or a verified refresh after `cookiesRejected`, counts as a new fingerprint. A launch that differs only in a temporary jar path does not. Secrets never enter the hash.

**The policy table** refines the proposal's matrix and is pinned by tests. "Eligible" means the Explore gate passes and escalation is allowed for the operation.

| Evidence (terminal or observed) | Usable result? | Decision |
| --- | --- | --- |
| None, or incidental warnings | usable and satisfies | `finish usable` |
| `rateLimited` / `sessionRateLimited` | usable | `finish usable` with a limitation. Set the site cooldown. No retry |
| `rateLimited` / `sessionRateLimited` | not usable | Set the site cooldown, then `defer`. The queue honours it; an interactive probe gets `needUser retryLater`. **Never** change identity because of a rate limit |
| `accountRequired`, including on an exit-0 result | any | If eligible, `launch` with Explore. Otherwise `needUser signIn`/`chooseExplore` |
| `botCheck`, anonymous | not usable | `launch` the next new-fingerprint anonymous strategy (token, then alternative clients) within budget. Then Explore if eligible. Otherwise `needUser` |
| `botCheck`, signed in | not usable | `finish failed` (account-level wall) |
| `tokenContextMissing` / `challengeFailed` / `jsRuntimeMissing` | any | One new-fingerprint strategy only if it changes the failing condition (a re-mint for token context; none for a missing JS runtime). `jsRuntimeMissing` is reported as a **local configuration defect** |
| `formatsWithheld` | usable, does not satisfy | Keep the best candidate. One new-fingerprint anonymous strategy. Offer Explore as a choice, without claiming it will improve quality (ADR 0008) |
| `cookiesRejected` | — | Verify the session once. If still signed in, refresh the jar and `launch` once. Otherwise `needUser signIn`. Keep saved media |
| `transport` before transfer, on a replay | — | `launch` a fresh extraction (`reuseInfoJson: false`). Reset the anonymous token **only if** identity is anonymous and the token was in use |
| `transport` during transfer | — | yt-dlp's own retries and resume. No change of format or identity (no splicing) |
| `removed` / `geoBlocked` / `drm` / `ipBlocked` / disk / output | — | `finish failed` with the specific remedy. No account ladder |
| Subtitle failure after saved media | — | `finish usable` with a soft failure (ADR 0002) |
| Budget or deadline exhausted | — | `finish` with `best`, or `failed`, with the reason `budgetExhausted`/`deadlineReached` |

**Strategy invariants**, each a property test:

1. `anonymousPot` only when identity is `anonymous` **and** `operation === 'probeVideo' | 'media' | 'subtitlesOnly' | 'subtitlesAfterMedia'`. Never with any cookies: file, browser or Explore. This fixes the hazard above in the same change that makes tokens effective.
2. `probeCollection` never receives a token or visitor data, signed in or not (the playlist cap).
3. A change of identity forces `reuseInfoJson: false` and never reuses partial media from another identity.
4. Every run terminates; launches ≤ budget; no `launch` after `deadlineAt` or once the signal is aborted. Sign-out, Explore being disabled, pause and cancel are checked again before every launch.
5. `rateLimited` never produces `launch` in the same operation, and never produces an identity change.
6. `unknown` evidence never triggers escalation.
7. A usable candidate is never discarded for a later worse one. Ranking is by the request (requested height, audio, subtitles), not by format count.

### A4. Budgets, deadline, cooldown: numbers from the baseline

| Operation | Launch budget (today: typical / worst) | Deadline |
| --- | --- | --- |
| `probeVideo` | **4**: up to 2 anonymous fingerprints, then Explore plus one cookie-verify relaunch (today 4 / 12) | **180 s end to end** for interactive probes (one launch takes 22–37 s, so this fits 4 launches plus the 5 s signed-in spacing). Today's 180 s timer per launch becomes a per-launch stall guard |
| `probeCollection` | **3** (today 2 / 8) | 180 s per page request. Large playlists are bounded by the existing scope limit |
| `media` (extraction before transfer) | **5**: replay, 2 fresh fingerprints, Explore, cookie verify (today 7 / 8–9) | Extraction deadline 180 s. Transfer is bounded by yt-dlp's retries, not the deadline |
| `subtitlesOnly` / `subtitlesAfterMedia` | 4 / 2 | 120 s |

These numbers are inputs to the tests, not new magic. The plan accepts them only if Fixture E2E shows every scenario in [Verification](#verification) finishes within them.

**`SiteRequestState`** is one injected instance, keyed by site plus network route (proxy URL or direct):

- `rateLimitedUntil`. yt-dlp has no Retry-After, so the cooldown is app-owned:
  - Start at 60 s and double on each repeat within the window, with full jitter, capped at 15 min.
  - On `sessionRateLimited` ("up to an hour"), use 30 min.
  - Probes, queued jobs and automatic retries all read it. A user's explicit "Try now" overrides it once.
- `anonymousWallStreak`. After 2 consecutive anonymous bot checks on a site within 10 min:
  - New work on that site skips the anonymous strategies. It goes straight to Explore when eligible, or the batch pauses with a reason.
  - This turns bulk 12N into roughly N + 2.
  - The streak resets on the first anonymous success.
- In memory only. A restart clears it, which is acceptable because cooldowns are short.

### A5. Runner and records

- **`OperationRunner`** (main) owns the loop: decide, render, launch, normalize, append the record, decide again.
  - The caller's cancellation signal applies throughout.
  - The extraction deadline is a separate, cancellable timer. For probes and subtitle runs it covers the whole operation. For media it is **disarmed when transfer starts**: extraction and transfer share one yt-dlp process, and the first `[download] Destination:` or progress line marks the switch, so a long download is never killed by the extraction deadline.
  - The `exploreSpawnGate` pacing stays, but its budget key becomes the **operation ID**, so probes are capped too.
- **`AttemptRecord`** carries a correlation ID, strategy, identity, fingerprint, an observation summary, elapsed time and the decision reason. It is returned in the result and logged on every launch. It replaces `getLastInvocationSummaries` and so removes the `_lastInvocations` race. Smoke reports read the records.
- **Strangler migration.** `invokeWithRetry`, `runProbeWithDegradationRetry`, `probeWithRedirectFollow`'s retry use, `VideoPhase.runWithInfoJsonFallback`, cookieless recovery and `settleWithExploreSession` become strategy choices inside the policy, one operation at a time. `QueueAutoRetry` stays the queue's delayed scheduler, but reads `SiteRequestState` and is never asked to recover from evidence the policy has already finished on.

### A6. Library choices

- **fast-check** (4.x, dev only) for the invariants. It shrinks failures to minimal `history` sequences, which a hand-written table cannot do.
- **No cockatiel for the ladder.** Its retry wraps *the same* function call, and here every attempt must change argv or identity and be recorded with a reason. That is domain logic, not plumbing. Its `CircuitBreakerPolicy` was considered for the cooldown, but it opens on failure counts, not on a wall-clock "until". It is also process-local per policy instance, whereas this needs one shared, keyed store that the policy reads as data. The owned store is about 40 lines and pure to test. Revisit if a second breaker-shaped need appears.
- **Zod** for every new enum and for the `AttemptRecord` that crosses IPC (the trust boundary).

## Delivery plan

Each step ships on its own, behind `bun run check`, and keeps the app releasable. Steps 1–2 are urgent. Step 3 is cheap and independent. Steps 4–5 are the policy work and depend on the kill criteria.

1. **Characterize first (tests only).**
   - Extend `arroxy_fixture.py`:
     - Report the *parsed* `_configuration_arg('po_token' | 'visitor_data' | 'player_client')` as presence flags and a client list (never values) in its `/probe` notification.
     - Let the fixture server script each extraction (warnings to print, or an error to raise, in yt-dlp's wording), so a spec can reproduce a 429 warning, a bot check, a fatal 429, a session rate limit or `Failed to extract any player response` without editing the catalog. Steps 1–2 use the 429 warning and the bot check; the other scenarios, the timeout and `tokenContextMissing` are characterized in the steps that change their handling (3–5).
   - The fixture server counts launches per URL and per identity.
   - Write Fixture E2E specs that **record today's launch counts** as an explicit baseline.
   - Exercising the production transfer-retry budget in E2E moves to step 5, which changes transfer recovery.
   - → verify: the specs pass on `main` and reproduce the baseline table (single-video bot wall = 3 anonymous launches with identical parsed config; degraded 429 = 2 identical launches; parsed `po_token` absent on media).

2. **Fix argument assembly and token eligibility (A1 + invariants 1–2).**
   - `ExtractorOptions` and `renderArgv` in the bridge; the app passes the token as a typed override.
   - Invariant 1 (no anonymous token with any cookies) lands in the same change.
   - Fix `downloadSmokeReport` and `probeSmokeReportIsHealthy` to read the parsed config (from the fixture) or attempt records, never argv presence. The live probe smoke keeps accepting a runner bot wall.
   - Replace `ytdlp-args.test.ts:767` with a one-block assertion.
   - Run **the live comparison** before any release:
     - About 20 anonymous public videos (mixed: music, long-form, Shorts, age-gated excluded).
     - Three configurations: yt-dlp defaults; clients without a token; token plus clients. Run through `bun run smoke:download` with `-v`, so `Retrieved a gvs PO Token … from config` proves the token was parsed.
     - Randomised order, 30 s spacing, stop at the first 429.
     - Record: highest height available against the profile, whether the requested quality was met, warnings, elapsed time, launches.
     - **Decision rule:** keep token-first only if it matches or beats the alternatives on requested-quality fit, with at most the same launches. Otherwise make the token on-demand (`botCheck` / `formatsWithheld` only). Record the result in the ADR.
     - Also test H1: re-run three withheld-quality cases from cookieless recovery with the fixed token.
     - **Done 2026-10-19: token-first kept, H1 not supported.** See [Live comparison (step 2)](#live-comparison-step-2-2026-10-19).
   - → verify:
     - The contract specs show parsed `po_token`, `visitor_data` and `player_client` together on anonymous media and single-video probes.
     - None of them on collection probes, Explore, cookie-file or browser runs.
     - `assertOneBlockPerExtractor` never fires across the whole E2E suite.
     - Redaction still hides values.
     - Ship as **`-beta.N` first**: betas never auto-update installed copies, so the token behaviour change is opt-in until stable.

3. **Evidence model and honest guidance (A2).**
   - Per-line observations and the terminal cause from the last error.
   - The new kinds; split `unavailable`.
   - The probe's degradation reasons come from evidence (`rateLimited`, not `botWall`).
   - The renderer shows guidance from main's evidence instead of `COOKIES_KINDS`.
   - Golden transcripts include the redacted 2026-10-19 incident and one transcript per row of the yt-dlp string table.
   - Extend `scan-yt-dlp-source.mjs` to check every pinned string.
   - → verify:
     - Each transcript yields the expected `terminalCause` and observations.
     - Moving a warning line before or after the error never changes `terminalCause` (a property test).
     - `formatUnavailable` and `removed` produce no account guidance in renderer tests.
     - The scanner passes on the deployed revision and fails on a fixture where a pinned string was removed.

4. **Policy core, then probes on it (A3–A5, probes only).**
   - Add `decideNext` with the table and the invariants, plus `SiteRequestState`, `OperationRunner` and `AttemptRecord`.
   - Probes first. Run the new policy in **shadow mode** for one beta: the old path still executes, the new decision is computed and logged next to it as `recovery.shadow {old, new, reason}`, and a dev script summarises the differences from `main.log`.
   - Switch over only when every difference is on the intended list: no identical relaunches, no retry on 429, rate limits reported as rate limits, budget and deadline stops.
   - → verify:
     - fast-check invariants (≥ 1,000 runs, shrinking on).
     - Fixture E2E: launch counts at or below the A4 budgets for wizard and quick probes, bulk hydration of 10 bot-walled rows (≤ N + 2 anonymous launches after the streak trips), a playlist over 100 entries enumerating fully, cancellation while waiting, and **0 new matching launches during a 429 cooldown**.
     - The shadow-diff report contains only intended differences.

5. **Media and subtitles on the same policy.**
   - Move `runWithInfoJsonFallback`, cookieless recovery, `settleWithExploreSession`, `SubtitleOnlyPhase` and the token reset into strategies.
   - Remove the ladder on info-json replays.
   - `QueueAutoRetry` reads the cooldown.
   - Run shadow mode again for one beta.
   - → verify Fixture E2E:
     - Escalation with per-request identity evidence.
     - Restart after escalation.
     - Cached-URL failure leading to one fresh extraction.
     - Rejected cookies.
     - Partial transfer resumes without splicing across identities.
     - Withheld quality.
     - A 429 burst across 4 queued jobs, where only the first job launches during the cooldown.
     - Subtitles failing after saved media.
     - The token reset never runs for signed-in jobs (asserted from attempt records).
     - A transfer that outlasts the extraction deadline completes. The fixture's throttled media route keeps the download running past 180 s, or past a shortened deadline under E2E.
     - A rejected-cookie case with a still-valid session relaunches exactly once, with a new `sessionGeneration`.

6. **Make the reasons visible.**
   - Attempt details in the probe result and the queue row, driven by `AttemptRecord` and `Decision.reason`. These are the same records the logs and smoke use, so it is not a second model.
   - "Use Explore for this job" as an explicit identity choice.
   - The persistent "When needed / From the start / Never" preference is **deferred** until users ask. "Never" duplicates turning Explore off.
   - Translate at the end, through the project workflow.
   - → verify: Scenario Workbench states for each `ReasonCode`, focused renderer tests, and Fixture E2E that the per-job choice sets the identity from the first probe and survives a restart.

7. **Document what shipped.**
   - Accept ADR 0010, with the comparison result.
   - Update `download-workflows.md`, `in-app-browser-spec.md`, `download-smoke.md`, and `GLOSSARY.md` (Operation, Evidence, Strategy, Fingerprint, Cooldown).
   - Delete the superseded proposal.
   - → verify: `bun run check`, then `bun run build`, headless Fixture E2E (`ARROXY_E2E_HEADLESS=1`), a packaged macOS/Windows (VM)/Linux (VM) smoke of one probe and one download each, and a live drift smoke attaching the attempt-record report to the release review.

### Contract on every yt-dlp version Arroxy can run

The yt-dlp version changes when the runtime index is republished (the daily `publish-runtime-manifest.yml` in `arroxy-runtime-binaries`), not when the app is released. That workflow already runs this repo's `scripts/build/runtimeBinaryManifest.ts validate --smoke current` before signing. Add an **extractor-args contract smoke** there:

- Run each candidate yt-dlp with `--plugin-dirs` pointing at a minimal contract extractor. The fixture E2E already loads plugins into the managed binary this way.
- Feed it the argv `renderArgv` produces for every operation × identity.
- Assert the parsed `po_token`, `visitor_data` and `player_client`.

A candidate that drops a parsed key fails validation, so the index is not published. This is the only check that catches an upstream parser change before users receive it. The same contract also runs in this repo's CI against the bundled fallback version.

## Kill criteria and the counter-argument

The case against steps 4–5: once steps 1–3 land, the wasted launches from the defect disappear, 429s are labelled correctly, and guidance is honest. A policy engine is a large rewrite of code that mostly works.

Measure after step 3, with the step 1 fixtures plus a week of beta logs. **Stop after step 3** if all of these hold:

- (a) No operation exceeds the A4 budgets in Fixture E2E.
- (b) No identical relaunches remain apart from timeout retries.
- (c) A 429 burst across queued jobs causes at most one extra launch per job.

In that case, land only `SiteRequestState` (the cooldown, which the current code structurally cannot do) and the bulk wall streak as targeted changes. Otherwise go ahead with steps 4–5. The shadow-mode diff limits the risk.

## Verification

| Check | Pass | Fail |
| --- | --- | --- |
| Real-parser contract (fixture reports parsed config), every operation × identity, every runtime-index candidate | Token, visitor data and clients present exactly where invariants 1–2 allow | Any key missing or leaked; any index candidate failing |
| `assertOneBlockPerExtractor` over the full E2E suite | Never fires | Fires once |
| fast-check invariants 1–7 | 0 counterexamples in ≥ 1,000 runs per property | Any shrunk counterexample |
| Fixture E2E launch counts | Every scenario ≤ the A4 budget; 0 identical relaunches except timeout and transport after backoff | Any scenario over budget, or any identical relaunch |
| 429 burst | 0 new matching launches during the cooldown; usable results kept | Any launch during the cooldown |
| Bulk wall streak | ≤ N + 2 anonymous launches for N bot-walled rows | Anonymous launches grow as 3N |
| Shadow-mode diff (beta) | Only differences on the intended list | Any unexplained difference |
| Live comparison (about 20 videos) | The chosen default ≥ alternatives on requested-quality fit, with ≤ launches; stopped on the first 429 | Choosing a default the data contradicts |
| Worst-case launches, before and after | Strictly lower for every row of the baseline table | Any row equal or higher |
| Independent review (Codex) of this plan and ADR 0010 | No unresolved high-severity findings | Unaddressed high-severity finding |

## Risks

- **Turning the token on is a behaviour change after months of tokenless production.** Mitigations: the comparison, beta-first, and the on-demand fallback in the decision rule.
- **YouTube drift.** Mitigations: the evidence strings are pinned to source and scanned, and the contract runs against every index candidate.
- **Explore account exposure in bulk.** The wall streak sends more work to the account. It stays paced (2 at a time, 5 s apart), capped per operation, and only under "When needed" eligibility. Any bulk run that would escalate more than 10 rows asks the user first.
- **Cooldown frustration.** "Try now" overrides it once, and the reason is shown.
