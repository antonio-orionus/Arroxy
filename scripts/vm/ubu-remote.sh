#!/usr/bin/env bash
# Runs ON the Ubuntu test VM. The Mac-side scripts ship this file over ssh and
# call one subcommand per step (see _ubu-vm.sh), so nothing here is quoted
# through an ssh command line. Everything it creates lives under ~/.arroxy-vm
# plus one .desktop file and, after a Flatpak build, a per-user Flatpak install;
# `clean` removes all of it. Nothing needs root: Flatpak work uses --user.
#
#   check                          guest is arm64 with a logged-in Wayland session
#   feed-start <port>              serve ~/.arroxy-vm/feed on 127.0.0.1:<port>
#   install <name>                 copy the feed AppImage to install/<name> + a .desktop entry
#   launch <name> <cdp> <feed> [wayland-debug]
#                                  start it in the desktop session with CDP and the local feed
#   flatpak-build [install]        build the staged Flatpak manifest into a bundle (and install it)
#   flatpak-launch <cdp> [feed-port] [wayland-debug]
#                                  start the installed Flatpak in the desktop session with CDP
#   app-id                         the Wayland app_id of the last launch (needs wayland-debug)
#   launcher <file> <wmclass|->    a hand-made launcher for the installed AppImage (cleared by reset/clean)
#   window-match                   which launcher GNOME Shell matched each Arroxy window to
#   launcher-class <desktop-id>    StartupWMClass in GNOME's app index vs on disk
#   gnome-unsafe-mode              one-time: make the next GNOME login run in unsafe mode (for window-match)
#   wait-relaunch <epoch> <id>     wait until install/ no longer holds file <id> (inode:birth)
#                                  and a live instance started at or after <epoch> runs
#   log-updater                    the updater's lines from the app log
#   state                          key=value report of install dir, .desktop and processes
#   stop                           stop every Arroxy started from install/, and the test Flatpak
#   reset                          stop and tidy up, keeping the staged AppImage and yt-dlp cache
#   clean                          stop, stop the feed, delete everything this script made
#                                  (including the installed test Flatpak, not the runtimes)
set -euo pipefail

BASE="$HOME/.arroxy-vm"
FEED="$BASE/feed"
INSTALL="$BASE/install"
DESKTOP="$HOME/.local/share/applications/arroxy-vm-test.desktop"
RUNTIME_DIR="/run/user/$(id -u)"
FLATPAK_ID=io.github.antonio_orionus.Arroxy

die() {
	echo "ubu-remote: $*" >&2
	exit 1
}

# retry <attempts> <command...> — reruns a command that failed, with a pause.
retry() {
	local attempts="$1" attempt=1
	shift
	until "$@"; do
		((attempt >= attempts)) && return 1
		echo "ubu-remote: attempt $attempt of $attempts failed: $1; retrying" >&2
		attempt=$((attempt + 1))
		sleep 5
	done
}

# AppImage runtime processes started from install/. Their /proc exe stays on the
# old file after an update replaces it, which shows up as "(deleted)".
runtime_pids() {
	pgrep -f "$INSTALL/" || true
}

# Live instances: runtimes whose AppImage still exists on disk.
live_pids() {
	local pid exe
	for pid in $(runtime_pids); do
		exe=$(readlink "/proc/$pid/exe" 2>/dev/null) || continue
		[[ $exe == *" (deleted)" ]] || echo "$pid"
	done
}

cmd_check() {
	[[ $(uname -m) == aarch64 ]] || die "expected an arm64 guest, got $(uname -m)"
	[[ -S $RUNTIME_DIR/wayland-0 ]] || die "no Wayland session at $RUNTIME_DIR/wayland-0 — log into GNOME on the VM first"
	command -v python3 >/dev/null || die "python3 is required for the local update feed"
	mkdir -p "$FEED" "$INSTALL"
	echo ok
}

