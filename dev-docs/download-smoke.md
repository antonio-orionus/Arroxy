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
| `scripts/smoke-download.ts`                 | `bun run smoke:download` wrapper for macOS/Linux                             |
| `scripts/vm/`                               | Sync, build, release install, and matrix runs on the Windows test VM         |

## Why it can be trusted

- **Same request as a queued download.** The request comes from the same builder `VideoPhase` uses, so a smoke run sends exactly what a playlist/profile download sends, including Arroxy's PO token, retry ladder, and pacing.
- **One input varied.** Overrides are applied to an in-memory copy of the settings; the persisted settings file is never modified. (The run itself still writes scratch files: the temp download directory, and the wrappers' report and log files.)
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
bun run smoke:download -- --url 'https://www.youtube.com/watch?v=z1NNgSu8hTI' --cookies off
bun run smoke:download -- --cookies browser:firefox --clients none      # URL from ARROXY_SMOKE_URL or youtube-urls.local.txt
bun run smoke:download -- --exe /Applications/Arroxy.app/Contents/MacOS/Arroxy --proxy off
```

The flags map one-to-one onto the environment contract above. The wrapper prints a summary (format, height, what was sent to yt-dlp, SABR skips) and saves the full report to `$TMPDIR/arroxy-download-smoke-last.json`. It always uses a scratch `ELECTRON_USER_DATA`, reused between runs so the managed yt-dlp is fetched once (`--fresh` for a new one).

It also removes `ELECTRON_RUN_AS_NODE`. A shell started from an Electron app (an editor, an agent harness) can inherit `ELECTRON_RUN_AS_NODE=1`, which makes Electron run as plain Node and fail with `does not provide an export named 'BrowserWindow'`. When launching Electron by hand, use `env -u ELECTRON_RUN_AS_NODE`.

## Windows matrix

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\smoke\download-smoke-matrix.ps1 `
  -Exe "$env:LOCALAPPDATA\Programs\arroxy\Arroxy.exe" `
  -Url https://www.youtube.com/watch?v=z1NNgSu8hTI `
  -Browser firefox
```

Optional: `-CookiesFile C:\path\cookies.txt` adds a cookie-file case, `-Proxy http://127.0.0.1:10808` adds the no-proxy cases, `-ProfileId balanced` picks a profile, `-TimeoutMs 180000` sets the per-case budget.

Cases: no cookies; browser cookies; browser cookies with yt-dlp's own player clients; a cookies file when `-CookiesFile` is given; and, when `-Proxy` is given, the cookie and no-cookie cases again without the proxy. Every case uses an isolated `ELECTRON_USER_DATA` under `%TEMP%\arroxy-download-smoke`, where the raw stdout/stderr of each case also stays for inspection. Browser cookies are read from the real browser profile.

Sample output from a Windows 11 test VM with a signed-in Firefox (an account YouTube does not limit):

```text
Case                                  Outcome         Format    MaxHeight SentCookies SentProxy SentClients          Clients                    SabrSkipped
no-cookies                            format-selected 398+251-1       720 none            False default,web_embedded visionos,web embedded
cookies-firefox                       format-selected 398+251-1       720 browser         False default,web_embedded web embedded,tv downgraded
cookies-firefox-ytdlp-default-clients format-selected 398+251-1       720 browser         False (yt-dlp)             web embedded,tv downgraded
```

`Sent*` columns are what the last yt-dlp command actually received; `Clients` are the player APIs yt-dlp then queried.

### Remote runs (the Windows test VM)

```bash
scripts/vm/win-sync.sh                 # push this checkout, including uncommitted work
scripts/vm/win-build.sh                # bun install + dist:win:dir on the VM
scripts/vm/win-download-smoke.sh -Url 'https://www.youtube.com/watch?v=z1NNgSu8hTI' -Browser firefox
```

The scripts reach the VM through an SSH alias (`win-vm` by default, `ARROXY_WIN_VM` to override) with key auth. Host, user, and key live in `~/.ssh/config`, never in this repository. They ship each PowerShell script with `scp` and run it with `-File`, because inline PowerShell over ssh breaks on `$` quoting, and they quote every argument for the remote `cmd.exe`. A plain SSH session is enough: stdout comes back through `Start-Process -RedirectStandardOutput`, and the hidden token window mints a PO token without anyone logged on.

`scripts/vm/win-install-release.sh` installs the latest stable release, and `scripts/vm/win-install-release.sh v0.4.16` a specific tag, after checking it against `SHA256SUMS`. That gives a baseline to compare with the branch build, but only builds that include download smoke can run the matrix.

### Asking a user to run it

The same script works on a user's machine against the installed `%LOCALAPPDATA%\Programs\arroxy\Arroxy.exe`. Ask them to pass `-Proxy` with their proxy URL so the with/without-proxy cases run, and to paste back the table plus the `*.out.txt` files if a case shows `no-report`.

## Reading the report

The last stdout line is `ARROXY_DOWNLOAD_SMOKE_RESULT {json}`.

- `selection.maxHeight` against the profile's tier cap: a gap is the problem being investigated.
- `selection.selectedFormat` is yt-dlp's choice (`18` is the 360p progressive fallback).
- `observed.sabrSkippedClients` non-empty means YouTube listed formats for those clients but withheld their download URLs, which leaves only low progressive formats. yt-dlp's warning guesses a SABR-only experiment on the account; the log alone does not prove whether the cause is the account, the account combined with the network (proxy/VPN IP), or a YouTube test group. Compare the cookie and no-proxy cases to narrow it down.
  Queued downloads act on the same signal: a limited run with cookies is stopped once formats are chosen and retried without cookies, and the app remembers for the session whether that helped. The smoke deliberately does not retry, so each case shows what that one combination gets.
- `observed.playerApiClients` is which player APIs yt-dlp actually queried.
- `effective` is what the overlay resolved to, including the format selector and sort.
- `spawned` is read back from the last yt-dlp command: which cookie flag it got (`none` / `file` / `browser`), whether a proxy and a PO token were passed, and the exact `player_client` list (`null` means yt-dlp chose its own). The matrix shows these as `SentCookies`, `SentProxy`, and `SentClients`, so there is no need to dig through `attempts` to confirm an override took effect.
- `attempts[].args` is the exact redacted argv for every spawn, including retry-ladder attempts.
- `inputs.cookies` is a label only; cookie file paths are never reported.
