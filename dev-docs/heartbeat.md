# Heartbeat — Internal Reference

Arroxy has no telemetry. The only thing it reports is one anonymous heartbeat per install per UTC day, sent to a self-hosted [Counterscale](https://github.com/benvinegar/counterscale) on Cloudflare. It answers how many people use the app, how many are new, where they are, and on which version, OS, and language. Code lives in:

| Path                                        | Role                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `src/main/services/heartbeat.ts`            | Field mapping, install age, once-per-UTC-day gate, Counterscale sender, collector URL |
| `src/main/index.ts`                         | Wiring: snapshot inputs, startup heartbeat, hourly re-check             |
| `src/main/stores/SettingsStore.ts`          | `recordHeartbeat()` — internal `firstHeartbeatDay` and `lastHeartbeatDay` |
| `tests/unit/heartbeat.test.ts`             | Mapping, install age, daily gate, and the real tracker's request URL    |

## What is sent

One `GET <collector>/collect?...` built by `@counterscale/tracker/server`. No install ID, no IP-derived data from the app, no URLs, titles, or paths. Country is added by Cloudflare at the collector from the request; Counterscale stores the country code, never the IP.

The heartbeat is skipped when **Send daily heartbeat** is off (`analyticsEnabled`; the key predates this design and is kept so existing opt-outs stay opted out), always in E2E sessions (test runs must never reach a collector), in dev, mock and smoke sessions unless `ARROXY_HEARTBEAT_URL` names one (HTTPS, or plain HTTP only to localhost), whenever `ARROXY_HEARTBEAT_URL=off`, and on any day already recorded in `lastHeartbeatDay`. `off` holds even in a release build: anything that launches a real packaged build for testing (the startup journeys, and the previous release they run for the inherited profile) sets it, since every such heartbeat would count as a new install. Builds older than `off` read it as an invalid URL, which also sends nothing. The day is recorded before the request goes out: a lost heartbeat beats a day counted twice. A session left running in the tray re-checks hourly and sends once on each new UTC day.

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
| `existing` | counted before first days were recorded, or `firstHeartbeatDay` is unreadable      |

An install that never sent a heartbeat records today as its first day. One that sent heartbeats before the first day was recorded keeps it unknown and reports `existing` for good: guessing a date would make it look new. Both days live in `settings.json` in the user-data folder, so app updates through every channel keep them; only deleting app data (an uninstall that removes it, or a corrupt settings file) makes an install `new` again. The same happens when a user who never sent a heartbeat turns it on.

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

Expect one data point with index `arroxy` and blobs `/<version>`, install age (as the referrer), channel, platform-arch, OS release, UI language, OS locale. A relaunch on the same UTC day sends nothing; delete `common.lastHeartbeatDay` from `.electron-user-data/dev/settings.json` to send again, and `common.firstHeartbeatDay` as well to send as `new`.