cmd_feed_start() {
	local port="$1"
	cmd_feed_stop
	cd "$FEED"
	setsid python3 -m http.server "$port" --bind 127.0.0.1 </dev/null >"$BASE/feed.log" 2>&1 &
	echo $! >"$BASE/feed.pid"
	for _ in $(seq 1 20); do
		ss -ltnH | grep -q "127.0.0.1:$port " && return 0
		sleep 0.25
	done
	die "feed server did not start on port $port: $(cat "$BASE/feed.log")"
}

cmd_feed_stop() {
	if [[ -f $BASE/feed.pid ]]; then
		kill "$(cat "$BASE/feed.pid")" 2>/dev/null || true
		rm -f "$BASE/feed.pid"
	fi
}

cmd_install() {
	local name="$1"
	local source
	source=$(find "$FEED" -maxdepth 1 -name '*.AppImage' -print -quit)
	[[ -n $source ]] || die "no AppImage staged in $FEED"
	rm -rf "$INSTALL"
	# Fresh profile per case, but keep the managed yt-dlp: re-fetching it from
	# GitHub on every launch is slow and holds the window on the startup screen.
	mkdir -p "$INSTALL" "$BASE/userdata" "$(dirname "$DESKTOP")"
	find "$BASE/userdata" -mindepth 1 -maxdepth 1 ! -name runtime-cache -exec rm -rf {} +
	seed_profile "$BASE/userdata"
	cp "$source" "$INSTALL/$name"
	chmod +x "$INSTALL/$name"
	printf '[Desktop Entry]\nType=Application\nName=Arroxy (VM update test)\nExec=%s\n' "$INSTALL/$name" >"$DESKTOP"
}

# Over ssh none of the session variables are set, and Electron falls back to
# X11 and exits ("Missing X server or $DISPLAY") unless it is told it is in a
# Wayland session. These mirror what GNOME gives a normally launched app.
# A trailing "wayland-debug" argument on the launch commands also logs the
# Wayland protocol, which is how `app-id` reads the window's app_id.
export_session_env() {
	export XDG_RUNTIME_DIR="$RUNTIME_DIR" WAYLAND_DISPLAY=wayland-0 XDG_SESSION_TYPE=wayland XDG_CURRENT_DESKTOP=ubuntu:GNOME
	export DBUS_SESSION_BUS_ADDRESS="unix:path=$RUNTIME_DIR/bus" DISPLAY=:0
	XAUTHORITY=$(find "$RUNTIME_DIR" -maxdepth 1 -name '.mutter-Xwaylandauth.*' -print -quit)
	export XAUTHORITY
	if [[ ${1:-} == wayland-debug ]]; then export WAYLAND_DEBUG=client; fi
}

wait_for_cdp() {
	local cdp_port="$1"
	for _ in $(seq 1 240); do
		ss -ltnH | grep -q "127.0.0.1:$cdp_port " && return 0
		sleep 0.25
	done
	die "app did not open CDP port $cdp_port; last log lines: $(tail -5 "$BASE/app.log")"
}

# seed_profile <user-data-dir> — test launches start with the global hotkey,
# analytics and clipboard watching off. The hotkey goes through GNOME's
# GlobalShortcuts portal, which opens an "Add Keyboard Shortcuts" dialog on
# the user's screen for every unanswered launch; analytics would report VM test
# runs as real usage.
seed_profile() {
	mkdir -p "$1"
	printf '%s\n' '{"common": {"hotkeyEnabled": false, "analyticsEnabled": false, "clipboardWatchEnabled": false}}' >"$1/settings.json"
}

cmd_launch() {
	local name="$1" cdp_port="$2" feed_port="$3"
	export_session_env "${4:-}"
	ELECTRON_USER_DATA="$BASE/userdata" ARROXY_UPDATE_FEED_URL="http://127.0.0.1:$feed_port/" \
		setsid "$INSTALL/$name" --remote-debugging-port="$cdp_port" </dev/null >"$BASE/app.log" 2>&1 &
	wait_for_cdp "$cdp_port"
}

# The Wayland app_id the window announced, which desktops match against the
# .desktop file name (or its StartupWMClass) to group and label the window.
cmd_app_id() {
	grep -o 'xdg_toplevel#[0-9]*\.set_app_id("[^"]*")' "$BASE/app.log" | sed 's/.*set_app_id("\(.*\)")/\1/' | sort -u
}

