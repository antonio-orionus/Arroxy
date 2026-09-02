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
locally (`bun run dist:linux:arm64`) to test here; for a Flatpak the manifest's
`only-arches: [x86_64]` must be flipped to `aarch64` as a local-only edit that is never
committed.

## Operating rules

- Confirm that the guest is running and verify SSH reachability before use; its VMware NAT address may change.
- Use the fixture E2E harness as the acceptance owner for deterministic product workflows. Use this VM for Linux/runtime/graphics-specific behavior that the harness cannot represent.
- The current-tree GPU notes are in `AGENTS.md` under **Electron GPU / Backdrop debugging**. In particular, `bun run dev:swiftshader` is an explicit opt-in for VM visual iteration, not a production default.
