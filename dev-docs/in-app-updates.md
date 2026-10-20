# In-app updates

How the update banner works: the check, the per-channel action, and the Linux AppImage gate.

| Lives in | What |
| --- | --- |
| `src/main/ipc/registerUpdaterHandlers.ts` | Update check, `updater:available`, `updater:install` |
| `src/main/installChannel.ts` | Install channel detection |
| `src/renderer/src/components/system/updateBannerAction.ts` | `resolveAction(channel, platform)` |

## Check and channel actions

`electron-updater` v6, GitHub provider. Auto-download is **disabled**: the user starts everything. Main calls `autoUpdater.checkForUpdates()` 5 s after launch and again every 6 h (`UPDATE_RECHECK_INTERVAL_MS`), so a session left in the tray or one that launched offline still hears of a release. It emits `updater:available` to the renderer with `{version, currentVersion, installChannel, homebrewAvailable}`, once per version: a re-check that finds the same release sends nothing, so a dismissed banner stays dismissed until a newer one. `installChannel` detection (flatpak/scoop/homebrew/portable/winget/appimage/tarball/direct) lives in `src/main/installChannel.ts`; on Linux, `APPIMAGE` set means `appimage`, otherwise `tarball`. The channel is also the heartbeat's `utmSource`, so each release package reports under its own name. `winget` is the same NSIS install as `direct`, in the same folder, so it is told apart by a marker: WinGet's manifest passes `--winget`, and `build/installer.nsh` records it in `HKCU\Software\Arroxy` and writes `installed-by-winget` beside the executable on that install and every later one, in-app updates included. A real uninstall clears it. So `winget` means "WinGet installed or upgraded this copy at least once"; installs from before the marker existed read as `direct` until their next `winget upgrade`. Both channels update in-app the same way.

`<UpdateBanner>` sits between the title bar and the content; `resolveAction(channel, platform)` picks the UX:

- `scoop` → copy-command for `scoop update arroxy`
- `homebrew` → copy-command for `brew upgrade --cask arroxy` plus **Run & Restart**: `updater:install` runs that fixed argv in main (`upgradeArroxyWithHomebrew`), then `app.relaunch()` + `app.quit()`. `quit()`, never `exit()`: `exit()` skips `before-quit`, which cancels running downloads. A second invoke mid-upgrade is refused, and the guard stays set after a success so a slow `quit()` (it cancels running downloads first) cannot start a second `brew`. A zero exit from brew is not proof of an update, so both Homebrew runs (this and the DMG switch below) force a tap refresh with `HOMEBREW_AUTO_UPDATE_SECS=0` (brew refreshes at most once per 24 h, so right after a release the tap can still hold the old cask and `brew upgrade` exits 0 with "already installed"), then check `brew list --cask --versions arroxy` against the version the banner announced. An older cask returns an error and the app keeps running instead of relaunching into the version it was already on.
- `flatpak` → copy-command for `flatpak update io.github.antonio_orionus.Arroxy` (updates come from Arroxy's own Flatpak repo, [flatpak-repo.md](flatpak-repo.md)). On Linux electron-updater only checks inside an AppImage, so Flatpak sets `autoUpdater.forceDevUpdateConfig` to let the *check* run; `flatpak` is non-installable and nothing is downloaded.
- `portable` → "Download ↗" link to https://orionus.dev/arroxy/ (NSIS auto-update can't run from a %TEMP% extract)
- `direct` on darwin → "Download ↗" link to https://orionus.dev/arroxy/ (the DMG is unsigned and can't self-update). When `homebrewAvailable`, the banner also shows `brew install --cask --force antonio-orionus/arroxy/arroxy` with copy and **Run & Restart**, which moves the install under Homebrew while updating. Main sets `homebrewAvailable` only for a **stable** build running from **/Applications** with `brew` on the Mac (`canMoveUnderHomebrew`), and the install handler trusts that main-side state, never the renderer:
  - The cask lives in Arroxy's own tap, which a DMG user has not tapped, so the **fully qualified name** is required (it makes brew tap on the fly). The short `arroxy` fails with "No Cask with this name exists".
  - `--adopt` cannot work: it requires the installed app to be identical to the cask's, and an update is by definition pending. It also conflicts with `--force`. `--force` overwrites the old bundle and registers the cask, so later updates take the `homebrew` path above.
  - /Applications only: brew always installs there, so a copy running from Downloads or `~/Applications` would be left behind and the relaunch would reopen it.
  - Stable only: betas are never published to Homebrew, so the force-install would downgrade a beta user.
- `tarball` → "Download ↗" link to the announced version's GitHub release, `releases/tag/v<version>` (`resolveDownloadUrl`), where the `Arroxy-linux-x64.tar.gz` asset lives. Not `/releases/latest`: that resolves to the newest stable, older than a beta's update. electron-updater cannot replace a tar.gz install; see the AppImage gate below
- `appimage`, `winget`, `direct` on win32 → "Install & Restart" → `updater:install` → main calls `downloadUpdate()`, then `quitAndInstall(false, true)` on `update-downloaded`

## Linux: the AppImage gate

On Linux, electron-updater's default updater is `AppImageUpdater` (no `package-type` file shipped — we only build AppImage + tar.gz). `AppImageUpdater.isUpdaterActive()` returns `false` when `process.env.APPIMAGE` is unset and `forceDevUpdateConfig` is off, which silently short-circuits `AppUpdater.checkForUpdates()` (returns `null`, never emits `update-available`). See `node_modules/electron-updater/out/AppImageUpdater.js` (`isUpdaterActive`).

Flatpak and the packaged tarball set `forceDevUpdateConfig`, so the check runs; both are non-installable, so nothing is downloaded. The switch also skips electron-updater's "not packaged" guard, and an unpackaged Linux run (`bun run dev`, `electron-vite preview`) has no `APPIMAGE` either and reads as `tarball`, so the tarball takes it only when `app.isPackaged`.

## IPC + types

IPC channel names live in `IPC_CHANNELS` (`@shared/ipc`); payload types (`InstallChannel`, `UpdateAvailablePayload`) live in `@shared/types`. `resolveAction` is the pure helper at `src/renderer/src/components/system/updateBannerAction.ts` — extracted from `UpdateBanner.tsx` so the component file only exports a component (react-refresh requirement). Renderer `browser-mock` mode at `src/renderer/src/browserMock.ts` simulates an `updater:available` event only for explicit update scenarios.
