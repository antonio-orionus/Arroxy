# Startup performance

Everything measured about why Arroxy takes as long as it does to open, what was changed in 0.4.8, and how to reproduce any of it.

## Lives in

| Path | Responsibility |
| --- | --- |
| `src/main/services/WarmupService.ts` | Runs the startup branches, emits progress IPC, logs the timings below |
| `src/main/services/BinaryManager.ts` | Candidate fallback chain; `probeAndAccept` records probe cost |
| `src/main/services/binary/ProbeVerdictCache.ts` | Memoizes probe results; keyed on `(path, size, mtimeMs)`, 7-day TTL |
| `src/main/services/binary/RuntimeBinaryIndexService.ts` | Signed manifest fetch and source order |
| `src/main/services/TokenService.ts` | PO token warm-up (detached from the critical path) |
| `src/renderer/src/components/system/WarmupSplash.tsx` | Splash floor, slow-verify hint, cancel offer |
| `tests/unit/warmup-service.test.ts` | Branch timing and detachment contracts |

Related: [`runtime-binaries.md`](runtime-binaries.md) for the manifest trust model and fallback order.

## What startup actually does

`WarmupService.executeRun` resolves the runtime dependencies. Three units of work:

| Branch | Awaited? | Warm cost | Cold cost |
| --- | --- | --- | --- |
| `ffmpeg` (+ ffprobe) | Yes | ~60–75ms | ~60ms |
| `ytDlp` | Yes | ~1.66s | ~22s |
| `token` (PO token) | **No** — detached | ~2.5–2.9s | ~2.5–2.8s |

ffmpeg and ffprobe are embedded at build time under `extraResources`, so they are always local and always fast. yt-dlp is fetched at runtime and is the only branch that can be slow. The token branch runs in the background and never gates completion.

Warmup finishes when the two awaited branches finish. The splash then clears, subject to a floor (`MIN_MS`, currently 800ms).

## Measurements

macOS arm64 (M5 Pro), single machine, single network. Warm figures are one representative packaged launch; cold is n=2 with an emptied runtime cache and Homebrew stripped from `PATH` so the fallback chain cannot skip the managed download.

### Warm start

| | Before 0.4.8 | After 0.4.8 |
| --- | --- | --- |
| Warmup work | 2920ms, gated by `token` | 1656ms, gated by `ytDlp` |
| Splash floor | 3000ms | 800ms |
| **User-visible** | **3000ms** | **1656ms** |

The token branch settled at 2920ms — 1264ms *after* warmup had already completed. That gap is the detachment working, not an estimate.

Of the remaining 1656ms, **1579ms is the remote index fetch**. On a warm start almost all of startup is one network round trip.

### Cold start

| | Before 0.4.8 | After 0.4.8 |
| --- | --- | --- |
| Total | 20.0s / 21.1s | 22.2s / 21.5s |
| Gated by | `ytDlp` | `ytDlp` |
| Token branch | 2.77s / 2.59s | 2.52s / 2.82s |

**Cold start is unchanged, and could not have changed.** Run-to-run variance (0.8s) exceeds the gap between the two sets. On a cold start `ytDlp` takes ~22s against the token branch's ~2.7s, so the token branch was never the gate here — detaching it freed time on a path nothing was waiting for. The 800ms floor is equally irrelevant against 22s of work.

Where cold start goes:

| Phase | Run 1 | Run 2 | Share |
| --- | --- | --- | --- |
| yt-dlp probe (OS security scan) | 15.3s | 15.9s | ~71% |
| Remote index fetch | 3.1s | 1.9s | ~11% |
| Download + install | ~3.9s | ~3.6s | ~17% |

## Why the yt-dlp probe costs ~15 seconds

It is not compute, not disk, and not download.

