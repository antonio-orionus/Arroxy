---
name: windows-vm-testing
description: Use the local Windows 11 ARM64 test VM to run Windows builds and CI gate scripts directly instead of iterating on GitHub Actions tags.
type: reference
---

# Windows VM testing (replaces tag-push iteration)

The local Windows 11 ARM64 test VM is the fast loop for Windows-only verification: build `dist:win:dir`, run `verify:startup`, exercise installer/portable flows — no tag push, no 16-minute CI round trip. Connection details (host, credentials, launch constraints) live in the **user-level agent config** (`~/.config/opencode/AGENTS.md`), never in this repo. The VM must be booted manually in the Fusion GUI first; verify reachability before use.

## Provisioned state (2026-08-31)

- winget-installed: Git 2.55 (`C:\Program Files\Git\cmd\git.exe`), Bun 1.4 (`~/.bun/bin/bun.exe`), Node 24 (`C:\Program Files\nodejs`), 7-Zip 26 (`C:\Program Files\7-Zip\7z.exe`, arm64 build).
- Repo checkout at `C:\Arroxy` (no remote; `git init` + local tags `v0.4.7`, `v0.4.8-beta.5` for the inherited-update journey). **Use `scripts/vm/win-sync.sh`** (tracked + untracked non-ignored files, ~26 MB, deletes files removed since the last sync) and **`scripts/vm/win-build.sh`** (`bun install` + `dist:win:dir`, ~45 s warm). `scripts/vm/win-install-release.sh [tag]` installs a published release as a baseline (0.4.16 installed 2026-09-16). All go through the `win-vm` SSH alias with key auth; see `dev-docs/download-smoke.md`.
- `bun install` with `$env:CI='true'` (skips husky, no .git hooks there).
- (2026-09-13) Standalone `yt-dlp.exe` at `C:\Users\admin\yt-dlp.exe` (official release, not Arroxy's managed copy). Lets yt-dlp's Windows stdout behaviour be checked without building the app — drive it from `node` through a pipe, with a crafted info.json or a local `http://127.0.0.1` file server so no external network is needed. Recipe and results in [[ytdlp-stdout-drops-non-ascii]].
- (2026-09-14, issue #222 repro; **hosts-file part removed 2026-09-16**, settings part may still apply) Hosts file blocked `www.youtube.com` / `youtube.com` / `m.youtube.com` (lines tagged `# issue222`), and `%APPDATA%\arroxy\settings.json` has `cookiesMode: browser`, `cookiesBrowser: firefox`, `proxyUrl: 192.168.212.1:18080` (a throwaway proxy on the Mac, `/tmp/issue222/proxy.mjs`). Backups: `settings.json.issue222-*.bak` beside it and `C:\Users\admin\hosts.issue222-*.bak`. Arroxy 0.4.13 portable at `C:\Users\admin\arroxy-0413\`, launched into the desktop session via scheduled task `arroxy-issue222` with `--remote-debugging-port=9333`. The hosts lines were removed on 2026-09-16 (backup `C:\Windows\System32\drivers\etc\hosts.bak-issue222`); the settings.json proxy/cookies may still be the #222 values — restore its backup or use an isolated `ELECTRON_USER_DATA` before trusting a live run.
- The console codepage is **437**, a legacy OEM page. That makes the VM a faithful repro host for anything that depends on a non-UTF-8 codepage.

## Gotchas

- **`dist:win:dir` fails with `spawnSync bash ENOENT`** unless Git's bash is on PATH: prepend `C:\Program Files\Git\bin` to `$env:PATH` in the same shell.
- **inherited-update journey on ARM64**: `generateInheritedProfile` downloads `Arroxy-win-<arch>-Portable.exe` keyed on `process.arch` — CI runners are x64, the VM is not, and no `Arroxy-win-arm64-Portable.exe` asset exists. Workaround: download the x64 portable (runs fine under Windows 11 x64 emulation), unpack the nested `$PLUGINSDIR\app-64.7z` with 7z, generate the profile with a small script, and pass the dir via `ARROXY_INHERITED_PROFILE` (the spec honours it instead of the git-tag path).
- **`_electron.launch` hangs under bun** (CDP attach never completes — the reason startup-journeys is a Playwright spec at all). Any ad-hoc Electron launch script must run under `node`, e.g. `node gen-profile.mjs` from `C:\Arroxy` so `@playwright/test` resolves.
- **PowerShell over ssh**: inline `$` quoting breaks easily — scp a `.ps1` and run `powershell -NoProfile -ExecutionPolicy Bypass -File` instead of one-liners. `bun run` stderr lines appear as `NativeCommandError` noise in captured output; judge by `$LASTEXITCODE`.
- **Headless app runs work over plain SSH** (verified 2026-09-16, no user logged on — `query user` empty): `Start-Process -NoNewWindow -Wait -RedirectStandardOutput` returns the app's stdout, and the hidden-window PoT mint passes. No scheduled-task / interactive-session launch needed for the probe smoke or download smoke (`dev-docs/download-smoke.md`). Scheduled tasks are only needed for a *visible* window.
- **Release-tier gate run needs no GH_TOKEN** — without it the updater sees only published releases (no draft 404). Set `ARROXY_STARTUP_TIER=release`, `PACKAGED_EXE=...`, `ARROXY_COLD_TMPDIR=$env:TEMP`, `ARROXY_LOG_ARCHIVE=$env:TEMP\arroxy-startup-logs`.
- Known Chromium/Playwright flake on loaded Windows runners: `sandboxed_renderer.bundle.js script failed to run` + `preloadScripts of binding.startupData is null` console errors — transient, renderer is retried; preloadDiagnostics downgrades them to info (see `isSandboxBootstrapRetry` in `src/main/preloadDiagnostics.ts`).
