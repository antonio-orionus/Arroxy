#!/usr/bin/env bash
# Shared helpers for the Windows test VM scripts. Sourced, not executed.
#
# The VM is reached through an SSH alias (default `win-vm`), so host, user and
# key live in ~/.ssh/config and never in this repository. Override the alias
# with ARROXY_WIN_VM and the checkout location with ARROXY_WIN_VM_DIR.

WIN_VM_HOST="${ARROXY_WIN_VM:-win-vm}"
WIN_VM_DIR="${ARROXY_WIN_VM_DIR:-C:\\Arroxy}"
# Relative to the remote user's home; OpenSSH on Windows starts there.
WIN_VM_STAGE='.arroxy-vm'
WIN_VM_SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

win_vm_check() {
	if ! ssh -o BatchMode=yes "$WIN_VM_HOST" "echo ok" >/dev/null 2>&1; then
		echo "cannot reach '$WIN_VM_HOST' with key auth — is the VM booted in Fusion and the SSH alias configured?" >&2
		exit 1
	fi
	ssh "$WIN_VM_HOST" "if not exist $WIN_VM_STAGE mkdir $WIN_VM_STAGE" >/dev/null
}

# win_vm_copy <local-file>... — copies files into the remote staging directory.
win_vm_copy() {
	scp -q "$@" "$WIN_VM_HOST:$WIN_VM_STAGE/"
}

# win_vm_quote [args...] — double-quotes each argument for the remote cmd.exe
# command line, so values such as URLs with `&` survive intact.
win_vm_quote() {
	local arg
	for arg in "$@"; do printf ' "%s"' "$arg"; done
}

# win_vm_run_ps <remote-script.ps1> [args...] — runs an already staged script.
# Inline PowerShell over ssh breaks on `$` quoting, so it always goes via -File.
win_vm_run_ps() {
	local script="$1"
	shift
	ssh "$WIN_VM_HOST" "powershell -NoProfile -ExecutionPolicy Bypass -File $WIN_VM_STAGE\\$script$(win_vm_quote "$@")"
}

# win_vm_ps <script.ps1> [args...] — ships a script from scripts/vm and runs it.
win_vm_ps() {
	local script="$1"
	shift
	win_vm_copy "$WIN_VM_SCRIPTS/$script"
	win_vm_run_ps "$script" "$@"
}
