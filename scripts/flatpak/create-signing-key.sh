#!/usr/bin/env bash
# One-time setup of the key that signs Arroxy's Flatpak repo. Run it yourself,
# once: the private key goes straight from a throwaway GnuPG home into the
# FLATPAK_GPG_PRIVATE_KEY repo secret and a backup file you keep — nothing else
# sees it. The public key is written to flatpak/repo-signing-key.asc; commit it,
# because the release workflow refuses to sign with any other key.
#
# Never replace the key casually: installed copies trust the key they were
# installed with and reject updates signed by another. Rotating means every
# user reinstalls. --force exists for that deliberate case only.
#
# Needs gpg (brew install gnupg) and gh logged in as a repo admin.
#
# Usage: scripts/flatpak/create-signing-key.sh [--backup FILE] [--force]
set -euo pipefail

REPO=antonio-orionus/Arroxy
SECRET=FLATPAK_GPG_PRIVATE_KEY
root="$(cd "$(dirname "$0")/../.." && pwd)"
public="$root/flatpak/repo-signing-key.asc"
backup="$HOME/arroxy-flatpak-signing-key.asc"
force=0
while (($#)); do
	case "$1" in
		--backup) backup="$2"; shift ;;
		--force) force=1 ;;
		*) echo "unknown option: $1" >&2; exit 2 ;;
	esac
	shift
done

command -v gpg >/dev/null || { echo "gpg is required: brew install gnupg" >&2; exit 1; }
command -v gh >/dev/null || { echo "gh is required" >&2; exit 1; }
# Fail closed: a key that already exists anywhere — the secret or the committed
# public half — must not be replaced by accident, and an unreadable secret list
# is not proof that there is no secret.
if ((!force)); then
	if [[ -e $public ]]; then
		echo "$public already exists, so a signing key was created before. Replacing it breaks updates for every installed Flatpak; pass --force only if that is intended." >&2
		exit 1
	fi
	if ! secrets="$(gh secret list --repo "$REPO")"; then
		echo "could not list the secrets of $REPO, so cannot rule out an existing $SECRET; check gh auth and retry" >&2
		exit 1
	fi
	if awk '{print $1}' <<<"$secrets" | grep -qx "$SECRET"; then
		echo "$SECRET already exists in $REPO. Replacing it breaks updates for every installed Flatpak; pass --force only if that is intended." >&2
		exit 1
	fi
fi
[[ -e $backup ]] && { echo "$backup already exists; choose another --backup path" >&2; exit 1; }

gnupghome="$(mktemp -d)"
cleanup() {
	gpgconf --homedir "$gnupghome" --kill gpg-agent 2>/dev/null || true
	rm -rf "$gnupghome"
}
trap cleanup EXIT

# RSA 4096: verified by every Flatpak/OSTree release still in use, including
# old LTS distributions. No passphrase: CI signs unattended; the secret store
# and the backup file are what protect it.
gpg --homedir "$gnupghome" --batch --pinentry-mode loopback --passphrase '' \
	--quick-gen-key 'Arroxy Flatpak repository' rsa4096 sign never 2>/dev/null
fpr="$(gpg --homedir "$gnupghome" --list-secret-keys --with-colons | awk -F: '/^fpr/ {print $10; exit}')"

(umask 077 && gpg --homedir "$gnupghome" --armor --export-secret-keys "$fpr" >"$backup")
gpg --homedir "$gnupghome" --armor --export-secret-keys "$fpr" | gh secret set "$SECRET" --repo "$REPO"
gpg --homedir "$gnupghome" --armor --export "$fpr" >"$public"

echo "fingerprint: $fpr"
echo "secret:      $SECRET set on $REPO"
echo "backup:      $backup (private key — move it into your password manager, then delete the file)"
echo "public key:  $public (commit this)"
