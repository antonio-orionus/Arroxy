---
name: windows-vm-testing
description: Use the local Windows 11 ARM64 test VM to run Windows builds and CI gate scripts directly instead of iterating on GitHub Actions tags.
type: reference
---

# Windows VM testing (replaces tag-push iteration)

The local Windows 11 ARM64 test VM is the fast loop for Windows-only verification: build `dist:win:dir`, run `verify:startup`, exercise installer/portable flows — no tag push, no 16-minute CI round trip. Connection details (host, credentials, launch constraints) live in the **user-level agent config** (`~/.config/opencode/AGENTS.md`), never in this repo. The VM must be booted manually in the Fusion GUI first; verify reachability before use.

## Provisioned state (2026-08-31)

- winget-installed: Git 2.55 (`C:\Program Files\Git\cmd\git.exe`), Bun 1.4 (`~/.bun/bin/bun.exe`), Node 24 (`C:\Program Files\nodejs`), 7-Zip 26 (`C:\Program Files\7-Zip\7z.exe`, arm64 build).
- Repo checkout at `C:\Arroxy` (no remote; `git init` + local tags `v0.4.7`, `v0.4.8-beta.5` for the inherited-update journey). Resync by tar'ing `git ls-files` + uncommitted files (25MB) and scp'ing — NOT the whole workdir (890MB of build artifacts).
- `bun install` with `$env:CI='true'` (skips husky, no .git hooks there).

## Gotchas

- **`dist:win:dir` fails with `spawnSync bash ENOENT`** unless Git's bash is on PATH: prepend `C:\Program Files\Git\bin` to `$env:PATH` in the same shell.
- **inherited-update journey on ARM64**: `generateInheritedProfile` downloads `Arroxy-win-<arch>-Portable.exe` keyed on `process.arch` — CI runners are x64, the VM is not, and no `Arroxy-win-arm64-Portable.exe` asset exists. Workaround: download the x64 portable (runs fine under Windows 11 x64 emulation), unpack the nested `$PLUGINSDIR\app-64.7z` with 7z, generate the profile with a small script, and pass the dir via `ARROXY_INHERITED_PROFILE` (the spec honours it instead of the git-tag path).
- **`_electron.launch` hangs under bun** (CDP attach never completes — the reason startup-journeys is a Playwright spec at all). Any ad-hoc Electron launch script must run under `node`, e.g. `node gen-profile.mjs` from `C:\Arroxy` so `@playwright/test` resolves.
- **PowerShell over ssh**: inline `$` quoting breaks easily — scp a `.ps1` and run `powershell -NoProfile -ExecutionPolicy Bypass -File` instead of one-liners. `bun run` stderr lines appear as `NativeCommandError` noise in captured output; judge by `$LASTEXITCODE`.
- **Release-tier gate run needs no GH_TOKEN** — without it the updater sees only published releases (no draft 404). Set `ARROXY_STARTUP_TIER=release`, `PACKAGED_EXE=...`, `ARROXY_COLD_TMPDIR=$env:TEMP`, `ARROXY_LOG_ARCHIVE=$env:TEMP\arroxy-startup-logs`.
- Known Chromium/Playwright flake on loaded Windows runners: `sandboxed_renderer.bundle.js script failed to run` + `preloadScripts of binding.startupData is null` console errors — transient, renderer is retried; preloadDiagnostics downgrades them to info (see `isSandboxBootstrapRetry` in `src/main/preloadDiagnostics.ts`).