# launcher <file-name> <StartupWMClass|-> — a hand-made launcher for the
# installed AppImage, like the ones users write. Recorded for `clean`.
cmd_launcher() {
	local file_name="$1" wm_class="$2" exe
	exe=$(find "$INSTALL" -maxdepth 1 -name '*.AppImage' -print -quit)
	[[ -n $exe ]] || die "nothing installed; run install first"
	mkdir -p "$(dirname "$DESKTOP")"
	{
		printf '[Desktop Entry]\nType=Application\nName=Arroxy (VM launcher test)\nExec=%s\n' "$exe"
		[[ $wm_class != - ]] && printf 'StartupWMClass=%s\n' "$wm_class"
	} >"$(dirname "$DESKTOP")/$file_name"
	echo "$file_name" >>"$BASE/launchers.list"
}

cmd_launchers_clear() {
	local file_name
	[[ -f $BASE/launchers.list ]] || return 0
	while read -r file_name; do rm -f "$(dirname "$DESKTOP")/$file_name"; done <"$BASE/launchers.list"
	rm -f "$BASE/launchers.list"
}

shell_eval() {
	export DBUS_SESSION_BUS_ADDRESS="unix:path=$RUNTIME_DIR/bus"
	gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell --method org.gnome.Shell.Eval "$1"
}

# GNOME Shell's own answer to "which launcher is this window", per open
# Arroxy window: `<app_id> -> <launcher id>`, or `-> window:N` when nothing
# matched (a generic icon and its own taskbar group). Needs gnome-unsafe-mode.
cmd_window_match() {
	local js reply
	# gdbus parses its argument as GVariant text, which turns a "\n" escape into
	# a raw line break inside the JS string; matches are joined with " | ".
	js='global.get_window_actors().map(a => a.meta_window).filter(w => (w.get_wm_class() || "").toLowerCase().includes("arroxy")).map(w => { const app = imports.gi.Shell.WindowTracker.get_default().get_window_app(w); return w.get_wm_class() + " -> " + (app ? app.get_id() : "none"); }).join(" | ")'
	reply=$(shell_eval "$js" 2>&1) || die "GNOME Shell refused Eval ($reply); run: scripts/vm/ubu-vm.sh gnome-unsafe-mode"
	[[ $reply == "(true, "* ]] || die "GNOME Shell Eval failed: $reply"
	# (true, '"a -> x | b -> y"') -> one match per line
	printf '%s' "$reply" | sed "s/^(true, '\"\(.*\)\"')$/\1/" | sed 's/ | /\n/g'
	echo
}

# launcher-class <desktop-id> — StartupWMClass as GNOME Shell's app index has
# it, then as the file on disk has it: `shell=<v> disk=<v>`, where <v> is the
# class, `none` (no such key) or `missing` (no such launcher). The index
# rebuilds about 5s after a file change, and keeps an app's old entry when only
# a symlink target changed (a Flatpak reinstall), so the two can disagree.
cmd_launcher_class() {
	local id="$1" reply shell_value disk_value='missing' file
	reply=$(shell_eval "const a = imports.gi.Shell.AppSystem.get_default().lookup_app(\"$id\"); a ? String(a.get_app_info().get_startup_wm_class()) : \"missing\"" 2>&1) || die "GNOME Shell refused Eval ($reply); run: scripts/vm/ubu-vm.sh gnome-unsafe-mode"
	shell_value=$(printf '%s' "$reply" | sed "s/^(true, '\"\(.*\)\"')$/\1/")
	[[ $shell_value == null ]] && shell_value=none
	for file in "$(dirname "$DESKTOP")/$id" "$HOME/.local/share/flatpak/exports/share/applications/$id"; do
		[[ -e $file ]] || continue
		disk_value=$(sed -n 's/^StartupWMClass=//p' "$file")
		disk_value=${disk_value:-none}
		break
	done
	echo "shell=$shell_value disk=$disk_value"
}

