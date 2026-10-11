#!/usr/bin/env bash
# Manual control of Arroxy on the Ubuntu ARM64 test VM, for poking at a build
# by hand with the same plumbing ubu-update-test.sh uses.
#
#   scripts/vm/ubu-vm.sh launch <arm64.AppImage> [--wayland-debug]
#        stage, install and start it in the GNOME session; keeps the CDP tunnel
#        open until Ctrl-C. Also serves a feed announcing the build as 9.9.9, so
#        the update banner shows up; the app runs with a throwaway profile.
#   scripts/vm/ubu-vm.sh flatpak-launch [--wayland-debug]
#        start the Flatpak installed by ubu-flatpak-build.sh --install, same tunnel
#   scripts/vm/ubu-vm.sh buttons | screenshot <file.png>   inspect the running window
#   scripts/vm/ubu-vm.sh app-id     Wayland app_id of the last launch (needs --wayland-debug)
#   scripts/vm/ubu-vm.sh window-match   which launcher GNOME Shell matched each Arroxy window to
#   scripts/vm/ubu-vm.sh gnome-unsafe-mode   one-time VM setup that window-match needs (applies at next login)
#   scripts/vm/ubu-vm.sh stop | clean                     stop the app / remove everything staged
set -euo pipefail
# shellcheck source=scripts/vm/_ubu-vm.sh
source "$(dirname "$0")/_ubu-vm.sh"

hold_tunnel() {
	ubu_tunnel_open
	trap ubu_tunnel_close EXIT
	echo "running; CDP on 127.0.0.1:$UBU_CDP_PORT (try: scripts/vm/ubu-vm.sh buttons). Ctrl-C closes the tunnel."
	wait "$UBU_TUNNEL_PID"
}

debug_flag() {
	[[ ${1:-} == --wayland-debug ]] && echo wayland-debug || echo ''
}

command="${1:-}"
shift || true
case "$command" in
	launch)
		appimage="${1:?usage: ubu-vm.sh launch <arm64.AppImage> [--wayland-debug]}"
		debug="$(debug_flag "${2:-}")"
		ubu_vm_check
		ubu_vm_stage_feed "$appimage" 9.9.9
		ubu_remote feed-start "$UBU_FEED_PORT"
		ubu_remote install "$(basename "$appimage")"
		ubu_remote launch "$(basename "$appimage")" "$UBU_CDP_PORT" "$UBU_FEED_PORT" ${debug:+"$debug"}
		hold_tunnel
		;;
	flatpak-launch)
		debug="$(debug_flag "${1:-}")"
		ubu_vm_check
		ubu_remote flatpak-launch "$UBU_CDP_PORT" ${debug:+"$debug"}
		hold_tunnel
		;;
	buttons) ubu_cdp buttons ;;
	screenshot) ubu_cdp screenshot --out "${1:?usage: ubu-vm.sh screenshot <file.png>}" ;;
	app-id) ubu_remote app-id ;;
	window-match) ubu_remote window-match ;;
	gnome-unsafe-mode) ubu_remote gnome-unsafe-mode ;;
	stop) ubu_remote stop ;;
	clean) ubu_remote clean ;;
	*)
		echo "usage: scripts/vm/ubu-vm.sh <launch <AppImage>|flatpak-launch|buttons|screenshot <file>|app-id|window-match|gnome-unsafe-mode|stop|clean>" >&2
		exit 2
		;;
esac
