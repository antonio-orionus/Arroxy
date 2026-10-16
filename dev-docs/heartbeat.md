# Heartbeat — Internal Reference

Arroxy has no telemetry. The only thing it reports is one anonymous heartbeat per install per UTC day, sent to a self-hosted [Counterscale](https://github.com/benvinegar/counterscale) on Cloudflare. It answers how many people use the app, where they are, and on which version, OS, and language. Code lives in:

| Path                                        | Role                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `src/main/services/heartbeat.ts`            | Field mapping, once-per-UTC-day gate, Counterscale sender, collector URL |
| `src/main/index.ts`                         | Wiring: snapshot inputs, startup heartbeat, hourly re-check             |
| `src/main/stores/SettingsStore.ts`          | `recordHeartbeatDay()` — internal `lastHeartbeatDay`                    |
| `tests/unit/heartbeat.test.ts`             | Mapping, daily gate, and the real tracker's request URL                 |

## What is sent

One `GET <collector>/collect?...` built by `@counterscale/tracker/server`. No install ID, no IP-derived data from the app, no URLs, titles, or paths. Country is added by Cloudflare at the collector from the request; Counterscale stores the country code, never the IP.

The heartbeat is skipped when **Send daily heartbeat** is off (`analyticsEnabled`; the key predates this design and is kept so existing opt-outs stay opted out), in dev/mock/smoke/E2E sessions unless `ARROXY_HEARTBEAT_URL` names a collector, and on any day already recorded in `lastHeartbeatDay`. The day is recorded before the request goes out: a lost heartbeat beats a day counted twice. A session left running in the tray re-checks hourly and sends once on each new UTC day.

The heartbeat cannot fail loudly. Network errors and timeouts (5 s) are swallowed by the tracker; any local failure (settings write, snapshot) is logged once at warn as `Heartbeat skipped for today` and not retried until the next UTC day. `lastHeartbeatDay` is read leniently, so a malformed value can never reset the user's settings section.

## Dashboard mapping

Counterscale is built for websites, so app fields ride in the slots its dashboard already breaks down. Its server tracker sends hit type 1 on every request, so **Visitors per day = daily active installs**.

| Dashboard card | Holds               | Example        |
| -------------- | ------------------- | -------------- |
| Visitors       | active installs     | —              |
| Country        | Cloudflare country  | `UA`           |
| Path           | app version         | `/0.5.1`       |
| UTM Source     | install channel     | `homebrew`     |
| UTM Medium     | platform-arch       | `win32-x64`    |
| UTM Campaign   | OS release          | `windows-11`, `macos-26`, `linux-6.8` |
| UTM Term       | app UI language     | `uk`           |
| UTM Content    | OS locale           | `uk-UA`        |

Values never contain spaces: a collector that decodes `+` and `%20` differently must still store the same value (the local Vite-based Counterscale dev server turned `%20` into `+`).

Browser, Device and Referrer cards stay empty or constant — ignore them.

## Deploy (one-time)

1. Cloudflare dashboard → Storage & Databases → **Analytics Engine** → Create Dataset `metricsDataset`. If a deploy still fails with `[code: 10089] You need to enable Analytics Engine` (a leftover beta opt-in gate, cloudflare/workers-sdk#9312), deploy once without the `analytics_engine_datasets` block, add the binding `WEB_COUNTER_AE` → `metricsDataset` on the Worker in the dashboard (Settings → Bindings), then deploy normally.
2. Create an API token with **Account › Account Analytics › Read**.
3. Install from any directory:

   ```bash
   bunx wrangler login
   bunx @counterscale/cli@3.4.1 install
   ```

   Answer **Yes** to dashboard password protection.

4. Put the Worker behind the collector host the app hardcodes, `stats.orionus.dev` (`HEARTBEAT_URL` in `heartbeat.ts`): Workers & Pages → `counterscale` → Settings → Domains & Routes → Add → Custom domain. To use another host, change `HEARTBEAT_URL` — released builds keep the host they shipped with.
5. In the dashboard, the site id is `arroxy` (`HEARTBEAT_SITE_ID`).

Free-plan fit: Analytics Engine takes 100k writes/day and keeps raw data 90 days; Counterscale's daily R2 rollup (on by default) keeps older data within R2's free tier.

## Test locally end to end

```bash
git clone --depth 1 --branch v3.4.1 https://github.com/benvinegar/counterscale.git
cd counterscale && pnpm install --frozen-lockfile
cd packages/server && pnpm exec react-router dev --port 3005 --host 127.0.0.1
```

Locally the Analytics Engine write is simulated, so add a temporary `console.log(JSON.stringify(datapoint))` at the top of `writeDataPoint` in `app/analytics/collect.ts` to see what would be stored. Then from the Arroxy checkout:

```bash
ARROXY_HEARTBEAT_URL=http://127.0.0.1:3005/collect bun run dev
```

Expect one data point with index `arroxy` and blobs `/<version>`, channel, platform-arch, OS release, UI language, OS locale. A relaunch on the same UTC day sends nothing; delete `common.lastHeartbeatDay` from `.electron-user-data/dev/settings.json` to send again.
