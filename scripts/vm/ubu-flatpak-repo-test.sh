#!/usr/bin/env bash
# End-to-end check of Arroxy's Flatpak repo on the Ubuntu ARM64 test VM, with
# scripts/flatpak/publish-repo.sh — the script the release workflow runs — and
# a throwaway signing key:
#
#   1. publish the built repo; install from the .flatpakref, as users do from the site
#   2. publish a new commit; `flatpak update <app>` (the banner's command, no
#      --user) must pick it up
#   3. same again for an install from the downloadable bundle, which must come
#      with the repo as its remote
#
# Every check reads Flatpak's own state (origin remote, its URL, GPG
# verification, installed commit). Needs a Flatpak built by
# scripts/vm/ubu-flatpak-build.sh (its repo at ~/.arroxy-vm/flatpak-repo).
#
# Usage: scripts/vm/ubu-flatpak-repo-test.sh
set -euo pipefail
# shellcheck source=scripts/vm/_ubu-vm.sh
source "$(dirname "$0")/_ubu-vm.sh"

PORT="${ARROXY_UBU_REPO_PORT:-8766}"
URL="http://127.0.0.1:$PORT/repo/"

ubu_vm_check
ssh -o BatchMode=yes "$UBU_VM_HOST" 'test -d .arroxy-vm/flatpak-repo/objects' || {
	echo "no built Flatpak repo on the VM — run scripts/vm/ubu-flatpak-build.sh first" >&2
	exit 1
}
scp -q "$UBU_REPO_ROOT/scripts/flatpak/publish-repo.sh" "$UBU_VM_HOST:.arroxy-vm/publish-repo.sh"

failures=0
check() {
	local label="$1" ok="$2"
	if [[ $ok == 1 ]]; then echo "  ok    $label"; else
		echo "  FAIL  $label"
		failures=$((failures + 1))
	fi
}
field() { sed -n "s/.*$1=\([^ ]*\).*/\1/p" <<<"$2"; }

# install_and_update <label> <install-subcommand...>
install_and_update() {
	local label="$1" before after state
	shift
	echo "$label"
	ubu_remote flatpak-uninstall-all
	"$@" >/dev/null
	state="$(ubu_remote flatpak-origin)"
	echo "        installed: $state"
	check "installed with Arroxy's repo as its origin" "$([[ $(field url "$state") == "$URL" ]] && echo 1)"
	check "updates are GPG-verified" "$([[ $(field gpg "$state") == verify ]] && echo 1)"
	before="$(field commit "$state")"

	ubu_remote flatpak-repo-bump "$PORT" | sed 's/^/        /'
	ubu_remote flatpak-update >/dev/null
	after="$(field commit "$(ubu_remote flatpak-origin)")"
	check "flatpak update installed the new commit (${before:0:12} -> ${after:0:12})" "$([[ -n $after && $after != "$before" ]] && echo 1)"
}

echo "publishing the built repo at $URL"
ubu_remote flatpak-repo-publish "$PORT" | sed 's/^/        /'

install_and_update "install from the .flatpakref:" ubu_remote flatpak-install-ref "$PORT"
install_and_update "install from the bundle:" ubu_remote flatpak-install-bundle

# 4. The installed Flatpak itself: with a local feed announcing a newer release,
# the in-app banner must hand out the same command step 2 just proved works.
echo "in-app banner:"
appimage="$UBU_REPO_ROOT/dist/Arroxy-linux-arm64.AppImage"
if [[ -f $appimage ]]; then
	trap 'ubu_tunnel_close; ubu_remote stop >/dev/null || true' EXIT
	ubu_vm_stage_feed "$appimage" 9.9.9
	ubu_remote feed-start "$UBU_FEED_PORT"
	ubu_remote flatpak-launch "$UBU_CDP_PORT" "$UBU_FEED_PORT"
	ubu_tunnel_open
	command='flatpak update io.github.antonio_orionus.Arroxy'
	check "the banner offers \`$command\`" "$(ubu_cdp wait-text "$command" --timeout 60000 >/dev/null && echo 1)"
	ubu_remote stop
else
	echo "  skipped: no $appimage to announce as the newer release (bun run dist:linux:arm64)"
fi

if ((failures)); then
	echo "$failures check(s) failed"
	exit 1
fi
echo "all Flatpak repo checks passed"
