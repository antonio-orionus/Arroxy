#!/usr/bin/env bash
# Shared helpers for the Ubuntu ARM64 test VM scripts. Sourced, not executed.
#
# The VM is reached through an SSH alias (default `ubu-vm`) with key auth, so
# host, user and key live in ~/.ssh/config and never in this repository.
# Guest-side work is done by ubu-remote.sh, shipped over ssh on every call.
#
#   ARROXY_UBU_VM          ssh alias                    (default ubu-vm)
#   ARROXY_UBU_CDP_PORT    CDP port, same on both ends  (default 9339)
#   ARROXY_UBU_FEED_PORT   local update feed port       (default 8765)

UBU_VM_HOST="${ARROXY_UBU_VM:-ubu-vm}"
UBU_CDP_PORT="${ARROXY_UBU_CDP_PORT:-9339}"
# shellcheck disable=SC2034 # read by the scripts that source this file
UBU_FEED_PORT="${ARROXY_UBU_FEED_PORT:-8765}"
UBU_VM_SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UBU_REPO_ROOT="$(cd "$UBU_VM_SCRIPTS/../.." && pwd)"
UBU_TUNNEL_PID=''

# ubu_remote <command> [args...] — runs a ubu-remote.sh subcommand on the guest.
ubu_remote() {
	local quoted=''
	local arg
	for arg in "$@"; do quoted+=" $(printf '%q' "$arg")"; done
	# shellcheck disable=SC2029 # expanding locally is intended: the args are pre-quoted
	ssh -o BatchMode=yes "$UBU_VM_HOST" "bash -s --$quoted" <"$UBU_VM_SCRIPTS/ubu-remote.sh"
}

ubu_vm_check() {
	if ! ssh -o BatchMode=yes -o ConnectTimeout=10 "$UBU_VM_HOST" 'echo ok' >/dev/null 2>&1; then
		echo "cannot reach '$UBU_VM_HOST' with key auth — is the VM booted in Fusion and the SSH alias configured?" >&2
		exit 1
	fi
	ubu_remote check >/dev/null
}

# ubu_update_channel <app-version> — the feed channel a build with that version
# reads; mirrors resolveUpdateChannel in registerUpdaterHandlers.ts.
ubu_update_channel() {
	local tag
	tag="$(echo "$1" | sed -n 's/^[^-]*-\([A-Za-z]*\).*/\1/p' | tr '[:upper:]' '[:lower:]')"
	case "$tag" in
		alpha | beta | rc) echo "$tag" ;;
		*) echo latest ;;
	esac
}

# ubu_vm_stage_feed <appimage> <version> — uploads the AppImage plus an
# electron-updater feed file announcing it as <version>. Reusing the build
# under a higher version means one build is enough to test an update. The feed
# file is named for the channel of the version in package.json, which is the
# one the build will ask for.
ubu_vm_stage_feed() {
	local appimage="$1" version="$2"
	local name sha512 size stage channel
	channel="$(ubu_update_channel "$(node -p "require('$UBU_REPO_ROOT/package.json').version")")"
	name="$(basename "$appimage")"
	sha512="$(openssl dgst -sha512 -binary "$appimage" | base64 | tr -d '\n')"
	size="$(wc -c <"$appimage" | tr -d ' ')"
	stage="$(mktemp -d)"
	cat >"$stage/$channel-linux-arm64.yml" <<EOF
version: $version
files:
  - url: $name
    sha512: $sha512
    size: $size
path: $name
sha512: $sha512
releaseDate: '$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'
EOF
	ssh -o BatchMode=yes "$UBU_VM_HOST" 'mkdir -p .arroxy-vm/feed'
	rsync -a --delete "$appimage" "$stage/$channel-linux-arm64.yml" "$UBU_VM_HOST:.arroxy-vm/feed/"
	rm -rf "$stage"
}

# Forwards the CDP port to this machine. A dedicated connection (no
# ControlMaster) so killing it cannot take a shared multiplexed session down.
ubu_tunnel_open() {
	ssh -N -o BatchMode=yes -o ControlPath=none -o ExitOnForwardFailure=yes -L "$UBU_CDP_PORT:127.0.0.1:$UBU_CDP_PORT" "$UBU_VM_HOST" &
	UBU_TUNNEL_PID=$!
	sleep 1
	kill -0 "$UBU_TUNNEL_PID" 2>/dev/null || {
		echo "could not forward local port $UBU_CDP_PORT — is something else listening on it? (set ARROXY_UBU_CDP_PORT)" >&2
		exit 1
	}
}

ubu_tunnel_close() {
	[[ -n $UBU_TUNNEL_PID ]] && kill "$UBU_TUNNEL_PID" 2>/dev/null || true
	UBU_TUNNEL_PID=''
}

# ubu_cdp <command> [args...] — runs scripts/vm/cdp.ts against the forwarded port.
ubu_cdp() {
	(cd "$UBU_REPO_ROOT" && bun scripts/vm/cdp.ts "$@" --port "$UBU_CDP_PORT")
}
