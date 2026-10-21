---
name: windows-vm-testing
description: Use the local Windows 11 ARM64 test VM to run Windows builds and CI gate scripts directly instead of iterating on GitHub Actions tags.
metadata:
  type: reference
---

# Windows VM testing (replaces tag-push iteration)

The local Windows 11 ARM64 test VM is the fast loop for Windows-only verification: build `dist:win:dir`, run `verify:startup`, exercise installer/portable flows — no tag push, no 16-minute CI round trip. Connection details (host, credentials, launch constraints) live in the **user-level agent config** of whichever tool you run (for example `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md`) and `~/.ssh/config` (alias `win-vm`, key auth), never in this repo. The VM must be booted manually in the Fusion GUI first; verify reachability before use.

## On the VM

- An Arroxy checkout at `C:\Arroxy` without a remote. Keep it current with **`scripts/vm/win-sync.sh`** (tracked and untracked non-ignored files, ~26 MB, deletes files removed since the last sync) and build with **`scripts/vm/win-build.sh`** (`bun install` + `dist:win:dir`, ~45 s warm). `scripts/vm/win-install-release.sh [tag]` installs a published release as a baseline. All go through the `win-vm` SSH alias with key auth; see `dev-docs/download-smoke.md`.
- `bun install` runs with `$env:CI='true'` (no `.git` there, so `vp config` installs no hooks).
- What else is installed, the console codepage, and any leftover state from earlier repros are machine facts: they live in the user-level agent config, next to the connection details.
- yt-dlp's Windows stdout behaviour can be checked without building the app with a standalone official `yt-dlp.exe`, driven from `node` through a pipe with a crafted info.json or a local `http://127.0.0.1` file server. Recipe and results in [[ytdlp-stdout-drops-non-ascii]].

## Gotchas

- **`dist:win:dir` fails with `spawnSync bash ENOENT`** unless Git's bash is on PATH: prepend `C:\Program Files\Git\bin` to `$env:PATH` in the same shell.
- **inherited-update journey on ARM64**: `generateInheritedProfile` downloads `Arroxy-win-<arch>-Portable.exe` keyed on `process.arch` — CI runners are x64, the VM is not, and no `Arroxy-win-arm64-Portable.exe` asset exists. Workaround: download the x64 portable (runs fine under Windows 11 x64 emulation), unpack the nested `$PLUGINSDIR\app-64.7z` with 7z, generate the profile with a small script, and pass the dir via `ARROXY_INHERITED_PROFILE` (the spec honours it instead of the git-tag path).
- **`_electron.launch` hangs under bun** (CDP attach never completes — the reason startup-journeys is a Playwright spec at all). Any ad-hoc Electron launch script must run under `node`, e.g. `node gen-profile.mjs` from `C:\Arroxy` so `@playwright/test` resolves.
- **PowerShell over ssh**: inline `$` quoting breaks easily — scp a `.ps1` and run `powershell -NoProfile -ExecutionPolicy Bypass -File` instead of one-liners. `bun run` stderr lines appear as `NativeCommandError` noise in captured output; judge by `$LASTEXITCODE`.
- **Headless app runs work over plain SSH** (verified 2026-09-16, no user logged on — `query user` empty): `Start-Process -NoNewWindow -Wait -RedirectStandardOutput` returns the app's stdout, and the hidden-window PoT mint passes. No scheduled-task / interactive-session launch needed for the probe smoke or download smoke (`dev-docs/download-smoke.md`). Scheduled tasks are only needed for a *visible* window.
- **Release-tier gate run needs no GH_TOKEN** — without it the updater sees only published releases (no draft 404). Set `ARROXY_STARTUP_TIER=release`, `PACKAGED_EXE=...`, `ARROXY_COLD_TMPDIR=$env:TEMP`, `ARROXY_LOG_ARCHIVE=$env:TEMP\arroxy-startup-logs`.
- Known Chromium/Playwright flake on loaded Windows runners: `sandboxed_renderer.bundle.js script failed to run` + `preloadScripts of binding.startupData is null` console errors — transient, renderer is retried; preloadDiagnostics downgrades them to info (see `isSandboxBootstrapRetry` in `src/main/preloadDiagnostics.ts`).