# One-time dev-VM setup: run the logged-in GNOME Shell with --unsafe-mode so
# Eval/Introspect answer over ssh (window-match needs it). Dev VM only — unsafe
# mode lets any local process script the shell. It takes effect at the next
# login. It deliberately does not log out: GDM's AutomaticLogin fires only when
# GDM starts, so a logout over ssh strands the VM on the greeter until someone
# logs in at the console or reboots it from Fusion.
cmd_gnome_unsafe_mode() {
	local unit dropin
	unit=$(systemctl --user list-units --no-legend --plain 'org.gnome.Shell@*.service' | awk '{print $1}' | head -1)
	[[ -n $unit ]] || die "no running org.gnome.Shell@*.service user unit"
	dropin="$HOME/.config/systemd/user/$unit.d/arroxy-unsafe-mode.conf"
	if [[ -f $dropin ]] && shell_eval 'global.context.unsafe_mode' 2>/dev/null | grep -q "'true'"; then
		echo "already in unsafe mode"
		return 0
	fi
	mkdir -p "$(dirname "$dropin")"
	printf '[Service]\nExecStart=\nExecStart=/usr/bin/gnome-shell --mode=%%i --unsafe-mode\n' >"$dropin"
	systemctl --user daemon-reload
	echo "drop-in written to $dropin"
	echo "takes effect at the next login: reboot the VM from Fusion (auto-login) or log out and back in at the console"
}

# Flatpak: build the staged manifest (see ubu-flatpak-build.sh) into a local
# repo, export a bundle, and optionally install it the way a user would.
cmd_flatpak_build() {
	local manifest="$BASE/flatpak-src/flatpak/$FLATPAK_ID.yml" install="${1:-}"
	[[ -f $manifest ]] || die "no staged manifest at $manifest"
	command -v flatpak-builder >/dev/null || die "flatpak-builder is not installed: sudo apt install flatpak flatpak-builder"
	# Fetches from Flathub fail intermittently from this guest with libcurl's
	# "[35] SSL connect error" while the same URL works on the next try, so the
	# network steps get a few attempts. A real failure still surfaces.
	retry 3 flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
	retry 3 flatpak-builder --user --install-deps-from=flathub --force-clean --disable-rofiles-fuse \
		--state-dir="$BASE/flatpak-state" --repo="$BASE/flatpak-repo" "$BASE/flatpak-build" "$manifest"
	flatpak build-bundle --runtime-repo=https://dl.flathub.org/repo/flathub.flatpakrepo "$BASE/flatpak-repo" "$BASE/Arroxy-linux-arm64.flatpak" "$FLATPAK_ID"
	echo "bundle: $BASE/Arroxy-linux-arm64.flatpak ($(du -h "$BASE/Arroxy-linux-arm64.flatpak" | cut -f1))"
	if [[ $install == install ]]; then
		# Not `install --reinstall`: that swaps the export symlink in place, and
		# a running GNOME Shell keeps the old launcher data until the next login.
		# Uninstalling first and waiting until GNOME drops the app gives it a
		# fresh entry on install.
		if flatpak info --user "$FLATPAK_ID" >/dev/null 2>&1; then
			flatpak uninstall --user --noninteractive -y "$FLATPAK_ID" >/dev/null
			wait_for_shell_app "$FLATPAK_ID.desktop" missing
		fi
		retry 3 flatpak install --user --noninteractive -y "$BASE/Arroxy-linux-arm64.flatpak"
		wait_for_shell_app "$FLATPAK_ID.desktop" present
		echo "installed: $(flatpak info --user "$FLATPAK_ID" | sed -n 's/^ *Version: //p')"
	fi
}

# wait_for_shell_app <desktop-id> <present|missing> — until GNOME Shell's app
# index (rebuilt ~5s after a change) agrees. Skipped when the shell is not in
# unsafe mode and cannot be asked; a fixed pause covers that case.
wait_for_shell_app() {
	local id="$1" want="$2" reply
	if ! shell_eval 'true' >/dev/null 2>&1 || [[ $(shell_eval 'true') != "(true, "* ]]; then
		sleep 8
		return 0
	fi
	for _ in $(seq 1 30); do
		reply=$(shell_eval "imports.gi.Shell.AppSystem.get_default().lookup_app(\"$id\") ? \"present\" : \"missing\"")
		[[ $reply == *"$want"* ]] && return 0
		sleep 1
	done
	echo "ubu-remote: GNOME did not see $id as $want within 30s" >&2
}