- yt-dlp ships as a **PyInstaller onefile**. Every invocation — including `--version` — unpacks ~128 files (~72MB) into a fresh random `_MEI******` temp directory before any Python runs.
- Live sampling during a probe: the OS scanner (`XprotectService` on macOS) at 35–53% CPU while yt-dlp sits at **0.0%**, process state `SN`. The time is spent blocked, not working.
- Nine in-app measurements landed at 14,468–14,822ms, σ≈120ms. Outside the app: 14.05 / 14.83 / 14.63s with `user+sys ≈ 0.7s` — **~95% blocked**. Re-measured on the 0.4.8 build: 15,266ms and 15,927ms.
- **The control that settles it:** ffmpeg and ffprobe — two 65.8MB binaries, no cache, first run — probed in **244ms** total. A 60× difference on *larger* files rules out size, cold cache, and disk. The variable is the unpack.
- The artifact is `Signature=adhoc` and carries `com.apple.provenance` but **no** `com.apple.quarantine`. This is continuous content scanning, not a Gatekeeper prompt, so there is no user-facing approval to streamline away.

A cheaper probe does not exist: `probeArgs` already uses `--version`, and the unpack happens before Python starts.

## This cost recurs — it is not a first-run cost

A verdict is keyed on `(path, size, mtimeMs)` and expires after 7 days. Managed artifacts live under content-addressed paths, so:

- **Every yt-dlp version bump is a new path**, and therefore a full re-download plus a full ~15s re-probe. The configured channel is `nightly`.
- **Even an unchanged binary re-probes weekly** when the TTL lapses.

Any user-facing copy claiming this happens "once" or "the first time" is false. The 22s experience returns on roughly the yt-dlp release cadence.

This was demonstrated accidentally: a `cp -R` snapshot that did not preserve mtime invalidated five verdicts, and all 5 runs paid the full cost.

## What changed in 0.4.8

1. **Startup is instrumented.** Every branch logs when it settles; the run ends with a summary naming the branch that gated it.
2. **The token branch is detached and bounded.** It previously had no budget at all — unlike both binary resolves it received `userSignal` rather than a budgeted signal, and the hidden window's `loadURL` has no timer, so a stall could block the splash for 30s or more. Measured gating 6 of 6 warm launches, and 11.10s with YouTube unreachable.
3. **The splash floor dropped 3000ms → 800ms.** Warm work finishes below the old floor, so it hid the other two changes completely.

## Reading the startup log

`main.log` lives at `<userData>/logs/main.log` (see `src/main/index.ts`), **not** `~/Library/Logs/`.

```
Warmup branch settled { branch: 'ffmpeg', elapsedMs: 74 }
Warmup branch settled { branch: 'ytDlp',  elapsedMs: 1656 }
Warmup completed { totalMs: 1656, gatedBy: 'ytDlp', branches: { ytDlp: 1656, ffmpeg: 74, token: 0 } }
Warmup branch settled { branch: 'token',  elapsedMs: 2920 }
```

- `gatedBy` names the branch to investigate. The others finished earlier and are not the cause.
- **A branch with no `Warmup branch settled` line never finished.** The summary is written at the end, so a hang produces settled lines for the branches that completed and silence for the one that did not. This is how a hang is localised.
- `branches.token: 0` is normal, not a fault — the token branch is not awaited, so it frequently has not settled when the summary is written. Its own line arrives later.
- `yt-dlp probe ok { elapsedMs }` carries the scan cost. `yt-dlp probe verdict reused` means the memo hit and no spawn happened.
- `Remote runtime binary index verified { elapsedMs }` is the network round trip that dominates a warm start.

## Reproducing the measurements

The harness relaunches the packaged app under a chosen cache state, waits for `Warmup completed`, then kills it.

```bash
bun run dist:mac:arm64:dir          # build first; the harness runs the packaged app
```

Rules learned the hard way:

- **Snapshot and restore the runtime cache with `ditto`, never `cp -R`.** `cp -R` does not preserve mtime, and `ProbeVerdictCache` keys on it — so a `cp -R` restore silently invalidates the exact cache under test and forces a re-probe. This corrupted the first five "warm" runs of the original investigation.
- **Strip Homebrew from `PATH`** for a genuine cold start (`PATH=/usr/bin:/bin:/usr/sbin:/sbin`). Otherwise step 5 of the fallback chain finds `/opt/homebrew/bin/yt-dlp` and the managed download never happens.
- **`ARROXY_E2E=1` is unusable for this work.** It swaps in `MockTokenProvider`, destroying the exact branch being measured, and requires `ARROXY_E2E_YTDLP_PLUGIN_DIR`.
- Launching the packaged app steals keyboard focus, and there is no usable headless mode for this measurement. Batch runs and warn whoever is at the keyboard.

Useful environment overrides (see [`runtime-binaries.md`](runtime-binaries.md)):

| Variable | Effect |
| --- | --- |
| `ARROXY_RUNTIME_INDEX_URL=off` | Disables the remote index fetch; forces last-known-good. Isolates the ~2s network cost. |
| `ARROXY_RUNTIME_INDEX_SIG_URL=off` | Same, for the signature. |
| `ARROXY_RUNTIME_INDEX_FILE` / `_SIG_FILE` / `_PUBLIC_KEY_FILE` | Signed local manifest override. |

## Open work

| | Item | Blocked on |
| --- | --- | --- |
| 1 | **Last-known-good index first.** Now the largest warm-start cost — 1579ms of the gating 1656ms. Both original reasons to defer are gone: the token branch no longer masks it and the 800ms floor no longer hides it. Does **not** help cold start, which has no last-known-good index to prefer. | A freshness decision (a stale-but-signed index means a new yt-dlp lands one launch late, on a `nightly` channel) and a security review of the signed trust path. |
| 2 | **Background or deferred yt-dlp probe.** The real cure for cold start — ~71% of it. | Windows measurements. Defender can block execution outright rather than merely slow it, which is a different failure mode, and `RepairPanel` exists for exactly that case. |
| 3 | **Splash UX during a legitimately long setup.** The slow hint fires at 5s and the cancel offer at 10s, but a cold start is ~22s on fast hardware — so both fire during what is the *normal* path, framing expected behaviour as a fault. Thresholds cannot be tuned out of this, because the wait is mostly an OS scan that faster hardware does not shorten. | A design decision. See below. |

### Notes toward item 3

- Copy must not claim the wait happens "once" or "after an update" — see the recurrence section above. The current `splash.verifySlow` string is wrong on a first install.
- Copy must stay platform-neutral. The actor differs per platform (XProtect / Defender / nothing at all on Linux), and each string costs 24 locales.
- Tying the cancel offer to **absence of progress** rather than elapsed time would keep it from appearing during healthy setup on any hardware, while surfacing it faster when something is genuinely stuck.
- The structural option: stop blocking the app on warmup. ffmpeg is ready in ~60ms and the app only needs yt-dlp to *download*, not to open. Dismissing the splash early and disabling just the download affordance turns 22s of blocked staring into 22s of usable app.

## Limits on all of the above

One machine, one OS, one network; n=2 for cold. **There are no Windows or Linux numbers.** Item 2 in particular is platform-dependent by nature — do not generalise the ordering here to those platforms without data.

## Rejected, with reasons — do not resurrect

- **Ship yt-dlp as a Python zipapp** to avoid the PyInstaller unpack. Inverted: stock macOS ships only a Command Line Tools stub for `python3` and Windows ships none — the two platforms with the problem — while Linux, which does not have the problem, is the only one it would help.
- **Name macOS in the splash copy.** The actor differs per platform, so platform-neutral copy is both more accurate and avoids a 24-locale × 3-platform matrix.
- **A cheaper probe than `--version`.** Already the cheapest; the unpack precedes any Python execution.
- **Skipping the splash entirely below ~250ms.** The splash mounts at t=0 unconditionally, so the flash this would prevent cannot occur.
