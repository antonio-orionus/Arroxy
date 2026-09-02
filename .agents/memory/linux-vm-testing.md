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

## Operating rules

- Confirm that the guest is running and verify SSH reachability before use; its VMware NAT address may change.
- Use the fixture E2E harness as the acceptance owner for deterministic product workflows. Use this VM for Linux/runtime/graphics-specific behavior that the harness cannot represent.
- The current-tree GPU notes are in `AGENTS.md` under **Electron GPU / Backdrop debugging**. In particular, `bun run dev:swiftshader` is an explicit opt-in for VM visual iteration, not a production default.
