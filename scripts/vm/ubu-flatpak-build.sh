#!/usr/bin/env bash
# Builds the Arroxy Flatpak for arm64 on the Ubuntu ARM64 test VM, from the same
# manifest template the release workflow uses, so Flatpak behaviour (sandbox,
# portals, updates) can be checked without a release. Releases ship x86_64
# only; the arch flip to aarch64 happens in a temporary copy and is never
# written back to flatpak/.
#
# Input is dist/Arroxy-linux-arm64.tar.gz (bun run dist:linux:arm64, or
# --build). The first run installs the Flathub runtimes into the VM user's
# Flatpak installation (about 1 GB); later runs reuse them.
#
# Usage: scripts/vm/ubu-flatpak-build.sh [--build] [--install]
#   --build    run bun run dist:linux:arm64 first
#   --install  install the bundle on the VM (flatpak install --user), like a user would
# Then: scripts/vm/ubu-vm.sh flatpak-launch
set -euo pipefail
# shellcheck source=scripts/vm/_ubu-vm.sh
source "$(dirname "$0")/_ubu-vm.sh"

build=0
install=''
while (($#)); do
	case "$1" in
		--build) build=1 ;;
		--install) install=install ;;
		*)
			echo "unknown option: $1" >&2
			exit 2
			;;
	esac
	shift
done

ubu_vm_check
if ((build)); then (cd "$UBU_REPO_ROOT" && bun run dist:linux:arm64); fi
tarball="$UBU_REPO_ROOT/dist/Arroxy-linux-arm64.tar.gz"
[[ -f $tarball ]] || {
	echo "no $tarball — run with --build" >&2
	exit 1
}

# Same layout as the repo (flatpak/ next to LICENSE) because the manifest
# references ../LICENSE.
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
cp -R "$UBU_REPO_ROOT/flatpak" "$stage/flatpak"
cp "$UBU_REPO_ROOT/LICENSE" "$stage/LICENSE"
cp "$tarball" "$stage/flatpak/"
(cd "$UBU_REPO_ROOT" && python3 scripts/render-flatpak-manifest.py \
	--sha256 "$(shasum -a 256 "$tarball" | cut -d' ' -f1)" \
	--archive-path "$(basename "$tarball")" \
	--template "$stage/flatpak/io.github.antonio_orionus.Arroxy.yml.in" \
	--output "$stage/flatpak/io.github.antonio_orionus.Arroxy.yml" \
	--metainfo-template "$stage/flatpak/io.github.antonio_orionus.Arroxy.metainfo.xml.in" \
	--metainfo-output "$stage/flatpak/io.github.antonio_orionus.Arroxy.metainfo.xml")
manifest="$stage/flatpak/io.github.antonio_orionus.Arroxy.yml"
grep -q '^ *- x86_64$' "$manifest" || {
	echo "manifest no longer pins only-arches to x86_64; update this script" >&2
	exit 1
}
sed -i.bak 's/^\( *\)- x86_64$/\1- aarch64/' "$manifest" && rm "$manifest.bak"

echo "staging manifest and $(basename "$tarball") on $UBU_VM_HOST"
ssh -o BatchMode=yes "$UBU_VM_HOST" 'mkdir -p .arroxy-vm/flatpak-src'
rsync -a --delete "$stage/" "$UBU_VM_HOST:.arroxy-vm/flatpak-src/"
ubu_remote flatpak-build ${install:+"$install"}
