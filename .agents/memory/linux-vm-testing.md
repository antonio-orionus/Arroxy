---
name: linux-vm-testing
description: Use the local Ubuntu VMware VM for Linux-side Arroxy and Electron verification without CI iteration.
type: reference
---

# Ubuntu Linux VM testing

The local Ubuntu VMware guest is a private Linux target for Arroxy validation. Keep its hostname, DHCP address, and credentials in the user-level agent configuration, never in this repository.

## Use it for

- Linux packaged-app, startup, and filesystem smoke tests.
- Electron/Chromium behavior that is specific to Linux.
- VMware graphics and backdrop iteration, including SwiftShader fallback when native WebGL is unavailable.

## The guest is ARM64

Arroxy publishes **x86_64 Linux artifacts only**, so nothing from the releases page runs
on this VM: the AppImage fails with `Exec format error`, and the Flatpak installs cleanly
and then dies at launch with `bwrap: execvp ldconfig: Exec format error`. Build arm64
locally (`bun run dist:linux:arm64`) to test here. For a Flatpak use
`scripts/vm/ubu-flatpak-build.sh --build --install`: it flips `only-arches` to `aarch64`
in a temporary copy (never in `flatpak/`) and builds on the guest. Flathub fetches from
this guest fail intermittently with libcurl `[35] SSL connect error`; retry, don't debug.

## Launching the app from ssh

Electron dies with "Missing X server or $DISPLAY" over plain ssh, even with `DISPLAY` set:
it needs `XDG_SESSION_TYPE=wayland` plus the GNOME session variables. Don't rediscover
this — `scripts/vm/ubu-vm.sh launch <arm64.AppImage>` (or `flatpak-launch`) does it,
`scripts/vm/ubu-update-test.sh` runs the full in-app update test, and `--wayland-debug`
plus `ubu-vm.sh app-id` reads the window's app_id. See `dev-docs/linux-vm-testing.md`.

## Never log the GNOME session out over ssh

GDM auto-login only fires when GDM starts. A `gnome-session-quit --logout` (or anything
that ends the session) leaves the VM on the login screen, and the ssh user cannot reboot
it (polkit wants interactive auth). Recovery needs a human at the Fusion console. Changes
that need a new session (e.g. `scripts/vm/ubu-vm.sh gnome-unsafe-mode`) apply at the next
login — ask the user to reboot the VM from Fusion.

## Launches can leave dialogs you cannot see

Arroxy registers its global hotkey through GNOME's GlobalShortcuts portal; GNOME answers
with an "Add Keyboard Shortcuts" dialog on the VM's screen. Over ssh nobody sees or answers
it, so every unseeded launch stacks another one (found after ~7 had piled up). The
`scripts/vm/` launchers seed test profiles with the hotkey and analytics off; any new
launcher must do the same. With GNOME in unsafe mode, list stray windows via `Eval` on
`global.get_window_actors()`; the dialogs belong to
`gnome-control-center-global-shortcuts-provider` — stopping it closes them.

## Operating rules

- Confirm that the guest is running and verify SSH reachability before use; its VMware NAT address may change.
- Use the fixture E2E harness as the acceptance owner for deterministic product workflows. Use this VM for Linux/runtime/graphics-specific behavior that the harness cannot represent.
- The current-tree GPU notes are in `AGENTS.md` under **Electron GPU / Backdrop debugging**. In particular, `bun run dev:swiftshader` is an explicit opt-in for VM visual iteration, not a production default.
