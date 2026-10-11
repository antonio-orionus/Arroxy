# Linux VM testing

Scripted checks of Linux packaging on the Ubuntu ARM64 test VM: the real AppImage in-app update (banner, Install & Restart, file replacement, relaunch), an arm64 Flatpak built from the release manifest, and the window identity desktops use to match a window to its launcher. No release, no tag.

| Lives in                           | What                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `src/main/updateFeed.ts`           | Feed selection: GitHub Releases, or a loopback `ARROXY_UPDATE_FEED_URL`            |
| `scripts/vm/ubu-update-test.sh`    | The automated AppImage update test (three filename cases)                          |
| `scripts/vm/ubu-flatpak-build.sh`  | Builds and installs an arm64 Flatpak on the VM from `flatpak/`                     |
| `scripts/vm/ubu-window-test.sh`    | Asks GNOME Shell which launcher each Arroxy window belongs to, with controls       |
| `scripts/vm/ubu-flatpak-repo-test.sh` | Arroxy's Flatpak repo end to end: publish, install, update, banner ([flatpak-repo.md](flatpak-repo.md)) |
| `scripts/vm/ubu-vm.sh`             | Manual control: launch an AppImage or the Flatpak, inspect, read the app_id, stop |
| `scripts/vm/_ubu-vm.sh`            | Mac-side helpers: ssh, feed staging, CDP tunnel                                    |
| `scripts/vm/ubu-remote.sh`         | Guest-side steps, shipped over ssh on every call                                   |
| `scripts/vm/cdp.ts`                | Drives the app window over CDP (dismiss What's new, click the update banner)       |
| `tests/unit/linux-desktop-identity.test.ts` | Keeps `desktopName`, `syncDesktopName` and the Flatpak `StartupWMClass` in step |

Needs: the VM booted with a user logged into GNOME (apps run in that Wayland session) and the `ubu-vm` SSH alias with key auth (`ARROXY_UBU_VM` to override). Nothing needs root: Flatpak work uses the VM user's own installation. `scripts/vm/ubu-vm.sh clean` removes everything the scripts left on the guest, including the test Flatpak; the Flathub runtimes stay.

## AppImage update test

```bash
scripts/vm/ubu-update-test.sh --build        # build arm64 AppImage, then test
scripts/vm/ubu-update-test.sh                # reuse dist/Arroxy-linux-arm64.AppImage
scripts/vm/ubu-update-test.sh --case my.AppImage --keep   # one filename, leave it running
```

The build must contain `src/main/updateFeed.ts`; older builds ignore the feed override and the test stops at "update banner did not appear". Between runs the test keeps the uploaded AppImage and the app's managed yt-dlp under `~/.arroxy-vm` on the guest, so a repeat run uploads nothing and the window does not sit on the "Downloading yt-dlp" screen. Every case still starts with an otherwise empty profile.

- **One build, two versions.** The Mac writes a feed file that announces the same AppImage as 9.9.9, named for the channel of the version in `package.json` (`latest-linux-arm64.yml`, or `beta-…` for a beta), and uploads both to `~/.arroxy-vm/feed` on the guest, served by `python3 -m http.server` on `127.0.0.1`. The app is started with `ARROXY_UPDATE_FEED_URL` pointing there.
- **The override is loopback-only.** `resolveUpdateFeed` accepts only `http(s)` URLs on `127.0.0.1`, `localhost` or `[::1]`, without credentials; anything else is logged and ignored, so the environment can never redirect a shipped build to a remote server. Point a build at a remote feed through an SSH tunnel instead.
- **Desktop session from ssh.** Electron exits with "Missing X server or $DISPLAY" over plain ssh. `ubu-remote.sh` sets the variables GNOME would (`XDG_SESSION_TYPE=wayland`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, the session bus, and the Xwayland auth file) and uses a throwaway `ELECTRON_USER_DATA`.
- **Clicking.** `cdp.ts click-update` keeps dismissing the What's new dialog (it makes the window inert) until the banner's Install & Restart button is usable, then clicks it.
- **Checks per case.** Exactly one AppImage in the folder, under the expected name, with a new file identity (inode plus birth time — inode numbers alone are reused right after a delete), exactly one live instance running it, and the `.desktop` entry's target present or, for versioned names, stale. On failure the updater's log lines are printed.

Established on 2026-10-11 (Ubuntu 26.04 arm64, electron-updater 6.8.9):

| Saved as                       | Result                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| published name                 | Replaced in place; one file; `.desktop` keeps working                           |
| custom name without a version  | Replaced in place, name kept                                                    |
| name containing `x.y.z`        | Old file deleted, update saved under the published name; `.desktop` goes stale  |

- The AppImage runs on a stock install with only fuse3 (no libfuse2).
- The old AppImage runtime process stays alive after the relaunch, holding the deleted file open, and exits within a second of the new instance quitting. It is reported as `lingering_old_runtime`.
- Python's server ignores `Range`, so electron-updater's differential download always falls back to a full one here. The test covers replacement, not download size.

## Flatpak on the VM

```bash
scripts/vm/ubu-flatpak-build.sh --build --install   # dist:linux:arm64, then build + install the Flatpak
scripts/vm/ubu-vm.sh flatpak-launch                 # run it in the GNOME session with CDP
```

The script renders the release manifest from `flatpak/` with `scripts/render-flatpak-manifest.py` (the same step the release workflow runs) in a temporary copy, flips `only-arches` from `x86_64` to `aarch64` there — never in `flatpak/` — and builds it on the guest with `flatpak-builder --user` into a local repo and a bundle, `~/.arroxy-vm/Arroxy-linux-arm64.flatpak`. `--install` then installs that bundle the way a user installs the release download. The first build adds the Flathub remote for the user and installs the runtimes (about 3 GB); later builds take a few minutes.

`scripts/vm/ubu-flatpak-repo-test.sh` then publishes that build with `scripts/flatpak/publish-repo.sh` — the release workflow's script — signed with a throwaway key and served on `127.0.0.1`, and checks the update path users get: installs from the `.flatpakref` and from the bundle both get the repo as origin with GPG verification, a newly published commit arrives with plain `flatpak update <app>`, and the installed Flatpak's banner shows that command. `flatpak run` does not pass the caller's environment into the sandbox, so `flatpak-launch` forwards the test feed with `--env`.

From this guest, fetches from Flathub intermittently fail with libcurl's `[35] SSL connect error` while `wget` and the next attempt succeed; the network steps are retried up to three times.

## Window identity

Desktops tie a running window to its launcher — icon, name, taskbar group — by comparing the window's Wayland `app_id` (X11 `WM_CLASS`) with the `.desktop` file's name or its `StartupWMClass`. Electron takes that id from `desktopName` in `package.json`; with `linux.syncDesktopName`, electron-builder writes the AppImage's embedded entry from the same field.

```bash
scripts/vm/ubu-vm.sh gnome-unsafe-mode    # once per VM; applies at the next login
scripts/vm/ubu-window-test.sh             # GNOME's own verdict, AppImage launchers + Flatpak
```

`ubu-window-test.sh` asks GNOME Shell (`Shell.WindowTracker` through `Eval`) which launcher it tied each Arroxy window to, for the AppImage under several hand-made launchers and for the installed test Flatpak. Two cases are negative controls that must stay unmatched, so a check that matches everything fails. The app is started over ssh rather than from the launcher, so this covers class and file-name matching — what survives relaunches, updates and launchers written by hand or by AppImage integrators; a launch from the dock can additionally match through its activation token.

GNOME answers `Eval`/`Introspect` over ssh only in unsafe mode. `gnome-unsafe-mode` adds a user-level systemd drop-in that starts the session's GNOME Shell with `--unsafe-mode` from the next login (dev VM only: any local process can then script the shell). It does not log out by itself: GDM's auto-login fires only when GDM starts, so a logout over ssh leaves the VM on the login screen until someone logs in at the console or reboots it from Fusion. A separate headless `gnome-shell --unsafe-mode` on its own D-Bus session does not work as a substitute: its JavaScript stalls (screencast service activation times out) and `Eval` never returns.

For the raw id: `scripts/vm/ubu-vm.sh launch <AppImage> --wayland-debug` (or `flatpak-launch --wayland-debug`) logs the Wayland protocol, and `scripts/vm/ubu-vm.sh app-id` reads the id the window announced.

| Package  | app_id   | Desktop entry                                | StartupWMClass |
| -------- | -------- | -------------------------------------------- | -------------- |
| AppImage | `arroxy` | `arroxy.desktop` (embedded)                  | `arroxy`       |
| Flatpak  | `arroxy` | `io.github.antonio_orionus.Arroxy.desktop`   | none, on purpose |

Established on 2026-10-11 (Ubuntu 26.04, GNOME Shell 50.1), all by GNOME's own verdict:

| Launcher                                         | GNOME ties the AppImage window to |
| ------------------------------------------------ | --------------------------------- |
| any file name with `StartupWMClass=arroxy`       | that launcher                     |
| any file name with `StartupWMClass=Arroxy`       | nothing (generic icon)            |
| other file name, no `StartupWMClass`             | nothing (generic icon)            |
| `arroxy.desktop`, no `StartupWMClass`            | that launcher                     |
| the Flatpak window                               | the Flatpak's launcher, through its sandbox id |

Before `desktopName` was set (0.4.22 and earlier) the embedded AppImage entry said `StartupWMClass=Arroxy`, which GNOME does not match against `arroxy` (row 2), so the window only found its launcher while the file kept the name `arroxy.desktop`; AppImage integrators that rename it got a generic icon. A hand-made `.desktop` for the AppImage or tar.gz matches when it is named `arroxy.desktop` or contains `StartupWMClass=arroxy`.

The Flatpak entry must not declare `StartupWMClass=arroxy`. GNOME tries the class before anything else, so it would claim every `arroxy` window: with the Flatpak installed, an AppImage or tar.gz window showed up under the Flatpak's launcher. GNOME matches the Flatpak window through its sandbox app id without it. `tests/unit/linux-desktop-identity.test.ts` pins both rules.

GNOME's app index has two habits the test works around. It rebuilds about 5 seconds after a launcher changes, so the test waits until the index agrees with the file (and until the previous case's launcher is gone) instead of sleeping. And a running GNOME Shell never refreshes an entry whose file changes under the same name — including a Flatpak reinstall, which only swaps a symlink — so every case uses its own launcher name, `ubu-flatpak-build.sh --install` uninstalls and waits for GNOME to drop the app before installing, and the test refuses to run while GNOME's view of the Flatpak launcher differs from the file.

The id stays `arroxy` rather than the Flatpak's reverse-DNS id on purpose: per-app desktop state keyed by it (notification settings, the global-shortcut portal grant) carries over, and `arroxy.desktop` is the name people pick for a hand-made launcher anyway.
