#!/usr/bin/env bash
# Push this checkout to the Windows test VM (default C:\Arroxy).
#
# Sends tracked files plus untracked, non-ignored ones (so uncommitted work is
# included) — about 25 MB instead of the ~900 MB working tree with build
# output. Files removed locally since the previous sync are deleted remotely,
# so a stale test or module cannot linger and break the Windows build.
#
# Usage: scripts/vm/win-sync.sh
set -euo pipefail
source "$(dirname "$0")/_win-vm.sh"

repo="$(git rev-parse --show-toplevel)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

cd "$repo"
{ git ls-files; git ls-files --others --exclude-standard; } | sort -u | while IFS= read -r f; do
	[ -f "$f" ] && printf '%s\n' "$f"
done >"$work/manifest.txt"
COPYFILE_DISABLE=1 tar -czf "$work/arroxy-src.tgz" -T "$work/manifest.txt"
echo "sync: $(wc -l <"$work/manifest.txt" | tr -d ' ') files, $(du -h "$work/arroxy-src.tgz" | cut -f1) -> $WIN_VM_HOST:$WIN_VM_DIR"

win_vm_check
win_vm_copy "$work/arroxy-src.tgz" "$work/manifest.txt"
win_vm_ps win-sync.ps1 -Dest "$WIN_VM_DIR" -Stage "$WIN_VM_STAGE"
