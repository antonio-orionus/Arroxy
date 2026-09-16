# Download smoke

A headless mode of the real app that runs the production download request for one YouTube link, changes one input at a time, stops as soon as yt-dlp has chosen formats, and prints a JSON report. Use it to find out why a download picked a lower quality than the profile asked for: cookies, proxy, profile, or YouTube player clients.

| Lives in                                    | What                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/main/downloadSmokeConfig.ts`           | Env contract parsing and the in-memory settings overlay                      |
| `src/main/downloadSmoke.ts`                 | Runner: token window, spawn, stop, report, temp cleanup                      |
| `src/main/downloadSmokeOutput.ts`           | yt-dlp output observer (selected format, clients, SABR skips, stop rule)     |
| `src/main/downloadSmokeReport.ts`           | Report shape and the `ARROXY_DOWNLOAD_SMOKE_RESULT` line                     |
| `src/main/services/phases/mediaRequest.ts`  | The media request builder shared with queued downloads                       |
| `src/main/index.ts`                         | Dispatch, before the token service and queue exist                           |
| `scripts/smoke/download-smoke-matrix.ps1`   | Windows grid runner                                                          |

## Why it can be trusted

- **Same request as a queued download.** The request comes from the same builder `VideoPhase` uses, so a smoke run sends exactly what a playlist/profile download sends, including Arroxy's PO token, retry ladder, and pacing.
- **One input varied.** Overrides are applied to an in-memory copy of the settings. Nothing is written to disk.
- **No downloads.** The yt-dlp bridge's skip-download option drops the format rules, so it cannot be used. Instead the real download starts and is aborted on the first line yt-dlp prints after writing the info-json, before media transfers. The temp directory is deleted afterwards.
- **Cannot start queued work.** The mode runs before the queue is initialised.

## Environment contract

| Variable                      | Unset means                                              | Accepted values                                                                          |
| ----------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ARROXY_SMOKE_KIND`           | the existing probe smoke (`ARROXY_SMOKE_URL` alone)      | `download` enables this mode                                                             |
| `ARROXY_SMOKE_URL`            | required                                                 | YouTube URL                                                                              |
| `ARROXY_SMOKE_COOKIES`        | persisted settings                                       | `off`, `browser:<firefox\|chromium\|chrome\|brave\|edge\|safari\|vivaldi>`, `file:<path>` |
| `ARROXY_SMOKE_PROXY`          | persisted settings                                       | `off`, or a proxy URL                                                                    |
| `ARROXY_SMOKE_PROFILE`        | active profile                                           | a download profile id, e.g. `balanced`                                                   |
| `ARROXY_SMOKE_PLAYER_CLIENTS` | production clients (`default,web_embedded`)              | comma list, e.g. `web_safari`, or `none` to pass no `player_client`                      |
| `ARROXY_SMOKE_TIMEOUT_MS`     | `180000`                                                 | positive integer                                                                         |

Always set `ELECTRON_USER_DATA` to a scratch directory so the real settings, queue, and logs stay untouched. Invalid input prints `FAIL  download smoke config  <reason>` and exits 1.

Exit code 0 means a format was selected and reported; 1 means the tool could not get that far. Quality is judged from the report, not the exit code.

## macOS / Linux

```bash
bun run build
env -u ELECTRON_RUN_AS_NODE ELECTRON_USER_DATA="$(mktemp -d)" \
  ARROXY_SMOKE_KIND=download ARROXY_SMOKE_URL='https://www.youtube.com/watch?v=z1NNgSu8hTI' ARROXY_SMOKE_COOKIES=off \
  ./node_modules/.bin/electron out/main/index.js 2>&1 | grep -E 'download smoke|ARROXY_DOWNLOAD_SMOKE_RESULT'
```

`env -u ELECTRON_RUN_AS_NODE` matters when the shell was itself started from an Electron app: an inherited `ELECTRON_RUN_AS_NODE=1` makes Electron run as plain Node and fail on `import {BrowserWindow} from 'electron'`. A packaged binary takes the same variables.

## Windows matrix

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke\download-smoke-matrix.ps1 `
  -Exe "$env:LOCALAPPDATA\Programs\arroxy\Arroxy.exe" `
  -Url https://www.youtube.com/watch?v=z1NNgSu8hTI `
  -Browser firefox [-CookiesFile C:\path\cookies.txt] [-Proxy http://127.0.0.1:10808] [-ProfileId balanced]
```

Cases: no cookies; browser cookies; browser cookies with yt-dlp's own player clients; a cookies file when `-CookiesFile` is given; and, when `-Proxy` is given, the cookie and no-cookie cases again without the proxy. Every case uses an isolated `ELECTRON_USER_DATA` under `%TEMP%\arroxy-download-smoke`, where the raw stdout/stderr of each case also stays for inspection. Browser cookies are read from the real browser profile.

Sample output from a Windows 11 test VM with a signed-in Firefox (a non-limited account):

```text
Case                                  Outcome         Format    MaxHeight Clients                    SabrSkipped
no-cookies                            format-selected 398+251-1       720 visionos,web embedded
cookies-firefox                       format-selected 398+251-1       720 web embedded,tv downgraded
cookies-firefox-ytdlp-default-clients format-selected 398+251-1       720 web embedded,tv downgraded
```

### Remote runs

Copy the `.ps1` over with `scp` and run it with `powershell -NoProfile -ExecutionPolicy Bypass -File <path>`. Do not inline the script into an ssh command; PowerShell `$` quoting breaks. A plain SSH session is enough: stdout comes back through `Start-Process -RedirectStandardOutput`, and the hidden token window mints a PO token without an interactive desktop session. Host and credentials for test machines live in the user-level agent config, never in this repository.

### Asking a user to run it

The same script works on a user's machine against the installed `%LOCALAPPDATA%\Programs\arroxy\Arroxy.exe`. Ask them to pass `-Proxy` with their proxy URL so the with/without-proxy cases run, and to paste back the table plus the `*.out.txt` files if a case shows `no-report`.

## Reading the report

The last stdout line is `ARROXY_DOWNLOAD_SMOKE_RESULT {json}`.

- `selection.maxHeight` against the profile's tier cap: a gap is the problem being investigated.
- `selection.selectedFormat` is yt-dlp's choice (`18` is the 360p progressive fallback).
- `observed.sabrSkippedClients` non-empty means YouTube returned formats without URLs for those clients (the SABR-only experiment), which leaves only low progressive formats.
- `observed.playerApiClients` is which player APIs yt-dlp actually queried.
- `effective` is what the overlay resolved to, including the format selector and sort.
- `attempts[].args` is the exact redacted argv for every spawn, including retry-ladder attempts.
- `inputs.cookies` is a label only; cookie file paths are never reported.