# Arroxy's Flatpak repo, end to end on the guest: scripts/flatpak/publish-repo.sh
# (staged to $BASE by ubu-flatpak-repo-test.sh) publishes the built repo,
# signed with a throwaway key, and the site is served on 127.0.0.1:<port>.
REPO_SITE="$BASE/flatpak-site"
REPO_GNUPG="$BASE/flatpak-gnupg"

repo_key() {
	if [[ ! -d $REPO_GNUPG ]]; then
		mkdir -p "$REPO_GNUPG" && chmod 700 "$REPO_GNUPG"
		gpg --batch --homedir "$REPO_GNUPG" --passphrase '' --quick-gen-key 'Arroxy VM test repo <vm-test@arroxy.invalid>' rsa4096 sign never 2>/dev/null
	fi
	gpg --homedir "$REPO_GNUPG" --list-secret-keys --with-colons | awk -F: '/^fpr/ {print $10; exit}'
}

repo_url() { echo "http://127.0.0.1:$1"; }

# flatpak-repo-publish <port> — sign, publish and serve the built repo, and
# write a bundle that carries the repo as its remote.
cmd_flatpak_repo_publish() {
	local port="$1" key
	key=$(repo_key)
	bash "$BASE/publish-repo.sh" --repo "$BASE/flatpak-repo" --site "$REPO_SITE" --url "$(repo_url "$port")" \
		--gpg-key "$key" --gpg-homedir "$REPO_GNUPG" --arch aarch64 --bundle "$BASE/Arroxy-repo.flatpak"
	if [[ -f $BASE/site.pid ]]; then kill "$(cat "$BASE/site.pid")" 2>/dev/null || true; fi
	# Started from this shell, not a ( … & ) subshell: a subshell would hold the
	# ssh session's stdout open until the server exits.
	setsid python3 -m http.server "$port" --bind 127.0.0.1 --directory "$REPO_SITE" </dev/null >"$BASE/site.log" 2>&1 &
	echo $! >"$BASE/site.pid"
	for _ in $(seq 1 20); do ss -ltnH | grep -q "127.0.0.1:$port " && return 0; sleep 0.25; done
	die "repo site did not start on port $port"
}

# flatpak-repo-bump <port> — a new signed commit of the app, republished: what a
# release looks like to an installed copy.
cmd_flatpak_repo_bump() {
	local port="$1" key
	key=$(repo_key)
	flatpak build-commit-from --force --gpg-sign="$key" --gpg-homedir="$REPO_GNUPG" --timestamp=NOW \
		--src-repo="$BASE/flatpak-repo" --subject="VM test bump" "$BASE/flatpak-repo" "app/$FLATPAK_ID/aarch64/master" >/dev/null
	bash "$BASE/publish-repo.sh" --repo "$BASE/flatpak-repo" --site "$REPO_SITE" --url "$(repo_url "$port")" \
		--gpg-key "$key" --gpg-homedir "$REPO_GNUPG" --arch aarch64 >/dev/null
	echo "published commit $(ostree --repo="$BASE/flatpak-repo" rev-parse "app/$FLATPAK_ID/aarch64/master")"
}

# flatpak-uninstall-all — the app, its data stays; plus any remote it came from.
cmd_flatpak_uninstall_all() {
	local remote
	if flatpak info --user "$FLATPAK_ID" >/dev/null 2>&1; then
		remote=$(flatpak info --user --show-origin "$FLATPAK_ID")
		flatpak uninstall --user --noninteractive -y "$FLATPAK_ID" >/dev/null
		[[ $remote != flathub ]] && flatpak remote-delete --user --force "$remote" 2>/dev/null || true
	fi
	flatpak remote-delete --user --force arroxy 2>/dev/null || true
}

