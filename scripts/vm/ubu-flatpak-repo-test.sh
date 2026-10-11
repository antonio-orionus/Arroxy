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
	# A failed install is a failed check, not the end of the run: the other
	# install path and the summary still report.
	if ! "$@" >/dev/null; then
		check "install succeeded" 0
		return 0
	fi
	state="$(ubu_remote flatpak-origin)"
	echo "        installed: $state"
	check "installed with Arroxy's repo as its origin" "$([[ $(field url "$state") == "$URL" ]] && echo 1)"
	check "updates are GPG-verified" "$([[ $(field gpg "$state") == verify ]] && echo 1)"
	check "every ref is signed (the .Debug extension installs from the verified remote)" "$(ubu_remote flatpak-install-debug >/dev/null 2>&1 && echo 1)"
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

# 4. The one-line install: scripts/install.sh --flatpak, piped into the guest's
# sh (dash) exactly like `curl … | sh -s -- --flatpak`, against the local repo.
REF="http://127.0.0.1:$PORT/io.github.antonio_orionus.Arroxy.flatpakref"
# install_script [args...] — runs the script; retries only on the guest's
# known flaky Flathub TLS, so a real failure still fails.
install_script() {
	local out
	for _ in 1 2 3; do
		out="$(ssh -o BatchMode=yes "$UBU_VM_HOST" "ARROXY_FLATPAKREF=${SCRIPT_REF:-$REF} sh -s -- $*" <"$UBU_REPO_ROOT/scripts/install.sh" 2>&1)" && {
			printf '%s\n' "$out"
			return 0
		}
		grep -q 'SSL connect error' <<<"$out" || break
	done
	printf '%s\n' "$out"
	return 1
}
script_case() {
	local label="$1" expect="$2" out state
	shift 2
	echo "install script: $label"
	if out="$(install_script --flatpak)"; then
		state="$(ubu_remote flatpak-origin)"
		check "it says: $expect" "$(grep -qF "$expect" <<<"$out" && echo 1)"
		check "installed from Arroxy's repo, GPG-verified" "$([[ $(field url "$state") == "$URL" && $(field gpg "$state") == verify ]] && echo 1)"
		check "exactly one copy" "$([[ $(ubu_remote flatpak-copies) == 1 ]] && echo 1)"
	else
		printf '%s\n' "$out" | tail -3 | sed 's/^/        /'
		check "the script succeeded" 0
	fi
}

ubu_remote flatpak-uninstall-all
script_case "fresh install" "Installing Arroxy from its Flatpak repo"
script_case "run again" "already installed from its Flatpak repo; updating"
ubu_remote flatpak-uninstall-all
ubu_remote flatpak-install-old-bundle
# An old copy whose move fails (repo unreachable) must still be installed:
# the script never removes it first.
echo "install script: old .flatpak copy, repo unreachable"
before="$(ubu_remote flatpak-origin)"
out="$(SCRIPT_REF="http://127.0.0.1:1/io.github.antonio_orionus.Arroxy.flatpakref" install_script --flatpak || true)"
after="$(ubu_remote flatpak-origin)"
check "the script reports the failure" "$(grep -q 'untouched\|still works' <<<"$out" && echo 1)"
check "the old copy is still installed, unchanged ($(field remote "$after"), commit ${before##*commit=})" "$([[ $after == "$before" ]] && echo 1)"
script_case "over a copy from an old .flatpak" "Moving the copy from an older .flatpak onto Arroxy's Flatpak repo"
check "the old copy's settings survived" "$([[ $(ubu_remote flatpak-marker) == kept ]] && echo 1)"
ubu_remote flatpak-repo-bump "$PORT" >/dev/null
updated_before="$(field commit "$(ubu_remote flatpak-origin)")"
ubu_remote flatpak-update >/dev/null
check "the moved copy updates with flatpak update" "$([[ $(field commit "$(ubu_remote flatpak-origin)") != "$updated_before" ]] && echo 1)"
echo "install script: refusals"
out="$(ssh -o BatchMode=yes "$UBU_VM_HOST" "sh -s -- --flatpak" <"$UBU_REPO_ROOT/scripts/install.sh" 2>&1 || true)"
check "x86_64-only on this arm64 guest without the test repo" "$(grep -q 'x86_64 Linux builds only' <<<"$out" && echo 1)"
out="$(ssh -o BatchMode=yes "$UBU_VM_HOST" "sh -s -- --bogus" <"$UBU_REPO_ROOT/scripts/install.sh" 2>&1 || true)"
check "an unknown option is refused" "$(grep -q 'Unknown option: --bogus' <<<"$out" && echo 1)"

# 5. The installed Flatpak itself: with a local feed announcing a newer release,
# the in-app banner must hand out the same command step 2 just proved works.
echo "in-app banner:"
appimage="$UBU_REPO_ROOT/dist/Arroxy-linux-arm64.AppImage"
if [[ -f $appimage ]]; then
	trap 'ubu_tunnel_close; ubu_remote stop >/dev/null || true' EXIT
	ubu_vm_stage_feed "$appimage" 9.9.9
	ubu_remote feed-start "$UBU_FEED_PORT"
	command='flatpak update io.github.antonio_orionus.Arroxy'
	if ubu_remote flatpak-launch "$UBU_CDP_PORT" "$UBU_FEED_PORT"; then
		ubu_tunnel_open
		check "the banner offers \`$command\`" "$(ubu_cdp wait-text "$command" --timeout 60000 >/dev/null && echo 1)"
	else
		check "the installed Flatpak launches" 0
	fi
	ubu_remote stop || true
else
	echo "  skipped: no $appimage to announce as the newer release (bun run dist:linux:arm64)"
fi

if ((failures)); then
	echo "$failures check(s) failed"
	exit 1
fi
echo "all Flatpak repo checks passed"
