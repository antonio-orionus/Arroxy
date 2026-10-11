#!/usr/bin/env bash
# End-to-end check of the AppImage in-app update on the Ubuntu ARM64 test VM:
# install an arm64 AppImage under a given filename, let it find an update on a
# local feed, click Install & Restart through CDP, and verify what is on disk
# and running afterwards. One build serves as both the old and the new version:
# the feed re-announces the same file as 9.9.9.
#
# Cases (filename the user saved the AppImage as -> expected outcome):
#   published name           replaced in place, .desktop keeps working
#   custom name, no version  replaced in place, .desktop keeps working
#   name with a version      saved under the published name, old file removed,
#                            .desktop goes stale (electron-updater behaviour)
#
# Needs a logged-in GNOME session on the VM. Build first with --build, or pass
# --appimage to test an existing arm64 AppImage that honours ARROXY_UPDATE_FEED_URL.
#
# Usage: scripts/vm/ubu-update-test.sh [--build] [--appimage <file>] [--case <filename>]... [--keep]
set -euo pipefail
# shellcheck source=scripts/vm/_ubu-vm.sh
source "$(dirname "$0")/_ubu-vm.sh"

build=0
keep=0
appimage="$UBU_REPO_ROOT/dist/Arroxy-linux-arm64.AppImage"
cases=()
while (($#)); do
	case "$1" in
		--build) build=1 ;;
		--keep) keep=1 ;;
		--appimage)
			appimage="$2"
			shift
			;;
		--case)
			cases+=("$2")
			shift
			;;
		*)
			echo "unknown option: $1" >&2
			exit 2
			;;
	esac
	shift
done

version="$(node -p "require('$UBU_REPO_ROOT/package.json').version")"
((${#cases[@]})) || cases=("$(basename "$appimage")" 'arroxy.AppImage' "Arroxy-$version.AppImage")

ubu_vm_check
if ((build)); then (cd "$UBU_REPO_ROOT" && bun run dist:linux:arm64); fi
[[ -f $appimage ]] || {
	echo "no AppImage at $appimage — run with --build or pass --appimage" >&2
	exit 1
}
published="$(basename "$appimage")"

cleanup() {
	ubu_tunnel_close
	# --keep leaves the last case running for inspection. Otherwise reset, not
	# clean: the next run reuses the staged AppImage and the yt-dlp cache.
	# scripts/vm/ubu-vm.sh clean removes everything.
	((keep)) || ubu_remote reset >/dev/null || true
}
trap cleanup EXIT

echo "staging $published as 9.9.9 on $UBU_VM_HOST"
ubu_vm_stage_feed "$appimage" 9.9.9
ubu_remote feed-start "$UBU_FEED_PORT"
ubu_tunnel_open

failures=0
check() {
	local label="$1" ok="$2"
	if [[ $ok == 1 ]]; then echo "  ok    $label"; else
		echo "  FAIL  $label"
		failures=$((failures + 1))
	fi
}

for name in "${cases[@]}"; do
	echo "case: saved as $name"
	ubu_remote stop
	ubu_remote install "$name"
	id_before="$(ubu_remote state | sed -n "s/^file=$name id=//p")"
	ubu_remote launch "$name" "$UBU_CDP_PORT" "$UBU_FEED_PORT"
	since="$(ssh -o BatchMode=yes "$UBU_VM_HOST" 'date +%s')"
	failures_before=$failures
	# Failures are recorded, not fatal: the remaining cases, the state and the
	# updater log below still report.
	if ! ubu_cdp click-update --timeout 60000; then
		check "update banner appeared and Install & Restart was clicked" 0
	elif ! ubu_remote wait-relaunch "$since" "$id_before"; then
		check "update installed and app relaunched" 0
	fi
	state="$(ubu_remote state)"
	printf '        %s\n' "$state"

	# electron-updater keeps a custom filename unless it contains x.y.z, in
	# which case the update lands under the published name instead.
	if [[ $name == "$published" || ! $name =~ [0-9]+\.[0-9]+\.[0-9]+ ]]; then expected="$name"; else expected="$published"; fi
	files="$(echo "$state" | grep -c '^file=' || true)"
	final_id="$(echo "$state" | sed -n "s/^file=$expected id=//p")"
	live="$(echo "$state" | sed -n 's/^live=//p')"

	check "exactly one AppImage in the folder (found $files)" "$([[ $files == 1 ]] && echo 1)"
	check "it is named $expected" "$([[ -n $final_id ]] && echo 1)"
	check "the file was replaced (inode:birth $id_before -> ${final_id:-none})" "$([[ -n $final_id && $final_id != "$id_before" ]] && echo 1)"
	check "exactly one live instance, running $expected" "$([[ $live == "$expected" ]] && echo 1)"
	if [[ $expected == "$name" ]]; then
		check ".desktop entry still points at an existing file" "$(echo "$state" | grep -q '^desktop_target=present' && echo 1)"
	else
		check ".desktop entry is stale, as documented for versioned names" "$(echo "$state" | grep -q '^desktop_target=missing' && echo 1)"
	fi
	if ((failures > failures_before)); then
		echo "  updater log:"
		ubu_remote log-updater | sed 's/^/        /'
	fi
done

if ((failures)); then
	echo "$failures check(s) failed"
	exit 1
fi
echo "all update checks passed"