# flatpak-install-ref <port> | flatpak-install-bundle — the two ways users install.
cmd_flatpak_install_ref() {
	retry 3 flatpak install --user --noninteractive -y "$(repo_url "$1")/$FLATPAK_ID.flatpakref"
}
cmd_flatpak_install_bundle() {
	retry 3 flatpak install --user --noninteractive -y "$BASE/Arroxy-repo.flatpak"
}

# flatpak-update — exactly the command the in-app banner hands out.
cmd_flatpak_update() {
	retry 3 flatpak update --noninteractive -y "$FLATPAK_ID"
}

# flatpak-origin — `remote=<name> url=<url> gpg=<verify|off> commit=<installed>`
cmd_flatpak_origin() {
	local remote url options
	flatpak info --user "$FLATPAK_ID" >/dev/null 2>&1 || { echo "not-installed"; return 0; }
	remote=$(flatpak info --user --show-origin "$FLATPAK_ID")
	url=$(flatpak remotes --user --columns=name,url | awk -v r="$remote" '$1 == r {print $2}')
	options=$(flatpak remotes --user --show-disabled --columns=name,options | awk -v r="$remote" '$1 == r {print $2}')
	[[ $options == *no-gpg-verify* ]] && gpg=off || gpg=verify
	echo "remote=$remote url=${url:-none} gpg=$gpg commit=$(flatpak info --user --show-commit "$FLATPAK_ID")"
}

# flatpak-launch <cdp> [feed-port] [wayland-debug] — `flatpak run` does not pass
# the caller's environment into the sandbox, so the local update feed is
# forwarded with --env.
cmd_flatpak_launch() {
	local cdp_port="$1" debug='' arg
	local run_args=()
	shift
	for arg in "$@"; do
		case "$arg" in
			wayland-debug) debug=wayland-debug ;;
			[0-9]*) run_args+=(--env=ARROXY_UPDATE_FEED_URL="http://127.0.0.1:$arg/") ;;
			*) die "flatpak-launch: unknown argument $arg" ;;
		esac
	done
	flatpak info --user "$FLATPAK_ID" >/dev/null 2>&1 || die "$FLATPAK_ID is not installed; run ubu-flatpak-build.sh --install"
	# A seeded test profile the sandbox can write (its ~/.var/app directory),
	# fresh per launch apart from the managed yt-dlp.
	local profile="$HOME/.var/app/$FLATPAK_ID/vm-test-userdata"
	mkdir -p "$profile"
	find "$profile" -mindepth 1 -maxdepth 1 ! -name runtime-cache -exec rm -rf {} +
	seed_profile "$profile"
	run_args+=(--env=ELECTRON_USER_DATA="$profile")
	export_session_env "$debug"
	setsid flatpak run "${run_args[@]}" "$FLATPAK_ID" --remote-debugging-port="$cdp_port" </dev/null >"$BASE/app.log" 2>&1 &
	wait_for_cdp "$cdp_port"
}

