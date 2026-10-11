#!/usr/bin/env bash
# Asks GNOME Shell on the Ubuntu ARM64 test VM which launcher it ties an Arroxy
# window to — the icon, name and taskbar group a user sees — for the AppImage
# under several hand-made launchers, and for the installed Flatpak. Includes
# negative controls: launchers that must NOT match, so a check that matches
# everything cannot pass.
#
# The app is started over ssh, not from the launcher, so only class/file-name
# matching is exercised (a launch from the dock can also match through its
# activation token); that is the matching that survives relaunches, updates,
# and launchers written by hand or by AppImage integrators.
#
# Needs the VM's GNOME session in unsafe mode (scripts/vm/ubu-vm.sh
# gnome-unsafe-mode, once). The Flatpak case runs when a test Flatpak is
# installed (scripts/vm/ubu-flatpak-build.sh --install).
#
# Usage: scripts/vm/ubu-window-test.sh [--appimage <arm64.AppImage>]
set -euo pipefail
# shellcheck source=scripts/vm/_ubu-vm.sh
source "$(dirname "$0")/_ubu-vm.sh"

appimage="$UBU_REPO_ROOT/dist/Arroxy-linux-arm64.AppImage"
if [[ ${1:-} == --appimage ]]; then appimage="${2:?--appimage needs a file}"; fi
[[ -f $appimage ]] || {
	echo "no AppImage at $appimage — bun run dist:linux:arm64 first" >&2
	exit 1
}

ubu_vm_check
trap 'ubu_remote reset >/dev/null || true' EXIT

# window_match_after_launch <launch-subcommand...> — prints GNOME's match for
# the first Arroxy window, e.g. "arroxy -> my-arroxy.desktop".
window_match_after_launch() {
	"$@"
	local match=''
	for _ in $(seq 1 60); do
		match="$(ubu_remote window-match | head -1)"
		[[ -n $match ]] && break
		sleep 1
	done
	ubu_remote stop
	echo "$match"
}

failures=0
expect() {
	local label="$1" match="$2" want="$3"
	local got="${match##* -> }"
	[[ $want == unmatched && $got == window:* ]] && got=unmatched
	if [[ $got == "$want" ]]; then echo "  ok    $label: $match"; else
		echo "  FAIL  $label: expected $want, GNOME says '${match:-no window}'"
		failures=$((failures + 1))
	fi
}

ubu_remote window-match >/dev/null # fails fast with a hint when unsafe mode is off

# in_sync <launcher-class output> — GNOME's index agrees with the file on disk.
in_sync() {
	local shell_value="${1%% disk=*}" disk_value="${1#* disk=}"
	shell_value="${shell_value#shell=}"
	[[ $shell_value == "$disk_value" && $disk_value != missing ]]
}

# wait_until_indexed <desktop-id> — GNOME rebuilds its app index ~5s after a
# launcher changes; matching before that tests the old launchers.
wait_until_indexed() {
	local state=''
	for _ in $(seq 1 30); do
		state="$(ubu_remote launcher-class "$1")"
		in_sync "$state" && return 0
		sleep 1
	done
	echo "GNOME did not index $1 within 30s ($state)" >&2
	return 1
}

# wait_until_gone <desktop-id> — until GNOME's index no longer has the launcher.
wait_until_gone() {
	for _ in $(seq 1 30); do
		[[ $(ubu_remote launcher-class "$1") == shell=missing* ]] && return 0
		sleep 1
	done
	echo "GNOME still lists $1 30s after it was deleted" >&2
	return 1
}

flatpak_installed=0
if ssh -o BatchMode=yes "$UBU_VM_HOST" 'flatpak info --user io.github.antonio_orionus.Arroxy' >/dev/null 2>&1; then
	flatpak_installed=1
	# GNOME keeps an app's old launcher data when a reinstall only swaps the
	# Flatpak's symlinked export, so after a reinstall in a running session its
	# view can differ from the file. Results from a stale view are meaningless.
	state="$(ubu_remote launcher-class io.github.antonio_orionus.Arroxy.desktop)"
	if ! in_sync "$state"; then
		echo "GNOME's view of the Flatpak launcher is stale ($state) — it predates the last Flatpak reinstall." >&2
		echo "Reboot the VM from Fusion (auto-login), then rerun." >&2
		exit 1
	fi
fi

ubu_vm_stage_feed "$appimage" 9.9.9
name="$(basename "$appimage")"

# file name | StartupWMClass ("-" for none) | expected match | what it shows
# Every case uses its own file name: a running GNOME Shell never refreshes an
# entry whose file is rewritten under the same name.
cases=(
	"my-arroxy.desktop|arroxy|my-arroxy.desktop|any launcher name works through StartupWMClass=arroxy"
	"my-arroxy-oldclass.desktop|Arroxy|unmatched|the pre-fix AppImage class 'Arroxy' does not match (control)"
	"my-arroxy-noclass.desktop|-|unmatched|a launcher with no class and another name does not match (control)"
	"arroxy.desktop|-|arroxy.desktop|a launcher named arroxy.desktop matches by name"
)
echo "AppImage ($name) under hand-made launchers:"
previous=''
for spec in "${cases[@]}"; do
	IFS='|' read -r file_name wm_class want label <<<"$spec"
	ubu_remote reset >/dev/null
	# A deleted launcher stays in GNOME's index for a few seconds and could
	# still claim this case's window.
	if [[ -n $previous ]]; then wait_until_gone "$previous"; fi
	ubu_remote install "$name"
	ubu_remote launcher "$file_name" "$wm_class"
	wait_until_indexed "$file_name"
	expect "$label" "$(window_match_after_launch ubu_remote launch "$name" "$UBU_CDP_PORT" "$UBU_FEED_PORT")" "$want"
	previous="$file_name"
done

if ((flatpak_installed)); then
	echo "Flatpak:"
	ubu_remote reset >/dev/null
	expect "the Flatpak window belongs to the Flatpak's own launcher" "$(window_match_after_launch ubu_remote flatpak-launch "$UBU_CDP_PORT")" io.github.antonio_orionus.Arroxy.desktop
else
	echo "Flatpak: skipped (no test Flatpak installed; scripts/vm/ubu-flatpak-build.sh --install)"
fi

if ((failures)); then
	echo "$failures check(s) failed"
	exit 1
fi
echo "all window identity checks passed"
