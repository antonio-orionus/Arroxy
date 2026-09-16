#!/usr/bin/env bash
# Build the unpacked Windows app on the test VM from the synced checkout.
# Runs `bun install` (CI=true, no git hooks there) and `bun run dist:win:dir`,
# then prints the Arroxy.exe path. The VM is ARM64, so the build is win-arm64.
#
# Usage: scripts/vm/win-sync.sh && scripts/vm/win-build.sh
set -euo pipefail
source "$(dirname "$0")/_win-vm.sh"

win_vm_check
win_vm_ps win-build.ps1 -Dir "$WIN_VM_DIR"