# True once install/ holds a file that is not the one identified by <id>
# (inode:birth — inode numbers alone get reused right after a delete).
install_changed() {
	local before="$1" file
	for file in "$INSTALL"/*; do
		[[ -e $file && $(stat -c %i:%W "$file") != "$before" ]] && return 0
	done
	return 1
}

cmd_wait_relaunch() {
	local since="$1" before_id="$2" pid started
	for _ in $(seq 1 240); do
		if install_changed "$before_id"; then
			for pid in $(live_pids); do
				started=$(($(date +%s) - $(ps -o etimes= -p "$pid")))
				((started >= since - 1)) && return 0
			done
		fi
		sleep 0.5
	done
	echo "no updated instance within 120s" >&2
	return 1
}

cmd_log_updater() {
	grep -E 'update|Update|nstall|shutting down|ERR_' "$BASE/app.log" | grep -v '^ *at ' | tail -15
}

cmd_state() {
	local file pid
	for file in "$INSTALL"/*; do
		[[ -e $file ]] && echo "file=$(basename "$file") id=$(stat -c %i:%W "$file")"
	done
	local exec_path
	exec_path=$(sed -n 's/^Exec=//p' "$DESKTOP" 2>/dev/null || true)
	echo "desktop_exec=$(basename "$exec_path")"
	[[ -e $exec_path ]] && echo "desktop_target=present" || echo "desktop_target=missing"
	for pid in $(live_pids); do echo "live=$(basename "$(readlink "/proc/$pid/exe")")"; done
	for pid in $(runtime_pids); do
		[[ $(readlink "/proc/$pid/exe" 2>/dev/null) == *" (deleted)" ]] && echo "lingering_old_runtime=$pid"
	done
	return 0
}

# The runtimes plus the Electron processes they mounted. The mount path names
# only the AppImage ("Arroxy"), so this also stops any other AppImage Arroxy on
# the guest — acceptable on a dedicated test VM.
app_pids() {
	runtime_pids
	pgrep -f '/tmp/[.]mount_Arroxy' || true
}

cmd_stop() {
	local pids
	if command -v flatpak >/dev/null && flatpak ps --columns=application 2>/dev/null | grep -qx "$FLATPAK_ID"; then
		flatpak kill "$FLATPAK_ID" || true
	fi
	pids=$(app_pids)
	[[ -z $pids ]] && return 0
	# shellcheck disable=SC2086 # word splitting is the point: one pid per word
	kill $pids 2>/dev/null || true
	for _ in $(seq 1 20); do
		[[ -z $(app_pids) ]] && return 0
		sleep 0.25
	done
	pids=$(app_pids)
	# shellcheck disable=SC2086
	[[ -n $pids ]] && kill -9 $pids 2>/dev/null || true
}

# Like clean, but keeps what is slow to recreate: the staged AppImage (rsync
# then skips the upload) and the managed yt-dlp in the profile.
cmd_reset() {
	cmd_stop
	cmd_feed_stop
	cmd_launchers_clear
	rm -rf "$INSTALL" "$DESKTOP" "$HOME/.cache/arroxy-updater" "$BASE"/*.log
	echo reset
}

cmd_clean() {
	cmd_stop
	cmd_feed_stop
	cmd_launchers_clear
	if [[ -f $BASE/site.pid ]]; then kill "$(cat "$BASE/site.pid")" 2>/dev/null || true; fi
	if [[ -d $REPO_GNUPG ]]; then gpgconf --homedir "$REPO_GNUPG" --kill gpg-agent 2>/dev/null || true; fi
	# The test Flatpak and its remote go too; the Flathub runtimes stay (large,
	# shared, and needed again by the next build).
	if command -v flatpak >/dev/null; then cmd_flatpak_uninstall_all; fi
	rm -rf "$BASE" "$DESKTOP" "$HOME/.cache/arroxy-updater"
	echo cleaned
}

command="${1:-}"
shift || true
case "$command" in
	check) cmd_check ;;
	feed-start) cmd_feed_start "$@" ;;
	install) cmd_install "$@" ;;
	launch) cmd_launch "$@" ;;
	flatpak-build) cmd_flatpak_build "$@" ;;
	flatpak-launch) cmd_flatpak_launch "$@" ;;
	flatpak-repo-publish) cmd_flatpak_repo_publish "$@" ;;
	flatpak-repo-bump) cmd_flatpak_repo_bump "$@" ;;
	flatpak-uninstall-all) cmd_flatpak_uninstall_all ;;
	flatpak-install-ref) cmd_flatpak_install_ref "$@" ;;
	flatpak-install-bundle) cmd_flatpak_install_bundle ;;
	flatpak-update) cmd_flatpak_update ;;
	flatpak-origin) cmd_flatpak_origin ;;
	app-id) cmd_app_id ;;
	launcher) cmd_launcher "$@" ;;
	window-match) cmd_window_match ;;
	launcher-class) cmd_launcher_class "$@" ;;
	gnome-unsafe-mode) cmd_gnome_unsafe_mode ;;
	wait-relaunch) cmd_wait_relaunch "$@" ;;
	log-updater) cmd_log_updater ;;
	state) cmd_state ;;
	stop) cmd_stop ;;
	reset) cmd_reset ;;
	clean) cmd_clean ;;
	*) die "unknown command '$command'" ;;
esac
