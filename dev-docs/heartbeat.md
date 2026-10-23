# Heartbeat — Internal Reference

Arroxy has no telemetry. Release builds report two things, both to a self-hosted [Counterscale](https://github.com/benvinegar/counterscale) on Cloudflare and both turned off by the same Settings switch. One anonymous heartbeat per install per UTC day answers how many people use the app, how many are new, where they are, and on which version, OS, and language. A [warmup report](#warmup-reports), from 0.7.4, says how each warmup that fetches a managed binary ended. Code lives in:

| Path                                        | Role                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `src/main/services/heartbeat.ts`            | Field mapping, install age, once-per-UTC-day gate, Counterscale sender, collector URL |
| `src/main/index.ts`                         | Wiring: snapshot inputs, startup heartbeat, hourly re-check             |
| `src/main/stores/SettingsStore.ts`          | `recordHeartbeat()` — internal `firstHeartbeatDay` and `lastHeartbeatDay` |
| `tests/unit/heartbeat.test.ts`             | Mapping, install age, daily gate, and the real tracker's request URL    |

## What is sent

One `GET <collector>/collect?...` built by `@counterscale/tracker/server`. No install ID, no IP-derived data from the app, no URLs, titles, or paths. Country is added by Cloudflare at the collector from the request; Counterscale stores the country code, never the IP.

The heartbeat is skipped when **Send anonymous heartbeat and setup reports** is off (`analyticsEnabled`; the key predates this design and is kept so existing opt-outs stay opted out), always in E2E sessions (test runs must never reach a collector), in dev, mock and smoke sessions unless `ARROXY_HEARTBEAT_URL` names one (HTTPS, or plain HTTP only to localhost), whenever `ARROXY_HEARTBEAT_URL=off`, and on any day already recorded in `lastHeartbeatDay`. `off` holds even in a release build: anything that launches a real packaged build for testing (the startup journeys, and the previous release they run for the inherited profile) sets it, since every such heartbeat would count as a new install. Builds older than `off` read it as an invalid URL, which also sends nothing. The day is recorded before the request goes out: a lost heartbeat beats a day counted twice. A session left running in the tray re-checks hourly and sends once on each new UTC day.

The heartbeat cannot fail loudly. Network errors and timeouts (5 s) are swallowed by the tracker; any local failure (settings write, snapshot) is logged once at warn as `Heartbeat skipped for today` and not retried until the next UTC day. A heartbeat that goes out is logged at info as `Heartbeat sent` with its UTC day and install age, so `main.log` shows whether today's was sent; because the tracker swallows network errors, that line confirms the send, not delivery. No line on a day means it was already sent earlier that UTC day, or the heartbeat is off. `firstHeartbeatDay` and `lastHeartbeatDay` are read leniently, so a malformed value can never reset the user's settings section.

## Install age

Counterscale has no visitor identity: its cookieless counting resets every visitor at midnight, and the server tracker marks every hit as a new visit. So the dashboard alone cannot tell new installs from returning ones. Instead each heartbeat carries its own install age, a bucket worked out from `firstHeartbeatDay`, the UTC day of the install's first heartbeat:

| Value      | Meaning                                                                           |
| ---------- | --------------------------------------------------------------------------------- |
| `new`      | the install's first heartbeat ever                                                |
| `1-7d`     | first heartbeat 1–7 days ago (also a first day in the future, from a clock set back) |
| `8-30d`    | 8–30 days ago                                                                     |
| `31-90d`   | 31–90 days ago                                                                    |
| `over-90d` | more than 90 days ago                                                             |
| `existing` | counted before first days were recorded, upgraded from a version without the heartbeat, or `firstHeartbeatDay` is unreadable |

An install that never sent a heartbeat records today as its first day, unless it already has managed binaries on disk. Versions before 0.5.2 had no heartbeat but kept their binaries in the same cache, so an upgrade from one would otherwise count as new (on 0.7.4's first day, about one `new` in seven was one). Such an install, and one that sent heartbeats before the first day was recorded, keeps its first day unknown and reports `existing` for good: guessing a date would make it look new. A binary cache that cannot be read counts as an earlier install, as it does for the warmup report's kind. Both days live in `settings.json` in the user-data folder, so app updates through every channel keep them; only deleting the whole user-data folder (an uninstall that removes it) makes an install `new` again. A corrupt settings file loses both days but keeps the binaries, so the install reports `existing` from then on. So does a new install whose first-day record fails: no heartbeat goes out that day, and by the next launch its binaries are on disk. A user who never sent a heartbeat and turns it on later reports `existing` too, since the binaries are on disk by then.

The buckets are coarse on purpose: each is shared by many installs, so it cannot single one out the way an exact install date could.

## Dashboard mapping

Counterscale is built for websites, so app fields ride in the slots its dashboard already breaks down. Its server tracker sends hit type 1 on every request, so **Visitors per day = daily active installs**, Views always equal Visitors, and the bounce rate is always 100%; ignore both.

| Dashboard card | Holds               | Example        |
| -------------- | ------------------- | -------------- |
| Visitors       | active installs     | —              |
| Referrer       | install age         | `new`, `8-30d` |
| Country        | Cloudflare country  | `UA`           |
| Path           | app version         | `/0.5.1`       |
| UTM Source     | install channel     | `homebrew`     |
| UTM Medium     | platform-arch       | `win32-x64`    |
| UTM Campaign   | OS release          | `windows-11`, `macos-26`, `linux-6.8` |
| UTM Term       | app UI language     | `uk`           |
| UTM Content    | OS locale           | `uk-UA`        |

The OS locale is the first of the OS's preferred languages, as the OS names it, so languages Arroxy lacks (`nl-NL`) show up too. Versions up to 0.7.2 sent Chromium's application locale instead, which reads as `en-US` for every language Chromium ships no locale for (Khmer, Burmese, Uzbek, Pashto, Oromo, Nepali and more).

Values never contain spaces: a collector that decodes `+` and `%20` differently must still store the same value (the local Vite-based Counterscale dev server turned `%20` into `+`).

Browser and Device cards stay empty or constant — ignore them.

**New and returning installs.** Click `new` on the Referrer card: the filter applies to the chart and every other card, so the chart shows new installs per day, and Country, Path and UTM Source show where they come from, which version they start on and how they installed. A filter matches one value, so returning installs for a day are total Visitors minus `new`. Growth in `8-30d`, `31-90d` and `over-90d` from week to week is the retention signal.

## Warmup reports

A warmup that has to fetch a managed binary (yt-dlp, or the FFmpeg package) sends a warmup report to the same collector under its own site id, `arroxy-warmup` (ADR 0021). A warmup that only verifies sends nothing. It answers how many first setups and updates start, finish, fail, are stopped or are abandoned, how long they take and how fast the downloads run, by country.

| Path | Role |
| --- | --- |
| `src/main/services/warmupReport.ts` | Buckets, the hit's field mapping, the GET sender |
| `src/main/services/WarmupReporter.ts` | Turns warmup runs into reports: kind, attempt, `started`, outcome, `quit`, the kept report |
| `src/main/stores/WarmupReportStore.ts` | `warmup-report.json`: attempt count, whether a first setup is still unfinished, reports not yet delivered |
| `src/main/warmupReporting.ts` | Release flag gate, quit hold, wiring |
| `src/main/sharedQuitHooks.ts` | One quit hold for everything that delays a quit (warmup report, agent control) |
| `src/main/services/WarmupService.ts` | `WarmupRunObserver`: every progress event, then the result |

**When.** `started` goes out at a run's first download. Exactly one outcome follows when the run settles: `ok`, `failed` (blocking failures, or a warmup that failed before any diagnostics), or `stopped` (the user's "Having trouble?"). If the app quits while the run is still downloading, `quit` is sent instead; the quit waits at most one second for it, together with anything else holding the quit. Started minus outcomes counts setups that were abandoned by a crash, a force-quit or a lost request.

**Kind and attempt.** `first` means nothing managed was on disk when the run began; `update` means something was (a new yt-dlp build, a new FFmpeg pin). A first setup that does not finish stays `first` on the next attempts until one does. The attempt counts warmups in a row that fetched without finishing. It resets on `ok`, and on any warmup that ends set up without fetching (a system FFmpeg, a file the user picked). A run cannot name which binaries it will fetch at its first download (the other branch may not have decided yet), so the kind is `first` or `update` only.

**Delivery.** The report is a plain GET in the tracker's query format (the server tracker keeps one global client, already used by the heartbeat). Each report is kept before it is sent and dropped once the collector answers 2xx, so one a quit cuts short is not lost. Whatever is still kept (the newest four) is sent once at the next launch, and dropped after seven days or if that send fails too. The switch is read before every send, so turning it off mid-run stops the rest of that run's reports.

**Rules.** Same switch as the heartbeat (`analyticsEnabled`): off sends nothing and keeps nothing. Same collector and environment rules: never in E2E, nowhere in dev, mock and smoke sessions unless `ARROXY_HEARTBEAT_URL` names a collector, and nowhere with `ARROXY_HEARTBEAT_URL=off`.

| Dashboard card | Holds | Example |
| --- | --- | --- |
| Visitors | reports | — |
| Path | version, kind, attempt, stage | `/0.7.4/first/a1/started`, `/0.7.4/update/a2/failed` |
| Referrer | time since `started` (empty on `started`) | `0-10s`, `10-30s`, `30s-2m`, `2-5m`, `5-15m`, `15m-plus` |
| Country | Cloudflare country | `CN` |
| UTM Source | OS locale | `zh-CN` |
| UTM Medium | platform-arch | `win32-x64` |
| UTM Campaign | where the binary manifest came from | `remote`, `last-known-good`, `bundled`, `local`, `unknown` |
| UTM Term | first failure (outcomes only; `unknown` for `quit` and a warmup that failed before any diagnostics) | `none`, `ffmpeg:download_stalled`, `yt-dlp:download_failed`, `unknown` |
| UTM Content | speed of the largest download (outcomes only) | `0-0.5mbps`, `0.5-2mbps`, `2-10mbps`, `10mbps-plus`, `unknown` |

**Stalls and slow tools.** Up to 0.7.4, a download that stopped moving was reported as `timeout`, the same kind as a tool too slow to respond on its first run. From the next release a stall is `download_stalled`, and `timeout` means only a slow tool, so compare the two kinds across versions with that in mind.

**Reading it.** Pick `arroxy-warmup` in the site picker (it appears once it has data). On the Path card, first-try success is `/<v>/first/a1/ok` divided by `/<v>/first/a1/started`; abandonment is started minus all outcomes. Filter Country `CN` (or UTM Source `zh-CN`, which also catches users behind a VPN) and compare with no filter.

## Deploy

The live collector is a self-hosted Counterscale on Cloudflare, at the host in `HEARTBEAT_URL` (`src/main/services/heartbeat.ts`; released builds keep the host they shipped with). Its deployment and hardening runbook (secrets, rate limiting, the auth patch Counterscale needs) is maintainer-only.

## Test locally end to end

```bash
git clone --depth 1 --branch v3.4.1 https://github.com/benvinegar/counterscale.git
cd counterscale && pnpm install --frozen-lockfile
cd packages/server && pnpm exec react-router dev --port 3005 --host 127.0.0.1
```

Locally the Analytics Engine write is simulated, so add a temporary `console.log(JSON.stringify(datapoint))` at the top of `writeDataPoint` in `app/analytics/collect.ts` (in the Counterscale clone) to see what would be stored. Then from the Arroxy checkout:

```bash
ARROXY_HEARTBEAT_URL=http://127.0.0.1:3005/collect bun run dev
```

Expect one data point with index `arroxy` and blobs `/<version>`, install age (as the referrer), channel, platform-arch, OS release, UI language, OS locale. A relaunch on the same UTC day sends nothing; delete `common.lastHeartbeatDay` from `.electron-user-data/dev/settings.json` to send again, and `common.firstHeartbeatDay` as well to send as a first heartbeat: `existing` while `runtime-cache/artifact-cache-v1` beside it holds binaries, `new` once that folder is deleted too.
