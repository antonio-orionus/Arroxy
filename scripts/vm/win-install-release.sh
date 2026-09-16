#!/usr/bin/env bash
# Install a published Arroxy release on the Windows test VM, so there is a
# current baseline to compare a branch build against without building anything.
# Downloads the x64 NSIS installer on the VM (it runs under x64 emulation on the
# ARM64 guest), checks it against the release's SHA256SUMS, and installs it
# silently to %LOCALAPPDATA%\Programs\arroxy.
#
# Usage: scripts/vm/win-install-release.sh [tag]    # default: latest stable
set -euo pipefail
source "$(dirname "$0")/_win-vm.sh"

tag="${1:-latest}"
win_vm_check
win_vm_ps win-install-release.ps1 -Tag "$tag"
